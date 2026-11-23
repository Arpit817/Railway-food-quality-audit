import React, { useRef, useState } from 'react';
import { resizeImageToDataUrl } from '../../utils/imageResizer.js';

/**
 * FileInput Component with Camera Capture & Client-Side Canvas Resize
 * Demonstrates:
 * - 1-3 photo upload limitation
 * - Direct camera invocation on mobile devices via `capture="environment"`
 * - Client-side image downscaling to prevent oversized uploads
 * - Thumbnail previews with instant deletion
 */
export function FileInput({ images = [], onImagesChange, maxImages = 3 }) {
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setErrorMsg(`Maximum of ${maxImages} photos allowed per complaint.`);
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const resizedPromises = files.map((file) => resizeImageToDataUrl(file, 800, 600, 0.75));
      const resizedDataUrls = await Promise.all(resizedPromises);

      onImagesChange([...images, ...resizedDataUrls]);
    } catch (err) {
      console.error('Image resize failed:', err);
      setErrorMsg('Failed to process image. Please try another photo.');
    } finally {
      setIsProcessing(false);
      // Reset input value so user can re-upload if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove) => {
    onImagesChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      {/* Hidden File Input configured with camera capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="camera-photo-upload"
      />

      {/* Upload Trigger Box */}
      {images.length < maxImages && (
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className="w-full border-2 border-dashed border-railway-300 hover:border-railway-500 rounded-xl p-3.5 text-center bg-railway-50/50 hover:bg-railway-50 text-xs text-railway-800 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-railway-500"
        >
          <span className="text-xl" role="img" aria-label="camera">📸</span>
          <span className="font-semibold">
            {isProcessing ? 'Optimizing photo...' : `Tap to snap or upload proof (${images.length}/${maxImages})`}
          </span>
          <span className="text-[10px] text-slate-500">Auto-compressed to under 50KB via canvas</span>
        </button>
      )}

      {errorMsg && (
        <p className="text-[11px] text-red-600 font-semibold">{errorMsg}</p>
      )}

      {/* Thumbnail Previews with Remove button */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {images.map((dataUrl, idx) => (
            <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-100 group">
              <img
                src={dataUrl}
                alt={`Photo proof preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                aria-label={`Remove photo ${idx + 1}`}
                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
