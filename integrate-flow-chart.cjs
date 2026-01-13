const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/AITeleapoEditor.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. import文を追加
const importLine = `import { analyzeEarlyExit, detectInappropriateResponses } from './earlyExitAnalysis';`;
const newImportLine = `import { analyzeEarlyExit, detectInappropriateResponses } from './earlyExitAnalysis';
import { ConversationFlowChart } from './ConversationFlow';`;

content = content.replace(importLine, newImportLine);

// 2. フローセクション（1202-1302行目）を置き換え
const flowSectionStart = `                    {/* 会話フロー */}
                    {exitAnalysisTab === 'flow' && (`;

const flowSectionEnd = `                      </div>
                    )}

                    {/* 1ターン離脱 */}`;

// 既存のフローセクションを見つける
const startIndex = content.indexOf(flowSectionStart);
const endIndex = content.indexOf(flowSectionEnd, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error('フローセクションが見つかりませんでした');
  process.exit(1);
}

// 新しいフローセクション
const newFlowSection = `                    {/* 会話フロー */}
                    {exitAnalysisTab === 'flow' && (
                      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Icons.TrendingUp />
                          会話フロー図
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">
                          左から右への流れで、パターンIDがどのように遷移しているかを可視化
                        </p>

                        <ConversationFlowChart
                          flowByPattern={logAnalysis.earlyExitAnalysis.flowByPattern}
                          Icons={Icons}
                        />
`;

// 置き換え
content = content.substring(0, startIndex) + newFlowSection + content.substring(endIndex);

// ファイルに書き込み
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ ConversationFlowChartコンポーネントを統合しました');
console.log('  - import文を追加');
console.log('  - フローセクションを置き換え');
