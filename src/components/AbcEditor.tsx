import { useRef } from "react";

interface AbcEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const AbcEditor = ({ value, onChange }: AbcEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1).join('\n');

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="w-1/2 border-r border-slate-700 flex flex-col p-4" style={{ backgroundColor: '#161616' }}>
      <div className="w-full h-full flex rounded-lg border border-slate-600 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
        {/* 行番号 */}
        <div
          ref={lineNumbersRef}
          className="overflow-hidden text-right pl-1 pr-3 py-4 text-sm font-mono leading-relaxed text-slate-500 select-none"
          style={{ backgroundColor: '#0f0f0f', minWidth: '2.5rem' }}
        >
          <pre className="m-0">{lineNumbers}</pre>
        </div>

        {/* エディタ */}
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none px-4 py-4 text-sm font-mono leading-relaxed text-slate-100 outline-none border-0"
          style={{ backgroundColor: '#1a1a1a' }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          placeholder="ABC記法を入力..."
        />
      </div>
    </div>
  );
};
