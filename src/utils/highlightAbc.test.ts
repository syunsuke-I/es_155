import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  parseBarLine,
  parseAccidental,
  parseTupletOrSlur,
  parseNoteWithDuration,
  parseChordBracket,
  parseRest,
  parseTie,
  parseOrnament,
  parseChordSymbol,
  parseDecoration,
  parseGraceNote,
  highlightMusicLine,
  highlightAbc,
} from './highlightAbc';

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('"quote"')).toBe('&quot;quote&quot;');
    expect(escapeHtml("'apostrophe'")).toBe('&#039;apostrophe&#039;');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('parseBarLine', () => {
  it('should parse single bar line', () => {
    const result = parseBarLine('|', 0);
    expect(result).toEqual({
      html: '<span class="abc-bar">|</span>',
      nextIndex: 1,
    });
  });

  it('should parse double bar line', () => {
    const result = parseBarLine('||', 0);
    expect(result).toEqual({
      html: '<span class="abc-bar">||</span>',
      nextIndex: 2,
    });
  });

  it('should parse repeat start |:', () => {
    const result = parseBarLine('|:', 0);
    expect(result).toEqual({
      html: '<span class="abc-bar">|:</span>',
      nextIndex: 2,
    });
  });

  it('should parse repeat end :|', () => {
    const result = parseBarLine(':|', 0);
    expect(result).toEqual({
      html: '<span class="abc-bar">:|</span>',
      nextIndex: 2,
    });
  });

  it('should return null for non-bar characters', () => {
    expect(parseBarLine('C', 0)).toBeNull();
    expect(parseBarLine('A', 0)).toBeNull();
  });
});

describe('parseAccidental', () => {
  it('should parse sharp (^)', () => {
    const result = parseAccidental('^C', 0);
    expect(result).toEqual({
      html: '<span class="abc-accidental">^</span>',
      nextIndex: 1,
    });
  });

  it('should parse flat (_)', () => {
    const result = parseAccidental('_B', 0);
    expect(result).toEqual({
      html: '<span class="abc-accidental">_</span>',
      nextIndex: 1,
    });
  });

  it('should parse natural (=)', () => {
    const result = parseAccidental('=A', 0);
    expect(result).toEqual({
      html: '<span class="abc-accidental">=</span>',
      nextIndex: 1,
    });
  });

  it('should return null for non-accidental characters', () => {
    expect(parseAccidental('C', 0)).toBeNull();
    expect(parseAccidental('|', 0)).toBeNull();
  });
});

describe('parseTupletOrSlur', () => {
  it('should parse tuplet (3', () => {
    const result = parseTupletOrSlur('(3CDE', 0, 0);
    expect(result).toEqual({
      html: '<span class="abc-tuplet">(3</span>',
      nextIndex: 2,
      slurLevelDelta: 0,
    });
  });

  it('should parse tuplet (5', () => {
    const result = parseTupletOrSlur('(5ABCDE', 0, 0);
    expect(result).toEqual({
      html: '<span class="abc-tuplet">(5</span>',
      nextIndex: 2,
      slurLevelDelta: 0,
    });
  });

  it('should parse slur start at level 0', () => {
    const result = parseTupletOrSlur('(CD', 0, 0);
    expect(result).toEqual({
      html: '<span class="abc-slur abc-slur-level-0">(</span>',
      nextIndex: 1,
      slurLevelDelta: 1,
    });
  });

  it('should parse slur start at level 1', () => {
    const result = parseTupletOrSlur('(EF', 0, 1);
    expect(result).toEqual({
      html: '<span class="abc-slur abc-slur-level-1">(</span>',
      nextIndex: 1,
      slurLevelDelta: 1,
    });
  });

  it('should parse slur end at level 1', () => {
    const result = parseTupletOrSlur(')G', 0, 1);
    expect(result).toEqual({
      html: '<span class="abc-slur abc-slur-level-0">)</span>',
      nextIndex: 1,
      slurLevelDelta: -1,
    });
  });

  it('should cycle colors with modulo 5', () => {
    const result = parseTupletOrSlur('(A', 0, 5);
    expect(result).toEqual({
      html: '<span class="abc-slur abc-slur-level-0">(</span>',
      nextIndex: 1,
      slurLevelDelta: 1,
    });
  });

  it('should return null for non-slur characters', () => {
    expect(parseTupletOrSlur('C', 0, 0)).toBeNull();
    expect(parseTupletOrSlur('|', 0, 0)).toBeNull();
  });
});

