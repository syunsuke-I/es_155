import {
  ABC_FIELD_PATTERN,
  ABC_NOTE_PATTERN,
  ABC_ACCIDENTAL_PATTERN,
  ABC_OCTAVE_PATTERN,
  ABC_BAR_PATTERN,
  ABC_CHORD_BRACKET_PATTERN,
  ABC_SLUR_PATTERN,
  ABC_TUPLET_PATTERN,
  ABC_DURATION_PATTERN,
  ABC_REST_PATTERN,
  ABC_TIE_PATTERN,
  ABC_ORNAMENT_PATTERN,
  ABC_CHORD_SYMBOL_PATTERN,
  ABC_ANNOTATION_PATTERN,
  ABC_DECORATION_PATTERN,
  ABC_GRACE_NOTE_PATTERN,
  ABC_VOLTA_BRACKET_PATTERN,
  ABC_INLINE_FIELD_PATTERN,
  ABC_BROKEN_RHYTHM_PATTERN,
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
    // 複縦線 (||) の場合は特別なクラスを使用
    const barClass = barSymbol === '||' ? 'abc-bar-double' : 'abc-bar';
    return {
      html: `<span class="${barClass}">${escapeHtml(barSymbol)}</span>`,
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

  // 音符の後に続くオクターブ記号をチェック (': 高く, ,: 低く)
  let octave = '';
  while (j < line.length && ABC_OCTAVE_PATTERN.test(line[j])) {
    octave += line[j];
    j++;
  }

  if (octave) {
    // オクターブ記号の種類を判定
    const octaveClass = octave[0] === "'" ? 'abc-octave-high' : 'abc-octave-low';
    html += `<span class="${octaveClass}">${escapeHtml(octave)}</span>`;
  }

  // 音符の後に続く音長記号をチェック
  let duration = '';
  const durationStart = j; // 音長記号の開始位置を記憶

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
    } else {
      // 音長記号として無効な場合は位置を戻す（/を消費しない）
      j = durationStart;
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
  const durationStart = j; // 音長記号の開始位置を記憶

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
    } else {
      // 音長記号として無効な場合は位置を戻す
      j = durationStart;
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

  // 破線タイ: .- を先にチェック（より長いパターン優先）
  if (char === '.' && index + 1 < line.length && line[index + 1] === '-') {
    const tie = '.-';
    if (ABC_TIE_PATTERN.test(tie)) {
      return {
        html: `<span class="abc-tie abc-tie-dotted">${escapeHtml(tie)}</span>`,
        nextIndex: index + 2,
      };
    }
  }

  // 通常のタイ: -
  if (char === '-') {
    if (ABC_TIE_PATTERN.test(char)) {
      return {
        html: `<span class="abc-tie">${escapeHtml(char)}</span>`,
        nextIndex: index + 1,
      };
    }
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

// 注釈のパース
export const parseAnnotation = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // 注釈は " で始まる
  if (char !== '"') {
    return null;
  }

  // 閉じる " を探す
  let j = index + 1;
  while (j < line.length && line[j] !== '"') {
    j++;
  }

  // 閉じる " が見つからない場合
  if (j >= line.length) {
    return null;
  }

  // " を含めた注釈全体を取得
  const annotation = line.substring(index, j + 1);

  // 注釈パターンチェック (^, _, <, >, @ で始まる)
  if (!ABC_ANNOTATION_PATTERN.test(annotation)) {
    return null;
  }

  return {
    html: `<span class="abc-annotation">${escapeHtml(annotation)}</span>`,
    nextIndex: j + 1,
  };
};

// コード記号のパース
export const parseChordSymbol = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // コード記号は " で始まる
  if (char !== '"') {
    return null;
  }

  // 閉じる " を探す
  let j = index + 1;
  while (j < line.length && line[j] !== '"') {
    j++;
  }

  // 閉じる " が見つからない場合
  if (j >= line.length) {
    return null;
  }

  // " を含めた文字列全体を取得
  const quotedString = line.substring(index, j + 1);

  // 注釈かどうかチェック（注釈なら null を返す）
  if (ABC_ANNOTATION_PATTERN.test(quotedString)) {
    return null;
  }

  // コード記号パターンチェック
  if (!ABC_CHORD_SYMBOL_PATTERN.test(quotedString)) {
    return null;
  }

  return {
    html: `<span class="abc-chord-symbol">${escapeHtml(quotedString)}</span>`,
    nextIndex: j + 1,
  };
};

// 装飾記号のパース
export const parseDecoration = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // 装飾記号は ! で始まる
  if (char !== '!') {
    return null;
  }

  // 閉じる ! を探す
  let j = index + 1;
  while (j < line.length && line[j] !== '!') {
    j++;
  }

  // 閉じる ! が見つからない場合
  if (j >= line.length) {
    return null;
  }

  // ! を含めた装飾記号全体を取得
  const decoration = line.substring(index, j + 1);

  // パターンチェック
  if (!ABC_DECORATION_PATTERN.test(decoration)) {
    return null;
  }

  return {
    html: `<span class="abc-decoration">${escapeHtml(decoration)}</span>`,
    nextIndex: j + 1,
  };
};

