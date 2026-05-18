// ─── ImageCropModal ────────────────────────────────────────────────────────
// Hinge-style photo crop modal. Shows the image with a draggable/zoomable
// 3:4 crop region (matching the SwipeCard photo aspect ratio exactly).
// On "Use crop" → canvas-renders the cropped region → returns a Blob.

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";

type Props = {
  imageUrl: string; // object URL of the picked file
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
};

/** Reads a cropped region from an image using canvas and returns a Blob. */
async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      0.92,
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

export function ImageCropModal({ imageUrl, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageUrl, croppedAreaPixels);
      onConfirm(blob);
    } catch (e) {
      console.error("Crop failed:", e);
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: "rgba(11,17,32,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: "var(--hairline)" }}
      >
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm transition hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
          disabled={processing}
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Crop photo
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Drag to reposition · Pinch or scroll to zoom
          </p>
        </div>

        <button
          onClick={handleConfirm}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 disabled:opacity-50"
          style={{ background: "var(--rose-accent)", color: "#0B1120" }}
        >
          {processing ? (
            <span className="animate-pulse">Processing…</span>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Use crop
            </>
          )}
        </button>
      </div>

      {/* Crop area — takes all remaining height */}
      <div className="relative flex-1 overflow-hidden">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={3 / 4} // exactly matches SwipeCard photo area
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={false}
          style={{
            containerStyle: { background: "transparent" },
            cropAreaStyle: {
              border: "2.5px solid var(--rose-accent)",
              borderRadius: "1.5rem",
              boxShadow: "0 0 0 9999px rgba(11,17,32,0.72)",
            },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div
        className="flex items-center gap-4 px-6 py-5 border-t flex-shrink-0"
        style={{ borderColor: "var(--hairline)" }}
      >
        <button
          onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
          className="transition hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none"
          style={{
            accentColor: "var(--rose-accent)",
            background: `linear-gradient(to right, var(--rose-accent) ${((zoom - 1) / 2) * 100}%, var(--hairline) ${((zoom - 1) / 2) * 100}%)`,
          }}
        />

        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          className="transition hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <span className="text-xs w-10 text-right tabular-nums" style={{ color: "var(--text-muted)" }}>
          {zoom.toFixed(1)}×
        </span>
      </div>

      {/* Preview hint */}
      <p className="text-center text-[11px] pb-4 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
        The pink frame is exactly how your photo will appear on the discover card
      </p>
    </div>
  );
}
