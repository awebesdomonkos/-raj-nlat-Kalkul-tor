import { BasePackage, Extra, BonusPage, PackageId, PriceType, PackageFeatures, MaintenancePlan, EliteExtension } from './types';

export const HOURLY_RATE = 20000;

export const BASE_PACKAGES: BasePackage[] = [
  { id: PackageId.LANDING, name: 'Landing oldal', price: 255000, description: 'Ideális választás kampányokhoz vagy termékbemutatókhoz. Egyetlen, hosszú oldalból áll, amely szekciókra van osztva. Nem tartalmaz külön aloldalakat, minden tartalom a főoldalon kap helyet.' },
  { id: PackageId.INTRO, name: 'Bemutatkozó weboldal', price: 255000, description: 'Kiváló alap egy vállalkozás online jelenlétéhez. A csomag a főoldal elkészítését tartalmazza, amelyhez tetszőlegesen adhatók hozzá további aloldalak (pl. Rólunk, Kapcsolat) az extrák közül.' },
  { id: PackageId.CATALOG, name: 'Katalógus weboldal', price: 320000, description: 'Termékek bemutatására szolgál, vásárlási funkció nélkül. Az ügyfelek böngészhetik a kínálatot és ajánlatot kérhetnek. A csomag a főoldalt, terméklistázót és adatlap sablont tartalmazza, 10 termék feltöltésével.' },
  { id: PackageId.WEBSHOP, name: 'Webshop', price: 400000, description: 'Komplett, online értékesítésre kész webáruház, amely tartalmazza a legfontosabb funkciókat: kosár, pénztár, online fizetési lehetőségek és felhasználói fiókok.' },
  { id: PackageId.MAINTENANCE, name: 'Ad hoc weboldal karbantartás', price: 90000, description: 'Eseti megbízású karbantartás, ha weboldalával probléma adódott. Magában foglalja a rendszerfrissítést, biztonsági mentést és alapvető sebességoptimalizálást, garanciával.' },
  { id: PackageId.CONTINUOUS_MAINTENANCE, name: 'Folyamatos weboldal karbantartás', price: 20000, description: 'Gondoskodjon weboldala hosszú távú biztonságáról havidíjas csomagjainkkal. A szolgáltatás rendszeres frissítéseket, mentéseket és hibaelhárítást tartalmaz. Az alapár a Smart csomagra vonatkozik.' },
];

