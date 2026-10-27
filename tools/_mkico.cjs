
const fs = require('fs');
const dir = 'C:/Users/elysia/.dsh/chat-digest/assets';
const sizes = [256, 64, 48, 32, 16];
const pngs = sizes.map(s => fs.readFileSync(dir + '/icon-' + s + '.png'));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
const entries = [];
let offset = 6 + 16 * sizes.length;
for (let i = 0; i < sizes.length; i++) {
  const s = sizes[i], png = pngs[i];
  const e = Buffer.alloc(16);
  e[0] = s >= 256 ? 0 : s; e[1] = s >= 256 ? 0 : s;
  e[2] = 0; e[3] = 0;
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
  offset += png.length;
  entries.push(e);
}
fs.writeFileSync(dir + '/icon.ico', Buffer.concat([header, ...entries, ...pngs]));
console.log('ico ok', sizes.join('/'), (fs.statSync(dir + '/icon.ico').size), 'bytes');
