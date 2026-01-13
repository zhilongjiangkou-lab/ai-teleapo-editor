const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/AITeleapoEditor.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// patternsをConversationFlowChartに渡す
const oldLine = `                        <ConversationFlowChart
                          flowByPattern={logAnalysis.earlyExitAnalysis.flowByPattern}
                          Icons={Icons}
                        />`;

const newLine = `                        <ConversationFlowChart
                          flowByPattern={logAnalysis.earlyExitAnalysis.flowByPattern}
                          patterns={patterns}
                          Icons={Icons}
                        />`;

content = content.replace(oldLine, newLine);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ patternsプロパティを追加しました');