export const MAINTENANCE_PLANS: MaintenancePlan[] = [
    {
        id: 'smart',
        name: 'Smart Maintenance',
        price: 20000,
        description: 'Alapvető karbantartás a biztonságos és naprakész weboldalért.',
        features: [
            { name: 'WordPress, bővítmények és sablonok verziójának frissítése és működésük ellenőrzése', description: 'Rendszeresen ellenőrzöm és telepítem az új frissítéseket a weboldal tartalomkezelő rendszerében (pl. WordPress), a bővítményekben és a sablonokban. Ez a biztonságos és zavartalan működés érdekében szükséges.' },
            { name: 'Frissítések során esetlegesen felmerülő kompatibilitási hibajelenségek kezelése és megoldása', description: 'Amennyiben frissítés után problémák jelentkeznek a weboldalon (pl. nem megfelelően működő funkció), kezelem és javítom ezeket a hibákat.' },
            { name: 'Havi 2 rendszerességű weboldal biztonsági mentések', description: 'A weboldaladról készült biztonsági mentések számát a választott csomag határozza meg, minden esetben 60 napig tárolom őket, biztosítva az adatok biztonságát és a helyreállítás lehetőségét. Az e-mailek és a tárhelyen lévő egyéb fájlok nem kerülnek mentésre.' },
            { name: 'Havi riport készítése a frissítésekről és az oldal naprakész állapotáról', description: 'Rendszeresen küldök jelentéseket, amelyekben tájékoztatlak a végrehajtott frissítésekről és a weboldal jelenlegi állapotáról.' },
        ]
    },
    {
        id: 'pro',
        name: 'Pro Performance',
        price: 35000,
        description: 'Teljes körű karbantartás, teljesítményoptimalizálással, biztonsági funkciókkal és dedikált támogatással.',
        features: [
            { name: 'WordPress, bővítmények és sablonok verziójának frissítése és működésük ellenőrzése', description: 'Rendszeresen ellenőrzöm és telepítem az új frissítéseket a weboldal tartalomkezelő rendszerében (pl. WordPress), a bővítményekben és a sablonokban. Ez a biztonságos és zavartalan működés érdekében szükséges.' },
            { name: 'Frissítések során esetlegesen felmerülő kompatibilitási hibajelenségek kezelése és megoldása', description: 'Amennyiben frissítés után problémák jelentkeznek a weboldalon (pl. nem megfelelően működő funkció), kezelem és javítom ezeket a hibákat.' },
            { name: 'Heti 2 rendszerességű weboldal biztonsági mentések', description: 'A weboldaladról készült biztonsági mentések számát a választott csomag határozza meg, minden esetben 60 napig tárolom őket, biztosítva az adatok biztonságát és a helyreállítás lehetőségét. Az e-mailek és a tárhelyen lévő egyéb fájlok nem kerülnek mentésre.' },
            { name: 'Havi riport készítése a frissítésekről és az oldal naprakész állapotáról', description: 'Rendszeresen küldök jelentéseket, amelyekben tájékoztatlak a végrehajtott frissítésekről és a weboldal jelenlegi állapotáról.' },
            { name: 'E-mail fiókok kezelése és levelező kliensek konfigurálása', description: 'Segítek e-mail fiókokat létrehozni a weboldalhoz kapcsolódóan, valamint konfigurálom a kiválasztott levelező klienseket (Gmail, Thunderbird, Mail, Outlook stb.) a megfelelő beállításokkal.' },
            { name: 'Prémium webbiztonsági bővítmény telepítése és konfigurálása', description: 'Telepítek és beállítok egy prémium szintű webbiztonsági bővítményt, amely segít megelőzni a hackelési kísérleteket és növeli a weboldal biztonságát.' },
            { name: 'Tárhellyel kapcsolatos ügyintézés és problémamegoldás', description: 'Foglalkozom a weboldal tárhellyel kapcsolatos ügyintézésekkel, például a tárhely méretének növelésével vagy problémák megoldásával.' },
            { name: 'Weboldal adatbázisának tisztítása', description: 'A weboldal adatbázisának rendszerez tisztítása célja az elavult, felesleges vagy hibás adatok eltávolítása, például rekordok ellenőrzése, duplikátumok kiszűrése és inaktív adatok archiválása vagy törlése révén. Ez növeli a teljesítményt, biztosítja az adatvédelmet és megfelel a jogi követelményeknek. Összességében fontos lépés a weboldal hatékony működése és adatbiztonsága szempontjából.' },
            { name: 'Weboldal feltörés esetén vírusirtás és helyreállítás', description: 'Ha a weboldalad feltörik vagy más tárhellyel kapcsolatos probléma merül fel, visszaállítom a weboldalt az előző biztonságos állapotára munkaidőben legkésőbb 12 órán belül.' },
            { name: 'Meglévő tartalmak kisebb módosításai', description: 'Elvégzek apróbb változtatásokat a meglévő weboldal tartalmakban (pl. szövegek, képek cseréje vagy frissítése) igényeid szerint.' },
        ]
    }
];

