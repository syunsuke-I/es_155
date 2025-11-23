import { ABC_FIELD_PATTERN, ABC_NOTE_PATTERN, ABC_REST_PATTERN } from '../types/abc';

export interface ValidationError {
  line: number; // 行番号（0始まり）
  measureIndex: number; // 小節番号（その行の中で何番目の小節か、0始まり）
  startCol: number; // 小節の開始文字位置
  endCol: number; // 小節の終了文字位置
  expected: number; // 期待される拍数
  actual: number; // 実際の拍数
  message: string; // エラーメッセージ
}

interface MeterInfo {
  beatsPerMeasure: number; // 1小節あたりの拍数
  beatUnit: number; // 拍の単位（4なら4分音符が1拍）
}

interface AbcContext {
  meter: MeterInfo; // 拍子記号 (M:)
  unitNoteLength: number; // 基準音符の長さ (L:) - 分数として保持 (1/4 -> 0.25)
}

/**
 * 拍子記号（M:）をパースする
 * 例: "4/4" -> { beatsPerMeasure: 4, beatUnit: 4 }
 *     "C" -> { beatsPerMeasure: 4, beatUnit: 4 }
 *     "C|" -> { beatsPerMeasure: 2, beatUnit: 2 }
 */
const parseMeter = (meterStr: string): MeterInfo => {
  const trimmed = meterStr.trim();

  // "C" は 4/4 拍子の略記
  if (trimmed === 'C') {
    return { beatsPerMeasure: 4, beatUnit: 4 };
  }

  // "C|" は 2/2 拍子の略記
  if (trimmed === 'C|') {
    return { beatsPerMeasure: 2, beatUnit: 2 };
  }

  // "4/4" 形式
  const match = trimmed.match(/^(\d+)\/(\d+)$/);
  if (match) {
    return {
      beatsPerMeasure: parseInt(match[1], 10),
      beatUnit: parseInt(match[2], 10),
    };
  }

  // デフォルトは 4/4
  return { beatsPerMeasure: 4, beatUnit: 4 };
};

/**
 * 基準音符の長さ（L:）をパースする
 * 例: "1/4" -> 0.25
 *     "1/8" -> 0.125
 */
const parseUnitNoteLength = (lengthStr: string): number => {
  const trimmed = lengthStr.trim();
  const match = trimmed.match(/^(\d+)\/(\d+)$/);

  if (match) {
    return parseInt(match[1], 10) / parseInt(match[2], 10);
  }

  // デフォルトは 1/8
  return 1 / 8;
};

/**
 * ABC記法からコンテキスト情報（拍子、基準音符）を抽出する
 */
const extractContext = (code: string): AbcContext => {
  const lines = code.split('\n');
  let meter: MeterInfo = { beatsPerMeasure: 4, beatUnit: 4 };
  let unitNoteLength = 1 / 8;

  for (const line of lines) {
    const match = line.match(ABC_FIELD_PATTERN);
    if (match) {
      const [, key, value] = match;

      if (key === 'M:') {
        meter = parseMeter(value);
      } else if (key === 'L:') {
        unitNoteLength = parseUnitNoteLength(value);
      }
    }
  }

  return { meter, unitNoteLength };
};

/**
 * 音長記号をパースして、基準音符に対する倍率を返す
 * 例: "2" -> 2 (2倍)
 *     "/2" -> 0.5 (半分)
 *     "3/2" -> 1.5 (1.5倍)
 *     "" -> 1 (倍率なし)
 */
const parseDuration = (durationStr: string): number => {
  if (!durationStr) {
    return 1;
  }

  // /2, /4 形式
  if (durationStr.startsWith('/')) {
    const denominator = parseInt(durationStr.substring(1), 10);
    return 1 / denominator;
  }

  // 3/2, 5/4 形式
  if (durationStr.includes('/')) {
    const [num, denom] = durationStr.split('/');
    return parseInt(num, 10) / parseInt(denom, 10);
  }

  // 2, 4, 8 形式
  return parseInt(durationStr, 10);
};

/**
 * 小節内の音符・休符を解析して、総拍数を計算する
 *
 * ABC記法の音長計算：
 * - 基準音符（L:）の長さを1単位とする
 * - 拍子の単位音符（M:の分母）で割って拍数に変換
 *
 * 例: L:1/8, M:4/4 の場合
 *     - C（1/8音符）: (1/8) / (1/4) = 0.5拍
 *     - C2（1/4音符）: (1/8 * 2) / (1/4) = 1拍
 */
