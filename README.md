# AIテレアポ Editor

AI電話営業（テレアポ）の応答パターンを管理・編集するためのツールです。

## 機能

### 応答パターン管理
- 電話応答パターンの作成・編集・削除
- 正規表現パターンによる日本語テキストマッチング
- JSON形式でのインポート/エクスポート
- パターンタイプ分類（応答/引継ぎ/終了など）

### 通話ログ分析
- **CSVログ分析** - CloudWatch Logsからエクスポートしたログの解析
- **頻出ワード分析** - マッチしなかったテキストから改善ポイントを発見
- **早期離脱分析** - 1〜3ターンで終了した会話の詳細分析
- **会話フロー可視化**
  - バーチャート形式: 各パターンからの遷移を横並びで表示
  - ツリー図形式: 初回発話から切電までの経路を階層的に表示
  - 経路ごとの件数・割合を正確に追跡

## パターンデータ構造

各パターンには以下の情報が含まれます：

- `japanese_reply` - 日本語の応答名
- `english_translation` - 英語翻訳
- `basis_of_decision` - 判定基準の説明
- `patterns` - マッチング用正規表現パターン
- `type` - パターンタイプ（transferCall, endCall など）
- `audio_path_female/male` - 音声ファイルパス

## 技術スタック

- **React** 19.x
- **Vite** 7.x
- **Tailwind CSS** 4.x

## セットアップ

### 必要環境

- Node.js 18.x 以上
- npm

### インストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## ログ分析の使い方

### 1. CloudWatch Logs からログをエクスポート

CloudWatch Logs コンソールで以下のクエリを実行してください：

```
fields @timestamp, contactId, transcript_text, selectedId
| filter @message like /transcript_text/ or @message like /selectedId/
| sort @timestamp asc
```

クエリ結果をCSV形式でエクスポートします。

### 2. ログファイルのアップロード

1. アプリの「ログ分析」タブを開く
2. 「CSVファイルを選択」ボタンからエクスポートしたCSVファイルを選択
3. 自動的に解析が開始されます

### 3. 会話フロー図の見方

#### バーチャート表示
- 各パターンからどのパターンへ遷移したかを横並びで表示
- 件数の多い順に上位を表示

#### ツリー図表示
- 初回発話（ルート）から開始
- 各ノードをクリックして展開/折りたたみ
- 括弧内の%は親ノードからの割合
- 赤色のノードは切電（会話終了）を示す
- **経路追跡**: 例えば「初回発話→ID:6→ID:1」の8件は、その8件だけの次の遷移を表示

## デプロイ

### Vercelへのデプロイ

```bash
# 本番環境へデプロイ
vercel --prod

# プレビューデプロイ
vercel
```

### GitHubへのプッシュ

```bash
git add -A
git commit -m "your message"
git push
```

Vercelと連携している場合、GitHubへのプッシュで自動デプロイされます。
