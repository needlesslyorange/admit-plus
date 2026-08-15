// Pure Node.js PNG generator with no external dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createIconPNG(size, filename) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      const nx = (x / (width - 1)) * 2 - 1;
      const ny = (y / (height - 1)) * 2 - 1;
      
      const cornerRadius = 0.35;
      const qx = Math.max(Math.abs(nx) - (1 - cornerRadius), 0);
      const qy = Math.max(Math.abs(ny) - (1 - cornerRadius), 0);
      const dist = Math.sqrt(qx * qx + qy * qy);
      const inside = dist <= cornerRadius;

      if (!inside) {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Background gradient: Midnight navy to rich slate
      const grad = (ny + 1) / 2;
      let r = Math.round(15 + grad * 25);
      let g = Math.round(23 + grad * 40);
      let b = Math.round(42 + grad * 80);
      let a = 255;

      // Draw subtle inner border
      if (dist > cornerRadius - 0.08 || Math.abs(nx) > 0.92 || Math.abs(ny) > 0.92) {
        r = Math.min(255, r + 40);
        g = Math.min(255, g + 60);
        b = Math.min(255, b + 100);
      }

      // Draw Crescent Moon Shape on left-center
      const dMoon = Math.hypot(nx - (-0.2), ny - 0.0);
      const dCut = Math.hypot(nx - (-0.02), ny - (-0.15));
      const inMoon = dMoon <= 0.48 && dCut > 0.44;

      // Draw '+' Symbol on right-center: center at (0.38, -0.05)
      const px = nx - 0.38;
      const py = ny - (-0.05);
      const plusThick = 0.09;
      const plusLen = 0.32;
      const inPlusH = Math.abs(px) <= plusLen && Math.abs(py) <= plusThick;
      const inPlusV = Math.abs(px) <= plusThick && Math.abs(py) <= plusLen;
      const inPlus = inPlusH || inPlusV;

      if (inMoon) {
        // Glowing cyan crescent
        r = 56;
        g = 189;
        b = 248; // #38bdf8
      } else if (inPlus) {
        // Bright emerald plus
        r = 52;
        g = 211;
        b = 153; // #34d399
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression: Deflate (0)
  ihdrData[11] = 0; // Filter: standard (0)
  ihdrData[12] = 0; // Interlace: none (0)
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(filename, pngBuffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 32, 48, 128].forEach(size => {
  createIconPNG(size, path.join(iconsDir, `icon-${size}.png`));
});

console.log('All icons generated successfully!');
