import { PackageId } from './types';

export interface SitemapSection {
  title: string;
  description?: string;
}

export interface SitemapPageNode {
  id: string;
  name: string;
  sections: SitemapSection[];
  children?: SitemapPageNode[];
}

const NAV: SitemapSection = { title: 'Navigációs sáv' };
const FOOTER: SitemapSection = { title: 'Lábléc (Footer)' };

// ====== LANDING ======
const LANDING_ROOT: SitemapPageNode = {
  id: 'kezdolap',
  name: 'Kezdőlap',
  sections: [
    NAV,
    { title: 'Hősfejléc szakasz', description: 'Hero szekció a fő üzenettel' },
    { title: 'Funkciólista szakasz', description: 'Főbb előnyök, funkciók' },
    { title: 'Cselekvésre ösztönzés szakasz', description: 'CTA szekció' },
    FOOTER,
  ],
};

// ====== INTRO ======
const INTRO_ROOT: SitemapPageNode = {
  id: 'kezdolap',
  name: 'Kezdőlap',
  sections: [
    NAV,
    { title: 'Hősfejléc szakasz', description: 'Hero szekció az üzenettel' },
    { title: 'Funkciólista szakasz', description: 'Szolgáltatások bemutatása' },
    { title: 'Cselekvésre ösztönzés szakasz', description: 'Kapcsolatfelvételi CTA' },
    FOOTER,
  ],
};

// ====== CATALOG ======
const CATALOG_ROOT: SitemapPageNode = {
  id: 'kezdolap',
  name: 'Kezdőlap',
  sections: [
    NAV,
    { title: 'Hősfejléc szakasz', description: 'Hero szekció kiemelt termékekkel' },
    { title: 'Termékkatalógus szakasz', description: 'Kiemelt termékek, kategóriák' },
    { title: 'Cselekvésre ösztönzés szakasz', description: 'Ajánlatkérési CTA' },
    FOOTER,
  ],
  children: [
    {
      id: 'termek-osszesito',
      name: 'Termékek (Üzlet)',
      sections: [
        NAV,
        { title: 'E-ker. terméklista szakasz', description: 'Terméklista szűrőkkel' },
        { title: 'E-ker. terméklista szakasz', description: 'Rendezési opciók' },
        FOOTER,
      ],
      children: [
        {
          id: 'termek-adatlap',
          name: 'Termék Adatlap (Sablon)',
          sections: [
            NAV,
            { title: 'E-ker. termék fejléc szakasz', description: 'Termék neve, ár, elérhetőség' },
            { title: 'Galéria szakasz', description: 'Termékfotók' },
            { title: 'E-ker. termékszakasz', description: 'Részletes leírás' },
            { title: 'Cselekvésre ösztönző űrlap', description: 'Ajánlatkérési űrlap' },
            FOOTER,
          ],
        },
      ],
    },
  ],
};

