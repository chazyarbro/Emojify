import { useState, useCallback } from "react";
import html2canvas from "html2canvas";

export function useShare(captureRef: React.RefObject<HTMLElement | null>) {
  const [sharing, setSharing] = useState(false);

  const share = useCallback(async () => {
    if (!captureRef.current || sharing) return;
    setSharing(true);

    try {
      await document.fonts.ready;

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        backgroundColor: "#F1ECE2",
        useCORS: true,
        logging: false,
        windowWidth: captureRef.current.scrollWidth,
        windowHeight: captureRef.current.scrollHeight,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Failed to generate image");

      const file = new File([blob], "my-emojify-diagnosis.png", {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Emojify Diagnosis" });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "my-emojify-diagnosis.png";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
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
