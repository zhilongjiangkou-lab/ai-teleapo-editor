// 早期離脱分析関数

export const analyzeEarlyExit = (logs, conversationAnalysis) => {
  if (!conversationAnalysis?.available) {
    return { available: false };
  }

  const { conversationList, oneTurnConversations } = conversationAnalysis;

  // 1ターン離脱の詳細
  const oneTurnDetails = oneTurnConversations.map(conv => {
    const log = conv.logs[0];
    return {
      contactId: conv.contactId,
      transcript: log.transcript_text || '(空文字列)',
      selectedId: log.selectedId,
      timestamp: log['@timestamp']
    };
  });

  // 2ターン離脱の詳細
  const twoTurnConversations = conversationList.filter(c => c.turnCount === 2);
  const twoTurnDetails = twoTurnConversations.map(conv => {
    const logs = conv.logs;
    return {
      contactId: conv.contactId,
      turn1: {
        transcript: logs[0].transcript_text || '(空文字列)',
        selectedId: logs[0].selectedId
      },
      turn2: {
        transcript: logs[1].transcript_text || '(空文字列)',
        selectedId: logs[1].selectedId
      },
      endPattern: conv.endPattern,
      timestamp: logs[0]['@timestamp']
    };
  });

  // 3ターン離脱
  const threeTurnConversations = conversationList.filter(c => c.turnCount === 3);
  const threeTurnDetails = threeTurnConversations.map(conv => {
    const logs = conv.logs;
    return {
      contactId: conv.contactId,
      turns: logs.map(log => ({
        transcript: log.transcript_text || '(空文字列)',
        selectedId: log.selectedId
      })),
      endPattern: conv.endPattern
    };
  });

  // パターン遷移マトリックス（会話フロー）
  // 経路情報を保持するために、contactIdリストも記録する
  const transitions = {};
  conversationList.forEach(conv => {
    const logs = conv.logs;

    // 初回発話（undefined）から最初のパターンへの遷移を追加
    // 2ターン以上の会話で、最初に見つかったselectedIdへの遷移として記録
    if (logs.length > 1) {
      // 最初に見つかったselectedIdを探す
      let firstPatternId = null;
      let firstPatternLog = null;

      for (let i = 0; i < logs.length; i++) {
        const selectedId = logs[i].selectedId;
        if (selectedId && selectedId !== 'undefined') {
          firstPatternId = selectedId;
          firstPatternLog = logs[i];
          break;
        }
      }

      // 最初のパターンが見つかった場合のみ遷移を記録
      if (firstPatternId) {
        const key = `undefined→${firstPatternId}`;

        if (!transitions[key]) {
          transitions[key] = {
            from: 'undefined',
            to: firstPatternId,
            count: 0,
            contactIds: [],  // 経路追跡用
            examples: []
          };
        }

        transitions[key].count++;
        transitions[key].contactIds.push(conv.contactId);

        if (transitions[key].examples.length < 3) {
          transitions[key].examples.push({
            fromText: '(初回発話)',
            toText: firstPatternLog.transcript_text,
            contactId: conv.contactId
          });
        }
      }
    }

    // ログ間の遷移
    for (let i = 0; i < logs.length - 1; i++) {
      const from = logs[i].selectedId;
      const to = logs[i + 1].selectedId;

      // 両方がundefinedの場合はスキップ（意味のない遷移）
      if (!from && !to) {
        continue;
      }

      const fromId = from || 'undefined';
      const toId = to || 'undefined';
      const key = `${fromId}→${toId}`;

      if (!transitions[key]) {
        transitions[key] = {
          from: fromId,
          to: toId,
          count: 0,
          contactIds: [],  // 経路追跡用
          examples: []
        };
      }

      transitions[key].count++;
      transitions[key].contactIds.push(conv.contactId);

      // サンプルを最大3件保存
      if (transitions[key].examples.length < 3) {
        transitions[key].examples.push({
          fromText: logs[i].transcript_text,
          toText: logs[i + 1].transcript_text,
          contactId: conv.contactId
        });
      }
    }
  });

  // 遷移を配列に変換してカウント順にソート
  const transitionList = Object.values(transitions)
    .sort((a, b) => b.count - a.count);

  // fromごとにグループ化（フロー図用）
  const flowByPattern = {};
  transitionList.forEach(trans => {
    if (!flowByPattern[trans.from]) {
      flowByPattern[trans.from] = {
        total: 0,
        transitions: [],
        endCallCount: 0  // 切電件数
      };
    }
    flowByPattern[trans.from].transitions.push(trans);
  });

  // 切電件数を集計
  conversationList.forEach(conv => {
    const logs = conv.logs;

    // 最後のパターンで切電した件数をカウント
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      const lastPatternId = lastLog.selectedId || 'undefined';

      if (!flowByPattern[lastPatternId]) {
        flowByPattern[lastPatternId] = {
          total: 0,
          transitions: [],
          endCallCount: 0
        };
      }

      // 1ターン会話の場合は初回発話（undefined）の終話としてカウント
      if (logs.length === 1) {
        if (!flowByPattern['undefined']) {
          flowByPattern['undefined'] = {
            total: 0,
            transitions: [],
            endCallCount: 0
          };
        }
        flowByPattern['undefined'].endCallCount++;
      } else {
        // 2ターン以上の会話は、最後のパターンでカウント
        flowByPattern[lastPatternId].endCallCount++;
      }
    }
  });

  // 各パターンのtotalを計算（そのパターンから出る遷移の合計 + 終話件数）
  Object.keys(flowByPattern).forEach(patternId => {
    const data = flowByPattern[patternId];
    const transitionsTotal = data.transitions.reduce((sum, trans) => sum + trans.count, 0);
    data.total = transitionsTotal + data.endCallCount;
  });

  // 初回発話の終話件数を1ターン会話数に修正し、totalを再計算
  if (flowByPattern['undefined']) {
    flowByPattern['undefined'].endCallCount = oneTurnConversations.length;
    const transitionsTotal = flowByPattern['undefined'].transitions.reduce((sum, trans) => sum + trans.count, 0);
    flowByPattern['undefined'].total = transitionsTotal + flowByPattern['undefined'].endCallCount;

    // デバッグ情報
    console.log('=== 初回発話の統計 ===');
    console.log('総通話数:', conversationList.length);
    console.log('初回発話で終話 (修正後):', flowByPattern['undefined'].endCallCount);
    console.log('1ターン会話数:', oneTurnConversations.length);
    console.log('2ターン以上の会話数:', conversationList.length - oneTurnConversations.length);
    console.log('初回発話の遷移先合計:', transitionsTotal);
    console.log('初回発話のtotal (遷移 + 終話):', flowByPattern['undefined'].total);
    console.log('初回発話の遷移先:', flowByPattern['undefined'].transitions.length, '件');

    // 遷移先の上位5件を詳細表示
    const topTransitions = flowByPattern['undefined'].transitions
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    console.log('遷移先トップ5:');
    topTransitions.forEach(t => {
      console.log(`  ${t.from}→${t.to}: ${t.count}件 (contactIds: ${t.contactIds?.length || 0}件)`);
    });
  }

  // ID:6のデバッグ情報
  if (flowByPattern['6']) {
    const id6Data = flowByPattern['6'];
    const id6TransitionsTotal = id6Data.transitions.reduce((sum, trans) => sum + trans.count, 0);
    console.log('\n=== ID:6（担当者不在）の統計 ===');
    console.log('ID:6のtotal:', id6Data.total);
    console.log('ID:6の遷移先合計:', id6TransitionsTotal);
    console.log('ID:6の終話件数:', id6Data.endCallCount);
    console.log('ID:6の遷移先:', id6Data.transitions.length, '件');
    console.log('遷移先トップ3:', id6Data.transitions.slice(0, 3).map(t => `${t.to}: ${t.count}件 (${((t.count / id6Data.total) * 100).toFixed(1)}%)`));
  }


  // 切電直前のログ（endCallタイプのパターンIDで終了）
  const endCallPatternIds = ['35', '8', '24']; // 終話系パターンID
  const beforeDisconnectLogs = [];

  conversationList.forEach(conv => {
    if (endCallPatternIds.includes(conv.endPattern)) {
      const logs = conv.logs;
      if (logs.length >= 2) {
        const lastLog = logs[logs.length - 1];
        const beforeLastLog = logs[logs.length - 2];

        beforeDisconnectLogs.push({
          contactId: conv.contactId,
          beforeDisconnect: {
            transcript: beforeLastLog.transcript_text,
            selectedId: beforeLastLog.selectedId
          },
          disconnectLog: {
            transcript: lastLog.transcript_text,
            selectedId: lastLog.selectedId
          },
          turnCount: conv.turnCount,
          timestamp: lastLog['@timestamp']
        });
      }
    }
  });

  // ターン数別の統計
  const statsByTurns = {};
  conversationList.forEach(conv => {
    const turnCount = conv.turnCount;
    if (!statsByTurns[turnCount]) {
      statsByTurns[turnCount] = {
        count: 0,
        successCount: 0,
        disconnectCount: 0,
        avgLength: 0,
        totalLength: 0
      };
    }

    statsByTurns[turnCount].count++;

    // 引継ぎ成功（ID:2）
    if (conv.endPattern === '2') {
      statsByTurns[turnCount].successCount++;
    }

    // 切電（endCallパターン）
    if (endCallPatternIds.includes(conv.endPattern)) {
      statsByTurns[turnCount].disconnectCount++;
    }

    // 平均文字数
    const totalLength = conv.logs.reduce((sum, log) =>
      sum + (log.transcript_text ? log.transcript_text.length : 0), 0
    );
    statsByTurns[turnCount].totalLength += totalLength;
  });

  // 平均文字数を計算
  Object.values(statsByTurns).forEach(stat => {
    stat.avgLength = stat.count > 0 ? (stat.totalLength / stat.count).toFixed(1) : 0;
    stat.successRate = stat.count > 0 ? ((stat.successCount / stat.count) * 100).toFixed(1) : 0;
    stat.disconnectRate = stat.count > 0 ? ((stat.disconnectCount / stat.count) * 100).toFixed(1) : 0;
  });

  return {
    available: true,
    oneTurnDetails,
    twoTurnDetails,
    threeTurnDetails,
    transitionList,
    flowByPattern,
    beforeDisconnectLogs,
    statsByTurns
  };
};