// ====== WEBSHOP ======
const WEBSHOP_ROOT: SitemapPageNode = {
  id: 'kezdolap',
  name: 'Kezdőlap',
  sections: [
    NAV,
    { title: 'Hősfejléc szakasz', description: 'Hero szekció kiemelt termékekkel' },
    { title: 'Funkciólista szakasz', description: 'Kiemelt kategóriák' },
    { title: 'Funkciólista szakasz', description: 'Legújabb termékek szekció' },
    { title: 'Cselekvésre ösztönzés szakasz', description: 'CTA (Vásárlásra ösztönzés)' },
    FOOTER,
  ],
  children: [
    {
      id: 'kategoria',
      name: 'Kategória Oldalak',
      sections: [
        NAV,
        { title: 'E-ker. terméklista szakasz', description: 'Alapvető szűrők (ár, népszerűség, raktár)' },
        { title: 'E-ker. terméklista szakasz', description: 'Rendezési opciók' },
        FOOTER,
      ],
      children: [
        {
          id: 'termeklist',
          name: 'Terméklista Oldalak',
          sections: [
            NAV,
            { title: 'E-ker. terméklista szakasz', description: 'Terméklista szűrőkkel és rendezéssel' },
            FOOTER,
          ],
        },
      ],
    },
    {
      id: 'termek-oldal',
      name: 'Termékoldalak',
      sections: [
        NAV,
        { title: 'E-ker. termék fejléc szakasz', description: 'Termék neve, ár, elérhetőség' },
        { title: 'E-ker. termékszakasz', description: 'Részletes leírás' },
        { title: 'Galéria szakasz', description: 'Fotók különböző szögekből' },
        { title: 'E-ker. termékszakasz', description: 'Választható opciók (méret, szín)' },
        { title: 'E-ker. termékszakasz', description: 'Kosárba tesz gomb' },
        { title: 'E-ker. termékszakasz', description: 'Készlet kijelzés' },
        { title: 'Vélemények szakasz', description: 'Felhasználói értékelések' },
        FOOTER,
      ],
    },
    {
      id: 'kosar',
      name: 'Kosár',
      sections: [
        NAV,
        { title: 'E-ker. termékszakasz', description: 'Kiválasztott termékek áttekintése' },
        { title: 'Funkció szakasz', description: 'Mennyiség módosítása' },
        { title: 'Cselekvésre ösztönző szakasz', description: 'Kuponkód beváltás' },
        FOOTER,
      ],
    },
    {
      id: 'penztar',
      name: 'Pénztár',
      sections: [
        NAV,
        { title: 'Pénztár fejléc szakasz', description: 'Rendelés összesítő' },
        { title: 'Cselekvésre ösztönző űrlap', description: 'Szállítási és számlázási adatok' },
        { title: 'Funkció szakasz', description: 'Fizetési módok' },
        FOOTER,
      ],
    },
  ],
};

