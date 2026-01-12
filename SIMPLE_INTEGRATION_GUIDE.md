# 会話ターン数分析 - 簡易統合ガイド

## 作成済みファイル

- `src/conversationAnalysis.js` - 分析関数（作成済み）

## 統合手順（最小限の変更）

### ステップ1: インポート追加

`src/AITeleapoEditor.jsx` の1行目付近に追加：

```javascript
import { analyzeConversations } from './conversationAnalysis';
```

### ステップ2: 分析実行

`logAnalysis`のreturn文の直前（293行目付近）に追加：

```javascript
    // 会話ターン数分析
    const conversationAnalysis = analyzeConversations(logs);
```

そしてreturn文に追加：

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
      conversationAnalysis  // ← これを追加
    };
```

### ステップ3: ダッシュボードに表示（簡易版）

「誤終話分析」タブの分析ダッシュボードセクション（930行目付近）に以下を追加：

```javascript
{/* 会話ターン数分析 */}
{logAnalysis.conversationAnalysis?.available && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Icons.Chart />
        </div>
        <span className="text-slate-400 text-sm">総会話数</span>
      </div>
      <p className="text-3xl font-bold text-purple-300">
        {logAnalysis.conversationAnalysis.totalConversations}
      </p>
      <p className="text-xs text-slate-500 mt-1">ユニークな通話セッション</p>
    </div>

    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl border border-blue-500/30 p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Icons.TrendingUp />
        </div>
        <span className="text-slate-400 text-sm">平均ターン数</span>
      </div>
      <p className="text-3xl font-bold text-blue-300">
        {logAnalysis.conversationAnalysis.avgTurns}
      </p>
      <p className="text-xs text-slate-500 mt-1">
        中央値: {logAnalysis.conversationAnalysis.medianTurns} /
        最大: {logAnalysis.conversationAnalysis.maxTurns}
      </p>
    </div>

    <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-2xl border border-amber-500/30 p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <Icons.AlertCircle />
        </div>
        <span className="text-slate-400 text-sm">初回離脱率</span>
      </div>
      <p className="text-3xl font-bold text-amber-300">
        {((logAnalysis.conversationAnalysis.oneTurnConversations.length /
           logAnalysis.conversationAnalysis.totalConversations) * 100).toFixed(1)}%
      </p>
      <p className="text-xs text-slate-500 mt-1">
        {logAnalysis.conversationAnalysis.oneTurnConversations.length}件が1ターンで終了
      </p>
    </div>
  </div>
)}
```

この3つのカードを追加するだけで、基本的な会話ターン数分析が表示されます。

## テスト

1. contactIdを含むCSV（logs-insights-results (9).csv）をインポート
2. 「誤終話分析」タブを開く
3. 新しい統計カードが表示されるか確認

## もし難しい場合

完全版のファイルを作成しますので、そちらをコピーする方法も可能です。
