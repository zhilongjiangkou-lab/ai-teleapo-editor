const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/AITeleapoEditor.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`元のファイル: ${lines.length}行`);

// ステップ1: サブタブナビゲーション削除（1178-1200行目）
// ステップ2: exitAnalysisTab条件削除（1203行目）
// ステップ3: 1ターン離脱以降のセクション削除（1220行目から最後のexitAnalysisTabセクションまで）

const result = [];
let skipMode = false;
let skipUntilLine = -1;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;

  // サブタブナビゲーション削除（1178-1200行目）
  if (lineNum >= 1178 && lineNum <= 1200) {
    continue;  // スキップ
  }

  // exitAnalysisTab条件を削除
  if (lineNum === 1203 && line.includes("exitAnalysisTab === 'flow'")) {
    result.push(line.replace("{exitAnalysisTab === 'flow' && (", '{'));
    continue;
  }

  // 1ターン離脱セクションの開始を検出
  if (line.includes("/* 1ターン離脱 */")) {
    skipMode = true;
    braceDepth = 0;
    continue;
  }

  // スキップモード中
  if (skipMode) {
    // 不適切応答セクションの終わりを検出
    if (line.includes("/* ターン数別統計 */") ||
        (line.trim() === '</>' && braceDepth === 0)) {
      skipMode = false;
      // この行もスキップ（終了条件の行）
      if (line.trim() === '</>') {
        continue;
      }
    } else {
      continue;  // スキップ
    }
  }

  result.push(line);
}

console.log(`処理後: ${result.length}行`);
console.log(`削除した行数: ${lines.length - result.length}行`);

// ファイルに書き込み
fs.writeFileSync(filePath, result.join('\n'), 'utf8');

console.log('✅ 完了');
