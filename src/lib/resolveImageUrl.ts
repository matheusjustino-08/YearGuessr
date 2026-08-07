/**
 * Converts image URLs from sharing formats to direct-embeddable formats.
 *
 * Supported conversions:
 * - Google Drive share URL → direct thumbnail URL
 *   https://drive.google.com/file/d/FILE_ID/view  →  https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200
 * - Google Drive open URL → direct thumbnail URL
 *   https://drive.google.com/open?id=FILE_ID  →  same as above
 *
 * All other URLs are returned as-is.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return url;

  const trimmed = url.trim();

  // Pattern: https://drive.google.com/file/d/{FILE_ID}/view
  const driveFileMatch = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  );
  if (driveFileMatch) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1200`;
  }

  // Pattern: https://drive.google.com/open?id={FILE_ID}
  const driveOpenMatch = trimmed.match(
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  );
  if (driveOpenMatch) {
    return `https://drive.google.com/thumbnail?id=${driveOpenMatch[1]}&sz=w1200`;
  }

  // Pattern: https://drive.google.com/uc?id={FILE_ID} or uc?export=view&id=...
  const driveUcMatch = trimmed.match(
    /drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/
  );
  if (driveUcMatch) {
    return `https://drive.google.com/thumbnail?id=${driveUcMatch[1]}&sz=w1200`;
  }

  return trimmed;
}

/**
 * Returns true if the URL looks like it needs conversion (e.g. a Drive sharing link)
 */
export function isConvertibleUrl(url: string): boolean {
  return /drive\.google\.com\/(file\/d\/|open\?|uc\?)/.test(url);
}
