const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/AITeleapoEditor.jsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 削除する範囲を特定
let startDelete = -1;
let endDelete = -1;

// サブタブの開始（1178行目の "サブタブ"コメント）から
// 1ターン離脱の直前（1220行目）まで削除
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* サブタブ */')) {
    startDelete = i;
  }
  if (lines[i].includes('/* 会話フロー */')) {
    endDelete = i - 1;  // 会話フローの直前まで
    break;
  }
}

console.log(`サブタブナビゲーション削除: ${startDelete}行目から${endDelete}行目`);

// サブタブナビゲーションを削除
if (startDelete !== -1 && endDelete !== -1) {
  lines.splice(startDelete, endDelete - startDelete + 1);
}

// 1ターン離脱以降のセクションを削除
startDelete = -1;
endDelete = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* 1ターン離脱 */')) {
    startDelete = i - 1;  // 空行も含めて削除
  }
  if (lines[i].includes('/* 不適切応答 */') && startDelete !== -1) {
    // 不適切応答セクションの終わりを探す
    let braceCount = 0;
    let found = false;
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('{')) braceCount++;
      if (lines[j].includes('}')) braceCount--;
      if (braceCount < 0 && lines[j].trim() === ')}') {
        endDelete = j;
        found = true;
        break;
      }
    }
    if (found) break;
  }
}

console.log(`不要なサブタブ削除: ${startDelete}行目から${endDelete}行目`);

if (startDelete !== -1 && endDelete !== -1) {
  lines.splice(startDelete, endDelete - startDelete + 1);
}

// exitAnalysisTab === 'flow' の条件を削除
lines = lines.map(line => {
  if (line.includes("exitAnalysisTab === 'flow' &&")) {
    return line.replace("exitAnalysisTab === 'flow' && ", '');
  }
  return line;
});

// ファイルに書き込み
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

console.log('✅ 削除完了');
console.log('  - サブタブナビゲーション削除');
console.log('  - 1ターン離脱セクション削除');
console.log('  - 2ターン離脱セクション削除');
console.log('  - 切電直前ログセクション削除');
console.log('  - 不適切応答セクション削除');
console.log('  - 会話フローのみ残しました');
