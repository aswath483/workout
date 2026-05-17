const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function uint32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (~crc) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBytes, data]);
  return Buffer.concat([
    uint32be(data.length),
    typeBytes,
    data,
    uint32be(crc32(crcData)),
  ]);
}

function createIcon(size) {
  const rowSize = size * 3 + 1;
  const raw = Buffer.alloc(rowSize * size);

  for (let y = 0; y < size; y++) {
    raw[y * rowSize] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const nx = (x / size - 0.5) * 2;  // -1 to 1
      const ny = (y / size - 0.5) * 2;

      // Rounded square background: #1a1a1a
      // Dumbbell icon in #4ade80 (green accent)

      // Dumbbell shape: bar in center + two plates
      const barH = 0.18;
      const barW = 0.7;
      const plateW = 0.22;
      const plateH = 0.55;
      const plateOffset = 0.38;

      const inBar = Math.abs(ny) < barH && Math.abs(nx) < barW;
      const inLeftPlate = Math.abs(nx + plateOffset) < plateW && Math.abs(ny) < plateH;
      const inRightPlate = Math.abs(nx - plateOffset) < plateW && Math.abs(ny) < plateH;
      const inIcon = inBar || inLeftPlate || inRightPlate;

      const idx = y * rowSize + 1 + x * 3;
      if (inIcon) {
        raw[idx] = 74; raw[idx + 1] = 222; raw[idx + 2] = 128; // #4ade80
      } else {
        raw[idx] = 26; raw[idx + 1] = 26; raw[idx + 2] = 26;   // #1a1a1a
      }
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.concat([
    uint32be(size), uint32be(size),
    Buffer.from([8, 2, 0, 0, 0]),
  ]);
  const ihdr = pngChunk('IHDR', ihdrData);
  const idat = pngChunk('IDAT', zlib.deflateSync(raw));
  const iend = pngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createIcon(512));
console.log('Icons generated: icon-192.png, icon-512.png');
