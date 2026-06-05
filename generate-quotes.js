/**
 * JARVIS Quote Generator
 * Usage: node generate-quotes.js
 *
 * Reads client data + Research.md files and writes a valid public/jarvis-quotes.json.
 * Always use this script — never write the JSON manually (unescaped chars cause SyntaxError).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECTS_ROOT = '/Users/zaladomonkos/Documents/Cloude /Agents/JARVIS/Projects';
const OUTPUT = path.join(__dirname, 'public', 'jarvis-quotes.json');

// ── Helper ────────────────────────────────────────────────────────────────────

function readResearch(projectFolder) {
  const researchFile = path.join(PROJECTS_ROOT, projectFolder, 'Research.md');
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
    researchContent: readResearch('Lakatos_Karoly_Web'),
    // Figma workflow fields — set by JARVIS as the project progresses:
    // figmaPhase: 'not_started' | 'brief_ready' | 'figma_in_progress' | 'figma_done' | 'figma_approved'
    // figmaFileUrl: 'https://figma.com/file/...'
    // figmaBriefPath: 'Projects/Lakatos_Karoly_Web/Figma_Brief.md'
    // clientNotes: { hasChanges, designNotes, itemChanges, pageChanges, generalNotes, submittedAt }
    // figmaClientNotes: { ... }  (set after Figma approval)
  },
  // ── Happy Couples Cyprus ──────────────────────────────────────────────────
  {
    id: '2026-HCC-001',
    savedAt: Date.now(),
    clientName: 'Happy Couples Cyprus',
    subject: 'Kétnyelvű katalógus weboldal – Ciprusi esküvőszervező',
    status: 'vazlat',
    state: {
      selectedPackageId: 'catalog',
      selectedExtras: {},
      customPrices: {},
      customSections: [
        { id: 'hcc-cs1', name: 'Többnyelvűség (EN)', price: 80000 },
        { id: 'hcc-cs2', name: 'Videós galéria (Vimeo/YouTube embed)', price: 30000 },
        { id: 'hcc-cs3', name: 'Online chat integráció (Tidio/Crisp)', price: 25000 },
        { id: 'hcc-cs4', name: 'SEO optimalizált szövegírás (HU + EN)', price: 40000 },
      ],
      customInstances: {
        rolunk:              [{ id: 'hcc-r1', name: 'Rólunk', description: 'Anikó + csapat bemutatkozása — személyes arc = bizalom', price: 35000 }],
        kapcsolat:           [{ id: 'hcc-k1', name: 'Kapcsolat', description: 'Automatizált kontakt form + email integráció, social linkek', price: 35000 }],
        galeria:             [{ id: 'hcc-g1', name: 'Galéria', description: 'Saját esküvői fotók galériája', price: 25000 }],
        'referenciak-osszestio': [{ id: 'hcc-ref1', name: 'Referenciák összesítő', description: 'Elvégzett esküvők, párok véleményei', price: 25000 }],
        'szolgaltatas-aloldal': [
          { id: 'hcc-s1', name: 'Esküvő Cipruson — részletes aloldal', description: '3 csomag, helyszínek, folyamat bemutató', price: 35000 },
          { id: 'hcc-s2', name: 'Lánykérés — aloldal', description: 'Lánykérés szervezési szolgáltatás bemutatása', price: 35000 },
          { id: 'hcc-s3', name: 'Lány- és Legénybúcsú — aloldal', description: 'Búcsú szervezési szolgáltatás bemutatása', price: 35000 },
        ],
      },
      quoteDetails: {
        clientName: 'Happy Couples Cyprus',
        clientEmail: 'info@happycouplescyprus.com',
        quoteId: '2026-HCC-001',
        subject: 'Kétnyelvű katalógus weboldal – Ciprusi esküvőszervező',
        estimatedTime: '6-7 hét',
        validityDays: 30,
        priorityMultiplier: 1,
        websiteUrl: 'https://happycouplescyprus.com/',
      },
      editablePackageContents: {
        pages: [
          { text: 'Főoldal', isNew: false },
          { text: 'Terméklistázó', isNew: false },
          { text: 'Termék adatlap sablon', isNew: false },
        ],
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
          { text: 'Nyelvváltó (HU ↔ EN)', isNew: true },
          { text: 'Social média megosztás (OG tagek)', isNew: true },
        ],
      },
      selectedPlanId: null,
      selectedEliteExtensions: {},
      customElitePrices: {},
      status: 'vazlat',
      discountPercentage: 0,
    },
    researchContent: readResearch('Happy_Couples_Cyprus_Web'),
  },
  // ── Hürkecz Imre – Prémium ingatlanfejlesztő weboldal ───────────────────
  {
    id: '2026-HI-001',
    savedAt: Date.now(),
    clientName: 'Hürkecz Imre',
    subject: 'Katalógus weboldal – Prémium ingatlanfejlesztő (HU/EN/DE)',
    status: 'vazlat',
    state: {
      selectedPackageId: 'catalog',
      selectedExtras: {},
      customPrices: {},
      customSections: [
        { id: 'hi-cs1', name: 'Többnyelvűség (EN)', price: 0 },
        { id: 'hi-cs2', name: 'Többnyelvűség (DE)', price: 0 },
        { id: 'hi-cs3', name: 'SEO szövegírás (HU + EN + DE)', price: 0 },
        { id: 'hi-cs4', name: 'Hírlevél integráció (Brevo/Mailchimp)', price: 20000 },
        { id: 'hi-cs5', name: 'Before/after slider', price: 0 },
      ],
      customInstances: {
        'hogyan-mukodunk': [{ id: 'hi-hm1', name: 'Hogyan működünk', description: 'Vevői és eladói folyamat bemutatása párhuzamosan — bizalomépítő, differenciáló oldal', price: 25000 }],
        rolunk: [{ id: 'hi-r1', name: 'Rólunk', description: 'Cégbemutató, alapítói történet, értékek — személyes arc = bizalom', price: 35000 }],
        kapcsolat: [{ id: 'hi-k1', name: 'Kapcsolat', description: 'Visszahívás kérés, Google Maps embed, kapcsolati űrlap', price: 35000 }],
        gyik: [{ id: 'hi-g1', name: 'GYIK', description: 'Vevői + eladói kérdések — SEO értékkel és bizalomnövelő hatással', price: 25000 }],
        'felujitott-ingatlan-sablon': [{ id: 'hi-fi1', name: 'Felújított ingatlan sablon', description: 'Teljes fotógaléria, before/after slider, részletes specifikációs blokkok — 2. CPT sablon', price: 45000 }],
        'ingatlan-eladas-landing': [{ id: 'hi-iel1', name: 'Ingatlan vásárlás landing', description: 'Átfogó, kampányhoz közvetlenül hirdethető eladói lead oldal — egyedi árazás szükséges', price: 0 }],
      },
      quoteDetails: {
        clientName: 'Hürkecz Imre',
        clientEmail: 'kevin20140721@gmail.com',
        quoteId: '2026-HI-001',
        subject: 'Katalógus weboldal – Prémium ingatlanfejlesztő (HU/EN/DE)',
        estimatedTime: '8–10 hét',
        validityDays: 30,
        priorityMultiplier: 1,
        websiteUrl: '',
      },
      editablePackageContents: {
        pages: [
          { text: 'Főoldal', isNew: false },
          { text: 'Projektlistázó (szűrővel: állapot, típus, helyszín, ár)', isNew: false },
          { text: 'Felújítás alatt lévő ingatlan sablon', isNew: false },
          { text: 'Ajánlatkérés', isNew: false },
          { text: 'Kosár', isNew: false },
        ],
        features: [
          { text: 'CPT + ACF motor beállítása (egyedi ingatlan projekt mezők)', isNew: false },
          { text: 'Értesítési e-mailek létrehozása', isNew: false },
          { text: 'Ingatlan ajánlatkérési / foglalás kérés form', isNew: false },
          { text: 'Felhasználói regisztráció letiltása', isNew: false },
          { text: 'Ingatlanok feltöltése max. 10', isNew: false },
          { text: 'Menü beállítás', isNew: false },
          { text: 'CMS rendszer konfigurálás', isNew: false },
          { text: 'Cookie bar beállítása (GDPR)', isNew: false },
          { text: 'Alap SEO beállítások', isNew: false },
          { text: 'Prémium weboldal építő biztosítás (Lifetime license)', isNew: false },
          { text: 'Webbiztonsági plugin beállítása', isNew: false },
          { text: 'Reszponzív megjelenés (mobile-first)', isNew: false },
          { text: 'SMTP beállítás', isNew: false },
          { text: 'Kapcsolati űrlap', isNew: false },
          { text: 'Google Analytics integrálása', isNew: false },
          { text: 'Google Search Console – XML Sitemap + hreflang', isNew: false },
          { text: 'Nyelvváltó (HU ↔ EN ↔ DE)', isNew: true },
          { text: 'Ingatlan szűrő (állapot, típus, helyszín, ár)', isNew: true },
          { text: 'Eladói lead form (visszahívás kérés)', isNew: true },
        ],
      },
      selectedPlanId: null,
      selectedEliteExtensions: {},
      customElitePrices: {},
      status: 'vazlat',
      discountPercentage: 0,
    },
    researchContent: readResearch('Hurkecz_Imre_Web'),
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
