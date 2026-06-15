import React from 'react';
import { Box } from '@mui/material';
import { PAGE_LAYOUT_STANDARD, LAYOUT_PREVIEW_COLORS } from './pageLayouts';

interface LayoutPreviewProps {
  /** Layout-Wert ('' / undefined = Standard). */
  layout?: string;
  width?: number;
  height?: number;
}

/**
 * Schematische Mini-Vorschau eines Seiten-Layouts.
 *
 * Alle unterstützten Layouts sind zweispaltig: links die Formularfelder (angedeutet als
 * graue Zeilen), rechts der content-Slot, dessen Darstellung sich je Layout unterscheidet —
 * genau so, wie portal die rechte Spalte rendert:
 *  - Standard:           zentrierter, schmaler Block
 *  - 2_COL_RIGHT_WIDER:  zentrierter, breiter Block
 *  - 2_COL_RIGHT_FILL:   ein Block füllt die gesamte rechte Spalte
 */
const LayoutPreview: React.FC<LayoutPreviewProps> = ({ layout, width = 132, height = 84 }) => {
  const value = layout || PAGE_LAYOUT_STANDARD;
  const pad = 6;
  const gap = 6;
  const leftW = Math.round(width * 0.4);
  const rightX = pad + leftW + gap;
  const rightW = width - rightX - pad;
  const innerH = height - pad * 2;

  // Rechter Block je Layout: x-Offset + Breite.
  let blockX = rightX;
  let blockW = rightW;
  if (value === '2_COL_RIGHT_FILL') {
    blockX = rightX;
    blockW = rightW;
  } else if (value === '2_COL_RIGHT_WIDER') {
    const inset = Math.round(rightW * 0.12);
    blockX = rightX + inset;
    blockW = rightW - inset * 2;
  } else {
    // Standard: schmaler, stärker eingerückt.
    const inset = Math.round(rightW * 0.26);
    blockX = rightX + inset;
    blockW = rightW - inset * 2;
  }

  // Angedeutete Formularzeilen links.
  const rowH = 6;
  const rowGap = 8;
  const rows = Math.max(1, Math.floor((innerH + rowGap) / (rowH + rowGap)));

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      sx={{ display: 'block', borderRadius: 1 }}
      role="img"
      aria-label="Layout-Vorschau"
    >
      {/* Rahmen */}
      <rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        rx={4}
        fill={LAYOUT_PREVIEW_COLORS.muted}
        stroke={LAYOUT_PREVIEW_COLORS.frame}
      />
      {/* Linke Spalte: Formularzeilen */}
      {Array.from({ length: rows }).map((_, i) => (
        <rect
          key={i}
          x={pad}
          y={pad + i * (rowH + rowGap)}
          width={i % 3 === 2 ? Math.round(leftW * 0.6) : leftW}
          height={rowH}
          rx={2}
          fill={LAYOUT_PREVIEW_COLORS.frame}
        />
      ))}
      {/* Rechter content-Block */}
      <rect
        x={blockX}
        y={pad}
        width={Math.max(8, blockW)}
        height={innerH}
        rx={3}
        fill={LAYOUT_PREVIEW_COLORS.block}
        opacity={0.85}
      />
    </Box>
  );
};

export default LayoutPreview;
