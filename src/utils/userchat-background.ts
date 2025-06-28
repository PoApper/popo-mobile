function fastHash(text: string) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = (hash << 1) | (hash >>> 7);
  }

  return Math.abs(hash) % 6;
}

const chatUserBackgroundColorMap = [
  '#FFB5D5',
  '#FFBC7E',
  '#FFF99E',
  '#94E3C6',
  '#B5DBFF',
  '#F0ADFF',
];

export function getColor(text: string) {
  return chatUserBackgroundColorMap[fastHash(text)];
}
