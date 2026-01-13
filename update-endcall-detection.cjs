const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/ConversationFlow.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 終話系パターンの判定を動的に変更
const oldCode = `// 会話フロー図コンポーネント
export const ConversationFlowChart = ({ flowByPattern, patterns, Icons }) => {
  // 終話系パターンID
  const endCallPatterns = ['35', '8', '24'];

  // パターンIDから日本語名を取得する関数
  const getPatternLabel = (id) => {
    if (id === 'undefined') {
      return '応答なし';
    }
    const pattern = patterns?.find(p => String(p.id) === String(id));
    if (pattern) {
      return \`ID:\${id} - \${pattern.japanese_reply}\`;
    }
    return \`ID:\${id}\`;
  };`;

const newCode = `// 会話フロー図コンポーネント
export const ConversationFlowChart = ({ flowByPattern, patterns, Icons }) => {
  // パターンデータからendCallタイプのIDを動的に取得
  const endCallPatterns = patterns
    ?.filter(p => p.type === 'endCall')
    .map(p => String(p.id)) || [];

  // パターンIDから日本語名を取得する関数
  const getPatternLabel = (id) => {
    if (id === 'undefined') {
      return '応答なし';
    }
    const pattern = patterns?.find(p => String(p.id) === String(id));
    if (pattern) {
      return \`ID:\${id} - \${pattern.japanese_reply}\`;
    }
    return \`ID:\${id}\`;
  };

  // パターンが終話系かどうかを判定
  const isEndCallPattern = (id) => {
    if (id === 'undefined') return false;
    return endCallPatterns.includes(String(id));
  };`;

content = content.replace(oldCode, newCode);

// isEndCallの使用箇所を更新
content = content.replace(
  /const isEndCall = endCallPatterns\.includes\(trans\.to\);/g,
  'const isEndCall = isEndCallPattern(trans.to);'
);

// 凡例の更新
const oldLegend = `            <span className="text-slate-400">終話系パターン（ID:35, 8, 24）</span>`;
const newLegend = `            <span className="text-slate-400">終話系パターン（type: endCall）</span>`;

content = content.replace(oldLegend, newLegend);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 終話系パターンの判定を動的に変更しました');
console.log('  - パターンデータのtype属性を参照');
console.log('  - ハードコーディングを削除');
