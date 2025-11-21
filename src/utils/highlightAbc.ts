import {
  ABC_FIELD_PATTERN,
  ABC_NOTE_PATTERN,
  ABC_ACCIDENTAL_PATTERN,
  ABC_BAR_PATTERN,
  ABC_CHORD_BRACKET_PATTERN,
  ABC_SLUR_PATTERN,
  ABC_TUPLET_PATTERN,
  ABC_DURATION_PATTERN,
  ABC_REST_PATTERN,
  ABC_TIE_PATTERN,
  ABC_ORNAMENT_PATTERN,
  ABC_COMMENT_PATTERN,
} from '../types/abc';

// パース結果の型定義
export interface ParseResult {
  html: string;
  nextIndex: number;
  slurLevelDelta?: number; // スラーレベルの増減 (+1: 開始, -1: 終了)
}

// HTMLエスケープ
export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 小節線のパース
export const parseBarLine = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  if (char !== '|' && char !== ':') {
    return null;
  }

  let barSymbol = char;
  let j = index + 1;

  // |:, :|, ||, :: などをまとめて取得
  while (j < line.length && (line[j] === '|' || line[j] === ':' || line[j] === ']')) {
    barSymbol += line[j];
    j++;
  }

  if (ABC_BAR_PATTERN.test(barSymbol)) {
    return {
      html: `<span class="abc-bar">${escapeHtml(barSymbol)}</span>`,
      nextIndex: j,
    };
  }

  return null;
};

// 臨時記号のパース
export const parseAccidental = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  if (ABC_ACCIDENTAL_PATTERN.test(char)) {
    return {
      html: `<span class="abc-accidental">${escapeHtml(char)}</span>`,
      nextIndex: index + 1,
    };
  }

  return null;
};

// 連音符記号またはスラーのパース
export const parseTupletOrSlur = (
  line: string,
  index: number,
  slurLevel: number
): ParseResult | null => {
  const char = line[index];

  if (!ABC_SLUR_PATTERN.test(char)) {
    return null;
  }

  if (char === '(') {
    // 次の文字が数字なら連音符記号
    if (index + 1 < line.length && /\d/.test(line[index + 1])) {
      let tuplet = char;
      let j = index + 1;

      // 数字を取得
      while (j < line.length && /\d/.test(line[j])) {
        tuplet += line[j];
        j++;
      }

      // 連音符記号として処理
      if (ABC_TUPLET_PATTERN.test(tuplet)) {
        return {
          html: `<span class="abc-tuplet">${escapeHtml(tuplet)}</span>`,
          nextIndex: j,
          slurLevelDelta: 0,
        };
      }
    }

    // 通常のスラー開始括弧
    return {
      html: `<span class="abc-slur abc-slur-level-${slurLevel % 5}">${escapeHtml(char)}</span>`,
      nextIndex: index + 1,
      slurLevelDelta: 1,
    };
  } else if (char === ')') {
    // スラー終了括弧
    const newSlurLevel = Math.max(0, slurLevel - 1);
    return {
      html: `<span class="abc-slur abc-slur-level-${newSlurLevel % 5}">${escapeHtml(char)}</span>`,
      nextIndex: index + 1,
      slurLevelDelta: -1,
    };
  }

  return null;
};

// 音符と音長記号のパース
export const parseNoteWithDuration = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  if (!ABC_NOTE_PATTERN.test(char)) {
    return null;
  }

  let html = `<span class="abc-note">${escapeHtml(char)}</span>`;
  let j = index + 1;

  // 音符の後に続く音長記号をチェック
  let duration = '';

  // 音長記号の先読み: /?\d+(/\d+)?
  if (j < line.length && (line[j] === '/' || /\d/.test(line[j]))) {
    // 先頭の / を取得
    if (line[j] === '/') {
      duration += line[j];
      j++;
    }

    // 数字を取得
    while (j < line.length && /\d/.test(line[j])) {
      duration += line[j];
      j++;
    }

    // 分数の場合: /\d+
    if (j < line.length && line[j] === '/') {
      duration += line[j];
      j++;

      // 分母の数字を取得
      while (j < line.length && /\d/.test(line[j])) {
        duration += line[j];
        j++;
      }
    }

    // 音長記号が有効な形式かチェック
    if (duration && ABC_DURATION_PATTERN.test(duration)) {
      // 音長記号のタイプを判定
      let durationClass = 'abc-duration';

      if (duration.startsWith('/')) {
        // 短い音: /2, /4, /8 など
        durationClass += ' abc-duration-short';
      } else if (duration.includes('/')) {
        // 混合分数: 3/2, 5/4 など
        durationClass += ' abc-duration-fraction';
      } else {
        // 長い音: 2, 4, 8 など
        durationClass += ' abc-duration-long';
      }

      html += `<span class="${durationClass}">${escapeHtml(duration)}</span>`;
    }
  }

  return {
    html,
    nextIndex: j,
  };
};

// 和音括弧のパース
export const parseChordBracket = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  if (ABC_CHORD_BRACKET_PATTERN.test(char)) {
    return {
      html: `<span class="abc-chord">${escapeHtml(char)}</span>`,
      nextIndex: index + 1,
    };
  }

  return null;
};