// 不適切応答の検出
export const detectInappropriateResponses = (logs, patterns) => {
  // undefined（マッチなし）が続く場合
  const inappropriateSequences = [];

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

  Object.entries(conversations).forEach(([contactId, logs]) => {
    const sortedLogs = logs.sort((a, b) =>
      new Date(a['@timestamp']) - new Date(b['@timestamp'])
    );

    for (let i = 1; i < sortedLogs.length; i++) {
      const currentLog = sortedLogs[i];
      const prevLog = sortedLogs[i - 1];

      // 2回連続でundefinedの場合
      if (currentLog.selectedId === 'undefined' && prevLog.selectedId === 'undefined') {
        inappropriateSequences.push({
          contactId,
          turnNumber: i + 1,
          issue: '連続マッチなし',
          transcript: currentLog.transcript_text,
          prevTranscript: prevLog.transcript_text,
          severity: 'high'
        });
      }

      // 特定のキーワードを含むのにマッチしていない
      const text = currentLog.transcript_text?.toLowerCase() || '';

      // 肯定的な応答なのにマッチしていない
      if (currentLog.selectedId === 'undefined' &&
          (text.includes('はい') || text.includes('お願い') || text.includes('いいです'))) {
        inappropriateSequences.push({
          contactId,
          turnNumber: i + 1,
          issue: '肯定応答が未マッチ',
          transcript: currentLog.transcript_text,
          severity: 'medium'
        });
      }

      // 質問しているのにマッチしていない
      if (currentLog.selectedId === 'undefined' &&
          (text.includes('?') || text.includes('？') || text.includes('ですか'))) {
        inappropriateSequences.push({
          contactId,
          turnNumber: i + 1,
          issue: '質問が未マッチ',
          transcript: currentLog.transcript_text,
          severity: 'medium'
        });
      }
    }
  });

  return inappropriateSequences;
};
