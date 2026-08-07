/**
 * Converts image URLs or raw SVG markup from sharing formats to direct-embeddable formats.
 * Uses Base64 encoding for raw SVG code and Data URIs to guarantee 100% browser compatibility.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return url;

  const trimmed = url.trim();

  // 1. Raw SVG markup pasted directly -> convert to Base64 SVG Data URI
  if (trimmed.startsWith('<svg') || trimmed.includes('<svg ') || trimmed.includes('xmlns="http://www.w3.org/2000/svg"')) {
    try {
      const base64 = typeof window !== 'undefined'
        ? window.btoa(unescape(encodeURIComponent(trimmed)))
        : Buffer.from(trimmed).toString('base64');
      return `data:image/svg+xml;base64,${base64}`;
    } catch {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`;
    }
  }

  // 2. SVG Data URI UTF8 -> convert to Base64 SVG Data URI for 100% img tag compatibility
  if (trimmed.startsWith('data:image/svg+xml') && !trimmed.includes(';base64,')) {
    const content = trimmed.replace(/^data:image\/svg\+xml(?:;charset=[^,]+)?,/, '');
    try {
      const decoded = decodeURIComponent(content);
      const base64 = typeof window !== 'undefined'
        ? window.btoa(unescape(encodeURIComponent(decoded)))
        : Buffer.from(decoded).toString('base64');
      return `data:image/svg+xml;base64,${base64}`;
    } catch {
      return trimmed;
    }
  }

  // 3. Regular Data URIs (PNG, WebP, JPG, GIF)
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // 4. GitHub SVG/Image blob URL -> raw content URL
  if (trimmed.includes('github.com') && trimmed.includes('/blob/')) {
    return trimmed.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  // 5. Google Drive share URL -> direct thumbnail URL
  const driveFileMatch = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  );
  if (driveFileMatch) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1200`;
  }

  const driveOpenMatch = trimmed.match(
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  );
  if (driveOpenMatch) {
    return `https://drive.google.com/thumbnail?id=${driveOpenMatch[1]}&sz=w1200`;
  }

  const driveUcMatch = trimmed.match(
    /drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/
  );
  if (driveUcMatch) {
    return `https://drive.google.com/thumbnail?id=${driveUcMatch[1]}&sz=w1200`;
  }

  // 6. Imgur page link -> direct image link
  const imgurMatch = trimmed.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]{5,8})$/);
  if (imgurMatch) {
    return `https://i.imgur.com/${imgurMatch[1]}.png`;
  }

  // 7. Dropbox share link -> direct raw image link
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('dl=0', 'dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
  }

  return trimmed;
}

/**
 * Returns true if the URL looks like a Drive, Imgur, GitHub or Raw SVG that needs conversion
 */
export function isConvertibleUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('<svg') ||
    trimmed.includes('<svg ') ||
    /drive\.google\.com\/(file\/d\/|open\?|uc\?)|imgur\.com\/[a-zA-Z0-9]{5,8}$|github\.com\/.*\/blob\//.test(trimmed)
  );
}
