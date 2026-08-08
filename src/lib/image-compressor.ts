/**
 * Client-side WebP Image Compressor for Admin CMS Uploads.
 * Downscales images to max width/height of 1200px and converts to WebP format
 * with quality 0.82 to drastically reduce Supabase Storage CDN bandwidth & costs.
 */
export async function compressImageToWebP(file: File, maxWidth = 1200, quality = 0.82): Promise<File> {
  // If already SVG or tiny file (< 100KB), return original
  if (file.type === 'image/svg+xml' || file.size < 100 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const compressedFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          const compressedFile = new File([blob], compressedFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
