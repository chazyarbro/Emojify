import { useState, useCallback } from "react";
import { toPng } from "html-to-image";
import type { EmotionResult } from "../types/api";
import type { TimeRange } from "../types/spotify";
import type { SharePayload } from "../types/share";

export function encodeSharePayload(
  results: EmotionResult[],
  trackCount: number,
  timeRange: TimeRange
): string {
  const payload: SharePayload = { v: 1, e: results, n: trackCount, r: timeRange };
  return btoa(JSON.stringify(payload));
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const payload = JSON.parse(atob(encoded));
    if (payload?.v !== 1 || !Array.isArray(payload?.e) || !payload?.r) return null;
    return payload as SharePayload;
  } catch {
    return null;
  }
}

export function useShare(
  results: EmotionResult[] | null,
  trackCount: number,
  timeRange: TimeRange
) {
  const [copied, setCopied] = useState(false);

  const encoded = results ? encodeSharePayload(results, trackCount, timeRange) : "";
  const shareUrl = results
    ? `${window.location.origin}/share?d=${encoded}`
    : "";

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = shareUrl;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [shareUrl]);

  const downloadImage = useCallback(async (element: HTMLElement) => {
    try {
      const dataUrl = await toPng(element, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "my-emojify-diagnosis.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image download failed:", err);
    }
  }, []);

  return { shareUrl, copyLink, copied, downloadImage };
}
