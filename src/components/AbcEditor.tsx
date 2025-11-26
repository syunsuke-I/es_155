import { useRef, useMemo, useState } from "react";
import { useLineNumbers } from "../hooks/useLineNumbers";
import { highlightAbc } from "../utils/highlightAbc";
import { useAbcAutoComplete } from "../hooks/useAbcAutoComplete";
import { SuggestionList } from "./SuggestionList";
import { validateAbc, type ValidationError } from "../utils/validateAbc";
import type { Theme } from "../types/abc";

interface AbcEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: Theme;
}

// 共通のテキストスタイル（textareaとdivで完全に一致させる）
const sharedTextStyle: React.CSSProperties = {
  margin: 0,
  padding: '16px',
  border: 'none',
  outline: 'none',
  fontSize: '14px',
  fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontWeight: 400,
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontStretch: 'normal',
  lineHeight: '24px',
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  textAlign: 'left',
  textIndent: 0,
  textTransform: 'none',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  tabSize: 4,
  boxSizing: 'border-box',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

export const AbcEditor = ({ value, onChange, theme = 'light' }: AbcEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [hoveredError, setHoveredError] = useState<ValidationError | null>(null);

  const lineNumbers = useLineNumbers(value);
  const highlightedCode = highlightAbc(value);
  const validationErrors = useMemo(() => validateAbc(value), [value]);

  // テーマごとの色設定
  const colors = theme === 'dark'
    ? {
        bg: '#1a1a1a',
        editorBg: '#262626',
        lineNumBg: '#0f0f0f',
        lineNumBorder: '#2d2d2d',
        caretColor: '#fff',
        placeholderColor: '#64748b',
        errorBg: '#1a1a1a',
        errorBorder: '#2d2d2d',
        errorHeader: '#ffffff',
        errorBadgeBg: '#dc2626',
        errorBadgeText: '#ffffff',
        errorIcon: '#f59e0b',
        errorLocation: '#22d3ee',
        errorMessage: '#e5e7eb',
        errorHighlight: 'rgba(245, 158, 11, 0.2)',
        errorHoverBg: 'rgba(51, 65, 85, 0.4)',
        errorItemBorder: 'rgba(255, 255, 255, 0.05)'
      }
    : {
        bg: '#f8f9fa',
        editorBg: '#ffffff',
        lineNumBg: '#ffffff',
        lineNumBorder: '#e5e7eb',
        caretColor: '#000',
        placeholderColor: '#999999',
        errorBg: '#ffffff',
        errorBorder: '#e5e7eb',
        errorHeader: '#1f2937',
        errorBadgeBg: '#dc2626',
        errorBadgeText: '#ffffff',
        errorIcon: '#dc2626',
        errorLocation: '#0891b2',
        errorMessage: '#1f2937',
        errorHighlight: '#fde047',
        errorHoverBg: 'rgba(254, 202, 202, 0.4)',
        errorItemBorder: 'rgba(220, 38, 38, 0.1)'
      };

  // オートコンプリート機能
  const {
    isOpen,
    suggestions,
    selectedIndex,
    position,
    handleKeyDown,
    selectSuggestion,
    handleMouseEnter,
  } = useAbcAutoComplete({ value, textareaRef, onChange });

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current && highlightRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleErrorClick = (error: ValidationError) => {
    if (textareaRef.current) {
      const lines = value.split('\n');
      const position = lines.slice(0, error.line).join('\n').length + (error.line > 0 ? 1 : 0);
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(position, position);
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight * (error.line / lines.length);
    }
  };

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden shadow-lg" data-theme={theme} style={{ backgroundColor: colors.editorBg }}>
      {/* エディタ部分 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 行番号 */}
        <div
          ref={lineNumbersRef}
          className="overflow-hidden select-none"
          style={{
            ...sharedTextStyle,
            backgroundColor: colors.lineNumBg,
            minWidth: '3rem',
            padding: '16px 8px 16px 8px',
            color: '#6b7280',
            borderRightColor: colors.lineNumBorder,
            borderRightStyle: 'solid',
            borderRightWidth: '1px',
          }}
        >
          {lineNumbers.split('\n').map((num, i) => (
            <div key={i} style={{ textAlign: 'center' }}>{num}</div>
          ))}
        </div>

        {/* エディタエリア */}
        <div className="flex-1 relative">
          {/* シンタックスハイライト背景 */}
          <div
            ref={highlightRef}
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              ...sharedTextStyle,
              backgroundColor: colors.editorBg,
              opacity: hoveredError ? 0.3 : 1,
              transition: 'opacity 0.2s',
            }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />

          {/* ホバー中の小節ハイライト */}
          {hoveredError && (() => {
            const lines = value.split('\n');
            const errorLine = lines[hoveredError.line] || '';
            const errorMeasure = errorLine.substring(hoveredError.startCol, hoveredError.endCol);
            const highlightedMeasure = highlightAbc(errorMeasure);

            return (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  ...sharedTextStyle,
                  backgroundColor: 'transparent',
                }}
              >
                {lines.map((line, lineIndex) => {
                  if (lineIndex === hoveredError.line) {
                    const before = line.substring(0, hoveredError.startCol);
                    const after = line.substring(hoveredError.endCol);

                    return (
                      <div key={lineIndex}>
                        <span style={{ visibility: 'hidden' }}>{before}</span>
                        <span
                          style={{
                            backgroundColor: colors.errorHighlight,
                            borderRadius: '2px',
                            padding: '1px 2px',
                          }}
                          dangerouslySetInnerHTML={{ __html: highlightedMeasure }}
                        />
                        <span style={{ visibility: 'hidden' }}>{after}</span>
                      </div>
                    );
                  }
                  return <div key={lineIndex} style={{ visibility: 'hidden' }}>{line || '\u200B'}</div>;
                })}
              </div>
            );
          })()}

          {/* テキストエリア */}
          <textarea
            ref={textareaRef}
            className="absolute inset-0 w-full h-full resize-none"
            style={{
              ...sharedTextStyle,
              backgroundColor: 'transparent',
              color: 'transparent',
              caretColor: colors.caretColor,
              // ブラウザ固有のスタイルをリセット
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="Type /header to insert template..."
          />

          {/* オートコンプリート候補リスト */}
          {isOpen && (
            <SuggestionList
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              position={position}
              onSelect={selectSuggestion}
              onMouseEnter={handleMouseEnter}
            />
          )}
        </div>
      </div>

      {/* エラー表示エリア */}
      {validationErrors.length > 0 && (
        <div className="flex">
          {/* 行番号幅分の空白 */}
          <div
            style={{
              backgroundColor: colors.lineNumBg,
              minWidth: '3rem',
              borderRightColor: colors.lineNumBorder,
              borderRightStyle: 'solid',
              borderRightWidth: '1px'
            }}
          />
          {/* エラー内容 */}
          <div
            className="flex-1 px-4 py-3 text-xs font-mono overflow-auto border-t"
            style={{
              backgroundColor: colors.errorBg,
              borderColor: colors.errorBorder,
              maxHeight: '12rem',
              scrollbarWidth: 'thin',
              scrollbarColor: `${colors.errorIcon} transparent`
            }}
          >
            {/* ヘッダー */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: colors.errorIcon }}
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: colors.errorHeader }}>
                  Validation Issues
                </span>
              </div>
              <div
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: colors.errorBadgeBg,
                  color: colors.errorBadgeText
                }}
              >
                {validationErrors.length}
              </div>
            </div>

            {/* エラーリスト */}
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 px-3 py-2 rounded-md border cursor-pointer"
                  style={{
                    backgroundColor: hoveredError === error ? colors.errorHoverBg : 'transparent',
                    borderColor: hoveredError === error ? colors.errorIcon : colors.errorItemBorder,
                    transition: 'all 0.15s ease-in-out',
                    transform: hoveredError === error ? 'translateX(2px)' : 'translateX(0)'
                  }}
                  onMouseEnter={() => setHoveredError(error)}
                  onMouseLeave={() => setHoveredError(null)}
                  onClick={() => handleErrorClick(error)}
                >
                  {/* アイコン */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 mt-0.5"
                    style={{ color: colors.errorIcon }}
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>

                  {/* エラー内容 */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="font-semibold text-[11px] px-1.5 py-0.5 rounded"
                        style={{
                          color: colors.errorLocation,
                          backgroundColor: theme === 'dark' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(8, 145, 178, 0.1)'
                        }}
                      >
                        Line {error.line + 1}, Measure {error.measureIndex + 1}
                      </span>
                    </div>
                    <span className="text-[11px] leading-relaxed" style={{ color: colors.errorMessage }}>
                      {error.message}
                    </span>
                  </div>

                  {/* ジャンプアイコン */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 mt-1 opacity-50"
                    style={{
                      color: colors.errorIcon,
                      opacity: hoveredError === error ? 1 : 0.3,
                      transition: 'opacity 0.15s ease-in-out'
                    }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
