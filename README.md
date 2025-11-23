# ABC Editor

A React component for editing ABC music notation with syntax highlighting, autocomplete, and real-time validation.

## You can try it on web

[Here](https://abc-editor-theta.vercel.app/)



## Features

- **Light & Dark Mode**: Built-in theme support with light mode as default
- **Syntax Highlighting**: Color-coded ABC notation elements optimized for both themes
- **Line Numbers**: Clear visual reference for navigation
<img width="739" height="282" alt="スクリーンショット 2025-11-23 14 46 26" src="https://github.com/user-attachments/assets/e69f6bf6-3ea8-45d9-b194-3d5a6e4c5385" />

- **Autocomplete**: Smart suggestions for ABC notation commands and fields

<img width="295" height="353" alt="スクリーンショット 2025-11-23 14 47 31" src="https://github.com/user-attachments/assets/625ae548-47ec-4c84-a984-9d9cd19f95c7" />


- **Real-time Validation**: Measure beat count validation with visual feedback
- **Error Highlighting**: Hover over validation errors to highlight the problematic measure
<img width="956" height="987" alt="スクリーンショット 2025-11-23 14 44 14" src="https://github.com/user-attachments/assets/50d7f3c4-5c7e-47df-8237-cdebb2ce086f" />

- **Preview**: Live preview of music notation using abcjs
<img width="1900" height="984" alt="スクリーンショット 2025-11-23 14 48 34" src="https://github.com/user-attachments/assets/f2af8ae6-30c5-46c9-b905-653cdacd4cf5" />


## Installation

```bash
npm install @ovnonvo/abc-editor
```

or

```bash
yarn add @ovnonvo/abc-editor
```

## Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0",
  "abcjs": "^6.0.0"
}
```

Install them if you haven't already:

```bash
npm install react react-dom abcjs
```

## Usage

### Basic Example

```tsx
import { useState } from 'react';
import { AbcEditor, AbcPreview } from '@ovnonvo/abc-editor';

function App() {
  const [abcCode, setAbcCode] = useState(`X:1
T:Untitled
M:4/4
K:C
C D E F | G A B c |`);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <AbcEditor value={abcCode} onChange={setAbcCode} />
      <AbcPreview value={abcCode} />
    </div>
  );
}

export default App;
```

**Note:** Styles are automatically included - no need to import CSS separately!

### With Theme Support

```tsx
import { useState } from 'react';
import { AbcEditor, AbcPreview, type Theme } from '@ovnonvo/abc-editor';

function App() {
  const [abcCode, setAbcCode] = useState(`X:1
T:Untitled
M:4/4
K:C
C D E F | G A B c |`);
  const [theme, setTheme] = useState<Theme>('light'); // 'light' or 'dark'

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <div style={{ display: 'flex', height: '100vh' }}>
        <AbcEditor value={abcCode} onChange={setAbcCode} theme={theme} />
        <AbcPreview value={abcCode} theme={theme} />
      </div>
    </div>
  );
}

export default App;
```

### Components

#### `AbcEditor`

The main editor component with syntax highlighting and validation.

**Props:**
- `value` (string): The ABC notation code
- `onChange` ((value: string) => void): Callback when the code changes
- `theme?` ('light' | 'dark'): Editor theme (default: 'light')

**Features:**
- Line numbers
- Syntax highlighting with theme support
- Autocomplete (type `/` to trigger)
- Real-time validation
- Error display with hover highlighting
- Light and dark mode

#### `AbcPreview`

Preview component that renders the ABC notation as sheet music.

**Props:**
- `value` (string): The ABC notation code to render
- `theme?` ('light' | 'dark'): Preview theme (default: 'light')

### Autocomplete

Type `/` followed by a command to trigger autocomplete:

- `/header` - Insert ABC header template
- `/note` - Insert note example
- `/chord` - Insert chord example
- `/measure` - Insert measure example

### Validation

The editor validates measure beat counts based on the time signature (M:) and unit note length (L:):

- Errors are displayed at the bottom of the editor
- Hover over an error to highlight the problematic measure
- Shows line number, measure number, and expected vs. actual beat count

### Hooks

#### `useLineNumbers(value: string): string`

Generates line numbers for the editor.

```tsx
import { useLineNumbers } from '@ovnonvo/abc-editor';

const lineNumbers = useLineNumbers(abcCode);
```

#### `useAbcAutoComplete(options)`

Provides autocomplete functionality for ABC notation.

```tsx
import { useAbcAutoComplete } from '@ovnonvo/abc-editor';

const {
  isOpen,
  suggestions,
  selectedIndex,
  position,
  handleKeyDown,
  selectSuggestion,
  handleMouseEnter,
} = useAbcAutoComplete({
  value: abcCode,
  textareaRef,
  onChange: setAbcCode,
});
```

### Utilities

#### `highlightAbc(code: string): string`

Returns syntax-highlighted HTML for ABC notation.

```tsx
import { highlightAbc } from '@ovnonvo/abc-editor';

const highlighted = highlightAbc('C D E F | G A B c |');
```

#### `validateAbc(code: string): ValidationError[]`

Validates ABC notation and returns errors.

```tsx
import { validateAbc } from '@ovnonvo/abc-editor';

const errors = validateAbc(abcCode);
```

### Types

```tsx
import type {
  Theme,
  AbcField,
  AbcFieldKey,
  ValidationError,
} from '@ovnonvo/abc-editor';
```

**Available Types:**
- `Theme`: 'light' | 'dark' - Theme configuration for components
- `AbcField`: ABC notation field structure
- `AbcFieldKey`: ABC field key types (X:, T:, M:, K:, etc.)
- `ValidationError`: Validation error structure

## Styling

The package automatically injects all necessary styles when you import the components. **No separate CSS import required!**

**Note:** You don't need to install or configure Tailwind CSS in your project. All styles are automatically included and injected when you use the components.

### Theme Customization

The editor comes with built-in light and dark themes. Light mode is the default. You can customize the theme colors by overriding the CSS variables:

```css
/* Light mode (default) */
:root {
  --abc-key: #0066cc;
  --abc-note: #000000;
  /* ... other variables */
}

/* Dark mode */
[data-theme="dark"] {
  --abc-key: #7ad7ff;
  --abc-note: #f8fbff;
  /* ... other variables */
}
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build library
npm run build

# Run tests
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Credits

Built with:
- [React](https://reactjs.org/)
- [abcjs](https://www.abcjs.net/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
