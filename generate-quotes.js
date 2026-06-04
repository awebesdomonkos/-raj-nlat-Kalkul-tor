/**
 * JARVIS Quote Generator
 * Usage: node generate-quotes.js
 *
 * Reads client data + Research.md files and writes a valid public/jarvis-quotes.json.
 * Always use this script — never write the JSON manually (unescaped chars cause SyntaxError).
 */

const fs = require('fs');
const path = require('path');

const JARVIS_ROOT = path.join(__dirname, '..', '..', '..', 'Lakatos_Karoly_Web');
const OUTPUT = path.join(__dirname, 'public', 'jarvis-quotes.json');

// ── Helper ────────────────────────────────────────────────────────────────────

function readResearch(projectPath) {
  const researchFile = path.join(projectPath, 'Research.md');
  if (!fs.existsSync(researchFile)) return undefined;
  return fs.readFileSync(researchFile, 'utf8');
}

// ── Quotes ───────────────────────────────────────────────────────────────────

const quotes = [
  {
    id: '2026-LK-001',
    savedAt: 1780531200000,
    clientName: 'Lakatos Károly',
    subject: 'Bemutatkozó weboldal – Sittszállítás, Lomtalanítás, Költöztetés',
    status: 'vazlat',
    state: {
      selectedPackageId: 'intro',
      selectedExtras: {},
      customPrices: {},
      customSections: [],
      customInstances: {
        rolunk: [{ id: 'lk-r1', name: 'Rólunk', description: 'A cég bemutatkozása, értékek, személyes bemutatkozás', price: 35000 }],
        kapcsolat: [{ id: 'lk-k1', name: 'Kapcsolat', description: 'Kapcsolati adatok, visszahívás kérés, Google Maps, kapcsolati űrlap', price: 35000 }],
        gyik: [{ id: 'lk-g1', name: 'GYIK', description: 'Leggyakoribb kérdések — szinte egyetlen versenytársnál sincs, SEO arany', price: 25000 }],
      },
      quoteDetails: {
        clientName: 'Lakatos Károly',
        clientEmail: 'lakatoskaroly24@gmail.com',
        quoteId: '2026-LK-001',
        subject: 'Bemutatkozó weboldal – Sittszállítás, Lomtalanítás, Költöztetés',
        estimatedTime: '3-4 hét',
        validityDays: 30,
        priorityMultiplier: 1,
        websiteUrl: '',
      },
      editablePackageContents: {
        pages: [{ text: 'Főoldal', isNew: false }],
        features: [
          { text: 'Menü beállítás', isNew: false },
          { text: 'CMS rendszer konfigurálás', isNew: false },
          { text: 'Cookie bar beállítása (GDPR)', isNew: false },
          { text: 'Alap SEO beállítások', isNew: false },
          { text: 'Prémium Bricks Builder licence (Lifetime)', isNew: false },
          { text: 'Webbiztonsági plugin beállítása', isNew: false },
          { text: 'Reszponzív megjelenés (mobile-first)', isNew: false },
          { text: 'SMTP beállítás', isNew: false },
          { text: 'Kapcsolati űrlap', isNew: false },
          { text: 'Google Analytics integrálása', isNew: false },
          { text: 'Google Search Console – XML Sitemap', isNew: false },
        ],
      },
      selectedPlanId: null,
      selectedEliteExtensions: {},
      customElitePrices: {},
      status: 'vazlat',
      discountPercentage: 0,
    },
    researchContent: readResearch(JARVIS_ROOT),
  },
];

// ── Generate & validate ───────────────────────────────────────────────────────

const json = JSON.stringify(quotes, null, 2);

try {
  JSON.parse(json);
} catch (e) {
  console.error('❌ Generated JSON is invalid:', e.message);
  process.exit(1);
}

fs.writeFileSync(OUTPUT, json);
console.log(`✅ Written ${quotes.length} quote(s) to public/jarvis-quotes.json (${json.length} bytes)`);
quotes.forEach(q => console.log(`   • ${q.id} — ${q.clientName} — ${q.researchContent ? 'research ✓' : 'no research'}`));
