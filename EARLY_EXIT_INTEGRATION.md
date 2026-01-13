# 早期離脱分析機能 統合ガイド

## 概要
会話フロー分析と切電前ログ表示機能を追加します。

## 統合手順

### ステップ1: インポート追加

`src/AITeleapoEditor.jsx` の2行目の後に追加：

```javascript
import { analyzeEarlyExit, detectInappropriateResponses } from './earlyExitAnalysis';
```

### ステップ2: stateの追加

`const [testText, setTestText] = useState('');` の後に追加：

```javascript
const [exitAnalysisTab, setExitAnalysisTab] = useState('flow'); // 'flow', '1turn', '2turn', 'before-disconnect', 'inappropriate'
```

### ステップ3: 早期離脱分析の実行

`logAnalysis` の `useMemo` の中、`conversationAnalysis` の計算の後に追加：

```javascript
    // 早期離脱分析
    const earlyExitAnalysis = analyzeEarlyExit(logs, conversationAnalysis);

    // 不適切応答の検出
    const inappropriateResponses = detectInappropriateResponses(logs, patterns);
```

そして、return文に追加：

```javascript
    return {
      total,
      firstUtteranceCount: firstUtteranceLogs.length,
      matchedCount: matchedLogs.length,
      endCallCount: endCallLogs.length,
      id35Count: id35Logs.length,
      patternCounts,
      frequentWords,
      firstUtteranceLogs,
      matchedLogs,
      endCallLogs,
      id35Logs,
      conversationAnalysis,
      earlyExitAnalysis,      // ← 追加
      inappropriateResponses  // ← 追加
    };
```

### ステップ4: 新しいタブの追加

タブ定義部分（730行目付近）を以下のように拡張：

```javascript
{[
  { id: 'patterns', label: 'パターン一覧', icon: Icons.Edit },
  { id: 'test', label: 'マッチングテスト', icon: Icons.Play },
  { id: 'logs', label: '誤終話分析', icon: Icons.PhoneOff },
  { id: 'exit-analysis', label: '早期離脱分析', icon: Icons.TrendingUp }  // ← 追加
].map(tab => (
```

### ステップ5: UI実装

タブの後、`{activeTab === 'logs' && (` の後に以下を追加：

