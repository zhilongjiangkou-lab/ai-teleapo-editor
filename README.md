# AIテレアポ Editor

AI電話営業（テレアポ）の応答パターンを管理・編集するためのツールです。

## 機能

- **応答パターン管理** - 電話応答パターンの作成・編集・削除
- **正規表現パターン** - 日本語テキストマッチング用の正規表現パターン設定
- **JSON インポート/エクスポート** - パターンデータのインポート・エクスポート
- **CSVログ分析** - 通話ログの解析・頻出ワード分析
- **パターンタイプ分類** - 応答/引継ぎ/終了などのタイプ別管理

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
