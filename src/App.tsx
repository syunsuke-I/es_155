import { useState } from "react";
import { AbcEditor } from "./components/AbcEditor";
import { AbcPreview } from "./components/AbcPreview";

function App() {
  const [abc, setAbc] = useState(`X:1
T:Untitled
M:4/4
K:C
C D E F | G A B c |`);

  return (
    <div className="h-screen flex flex-col-reverse md:flex-row bg-slate-950">
      <AbcEditor value={abc} onChange={setAbc} />

      {/* 右側: プレビュー (モバイル: 上部1/3) */}
      <div className="w-full md:w-1/2 h-1/3 md:h-full flex flex-col p-4" style={{ backgroundColor: '#161616' }}>
        <div className="w-full h-full rounded-lg border border-slate-600 overflow-auto p-4" style={{ backgroundColor: '#1a1a1a' }}>
          <AbcPreview abc={abc} />
        </div>
      </div>
    </div>
  );
}

export default App;
