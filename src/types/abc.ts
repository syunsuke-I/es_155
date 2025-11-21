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
