import { useEffect, useRef, useState } from "react";
import { createFile, DataStream } from "mp4box";

const LERP_TAU = 8;
const SNAP = 0.002;
const LRU_MAX = 24;
const LEAD = 24;
const WATCHDOG = 60_000;

type BankFrame = {
  ts: number;
  blob: Blob;
};

type Sample = {
  cts: number;
  dts: number;
  duration: number;
  timescale: number;
  is_sync: boolean;
  data: Uint8Array;
};

type Track = {
  id: number;
  codec: string;
  video: { width: number; height: number };
};

type DecoderPreference = "prefer-hardware" | "prefer-software";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function nearestIndex(bank: BankFrame[], timestamp: number) {
  if (bank.length < 2) return 0;

  let low = 0;
  let high = bank.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (bank[mid].ts < timestamp) low = mid + 1;
    else high = mid;
  }

  if (low === 0) return 0;
  const before = bank[low - 1];
  const after = bank[low];
  return timestamp - before.ts <= after.ts - timestamp ? low - 1 : low;
}

function decoderDescription(file: any, trackId: number) {
  const track = file.getTrackById(trackId);
  const entry = track?.mdia?.minf?.stbl?.stsd?.entries?.[0];
  const box = entry?.avcC ?? entry?.hvcC ?? entry?.vpcC ?? entry?.av1C;
  if (!box) return undefined;

  const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
  box.write(stream);
  return new Uint8Array(stream.buffer, 8);
}

async function frameBlob(frame: VideoFrame) {
  const width = frame.displayWidth || frame.codedWidth;
  const height = frame.displayHeight || frame.codedHeight;

  if (typeof OffscreenCanvas !== "undefined") {
    const surface = new OffscreenCanvas(width, height);
    const context = surface.getContext("2d");
    if (!context) throw new Error("Canvas 2D context unavailable");
    context.drawImage(frame, 0, 0, width, height);
    return surface.convertToBlob({ type: "image/webp", quality: 0.82 });
  }

  const surface = document.createElement("canvas");
  surface.width = width;
  surface.height = height;
  const context = surface.getContext("2d");
  if (!context) throw new Error("Canvas 2D context unavailable");
  context.drawImage(frame, 0, 0, width, height);
  return new Promise<Blob>((resolve, reject) => {
    surface.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Frame encoding failed"))),
      "image/webp",
      0.82,
    );
  });
}

async function decodeBank(
  source: ArrayBuffer,
  preference: DecoderPreference,
  cancelled: () => boolean,
) {
  return new Promise<BankFrame[]>((resolve, reject) => {
    const file = createFile();
    const bank: BankFrame[] = [];
    const samples: Sample[] = [];
    const encodes = new Set<Promise<void>>();
    let decoder: VideoDecoder | null = null;
    let processing = false;
    let settled = false;

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      decoder?.close();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const processSamples = async () => {
      if (processing || !decoder) return;
      processing = true;

      try {
        while (samples.length && !cancelled()) {
          while (decoder.decodeQueueSize + encodes.size >= LEAD && !cancelled()) {
            await new Promise((next) => window.setTimeout(next, 0));
          }

          const sample = samples.shift()!;
          decoder.decode(
            new EncodedVideoChunk({
              type: sample.is_sync ? "key" : "delta",
              timestamp: Math.round((sample.cts * 1_000_000) / sample.timescale),
              duration: Math.round((sample.duration * 1_000_000) / sample.timescale),
              data: sample.data,
            }),
          );
        }

        if (!cancelled() && decoder) {
          await decoder.flush();
          await Promise.all(encodes);
          bank.sort((a, b) => a.ts - b.ts);
          if (!settled) {
            settled = true;
            decoder.close();
            resolve(bank);
          }
        }
      } catch (error) {
        fail(error);
      } finally {
        processing = false;
      }
    };

    file.onError = fail;
    file.onReady = (info: { tracks: Track[] }) => {
      if (cancelled()) return;
      const track = info.tracks.find((candidate) => candidate.video);
      if (!track) {
        fail(new Error("No video track found"));
        return;
      }

      try {
        decoder = new VideoDecoder({
          output: (frame) => {
            const timestamp = frame.timestamp;
            const encode = frameBlob(frame)
              .then((blob) => {
                if (!cancelled()) bank.push({ ts: timestamp, blob });
              })
              .finally(() => {
                frame.close();
                encodes.delete(encode);
              });
            encodes.add(encode);
          },
          error: fail,
        });

        decoder.configure({
          codec: track.codec,
          codedWidth: track.video.width,
          codedHeight: track.video.height,
          description: decoderDescription(file, track.id),
          hardwareAcceleration: preference,
          optimizeForLatency: true,
        });

        file.setExtractionOptions(track.id, null, { nbSamples: 1_000 });
        file.onSamples = (_id: number, _user: unknown, incoming: Sample[]) => {
          samples.push(...incoming);
          void processSamples();
        };
        file.start();
      } catch (error) {
        fail(error);
      }
    };

    try {
      const buffer = source.slice(0) as ArrayBuffer & { fileStart: number };
      buffer.fileStart = 0;
      file.appendBuffer(buffer);
      file.flush();
    } catch (error) {
      fail(error);
    }
  });
}