export const ELITE_EXTENSIONS: EliteExtension[] = [
    { 
        id: 'premium_plugin_updates', 
        name: 'Prémium Pro bővítmények frissítése', 
        description: 'Segítek a megfelelő bővítmények kiválasztásában, hogy weboldalad maximálisan kihasználhassa a prémium funkciókat. A telepített bővítményekért nem kell külön vásárlási díjat vagy éves előfizetési díjat fizetned, hiszen ezeket én biztosítom. Folyamatosan ellenőrzöm, és telepítem az elérhető új verziókat, hogy a legújabb fejlesztéseket használd.', 
        priceOneTime: 0,
        priceMonthly: 2500,
        priceOneTimeDisplay: '-',
        priceMonthlyDisplay: '2 500 Ft'
    },
    { 
        id: 'speed_optimization', 
        name: 'Weboldal betöltési sebességének optimalizálása', 
        description: 'A weboldal betöltési sebességét elemzem, és olyan technikai beállításokat végzek, amelyek gyorsítják a működést. Ez egyszeri alkalommal vagy folyamatos optimalizálásként is igénybe vehető, hogy a látogatók számára gyors és zökkenőmentes élményt biztosíts.', 
        priceOneTime: 50000,
        priceMonthly: 4000,
        priceOneTimeDisplay: '50 000 Ft-tól / alkalom',
        priceMonthlyDisplay: '4 000 Ft'
    },
    { 
        id: 'new_content_creation', 
        name: 'Új tartalmak létrehozása a meglévők mellé', 
        description: 'Igényednek megfelelően új tartalmi elemeket hozok létre melyek összhangban vannak jelenlegi weboldalad designoddal is. Ez lehet szöveg, kép vagy bármilyen más típusú tartalom, amely hozzáadott értéket képvisel a weboldalad számára.', 
        priceOneTime: 15000,
        priceMonthly: 3000,
        priceOneTimeDisplay: '15 000 Ft-tól',
        priceMonthlyDisplay: '3 000 Ft – 5 000 Ft'
    },
    { 
        id: 'urgent_issue_handling', 
        name: 'Váratlan problémák gyors és sürgős kezelése', 
        description: 'Váratlan technikai hibákat esetén prioritásként kezelem az ügyed és a legrövidebb időn belül igyekszem megoldani a problémát. Így elkerülhető, hogy a weboldalad hosszabb ideig használhatatlan legyen, vagy negatív hatással legyen a felhasználókra.', 
        priceOneTime: 35000,
        priceMonthly: 5000,
        priceOneTimeDisplay: '35 000 Ft / óra',
        priceMonthlyDisplay: '5 000 Ft'
    },
    { 
        id: 'analytics_reporting', 
        name: 'Analitikai és eseménynapló riportok készítése', 
        description: 'Rendszeresen elkészítem az analitikai jelentéseket, amelyek megmutatják a weboldalad teljesítményét, forgalmát és a felhasználók viselkedését. Ezek alapján pontosan látható, milyen változtatások segítenék a növekedést.', 
        priceOneTime: 30000,
        priceMonthly: 1000,
        priceOneTimeDisplay: '30 000 Ft-tól / alkalom',
        priceMonthlyDisplay: '1 000 Ft – 3 000 Ft'
    },
    { 
        id: 'heatmap_analysis', 
        name: 'Felhasználói hőtérkép konfigurálása és elemzése', 
        description: 'Beállítom és elemzem a hőtérképet, amely vizualizálja a látogatók kattintásait és mozgását a weboldalon. Ez segít megérteni, mely területek vonzzák leginkább a figyelmet, és hol szükséges fejlesztés.', 
        priceOneTime: 40000,
        priceMonthly: 1500,
        priceOneTimeDisplay: '40 000 Ft-tól / alkalom',
        priceMonthlyDisplay: '1 500 Ft – 2 500 Ft'
    },
    { 
        id: 'internal_crm_management', 
        name: 'Belső CRM rendszer beállítása és menedzselése', 
        description: 'Lehetővé teszi a felhasználói kapcsolatok nyomon követését, automatizált e-mail kampányok létrehozását, marketingfolyamatok kezelését és elemzését. Ideális válasz e-mail marketinghez, ügyfélszegmentáláshoz és személyre szabott kampányok lebonyolításához.', 
        priceOneTime: 50000,
        priceMonthly: 2000,
        priceOneTimeDisplay: '50 000 Ft-tól',
        priceMonthlyDisplay: '2 000 Ft'
    },
    { 
        id: 'product_database_upload', 
        name: 'Termékek adatbázisba történő feltöltése', 
        description: 'Lehetőséged van arra, hogy a termékek feltöltését is rám bízd. Egy általad meghatározott havi/éves kvótát közösen meghatározunk és ezeket a termékeket feltöltöm beleértve az általad küldött képeket, leírásokat és egyéb releváns információkat.', 
        priceOneTime: 500,
        priceMonthly: 3500,
        priceOneTimeDisplay: '500 Ft – 2 000 Ft / termék',
        priceMonthlyDisplay: '3 500 Ft'
    },
    { 
        id: 'increased_backup_frequency', 
        name: 'Weboldal biztonsági mentések gyakoriságának növelése', 
        description: `Az alap szolgáltatásban foglalt mentéseken felül lehetőség van sűrűbb mentésekre is, hogy adatai még nagyobb biztonságban legyenek. Az igényeinek megfelelően választhat a következő opciók közül:

- Heti mentés (1 000 – 1 500 Ft/hó)
  Tárolási idő: 60 – 90 nap
  Ajánlott: Kisebb weboldalakhoz.

- Napi mentés (1 500 – 3 000 Ft/hó)
  Tárolási idő: 14 – 30 nap
  Ajánlott: Közepes méretű oldalaknak, a leggyakoribb igény.

- Óránkénti mentés (5 000 – 10 000 Ft/hó)
  Tárolási idő: 7 – 14 nap
  Ajánlott: Nagy forgalmú, kritikus fontosságú oldalakhoz (pl. webshopok).

A kiválasztott opció pontos díja a konzultáció során kerül véglegesítésre.`, 
        priceOneTime: 10000,
        priceMonthly: 1000,
        priceOneTimeDisplay: '10 000 Ft / alkalom',
        priceMonthlyDisplay: '1 000 Ft – 10 000 Ft'
    },
    { 
        id: 'bug_reproduction_fixing', 
        name: 'Vásárlói hibák elemzése, reprodukálása és kijavítása', 
        description: 'Részletesen elemzem a vásárló által jelzett hibákat, reprodukálom azokat a tesztkörnyezetben, majd elvégzem a szükséges javításokat. Ez biztosítja, hogy a weboldalad használata zavartalan és felhasználóbarát legyen.', 
        priceOneTime: 20000,
        priceMonthly: 2500,
        priceOneTimeDisplay: '20 000 Ft / alkalom',
        priceMonthlyDisplay: '2 500 Ft – 5 000 Ft'
    }
];


