interface SearchResult {
  title: string;
  url: string;
}

export async function ddgSearch(query: string): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encoded}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const html = await res.text();

  // URL 추출 (DuckDuckGo는 uddg 파라미터에 실제 URL을 넣음)
  const urlRe = /uddg=(https?[^&"]+)/g;
  const titleRe = /class="result__a"[^>]*>([^<]+)</g;

  const urls: string[] = [];
  let m;
  while ((m = urlRe.exec(html)) !== null) {
    const url = decodeURIComponent(m[1]);
    if (!urls.includes(url)) urls.push(url);
  }

  const titles: string[] = [];
  while ((m = titleRe.exec(html)) !== null) {
    titles.push(m[1].trim());
  }

  return urls.map((url, i) => ({
    title: titles[i] || url,
    url,
  }));
}
