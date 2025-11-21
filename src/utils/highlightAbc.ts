import { ABC_FIELD_PATTERN } from '../types/abc';

// ABC記法のシンタックスハイライト
export const highlightAbc = (code: string): string => {
  const lines = code.split('\n');

  return lines
    .map((line) => {
      // ABC記法の正式なフィールドのハイライト
      const match = line.match(ABC_FIELD_PATTERN);
      if (match) {
        const [, key, value] = match;
        return `<span class="abc-meta-key">${escapeHtml(key)}</span><span class="abc-meta-value">${escapeHtml(value)}</span>`;
      }

      // 通常のテキスト
      return `<span class="abc-text">${escapeHtml(line)}</span>`;
    })
    .join('\n');
};

// HTMLエスケープ
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
