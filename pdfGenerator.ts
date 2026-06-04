
import { BasePackage, BonusPage, Extra, PriceType, CustomInstance, EditableContentItem, QuoteDetailsType, PackageId, MaintenancePlan, EliteExtension } from './types';
import { formatDate } from './utils';
import { generateSitemapFromQuote, SitemapPageNode } from './sitemapTemplates';

// This tells TypeScript that pdfMake is available as a global variable
// from the script tag in index.html
declare const pdfMake: any;

export interface PdfQuoteData {
    selectedPackage: BasePackage;
    selectedExtras: Extra[];
    customPrices: Record<string, number>;
    customSections: { id: string; name: string; price: number }[];
    customInstances: Record<string, CustomInstance[]>;
    bonusPages: BonusPage[];
    oneTimeTotal: number;
    monthlyTotal: number;
    quoteDetails: QuoteDetailsType;
    issueDate: Date;
    expiryDate: Date;
    packageContents: { pages: EditableContentItem[]; features: EditableContentItem[] };
    selectedPlanId: 'smart' | 'pro' | null;
    maintenancePlans: MaintenancePlan[];
    eliteExtensions: EliteExtension[];
    customElitePrices: Record<string, number>;
    discountPercentage: number;
}

const formatCurrency = (amount: number, isMonthly = false) => {
    const formatted = new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(amount);
    return isMonthly ? `${formatted} / hó` : formatted;
};

type TableCell = {
    text?: string | any[];
    stack?: any[];
    style?: string | string[];
    bold?: boolean;
    alignment?: 'left' | 'right' | 'center' | 'justify';
    italics?: boolean;
    color?: string;
    fillColor?: string;
    border?: [boolean, boolean, boolean, boolean];
    colSpan?: number;
    margin?: [number, number, number, number];
    paddingTop?: number;
    ul?: any[];
};

