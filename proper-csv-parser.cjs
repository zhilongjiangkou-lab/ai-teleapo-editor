const fs = require('fs');

// CSVを読み込む
const csvPath = 'C:/Users/zhilo/Downloads/logs-insights-results (10).csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');

// 簡易CSVパーサー（4列固定）
function parseCSVLine(line) {
  // @timestamp,contactId,transcript_text,selectedId の4列
  // 最初のカンマ、2番目のカンマ、最後のカンマを見つける
  const firstComma = line.indexOf(',');
  if (firstComma === -1) return null;

  const timestamp = line.substring(0, firstComma);

  const secondComma = line.indexOf(',', firstComma + 1);
  if (secondComma === -1) return null;

  const contactId = line.substring(firstComma + 1, secondComma);

  const lastComma = line.lastIndexOf(',');
  if (lastComma === secondComma) return null;

  const transcript = line.substring(secondComma + 1, lastComma);
  const selectedId = line.substring(lastComma + 1).trim();

  return {
    timestamp,
    contactId,
    transcript,
    selectedId
  };
}

// ファイルを行ごとに処理
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0];

const logs = [];
for (let i = 1; i < lines.length; i++) {
  const parsed = parseCSVLine(lines[i]);
  if (parsed) {
    logs.push(parsed);
  }
}

console.log(`総ログ数: ${logs.length}件\n`);

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

console.log(`総会話数: ${Object.keys(conversations).length}件\n`);

// ID:35を含む会話を調査
console.log('='.repeat(80));
console.log('ID:35を含む会話の詳細分析');
console.log('='.repeat(80));

let id35Conversations = [];

Object.entries(conversations).forEach(([contactId, logs]) => {
  const id35Indices = [];
  logs.forEach((log, index) => {
    if (log.selectedId === '35') {
      id35Indices.push(index);
    }
  });

  if (id35Indices.length > 0) {
    id35Conversations.push({
      contactId,
      logs,
      id35Indices,
      isId35Last: logs[logs.length - 1].selectedId === '35'
    });
  }
});

console.log(`\nID:35を含む会話: ${id35Conversations.length}件\n`);

// 統計
const id35IsLast = id35Conversations.filter(c => c.isId35Last).length;
const id35NotLast = id35Conversations.filter(c => !c.isId35Last).length;

console.log('統計:');
console.log(`  ID:35が最終ターンで出現（切電）: ${id35IsLast}件`);
console.log(`  ID:35が途中で出現（その後も会話継続）: ${id35NotLast}件\n`);

// ID:35が途中で出現するケースを表示
if (id35NotLast > 0) {
  console.log('='.repeat(80));
  console.log('⚠️  ID:35が途中で出現し、その後も会話が続いたケース');
  console.log('='.repeat(80));

  id35Conversations.filter(c => !c.isId35Last).slice(0, 5).forEach((conv, idx) => {
    console.log(`\n【ケース ${idx + 1}】contactId: ${conv.contactId.slice(0, 12)}...`);
    console.log(`総ターン数: ${conv.logs.length}件`);
    console.log(`ID:35出現位置: ${conv.id35Indices.map(i => i + 1).join(', ')}ターン目\n`);

    conv.logs.forEach((log, index) => {
      const isId35 = log.selectedId === '35';
      const marker = isId35 ? '★★★' : '   ';
      const isLast = index === conv.logs.length - 1;

      console.log(`${marker} ${index + 1}ターン目${isLast ? ' [最終]' : ''}`);
      console.log(`    ID: ${log.selectedId}`);
      console.log(`    発話: "${log.transcript.slice(0, 60)}${log.transcript.length > 60 ? '...' : ''}"`);
    });
    console.log('-'.repeat(80));
  });
} else {
  console.log('\n✅ ID:35は常に最終ターンで出現しています（正しく機能）');
}
