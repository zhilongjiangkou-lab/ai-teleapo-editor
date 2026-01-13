import React, { useState, useMemo } from 'react';

// ツリー型会話フロー図コンポーネント
export const ConversationTreeFlow = ({ flowByPattern, patterns, Icons }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['undefined']));

  // パターンデータからendCallタイプのIDを動的に取得
  const endCallPatterns = useMemo(() => {
    const result = patterns
      ?.filter(p => p.type === 'endCall')
      .map(p => String(p.id)) || [];
    return result;
  }, [patterns]);

  // パターンIDから日本語名を取得する関数
  const getPatternLabel = (id) => {
    if (id === 'undefined') {
      return '初回発話';
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
    const idStr = String(id);
    const result = endCallPatterns.includes(idStr);
    return result;
  };

  // ノードの展開/折りたたみ
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // 再帰的にツリーをレンダリング
  // contactIdsInPath: この経路を通った会話のcontactIdリスト
  const renderNode = (nodeId, depth = 0, parentTotal = 0, transitionCount = 0, contactIdsInPath = null, visited = new Set()) => {
    // 無限ループ防止: 訪問済みチェック
    if (visited.has(nodeId)) {
      return null;
    }

    // 深さ制限（最大10レベル）
    if (depth > 10) {
      return null;
    }

    const data = flowByPattern[nodeId];
    if (!data) {
      return null;
    }

    // 現在のノードを訪問済みに追加
    const newVisited = new Set(visited);
    newVisited.add(nodeId);

    const isExpanded = expandedNodes.has(nodeId);
    const isEndCall = isEndCallPattern(nodeId);
    const displayLabel = getPatternLabel(nodeId);

    // 経路フィルタリング: contactIdsInPathが指定されている場合、
    // この経路を通った会話のみに基づいて子ノードをフィルタリング
    let filteredTransitions = data.transitions || [];
    // depth=0（初回発話）の場合はdata.totalを使用
    // depth>=1の場合、経路フィルタがある場合はtransitionCountを使用（親からこのノードへの遷移数）
    // 経路フィルタがない場合（初回発話の直下）もtransitionCountを使用
    let currentTotal;
    if (depth === 0) {
      currentTotal = data.total;
    } else if (transitionCount > 0) {
      // 親から渡されたtransitionCount（この経路を通った会話数）を使用
      currentTotal = transitionCount;
    } else {
      currentTotal = data.total;
    }
    let filteredEndCallCount = data.endCallCount || 0;

    if (contactIdsInPath && contactIdsInPath.length > 0) {
      const contactIdSet = new Set(contactIdsInPath);

      // 遷移をフィルタリング（この経路のcontactIdのみ）
      filteredTransitions = data.transitions.map(trans => {
        if (!trans.contactIds) return { ...trans, count: trans.count };

        const filteredContactIds = trans.contactIds.filter(id => contactIdSet.has(id));
        return {
          ...trans,
          count: filteredContactIds.length,
          contactIds: filteredContactIds
        };
      }).filter(trans => trans.count > 0);

      // 終話件数を経路に基づいて計算
      // currentTotal（親から渡された件数） - 遷移の合計 = この経路での終話件数
      const transitionsSum = filteredTransitions.reduce((sum, t) => sum + t.count, 0);
      filteredEndCallCount = currentTotal - transitionsSum;

      // 負の値になる場合は0にする（データ不整合の場合）
      if (filteredEndCallCount < 0) {
        filteredEndCallCount = 0;
      }
    }

    // 終話系パターンは子ノードを持たない
    const hasChildren = !isEndCall && filteredTransitions.length > 0;

    // 親ノードからの割合を計算（この遷移が親の全体の何%か）
    const percentageFromParent = parentTotal > 0 && transitionCount > 0
      ? ((transitionCount / parentTotal) * 100).toFixed(1)
      : null;

    // デバッグログ（ID:1の場合のみ）
    if (nodeId === '1' && depth === 2) {
      console.log('=== ID:1 (depth=2) のレンダリング ===');
      console.log('nodeId:', nodeId);
      console.log('depth:', depth);
      console.log('parentTotal:', parentTotal);
      console.log('transitionCount:', transitionCount);
      console.log('contactIdsInPath:', contactIdsInPath ? contactIdsInPath.length : 'null');
      console.log('filteredTransitions:', filteredTransitions.length);
      console.log('currentTotal:', currentTotal);
      console.log('percentageFromParent:', percentageFromParent);
      console.log('data.total:', data.total);
    }

    // 終話件数と率を計算（このパターンが会話の最後になった回数）
    const endCallCount = filteredEndCallCount;
    const endCallRate = currentTotal > 0
      ? ((endCallCount / currentTotal) * 100).toFixed(1)
      : '0.0';

    // 終話がある場合、または子ノードがある場合に展開可能
    const canExpand = hasChildren || (!isEndCall && endCallCount > 0);

    return (
      <div key={nodeId} className="relative">
        {/* ノードボックス */}
        <div
          className={`flex items-center gap-3 mb-2 transition-all ${
            depth > 0 ? 'ml-8' : ''
          }`}
        >
          {/* 展開/折りたたみボタン */}
          {canExpand && (
            <button
              onClick={() => toggleNode(nodeId)}
              className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded transition-colors flex-shrink-0"
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
          {!canExpand && (
            <div className="w-6 h-6 flex-shrink-0"></div>
          )}

          {/* ノードカード */}
          <div
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              isEndCall
                ? 'bg-rose-500/10 border-rose-500/40'
                : depth === 0
                  ? 'bg-cyan-600/20 border-cyan-500/40'
                  : 'bg-slate-700/50 border-slate-600/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`font-semibold ${
                  isEndCall ? 'text-rose-300' : depth === 0 ? 'text-cyan-300' : 'text-slate-200'
                }`}>
                  {displayLabel}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {currentTotal}件
                  {percentageFromParent !== null && ` (${percentageFromParent}%)`}
                </div>
              </div>

              {isEndCall && (
                <div className="flex items-center gap-1 text-rose-400 text-sm">
                  <Icons.PhoneOff />
                  <span className="font-semibold">切電</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 子ノード（遷移先） */}
        {isExpanded && (hasChildren || endCallCount > 0) && (
          <div className="ml-4 border-l-2 border-slate-700/50 pl-4">
            {/* 通常の遷移先 */}
            {hasChildren && filteredTransitions
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)  // 上位8件
              .map((trans) => {
                const childData = flowByPattern[trans.to];
                if (!childData) {
                  // 遷移先のデータがない場合（終話系パターンなど）
                  const isEndCallChild = isEndCallPattern(trans.to);
                  const percentage = ((trans.count / currentTotal) * 100).toFixed(1);

                  return (
                    <div key={trans.to} className="relative mb-2">
                      <div className="flex items-center gap-3 ml-8">
                        <div className="w-6 h-6 flex-shrink-0"></div>
                        <div
                          className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                            isEndCallChild
                              ? 'bg-rose-500/10 border-rose-500/40'
                              : 'bg-slate-700/50 border-slate-600/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className={`font-semibold ${
                                isEndCallChild ? 'text-rose-300' : 'text-slate-200'
                              }`}>
                                {getPatternLabel(trans.to)}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                {trans.count}件 ({percentage}%)
                              </div>
                            </div>
                            {isEndCallChild && (
                              <div className="flex items-center gap-1 text-rose-400 text-sm">
                                <Icons.PhoneOff />
                                <span className="font-semibold">切電</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 再帰的に子ノードをレンダリング（経路のcontactIdsを渡す）
                return renderNode(trans.to, depth + 1, currentTotal, trans.count, trans.contactIds || null, newVisited);
              })}

            {/* 終話ノード */}
            {endCallCount > 0 && (
              <div key={`${nodeId}-endcall`} className="relative mb-2">
                <div className="flex items-center gap-3 ml-8">
                  <div className="w-6 h-6 flex-shrink-0"></div>
                  <div className="flex-1 px-4 py-3 rounded-lg border-2 bg-rose-500/10 border-rose-500/40">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-rose-300">
                          終話（切電）
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {endCallCount}件 ({endCallRate}%)
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-rose-400 text-sm">
                        <Icons.PhoneOff />
                        <span className="font-semibold">切電</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // データが存在しない場合のエラー表示
  if (!flowByPattern || Object.keys(flowByPattern).length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        会話フローデータがありません
      </div>
    );
  }

  // undefinedノードが存在しない場合のエラー表示
  if (!flowByPattern['undefined']) {
    return (
      <div className="text-center text-slate-400 py-8">
        初回発話データが見つかりません
        <pre className="text-xs mt-2">{JSON.stringify(Object.keys(flowByPattern).slice(0, 5), null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-400 mb-4">
        ノードをクリックして展開/折りたたみできます
      </div>

      {/* ルートノード（初回発話）から開始 */}
      {renderNode('undefined', 0, 0, 0, null)}

      {/* 凡例 */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mt-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">📖 凡例</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-600/20 border-2 border-cyan-500/40 rounded"></div>
            <span className="text-slate-400">初回発話（ルート）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700/50 border-2 border-slate-600/50 rounded"></div>
            <span className="text-slate-400">会話が継続（次の応答へ）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-500/10 border-2 border-rose-500/40 rounded"></div>
            <span className="text-slate-400">終話系パターン（type: endCall）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">括弧内の%は親ノードからの割合</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationTreeFlow;
