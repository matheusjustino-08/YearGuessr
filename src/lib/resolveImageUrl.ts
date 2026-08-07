/**
 * Converts image URLs or raw SVG markup from sharing formats to direct-embeddable formats.
 * Supports raw <svg> markup, SVG Data URIs, PNG, WebP, JPG, GIF, Imgur, Dropbox, GitHub, and Google Drive URLs.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return url;

  const trimmed = url.trim();

  // 1. Raw SVG markup pasted directly -> convert to SVG Data URI
  if (trimmed.startsWith('<svg') || trimmed.includes('<svg ') || trimmed.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`;
  }

  // 2. Data URI (SVG or raster image)
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // 3. GitHub SVG/Image blob URL -> raw content URL
  if (trimmed.includes('github.com') && trimmed.includes('/blob/')) {
    return trimmed.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  // 4. Google Drive share URL -> direct thumbnail URL
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

  // 5. Imgur page link -> direct image link (e.g. https://imgur.com/abc -> https://i.imgur.com/abc.png)
  const imgurMatch = trimmed.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]{5,8})$/);
  if (imgurMatch) {
    return `https://i.imgur.com/${imgurMatch[1]}.png`;
  }

  // 6. Dropbox share link -> direct raw image link
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
