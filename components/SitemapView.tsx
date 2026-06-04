import React from 'react';
import { PackageId, CustomInstance } from '../types';
import { generateSitemapFromQuote, SitemapPageNode } from '../sitemapTemplates';

const C = {
  indigo: '#4f46e5',
  indigoLight: '#eef2ff',
  indigoBorder: '#c7d2fe',
  border: '#e2e8f0',
  bg: '#f8fafc',
  white: '#ffffff',
  textDark: '#1e293b',
  textMid: '#334155',
  textLight: '#64748b',
  line: '#cbd5e1',
  green: '#16a34a',
  greenBg: '#f0fdf4',
  greenBorder: '#bbf7d0',
};

const PageCard: React.FC<{ node: SitemapPageNode; variant?: 'root' | 'system' | 'extra' }> = ({ node, variant = 'extra' }) => {
  const isRoot = variant === 'root';
  const isSystem = variant === 'system';

  const headerBg = isRoot ? C.indigoLight : isSystem ? C.greenBg : C.bg;
  const headerBorder = isRoot ? C.indigoBorder : isSystem ? C.greenBorder : C.border;
  const cardBorder = isRoot ? C.indigo : isSystem ? '#86efac' : C.border;
  const titleColor = isRoot ? C.indigo : isSystem ? C.green : C.textDark;

  const IconPath = isRoot
    ? 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'
    : isSystem
    ? 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
    : 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6';

  return (
    <div style={{
      background: C.white,
      border: `1.5px solid ${cardBorder}`,
      borderRadius: 10,
      minWidth: 195,
      maxWidth: 230,
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      flexShrink: 0,
    }}>
      <div style={{
        background: headerBg,
        borderBottom: `1.5px solid ${headerBorder}`,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={titleColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={IconPath} />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: titleColor, letterSpacing: '0.01em' }}>
          {node.name}
        </span>
      </div>
      <div style={{ padding: 6 }}>
        {node.sections.map((s, i) => (
          <div key={i} style={{
            padding: '5px 8px',
            marginBottom: i < node.sections.length - 1 ? 3 : 0,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            background: C.white,
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.textMid, lineHeight: 1.3 }}>
              {s.title}
            </div>
            {s.description && (
              <div style={{ fontSize: 9.5, color: C.textLight, marginTop: 1, lineHeight: 1.3 }}>
                {s.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ node: SitemapPageNode; isRoot?: boolean }> = ({ node, isRoot }) => {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <PageCard node={node} variant={isRoot ? 'root' : 'extra'} />

      {hasChildren && (
        <>
          <div style={{ width: 2, height: 20, background: C.line, flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
            {children.map((child, i) => {
              const isFirst = i === 0;
              const isLast = i === children.length - 1;
              const isOnly = children.length === 1;

              return (
                <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', height: 20 }}>
                    {!isOnly && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: isFirst ? '50%' : 0,
                        right: isLast ? '50%' : 0,
                        height: 2,
                        background: C.line,
                      }} />
                    )}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 2,
                      height: 20,
                      background: C.line,
                    }} />
                  </div>
                  <TreeNode node={child} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const SectionLabel: React.FC<{ label: string; color?: string }> = ({ label, color = C.textLight }) => (
  <div style={{
    fontSize: 10,
    fontWeight: 700,
    color,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 12,
    marginTop: 28,
    paddingBottom: 6,
    borderBottom: `1px solid ${C.border}`,
  }}>
    {label}
  </div>
);

interface SitemapViewProps {
  selectedPackageId: PackageId | null;
  selectedExtras: Record<string, boolean>;
  customInstances: Record<string, CustomInstance[]>;
  clientName?: string;
  subject?: string;
}

const SitemapView: React.FC<SitemapViewProps> = ({
  selectedPackageId,
  selectedExtras,
  customInstances,
  clientName,
  subject,
}) => {
  const data = generateSitemapFromQuote(selectedPackageId, selectedExtras, customInstances);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;

    const el = document.getElementById('sitemap-print-area');
    if (!el) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="hu">
      <head>
        <meta charset="UTF-8"/>
        <title>Site Map${subject ? ' – ' + subject : ''}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: white; padding: 32px; }
          @media print {
            body { padding: 16px; }
            @page { size: A3 landscape; margin: 12mm; }
          }
        </style>
      </head>
      <body>${el.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  if (!data) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        color: C.textLight, fontSize: 13,
        border: `1.5px dashed ${C.border}`, borderRadius: 10,
      }}>
        Válasszon alapcsomagot a Site Map generálásához
      </div>
    );
  }

  const { root, extraPages, systemPages } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textDark }}>Vizuális Site Map</div>
          {(clientName || subject) && (
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>
              {clientName && <span>{clientName}</span>}
              {clientName && subject && <span> · </span>}
              {subject && <span>{subject}</span>}
            </div>
          )}
        </div>
        <button
          onClick={handlePrint}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            background: C.indigo, color: 'white',
            border: 'none', borderRadius: 7,
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Site Map exportálása
        </button>
      </div>

      <div
        id="sitemap-print-area"
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '28px 24px',
          overflowX: 'auto',
        }}
      >
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.indigo }}>Awebes · Site Map</div>
          {(clientName || subject) && (
            <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>
              {clientName && <strong>{clientName}</strong>}
              {clientName && subject && ' · '}
              {subject && subject}
            </div>
          )}
        </div>

        <SectionLabel label="Főoldal struktúra" color={C.indigo} />
        <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
          <TreeNode node={root} isRoot />
        </div>

        {extraPages.length > 0 && (
          <>
            <SectionLabel label={`Extra oldalak (${extraPages.length})`} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {extraPages.map(page => (
                <PageCard key={page.id} node={page} variant="extra" />
              ))}
            </div>
          </>
        )}

        <SectionLabel label="Rendszer oldalak (ingyenes bónusz)" color={C.green} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {systemPages.map(page => (
            <PageCard key={page.id} node={page} variant="system" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitemapView;
