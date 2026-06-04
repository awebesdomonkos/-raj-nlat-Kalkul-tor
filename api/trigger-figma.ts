export const config = { runtime: 'edge' };

interface ClientNotes {
  hasChanges: boolean;
  designNotes: string;
  itemChanges: string;
  pageChanges: string;
  generalNotes: string;
}

interface TriggerPayload {
  quoteId: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  packageName: string;
  totalPrice: number;
  websiteUrl: string;
  extras: string[];
  pages: string[];
  clientNotes: ClientNotes | null;
  researchSummary: string | null;
}

interface ApiResponse {
  success: boolean;
  figmaFileUrl?: string;
  designBrief?: string;
  error?: string;
}

async function generateDesignBrief(data: TriggerPayload): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY nincs beállítva');

  const notesSection = data.clientNotes?.hasChanges
    ? `\nÜGYFÉL MEGJEGYZÉSEK:\n${data.clientNotes.designNotes ? `- Dizájn: ${data.clientNotes.designNotes}\n` : ''}${data.clientNotes.itemChanges ? `- Tételek: ${data.clientNotes.itemChanges}\n` : ''}${data.clientNotes.pageChanges ? `- Oldalak: ${data.clientNotes.pageChanges}\n` : ''}${data.clientNotes.generalNotes ? `- Általános: ${data.clientNotes.generalNotes}\n` : ''}`
    : '';

  const researchSection = data.researchSummary
    ? `\nKUTATÁS (összefoglaló):\n${data.researchSummary.substring(0, 600)}...`
    : '';

  const prompt = `Te JARVIS, egy senior webdesigner vagy. Készíts egy tömör, actionable Figma design briefinget ehhez a projekthez.

PROJEKT:
- Ügyfél: ${data.clientName}
- Projekt: ${data.subject}
- Csomag: ${data.packageName} — ${data.totalPrice.toLocaleString('hu-HU')} Ft
- Referencia site: ${data.websiteUrl || 'nincs megadva'}
- Oldalak/szekciók: ${data.pages.length > 0 ? data.pages.join(', ') : 'alapcsomag szerinti'}
- Extra funkciók: ${data.extras.length > 0 ? data.extras.join(', ') : 'nincs'}
${notesSection}${researchSection}

Adj vissza egy strukturált Figma briefinget a következő szekciókkal (markdown formátumban, magyarul):

## 🎨 Szín paletta
(3-4 szín: neve, hex kód, és mire használjuk)

## ✏️ Tipográfia
(Heading font + Body font, Google Fonts-ból)

## 💡 Design stílus
(2-3 mondat: hangulat, stílus, referencia irány)

## 📐 Figma frame-ek
(Oldalanként egy frame — mi legyen benne, milyen szekciók)

## 🧩 Komponensek listája
(Header, Hero, Cards, CTA, Footer, stb.)

## ⚡ Különleges instrukciók
(Ügyfél kérések, figyelendő dolgok)

Legyen konkrét és rövid. Max 450 szó.`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.7 },
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Gemini API hiba (${resp.status}): ${err.substring(0, 200)}`);
  }

  const json = (await resp.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function createFigmaFile(
  clientName: string,
  subject: string,
  brief: string
): Promise<string | null> {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  const projectId = process.env.FIGMA_PROJECT_ID;

  if (!token || !projectId) return null;

  const fileName = `${clientName} — ${subject}`;

  const createResp = await fetch(
    `https://api.figma.com/v1/projects/${projectId}/files`,
    {
      method: 'POST',
      headers: {
        'X-Figma-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: fileName }),
    }
  );

  if (!createResp.ok) {
    console.error('Figma fájl létrehozás sikertelen:', createResp.status, await createResp.text());
    return null;
  }

  const fileData = (await createResp.json()) as {
    key?: string;
    file?: { key: string };
  };

  const fileKey = fileData.key ?? fileData.file?.key;
  if (!fileKey) return null;

  // Add design brief as a comment
  await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
    method: 'POST',
    headers: {
      'X-Figma-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `🤖 JARVIS Design Brief\n\n${brief}`,
    }),
  });

  return `https://www.figma.com/design/${fileKey}/${encodeURIComponent(
    fileName.replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
  )}`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let data: TriggerPayload;
  try {
    data = (await req.json()) as TriggerPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!data.quoteId || !data.clientName) {
    return new Response(
      JSON.stringify({ error: 'quoteId és clientName megadása kötelező' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const designBrief = await generateDesignBrief(data);
    const figmaFileUrl = await createFigmaFile(data.clientName, data.subject, designBrief);

    const result: ApiResponse = {
      success: true,
      figmaFileUrl: figmaFileUrl ?? undefined,
      designBrief,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ismeretlen hiba';
    console.error('trigger-figma hiba:', message);
    return new Response(
      JSON.stringify({ success: false, error: message } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
