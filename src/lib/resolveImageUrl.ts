/**
 * Converts image URLs from sharing formats to direct-embeddable formats.
 * Supports SVG, PNG, WebP, JPG, GIF, Data URIs, Imgur, Dropbox, Google Drive, and direct host links.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return url;

  const trimmed = url.trim();

  // SVG Data URI or regular Data URI
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Google Drive share URL → direct thumbnail URL
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

  // Imgur page link → direct image link (e.g. https://imgur.com/abc -> https://i.imgur.com/abc.png)
  const imgurMatch = trimmed.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]{5,8})$/);
  if (imgurMatch) {
    return `https://i.imgur.com/${imgurMatch[1]}.png`;
  }

  // Dropbox share link → direct raw image link
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('dl=0', 'dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
  }

  return trimmed;
}

/**
 * Returns true if the URL looks like a Google Drive or Imgur page link that needs conversion
 */
export function isConvertibleUrl(url: string): boolean {
  return /drive\.google\.com\/(file\/d\/|open\?|uc\?)|imgur\.com\/[a-zA-Z0-9]{5,8}$/.test(url);
}
