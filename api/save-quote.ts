export const config = { runtime: 'edge' };

const GITHUB_API = 'https://api.github.com';
const REPO = 'awebesdomonkos/-raj-nlat-Kalkul-tor';
const FILE_PATH = 'public/jarvis-quotes.json';
const BRANCH = 'main';

async function getFile(token: string): Promise<{ content: any[]; sha: string }> {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    { headers: { Authorization: `token ${token}`, 'User-Agent': 'jarvis-api' } }
  );
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data: any = await res.json();
  const decoded = atob(data.content.replace(/\n/g, ''));
  return { content: JSON.parse(decoded), sha: data.sha };
}

async function putFile(token: string, sha: string, quotes: any[]): Promise<void> {
  const body = JSON.stringify(quotes, null, 2);
  const encoded = btoa(unescape(encodeURIComponent(body)));
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'jarvis-api',
      },
      body: JSON.stringify({
        message: 'quotes: sync via app',
        content: encoded,
        sha,
        branch: BRANCH,
      }),
    }
  );
  if (res.status === 409) throw new Error('CONFLICT');
  if (!res.ok) {
    const err: any = await res.json().catch(() => ({}));
    throw new Error(`GitHub PUT failed: ${res.status} ${err?.message || ''}`);
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const token = (process.env.GITHUB_TOKEN || '').trim();
  if (!token) {
    return new Response(JSON.stringify({ error: 'GITHUB_TOKEN not configured' }), { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { action, quote, id } = body;
  if (!action || !['upsert', 'delete'].includes(action)) {
    return new Response(JSON.stringify({ error: 'action must be upsert or delete' }), { status: 400 });
  }

  // Retry once on SHA conflict
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { content: quotes, sha } = await getFile(token);

      let updated: any[];
      if (action === 'upsert') {
        if (!quote) return new Response(JSON.stringify({ error: 'quote required for upsert' }), { status: 400 });
        const idx = quotes.findIndex((q: any) => q.id === quote.id);
        if (idx >= 0) {
          updated = quotes.map((q: any) => q.id === quote.id ? quote : q);
        } else {
          updated = [quote, ...quotes];
        }
      } else {
        // delete
        const deleteId = id || quote?.id;
        if (!deleteId) return new Response(JSON.stringify({ error: 'id required for delete' }), { status: 400 });
        updated = quotes.filter((q: any) => q.id !== deleteId);
      }

      await putFile(token, sha, updated);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      if (err.message === 'CONFLICT' && attempt === 0) continue; // retry once
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: err.message === 'CONFLICT' ? 409 : 500 }
      );
    }
  }

  return new Response(JSON.stringify({ success: false, error: 'Unknown error' }), { status: 500 });
}
