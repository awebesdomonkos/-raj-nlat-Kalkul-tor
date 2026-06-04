export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const query = url.searchParams.get('query') || 'professional service';
  const perPage = Math.min(Number(url.searchParams.get('per_page') ?? '6'), 12);

  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resp = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
    { headers: { Authorization: key } }
  );

  if (!resp.ok) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = (await resp.json()) as {
    photos: { src: { large: string; medium: string }; photographer: string; alt: string }[];
  };

  const photos = (data.photos ?? []).map((p) => ({
    url: p.src.large,
    thumbnail: p.src.medium,
    photographer: p.photographer,
    alt: p.alt,
  }));

  return new Response(JSON.stringify(photos), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