export const generateQuotePDF = (data: PdfQuoteData) => {
    const { 
        selectedPackage, 
        selectedExtras, 
        customPrices, 
        customSections,
        customInstances, 
        bonusPages, 
        oneTimeTotal,
        monthlyTotal,
        quoteDetails,
        issueDate,
        expiryDate,
        packageContents,
        selectedPlanId,
        maintenancePlans,
        eliteExtensions,
        customElitePrices,
        discountPercentage
    } = data;
    
    const selectedPlan = (selectedPackage.id === PackageId.CONTINUOUS_MAINTENANCE && selectedPlanId && maintenancePlans) 
        ? maintenancePlans.find(p => p.id === selectedPlanId) 
        : null;

    const isMaintenance = selectedPackage.id === PackageId.MAINTENANCE || selectedPackage.id === PackageId.CONTINUOUS_MAINTENANCE;
    const priorityMultiplier = quoteDetails.priorityMultiplier;
    const hasPriorityFee = priorityMultiplier > 1;
    const subTotal = hasPriorityFee && oneTimeTotal > 0 ? oneTimeTotal / priorityMultiplier : oneTimeTotal;

    const tableBody: TableCell[][] = [
        [
            { text: 'Tétel Leírása', style: 'tableHeader', fillColor: '#4f46e5' },
            { text: 'Nettó Egységár', style: 'tableHeader', alignment: 'right', fillColor: '#4f46e5' }
        ],
    ];

    const basePackagePrice = selectedPlan ? selectedPlan.price : selectedPackage.price;
    const basePackageName = selectedPlan ? selectedPlan.name : selectedPackage.name;

    const basePackageItemStack: any[] = [
        { text: basePackageName, style: 'itemTitle' },
        { text: selectedPlan ? selectedPackage.name : selectedPackage.description, style: 'itemSubtitle' }
    ];
    
    if (selectedPlan) {
         basePackageItemStack.push({
            text: 'A csomag tartalma:',
            style: 'packageFeaturesHeader',
            margin: [0, 6, 0, 2]
        });
        const featureListForPdf = selectedPlan.features.map(feature => {
            return {
                stack: [
                    { text: feature.name, style: 'packageFeatures', bold: true },
                    { text: feature.description, style: 'featureDescriptionPdf' }
                ],
                margin: [0, 0, 0, 5] // Add some space between list items
            };
        });
        basePackageItemStack.push({
            ul: featureListForPdf,
            margin: [10, 0, 0, 0]
        });
    } else {
        const pagesForPdf = packageContents.pages.map(p => p.text);
        const featuresForPdf = packageContents.features.map(f => f.text);
        if (pagesForPdf.length > 0) {
            basePackageItemStack.push({
                text: 'A csomag tartalma:',
                style: 'packageFeaturesHeader',
                margin: [0, 6, 0, 2]
            });
            basePackageItemStack.push({
                ul: pagesForPdf,
                style: 'packageFeatures',
                margin: [10, 0, 0, 0]
            });
        }
        if (featuresForPdf.length > 0) {
            basePackageItemStack.push({
                text: 'Alapbeállítások és funkciók:',
                style: 'packageFeaturesHeader',
                margin: [0, 6, 0, 2]
            });
            basePackageItemStack.push({
                ul: featuresForPdf,
                style: 'packageFeatures',
                margin: [10, 0, 0, 0]
            });
        }
    }


    tableBody.push([
        { 
            stack: basePackageItemStack,
            fillColor: '#eef2ff' // indigo-50
        },
        { text: formatCurrency(basePackagePrice, !!selectedPlan), alignment: 'right', style: ['itemPrice', 'itemTitle'], fillColor: '#eef2ff' }
    ]);

    // Add Elite Extensions
    if (eliteExtensions.length > 0) {
        tableBody.push([
            { text: 'Elite Extensions', style: 'categoryHeader', colSpan: 2, alignment: 'left', fillColor: '#f1f5f9', border: [false, true, false, false] },
            {}
        ]);
        eliteExtensions.forEach(ext => {
            const customPrice = customElitePrices[ext.id];
            const price = customPrice !== undefined ? customPrice : ext.priceMonthly;

            const itemCell: TableCell = {
                stack: [
                    { text: ext.name, style: 'itemText' },
                    { text: `Egyszeri díj: ${ext.priceOneTimeDisplay}`, style: 'itemDescription' },
                ]
            };
             if (customPrice !== undefined) {
                 (itemCell.stack as any[]).push({ text: '(Egyedileg beállított havidíj)', style: 'itemDescription', italics: true, margin: [0, 2, 0, 0] });
            }
            if (ext.description) {
                (itemCell.stack as any[]).push({ text: ext.description, style: 'itemDescription', margin: [0,4,0,0] });
            }
            tableBody.push([
                itemCell,
                { text: formatCurrency(price, true), alignment: 'right', style: 'itemPrice' }
            ]);
        });
    }

    // Add Custom Sections
    if (customSections.length > 0) {
        tableBody.push([
            { text: 'Landing Oldal Szekciók', style: 'categoryHeader', colSpan: 2, alignment: 'left', fillColor: '#f1f5f9', border: [false, true, false, false] },
            {}
        ]);
        customSections.forEach(section => {
            tableBody.push([
                { text: section.name || 'Névtelen szekció', style: 'itemText' },
                { 
                    text: formatCurrency(section.price), 
                    alignment: 'right', 
                    style: 'itemPrice'
                }
            ]);
        });
    }

    // Add Custom Instances
    if (Object.keys(customInstances).length > 0) {
        tableBody.push([
            { text: 'Egyedi Oldalak', style: 'categoryHeader', colSpan: 2, alignment: 'left', fillColor: '#f1f5f9', border: [false, true, false, false] },
            {}
        ]);
        Object.values(customInstances).forEach((instances) => {
             instances.forEach((instance) => {
                 const itemCell: TableCell = {
                    stack: [{ text: instance.name, style: 'itemText' }]
                };
                if(instance.description) {
                    (itemCell.stack as any[]).push({ text: instance.description, style: 'itemDescription' });
                }
                 tableBody.push([
                    itemCell,
                    { text: formatCurrency(instance.price), alignment: 'right', style: 'itemPrice' }
                ]);
             });
        });
    }

    // Add Extras
    if (selectedExtras.length > 0) {
        tableBody.push([
            { text: 'Kiválasztott Extrák', style: 'categoryHeader', colSpan: 2, alignment: 'left', fillColor: '#f1f5f9', border: [false, true, false, false] },
            {}
        ]);
        selectedExtras.forEach(extra => {
            // Important: skip items that are already counted in instances
            if (extra.isInstantiable) return;

            let price = 0;
            const customPrice = customPrices[extra.id];

            switch (extra.type) {
                case PriceType.FIXED: price = extra.price; break;
                case PriceType.FROM: price = customPrice ?? extra.price; break;
                case PriceType.HOURLY: price = customPrice ?? 0; break;
                default: price = 0;
            }
            
            const itemCell: TableCell = {
                stack: [{ text: extra.name, style: 'itemText' }]
            };
            if(extra.description) {
                (itemCell.stack as any[]).push({ text: extra.description, style: 'itemDescription' });
            }

            tableBody.push([
                itemCell,
                { text: price > 0 ? formatCurrency(price) : 'Ingyenes', alignment: 'right', style: 'itemPrice' }
            ]);
        });
    }

    // Add Bonus Pages (if not maintenance)
    if (!isMaintenance && bonusPages.length > 0) {
        tableBody.push([
            { text: 'Bónusz Tételek', style: 'categoryHeader', colSpan: 2, alignment: 'left', fillColor: '#f1f5f9', border: [false, true, false, false] },
            {}
        ]);
        bonusPages.forEach(page => {
             const itemCell: TableCell = {
                stack: [{ text: page.name, style: ['itemText', 'bonusItem'] }]
            };
            if(page.description) {
                (itemCell.stack as any[]).push({ text: page.description, style: 'itemDescription' });
            }
             tableBody.push([
                itemCell,
                { text: 'Ingyenes', alignment: 'right', style: ['itemPrice', 'bonusItem'] }
            ]);
        });
    }

    const detailLabels = ['Azonosító:\n', 'Tárgy:\n'];
    const detailValues = [`${quoteDetails.quoteId || '-'}\n`, `${quoteDetails.subject || '-'}\n`];

    if (isMaintenance && quoteDetails.websiteUrl) {
        detailLabels.push('Weboldal címe:\n');
        detailValues.push(`${quoteDetails.websiteUrl}\n`);
    }

    detailLabels.push('Kelt:\n');
    detailValues.push(`${formatDate(issueDate)}\n`);

    if (!isMaintenance) {
        detailLabels.push('Érvényes:');
        detailValues.push(`${formatDate(expiryDate)}`);
    }

    const hasDiscount = discountPercentage > 0;
    const discountAmount = oneTimeTotal * (discountPercentage / 100);
    const discountedOneTimeTotal = oneTimeTotal - discountAmount;
    const monthlyDiscountAmount = monthlyTotal * (discountPercentage / 100);
    const discountedMonthlyTotal = monthlyTotal - monthlyDiscountAmount;

    const content: any[] = [
        {
            columns: [
                { width: '50%', text: 'Címzett:', style: 'subheader' },
                { width: '50%', text: 'Ajánlat Részletei:', style: 'subheader' }
            ],
            margin: [0, 25, 0, 5]
        },
        {
            columns: [
                { width: '50%', text: quoteDetails.clientName || 'Nincs megadva', style: 'clientName' },
                {
                    width: '50%',
                    columns: [
                        { width: 'auto', text: detailLabels, style: 'detailsLabel' },
                        { width: '*', text: detailValues, style: 'detailsValue' }
                    ]
                }
            ],
            columnGap: 20
        },
    ];

    if (selectedPackage.id === PackageId.CONTINUOUS_MAINTENANCE) {
        content.push(
            { text: 'Rövid Ismertető a Folyamatos Karbantartásról', style: 'sectionHeader', margin: [0, 30, 0, 10] },
            { text: 'Mit tartalmaz a havidíj?', style: 'introSubheader' },
            { text: 'A havidíj megfizetésével biztosítok számodra egy dedikált időkeretet, amelyet a csomagban felsorolt szolgáltatások teljesítésére fordítok. Ez az időszak lehetőséget ad nekem arra, hogy elvégezzem a frissítéseket, kezeljem az esetleges hibákat, optimalizáljam a weboldal sebességét, frissítsem a tartalmakat, vagy akár új funkciókat vezessek be a weboldalad karbantartása érdekében.', style: 'bodyText' },
            { text: 'Gyors és kiemelt támogatás:', style: 'introSubheader' },
            { text: 'Ezen kívül kiemelt támogatást is biztosítok számodra a gyors válaszadás terén. Számíthatsz rá, hogy esetleges kérdéseidre adott válaszaim gyorsak és hatékonyak lesznek. Célom az, hogy minden kérdésedre és kérésedre minél gyorsabban reagáljak, így zavartalanul foglalkozhatsz a saját teendőiddel, miközben én gondoskodom az online jelenléted stabilitásáról.', style: 'bodyText' },
            { text: 'Folyamatos figyelem és karbantartás:', style: 'introSubheader' },
            { text: 'A te elégedettséged és a weboldalad hatékony működése a prioritásom. Ezért gondoskodom arról, hogy a havidíj fedezze a számodra nyújtott szolgáltatások időtartamát és a karbantartás teljes körű végrehajtását. Ide tartozik a biztonsági mentések készítése, a szoftverek és bővítmények frissítése, valamint a biztonsági résekkel szembeni védelem fenntartása.', style: 'bodyText' },
            { text: 'Miért éri meg a folyamatos karbantartás?', style: 'introSubheader' },
            { text: 'A weboldalad hatékony és problémamentes működése hozzájárul az üzleti sikereidhez. A rendszeres karbantartásnak köszönhetően elkerülheted a váratlan hibákat, lassulásokat vagy adatvesztést. Az én szakmai tapasztalatom biztosítja, hogy minden karbantartást és optimalizációs feladatot a legjobb tudásom szerint végezzek el, hogy a weboldalad mindig naprakész és versenyképes legyen.', style: 'bodyText' },
            { text: 'Hogyan indul a közös munka?', style: 'introSubheader' },
            { text: 'A következő oldalakon részletesen bemutatom a karbantartási szolgáltatásokat, hogy pontos képet kapj arról, mit nyújtok és hogyan támogatom weboldalad hatékony működését. A bemutatott csomagok közül könnyedén kiválaszthatod azt, amelyik a legjobban megfelel az igényeidnek, így nincs szükség további konzultációra – minden fontos információt megtalálsz ebben a dokumentumban.', style: 'bodyText' }
        );
    } else if (!isMaintenance) {
        content.push(
            { text: 'Bevezetés', style: 'sectionHeader', margin: [0, 30, 0, 5] },
            { text: 'A webdizájn nem egy mindenkire érvényes formula, de van néhány dolog, ami nagy hatással van a felhasználókra.', style: 'bodyText' },
            {
                text: [
                    { text: 'Először:', bold: true },
                    ' Kitaláljuk az általad nyújtott valódi értéket. Más szóval, amivel a te terméked/szolgáltatásod más mint a versenytársaké. Gondoskodom arról, hogy márkád megszólítsa közönségét.'
                ],
                style: 'bodyText'
            },
            {
                text: [
                    { text: 'Másodszor:', bold: true },
                    ' SEO és modern lead-generálási taktikákat alkalmazunk, hogy növeljük a konverziós arányt. A következő szakaszokban kifejtem, hogy mit és hogyan tegyünk.'
                ],
                style: 'bodyText'
            },
            { text: 'Garancia', style: 'introSubheader' },
            { text: 'Az általam tervezett Design kialakítására 100%-os elégedettségig garanciát vállalok. Ami lehetővé teszi, hogy ha mégsem azt a kialakítást látod viszont weboldaladon amit a Design tervben prezentáltam neked, jogosult vagy visszakérni a teljes Design tervezés összegét.', style: 'bodyText' },
            { text: 'Az együttműködésünk célja', style: 'introSubheader' },
            { text: 'Célom, hogy a weboldalad a vállalkozásod egyik legfontosabb eszköze legyen, amely nem csupán bemutatja a termékeidet vagy szolgáltatásaidat, hanem aktívan hozzájárul az üzleti céljaid eléréséhez. Keresőoptimalizálással, célzott tartalommal és reszponzív kialakítással növelem a látogatók számát, miközben a felhasználóbarát navigáció és gyors betöltési idő javítja az ügyfélélményt.', style: 'bodyText' },
            { text: 'A konverziók elősegítése érdekében stratégiára épített funkciókat tervezek, hogy az érdeklődők egyszerűen ügyfelekké váljanak. Így a weboldalad nemcsak rövid távon, hanem hosszú távon is értéket teremt a vállalkozásod számára.', style: 'bodyText' }
        );
    }
    
    content.push(
        {
            table: { headerRows: 1, widths: ['*', 'auto'], body: tableBody },
            layout: {
                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0 : 1,
                vLineWidth: () => 0,
                hLineColor: () => '#e2e8f0', // slate-200
                paddingTop: () => 10, paddingBottom: () => 10,
                paddingLeft: () => 10, paddingRight: () => 10,
            },
            margin: [0, 20, 0, 0]
        },
        {
            columns: [
                { width: '*', text: '' },
                {
                    width: 'auto',
                    margin: [0, 20, 0, 0],
                    table: {
                        widths: ['auto', 'auto'],
                        body: [
                            ...(hasPriorityFee ? [
                                ['Részösszeg:', { text: formatCurrency(subTotal), alignment: 'right', style: 'summaryText' }],
                            ] : []),
                            ...(oneTimeTotal > 0 && monthlyTotal > 0 ? [
                                [hasDiscount ? 'Egyszeri díjak (kedvezmény előtt):' : 'Egyszeri díjak (nettó):', { text: formatCurrency(oneTimeTotal), alignment: 'right', style: 'summaryText', bold: !hasDiscount }]
                            ]:[]),
                            ...(hasDiscount ? [
                                [
                                    { text: `Kedvezmény (${discountPercentage}%):`, style: 'discountLabel' },
                                    { text: `-${formatCurrency(monthlyTotal > 0 ? monthlyDiscountAmount : discountAmount)}`, alignment: 'right', style: 'discountAmount' }
                                ]
                            ] : []),
                            ...(monthlyTotal > 0 ? [
                                [
                                  { text: hasDiscount ? 'Kedvezményes havidíj (nettó):' : 'Teljes havidíj (nettó):', style: 'totalLabel', border: [false, true, false, false], paddingTop: 10 }, 
                                  { text: formatCurrency(hasDiscount ? discountedMonthlyTotal : monthlyTotal, true), alignment: 'right', style: 'totalAmount', border: [false, true, false, false], paddingTop: 10 }
                                ]
                            ] : [
                                [
                                  { text: hasDiscount ? 'Kedvezményes összeg (nettó):' : 'Teljes összeg (nettó):', style: 'totalLabel', border: [false, true, false, false], paddingTop: 10 }, 
                                  { text: formatCurrency(hasDiscount ? discountedOneTimeTotal : oneTimeTotal), alignment: 'right', style: 'totalAmount', border: [false, true, false, false], paddingTop: 10 }
                                ]
                            ]),
                        ]
                    },
                    layout: {
                        defaultBorder: false,
                        hLineColor: () => '#cbd5e1',
                        paddingTop: (i) => i === 0 ? 0 : 6,
                        paddingBottom: () => 6,
                    }
                }
            ]
        }
    );
    
    if (selectedPackage.id === PackageId.CONTINUOUS_MAINTENANCE) {
        content.push({
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            stack: [
                                { text: 'Megjegyzés a Smart Maintenance és Pro Performance Csomagokhoz', style: 'noteHeader' },
                                { text: 'A Smart Maintenance és a Pro Performance csomagok előre meghatározott tartalommal érhetők el, így a csomagban szereplő szolgáltatások eltávolítása nem módosítja a havidíjat.', style: 'noteBody', margin: [0, 5, 0, 5] },
                                { text: 'Mindkét csomag azonban kiegészíthető extra szolgáltatásokkal, amelyeket az igényekhez igazítanak, hogy a weboldal karbantartása teljes mértékben megfeleljen az elvárásoknak.', style: 'noteBody' }
                            ],
                            border: [false, false, false, false],
                            margin: [10, 10, 10, 10]
                        }
                    ]
                ]
            },
            layout: { defaultBorder: false },
            fillColor: '#f8fafc', // slate-50
            margin: [0, 20, 0, 10]
        });
    }

    content.push(
        { text: 'Becsült megvalósítási idő', style: 'sectionHeader' },
        { text: `${quoteDetails.estimatedTime || 'Nincs megadva'}. A pontos kezdési időpont a kapacitás függvényében, a megrendelés véglegesítését követően kerül egyeztetésre.`, style: 'bodyText' },
        { text: 'További lépések', style: 'sectionHeader' },
        { text: 'Amennyiben ajánlatom elnyerte tetszését, kérem, jelezze felém írásban. Ezt követően felveszem Önnel a kapcsolatot a szerződéskötés és a projektindítás részleteivel kapcsolatban.', style: 'bodyText' }
    );

    if (!isMaintenance) {
        content.push({ text: 'A fenti árak az áfát nem tartalmazzák. Ez egy előzetes kalkuláció, nem minősül hivatalos, kötelező érvényű ajánlattételnek. A végleges árajánlatot a projekt részleteinek pontosítása után küldöm meg.', style: 'disclaimer', margin: [0, 30, 0, 0] });
    }

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        header: {
            margin: [40, 20, 40, 0],
            columns: [
                {
                    stack: [
                        { text: 'Awebes', style: 'companyName' },
                        { text: 'Webfejlesztés | Digitális Megoldások', style: 'companySubline' },
                        { text: 'info@awebes.hu | +36 30 421 6462', style: 'companySubline', margin: [0, 4, 0, 0] },
                    ],
                    width: '*'
                },
                {
                    width: 'auto',
                     table: {
                        body: [[{ text: 'ÁRAJÁNLAT', style: 'documentTitle', alignment: 'center', border: [false, false, false, false] }]]
                    },
                    layout: {
                        defaultBorder: false,
                        paddingLeft: () => 20, paddingRight: () => 20,
                        paddingTop: () => 6, paddingBottom: () => 6,
                    },
                    fillColor: '#4f46e5',
                }
            ]
        },
        footer: (currentPage: number, pageCount: number) => ({
            columns: [
                { text: 'Awebes | info@awebes.hu | +36 30 421 6462', alignment: 'left', style: 'footerText' },
                { text: `Oldal ${currentPage.toString()} / ${pageCount.toString()}`, alignment: 'right', style: 'footerText' },
            ],
            margin: [40, 20, 40, 0]
        }),
        content: content,
        styles: {
            companyName: { fontSize: 18, bold: true, color: '#1e293b' },
            companySubline: { fontSize: 10, color: '#64748b' },
            documentTitle: { fontSize: 20, bold: true, color: '#ffffff' },
            subheader: { fontSize: 10, bold: true, color: '#64748b', textTransform: 'uppercase' },
            clientName: { fontSize: 14, bold: true, color: '#1e293b' },
            detailsLabel: { fontSize: 10, color: '#64748b', lineHeight: 1.4 },
            detailsValue: { fontSize: 10, bold: true, color: '#334155', lineHeight: 1.4 },
            bodyText: { fontSize: 10, color: '#334155', lineHeight: 1.3, margin: [0, 0, 0, 10] },
            tableHeader: { bold: true, fontSize: 11, color: '#ffffff' },
            itemTitle: { bold: true, fontSize: 11, color: '#312e81' },
            itemSubtitle: { fontSize: 9, color: '#4338ca', margin: [0, 2, 0, 0] },
            itemDescription: { fontSize: 9, color: '#64748b', margin: [0, 2, 0, 0] },
            itemText: { fontSize: 10, color: '#334155' },
            itemPrice: { fontSize: 10, color: '#1e293b', bold: true },
            categoryHeader: { bold: true, fontSize: 10, color: '#475569', margin: [0, 6, 0, 6] },
            packageFeaturesHeader: { fontSize: 9, bold: true, color: '#475569' },
            packageFeatures: { fontSize: 9, color: '#475569', lineHeight: 1.3 },
            featureDescriptionPdf: { fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0], italics: true },
            bonusItem: { color: '#16a34a' },
            summaryText: { fontSize: 10, color: '#334155' },
            totalLabel: { fontSize: 12, bold: true, color: '#1e293b' },
            totalAmount: { fontSize: 16, bold: true, color: '#4f46e5' },
            discountLabel: { fontSize: 10, italic: true, color: '#ef4444' },
            discountAmount: { fontSize: 10, bold: true, color: '#ef4444' },
            sectionHeader: { fontSize: 12, bold: true, color: '#4f46e5', margin: [0, 20, 0, 5], textTransform: 'uppercase' },
            introSubheader: { fontSize: 11, bold: true, color: '#1e293b', margin: [0, 15, 0, 5] },
            disclaimer: { fontSize: 9, color: '#64748b', italics: true },
            footerText: { fontSize: 9, color: '#64748b' },
            noteHeader: { fontSize: 11, bold: true, color: '#334155', margin: [0, 0, 0, 5] },
            noteBody: { fontSize: 9.5, color: '#475569', lineHeight: 1.3 },
        },
        defaultStyle: {
            font: 'Roboto',
            fontSize: 10,
            color: '#334155', // slate-700
        }
    };

    const sanitizedClientName = (data.quoteDetails.clientName || '').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `Ajanlat_${data.quoteDetails.quoteId || 'xxxx-xxx'}_${sanitizedClientName || 'ugyfel'}.pdf`;

    pdfMake.createPdf(docDefinition).download(fileName);
};

