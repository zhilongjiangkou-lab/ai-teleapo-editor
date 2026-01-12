// CSVパース関数（改善版：複雑な改行・BOM対応）
export const parseCSV = (text) => {
  // BOM（Byte Order Mark）を除去
  text = text.replace(/^\uFEFF/, '');

  // RFC 4180準拠のCSVパース
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // エスケープされたダブルクォート
        currentField += '"';
        i++;
      } else if (char === '"') {
        // クォート終了
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        // クォート開始
        inQuotes = true;
      } else if (char === ',') {
        // フィールド区切り
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        // 行区切り
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
        }
        // \r\n の場合は\nをスキップ
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        currentField += char;
      }
    }
  }

  // 最後のフィールド・行を追加
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  // ヘッダーとデータに分離
  const headers = rows[0];
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = {};
    headers.forEach((header, j) => {
      row[header] = rows[i][j] || '';
    });

    // transcript_textが空の行はスキップ
    if (row.transcript_text && row.transcript_text.trim() !== '') {
      data.push(row);
    }
  }

  return data;
};
