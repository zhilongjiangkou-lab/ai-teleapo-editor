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

// ID:35を含む会話を探す
let id35Cases = [];

Object.entries(conversations).forEach(([contactId, logs]) => {
  logs.forEach((log, index) => {
    if (log.selectedId === '35') {
      id35Cases.push({
        contactId,
        position: index + 1,  // 何ターン目か
        totalTurns: logs.length,
        isLast: index === logs.length - 1,
        conversationLogs: logs
      });
    }
  });
});

console.log('='.repeat(80));
console.log(`ID:35が出現した会話: ${id35Cases.length}件`);
console.log('='.repeat(80));
console.log();

if (id35Cases.length === 0) {
  console.log('このCSVデータにはID:35が含まれていません。');
} else {
  // 位置の分布
  const positionStats = {};
  id35Cases.forEach(c => {
    const key = c.isLast ? '最終ターン' : `${c.position}/${c.totalTurns}ターン目`;
    if (!positionStats[key]) {
      positionStats[key] = 0;
    }
    positionStats[key]++;
  });

  console.log('ID:35の出現位置:');
  Object.entries(positionStats).forEach(([pos, count]) => {
    console.log(`  ${pos}: ${count}件`);
  });

  console.log('\n\n詳細サンプル（最初の5件）:');
  id35Cases.slice(0, 5).forEach((caseData, idx) => {
    console.log(`\n【ケース ${idx + 1}】contactId: ${caseData.contactId.slice(0, 8)}...`);
    console.log(`  総ターン数: ${caseData.totalTurns}件`);
    console.log(`  ID:35が出現: ${caseData.position}ターン目 ${caseData.isLast ? '（最終ターン）' : ''}`);
    console.log();
    console.log('  会話の流れ:');
    caseData.conversationLogs.forEach((log, i) => {
      const marker = log.selectedId === '35' ? '★' : ' ';
      console.log(`    ${marker} ${i + 1}. [ID:${log.selectedId}] "${log.transcript}"`);
    });
    console.log('-'.repeat(80));
  });
}