describe('parseNoteWithDuration', () => {
  it('should parse note without duration', () => {
    const result = parseNoteWithDuration('C', 0);
    expect(result).toEqual({
      html: '<span class="abc-note">C</span>',
      nextIndex: 1,
    });
  });

  it('should parse note with long duration (2)', () => {
    const result = parseNoteWithDuration('C2', 0);
    expect(result).toEqual({
      html: '<span class="abc-note">C</span><span class="abc-duration abc-duration-long">2</span>',
      nextIndex: 2,
    });
  });

  it('should parse note with short duration (/2)', () => {
    const result = parseNoteWithDuration('D/2', 0);
    expect(result).toEqual({
      html: '<span class="abc-note">D</span><span class="abc-duration abc-duration-short">/2</span>',
      nextIndex: 3,
    });
  });

  it('should parse note with fraction duration (3/2)', () => {
    const result = parseNoteWithDuration('E3/2', 0);
    expect(result).toEqual({
      html: '<span class="abc-note">E</span><span class="abc-duration abc-duration-fraction">3/2</span>',
      nextIndex: 4,
    });
  });

  it('should parse lowercase note', () => {
    const result = parseNoteWithDuration('c4', 0);
    expect(result).toEqual({
      html: '<span class="abc-note">c</span><span class="abc-duration abc-duration-long">4</span>',
      nextIndex: 2,
    });
  });

  it('should return null for non-note characters', () => {
    expect(parseNoteWithDuration('|', 0)).toBeNull();
    expect(parseNoteWithDuration('(', 0)).toBeNull();
  });
});

describe('parseChordBracket', () => {
  it('should parse opening bracket [', () => {
    const result = parseChordBracket('[CEG]', 0);
    expect(result).toEqual({
      html: '<span class="abc-chord">[</span>',
      nextIndex: 1,
    });
  });

  it('should parse closing bracket ]', () => {
    const result = parseChordBracket(']', 0);
    expect(result).toEqual({
      html: '<span class="abc-chord">]</span>',
      nextIndex: 1,
    });
  });

  it('should return null for non-bracket characters', () => {
    expect(parseChordBracket('C', 0)).toBeNull();
    expect(parseChordBracket('|', 0)).toBeNull();
  });
});

describe('parseRest', () => {
  it('should parse lowercase rest z', () => {
    const result = parseRest('z', 0);
    expect(result).toEqual({
      html: '<span class="abc-rest">z</span>',
      nextIndex: 1,
    });
  });

  it('should parse uppercase rest Z', () => {
    const result = parseRest('Z', 0);
    expect(result).toEqual({
      html: '<span class="abc-rest">Z</span>',
      nextIndex: 1,
    });
  });

  it('should parse rest with long duration (2)', () => {
    const result = parseRest('z2', 0);
    expect(result).toEqual({
      html: '<span class="abc-rest">z</span><span class="abc-duration abc-duration-long">2</span>',
      nextIndex: 2,
    });
  });

  it('should parse rest with short duration (/2)', () => {
    const result = parseRest('Z/2', 0);
    expect(result).toEqual({
      html: '<span class="abc-rest">Z</span><span class="abc-duration abc-duration-short">/2</span>',
      nextIndex: 3,
    });
  });

  it('should parse rest with fraction duration (3/2)', () => {
    const result = parseRest('z3/2', 0);
    expect(result).toEqual({
      html: '<span class="abc-rest">z</span><span class="abc-duration abc-duration-fraction">3/2</span>',
      nextIndex: 4,
    });
  });

  it('should parse invisible rest x', () => {
    const result = parseRest('x', 0);
    expect(result).toEqual({
      html: '<span class="abc-rest-invisible">x</span>',
      nextIndex: 1,
    });
  });

  it('should parse invisible rest with duration', () => {
    const result = parseRest('x2', 0);
    expect(result).toEqual({
      html: '<span class="abc-rest-invisible">x</span><span class="abc-duration abc-duration-long">2</span>',
      nextIndex: 2,
    });
  });

  it('should return null for non-rest characters', () => {
    expect(parseRest('C', 0)).toBeNull();
    expect(parseRest('|', 0)).toBeNull();
  });
});

