import { useState, useCallback } from "react";
import { toPng } from "html-to-image";

export function useShare(captureRef: React.RefObject<HTMLElement | null>) {
  const [sharing, setSharing] = useState(false);

  const share = useCallback(async () => {
    if (!captureRef.current || sharing) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "my-emojify-diagnosis.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Emojify Diagnosis" });
      } else {
        const link = document.createElement("a");
        link.download = "my-emojify-diagnosis.png";
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setSharing(false);
    }
  }, [captureRef, sharing]);

  return { share, sharing };
}