// ── Sitemap PDF ────────────────────────────────────────────────────────────────

export const generateSitemapPDF = (
    packageId: PackageId | null,
    selectedExtrasMap: Record<string, boolean>,
    customInstances: Record<string, CustomInstance[]>,
    quoteDetails: QuoteDetailsType,
    issueDate: Date
): void => {
    const sitemapData = generateSitemapFromQuote(packageId, selectedExtrasMap, customInstances);
    if (!sitemapData) return;

    const { root, extraPages, systemPages } = sitemapData;

    const C = {
        indigo: '#4f46e5',
        indigoLight: '#eef2ff',
        green: '#16a34a',
        greenLight: '#f0fdf4',
        border: '#e2e8f0',
        textDark: '#1e293b',
        textMid: '#334155',
        textLight: '#64748b',
        white: '#ffffff',
        bg: '#f8fafc',
    };

    const makeCard = (node: SitemapPageNode, variant: 'root' | 'extra' | 'system', width: number): any => {
        const headerColor = variant === 'root' ? C.indigo : variant === 'system' ? C.green : C.textMid;
        const headerBg = variant === 'root' ? C.indigoLight : variant === 'system' ? C.greenLight : C.bg;
        const borderCol = variant === 'root' ? C.indigo : variant === 'system' ? '#86efac' : C.border;

        const body: any[][] = [
            [{
                text: node.name,
                fontSize: 8,
                bold: true,
                color: headerColor,
                fillColor: headerBg,
                margin: [6, 4, 6, 4],
            }],
            ...node.sections.map(s => ([{
                stack: [
                    { text: s.title, fontSize: 7, bold: true, color: C.textMid },
                    ...(s.description ? [{ text: s.description, fontSize: 6, color: C.textLight, margin: [0, 1, 0, 0] }] : []),
                ],
                fillColor: C.white,
                margin: [6, 3, 6, 3],
            }])),
        ];

        return {
            table: { widths: [width], body },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.75,
                hLineColor: () => borderCol,
                vLineColor: () => borderCol,
            },
        };
    };

    const renderTree = (node: SitemapPageNode, depth: number, isRoot: boolean): any[] => {
        const CARD_W = 150;
        const INDENT = depth * 18;
        const items: any[] = [
            {
                columns: [
                    ...(INDENT > 0 ? [{ width: INDENT, text: '' }] : []),
                    { width: CARD_W, stack: [makeCard(node, isRoot ? 'root' : 'extra', CARD_W)] },
                ],
                columnGap: 0,
                margin: [0, 0, 0, depth > 0 ? 5 : 2],
            },
        ];
        (node.children ?? []).forEach(child => items.push(...renderTree(child, depth + 1, false)));
        return items;
    };

    const renderGrid = (nodes: SitemapPageNode[], variant: 'extra' | 'system'): any[] => {
        const CARD_W = 155;
        const GAP = 10;
        const PER_ROW = 3;
        const rows: any[] = [];
        for (let i = 0; i < nodes.length; i += PER_ROW) {
            const chunk = nodes.slice(i, i + PER_ROW);
            while (chunk.length < PER_ROW) chunk.push(null as any);
            rows.push({
                columns: chunk.map((n: SitemapPageNode | null) =>
                    n
                        ? { width: CARD_W, stack: [makeCard(n, variant, CARD_W)] }
                        : { width: CARD_W, text: '' }
                ),
                columnGap: GAP,
                margin: [0, 0, 0, GAP],
            });
        }
        return rows;
    };

    const sectionLabel = (text: string, color: string = C.textLight): any => ({
        text,
        fontSize: 7,
        bold: true,
        color,
        margin: [0, 16, 0, 8],
    });

    const content: any[] = [
        {
            columns: [
                {
                    stack: [
                        { text: 'Vizuális Site Map', fontSize: 15, bold: true, color: C.indigo },
                        ...(quoteDetails.clientName ? [{ text: quoteDetails.clientName, fontSize: 10, bold: true, color: C.textDark, margin: [0, 2, 0, 0] }] : []),
                        ...(quoteDetails.subject ? [{ text: quoteDetails.subject, fontSize: 9, color: C.textLight }] : []),
                    ],
                },
                { text: formatDate(issueDate), alignment: 'right', fontSize: 9, color: C.textLight },
            ],
            margin: [0, 0, 0, 16],
        },
        sectionLabel('FŐOLDAL STRUKTÚRA', C.indigo),
        ...renderTree(root, 0, true),
        ...(extraPages.length > 0 ? [
            sectionLabel(`EXTRA OLDALAK (${extraPages.length})`),
            ...renderGrid(extraPages, 'extra'),
        ] : []),
        sectionLabel('RENDSZER OLDALAK — INGYENES BÓNUSZ', C.green),
        ...renderGrid(systemPages, 'system'),
    ];

    const sanitized = (quoteDetails.clientName || '').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `Sitemap_${sanitized || 'awebes'}_${formatDate(issueDate).replace(/[\s.]/g, '')}.pdf`;

    pdfMake.createPdf({
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [30, 36, 30, 36],
        content,
        defaultStyle: { font: 'Roboto' },
    }).download(fileName);
};
