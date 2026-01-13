const fs = require('fs');
const file = 'src/AITeleapoEditor.jsx';
let content = fs.readFileSync(file, 'utf8');

// 条件を一時的に変更
content = content.replace(
  "activeTab === 'exit-analysis' && logAnalysis.earlyExitAnalysis?.available && (",
  "activeTab === 'exit-analysis' && ("
);

// デバッグメッセージを追加
const debugMsg = `
                    {/* デバッグ情報 */}
                    {!logAnalysis.earlyExitAnalysis?.available && (
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-amber-300 mb-2">
                          ⚠️ contactIdが必要です
                        </h3>
                        <p className="text-sm text-slate-300 mb-2">
                          早期離脱分析にはcontactIdカラムを含むCSVが必要です。
                        </p>
                        <p className="text-xs text-slate-400">
                          現在のログ数: {logs.length}件<br/>
                          conversationAnalysis.available: {String(logAnalysis.conversationAnalysis?.available)}<br/>
                          earlyExitAnalysis.available: {String(logAnalysis.earlyExitAnalysis?.available)}
                        </p>
                      </div>
                    )}
`;

content = content.replace(
  '{/* サブタブ */}',
  debugMsg + '\n                    {/* サブタブ */}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✓ デバッグメッセージを追加しました');
