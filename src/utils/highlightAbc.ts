// ABC記法のシンタックスハイライト
export const highlightAbc = (code: string): string => {
  const lines = code.split('\n');

  return lines
    .map((line) => {
      // メタ情報のハイライト (X:, T:, M:, K:, L:, C:, など)
      if (/^[A-Z]:\s*/.test(line)) {
        const match = line.match(/^([A-Z]:)(.*)$/);
        if (match) {
          const [, key, value] = match;
          return `<span class="abc-meta-key">${key}</span><span class="abc-meta-value">${value}</span>`;
        }
      }

      // 通常のテキスト
      return `<span class="abc-text">${line}</span>`;
    })
    .join('\n');
};
