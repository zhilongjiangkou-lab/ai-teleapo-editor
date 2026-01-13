const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/AITeleapoEditor.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. サブタブナビゲーションを削除
content = content.replace(
  /\s*{\/\* サブタブ \*\/}[\s\S]*?<\/div>\n\n\s+{\/\* 会話フロー \*\/}\n\s+{exitAnalysisTab === 'flow' && \(/,
  '                    {/* 会話フロー */}\n                    {('
);

// 2. 1ターン離脱から不適切応答までのセクションを削除
const pattern = /\s+{\/\* 1ターン離脱 \*\/}[\s\S]*?{exitAnalysisTab === 'inappropriate'[^}]+}\)\s*}\s*\)/;
content = content.replace(pattern, '');

// より安全な方法：行番号ベースで削除
const lines = content.split('\n');
// 1221行目から1400行目あたりまでを削除

console.log('手動で削除する必要があります');
