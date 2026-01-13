const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/AITeleapoEditor.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 会話フローセクションを置き換え
const oldFlowSection = `                    {/* 会話フロー */}
                      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Icons.TrendingUp />
                          会話フロー図
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">
                          左から右への流れで、パターンIDがどのように遷移しているかを可視化
                        </p>

                        <ConversationFlowChart
                          flowByPattern={logAnalysis.earlyExitAnalysis.flowByPattern}
                          patterns={patterns}
                          Icons={Icons}
                        />
                      </div>`;

const newFlowSection = `                    {/* 会話フロー */}
                      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Icons.TrendingUp />
                            <h3 className="text-lg font-semibold">会話フロー図</h3>
                          </div>

                          {/* 表示切替ボタン */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFlowViewMode('bar')}
                              className={\`px-4 py-2 rounded-lg text-sm transition-all \${
                                flowViewMode === 'bar'
                                  ? 'bg-cyan-600 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }\`}
                            >
                              バーチャート
                            </button>
                            <button
                              onClick={() => setFlowViewMode('tree')}
                              className={\`px-4 py-2 rounded-lg text-sm transition-all \${
                                flowViewMode === 'tree'
                                  ? 'bg-cyan-600 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }\`}
                            >
                              ツリー図
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-slate-400 mb-6">
                          {flowViewMode === 'bar'
                            ? '左から右への流れで、パターンIDがどのように遷移しているかを可視化'
                            : '階層的なツリー構造で会話の分岐を可視化'}
                        </p>

                        {flowViewMode === 'bar' ? (
                          <ConversationFlowChart
                            flowByPattern={logAnalysis.earlyExitAnalysis.flowByPattern}
                            patterns={patterns}
                            Icons={Icons}
                          />
                        ) : (
                          <ConversationTreeFlow
                            flowByPattern={logAnalysis.earlyExitAnalysis.flowByPattern}
                            patterns={patterns}
                            Icons={Icons}
                          />
                        )}
                      </div>`;

content = content.replace(oldFlowSection, newFlowSection);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ フロー図の表示切替UIを追加しました');
console.log('  - バーチャート/ツリー図の切替ボタン追加');
console.log('  - ConversationTreeFlowコンポーネント統合');
