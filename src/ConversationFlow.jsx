import React from 'react';

// 会話フロー図コンポーネント
export const ConversationFlowChart = ({ flowByPattern, patterns, Icons }) => {
  // パターンデータからendCallタイプのIDを動的に取得
  const endCallPatterns = patterns
    ?.filter(p => p.type === 'endCall')
    .map(p => String(p.id)) || [];

  // パターンIDから日本語名を取得する関数
  const getPatternLabel = (id) => {
    if (id === 'undefined') {
      return '応答なし';
    }
    const pattern = patterns?.find(p => String(p.id) === String(id));
    if (pattern) {
      return `ID:${id} - ${pattern.japanese_reply}`;
    }
    return `ID:${id}`;
  };

  // パターンが終話系かどうかを判定
  const isEndCallPattern = (id) => {
    if (id === 'undefined') return false;
    return endCallPatterns.includes(String(id));
  };

  // 表示する主要なfromパターン（上位5つ）
  // ただし、終話系パターン（endCall）は除外
  const topPatterns = Object.entries(flowByPattern)
    .filter(([fromPattern]) => !isEndCallPattern(fromPattern))
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {topPatterns.map(([fromPattern, data]) => {
        const displayFrom = fromPattern === 'undefined' ? '初回発話' : getPatternLabel(fromPattern);

        return (
          <div key={fromPattern} className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
            {/* ヘッダー */}
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-lg">
                <span className="text-cyan-300 font-bold text-lg">
                  {displayFrom}
                </span>
              </div>
              <Icons.TrendingUp />
              <span className="text-slate-400">からの遷移 ({data.total}件)</span>
            </div>

            {/* 遷移バー */}
            <div className="space-y-3">
              {data.transitions.slice(0, 8).map((trans, i) => {
                const percentage = ((trans.count / data.total) * 100).toFixed(1);
                const isEndCall = isEndCallPattern(trans.to);
                const displayTo = getPatternLabel(trans.to);

                return (
                  <div key={i} className="relative">
                    {/* 遷移フロー */}
                    <div className="flex items-center gap-3">
                      {/* From（左） */}
                      <div className="w-32 flex-shrink-0">
                        <div className="px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50 text-center">
                          <span className="text-slate-300 text-sm font-medium">
                            {displayFrom}
                          </span>
                        </div>
                      </div>

                      {/* 矢印とパーセンテージバー（中央） */}
                      <div className="flex-1 relative">
                        {/* 背景バー */}
                        <div className="h-12 bg-slate-700/30 rounded-lg overflow-hidden relative">
                          {/* パーセンテージバー */}
                          <div
                            className={`h-full flex items-center justify-start px-4 transition-all ${
                              isEndCall
                                ? 'bg-gradient-to-r from-rose-500/40 to-rose-600/40'
                                : 'bg-gradient-to-r from-emerald-500/40 to-emerald-600/40'
                            }`}
                            style={{ width: `${Math.max(percentage, 8)}%` }}
                          >
                            <span className={`text-sm font-bold ${
                              isEndCall ? 'text-rose-200' : 'text-emerald-200'
                            }`}>
                              {percentage}%
                            </span>
                          </div>

                          {/* 矢印装飾 */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className={`w-0 h-0 border-t-4 border-b-4 border-l-8 ${
                              isEndCall
                                ? 'border-l-rose-400 border-t-transparent border-b-transparent'
                                : 'border-l-emerald-400 border-t-transparent border-b-transparent'
                            }`}></div>
                          </div>
                        </div>
                      </div>

                      {/* To（右） */}
                      <div className="w-40 flex-shrink-0">
                        <div className={`px-3 py-2 rounded-lg border text-center ${
                          isEndCall
                            ? 'bg-rose-500/20 border-rose-500/40'
                            : 'bg-emerald-500/20 border-emerald-500/40'
                        }`}>
                          <span className={`text-sm font-bold ${
                            isEndCall ? 'text-rose-300' : 'text-emerald-300'
                          }`}>
                            {displayTo}
                          </span>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {trans.count}件
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* サンプル会話（展開可能） */}
                    {trans.examples.length > 0 && (
                      <details className="mt-2 ml-36">
                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 select-none">
                          サンプル会話を表示 ({trans.examples.length}件)
                        </summary>
                        <div className="mt-2 space-y-2">
                          {trans.examples.map((ex, idx) => (
                            <div key={idx} className="bg-slate-900/50 rounded-lg p-3 text-sm border border-slate-700/30">
                              <div className="flex items-start gap-2">
                                <span className="text-slate-500 text-xs flex-shrink-0">顧客:</span>
                                <span className="text-slate-300 flex-1">
                                  {ex.fromText || '(空文字列)'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 my-1.5 ml-2">
                                <div className="h-px flex-1 bg-slate-700"></div>
                                <span className="text-slate-600 text-xs">→</span>
                                <div className="h-px flex-1 bg-slate-700"></div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-slate-500 text-xs flex-shrink-0">顧客:</span>
                                <span className="text-slate-300 flex-1">
                                  {ex.toText || '(空文字列)'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 統計サマリー */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500/40 rounded"></div>
                  <span className="text-slate-400">
                    継続: {data.transitions.filter(t => !endCallPatterns.includes(t.to)).reduce((sum, t) => sum + t.count, 0)}件
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500/40 rounded"></div>
                  <span className="text-slate-400">
                    終了: {data.transitions.filter(t => endCallPatterns.includes(t.to)).reduce((sum, t) => sum + t.count, 0)}件
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 凡例 */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">📖 凡例</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500/40 rounded"></div>
            <span className="text-slate-400">会話が継続（次の応答へ）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-500/40 rounded"></div>
            <span className="text-slate-400">終話系パターン（type: endCall）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-cyan-600/20 border border-cyan-500/30 rounded text-xs">
              初回発話
            </div>
            <span className="text-slate-400">顧客の最初の発話</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-xs">
              応答なし
            </div>
            <span className="text-slate-400">どのパターンにもマッチしなかった</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationFlowChart;