```javascript
{activeTab === 'exit-analysis' && logAnalysis.earlyExitAnalysis?.available && (
  <div className="space-y-6">
    {/* サブタブ */}
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
            exitAnalysisTab === tab.id
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <tab.icon />
          {tab.label}
        </button>
      ))}
    </div>

    {/* 会話フロー */}
    {exitAnalysisTab === 'flow' && (
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.TrendingUp />
          パターンID遷移フロー
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          顧客の発話に対して、どのパターンIDが選択され、次にどのパターンに遷移しているかを可視化
        </p>

        {/* パターンごとにグループ化 */}
        <div className="space-y-6">
          {Object.entries(logAnalysis.earlyExitAnalysis.flowByPattern).map(([fromPattern, transitions]) => {
            const total = transitions.reduce((sum, t) => sum + t.count, 0);

            return (
              <div key={fromPattern} className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1.5 bg-cyan-600/20 border border-cyan-500/30 rounded-lg">
                    <span className="text-cyan-300 font-semibold">
                      {fromPattern === 'undefined' ? '初回発話' : `ID:${fromPattern}`}
                    </span>
                  </div>
                  <span className="text-slate-400 text-sm">からの遷移 ({total}件)</span>
                </div>

                <div className="space-y-3">
                  {transitions.map((trans, i) => {
                    const percentage = ((trans.count / total) * 100).toFixed(1);
                    const isEndCall = ['35', '8', '24'].includes(trans.to);

                    return (
                      <div key={i} className="flex items-center gap-3">
                        {/* 矢印とバー */}
                        <div className="flex-1 flex items-center gap-2">
                          <Icons.TrendingUp />
                          <div className="flex-1 h-8 bg-slate-700/30 rounded-lg overflow-hidden">
                            <div
                              className={`h-full flex items-center px-3 ${
                                isEndCall ? 'bg-rose-500/30' : 'bg-emerald-500/30'
                              }`}
                              style={{ width: `${percentage}%` }}
                            >
                              <span className={`text-xs font-medium ${
                                isEndCall ? 'text-rose-300' : 'text-emerald-300'
                              }`}>
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 遷移先 */}
                        <div className="w-40">
                          <div className={`px-3 py-1.5 rounded-lg border ${
                            isEndCall
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          }`}>
                            <span className="text-sm font-semibold">
                              {trans.to === 'undefined' ? 'マッチなし' : `ID:${trans.to}`}
                            </span>
                            <span className="text-xs ml-2">({trans.count}件)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* サンプル例 */}
                {transitions[0].examples.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                      サンプル会話を表示
                    </summary>
                    <div className="mt-3 space-y-2">
                      {transitions[0].examples.map((ex, i) => (
                        <div key={i} className="bg-slate-700/20 rounded-lg p-3 text-sm">
                          <p className="text-slate-300">
                            <span className="text-slate-500">顧客:</span> {ex.fromText || '(空文字列)'}
                          </p>
                          <div className="flex items-center gap-2 my-1">
                            <div className="h-px flex-1 bg-slate-600"></div>
                            <Icons.TrendingUp />
                            <div className="h-px flex-1 bg-slate-600"></div>
                          </div>
                          <p className="text-slate-300">
                            <span className="text-slate-500">顧客:</span> {ex.toText || '(空文字列)'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* 1ターン離脱 */}
    {exitAnalysisTab === '1turn' && (
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.AlertCircle />
          1ターン離脱の詳細 ({logAnalysis.earlyExitAnalysis.oneTurnDetails.length}件)
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          最初の発話だけで通話が終了したケース。冒頭トークの改善が必要
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logAnalysis.earlyExitAnalysis.oneTurnDetails.map((detail, i) => (
            <div key={i} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-slate-300 mb-2">
                    {detail.transcript}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">{detail.timestamp}</span>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded">
                      ID:{detail.selectedId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* 2ターン離脱 */}
    {exitAnalysisTab === '2turn' && (
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.AlertTriangle />
          2ターン離脱の詳細 ({logAnalysis.earlyExitAnalysis.twoTurnDetails.length}件)
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          2回の発話で通話が終了したケース。2回目の応答パターンの改善が必要
        </p>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logAnalysis.earlyExitAnalysis.twoTurnDetails.map((detail, i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <div className="space-y-3">
                {/* 1回目 */}
                <div className="flex items-start gap-3">
                  <div className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                    1回目
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300">{detail.turn1.transcript}</p>
                    <span className="text-xs text-slate-500">
                      ID:{detail.turn1.selectedId}
                    </span>
                  </div>
                </div>

                {/* 矢印 */}
                <div className="flex items-center gap-2 pl-12">
                  <div className="h-px flex-1 bg-slate-600"></div>
                  <Icons.TrendingUp />
                  <div className="h-px flex-1 bg-slate-600"></div>
                </div>

                {/* 2回目 */}
                <div className="flex items-start gap-3">
                  <div className="px-2 py-1 bg-rose-500/20 rounded text-xs text-rose-300">
                    2回目
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300">{detail.turn2.transcript}</p>
                    <span className="text-xs text-rose-300">
                      ID:{detail.turn2.selectedId} → 終了
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* 切電直前ログ */}
    {exitAnalysisTab === 'before-disconnect' && (
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.PhoneOff />
          切電直前のログ ({logAnalysis.earlyExitAnalysis.beforeDisconnectLogs.length}件)
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          endCallタイプで終了する直前の顧客発話。どの発話が切電トリガーになっているか確認
        </p>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logAnalysis.earlyExitAnalysis.beforeDisconnectLogs.map((log, i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4 border border-rose-500/30">
              <div className="space-y-3">
                {/* 切電前 */}
                <div>
                  <span className="text-xs text-slate-500">切電前の発話:</span>
                  <p className="text-slate-300 mt-1">
                    {log.beforeDisconnect.transcript}
                  </p>
                  <span className="text-xs text-cyan-400">
                    ID:{log.beforeDisconnect.selectedId}
                  </span>
                </div>

                <div className="h-px bg-rose-500/30"></div>

                {/* 切電時 */}
                <div>
                  <span className="text-xs text-rose-400">切電トリガーの発話:</span>
                  <p className="text-rose-300 mt-1 font-medium">
                    {log.disconnectLog.transcript || '(空文字列)'}
                  </p>
                  <span className="text-xs text-rose-400">
                    ID:{log.disconnectLog.selectedId} (endCall)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span>ターン数: {log.turnCount}</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* 不適切応答 */}
    {exitAnalysisTab === 'inappropriate' && (
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.Zap />
          不適切応答の検出 ({logAnalysis.inappropriateResponses.length}件)
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          文脈は理解できるが、適切なパターンにマッチしていないケース
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logAnalysis.inappropriateResponses.map((resp, i) => {
            const severityColors = {
              high: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
              medium: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
              low: 'bg-slate-500/20 border-slate-500/30 text-slate-300'
            };

            return (
              <div key={i} className={`rounded-lg p-4 border ${severityColors[resp.severity]}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-semibold">{resp.issue}</span>
                  <span className="text-xs px-2 py-0.5 bg-black/20 rounded">
                    重要度: {resp.severity}
                  </span>
                </div>
                <p className="text-sm mb-2">{resp.transcript}</p>
                {resp.prevTranscript && (
                  <p className="text-xs text-slate-400">
                    前の発話: {resp.prevTranscript}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  ターン{resp.turnNumber} | contactId: {resp.contactId.slice(0, 8)}...
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* ターン数別統計 */}
    <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold mb-4">ターン数別の統計</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-2 text-slate-400">ターン数</th>
              <th className="text-right p-2 text-slate-400">会話数</th>
              <th className="text-right p-2 text-slate-400">引継ぎ成功率</th>
              <th className="text-right p-2 text-slate-400">切電率</th>
              <th className="text-right p-2 text-slate-400">平均文字数</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(logAnalysis.earlyExitAnalysis.statsByTurns)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([turns, stats]) => (
                <tr key={turns} className="border-b border-slate-800">
                  <td className="p-2 text-cyan-300">{turns}ターン</td>
                  <td className="p-2 text-right text-slate-300">{stats.count}件</td>
                  <td className="p-2 text-right">
                    <span className={stats.successRate > 20 ? 'text-emerald-300' : 'text-slate-400'}>
                      {stats.successRate}%
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <span className={stats.disconnectRate > 50 ? 'text-rose-300' : 'text-slate-400'}>
                      {stats.disconnectRate}%
                    </span>
                  </td>
                  <td className="p-2 text-right text-slate-400">{stats.avgLength}文字</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
```

## 完成後の確認事項

1. `npm run dev` でローカル起動
2. CSVログをインポート
3. 「早期離脱分析」タブが表示されることを確認
4. 各サブタブ（会話フロー、1ターン離脱、2ターン離脱、切電直前、不適切応答）が動作することを確認

## トラブルシューティング

- **タブが表示されない**: contactIdが含まれるCSVをインポートしているか確認
- **エラーが出る**: ブラウザのコンソール（F12）でエラー内容を確認
- **データが表示されない**: `earlyExitAnalysis.available` が `true` になっているか確認
