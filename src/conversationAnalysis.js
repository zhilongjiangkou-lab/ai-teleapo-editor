// 会話ターン数分析関数
export const analyzeConversations = (logs) => {
  if (!logs.length || !logs[0].contactId) {
    return { available: false };
  }

  // contactIdごとにグループ化
  const conversations = {};
  logs.forEach(log => {
    const cid = log.contactId;
    if (!cid) return;
    if (!conversations[cid]) {
      conversations[cid] = [];
    }
    conversations[cid].push(log);
  });

  // 各会話のターン数と終了パターンを集計
  const turnDistribution = {};
  const conversationList = [];

  Object.entries(conversations).forEach(([contactId, logs]) => {
    const turnCount = logs.length;
    const sortedLogs = logs.sort((a, b) =>
      new Date(b['@timestamp']) - new Date(a['@timestamp'])
    );
    const lastLog = sortedLogs[0];
    const endPattern = lastLog.selectedId;

    if (!turnDistribution[turnCount]) {
      turnDistribution[turnCount] = 0;
    }
    turnDistribution[turnCount]++;

    conversationList.push({
      contactId,
      turnCount,
      endPattern,
      logs: logs.sort((a, b) =>
        new Date(a['@timestamp']) - new Date(b['@timestamp'])
      )
    });
  });

  // 統計計算
  const turnCounts = conversationList.map(c => c.turnCount);
  const avgTurns = turnCounts.reduce((a, b) => a + b, 0) / turnCounts.length;
  const sortedTurns = [...turnCounts].sort((a, b) => a - b);
  const medianTurns = sortedTurns[Math.floor(sortedTurns.length / 2)];
  const maxTurns = Math.max(...turnCounts);

  // 1ターンで終了（初回離脱）
  const oneTurnConversations = conversationList.filter(c => c.turnCount === 1);

  // 引継ぎ成功した会話（transferCallタイプ、ID:2と仮定）
  const successConversations = conversationList.filter(c =>
    c.endPattern === '2'
  );

  // ID:35で終了した会話
  const id35Conversations = conversationList.filter(c =>
    c.endPattern === '35'
  );

  return {
    available: true,
    totalConversations: conversationList.length,
    turnDistribution,
    avgTurns: avgTurns.toFixed(1),
    medianTurns,
    maxTurns,
    conversationList,
    oneTurnConversations,
    successConversations,
    id35Conversations
  };
};