// 休符と音長記号のパース
export const parseRest = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  if (!ABC_REST_PATTERN.test(char)) {
    return null;
  }

  // x は見えない休符なので別のクラスを使用
  const restClass = char === 'x' ? 'abc-rest-invisible' : 'abc-rest';
  let html = `<span class="${restClass}">${escapeHtml(char)}</span>`;
  let j = index + 1;

  // 休符の後に続く音長記号をチェック
  let duration = '';

  // 音長記号の先読み: /?\\d+(/\\d+)?
  if (j < line.length && (line[j] === '/' || /\d/.test(line[j]))) {
    // 先頭の / を取得
    if (line[j] === '/') {
      duration += line[j];
      j++;
    }

    // 数字を取得
    while (j < line.length && /\d/.test(line[j])) {
      duration += line[j];
      j++;
    }

    // 分数の場合: /\\d+
    if (j < line.length && line[j] === '/') {
      duration += line[j];
      j++;

      // 分母の数字を取得
      while (j < line.length && /\d/.test(line[j])) {
        duration += line[j];
        j++;
      }
    }

    // 音長記号が有効な形式かチェック
    if (duration && ABC_DURATION_PATTERN.test(duration)) {
      // 音長記号のタイプを判定
      let durationClass = 'abc-duration';

      if (duration.startsWith('/')) {
        // 短い音: /2, /4, /8 など
        durationClass += ' abc-duration-short';
      } else if (duration.includes('/')) {
        // 混合分数: 3/2, 5/4 など
        durationClass += ' abc-duration-fraction';
      } else {
        // 長い音: 2, 4, 8 など
        durationClass += ' abc-duration-long';
      }

      html += `<span class="${durationClass}">${escapeHtml(duration)}</span>`;
    }
  }

  return {
    html,
    nextIndex: j,
  };
};

// タイのパース
export const parseTie = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // タイは - または .- (破線タイ)
  if (char === '-') {
    return {
      html: `<span class="abc-tie">${escapeHtml(char)}</span>`,
      nextIndex: index + 1,
    };
  }

  // 破線タイ: .-
  if (char === '.' && index + 1 < line.length && line[index + 1] === '-') {
    const tie = '.-';
    return {
      html: `<span class="abc-tie abc-tie-dotted">${escapeHtml(tie)}</span>`,
      nextIndex: index + 2,
    };
  }

  return null;
};

// 装飾記号のパース
export const parseOrnament = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // 装飾記号パターンにマッチするかチェック
  if (!ABC_ORNAMENT_PATTERN.test(char)) {
    return null;
  }

  // '.' は破線タイ '.-' の可能性があるので、次の文字をチェック
  if (char === '.' && index + 1 < line.length && line[index + 1] === '-') {
    // これは破線タイなので、ここでは処理しない
    return null;
  }

  return {
    html: `<span class="abc-ornament">${escapeHtml(char)}</span>`,
    nextIndex: index + 1,
  };
};

// 楽譜行の文字単位ハイライト
export const highlightMusicLine = (line: string): string => {
  let result = '';
  let i = 0;
  let slurLevel = 0; // スラーのネストレベル

  while (i < line.length) {
    // 各パーサーを順番に試す
    const barLine = parseBarLine(line, i);
    if (barLine) {
      result += barLine.html;
      i = barLine.nextIndex;
      continue;
    }

    const accidental = parseAccidental(line, i);
    if (accidental) {
      result += accidental.html;
      i = accidental.nextIndex;
      continue;
    }

    const ornament = parseOrnament(line, i);
    if (ornament) {
      result += ornament.html;
      i = ornament.nextIndex;
      continue;
    }

    const tupletOrSlur = parseTupletOrSlur(line, i, slurLevel);
    if (tupletOrSlur) {
      result += tupletOrSlur.html;
      i = tupletOrSlur.nextIndex;
      if (tupletOrSlur.slurLevelDelta) {
        slurLevel += tupletOrSlur.slurLevelDelta;
      }
      continue;
    }

    const rest = parseRest(line, i);
    if (rest) {
      result += rest.html;
      i = rest.nextIndex;
      continue;
    }

    const noteWithDuration = parseNoteWithDuration(line, i);
    if (noteWithDuration) {
      result += noteWithDuration.html;
      i = noteWithDuration.nextIndex;
      continue;
    }

    const chordBracket = parseChordBracket(line, i);
    if (chordBracket) {
      result += chordBracket.html;
      i = chordBracket.nextIndex;
      continue;
    }

    const tie = parseTie(line, i);
    if (tie) {
      result += tie.html;
      i = tie.nextIndex;
      continue;
    }

    // その他の文字
    result += `<span class="abc-text">${escapeHtml(line[i])}</span>`;
    i++;
  }

  return result;
};

// ABC記法のシンタックスハイライト
export const highlightAbc = (code: string): string => {
  const lines = code.split('\n');

  return lines
    .map((line) => {
      // コメント行のハイライト
      if (ABC_COMMENT_PATTERN.test(line)) {
        return `<span class="abc-comment">${escapeHtml(line)}</span>`;
      }

      // ABC記法の正式なフィールドのハイライト
      const match = line.match(ABC_FIELD_PATTERN);
      if (match) {
        const [, key, value] = match;
        return `<span class="abc-meta-key">${escapeHtml(key)}</span><span class="abc-meta-value">${escapeHtml(value)}</span>`;
      }

      // 楽譜部分の文字単位ハイライト
      return highlightMusicLine(line);
    })
    .join('\n');
};
