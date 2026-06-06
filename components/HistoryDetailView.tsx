
import React, { useState } from 'react';
import { QuoteHistoryItem, PackageId, PriceType, QuoteStatus, FigmaPhaseStatus, ClientNotes, PexelsPhoto } from '../types';
import { BASE_PACKAGES, EXTRAS, MAINTENANCE_PLANS, ELITE_EXTENSIONS } from '../constants';
import { ArrowLeftIcon, PdfIcon, SitemapIcon, ResearchDocIcon } from './icons';
import SitemapView from './SitemapView';
import ResearchView from './ResearchView';
import ResearchUploadModal from './ResearchUploadModal';
import { generateResearchPDF } from '../pdfGenerator';
import { addCalendarDays } from '../utils';

interface HistoryDetailViewProps {
  item: QuoteHistoryItem;
  onBack: () => void;
  onDownloadQuotePdf: (id: string) => void;
  onDownloadSitemapPdf: (id: string) => void;
  onFigmaApproval: (id: string) => void;
  onUpdateFigmaPhase: (id: string, phase: FigmaPhaseStatus, figmaFileUrl?: string) => void;
  onUpdateResearch: (id: string, content: string) => void;
}

type Tab = 'quote' | 'sitemap' | 'research' | 'figma';

const statusConfig: Record<QuoteStatus, { text: string; color: string }> = {
  [QuoteStatus.DRAFT]:    { text: 'Vázlat',     color: 'bg-slate-500' },
  [QuoteStatus.SENT]:     { text: 'Elküldve',   color: 'bg-blue-500'  },
  [QuoteStatus.ACCEPTED]: { text: 'Elfogadva',  color: 'bg-green-500' },
  [QuoteStatus.REJECTED]: { text: 'Elutasítva', color: 'bg-red-500'   },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(amount);

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });

const isMaintenance = (id: PackageId | null) =>
  id === PackageId.MAINTENANCE || id === PackageId.CONTINUOUS_MAINTENANCE;

