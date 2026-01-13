const fs = require('fs');

// CSVを読み込む
const csvPath = 'C:/Users/zhilo/Downloads/logs-insights-results (10).csv';
const csv = fs.readFileSync(csvPath, 'utf8');

// CSVをパース
const lines = csv.split('\n').filter(line => line.trim());
const headers = lines[0].replace(/^\uFEFF/, '').split(',');

const logs = [];
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  if (values.length >= 4) {
    logs.push({
      timestamp: values[0],
      contactId: values[1],
      transcript: values[2],
      selectedId: values[3]
    });
  }
}

// contactIdでグループ化
const conversations = {};
logs.forEach(log => {
  const cid = log.contactId;
  if (!cid) return;
  if (!conversations[cid]) {
    conversations[cid] = [];
  }
  conversations[cid].push(log);
});

// タイムスタンプでソート（古い順）
Object.keys(conversations).forEach(cid => {
  conversations[cid].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
});

console.log('ID:35を含む会話を詳しく調査\n');
console.log('='.repeat(80));

// ID:35を含む全ての会話を表示
let count = 0;
Object.entries(conversations).forEach(([contactId, logs]) => {
  const hasId35 = logs.some(log => log.selectedId === '35');

  if (hasId35) {
    count++;
    if (count <= 10) {  // 最初の10件を詳細表示
      console.log(`\n【会話 ${count}】contactId: ${contactId.slice(0, 12)}...`);
      console.log(`総ターン数: ${logs.length}件\n`);

      logs.forEach((log, index) => {
        const isId35 = log.selectedId === '35';
        const marker = isId35 ? '★★★' : '   ';
        const isLast = index === logs.length - 1;
        const lastMarker = isLast ? ' [最終ターン]' : '';

        console.log(`${marker} ${index + 1}ターン目${lastMarker}`);
        console.log(`    時刻: ${log.timestamp}`);
        console.log(`    発話: "${log.transcript}"`);
        console.log(`    ID: ${log.selectedId}`);
        console.log();
      });

      const id35Index = logs.findIndex(log => log.selectedId === '35');
      const isId35Last = logs[logs.length - 1].selectedId === '35';

      if (isId35Last) {
        console.log(`✅ ID:35は最終ターン（${id35Index + 1}/${logs.length}ターン目）で出現 → 切電`);
      } else {
        console.log(`⚠️  ID:35は途中（${id35Index + 1}/${logs.length}ターン目）で出現 → その後${logs.length - id35Index - 1}ターン続いた`);
      }
      console.log('-'.repeat(80));
    }
  }
});

console.log(`\n\n総計: ID:35を含む会話は ${count}件`);

// 統計
let id35IsLast = 0;
let id35NotLast = 0;

Object.entries(conversations).forEach(([contactId, logs]) => {
  const hasId35 = logs.some(log => log.selectedId === '35');
  if (hasId35) {
    if (logs[logs.length - 1].selectedId === '35') {
      id35IsLast++;
    } else {
      id35NotLast++;
    }
  }
});

console.log(`\n統計:`);
console.log(`  ID:35が最終ターンで出現（切電）: ${id35IsLast}件`);
console.log(`  ID:35が途中で出現（その後も会話継続）: ${id35NotLast}件`);
