const fs = require('fs');
const path = require('path');

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

// タイムスタンプでソート
Object.keys(conversations).forEach(cid => {
  conversations[cid].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
});

console.log(`総会話数: ${Object.keys(conversations).length}件\n`);

// パターン遷移を集計
const transitions = {};

Object.values(conversations).forEach(conv => {
  for (let i = 0; i < conv.length - 1; i++) {
    const from = conv[i].selectedId || 'undefined';
    const to = conv[i + 1].selectedId || 'undefined';
    const key = `${from}→${to}`;

    if (!transitions[key]) {
      transitions[key] = {
        from,
        to,
        count: 0,
        examples: []
      };
    }

    transitions[key].count++;

    // サンプルを3件まで保存
    if (transitions[key].examples.length < 3) {
      transitions[key].examples.push({
        fromText: conv[i].transcript,
        toText: conv[i + 1].transcript
      });
    }
  }
});

// カウント順にソート
const sortedTransitions = Object.values(transitions)
  .sort((a, b) => b.count - a.count);

// fromパターンごとにグループ化
const flowByPattern = {};
sortedTransitions.forEach(trans => {
  if (!flowByPattern[trans.from]) {
    flowByPattern[trans.from] = {
      total: 0,
      transitions: []
    };
  }
  flowByPattern[trans.from].total += trans.count;
  flowByPattern[trans.from].transitions.push(trans);
});

// 結果を表示
console.log('='.repeat(80));
console.log('会話フロー分析（パターンID遷移）');
console.log('='.repeat(80));
console.log();

Object.entries(flowByPattern)
  .sort(([, a], [, b]) => b.total - a.total)
  .forEach(([fromPattern, data]) => {
    console.log(`\n【${fromPattern === 'undefined' ? '初回発話' : 'ID:' + fromPattern}】からの遷移 (合計: ${data.total}件)`);
    console.log('-'.repeat(80));

    data.transitions.forEach(trans => {
      const percentage = ((trans.count / data.total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 2));
      const isEndCall = ['35', '8', '24'].includes(trans.to);
      const arrow = isEndCall ? ' 🔴' : ' ✅';

      console.log(`  ${trans.from.padEnd(10)} → ${trans.to.padEnd(10)} ${bar} ${percentage}% (${trans.count}件)${arrow}`);

      // サンプル表示
      if (trans.examples.length > 0) {
        const ex = trans.examples[0];
        console.log(`    例: "${ex.fromText?.slice(0, 30) || '(空)'}..." → "${ex.toText?.slice(0, 30) || '(空)'}..."`);
      }
    });
  });

console.log('\n' + '='.repeat(80));
console.log('凡例: ✅ = 継続, 🔴 = 終了系(ID:35, 8, 24)');
console.log('='.repeat(80));