// ====== EXTRA OLDALAK ======
export const EXTRA_PAGE_TEMPLATES: Record<string, SitemapPageNode> = {
  'blog-gyujto': {
    id: 'blog',
    name: 'Blog',
    sections: [
      NAV,
      { title: 'Blog fejléc szakasz', description: 'Blog főcím és leírás' },
      { title: 'Funkciólista szakasz', description: 'Blogbejegyzések listája kategóriákkal' },
      FOOTER,
    ],
    children: [
      {
        id: 'blog-cikk-oldal',
        name: 'Blog Cikk Oldal',
        sections: [
          NAV,
          { title: 'Blog cikk fejléc', description: 'Cikk címe, szerzője, dátuma' },
          { title: 'Szöveg szakasz', description: 'Cikk tartalma' },
          { title: 'Cselekvésre ösztönzés szakasz', description: 'Kapcsolódó cikkek' },
          FOOTER,
        ],
      },
    ],
  },
  'blog-cikk': {
    id: 'blog-cikk-sablon',
    name: 'Blog Cikk (Sablon)',
    sections: [
      NAV,
      { title: 'Blog cikk fejléc', description: 'Cikk címe, szerzője, dátuma' },
      { title: 'Szöveg szakasz', description: 'Cikk tartalma' },
      { title: 'Cselekvésre ösztönzés szakasz', description: 'Kapcsolódó cikkek' },
      FOOTER,
    ],
  },
  'kapcsolat': {
    id: 'kapcsolat',
    name: 'Kapcsolat',
    sections: [
      NAV,
      { title: 'Kapcsolat fejléc szakasz', description: 'Elérhetőségi adatok' },
      { title: 'Cselekvésre ösztönző űrlap', description: 'Kapcsolati űrlap' },
      { title: 'Térkép szakasz', description: 'Google Maps integráció' },
      FOOTER,
    ],
  },
  'rolunk': {
    id: 'rolunk',
    name: 'Rólunk',
    sections: [
      NAV,
      { title: 'Bemutatkozó szakasz', description: 'Cég története, missziója' },
      { title: 'Funkciólista szakasz', description: 'Értékek és előnyök' },
      { title: 'Csapat bemutatkozás', description: 'Csapattagok bemutatása' },
      FOOTER,
    ],
  },
  'szolgaltatas': {
    id: 'szolgaltatas',
    name: 'Szolgáltatás',
    sections: [
      NAV,
      { title: 'Fejléc szakasz', description: 'Szolgáltatás neve és leírása' },
      { title: 'Funkciólista szakasz', description: 'Részletes leírás, előnyök' },
      { title: 'Cselekvésre ösztönzés szakasz', description: 'Kapcsolatfelvételi CTA' },
      FOOTER,
    ],
  },
  'arak': {
    id: 'arak',
    name: 'Árak',
    sections: [
      NAV,
      { title: 'Árak fejléc szakasz', description: 'Csomagok összehasonlítása' },
      { title: 'Funkciólista szakasz', description: 'Részletes árlista' },
      { title: 'GYIK szakasz', description: 'Árazással kapcsolatos kérdések' },
      FOOTER,
    ],
  },
  'galeria': {
    id: 'galeria',
    name: 'Galéria',
    sections: [
      NAV,
      { title: 'Galéria fejléc szakasz', description: 'Galéria cím és bevezető' },
      { title: 'Galéria szakasz', description: 'Képek, videók megjelenítése' },
      FOOTER,
    ],
  },
  'referenciak-osszestio': {
    id: 'referenciak',
    name: 'Referenciák',
    sections: [
      NAV,
      { title: 'Referencia fejléc', description: 'Korábbi munkák bemutatása' },
      { title: 'Funkciólista szakasz', description: 'Referenciák listája' },
      FOOTER,
    ],
  },
  'referencia-sablon': {
    id: 'referencia-sablon',
    name: 'Referencia (Sablon)',
    sections: [
      NAV,
      { title: 'Referencia fejléc', description: 'Projekt neve és összefoglalója' },
      { title: 'Tartalom szakasz', description: 'Projekt részletek, eredmények' },
      { title: 'Galéria szakasz', description: 'Projekt képek' },
      FOOTER,
    ],
  },
  'karrier': {
    id: 'karrier',
    name: 'Karrier',
    sections: [
      NAV,
      { title: 'Karrier fejléc szakasz', description: 'Munkakultúra bemutatása' },
      { title: 'Funkciólista szakasz', description: 'Nyitott pozíciók' },
      { title: 'Cselekvésre ösztönző szakasz', description: 'Jelentkezési lehetőség' },
      FOOTER,
    ],
  },
  'gyik': {
    id: 'gyik',
    name: 'GYIK',
    sections: [
      NAV,
      { title: 'GYIK fejléc szakasz', description: 'Leggyakoribb kérdések' },
      { title: 'Tartalom szakasz', description: 'Kérdés-válasz párok' },
      FOOTER,
    ],
  },
  'csapatunk': {
    id: 'csapatunk',
    name: 'Csapatunk',
    sections: [
      NAV,
      { title: 'Csapat fejléc szakasz', description: 'Csapat bemutatkozása' },
      { title: 'Csapat tagok szakasz', description: 'Csapattagok kártyái fotóval' },
      FOOTER,
    ],
  },
  'csapatunk-aloldal': {
    id: 'csapatunk-aloldal',
    name: 'Csapattag Profil (Sablon)',
    sections: [
      NAV,
      { title: 'Profil fejléc szakasz', description: 'Név, pozíció, fotó' },
      { title: 'Bemutatkozó szakasz', description: 'Részletes bemutatkozás' },
      FOOTER,
    ],
  },
  'partnereink': {
    id: 'partnereink',
    name: 'Partnereink',
    sections: [
      NAV,
      { title: 'Partnerek szakasz', description: 'Partner logók és leírások' },
      FOOTER,
    ],
  },
  'letoltheto-dokumentumok': {
    id: 'letoltesek',
    name: 'Letöltések',
    sections: [
      NAV,
      { title: 'Letöltések fejléc', description: 'Elérhető dokumentumok listája' },
      { title: 'Dokumentum letöltő szakasz', description: 'Letölthető fájlok' },
      FOOTER,
    ],
  },
  'blog-archivum': {
    id: 'blog-archivum',
    name: 'Blog Archívum',
    sections: [
      NAV,
      { title: 'Archívum fejléc szakasz', description: 'Korábbi bejegyzések' },
      { title: 'Funkciólista szakasz', description: 'Bejegyzések időrendi listája' },
      FOOTER,
    ],
  },
  'kategoria-oldal': {
    id: 'kategoria-oldal',
    name: 'Kategória Oldal',
    sections: [
      NAV,
      { title: 'Kategória fejléc szakasz', description: 'Kategória neve és leírása' },
      { title: 'E-ker. terméklista szakasz', description: 'Termékek szűrőkkel és rendezéssel' },
      FOOTER,
    ],
  },
};

