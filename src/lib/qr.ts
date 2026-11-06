/**
 * Zero-dependency ISO/IEC 18004 QR Code generator (Byte mode, ECC Level L, Versions 1..10).
 * Renders a high-contrast PNG data URL via HTMLCanvasElement with a standard 4-module quiet zone.
 */

const VERSION_L: { total: number; ecPerBlock: number; blocks: [number, number][] }[] = [
  { total: 0, ecPerBlock: 0, blocks: [] },
  { total: 26, ecPerBlock: 7, blocks: [[1, 19]] },
  { total: 44, ecPerBlock: 10, blocks: [[1, 34]] },
  { total: 70, ecPerBlock: 15, blocks: [[1, 55]] },
  { total: 100, ecPerBlock: 20, blocks: [[1, 80]] },
  { total: 134, ecPerBlock: 26, blocks: [[1, 108]] },
  { total: 172, ecPerBlock: 18, blocks: [[2, 68]] },
  { total: 196, ecPerBlock: 20, blocks: [[2, 78]] },
  { total: 242, ecPerBlock: 24, blocks: [[2, 97]] },
  { total: 292, ecPerBlock: 30, blocks: [[2, 116]] },
  { total: 346, ecPerBlock: 18, blocks: [[2, 68], [2, 69]] },
];

// 18-bit BCH(18,6) version information for Versions 7..10 (ISO/IEC 18004 Annex D)
const VERSION_INFO_BITS: Record<number, number> = {
  7: 0x07c94,
  8: 0x085bc,
  9: 0x09a99,
  10: 0x0a4d3,
};

const ALIGNMENT_POS: number[][] = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

// GF(256) with primitive polynomial 0x11d
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const root = EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLen);
  const rem = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ rem[0];
    rem.copyWithin(0, 1);
    rem[ecLen - 1] = 0;
    for (let j = 0; j < ecLen; j++) {
      rem[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return rem;
}

function safePayloadBytes(text: string): Uint8Array {
  const enc = new TextEncoder();
  const raw = enc.encode(text);
  // Version 10-L max byte capacity is 271 bytes (346 - 4*18 = 274 codewords, minus 3 bytes header)
  if (raw.length <= 271) return raw;
  try {
    const u = new URL(text);
    const originBytes = enc.encode(u.origin);
    if (originBytes.length <= 271) return originBytes;
  } catch {
    /* not a valid URL */
  }
  return raw.subarray(0, 271);
}

export function encodeMatrix(text: string): boolean[][] {
  const bytes = safePayloadBytes(text);
  let ver = 1;
  while (ver <= 10) {
    const spec = VERSION_L[ver];
    const dataCap = spec.blocks.reduce((acc, [c, k]) => acc + c * k, 0);
    const overhead = ver < 10 ? 2 : 3;
    if (bytes.length + overhead <= dataCap) break;
    ver++;
  }
  if (ver > 10) ver = 10;

  const spec = VERSION_L[ver];
  const dataCap = spec.blocks.reduce((acc, [c, k]) => acc + c * k, 0);

  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };

  pushBits(0b0100, 4); // Byte mode
  pushBits(bytes.length, ver < 10 ? 8 : 16);
  for (const b of bytes) pushBits(b, 8);
  pushBits(0, Math.min(4, dataCap * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords = new Uint8Array(dataCap);
  for (let i = 0; i < bits.length / 8 && i < dataCap; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i * 8 + b];
    codewords[i] = byte;
  }
  const pads = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < dataCap; i++, p ^= 1) {
    codewords[i] = pads[p];
  }

  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;
  for (const [count, k] of spec.blocks) {
    for (let i = 0; i < count; i++) {
      const blk = codewords.subarray(offset, offset + k);
      offset += k;
      dataBlocks.push(blk);
      ecBlocks.push(rsEncode(blk, spec.ecPerBlock));
    }
  }

  const finalBytes: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const b of dataBlocks) if (i < b.length) finalBytes.push(b[i]);
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (const b of ecBlocks) finalBytes.push(b[i]);
  }

  const size = ver * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunc: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunc = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = dark;
      isFunc[r][c] = true;
    }
  };

  const drawFinder = (r0: number, c0: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunc(r0 + dr, c0 + dc, inOuter && (onBorder || inInner));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  const align = ALIGNMENT_POS[ver];
  for (const r of align) {
    for (const c of align) {
      if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          setFunc(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
        }
      }
    }
  }

  // Version 7..10: write 18-bit version info in top-right (6x3) and bottom-left (3x6)
  if (ver >= 7 && VERSION_INFO_BITS[ver]) {
    const vBits = VERSION_INFO_BITS[ver];
    for (let i = 0; i < 18; i++) {
      const bit = ((vBits >>> i) & 1) !== 0;
      const a = Math.floor(i / 3);
      const b = (i % 3) + size - 11;
      // Top-right (rows 0..5, cols size-11..size-9)
      setFunc(a, b, bit);
      // Bottom-left (rows size-11..size-9, cols 0..5)
      setFunc(b, a, bit);
    }
  }

  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      setFunc(8, i, false);
      setFunc(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    setFunc(8, size - 1 - i, false);
    setFunc(size - 1 - i, 8, false);
  }
  setFunc(size - 8, 8, true);

  let bitIdx = 0;
  const totalBits = finalBytes.length * 8;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      const r = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        if (!isFunc[r][c]) {
          let dark = false;
          if (bitIdx < totalBits) {
            dark = ((finalBytes[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) !== 0;
            bitIdx++;
          }
          if ((r + c) % 2 === 0) dark = !dark;
          modules[r][c] = dark;
        }
      }
    }
    upward = !upward;
  }

  const fmt = 0x77c4;
  const fBit = (i: number) => ((fmt >>> i) & 1) !== 0;

  for (let i = 0; i <= 5; i++) setFunc(i, 8, fBit(i));
  setFunc(7, 8, fBit(6));
  setFunc(8, 8, fBit(7));
  for (let i = 8; i < 15; i++) setFunc(size - 15 + i, 8, fBit(i));

  for (let i = 0; i <= 7; i++) setFunc(8, size - 1 - i, fBit(i));
  setFunc(8, 7, fBit(8));
  for (let i = 9; i < 15; i++) setFunc(8, 14 - i, fBit(i));

  return modules;
}

export function createQrDataUrl(text: string, darkColor = '#0f1419', lightColor = '#ffffff', pixelSize = 160): string {
  const matrix = encodeMatrix(text || 'https://xtracticle.com');
  const n = matrix.length;
  const margin = 4; // Standard 4-module quiet zone for reliable scanning across all readers
  const totalModules = n + margin * 2;
  const cell = Math.max(3, Math.floor(pixelSize / totalModules));
  const canvasSize = totalModules * cell;

  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  ctx.fillStyle = darkColor;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        ctx.fillRect((c + margin) * cell, (r + margin) * cell, cell, cell);
      }
    }
  }
  return canvas.toDataURL('image/png');
}