export const EXTRAS: Extra[] = [
  // A) Oldalak fejlesztése
  { id: 'szolgaltatas', category: 'oldalak', name: 'Szolgáltatás', description: 'Egyedi oldal a kínált szolgáltatások részletes bemutatására.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'szolgaltatas-aloldal', category: 'oldalak', name: 'Szolgáltatás aloldal (Sablon)', description: 'Sablon oldal egy-egy specifikus szolgáltatás részletezéséhez, egységes megjelenéssel.', price: 35000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'blog-gyujto', category: 'oldalak', name: 'Blog gyűjtőoldal', description: 'A blogbejegyzéseket listázó főoldal, kategóriákkal és keresési lehetőséggel.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'blog-cikk', category: 'oldalak', name: 'Blog cikk oldal (Sablon)', description: 'Egységes sablon az egyes blogcikkek megjelenítésére, olvasóbarát formátumban.', price: 45000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'termek-oldal-sablon', category: 'oldalak', name: 'Egységes termék oldal', description: 'Egységes sablon az egyes termékek megjelenítésére, ahol a struktúra változatlan, de a tartalom dinamikusan cserélődik.', price: 45000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'kategoria-oldal', category: 'oldalak', name: 'Kategória oldal', description: 'Termékek listázása egy adott kategória alapján, szűrési és rendezési lehetőségekkel.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'blog-archivum', category: 'oldalak', name: 'Blog Archívum oldal', description: 'Régebbi bejegyzések elérését biztosító oldal, időrendi vagy kategória alapú bontásban.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'csapatunk', category: 'oldalak', name: 'Csapatunk', description: 'A cég munkatársainak bemutatása, fotóval és rövid leírással.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'csapatunk-aloldal', category: 'oldalak', name: 'Csapatunk aloldal (Sablon)', description: 'Egy-egy csapattag részletesebb bemutatkozó oldala, egységes sablon alapján.', price: 35000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'arak', category: 'oldalak', name: 'Árak', description: 'Áttekinthető ártáblázat a szolgáltatásokról és termékekről.', price: 45000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'kapcsolat', category: 'oldalak', name: 'Kapcsolat', description: 'Kapcsolati űrlap, térkép és elérhetőségi adatok megjelenítése.', price: 35000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'karrier', category: 'oldalak', name: 'Karrier', description: 'Aktuális állásajánlatok és a jelentkezéshez szükséges információk.', price: 35000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'partnereink', category: 'oldalak', name: 'Partnereink', description: 'A cég partnereinek, ügyfeleinek logóval és linkkel történő felsorolása.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'gyik', category: 'oldalak', name: 'GYIK', description: 'Gyakran Ismételt Kérdések és válaszok, a könnyebb tájékozódásért.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'rolunk', category: 'oldalak', name: 'Rólunk', description: 'A cég történetének, küldetésének és értékeinek bemutatása.', price: 35000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'referenciak-osszestio', category: 'oldalak', name: 'Referenciák összesítő', description: 'Összegyűjti és listázza az összes referenciát vagy esettanulmányt egy áttekinthető oldalon.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'referencia-sablon', category: 'oldalak', name: 'Referencia sablon oldal', description: 'Egységes sablon az egyes referenciák részletes bemutatására. A dizájn állandó, csak a tartalom (szöveg, képek) cserélődik.', price: 45000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'galeria', category: 'oldalak', name: 'Galéria', description: 'Ide töltheti fel képeit, amiket csak szeretne. Például a szolgáltatásával vagy szolgáltatásaival kapcsolatban.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'letoltheto-dokumentumok', category: 'oldalak', name: 'Letölthető dokumentumok', description: 'Fontos dokumentumok (pl. ÁSZF, brosúrák) listázása és letöltési lehetőség biztosítása.', price: 25000, type: PriceType.FIXED, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },

  // B) Webshop Extra Funkciók
  { id: 'elofizetoi-rendszer', category: 'webshop', name: 'Előfizetői rendszer', description: 'Ismétlődő fizetéseket kezelő rendszer termékekre vagy szolgáltatásokra.', price: 0, type: PriceType.CUSTOM, availableFor: [PackageId.WEBSHOP] },
  { id: 'termek-kereso', category: 'webshop', name: 'Termék kereső', description: 'Fejlett keresőfunkció, amely segít a látogatóknak gyorsan megtalálni a termékeket.', price: 12500, type: PriceType.FROM, availableFor: [PackageId.WEBSHOP] },
  { id: 'automatikus-szamlazas', category: 'webshop', name: 'Automatikus számlázás (Billingo, Számlázz.hu)', description: 'Integráció számlázó programokkal a vásárlások utáni automatikus számlageneráláshoz.', price: 20000, type: PriceType.FIXED, availableFor: [PackageId.WEBSHOP] },
  { id: 'termek-kerdesek', category: 'webshop', name: 'Termék kérdések és válaszok', description: 'Vásárlók kérdéseket tehetnek fel a termékoldalon, melyekre a bolt válaszolhat.', price: 20000, type: PriceType.FIXED, availableFor: [PackageId.WEBSHOP] },
  { id: 'egyeb-tartalom-feltoltes', category: 'webshop', name: 'Egyéb tartalom feltöltés', description: 'További oldalak vagy tartalmak feltöltése a webshopba, díja oldalanként értendő.', price: 4500, type: PriceType.FIXED, unit: '/oldal', availableFor: [PackageId.WEBSHOP] },
  { id: 'termek-csomagajanlatok', category: 'webshop', name: 'Termék csomagajánlatok', description: 'Több termék együttes, kedvezményes áron történő értékesítése.', price: 30000, type: PriceType.FROM, availableFor: [PackageId.WEBSHOP] },
  { id: 'bulk-product-import-export', category: 'webshop', name: 'Tömeges termék import/export', description: 'Nagyobb mennyiségű termékadat (név, ár, leírás, készlet) gyors és hatékony kezelése CSV vagy XML fájlok segítségével. Ideális a kezdeti termékfeltöltéshez vagy a készlet rendszeres frissítéséhez.', price: 45000, type: PriceType.FROM, availableFor: [PackageId.WEBSHOP] },
  { id: 'suly-alapu-szallitas', category: 'webshop', name: 'Súly alapú szállítás (kalkuláció)', description: 'A szállítási díj automatikus kalkulációja a kosárban lévő termékek összsúlya alapján.', price: 0, type: PriceType.HOURLY, availableFor: [PackageId.WEBSHOP] },
  { id: 'akciok-kuponok', category: 'webshop', name: 'Akciók, Kuponok', description: 'Időszakos akciók és egyedi kuponkódok létrehozásának és kezelésének lehetősége.', price: 0, type: PriceType.HOURLY, availableFor: [PackageId.WEBSHOP] },
  { id: 'viszonteladoi-csoportok', category: 'webshop', name: 'Viszonteladói csoportok, árak', description: 'Különböző viszonteladói szintek létrehozása, egyedi árakkal és kedvezményekkel.', price: 0, type: PriceType.HOURLY, availableFor: [PackageId.WEBSHOP] },
  { id: 'bovitett-raktarkeszlet', category: 'webshop', name: 'Bővített raktárkészlet kezelő', description: 'Több raktár vagy összetett készletkezelési logika (pl. beszállítói készlet) kezelése.', price: 0, type: PriceType.HOURLY, availableFor: [PackageId.WEBSHOP] },
  { id: 'termek-szuro', category: 'webshop', name: 'Termék szűrő', description: 'Részletes szűrési lehetőségek a terméklistázó oldalakon (pl. ár, szín, méret szerint).', price: 0, type: PriceType.HOURLY, availableFor: [PackageId.WEBSHOP] },
  { id: 'husegprogram', category: 'webshop', name: 'Hűségprogram/Pontgyűjtés', description: 'Vásárlás utáni pontgyűjtés, melyet a vásárlók kedvezményekre válthatnak.', price: 0, type: PriceType.HOURLY, availableFor: [PackageId.WEBSHOP] },
  { id: 'egyedi-szallitas', category: 'webshop', name: 'Egyedi szállítási lehetőség és értesítő email', description: 'Standardtól eltérő szállítási módok (pl. bolti átvétel) és kapcsolódó értesítők beállítása.', price: 0, type: PriceType.FREE, availableFor: [PackageId.WEBSHOP] },
  { id: 'termek-upsell', category: 'webshop', name: 'Termék upsell, cross sell', description: 'Kapcsolódó vagy drágább termékek ajánlása a vásárlási folyamat során.', price: 0, type: PriceType.FREE, availableFor: [PackageId.WEBSHOP] },

  // D) Általános Extra Funkciók
  { id: 'multilingualism', category: 'altalanos', name: 'Többnyelvűség (új nyelv hozzáadása)', description: 'Új nyelv hozzáadása a weboldalhoz. Az ár a fordítandó tartalom mennyiségétől függ. Minden hozzáadott nyelvhez egyedi, becsült díjat adhat meg.', price: 0, type: PriceType.CUSTOM, availableFor: [PackageId.LANDING, PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
  { id: 'hirlevel-feliratkozas', category: 'altalanos', name: 'Hírlevél feliratkozás beállítása', description: 'Hírlevélküldő rendszer (pl. Mailchimp) integrációja és feliratkozó űrlapok elhelyezése.', price: 20000, type: PriceType.FIXED, availableFor: [PackageId.LANDING, PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP] },
  { id: 'belso-crm', category: 'altalanos', name: 'Belső Automatizált CRM kialakítás', description: 'Ügyfélkapcsolat-kezelő rendszer kiépítése a weboldalon belül (pl. űrlap beküldések kezelése).', price: 50000, type: PriceType.FROM, availableFor: [PackageId.LANDING, PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP] },
  { id: 'egyedi-tartalomtipus', category: 'altalanos', name: 'Egyedi tartalomtípus + Egyedi mezők', description: 'Speciális, ismétlődő tartalmak (pl. események, portfólió elemek) létrehozása saját adatszerkezettel.', price: 20000, type: PriceType.FROM, availableFor: [PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP] },
  { id: 'beagyazhato-pdf', category: 'altalanos', name: 'Beágyazható PDF, előnézettel', description: 'PDF dokumentumok lapozható, előnézeti formában történő beágyazása az oldalba.', price: 20000, type: PriceType.FROM, availableFor: [PackageId.LANDING, PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP] },
  { id: 'idopontfoglalo', category: 'altalanos', name: 'Időpontfoglaló rendszer beállítása', description: 'Online időpontfoglalási rendszer integrálása, naptár szinkronizációval.', price: 50000, type: PriceType.FROM, availableFor: [PackageId.LANDING, PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP] },
  { id: 'tovabbi-oradij', category: 'altalanos', name: 'További óradíj', description: 'Egyedi fejlesztési igények, konzultáció vagy egyéb, nem listázott feladatok elvégzése óradíjas alapon.', price: 0, type: PriceType.HOURLY, availableFor: [PackageId.LANDING, PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP] },
  { id: 'egyedi-fejlesztes', category: 'altalanos', name: 'Egyedi fejlesztés (AI által javasolt)', description: 'A projektleírás alapján az AI által javasolt egyedi funkció vagy aloldal.', price: 0, type: PriceType.CUSTOM, availableFor: [PackageId.LANDING, PackageId.INTRO, PackageId.CATALOG, PackageId.WEBSHOP], isInstantiable: true },
];

export const BONUS_PAGES: BonusPage[] = [
    { id: 'koszono', name: 'Köszönő oldal', description: 'Konverzió méréshez' },
    { id: '404', name: '404 Hiba oldal', description: 'Egyedi hibaoldal' },
    { id: 'gdpr', name: 'GDPR oldalak', description: 'Adatkezelés, ÁSZF, Impresszum, Cookie' },
];

export const PACKAGE_FEATURES: Record<PackageId, PackageFeatures> = {
  [PackageId.LANDING]: {
    pages: ['Főoldal'],
    features: [
      'Menü beállítás',
      'CMS rendszer konfigurálás',
      'Cookie bar beállítása (GDPR)',
      'Alap SEO beállítások',
      'Prémium weboldal építő biztosítás (Lifetime license)',
      'Webbiztonsági plugin beállítása',
      'Felhasználói tevékenységi log',
      'Lokális font hosztolás',
      'Képek optimalizálása',
      'Reszponzív megjelenés',
      'SMTP beállítás',
      'Kapcsolati űrlap',
      'Facebook pixel integrálása',
      'Google Analytics integrálása',
      'Google Search - XML Sitemap beállítása',
    ],
  },
  [PackageId.INTRO]: {
    pages: ['Főoldal'],
    features: [
      'Menü beállítás',
      'CMS rendszer konfigurálás',
      'Cookie bar beállítása (GDPR)',
      'Alap SEO beállítások',
      'Prémium weboldal építő biztosítás (Lifetime license)',
      'Webbiztonsági plugin beállítása',
      'Felhasználói tevékenységi log',
      'Lokális font hosztolás',
      'Képek optimalizálása',
      'Reszponzív megjelenés',
      'SMTP beállítás',
      'Kapcsolati űrlap',
      'Facebook pixel integrálása',
      'Google Analytics integrálása',
      'Google Search - XML Sitemap beállítása',
    ],
  },
  [PackageId.CATALOG]: {
    pages: [
      'Főoldal',
      'Termék összesítő (Üzlet)',
      'Egységes termék sablon oldal (1db)',
      'Pénztár (Ajánlatkérés)',
      'Kosár',
    ],
    features: [
      'Webshop motor beállítása (Woocommerce)',
      'Értesítési e-mailek létrehozása',
      'Termék ajánlatkérési űrlap létrehozása',
      'Felhasználói regisztráció letiltása',
      'Fizetési és szállítási funkciók kikapcsolása',
      'Termékek feltöltése max. 10',
      'Menü beállítás',
      'CMS rendszer konfigurálás',
      'Cookie bar beállítása (GDPR)',
      'Alap SEO beállítások',
      'Prémium weboldal építő biztosítás (Lifetime license)',
      'Webbiztonsági plugin beállítása',
      'Felhasználói tevékenységi log',
      'Lokális font hosztolás',
      'Képek optimalizálása',
      'Reszponzív megjelenés',
      'SMTP beállítás',
      'Kapcsolati űrlap',
      'Facebook pixel integrálása',
      'Google Analytics integrálása',
      'Google Search - XML Sitemap beállítása',
    ],
  },
  [PackageId.WEBSHOP]: {
    pages: [
      'Főoldal',
      'Egységes termék oldal (1db)',
      'Termék összesítő (Üzlet)',
      'Pénztár',
      'Kosár',
    ],
    features: [
      'Vásárlói fiók',
      'Menü beállítás',
      'CMS rendszer konfigurálás',
      'Cookie bar beállítása (GDPR)',
      'Alap SEO beállítások',
      'Prémium weboldal építő biztosítás (Lifetime license)',
      'Webbiztonsági plugin beállítása',
      'Felhasználói tevékenységi log',
      'Lokális font hosztolás',
      'Képek optimalizálása',
      'Reszponzív megjelenés',
      'SMTP beállítás',
      'Kapcsolati űrlap',
      'Facebook pixel integrálása',
      'Google Analytics integrálása',
      'Google Search - XML Sitemap beállítása',
      'Szállítási osztály beállítása',
      'Utalásos fizetés',
      'Kártyás fizetés',
      'Utánvétes fizetés',
    ],
  },
  [PackageId.MAINTENANCE]: {
    pages: [],
    features: [
      'Alapvető Stabilitási Frissítések (WordPress mag, bővítmények, PHP)',
      'Oldalgyorsítás és Optimalizálás (Gyorsítótárazás, előtöltés)',
      'Garancia: Azonnali Visszaállítás Mentésből hiba esetén',
      'Garancia: Frissítési Hiba Elhárítása (Debugging)',
      'Garancia: Kockázatkezelési Felelősségvállalás',
    ],
  },
  [PackageId.CONTINUOUS_MAINTENANCE]: {
    pages: [],
    features: [],
  },
};

export const LANDING_PAGE_SECTIONS: string[] = [
  'Navigáció (Rögzített/Horgony)',
  'Hős szekció (Hero Section)',
  'Fő Call-to-Action (CTA)',
  'Rólunk / Bemutatkozás',
  'Szolgáltatások / Termékek',
  'Előnyök / Miért mi?',
  'Folyamat / Lépések',
  'Portfólió / Referenciák',
  'Esettanulmányok',
  'Visszajelzések / Testimonial',
  'Árak / Csomagok',
  'Csapat bemutatása',
  'GYIK (Gyakran Ismételt Kérdések)',
  'Kapcsolat (Űrlap)',
  'Elérhetőségek',
  'Másodlagos CTA',
  'Lábléc (Footer)',
];

export const LANGUAGES: string[] = [
  "Afgán (pastu)", "Albán", "Angol", "Arab", "Azeri", "Bengáli", "Bolgár", "Bosnyák", "Burmai", 
  "Cseh", "Dán", "Dari", "Észt", "Fehérorosz", "Finn", "Francia", "Fülöp-szigeteki (tagalog)", "Görög", "Grúz", 
  "Hausza", "Héber", "Hindi", "Holland", "Horvát", "Indonéz", "Ír", "Izlandi", "Japán", "Joruba", 
  "Kazah", "Khmer", "Kínai (mandarin)", "Kirgiz", "Koreai", "Kurd", "Laoszi", "Lengyel", "Lett", "Litván", 
  "Luxemburgi", "Macedón", "Magyar", "Maláj", "Máltai", "Mongol", "Német", "Nepáli", "Norvég", "Olasz", 
  "Orosz", "Örmény", "Perzsa", "Portugál", "Román", "Spanyol", "Svéd", "Szerb", "Szinhala", "Szlovák", 
  "Szlovén", "Szomáli", "Szuahéli", "Tádzsik", "Tamil", "Tatár", "Thai", "Tibeti", "Török", "Türkmén", 
  "Ukrán", "Urdu", "Üzbég", "Vietnámi", "Wales-i"
];