/**
 * Client-side image resize utility using HTML5 Canvas
 * Downscales full-resolution phone camera photos (5MB - 10MB) to maximum dimensions (e.g., 800x600)
 * and compresses to JPEG (~30KB - 50KB), perfectly suited for passenger mobile network transmission.
 *
 * @param {File} file - Original user image file
 * @param {number} maxWidth - Default 800px
 * @param {number} maxHeight - Default 600px
 * @param {number} quality - JPEG compression quality 0.0 to 1.0 (default 0.75)
 * @returns {Promise<string>} Base64 Data URL
 */
export function resizeImageToDataUrl(file, maxWidth = 800, maxHeight = 600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio calculation
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw onto offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