describe('parseTie', () => {
  it('should parse regular tie -', () => {
    const result = parseTie('-', 0);
    expect(result).toEqual({
      html: '<span class="abc-tie">-</span>',
      nextIndex: 1,
    });
  });

  it('should parse dotted tie .-', () => {
    const result = parseTie('.-', 0);
    expect(result).toEqual({
      html: '<span class="abc-tie abc-tie-dotted">.-</span>',
      nextIndex: 2,
    });
  });

  it('should parse tie in music context', () => {
    const result = parseTie('C-C', 1);
    expect(result).toEqual({
      html: '<span class="abc-tie">-</span>',
      nextIndex: 2,
    });
  });

  it('should return null for non-tie characters', () => {
    expect(parseTie('C', 0)).toBeNull();
    expect(parseTie('|', 0)).toBeNull();
  });

  it('should return null for dot without dash', () => {
    expect(parseTie('.C', 0)).toBeNull();
  });
});

describe('parseOrnament', () => {
  it('should parse staccato .', () => {
    const result = parseOrnament('.C', 0);
    expect(result).toEqual({
      html: '<span class="abc-ornament">.</span>',
      nextIndex: 1,
    });
  });

  it('should parse trill ~', () => {
    const result = parseOrnament('~C', 0);
    expect(result).toEqual({
      html: '<span class="abc-ornament">~</span>',
      nextIndex: 1,
    });
  });

  it('should parse fermata H', () => {
    const result = parseOrnament('HC', 0);
    expect(result).toEqual({
      html: '<span class="abc-ornament">H</span>',
      nextIndex: 1,
    });
  });

  it('should parse trill T', () => {
    const result = parseOrnament('TC', 0);
    expect(result).toEqual({
      html: '<span class="abc-ornament">T</span>',
      nextIndex: 1,
    });
  });

  it('should parse upbow u', () => {
    const result = parseOrnament('uC', 0);
    expect(result).toEqual({
      html: '<span class="abc-ornament">u</span>',
      nextIndex: 1,
    });
  });

  it('should parse downbow v', () => {
    const result = parseOrnament('vC', 0);
    expect(result).toEqual({
      html: '<span class="abc-ornament">v</span>',
      nextIndex: 1,
    });
  });

  it('should return null for dotted tie .-', () => {
    const result = parseOrnament('.-', 0);
    expect(result).toBeNull();
  });

  it('should return null for non-ornament characters', () => {
    expect(parseOrnament('C', 0)).toBeNull();
    expect(parseOrnament('|', 0)).toBeNull();
  });
});

