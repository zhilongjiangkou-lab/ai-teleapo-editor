const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/ConversationFlow.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// フロー図で終話系パターンをフィルタリング
const oldTopPatterns = `  // 表示する主要なfromパターン（上位5つ）
  const topPatterns = Object.entries(flowByPattern)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5);`;

const newTopPatterns = `  // 表示する主要なfromパターン（上位5つ）
  // ただし、終話系パターン（endCall）は除外
  const topPatterns = Object.entries(flowByPattern)
    .filter(([fromPattern]) => !isEndCallPattern(fromPattern))
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5);`;

content = content.replace(oldTopPatterns, newTopPatterns);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ フロー図から終話系パターンをフィルタリングしました');
console.log('  - ID:35, ID:8, ID:24 などの終話系パターンは「fromパターン」として表示されません');
console.log('  - これらは会話の最終ターンなので、その後の遷移は存在しません');
