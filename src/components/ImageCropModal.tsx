"use client";

import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Check, Crop } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  if (!isOpen) return null;

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function aplicarCorte() {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 320;
    canvas.width = SIZE;
    canvas.height = SIZE;

    ctx.clearRect(0, 0, SIZE, SIZE);

    const baseScale = Math.max(SIZE / img.width, SIZE / img.height);
    const scale = baseScale * zoom;

    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = SIZE / 2 - drawW / 2 + offset.x;
    const drawY = SIZE / 2 - drawH / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob);
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-[#0A2540]">
            <Crop size={18} className="text-[#1565C0]" />
            <h2 className="font-bold">Ajustar e Enquadrar Foto</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center p-6">
          <div
            className="relative h-64 w-64 cursor-grab overflow-hidden rounded-full border-4 border-[#1565C0] bg-gray-900 shadow-inner active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Prévia de enquadramento"
                draggable={false}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  maxWidth: "none",
                  maxHeight: "none",
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  marginLeft: imageRef.current ? -imageRef.current.width / 2 : 0,
                  marginTop: imageRef.current ? -imageRef.current.height / 2 : 0,
                }}
                className="select-none pointer-events-none"
              />
            )}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Arraste a imagem para reposicionar dentro do círculo.
          </p>

          <div className="mt-4 flex w-full max-w-xs items-center gap-3">
            <ZoomOut size={16} className="text-gray-400" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#1565C0]"
            />
            <ZoomIn size={16} className="text-gray-400" />
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aplicarCorte}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0A2540]"
          >
            <Check size={16} /> Salvar Foto
          </button>
        </div>
      </div>
    </div>
  );
}