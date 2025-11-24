import { useState } from "react";
import { AbcEditor } from "./components/AbcEditor";
import type { Theme } from "./types/abc";

function App() {
  const [abc, setAbc] = useState(`X:1
T:Untitled
M:4/4
K:C
F A D E  D A G E |`);
  const [theme, setTheme] = useState<Theme>('light');

  const colors = theme === 'dark'
    ? { bg: '#0a0a0a', headerBg: '#0a0a0a' }
    : { bg: '#f8f9fa', headerBg: '#e9ecef' };

  return (
    <div className="h-screen flex flex-col bg-slate-950" style={{ backgroundColor: colors.bg }}>
      {/* テーマ切り替えボタン */}
      <div className="flex justify-end p-3" style={{ backgroundColor: colors.headerBg }}>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-md"
          style={{
            backgroundColor: theme === 'dark' ? '#4a5568' : '#2563eb',
            color: '#ffffff'
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <div className="flex-1">
        <AbcEditor value={abc} onChange={setAbc} theme={theme} />
      </div>
    </div>
  );
}

export default App;