const calculateMeasureBeats = (measureContent: string, context: AbcContext): number => {
  let totalBeats = 0;
  let i = 0;

  while (i < measureContent.length) {
    const char = measureContent[i];

    // 音符または休符
    if (ABC_NOTE_PATTERN.test(char) || ABC_REST_PATTERN.test(char)) {
      let j = i + 1;

      // オクターブ記号をスキップ (', ,)
      while (j < measureContent.length && (measureContent[j] === "'" || measureContent[j] === ',')) {
        j++;
      }

      // 音長記号を取得
      let duration = '';
      if (j < measureContent.length && (measureContent[j] === '/' || /\d/.test(measureContent[j]))) {
        const durationStart = j;

        // /で始まる場合
        if (measureContent[j] === '/') {
          j++;
        }

        // 数字を取得
        while (j < measureContent.length && /\d/.test(measureContent[j])) {
          j++;
        }

        // 分数の場合
        if (j < measureContent.length && measureContent[j] === '/') {
          j++;
          while (j < measureContent.length && /\d/.test(measureContent[j])) {
            j++;
          }
        }

        duration = measureContent.substring(durationStart, j);
      }

      // 音符の長さを計算
      const durationMultiplier = parseDuration(duration);
      const noteLength = context.unitNoteLength * durationMultiplier; // 実際の音符の長さ
      const beatUnit = 1 / context.meter.beatUnit; // 1拍の長さ
      const beats = noteLength / beatUnit; // 拍数

      totalBeats += beats;
      i = j;
    } else if (char === '[') {
      // 和音の開始
      let j = i + 1;

      // ] まで読み進めて、和音内の音符を解析
      while (j < measureContent.length && measureContent[j] !== ']') {
        const chordChar = measureContent[j];

        if (ABC_NOTE_PATTERN.test(chordChar)) {
          let k = j + 1;

          // オクターブ記号をスキップ
          while (k < measureContent.length && (measureContent[k] === "'" || measureContent[k] === ',')) {
            k++;
          }

          j = k;
        } else {
          j++;
        }
      }

      // 和音全体の音長記号を取得
      if (j < measureContent.length && measureContent[j] === ']') {
        j++;

        let duration = '';
        if (j < measureContent.length && (measureContent[j] === '/' || /\d/.test(measureContent[j]))) {
          const durationStart = j;

          if (measureContent[j] === '/') {
            j++;
          }

          while (j < measureContent.length && /\d/.test(measureContent[j])) {
            j++;
          }

          if (j < measureContent.length && measureContent[j] === '/') {
            j++;
            while (j < measureContent.length && /\d/.test(measureContent[j])) {
              j++;
            }
          }

          duration = measureContent.substring(durationStart, j);
        }

        const durationMultiplier = parseDuration(duration);
        const noteLength = context.unitNoteLength * durationMultiplier;
        const beatUnit = 1 / context.meter.beatUnit;
        const beats = noteLength / beatUnit;

        totalBeats += beats;
      }

      i = j;
    } else {
      // その他の文字はスキップ
      i++;
    }
  }

  return totalBeats;
};

/**
 * ABC記法をバリデーションして、エラーがある行を返す
 */
export const validateAbc = (code: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  const lines = code.split('\n');
  const context = extractContext(code);

  lines.forEach((line, lineIndex) => {
    // コメント行やフィールド行はスキップ
    if (line.trim().startsWith('%') || ABC_FIELD_PATTERN.test(line)) {
      return;
    }

    // 小節線を含む行（楽譜行）を解析
    if (line.includes('|')) {
      // 小節の位置を追跡しながら分割
      let currentPos = 0;
      const parts = line.split('|');
      let validMeasureCount = 0; // 有効な小節のカウント

      parts.forEach((measure, measureIndex) => {
        // 最後の空要素はスキップ
        if (measureIndex === parts.length - 1 && measure.trim() === '') {
          return;
        }

        const trimmed = measure.trim();

        // 反復記号など、特殊なパターンを除外
        if (trimmed.startsWith(':') || trimmed.startsWith('[') || trimmed === '') {
          currentPos += measure.length + 1; // +1 for the '|'
          return;
        }

        const actualBeats = calculateMeasureBeats(trimmed, context);
        const expectedBeats = context.meter.beatsPerMeasure;

        // 浮動小数点の誤差を考慮して比較
        const tolerance = 0.01;
        if (Math.abs(actualBeats - expectedBeats) > tolerance) {
          // 小節の開始位置（前の空白を除外）
          const measureStart = line.indexOf(trimmed, currentPos);
          const measureEnd = measureStart + trimmed.length;

          errors.push({
            line: lineIndex,
            measureIndex: validMeasureCount,
            startCol: measureStart,
            endCol: measureEnd,
            expected: expectedBeats,
            actual: actualBeats,
            message: `Expected ${expectedBeats} beats, got ${actualBeats.toFixed(2)}`,
          });
        }

        validMeasureCount++;
        currentPos += measure.length + 1; // +1 for the '|'
      });
    }
  });

  return errors;
};
