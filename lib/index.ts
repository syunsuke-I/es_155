// Main Components
export { AbcEditor } from '../src/components/AbcEditor';
export { AbcPreview } from '../src/components/AbcPreview';
export { SuggestionList } from '../src/components/SuggestionList';

// Hooks
export { useLineNumbers } from '../src/hooks/useLineNumbers';
export { useAbcAutoComplete } from '../src/hooks/useAbcAutoComplete';

// Utils
export { highlightAbc } from '../src/utils/highlightAbc';
export { validateAbc } from '../src/utils/validateAbc';
export type { ValidationError } from '../src/utils/validateAbc';

// Types
export type {
  AbcField,
  AbcFieldKey,
} from '../src/types/abc';

// Constants - ABC Patterns
export {
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
} from '../src/types/abc';

// Data (optional - users might want to customize this)
export { ABC_SUGGESTIONS } from '../src/data/abcSuggestions';
export { ABC_COMMANDS } from '../src/data/abcCommands';
