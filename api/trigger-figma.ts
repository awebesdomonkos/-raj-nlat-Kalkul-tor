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

interface PexelsPhoto {
  url: string;
  photographer: string;
  alt: string;
}

interface ApiResponse {
  success: boolean;
  figmaFileUrl?: string;
  designBrief?: string;
  photos?: PexelsPhoto[];
  error?: string;
}

function generateDesignBrief(data: TriggerPayload): string {
  const pages = data.pages.length > 0 ? data.pages : ['Főoldal', 'Rólunk', 'Kapcsolat'];
  const extras = data.extras.length > 0 ? data.extras : [];

  const frames = pages
    .map((p) => `- **${p}:** Hero / tartalom szekciók / CTA`)
    .join('\n');

  const components = [
    '- Header (logo + navigáció + mobil hamburger)',
    '- Hero szekció (headline + alcím + CTA gomb)',
    ...pages.slice(1).map((p) => `- ${p} szekció`),
    extras.length > 0 ? `- Extra komponensek: ${extras.join(', ')}` : null,
    '- Footer (elérhetőség + linkek + copyright)',
  ]
    .filter(Boolean)
    .join('\n');

  const notesSection = data.clientNotes?.hasChanges
    ? `\n## ⚡ Különleges instrukciók\n${[
        data.clientNotes.designNotes && `- **Dizájn:** ${data.clientNotes.designNotes}`,
        data.clientNotes.itemChanges && `- **Tételek:** ${data.clientNotes.itemChanges}`,
        data.clientNotes.pageChanges && `- **Oldalak:** ${data.clientNotes.pageChanges}`,
        data.clientNotes.generalNotes && `- **Általános:** ${data.clientNotes.generalNotes}`,
      ]
        .filter(Boolean)
        .join('\n')}`
    : '';

  const researchSection = data.researchSummary
    ? `\n## 🔍 Research összefoglaló\n${data.researchSummary.substring(0, 800)}`
    : '';

  return `## 📋 Projekt összefoglaló
- **Ügyfél:** ${data.clientName}
- **Projekt:** ${data.subject}
- **Csomag:** ${data.packageName} — ${data.totalPrice.toLocaleString('hu-HU')} Ft
- **Referencia site:** ${data.websiteUrl || 'nincs megadva'}
- **Oldalak:** ${pages.join(', ')}
- **Extrák:** ${extras.length > 0 ? extras.join(', ') : 'nincs'}

## 🎨 Szín paletta
*(Töltsd ki a referencia site és brand anyagok alapján)*
- Elsődleges szín: —
- Másodlagos szín: —
- Háttér: —
- Szöveg: —

## ✏️ Tipográfia
*(Töltsd ki a brand stílus alapján, ajánlott: Google Fonts)*
- Heading font: —
- Body font: —

## 💡 Design stílus
Modern, letisztult, professzionális megjelenés.${data.websiteUrl ? ` Referencia: ${data.websiteUrl}` : ''} A research és az ügyfél briefing alapján finomítandó.

## 📐 Figma frame-ek
${frames}

## 🧩 Komponensek listája
${components}
${notesSection}${researchSection}`;
}

async function fetchPexelsPhotos(data: TriggerPayload): Promise<PexelsPhoto[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  // Build search query from subject + extras
  const terms = [data.subject, ...data.extras].filter(Boolean);
  const query = terms.slice(0, 2).join(' ') || 'professional service';

  const resp = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
    { headers: { Authorization: key } }
  );
  if (!resp.ok) return [];

  const json = (await resp.json()) as {
    photos: { src: { large: string }; photographer: string; alt: string }[];
  };

  return (json.photos ?? []).map((p) => ({
    url: p.src.large,
    photographer: p.photographer,
    alt: p.alt,
  }));
}

function getFigmaProjectUrl(): string {
  const projectId = process.env.FIGMA_PROJECT_ID ?? '610035441';
  return `https://www.figma.com/files/project/${projectId}`;
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
    const designBrief = generateDesignBrief(data);
    const figmaFileUrl = getFigmaProjectUrl();
    const photos = await fetchPexelsPhotos(data);

    const result: ApiResponse = {
      success: true,
      figmaFileUrl,
      designBrief,
      photos,
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
