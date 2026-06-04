
import React from 'react';

interface ResearchViewProps {
  content: string;
}

// Parse **bold** text into spans
function parseBoldText(line: string): React.ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Parse a table from consecutive | lines
function parseTable(lines: string[]): React.ReactNode {
  const rows = lines
    .filter(l => l.trim().startsWith('|') && !l.match(/^\|[-| ]+\|$/))
    .map(l =>
      l.trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim())
    );

  if (rows.length === 0) return null;
  const [header, ...body] = rows;

  return (
    <div style={{ overflowX: 'auto', marginBottom: 16 }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th key={i} style={{
                background: '#eef2ff',
                color: '#3730a3',
                padding: '8px 12px',
                fontWeight: 700,
                textAlign: 'left',
                borderBottom: '2px solid #c7d2fe',
                whiteSpace: 'nowrap',
              }}>
                {parseBoldText(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '7px 12px',
                  color: '#334155',
                  borderBottom: '1px solid #f1f5f9',
                  verticalAlign: 'top',
                }}>
                  {parseBoldText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ResearchView: React.FC<ResearchViewProps> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} style={{
          fontSize: 20, fontWeight: 800, color: '#4f46e5',
          marginBottom: 4, marginTop: elements.length > 0 ? 24 : 0,
          borderBottom: '2px solid #e0e7ff', paddingBottom: 8,
        }}>
          {parseBoldText(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} style={{
          fontSize: 16, fontWeight: 700, color: '#3730a3',
          marginTop: 28, marginBottom: 10,
          borderLeft: '3px solid #6366f1', paddingLeft: 10,
        }}>
          {parseBoldText(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} style={{
          fontSize: 14, fontWeight: 700, color: '#1e293b',
          marginTop: 18, marginBottom: 8,
        }}>
          {parseBoldText(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      elements.push(
        <hr key={i} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />
      );
      i++;
      continue;
    }

    // Table block — collect all consecutive table lines
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<div key={`table-${i}`}>{parseTable(tableLines)}</div>);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} style={{
          background: '#eff6ff',
          borderLeft: '4px solid #6366f1',
          borderRadius: '0 8px 8px 0',
          padding: '10px 16px',
          margin: '12px 0',
          color: '#1e40af',
          fontSize: 13,
        }}>
          {parseBoldText(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Numbered list item (1. text)
    if (/^\d+\. /.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i].replace(/^\d+\. /, '');
        listItems.push(
          <li key={i} style={{ marginBottom: 4, color: '#334155', fontSize: 13 }}>
            {parseBoldText(text)}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ paddingLeft: 20, margin: '8px 0 12px' }}>
          {listItems}
        </ol>
      );
      continue;
    }

    // Bullet list item
    if (line.startsWith('- ')) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        const text = lines[i].slice(2);
        listItems.push(
          <li key={i} style={{ marginBottom: 4, color: '#334155', fontSize: 13 }}>
            {parseBoldText(text)}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: 20, margin: '8px 0 12px' }}>
          {listItems}
        </ul>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{ fontSize: 13, color: '#334155', marginBottom: 8, lineHeight: 1.6 }}>
        {parseBoldText(line)}
      </p>
    );
    i++;
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 10,
      padding: '24px 28px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      lineHeight: 1.6,
    }}>
      {elements}
    </div>
  );
};

export default ResearchView;
