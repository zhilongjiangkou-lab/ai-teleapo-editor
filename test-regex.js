// 正規表現のテスト

const patterns = [
  {
    id: 1,
    name: "導入及び在席確認",
    regex: ".*(おせわ|お世話|せわ).*(なっております|なております|になっております).*"
  },
  {
    id: 2,
    name: "担当者引継ぎ",
    regex: ".*(責任者|管理者).*(かわ|代わ|替わ|変わ).*"
  }
];

const testCases = [
  "お世話",
  "お世話になっております",
  "お繋ぎいたします",
  "責任者に代わります"
];

console.log("=== 正規表現マッチングテスト ===\n");

testCases.forEach(text => {
  console.log(`入力: "${text}"`);

  patterns.forEach(pattern => {
    try {
      const re = new RegExp(pattern.regex, 'i');
      const matched = re.test(text);
      console.log(`  ${pattern.name}: ${matched ? '✓ マッチ' : '✗ 不一致'}`);
    } catch (e) {
      console.log(`  ${pattern.name}: エラー - ${e.message}`);
    }
  });

  console.log("");
});
