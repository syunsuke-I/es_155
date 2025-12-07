import { describe, it, expect } from 'vitest';
import { validateAbc } from './validateAbc';

describe('validateAbc', () => {
  describe('basic validation', () => {
    it('should return no errors for valid 4/4 measure', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
C D E F |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should return error for incomplete measure', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
C D E |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(1);
      expect(errors[0].expected).toBe(4);
      expect(errors[0].actual).toBe(3);
    });

    it('should return error for overfilled measure', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
C D E F G |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(1);
      expect(errors[0].expected).toBe(4);
      expect(errors[0].actual).toBe(5);
    });
  });

  describe('duration shorthand', () => {
    it('should handle / as shorthand for /2', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
C/ D/ E F G |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should handle // as shorthand for /4', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
C// D// E// F// E F G |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should handle broken rhythm with duration shorthand', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
C/>D/ E F G |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });
  });

  describe('tuplets', () => {
    it('should handle triplet (3', () => {
      // (3C D E = 3音符を2拍分で = 2拍
      // F G = 2拍
      // 合計 = 4拍
      const abc = `X:1
M:4/4
L:1/4
K:C
(3C D E F G |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should handle triplet with duration', () => {
      // (3C/2 D/2 E/2 = 3音符(各0.5拍)を2/3倍 = 0.5*3*(2/3) = 1拍
      // + F G A = 3拍 = 合計4拍
      const abc = `X:1
M:4/4
L:1/4
K:C
(3C/2 D/2 E/2 F G A |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should handle quintuplet (5', () => {
      // (5C D E F G = 5音符を2拍分で = 2拍、+ A B = 2拍 = 合計4拍
      const abc = `X:1
M:4/4
L:1/4
K:C
(5C D E F G A B |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should handle extended tuplet notation (3:2:3', () => {
      // (3:2:3C D E = 3音符を2拍分で = 2拍、+ F = 2拍 = 合計4拍
      const abc = `X:1
M:4/4
L:1/4
K:C
(3:2:3C D E F2 |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });
  });

  describe('line continuation', () => {
    it('should ignore backslash in measure content', () => {
      // バックスラッシュは小節内でスキップされる
      const abc = `X:1
M:4/4
L:1/4
K:C
C D\\ E F |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });
  });

  describe('rests', () => {
    it('should count rest duration', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
z C D E |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should handle rest with duration shorthand', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
z/ z/ C D E |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });
  });

  describe('chords', () => {
    it('should count chord as single note', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
[CEG] D E F |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should handle chord with duration', () => {
      const abc = `X:1
M:4/4
L:1/4
K:C
[CEG]2 E F |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });
  });

  describe('complex examples', () => {
    it('should validate complex measure with triplet and broken rhythm', () => {
      // z/2 = 0.5拍
      // (3C/2 C/2 C/2 = 3音符(各0.5拍)を2/3倍 = 1拍
      // G/ = 0.5拍, A/ = 0.5拍 = 1拍
      // A = 1拍
      // 合計: 0.5 + 1 + 1 + 1 = 3.5拍 → 4拍にするにはA/2を追加
      const abc = `X:1
M:4/4
L:1/4
K:C
z/2 (3C/2 C/2 C/2 G/>A/ A A/2 |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(0);
    });

    it('should detect error in complex measure', () => {
      // z/2 = 0.5拍
      // (3C/2 C/2 C/2 = 1拍
      // G/ = 0.5拍, A/ = 0.5拍 = 1拍
      // A A A A = 4拍
      // B = 1拍
      // 合計: 0.5 + 1 + 1 + 4 + 1 = 7.5拍
      const abc = `X:1
M:4/4
L:1/4
K:C
z/2 (3C/2 C/2 C/2 G/>A/ A A A A B |`;
      const errors = validateAbc(abc);
      expect(errors).toHaveLength(1);
      expect(errors[0].actual).toBeCloseTo(7.5, 1);
    });
  });
});