// Rendszer oldalak (mindig jelen vannak)
export const SYSTEM_PAGES: SitemapPageNode[] = [
  {
    id: 'koszonо',
    name: 'Köszönő Oldal',
    sections: [
      NAV,
      { title: 'Köszönet szakasz', description: 'Sikeres konverzió visszajelzés' },
      FOOTER,
    ],
  },
  {
    id: '404',
    name: '404 Hiba Oldal',
    sections: [
      NAV,
      { title: 'Hibaoldal szakasz', description: 'Felhasználóbarát hibaüzenet' },
      FOOTER,
    ],
  },
  {
    id: 'gdpr',
    name: 'GDPR / Jogi Oldalak',
    sections: [
      NAV,
      { title: 'Jogi szöveg szakasz', description: 'Adatkezelés, ÁSZF, Impresszum, Cookie' },
      FOOTER,
    ],
  },
];

export const BASE_SITEMAPS: Partial<Record<PackageId, SitemapPageNode>> = {
  [PackageId.LANDING]: LANDING_ROOT,
  [PackageId.INTRO]: INTRO_ROOT,
  [PackageId.CATALOG]: CATALOG_ROOT,
  [PackageId.WEBSHOP]: WEBSHOP_ROOT,
};

export const generateSitemapFromQuote = (
  packageId: PackageId | null,
  selectedExtras: Record<string, boolean>,
  customInstances: Record<string, { id: string; name: string; description: string }[]>
): { root: SitemapPageNode; extraPages: SitemapPageNode[]; systemPages: SitemapPageNode[] } | null => {
  if (!packageId || !BASE_SITEMAPS[packageId]) return null;

  const root = JSON.parse(JSON.stringify(BASE_SITEMAPS[packageId])) as SitemapPageNode;
  const extraPages: SitemapPageNode[] = [];
  const addedIds = new Set<string>();

  Object.keys(selectedExtras).forEach(extraId => {
    if (!selectedExtras[extraId]) return;

    if (customInstances[extraId] && customInstances[extraId].length > 0) {
      const template = EXTRA_PAGE_TEMPLATES[extraId];
      if (template) {
        customInstances[extraId].forEach(instance => {
          const page = {
            ...JSON.parse(JSON.stringify(template)),
            id: `${extraId}-${instance.id}`,
            name: instance.name || template.name,
          };
          extraPages.push(page);
          addedIds.add(extraId);
        });
      }
    } else if (EXTRA_PAGE_TEMPLATES[extraId] && !addedIds.has(extraId)) {
      extraPages.push(JSON.parse(JSON.stringify(EXTRA_PAGE_TEMPLATES[extraId])));
      addedIds.add(extraId);
    }
  });

  return { root, extraPages, systemPages: SYSTEM_PAGES };
};
