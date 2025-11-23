import type { Suggestion } from './abcSuggestions';

// ABC記法のコマンド候補（/で始まるコマンド）
export const ABC_COMMANDS: Suggestion[] = [
  {
    value: '/header',
    description: 'Insert basic ABC header template',
    template: `X:1
T:Untitled
M:4/4
L:1/4
K:C
`,
  },
];

// コマンド入力から候補を取得する関数
export const getCommandSuggestions = (input: string): Suggestion[] => {
  if (!input.startsWith('/')) {
    return [];
  }

  // 入力値でフィルタリング
  return ABC_COMMANDS.filter((command) =>
    command.value.toLowerCase().startsWith(input.toLowerCase())
  );
};
