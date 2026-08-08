(function exposeImageRandomizer(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ImageRandomizer = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function createImageRandomizer() {
  function shuffle(items, random = Math.random) {
    const shuffled = Array.isArray(items) ? [...items] : [];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
  }

  function dedupeByUrl(items) {
    const seen = new Set();

    return (Array.isArray(items) ? items : []).filter((item) => {
      const url = item && typeof item.img === 'string' ? item.img.trim() : '';
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }

  function selectFresh(items, count, recentUrls, random = Math.random) {
    const uniqueItems = dedupeByUrl(items);
    const recent = new Set(Array.isArray(recentUrls) ? recentUrls : []);
    const unseen = uniqueItems.filter((item) => !recent.has(item.img));
    const seen = uniqueItems.filter((item) => recent.has(item.img));
    const limit = Math.max(0, Math.floor(Number(count) || 0));

    return [...shuffle(unseen, random), ...shuffle(seen, random)].slice(0, limit);
  }

  function readRecent(storage, key) {
    try {
      if (!storage || typeof storage.getItem !== 'function') return [];
      const value = JSON.parse(storage.getItem(key) || '[]');
      if (!Array.isArray(value) || value.some((url) => typeof url !== 'string')) return [];
      return value.filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function writeRecent(storage, key, urls, maxEntries) {
    try {
      if (!storage || typeof storage.setItem !== 'function') return;
      const limit = Math.max(0, Math.floor(Number(maxEntries) || 0));
      const uniqueUrls = [...new Set((Array.isArray(urls) ? urls : []).filter((url) => typeof url === 'string' && url))];
      storage.setItem(key, JSON.stringify(uniqueUrls.slice(0, limit)));
    } catch (error) {
      // Storage is optional and may be blocked by browser privacy settings.
    }
  }

  function pickDifferentIndex(length, currentIndex, random = Math.random) {
    const size = Math.max(0, Math.floor(Number(length) || 0));
    if (size <= 1) return 0;

    const current = Math.min(Math.max(0, Math.floor(Number(currentIndex) || 0)), size - 1);
    const candidate = Math.floor(random() * (size - 1));
    return candidate >= current ? candidate + 1 : candidate;
  }

  return {
    shuffle,
    dedupeByUrl,
    selectFresh,
    readRecent,
    writeRecent,
    pickDifferentIndex
  };
}));
