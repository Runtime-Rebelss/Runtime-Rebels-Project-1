/**
 * Utility for building URLSearchParams for product searches.
 *
 * This mirrors the logic previously embedded in the hook so callers can
 * construct identical query strings for navigation and API calls.
 *
 * @param {URLSearchParams|string|Object|Array<string>} params
 * @param {{search?:string, categories?:string[]}} overrides
 * @returns {URLSearchParams}
 */
export function buildMergedParams(params, overrides) {
  const merged = new URLSearchParams();
  // Initialize from params
  if (params) {
    // If params is an array, treat it as a list of categories
    if (Array.isArray(params)) {
      for (const it of params) {
        if (it != null) merged.append('categories', String(it));
      }
    } else if (typeof params === 'string') {
      const p = new URLSearchParams(params.replace(/^\?/, ''));
      for (const [k, v] of p) merged.append(k, v);
    } else if (params instanceof URLSearchParams) {
      for (const [k, v] of params) merged.append(k, v);
    } else if (typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        if (v == null) continue;
        if (Array.isArray(v)) {
          for (const it of v) merged.append(k, it);
        } else merged.append(k, String(v));
      }
    }
  }

  // Normalize search key: accept `q` as alias for `search` and prefer `search` if both present.
  // Move value from `q` into `search` and remove `q` so outgoing request only includes `search`.
  if (merged.has('q') && !merged.has('search')) {
    merged.set('search', merged.get('q'));
    merged.delete('q');
  }

  // Apply overrides (override/append categories and search)
  if (overrides) {
    if (overrides.search != null) {
      merged.set('search', String(overrides.search));
      // ensure we only send `search` in outgoing requests
      merged.delete('q');
    }
    if (Array.isArray(overrides.categories)) {
      // remove existing categories to avoid duplicates, then append overrides
      merged.delete('categories');
      for (const c of overrides.categories) {
        if (c != null) merged.append('categories', c);
      }
    }
  }

  // Do not include `q` in outgoing requests; we normalize to `search` only.

  return merged;
}
