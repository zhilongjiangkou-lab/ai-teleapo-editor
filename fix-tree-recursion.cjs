const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/ConversationTreeFlow.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// renderNode関数を修正
const oldRenderNode = `  // 再帰的にツリーをレンダリング
  const renderNode = (nodeId, depth = 0, parentTotal = 0) => {
    const data = flowByPattern[nodeId];
    if (!data) {
      console.log('データが見つかりません:', nodeId);
      return null;
    }`;

const newRenderNode = `  // 再帰的にツリーをレンダリング
  const renderNode = (nodeId, depth = 0, parentTotal = 0, visited = new Set()) => {
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
    newVisited.add(nodeId);`;

content = content.replace(oldRenderNode, newRenderNode);

// 再帰呼び出しにvisitedを渡す（2箇所）
content = content.replace(
  /return renderNode\(trans\.to, depth \+ 1, data\.total\);/g,
  'return renderNode(trans.to, depth + 1, data.total, newVisited);'
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 無限再帰を修正しました');
console.log('  - 訪問済みノード追跡を追加');
console.log('  - 深さ制限（最大10レベル）を追加');
