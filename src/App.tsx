import { useState } from "react";
import { AbcPreview } from "./components/AbcPreview";

function App() {
  const [abc, setAbc] = useState(`X:1
T:タイトル
M:4/4
K:C
C D E F | G A B c |`);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* ヘッダー */}
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              ABC Editor
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              左に ABC 記法を入力すると、右に楽譜プレビューが表示されます。
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            abcjs + React + Tailwind
          </span>
        </header>

        {/* メインエリア */}
        <main className="grid gap-4 md:grid-cols-2">
          {/* エディタパネル */}
          <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <h2 className="text-sm font-medium text-slate-100">
                ABC 記法エディタ
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                X: / T: / M: / K:
              </span>
            </div>
            <textarea
              className="flex-1 resize-none bg-transparent px-4 py-3 text-sm font-mono leading-relaxed text-slate-100 outline-none placeholder:text-slate-600"
              value={abc}
              onChange={(e) => setAbc(e.target.value)}
              spellCheck={false}
            />
            <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2.5 text-[11px] text-slate-500">
              <span>Shift+Enter で改行 / Enter で通常改行（お好みで拡張）</span>
              <span className="hidden md:inline">
                例: <code className="font-mono">C D E F | G A B c |</code>
              </span>
            </div>
          </section>

          {/* プレビューパネル */}
          <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <h2 className="text-sm font-medium text-slate-100">
                楽譜プレビュー
              </h2>
              <span className="text-[11px] text-slate-500">powered by abcjs</span>
            </div>
            <div className="flex-1 overflow-auto px-3 py-3">
              <div className="rounded-xl bg-slate-950/60 p-3">
                <AbcPreview abc={abc} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
