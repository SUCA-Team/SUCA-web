// Romaji to Hiragana conversion tailored for search input.
// Rules:
// - Convert romaji to hiragana outside of double quotes
// - Preserve content inside double quotes
// - Leave existing kana unchanged; handle mixed input by converting only romaji segments
// - Basic handling for sokuon (double consonant → っ) and chōon is omitted for simplicity

const DIGRAPHS: Record<string, string> = {
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
  gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
  sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
  cya: 'ちゃ', cyu: 'ちゅ', cyo: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
  pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
  zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  tsa: 'つぁ', tsi: 'つぃ', tse: 'つぇ', tso: 'つぉ',
};

const MONOGRAPHS: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', ti: 'ち', chi: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', hu: 'ふ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yi: 'い', yu: 'ゆ', ye: 'いぇ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wi: 'うぃ', we: 'うぇ', wo: 'を',
  n: 'ん', nn: 'ん',
};

const HIRAGANA_RANGE = /[\u3040-\u309F]/;
const KATAKANA_RANGE = /[\u30A0-\u30FF]/;

function isKanaChar(ch: string): boolean {
  return HIRAGANA_RANGE.test(ch) || KATAKANA_RANGE.test(ch);
}

/**
 * Convert romaji to kana for a single unquoted segment.
 */
function convertRomajiSegmentToKana(input: string): string {
  let i = 0;
  let out = '';
  const s = input;

  while (i < s.length) {
    const rest = s.slice(i);

    // Preserve existing kana as-is
    if (isKanaChar(s[i])) {
      out += s[i];
      i += 1;
      continue;
    }

    // Sokuon: double consonant (e.g., kk → っ + k)
    if (
      i + 1 < s.length &&
      /[bcdfghjklmnpqrstvwxyz]/i.test(s[i]) &&
      s[i].toLowerCase() === s[i + 1].toLowerCase() &&
      s[i].toLowerCase() !== 'n'
    ) {
      out += 'っ';
      i += 1;
      continue;
    }

    // Try digraphs (3-char) first
    const tri = s.slice(i, i + 3).toLowerCase();
    if (DIGRAPHS[tri]) {
      out += DIGRAPHS[tri];
      i += 3;
      continue;
    }

    // Try monographs (1-2-3 letters variants in table)
    // Prefer 3, then 2, then 1
    const three = s.slice(i, i + 3).toLowerCase();
    if (MONOGRAPHS[three]) {
      out += MONOGRAPHS[three];
      i += 3;
      continue;
    }
    const two = s.slice(i, i + 2).toLowerCase();
    if (MONOGRAPHS[two]) {
      out += MONOGRAPHS[two];
      i += 2;
      continue;
    }
    const one = s.slice(i, i + 1).toLowerCase();
    if (MONOGRAPHS[one]) {
      out += MONOGRAPHS[one];
      i += 1;
      continue;
    }

    // Fallback: copy character as-is (spaces, punctuation, unknowns)
    out += s[i];
    i += 1;
  }
  return out;
}

/**
 * Convert search input respecting quoted segments.
 * Example: mizu → みず; "mizu" stays as "mizu"; mixed miず → みず.
 */
export function convertSearchInput(input: string): string {
  if (!input.trim()) return input;

  // Split by quotes, keep quotes intact; convert only segments outside quotes
  const parts: string[] = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] === '"') {
      const end = input.indexOf('"', i + 1);
      if (end === -1) {
        // No closing quote; treat rest as quoted
        parts.push(input.slice(i));
        break;
      } else {
        parts.push(input.slice(i, end + 1));
        i = end + 1;
      }
    } else {
      // Unquoted run until next quote
      const nextQuote = input.indexOf('"', i);
      const segment = nextQuote === -1 ? input.slice(i) : input.slice(i, nextQuote);
      parts.push(convertRomajiSegmentToKana(segment));
      i = nextQuote === -1 ? input.length : nextQuote;
    }
  }

  return parts.join('');
}

export default convertSearchInput;
