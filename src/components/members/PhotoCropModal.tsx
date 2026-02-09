"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

interface PhotoCropModalProps {
  imageSrc: string;
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    400,
    400
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function PhotoCropModal({ imageSrc, onConfirm, onCancel }: PhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  async function handleSave() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(croppedBase64);
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Adjust Photo</h3>
          <p className="text-xs text-gray-500 mt-0.5">Zoom and drag to position your photo</p>
        </div>

        {/* Crop Area */}
        <div className="relative bg-gray-900" style={{ height: 320 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom Slider */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
            />
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          <p className="text-center text-xs text-gray-400 mt-1">{Math.round(zoom * 100)}%</p>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
