"use client";

import { useState, useRef } from "react";
import { X, Check, ZoomIn, ZoomOut } from "lucide-react";

interface AvatarCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function AvatarCropModal({
  imageSrc,
  onClose,
  onCropComplete,
}: AvatarCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  function confirmarRecorte() {
    const img = imgRef.current;
    if (!img) return;

    const tamanhoSaida = 400;
    const canvas = document.createElement("canvas");
    canvas.width = tamanhoSaida;
    canvas.height = tamanhoSaida;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, tamanhoSaida, tamanhoSaida);

    const menorLado = Math.min(img.naturalWidth, img.naturalHeight);
    const cropSize = menorLado / zoom;

    const maxDeslocX = (img.naturalWidth - cropSize) / 2;
    const maxDeslocY = (img.naturalHeight - cropSize) / 2;

    const sx = Math.max(
      0,
      Math.min(
        img.naturalWidth - cropSize,
        (img.naturalWidth - cropSize) / 2 - (offsetX / 100) * maxDeslocX
      )
    );
    const sy = Math.max(
      0,
      Math.min(
        img.naturalHeight - cropSize,
        (img.naturalHeight - cropSize) / 2 - (offsetY / 100) * maxDeslocY
      )
    );

    ctx.drawImage(
      img,
      sx,
      sy,
      cropSize,
      cropSize,
      0,
      0,
      tamanhoSaida,
      tamanhoSaida
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-[#0A2540]">
            Ajustar Foto do Paciente
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <div className="relative h-60 w-60 overflow-hidden rounded-2xl border-2 border-[#1565C0] bg-gray-100">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Pré-visualização"
              style={{
                transform: `scale(${zoom}) translate(${offsetX * 0.25}%, ${
                  offsetY * 0.25
                }%)`,
              }}
              className="h-full w-full object-cover transition-transform duration-75"
            />
          </div>

          <div className="mt-5 w-full space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600">
                <span className="flex items-center gap-1">
                  <ZoomOut size={14} /> Zoom
                </span>
                <span className="flex items-center gap-1">
                  {zoom.toFixed(1)}x <ZoomIn size={14} />
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#1565C0]"
              />
            </div>

            {zoom > 1 && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    Posição Horizontal
                  </label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="w-full accent-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    Posição Vertical
                  </label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="w-full accent-[#1565C0]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmarRecorte}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A2540]"
          >
            <Check size={16} />
            Salvar Foto
          </button>
        </div>
      </div>
    </div>
  );
}