// 装飾音のパース
export const parseGraceNote = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // 装飾音は { で始まる
  if (char !== '{') {
    return null;
  }

  // 閉じる } を探す
  let j = index + 1;
  while (j < line.length && line[j] !== '}') {
    j++;
  }

  // 閉じる } が見つからない場合
  if (j >= line.length) {
    return null;
  }

  // { を含めた装飾音全体を取得
  const graceNote = line.substring(index, j + 1);

  // パターンチェック
  if (!ABC_GRACE_NOTE_PATTERN.test(graceNote)) {
    return null;
  }

  return {
    html: `<span class="abc-grace-note">${escapeHtml(graceNote)}</span>`,
    nextIndex: j + 1,
  };
};

// インラインフィールドのパース
export const parseInlineField = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // インラインフィールドは [ で始まる
  if (char !== '[') {
    return null;
  }

  // 閉じる ] を探す
  let j = index + 1;
  while (j < line.length && line[j] !== ']') {
    j++;
  }

  // 閉じる ] が見つからない場合
  if (j >= line.length) {
    return null;
  }

  // [ を含めたインラインフィールド全体を取得
  const inlineField = line.substring(index, j + 1);

  // パターンチェック ([K:G], [M:3/4] など)
  const match = inlineField.match(ABC_INLINE_FIELD_PATTERN);
  if (!match) {
    return null;
  }

  const [, key, value] = match;

  return {
    html: `<span class="abc-inline-field-bracket">[</span><span class="abc-inline-field-key">${escapeHtml(key)}:</span><span class="abc-inline-field-value">${escapeHtml(value)}</span><span class="abc-inline-field-bracket">]</span>`,
    nextIndex: j + 1,
  };
};

// 反復記号（Volta bracket）のパース
export const parseVoltaBracket = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // 反復記号は [ で始まる
  if (char !== '[') {
    return null;
  }

  // 次の文字が数字かチェック
  if (index + 1 >= line.length || !/\d/.test(line[index + 1])) {
    return null;
  }

  // [ と数字を取得
  let j = index + 1;
  while (j < line.length && /\d/.test(line[j])) {
    j++;
  }

  const voltaBracket = line.substring(index, j);

  // パターンチェック
  if (!ABC_VOLTA_BRACKET_PATTERN.test(voltaBracket)) {
    return null;
  }

  return {
    html: `<span class="abc-volta-bracket">${escapeHtml(voltaBracket)}</span>`,
    nextIndex: j,
  };
};

// ブロークンリズムのパース
export const parseBrokenRhythm = (line: string, index: number): ParseResult | null => {
  const char = line[index];

  // ブロークンリズムは > または < で始まる
  if (char !== '>' && char !== '<') {
    return null;
  }

  // 連続する > または < を取得
  let j = index + 1;
  while (j < line.length && line[j] === char) {
    j++;
  }

  const brokenRhythm = line.substring(index, j);

  // パターンチェック
  if (!ABC_BROKEN_RHYTHM_PATTERN.test(brokenRhythm)) {
    return null;
  }

  return {
    html: `<span class="abc-broken-rhythm">${escapeHtml(brokenRhythm)}</span>`,
    nextIndex: j,
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

    const decoration = parseDecoration(line, i);
    if (decoration) {
      result += decoration.html;
      i = decoration.nextIndex;
      continue;
    }

    const graceNote = parseGraceNote(line, i);
    if (graceNote) {
      result += graceNote.html;
      i = graceNote.nextIndex;
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

    const annotation = parseAnnotation(line, i);
    if (annotation) {
      result += annotation.html;
      i = annotation.nextIndex;
      continue;
    }

    const chordSymbol = parseChordSymbol(line, i);
    if (chordSymbol) {
      result += chordSymbol.html;
      i = chordSymbol.nextIndex;
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

    const brokenRhythm = parseBrokenRhythm(line, i);
    if (brokenRhythm) {
      result += brokenRhythm.html;
      i = brokenRhythm.nextIndex;
      continue;
    }

    const inlineField = parseInlineField(line, i);
    if (inlineField) {
      result += inlineField.html;
      i = inlineField.nextIndex;
      continue;
    }

    const voltaBracket = parseVoltaBracket(line, i);
    if (voltaBracket) {
      result += voltaBracket.html;
      i = voltaBracket.nextIndex;
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
        // 歌詞フィールド (w:, W:) は別のクラスを使用
        if (key === 'w:' || key === 'W:') {
          return `<span class="abc-lyrics-key">${escapeHtml(key)}</span><span class="abc-lyrics-value">${escapeHtml(value)}</span>`;
        }
        return `<span class="abc-meta-key">${escapeHtml(key)}</span><span class="abc-meta-value">${escapeHtml(value)}</span>`;
      }

      // 楽譜部分の文字単位ハイライト
      return highlightMusicLine(line);
    })
    .join('\n');
};
