const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/AITeleapoEditor.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. サブタブの削除（会話フローのみ残す）
const oldSubTabs = `                    {/* サブタブ */}
                    <div className="flex gap-2">
                      {[
                        { id: 'flow', label: '会話フロー', icon: Icons.TrendingUp },
                        { id: '1turn', label: '1ターン離脱', icon: Icons.AlertCircle },
                        { id: '2turn', label: '2ターン離脱', icon: Icons.AlertTriangle },
                        { id: 'before-disconnect', label: '切電直前ログ', icon: Icons.PhoneOff },
                        { id: 'inappropriate', label: '不適切応答', icon: Icons.Zap }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setExitAnalysisTab(tab.id)}
                          className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all \${
                            exitAnalysisTab === tab.id
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }\`}
                        >
                          <tab.icon />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* 会話フロー */}
                    {exitAnalysisTab === 'flow' && (`;

const newSubTabs = `                    {/* 会話フロー */}
                    {(`;

content = content.replace(oldSubTabs, newSubTabs);

// 2. 会話フローの閉じタグを修正
content = content.replace(
  `                      </div>
                    )}

                    {/* 1ターン離脱 */}`,
  `                      </div>
                    )}
                  </div>
                )}

                {/* ログ分析タブの終了 */}
                {activeTab === 'DUMMY_REMOVED' && (`
);

// 3. exitAnalysisTab stateの初期化を削除（不要になった）
content = content.replace(
  /const \[exitAnalysisTab, setExitAnalysisTab\] = useState\('flow'\);/g,
  '// exitAnalysisTab state removed - no longer needed'
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 不要なサブタブを削除しました');
console.log('  - 1ターン離脱');
console.log('  - 2ターン離脱');
console.log('  - 切電直前ログ');
console.log('  - 不適切応答');
console.log('  - 会話フローのみ残しました');