describe('parseChordSymbol', () => {
  it('should parse simple chord "C"', () => {
    const result = parseChordSymbol('"C"', 0);
    expect(result).toEqual({
      html: '<span class="abc-chord-symbol">&quot;C&quot;</span>',
      nextIndex: 3,
    });
  });

  it('should parse minor chord "Am"', () => {
    const result = parseChordSymbol('"Am"', 0);
    expect(result).toEqual({
      html: '<span class="abc-chord-symbol">&quot;Am&quot;</span>',
      nextIndex: 4,
    });
  });

  it('should parse seventh chord "Dm7"', () => {
    const result = parseChordSymbol('"Dm7"', 0);
    expect(result).toEqual({
      html: '<span class="abc-chord-symbol">&quot;Dm7&quot;</span>',
      nextIndex: 5,
    });
  });

  it('should parse chord with bass "C/E"', () => {
    const result = parseChordSymbol('"C/E"', 0);
    expect(result).toEqual({
      html: '<span class="abc-chord-symbol">&quot;C/E&quot;</span>',
      nextIndex: 5,
    });
  });

  it('should parse complex chord "Gmaj7"', () => {
    const result = parseChordSymbol('"Gmaj7"', 0);
    expect(result).toEqual({
      html: '<span class="abc-chord-symbol">&quot;Gmaj7&quot;</span>',
      nextIndex: 7,
    });
  });

  it('should return null for unclosed quote', () => {
    expect(parseChordSymbol('"C', 0)).toBeNull();
  });

  it('should return null for non-chord characters', () => {
    expect(parseChordSymbol('C', 0)).toBeNull();
    expect(parseChordSymbol('|', 0)).toBeNull();
  });
});

describe('parseDecoration', () => {
  it('should parse trill !trill!', () => {
    const result = parseDecoration('!trill!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!trill!</span>',
      nextIndex: 7,
    });
  });

  it('should parse fermata !fermata!', () => {
    const result = parseDecoration('!fermata!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!fermata!</span>',
      nextIndex: 9,
    });
  });

  it('should parse dynamics !p!', () => {
    const result = parseDecoration('!p!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!p!</span>',
      nextIndex: 3,
    });
  });

  it('should parse dynamics !f!', () => {
    const result = parseDecoration('!f!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!f!</span>',
      nextIndex: 3,
    });
  });

  it('should parse accent !>!', () => {
    const result = parseDecoration('!>!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!&gt;!</span>',
      nextIndex: 3,
    });
  });

  it('should parse crescendo !crescendo(!', () => {
    const result = parseDecoration('!crescendo(!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!crescendo(!</span>',
      nextIndex: 12,
    });
  });

  it('should parse segno !segno!', () => {
    const result = parseDecoration('!segno!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!segno!</span>',
      nextIndex: 7,
    });
  });

  it('should parse coda !coda!', () => {
    const result = parseDecoration('!coda!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!coda!</span>',
      nextIndex: 6,
    });
  });

  it('should parse mordent !mordent!', () => {
    const result = parseDecoration('!mordent!', 0);
    expect(result).toEqual({
      html: '<span class="abc-decoration">!mordent!</span>',
      nextIndex: 9,
    });
  });

  it('should return null for unclosed decoration', () => {
    expect(parseDecoration('!trill', 0)).toBeNull();
  });

  it('should return null for non-decoration characters', () => {
    expect(parseDecoration('C', 0)).toBeNull();
    expect(parseDecoration('|', 0)).toBeNull();
  });
});

describe('parseGraceNote', () => {
  it('should parse simple grace note {g}', () => {
    const result = parseGraceNote('{g}', 0);
    expect(result).toEqual({
      html: '<span class="abc-grace-note">{g}</span>',
      nextIndex: 3,
    });
  });

  it('should parse acciaccatura {/g}', () => {
    const result = parseGraceNote('{/g}', 0);
    expect(result).toEqual({
      html: '<span class="abc-grace-note">{/g}</span>',
      nextIndex: 4,
    });
  });

  it('should parse multi-note grace {gef}', () => {
    const result = parseGraceNote('{gef}', 0);
    expect(result).toEqual({
      html: '<span class="abc-grace-note">{gef}</span>',
      nextIndex: 5,
    });
  });

  it('should parse acciaccatura multi-note {/gagab}', () => {
    const result = parseGraceNote('{/gagab}', 0);
    expect(result).toEqual({
      html: '<span class="abc-grace-note">{/gagab}</span>',
      nextIndex: 8,
    });
  });

  it('should parse grace note with accidental {^g}', () => {
    const result = parseGraceNote('{^g}', 0);
    expect(result).toEqual({
      html: '<span class="abc-grace-note">{^g}</span>',
      nextIndex: 4,
    });
  });

  it('should return null for unclosed grace note', () => {
    expect(parseGraceNote('{g', 0)).toBeNull();
  });

  it('should return null for non-grace-note characters', () => {
    expect(parseGraceNote('C', 0)).toBeNull();
    expect(parseGraceNote('|', 0)).toBeNull();
  });
});

