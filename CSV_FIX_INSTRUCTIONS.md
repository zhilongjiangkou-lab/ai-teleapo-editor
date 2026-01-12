# CSV パース処理の修正手順

## 概要
CloudWatch Logsからエクスポートされた複雑なCSVファイル（改行を含むデータ）を正しく処理できるようにします。

## 修正手順

### 1. 新しいCSVパーサーファイルは既に作成済み
`src/csvParser.js` が作成されています。

### 2. AITeleapoEditor.jsxを手動で修正

#### 2-1. インポート文を追加

ファイルの先頭（1行目の後）に以下を追加：

```javascript
import { parseCSV } from './csvParser';
```

変更前：
```javascript
import React, { useState, useEffect, useMemo } from 'react';

// サンプルパターンデータ（初期テンプレート）
```

変更後：
```javascript
import React, { useState, useEffect, useMemo } from 'react';
import { parseCSV } from './csvParser';

// サンプルパターンデータ（初期テンプレート）
```

#### 2-2. 古いparseCSV関数を削除

157行目～173行目の以下のコードを**削除**：

```javascript
// CSVパース関数
const parseCSV = (text) => {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const row = {};
    headers.forEach((header, j) => {
      row[header] = values[j] ? values[j].replace(/"/g, '').trim() : '';
    });
    data.push(row);
  }
  return data;
};
```

### 3. 保存して確認

1. ファイルを保存
2. 開発サーバーを再起動（`npm run dev`）
3. ブラウザで http://localhost:5173 にアクセス
4. CSVファイルをインポートして動作確認

## 修正内容の詳細

新しいCSVパーサーの特徴：
- **BOM（Byte Order Mark）の除去** - UTF-8 BOM付きファイルに対応
- **RFC 4180準拠** - CSVの正式な仕様に準拠
- **改行を含むフィールドに対応** - ダブルクォートで囲まれた複数行のデータを正しく処理
- **空行の自動スキップ** - `transcript_text`が空の行を無視

## トラブルシューティング

### エラーが出る場合
- インポート文の構文が正しいか確認
- `csvParser.js`が`src`フォルダに存在するか確認
- 古いparseCSV関数が完全に削除されているか確認

### それでも動かない場合
元のバージョンに戻すには：
```bash
git checkout src/AITeleapoEditor.jsx
rm src/csvParser.js
```
