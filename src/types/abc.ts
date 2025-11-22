// ABC記法のフィールド定義
export type AbcFieldKey =
  | 'A:' // area
  | 'B:' // book
  | 'C:' // composer
  | 'D:' // discography
  | 'F:' // file url
  | 'G:' // group
  | 'H:' // history
  | 'I:' // instruction
  | 'K:' // key
  | 'L:' // unit note length
  | 'M:' // meter
  | 'm:' // macro
  | 'N:' // notes
  | 'O:' // origin
  | 'P:' // parts
  | 'Q:' // tempo
  | 'R:' // rhythm
  | 'r:' // remark
  | 'S:' // source
  | 's:' // symbol line
  | 'T:' // tune title
  | 'U:' // user defined
  | 'V:' // voice
  | 'W:' // words (after tune)
  | 'w:' // words (aligned with notes)
  | 'X:' // reference number
  | 'Z:'; // transcription

export interface AbcField {
  key: AbcFieldKey;
  value: string;
}

// フィールドの正規表現パターン
export const ABC_FIELD_PATTERN = /^([ABCDFGHIKLMmNOPQRrSsTUVWwXZ]:)(.*)$/;

// 楽譜要素の正規表現パターン
export const ABC_NOTE_PATTERN = /[A-Ga-g]/;
export const ABC_ACCIDENTAL_PATTERN = /[\^_=]/;
export const ABC_BAR_PATTERN = /\|[:|\]]?|:?\|/;
export const ABC_CHORD_BRACKET_PATTERN = /[\\[\]]/;
export const ABC_SLUR_PATTERN = /[()]/;
export const ABC_TUPLET_PATTERN = /^\(\d+$/; // 連音符記号 ((3, (5, (7 など)
export const ABC_DURATION_PATTERN = /^\/?\d+(\/\d+)?$/; // 音長記号 (2, /2, 3/2 など)
export const ABC_REST_PATTERN = /[zZx]/; // 休符 (z: 休符, Z: 全休符, x: 見えない休符)
export const ABC_TIE_PATTERN = /^\.?-$/; // タイ (-, .-破線タイ)
export const ABC_ORNAMENT_PATTERN = /[.~HLMOPSTuv]/; // 装飾記号 (., ~, H, L, M, O, P, S, T, u, v)
export const ABC_CHORD_SYMBOL_PATTERN = /^"[^"]*"$/; // コード記号 ("C", "Am7", "Dm7/F" など)
export const ABC_DECORATION_PATTERN = /^![^!]+!$/; // 装飾記号 (!trill!, !fermata!, !p!, !f! など)
export const ABC_GRACE_NOTE_PATTERN = /^\{[^}]+\}$/; // 装飾音 ({g}A, {/g}C, {gef}e など)
export const ABC_VOLTA_BRACKET_PATTERN = /^\[\d+$/; // 反復記号 ([1, [2, [3 など)
export const ABC_BROKEN_RHYTHM_PATTERN = /^[<>]+$/; // ブロークンリズム (>, <, >>, << など)
export const ABC_COMMENT_PATTERN = /^%.*$/;