describe('highlightMusicLine', () => {
  it('should highlight simple note sequence', () => {
    const result = highlightMusicLine('C D E F');
    expect(result).toContain('<span class="abc-note">C</span>');
    expect(result).toContain('<span class="abc-note">D</span>');
    expect(result).toContain('<span class="abc-note">E</span>');
    expect(result).toContain('<span class="abc-note">F</span>');
  });

  it('should highlight notes with durations', () => {
    const result = highlightMusicLine('C2 D/2 E3/2');
    expect(result).toContain('<span class="abc-note">C</span><span class="abc-duration abc-duration-long">2</span>');
    expect(result).toContain('<span class="abc-note">D</span><span class="abc-duration abc-duration-short">/2</span>');
    expect(result).toContain('<span class="abc-note">E</span><span class="abc-duration abc-duration-fraction">3/2</span>');
  });

  it('should highlight accidentals', () => {
    const result = highlightMusicLine('^C _D =E');
    expect(result).toContain('<span class="abc-accidental">^</span>');
    expect(result).toContain('<span class="abc-accidental">_</span>');
    expect(result).toContain('<span class="abc-accidental">=</span>');
  });

  it('should highlight bar lines', () => {
    const result = highlightMusicLine('C | D || E |: F :| G');
    expect(result).toContain('<span class="abc-bar">|</span>');
    expect(result).toContain('<span class="abc-bar">||</span>');
    expect(result).toContain('<span class="abc-bar">|:</span>');
    expect(result).toContain('<span class="abc-bar">:|</span>');
  });

  it('should distinguish tuplets from slurs', () => {
    const result = highlightMusicLine('(3CDE (FG)');
    expect(result).toContain('<span class="abc-tuplet">(3</span>');
    expect(result).toContain('<span class="abc-slur abc-slur-level-0">(</span>');
    expect(result).toContain('<span class="abc-slur abc-slur-level-0">)</span>');
  });

  it('should handle nested slurs with color cycling', () => {
    const result = highlightMusicLine('((C D) (E F))');
    expect(result).toContain('abc-slur-level-0');
    expect(result).toContain('abc-slur-level-1');
  });

  it('should handle tuplet followed by slur', () => {
    const result = highlightMusicLine('(3(CDE)');
    expect(result).toContain('<span class="abc-tuplet">(3</span>');
    expect(result).toContain('<span class="abc-slur abc-slur-level-0">(</span>');
    expect(result).toContain('<span class="abc-slur abc-slur-level-0">)</span>');
  });

  it('should handle slur followed by tuplet', () => {
    const result = highlightMusicLine('((3CDE)');
    expect(result).toContain('<span class="abc-slur abc-slur-level-0">(</span>');
    expect(result).toContain('<span class="abc-tuplet">(3</span>');
    expect(result).toContain('<span class="abc-slur abc-slur-level-0">)</span>');
  });

  it('should handle consecutive tuplets', () => {
    const result = highlightMusicLine('(3CDE (3FGA');
    const tupletMatches = result.match(/<span class="abc-tuplet">\(3<\/span>/g);
    expect(tupletMatches).toHaveLength(2);
  });

  it('should handle tuplet with nested slurs', () => {
    const result = highlightMusicLine('(3(AB))');
    expect(result).toContain('<span class="abc-tuplet">(3</span>');
    expect(result).toContain('abc-slur-level-0');
    // 2つの閉じ括弧が両方スラーとして扱われる
    const closingSlurs = result.match(/abc-slur-level-0">\)<\/span>/g);
    expect(closingSlurs).toHaveLength(2);
  });

  it('should highlight chord brackets', () => {
    const result = highlightMusicLine('[CEG]');
    expect(result).toContain('<span class="abc-chord">[</span>');
    expect(result).toContain('<span class="abc-chord">]</span>');
  });

  it('should highlight rests', () => {
    const result = highlightMusicLine('C z D Z E');
    expect(result).toContain('<span class="abc-rest">z</span>');
    expect(result).toContain('<span class="abc-rest">Z</span>');
  });

  it('should highlight rests with durations', () => {
    const result = highlightMusicLine('z2 Z/2 z3/2');
    expect(result).toContain('<span class="abc-rest">z</span><span class="abc-duration abc-duration-long">2</span>');
    expect(result).toContain('<span class="abc-rest">Z</span><span class="abc-duration abc-duration-short">/2</span>');
    expect(result).toContain('<span class="abc-rest">z</span><span class="abc-duration abc-duration-fraction">3/2</span>');
  });

  it('should highlight invisible rests', () => {
    const result = highlightMusicLine('C x D x2 E');
    expect(result).toContain('<span class="abc-rest-invisible">x</span>');
    expect(result).toContain('<span class="abc-rest-invisible">x</span><span class="abc-duration abc-duration-long">2</span>');
  });

  it('should highlight ties', () => {
    const result = highlightMusicLine('C-C D-D');
    expect(result).toContain('<span class="abc-tie">-</span>');
  });

  it('should highlight dotted ties', () => {
    const result = highlightMusicLine('C.-C D-D');
    expect(result).toContain('<span class="abc-tie abc-tie-dotted">.-</span>');
    expect(result).toContain('<span class="abc-tie">-</span>');
  });

  it('should handle ties across bar lines', () => {
    const result = highlightMusicLine('C-|C');
    expect(result).toContain('<span class="abc-tie">-</span>');
    expect(result).toContain('<span class="abc-bar">|</span>');
  });

  it('should highlight ornaments', () => {
    const result = highlightMusicLine('.C ~D TC uE vF');
    expect(result).toContain('<span class="abc-ornament">.</span>');
    expect(result).toContain('<span class="abc-ornament">~</span>');
    expect(result).toContain('<span class="abc-ornament">T</span>');
    expect(result).toContain('<span class="abc-ornament">u</span>');
    expect(result).toContain('<span class="abc-ornament">v</span>');
  });

  it('should distinguish staccato from dotted tie', () => {
    const result = highlightMusicLine('.C C.-C');
    expect(result).toContain('<span class="abc-ornament">.</span>');
    expect(result).toContain('<span class="abc-tie abc-tie-dotted">.-</span>');
  });

  it('should highlight chord symbols in music line', () => {
    const result = highlightMusicLine('"C"C "Am"A "G7"G |');
    expect(result).toContain('<span class="abc-chord-symbol">&quot;C&quot;</span>');
    expect(result).toContain('<span class="abc-chord-symbol">&quot;Am&quot;</span>');
    expect(result).toContain('<span class="abc-chord-symbol">&quot;G7&quot;</span>');
    expect(result).toContain('<span class="abc-note">C</span>');
    expect(result).toContain('<span class="abc-note">A</span>');
    expect(result).toContain('<span class="abc-note">G</span>');
  });

  it('should highlight decorations in music line', () => {
    const result = highlightMusicLine('!trill!C !fermata!G |');
    expect(result).toContain('<span class="abc-decoration">!trill!</span>');
    expect(result).toContain('<span class="abc-decoration">!fermata!</span>');
    expect(result).toContain('<span class="abc-note">C</span>');
    expect(result).toContain('<span class="abc-note">G</span>');
  });

  it('should highlight dynamics in music line', () => {
    const result = highlightMusicLine('!p!C D !f!G A |');
    expect(result).toContain('<span class="abc-decoration">!p!</span>');
    expect(result).toContain('<span class="abc-decoration">!f!</span>');
    expect(result).toContain('<span class="abc-note">C</span>');
    expect(result).toContain('<span class="abc-note">D</span>');
    expect(result).toContain('<span class="abc-note">G</span>');
    expect(result).toContain('<span class="abc-note">A</span>');
  });

  it('should highlight grace notes in music line', () => {
    const result = highlightMusicLine('{g}A {/g}C |');
    expect(result).toContain('<span class="abc-grace-note">{g}</span>');
    expect(result).toContain('<span class="abc-grace-note">{/g}</span>');
    expect(result).toContain('<span class="abc-note">A</span>');
    expect(result).toContain('<span class="abc-note">C</span>');
  });

  it('should handle complex music line', () => {
    const result = highlightMusicLine('^C2 D/2 | [CEG] (3DEF | (AB) |');
    expect(result).toContain('abc-accidental');
    expect(result).toContain('abc-duration-long');
    expect(result).toContain('abc-duration-short');
    expect(result).toContain('abc-bar');
    expect(result).toContain('abc-chord');
    expect(result).toContain('abc-tuplet');
    expect(result).toContain('abc-slur');
  });
});

describe('highlightAbc', () => {
  it('should highlight meta fields', () => {
    const result = highlightAbc('X:1\nT:Test\nM:4/4\nK:C');
    expect(result).toContain('<span class="abc-meta-key">X:</span>');
    expect(result).toContain('<span class="abc-meta-value">1</span>');
    expect(result).toContain('<span class="abc-meta-key">T:</span>');
    expect(result).toContain('<span class="abc-meta-value">Test</span>');
  });

  it('should highlight comment lines', () => {
    const result = highlightAbc('% This is a comment');
    expect(result).toContain('<span class="abc-comment">% This is a comment</span>');
  });

  it('should highlight music notation', () => {
    const result = highlightAbc('C D E F | G A B c |');
    expect(result).toContain('abc-note');
    expect(result).toContain('abc-bar');
  });

  it('should handle multi-line ABC notation', () => {
    const abc = 'X:1\nT:Test\n% Comment\nC D E F |';
    const result = highlightAbc(abc);
    expect(result).toContain('abc-meta-key');
    expect(result).toContain('abc-comment');
    expect(result).toContain('abc-note');
  });

  it('should preserve line breaks', () => {
    const result = highlightAbc('C D\nE F');
    expect(result.split('\n')).toHaveLength(2);
  });

  it('should highlight comprehensive ABC notation with all features', () => {
    const abc = `X:1
T:Complete Test
M:4/4
K:C
% This tests all features
!p!"C"^C2 z/2 | [CEG] (3DEF.- | "Am"(AB) ~C {g}!fermata!G |`;
    const result = highlightAbc(abc);

    // Meta fields
    expect(result).toContain('abc-meta-key');
    expect(result).toContain('abc-meta-value');

    // Comment
    expect(result).toContain('abc-comment');

    // Decorations
    expect(result).toContain('abc-decoration');
    expect(result).toContain('!p!');
    expect(result).toContain('!fermata!');

    // Grace notes
    expect(result).toContain('abc-grace-note');
    expect(result).toContain('{g}');

    // Chord symbols
    expect(result).toContain('abc-chord-symbol');
    expect(result).toContain('&quot;C&quot;');
    expect(result).toContain('&quot;Am&quot;');

    // Accidentals
    expect(result).toContain('abc-accidental');

    // Durations
    expect(result).toContain('abc-duration');

    // Rests
    expect(result).toContain('abc-rest');

    // Chord brackets
    expect(result).toContain('abc-chord');

    // Tuplets
    expect(result).toContain('abc-tuplet');

    // Ties
    expect(result).toContain('abc-tie');

    // Slurs
    expect(result).toContain('abc-slur');

    // Ornaments
    expect(result).toContain('abc-ornament');

    // Bar lines
    expect(result).toContain('abc-bar');
  });
});