export function useVideoScrub(videoSrc: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bankRef = useRef<BankFrame[]>([]);
  const lruRef = useRef(new Map<number, ImageBitmap | null>());
  const durationRef = useRef(0);
  const currentRef = useRef(0);
  const targetRef = useRef(0);
  const readyRef = useRef(false);
  const revertedRef = useRef(false);
  const paintedRef = useRef(false);
  const buildingRef = useRef(false);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => {
      if (Number.isFinite(video.duration)) durationRef.current = video.duration;
    };

    video.addEventListener("loadedmetadata", updateDuration);
    updateDuration();
    return () => video.removeEventListener("loadedmetadata", updateDuration);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let animationFrame = 0;
    let watchdog = 0;
    let lastTime = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const clearLru = () => {
      lruRef.current.forEach((bitmap) => bitmap?.close());
      lruRef.current.clear();
    };

    const evict = () => {
      while (lruRef.current.size > LRU_MAX) {
        const oldest = lruRef.current.keys().next().value as number | undefined;
        if (oldest === undefined) break;
        lruRef.current.get(oldest)?.close();
        lruRef.current.delete(oldest);
      }
    };

    const warmLru = (center: number) => {
      const bank = bankRef.current;
      [center - 1, center, center + 1, center + 2].forEach((index) => {
        if (index < 0 || index >= bank.length || lruRef.current.has(index)) return;
        lruRef.current.set(index, null);
        void createImageBitmap(bank[index].blob)
          .then((bitmap) => {
            if (cancelled || revertedRef.current) {
              bitmap.close();
              return;
            }
            lruRef.current.delete(index);
            lruRef.current.set(index, bitmap);
            evict();
          })
          .catch(() => lruRef.current.delete(index));
      });
    };

    const paint = (time: number) => {
      const canvas = canvasRef.current;
      const bank = bankRef.current;
      if (!canvas || !bank.length) return;

      const index = nearestIndex(bank, time * 1_000_000);
      warmLru(index);
      const bitmap = lruRef.current.get(index);
      if (!bitmap) return;

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      if (!paintedRef.current) {
        paintedRef.current = true;
        setCanvasLive(true);
        window.clearTimeout(watchdog);
      }
    };

    const getProgress = () => {
      const container = containerRef.current;
      if (!container) return 0;
      const span = Math.max(1, container.offsetHeight - window.innerHeight);
      return clamp(window.scrollY / span);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1_000);
      lastTime = now;
      const nextProgress = getProgress();
      progressRef.current = nextProgress;
      setProgress((value) => (Math.abs(value - nextProgress) > 0.0005 ? nextProgress : value));

      const duration = durationRef.current;
      const video = videoRef.current;
      if (duration > 0 && video) {
        targetRef.current = nextProgress * duration;
        if (reduceMotion.matches) {
          currentRef.current = targetRef.current;
        } else {
          currentRef.current +=
            (targetRef.current - currentRef.current) * (1 - Math.exp(-dt * LERP_TAU));
          if (Math.abs(targetRef.current - currentRef.current) < SNAP) {
            currentRef.current = targetRef.current;
          }
        }

        if (readyRef.current && !revertedRef.current) {
          paint(currentRef.current);
        } else if (!video.seeking && Math.abs(video.currentTime - currentRef.current) > 0.01) {
          try {
            video.currentTime = currentRef.current;
          } catch {
            // Metadata is not ready yet. The next animation frame retries.
          }
        }
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    const refresh = () => {
      progressRef.current = getProgress();
    };
    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", refresh);

    const build = async () => {
      if (
        buildingRef.current ||
        reduceMotion.matches ||
        typeof VideoDecoder === "undefined"
      ) {
        return;
      }

      buildingRef.current = true;
      watchdog = window.setTimeout(() => {
        if (paintedRef.current) return;
        revertedRef.current = true;
        readyRef.current = false;
        setCanvasLive(false);
        clearLru();
      }, WATCHDOG);

      try {
        const response = await fetch(videoSrc);
        if (!response.ok) throw new Error(`Video fetch failed: ${response.status}`);
        const source = await response.arrayBuffer();
        let bank: BankFrame[];

        try {
          bank = await decodeBank(source, "prefer-hardware", () => cancelled);
        } catch {
          bank = await decodeBank(source, "prefer-software", () => cancelled);
        }

        if (cancelled || revertedRef.current || !bank.length) return;
        bankRef.current = bank;
        readyRef.current = true;
        warmLru(nearestIndex(bank, progressRef.current * durationRef.current * 1_000_000));
      } catch {
        revertedRef.current = true;
        readyRef.current = false;
        setCanvasLive(false);
      } finally {
        buildingRef.current = false;
        if (paintedRef.current || revertedRef.current) window.clearTimeout(watchdog);
      }
    };

    if (document.readyState === "complete") {
      window.setTimeout(() => void build(), 0);
    } else {
      window.addEventListener("load", build, { once: true });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(watchdog);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("orientationchange", refresh);
      window.removeEventListener("load", build);
      clearLru();
      bankRef.current = [];
      readyRef.current = false;
      buildingRef.current = false;
    };
  }, [videoSrc]);

  return { containerRef, videoRef, canvasRef, progress, canvasLive };
}
