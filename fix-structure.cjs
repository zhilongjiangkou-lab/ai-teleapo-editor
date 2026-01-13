const fs = require('fs');

const filePath = 'C:/Users/zhilo/ai-teleapo-editor/src/AITeleapoEditor.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1195-1196行目の空行を削除して、正しい閉じタグを追加
content = content.replace(
  /                      <\/div>\n                    \n\n          <\/main>/,
  `                      </div>
                  </div>
                )}

              </>
            )}
          </main>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ 構造を修正しました');