const FIGMA_PHASE_CONFIG: Record<FigmaPhaseStatus, { label: string; color: string; badge: string }> = {
  not_started:      { label: 'Nem indult el',            color: 'text-slate-400',  badge: 'bg-slate-700'         },
  brief_ready:      { label: 'Brief kész — újra próbálható', color: 'text-amber-300',  badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' },
  figma_in_progress:{ label: 'Figma tervezés folyamatban...', color: 'text-blue-300',   badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/40'    },
  figma_done:       { label: 'Terv kész — jóváhagyásra vár', color: 'text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' },
  figma_approved:   { label: 'Figma jóváhagyva ✓',        color: 'text-green-400',  badge: 'bg-green-500/20 text-green-400 border border-green-500/40'  },
};

const ClientNotesDisplay: React.FC<{ notes: ClientNotes; title: string }> = ({ notes, title }) => (
  <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
    <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">{title}</p>
    {notes.hasChanges && (
      <div className="space-y-2">
        {notes.designNotes && (
          <div><p className="text-slate-500 text-xs mb-0.5">🎨 Dizájn</p><p className="text-slate-300 text-sm">{notes.designNotes}</p></div>
        )}
        {notes.itemChanges && (
          <div><p className="text-slate-500 text-xs mb-0.5">📋 Tételek</p><p className="text-slate-300 text-sm">{notes.itemChanges}</p></div>
        )}
        {notes.pageChanges && (
          <div><p className="text-slate-500 text-xs mb-0.5">📄 Oldalak</p><p className="text-slate-300 text-sm">{notes.pageChanges}</p></div>
        )}
      </div>
    )}
    {notes.generalNotes && (
      <div><p className="text-slate-500 text-xs mb-0.5">💬 Általános</p><p className="text-slate-300 text-sm">{notes.generalNotes}</p></div>
    )}
    {!notes.hasChanges && !notes.generalNotes && (
      <p className="text-slate-500 text-sm">Nem volt változás — minden rendben.</p>
    )}
    <p className="text-slate-600 text-xs">{new Date(notes.submittedAt).toLocaleString('hu-HU')}</p>
  </div>
);

const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({
  item, onBack, onDownloadQuotePdf, onDownloadSitemapPdf, onFigmaApproval, onUpdateFigmaPhase, onUpdateResearch,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('quote');
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const { state } = item;
  const pkg = BASE_PACKAGES.find(p => p.id === state.selectedPackageId) ?? null;
  const hasSitemap = !isMaintenance(state.selectedPackageId);
  const hasResearch = !!item.researchContent;
  const showFigmaTab = item.status === QuoteStatus.ACCEPTED || (item.figmaPhase && item.figmaPhase !== 'not_started');
  const issueDate = new Date(item.savedAt);
  const expiryDate = addCalendarDays(issueDate, state.quoteDetails.validityDays);

  // Build price breakdown lines
  type PriceLine = { label: string; sub?: string; amount: number; isMonthly?: boolean; isBase?: boolean };
  const lines: PriceLine[] = [];
  let oneTimeSubtotal = 0;
  let monthlyTotal = 0;

  if (state.selectedPackageId === PackageId.CONTINUOUS_MAINTENANCE && state.selectedPlanId) {
    const plan = MAINTENANCE_PLANS.find(p => p.id === state.selectedPlanId);
    if (plan) {
      lines.push({ label: plan.name, sub: pkg?.name, amount: plan.price, isMonthly: true, isBase: true });
      monthlyTotal += plan.price;
    }
    ELITE_EXTENSIONS.filter(e => state.selectedEliteExtensions[e.id]).forEach(ext => {
      const monthly = state.customElitePrices?.[ext.id] ?? ext.priceMonthly;
      lines.push({ label: ext.name, amount: monthly, isMonthly: true });
      monthlyTotal += monthly;
      if (ext.priceOneTime > 0) {
        lines.push({ label: `${ext.name} (egyszeri beállítás)`, amount: ext.priceOneTime });
        oneTimeSubtotal += ext.priceOneTime;
      }
    });
  } else if (pkg) {
    lines.push({ label: pkg.name, sub: pkg.description, amount: pkg.price, isBase: true });
    oneTimeSubtotal += pkg.price;

    EXTRAS.filter(e => state.selectedExtras[e.id]).forEach(extra => {
      if (extra.isInstantiable) return;
      const price = state.customPrices?.[extra.id] ?? (extra.type === PriceType.HOURLY ? 0 : extra.price);
      lines.push({ label: extra.name, amount: price });
      oneTimeSubtotal += price;
    });

    Object.entries(state.customInstances ?? {}).forEach(([, instances]) => {
      instances.forEach(inst => {
        lines.push({ label: inst.name, sub: inst.description || undefined, amount: inst.price });
        oneTimeSubtotal += inst.price;
      });
    });

    (state.customSections ?? []).forEach(section => {
      lines.push({ label: section.name, amount: section.price });
      oneTimeSubtotal += section.price;
    });
  }

  const priorityMultiplier = state.quoteDetails.priorityMultiplier ?? 1;
  const hasPriority = priorityMultiplier > 1 && oneTimeSubtotal > 0;
  const afterPriority = hasPriority ? oneTimeSubtotal * priorityMultiplier : oneTimeSubtotal;
  const discount = state.discountPercentage ?? 0;
  const finalTotal = discount > 0 ? afterPriority * (1 - discount / 100) : afterPriority;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'quote', label: 'Árajánlat', icon: <PdfIcon /> },
    ...(hasSitemap ? [{ id: 'sitemap' as Tab, label: 'Site Map', icon: <SitemapIcon /> }] : []),
    { id: 'research' as Tab, label: 'Research', icon: <ResearchDocIcon /> },
    ...(showFigmaTab ? [{ id: 'figma' as Tab, label: 'Figma', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )}] : []),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-slate-700 text-sm"
        >
          <ArrowLeftIcon />
          Vissza
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-indigo-400 text-sm">{item.id}</span>
            {pkg && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {pkg.name}
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${statusConfig[item.status].color}`}>
              {statusConfig[item.status].text}
            </span>
          </div>
          <p className="text-slate-100 font-semibold text-sm truncate">{item.clientName || '[Nincs ügyfél neve]'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 flex-shrink-0 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── ÁRAJÁNLAT TAB ── */}
        {activeTab === 'quote' && (
          <div className="p-6 space-y-6">
            {/* Client info */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Ügyfél</p>
                <p className="text-slate-100 font-semibold">{state.quoteDetails.clientName || '—'}</p>
                <p className="text-slate-400 text-xs">{state.quoteDetails.clientEmail || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Azonosító</p>
                <p className="text-slate-100 font-semibold">{item.id}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Tárgy</p>
                <p className="text-slate-300">{state.quoteDetails.subject || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Becsült idő</p>
                <p className="text-slate-300">{state.quoteDetails.estimatedTime || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Kelt</p>
                <p className="text-slate-300">{formatDate(item.savedAt)}</p>
              </div>
              {state.quoteDetails.validityDays > 0 && (
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Érvényes</p>
                  <p className="text-slate-300">{expiryDate.toLocaleDateString('hu-HU')}-ig</p>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div>
              <h3 className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wide">Tételek</h3>
              <div className="border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-indigo-600/20 border-b border-slate-700">
                      <th className="text-left p-3 text-indigo-300 font-semibold">Tétel</th>
                      <th className="text-right p-3 text-indigo-300 font-semibold">Ár</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={i} className={`border-b border-slate-800 ${line.isBase ? 'bg-indigo-500/5' : ''}`}>
                        <td className="p-3">
                          <p className={`${line.isBase ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>{line.label}</p>
                          {line.sub && <p className="text-slate-500 text-xs mt-0.5">{line.sub}</p>}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <span className={`font-medium ${line.isBase ? 'text-indigo-300' : 'text-slate-300'}`}>
                            {formatCurrency(line.amount)}{line.isMonthly ? ' / hó' : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            {state.selectedPackageId !== PackageId.CONTINUOUS_MAINTENANCE && finalTotal > 0 && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-2">
                {hasPriority && (
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Részösszeg</span>
                    <span>{formatCurrency(oneTimeSubtotal)}</span>
                  </div>
                )}
                {hasPriority && (
                  <div className="flex justify-between text-sm text-amber-400">
                    <span>Sürgősségi díj (×{priorityMultiplier})</span>
                    <span>+{formatCurrency(oneTimeSubtotal * (priorityMultiplier - 1))}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-red-400">
                    <span>Kedvezmény ({discount}%)</span>
                    <span>−{formatCurrency(afterPriority * discount / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-slate-200 font-bold">Összesen</span>
                  <span className="text-indigo-400 text-xl font-bold">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            )}

            {state.selectedPackageId === PackageId.CONTINUOUS_MAINTENANCE && monthlyTotal > 0 && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-bold">Havi díj</span>
                  <span className="text-indigo-400 text-xl font-bold">{formatCurrency(monthlyTotal)} / hó</span>
                </div>
                {oneTimeSubtotal > 0 && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
                    <span className="text-slate-400 text-sm">Egyszeri díj</span>
                    <span className="text-slate-300 font-semibold">{formatCurrency(oneTimeSubtotal)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Download */}
            <button
              onClick={() => onDownloadQuotePdf(item.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <PdfIcon />
              Árajánlat PDF letöltése
            </button>
          </div>
        )}

        {/* ── SITE MAP TAB ── */}
        {activeTab === 'sitemap' && (
          <div className="p-6 space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <SitemapView
                selectedPackageId={state.selectedPackageId}
                selectedExtras={state.selectedExtras}
                customInstances={state.customInstances}
                clientName={state.quoteDetails.clientName}
                subject={state.quoteDetails.subject}
              />
            </div>
            <button
              onClick={() => onDownloadSitemapPdf(item.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <SitemapIcon />
              Site Map PDF letöltése
            </button>
          </div>
        )}

        {/* ── RESEARCH TAB ── */}
        {activeTab === 'research' && (
          <div className="p-6 space-y-4">
            {hasResearch ? (
              <>
                <ResearchView content={item.researchContent!} />
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => generateResearchPDF(
                      item.researchContent!,
                      item.clientName,
                      item.id,
                      new Date(item.savedAt)
                    )}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <ResearchDocIcon />
                    Research PDF letöltése
                  </button>
                  <button
                    onClick={() => setIsResearchModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-semibold transition-colors"
                  >
                    ✏️ Szerkesztés
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <ResearchDocIcon />
                </div>
                <div>
                  <p className="text-slate-300 font-semibold">Nincs még research dokumentum</p>
                  <p className="text-slate-500 text-sm mt-1">Töltsd fel a JARVIS által generált piacelemzést</p>
                </div>
                <button
                  onClick={() => setIsResearchModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  📋 Research hozzáadása
                </button>
              </div>
            )}
          </div>
        )}

        <ResearchUploadModal
          isOpen={isResearchModalOpen}
          clientName={item.clientName}
          quoteId={item.id}
          existingContent={item.researchContent ?? ''}
          onSave={(content) => {
            onUpdateResearch(item.id, content);
            setIsResearchModalOpen(false);
          }}
          onCancel={() => setIsResearchModalOpen(false)}
        />

        {/* ── FIGMA TAB ── */}
        {activeTab === 'figma' && (
          <div className="p-6 space-y-5">
            {/* Phase status */}
            {(() => {
              const phase = item.figmaPhase ?? 'not_started';
              const cfg = FIGMA_PHASE_CONFIG[phase];
              return (
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-3">Figma fázis státusza</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  {phase === 'brief_ready' && (
                    <p className="text-slate-500 text-xs mt-3">
                      Az API hívás nem sikerült — az elfogadás mentve van. Próbálj újra az elfogadás gombbal.
                    </p>
                  )}
                  {phase === 'figma_in_progress' && (
                    <div className="flex items-center gap-2 mt-3">
                      <svg className="w-4 h-4 text-blue-400 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      <p className="text-blue-400 text-xs">Claude API generálja a design briefinget és létrehozza a Figma fájlt...</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Figma file URL */}
            {item.figmaFileUrl && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Figma fájl</p>
                <a
                  href={item.figmaFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Figma terv megnyitása
                </a>
              </div>
            )}

            {/* AI-generated design brief */}
            {item.figmaDesignBrief && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
                <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-3">JARVIS Design Brief</p>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {item.figmaDesignBrief}
                </div>
              </div>
            )}

            {/* Pexels stock photos */}
            {item.figmaPhotos && item.figmaPhotos.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
                <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-3">
                  📷 Stock fotók — Pexels ({item.figmaPhotos.length} db)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {item.figmaPhotos.map((photo: PexelsPhoto, i: number) => (
                    <a
                      key={i}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block rounded-lg overflow-hidden aspect-video bg-slate-800"
                    >
                      <img
                        src={photo.url}
                        alt={photo.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                        <span className="text-white text-xs truncate">© {photo.photographer}</span>
                      </div>
                    </a>
                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-2">Kattints a képre a teljes méretű verzióhoz · Pexels licensz</p>
              </div>
            )}

            {/* Client notes from quote acceptance */}
            {item.clientNotes && (
              <ClientNotesDisplay notes={item.clientNotes} title="Ügyfél megjegyzései az árajánlathoz" />
            )}

            {/* Figma approval button */}
            {(item.figmaPhase === 'figma_done') && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <p className="text-indigo-300 text-sm font-semibold mb-1">Ügyfél jóváhagyta a Figma designt?</p>
                <p className="text-slate-400 text-xs mb-3">Kattints az elfogadáshoz — megadhatod az ügyfél visszajelzéseit is.</p>
                <button
                  onClick={() => onFigmaApproval(item.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  ✅ Figma jóváhagyása
                </button>
              </div>
            )}

            {/* Figma client notes (after approval) */}
            {item.figmaClientNotes && (
              <ClientNotesDisplay notes={item.figmaClientNotes} title="Ügyfél visszajelzése a Figma designhoz" />
            )}

            {/* Dev phase ready banner */}
            {item.figmaPhase === 'figma_approved' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-400 text-sm font-semibold">🚀 Fejlesztési fázis indítható</p>
                <p className="text-slate-400 text-xs mt-1">Figma elfogadva — jelezd JARVIS-nak hogy elindíthatja a WordPress fejlesztést.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDetailView;
