# 会話ターン数分析コードの追加手順

## 追加する場所

`src/AITeleapoEditor.jsx` の267行目の`logAnalysis`関数内に以下のコードを追加します。

## 追加するコード（293行目の後、return文の前に挿入）

```javascript
    // 会話ターン数分析（contactId必須）
    const conversationAnalysis = (() => {
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
        const lastLog = logs.sort((a, b) =>
          new Date(b['@timestamp']) - new Date(a['@timestamp'])
        )[0];
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

      // 引継ぎ成功した会話（transferCallタイプ）
      const successConversations = conversationList.filter(c =>
        c.endPattern === '2' // ID:2が引継ぎパターンと仮定
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
        successConversations,
        id35Conversations
      };
    })();
```

## return文を更新

return文に追加：

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
      conversationAnalysis  // ← 追加
    };
```

## 次のステップ

コードを追加したら、次はダッシュボードUIに統計を表示するコードを追加します。
