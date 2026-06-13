// Abstraction des appels fetch avec cache simple
const cache = new Map();

export async function fetchJSON(url) {
  if (cache.has(url)) return cache.get(url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erreur ${response.status}`);
  const data = await response.json();
  cache.set(url, data);
  return data;
}
