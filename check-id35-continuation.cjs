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

// ID:35が出現した後に会話が続いているケースを探す
let id35ContinuationCases = [];

Object.entries(conversations).forEach(([contactId, logs]) => {
  for (let i = 0; i < logs.length - 1; i++) {
    if (logs[i].selectedId === '35') {
      // ID:35の後にログがある場合
      const afterLogs = logs.slice(i + 1);
      if (afterLogs.length > 0) {
        id35ContinuationCases.push({
          contactId,
          id35Index: i,
          id35Log: logs[i],
          afterLogs: afterLogs,
          totalTurns: logs.length
        });
      }
    }
  }
});

console.log('='.repeat(80));
console.log(`ID:35（判別不能）の後に会話が続いているケース: ${id35ContinuationCases.length}件`);
console.log('='.repeat(80));
console.log();

if (id35ContinuationCases.length === 0) {
  console.log('ID:35の後に会話が続いているケースは見つかりませんでした。');
  console.log('つまり、ID:35が出現したら必ず会話が終了しています。');
} else {
  // 詳細を表示（最初の10件）
  id35ContinuationCases.slice(0, 10).forEach((caseData, idx) => {
    console.log(`\n【ケース ${idx + 1}】contactId: ${caseData.contactId.slice(0, 8)}...`);
    console.log(`  総ターン数: ${caseData.totalTurns}件`);
    console.log(`  ID:35が出現: ${caseData.id35Index + 1}ターン目`);
    console.log(`  その後の会話: ${caseData.afterLogs.length}ターン`);
    console.log();
    console.log(`  ➤ ID:35時点:`);
    console.log(`    発話: "${caseData.id35Log.transcript}"`);
    console.log(`    時刻: ${caseData.id35Log.timestamp}`);
    console.log();
    console.log(`  ➤ その後の会話:`);
    caseData.afterLogs.forEach((log, i) => {
      console.log(`    ${i + 1}. [ID:${log.selectedId}] "${log.transcript}"`);
    });
    console.log('-'.repeat(80));
  });

  // 統計
  console.log('\n\n統計:');
  console.log(`  ID:35後に1ターン続いた: ${id35ContinuationCases.filter(c => c.afterLogs.length === 1).length}件`);
  console.log(`  ID:35後に2ターン続いた: ${id35ContinuationCases.filter(c => c.afterLogs.length === 2).length}件`);
  console.log(`  ID:35後に3ターン以上続いた: ${id35ContinuationCases.filter(c => c.afterLogs.length >= 3).length}件`);
}

// 逆に、ID:35が会話の最後になっているケースを数える
let id35EndCases = 0;
Object.entries(conversations).forEach(([contactId, logs]) => {
  if (logs[logs.length - 1].selectedId === '35') {
    id35EndCases++;
  }
});

console.log();
console.log('='.repeat(80));
console.log(`参考: ID:35で会話が終了しているケース: ${id35EndCases}件`);
console.log('='.repeat(80));
