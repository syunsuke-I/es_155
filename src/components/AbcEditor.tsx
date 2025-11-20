import { useRef } from "react";
import { useLineNumbers } from "../hooks/useLineNumbers";
import { highlightAbc } from "../utils/highlightAbc";

interface AbcEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const AbcEditor = ({ value, onChange }: AbcEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const lineNumbers = useLineNumbers(value);
  const highlightedCode = highlightAbc(value);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current && highlightRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
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

        {/* エディタエリア */}
        <div className="flex-1 relative">
          {/* シンタックスハイライト背景 */}
          <div
            ref={highlightRef}
            className="absolute inset-0 overflow-hidden px-4 py-4 text-sm font-mono leading-relaxed pointer-events-none"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <pre
              className="m-0"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </div>

          {/* テキストエリア */}
          <textarea
            ref={textareaRef}
            className="absolute inset-0 w-full h-full resize-none px-4 py-4 text-sm font-mono leading-relaxed outline-none border-0"
            style={{ backgroundColor: 'transparent', color: 'transparent', caretColor: '#fff' }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            spellCheck={false}
            placeholder="ABC記法を入力..."
          />
        </div>
      </div>
    </div>
  );
};
