/**
 * Resolves an asset path to a correct URL, supporting base URLs in Vite (e.g. for GitHub Pages).
 */
export function getImageUrl(path) {
  if (!path) return '';
  
  // If it's already an external URL or data URI, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Remove leading slash if present to avoid double-slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Resolve with Vite's BASE_URL (defaults to '/' in dev)
  const base = import.meta.env.BASE_URL || '/';
  const baseSlash = base.endsWith('/') ? base : `${base}/`;

  return `${baseSlash}${cleanPath}`;
}
