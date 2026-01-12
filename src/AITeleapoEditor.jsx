import React, { useState, useEffect, useMemo } from 'react';
import { analyzeConversations } from './conversationAnalysis';

// サンプルパターンデータ（初期テンプレート）
const TEMPLATE_PATTERNS = [
  {
    id: 1,
    japanese_reply: "導入及び在席確認",
    english_translation: "Introduction and attendance confirmation",
    basis_of_decision: [
      "企業の受付担当者が会社名を名乗り、電話を受けた最初の挨拶・応答を行った場合",
      "「お電話ありがとうございます」「お世話になっております」等の標準的なビジネス電話の導入挨拶が行われた場合"
    ],
    patterns: [
      ".*(おせわ|お世話|せわ).*(なっております|なております|になっております).*",
      ".*(お電話|おでんわ|電話|でんわ).*(ありがとうございます|ありがとうござい).*"
    ],
    audio_path_female: "female/osewani_narimasu.wav",
    audio_path_male: "male/osewani_narimasu.wav",
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  },
  {
    id: 2,
    japanese_reply: "担当者引継ぎ",
    english_translation: "Telephone transfer to the person in charge",
    type: "transferCall",
    basis_of_decision: [
      "受付担当者が営業電話について適切な担当者への電話転送・引継ぎの意思を明確に表明した場合"
    ],
    patterns: [
      "責任者に代わります",
      "お繋ぎいたします",
      ".*(責任者|管理者).*(かわ|代わ|替わ|変わ).*"
    ],
    audio_path_female: "female/arigato.wav",
    audio_path_male: "male/arigato.wav",
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
];

// アイコンコンポーネント
const Icons = {
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Play: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  PhoneOff: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

// タイプに応じたバッジカラー
const getTypeBadge = (type) => {
  switch (type) {
    case 'transferCall':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: '引継ぎ' };
    case 'endCall':
      return { bg: 'bg-rose-500/20', text: 'text-rose-300', label: '終了' };
    default:
      return { bg: 'bg-sky-500/20', text: 'text-sky-300', label: '応答' };
  }
};

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

// 頻出ワード分析関数
const analyzeFrequentWords = (logs) => {
  const wordCount = {};
  const stopWords = ['は', 'が', 'の', 'を', 'に', 'で', 'と', 'も', 'や', 'です', 'ます', 'した', 'して', 'する', 'ある', 'いる', 'この', 'その', 'あの', 'これ', 'それ', 'あれ', 'こと', 'もの', 'ため', 'よう', 'など', 'から', 'まで', 'より', 'ほど', 'だけ', 'しか', 'でも', 'けど', 'ので', 'のに', 'ば', 'たら', 'なら', 'って', 'という', 'といった', 'における', 'において', 'に対して', 'について', 'によって', 'として', 'という', 'といった', 'ください', 'ございます', 'おります', 'いたします', 'お願い', 'はい', 'ええ', 'うん', 'あの', 'えーと', 'まあ', 'ちょっと'];
  
  logs.forEach(log => {
    const text = log.transcript_text || '';
    // 簡易的な形態素解析（2-6文字の連続したひらがな・カタカナ・漢字を抽出）
    const words = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,8}/g) || [];
    words.forEach(word => {
      if (!stopWords.includes(word) && word.length >= 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }));
};

// メインアプリ
export default function AITeleapoEditor() {
  // 状態管理
  const [customers, setCustomers] = useState({});
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [editingPattern, setEditingPattern] = useState(null);
  const [testText, setTestText] = useState('');
  const [activeTab, setActiveTab] = useState('patterns');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [showNewCustomerInput, setShowNewCustomerInput] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // ログ分析用状態
  const [logs, setLogs] = useState([]);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [selectedLogFilter, setSelectedLogFilter] = useState('endCall'); // 'all', 'endCall', 'id35'
  const [selectedLog, setSelectedLog] = useState(null);

  // 通知表示
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem('ai-teleapo-customers');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomers(parsed);
      const keys = Object.keys(parsed);
      if (keys.length > 0) {
        setSelectedCustomerId(keys[0]);
      }
    }
    
    const savedLogs = localStorage.getItem('ai-teleapo-logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    if (Object.keys(customers).length > 0) {
      localStorage.setItem('ai-teleapo-customers', JSON.stringify(customers));
    }
  }, [customers]);
  
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem('ai-teleapo-logs', JSON.stringify(logs));
    }
  }, [logs]);

  // 選択中の顧客データ
  const currentCustomer = selectedCustomerId ? customers[selectedCustomerId] : null;
  const patterns = currentCustomer?.patterns || [];

  // フィルタリングされたパターン
  const filteredPatterns = useMemo(() => {
    if (!searchQuery) return patterns;
    const q = searchQuery.toLowerCase();
    return patterns.filter(p => 
      p.japanese_reply.toLowerCase().includes(q) ||
      p.patterns.some(pat => pat.toLowerCase().includes(q))
    );
  }, [patterns, searchQuery]);
  
  // ログ分析（修正版）
  const logAnalysis = useMemo(() => {
    const total = logs.length;
    
    // undefinedは最初の発話（仕様通り）
    const firstUtteranceLogs = logs.filter(l => l.selectedId === 'undefined' || !l.selectedId);
    
    // 2回目以降の発話（パターンマッチング対象）
    const matchedLogs = logs.filter(l => l.selectedId && l.selectedId !== 'undefined');
    
    // endCallタイプのパターンにマッチしたログ（誤終話リスク）
    // ID:35は「判別不能」でendCall
    const endCallPatternIds = ['35']; // endCallのパターンID（必要に応じて追加）
    const endCallLogs = matchedLogs.filter(l => endCallPatternIds.includes(l.selectedId));
    
    // ID:35にマッチしたログ
    const id35Logs = matchedLogs.filter(l => l.selectedId === '35');
    
    // パターン別カウント
    const patternCounts = {};
    matchedLogs.forEach(log => {
      const id = log.selectedId;
      patternCounts[id] = (patternCounts[id] || 0) + 1;
    });
    
    // 頻出ワード分析（ID:35のログ対象）
    const frequentWords = analyzeFrequentWords(id35Logs);

    // 会話ターン数分析
    const conversationAnalysis = analyzeConversations(logs);

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
      conversationAnalysis
    };
  }, [logs]);
  
  // フィルタリングされたログ
  const filteredLogs = useMemo(() => {
    let result = [];
    
    switch (selectedLogFilter) {
      case 'endCall':
        result = logAnalysis.endCallLogs;
        break;
      case 'id35':
        result = logAnalysis.id35Logs;
        break;
      case 'first':
        result = logAnalysis.firstUtteranceLogs;
        break;
      default:
        result = logs;
    }
    
    if (logSearchQuery) {
      const q = logSearchQuery.toLowerCase();
      result = result.filter(l => 
        (l.transcript_text || '').toLowerCase().includes(q)
      );
    }
    return result.slice(0, 100); // 最大100件表示
  }, [logs, logAnalysis, logSearchQuery, selectedLogFilter]);

  // 顧客追加
  const addCustomer = () => {
    if (!newCustomerName.trim()) return;
    const id = `prod-${newCustomerName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    setCustomers(prev => ({
      ...prev,
      [id]: {
        name: newCustomerName,
        tenantId: id,
        patterns: [...TEMPLATE_PATTERNS],
        createdAt: new Date().toISOString()
      }
    }));
    setSelectedCustomerId(id);
    setNewCustomerName('');
    setShowNewCustomerInput(false);
    showNotification(`顧客「${newCustomerName}」を追加しました`);
  };

  // 顧客削除
  const deleteCustomer = (id) => {
    if (!confirm('この顧客を削除しますか？')) return;
    const newCustomers = { ...customers };
    delete newCustomers[id];
    setCustomers(newCustomers);
    if (selectedCustomerId === id) {
      const keys = Object.keys(newCustomers);
      setSelectedCustomerId(keys.length > 0 ? keys[0] : null);
    }
    showNotification('顧客を削除しました');
  };

  // パターン追加
  const addPattern = (initialText = '') => {
    if (!selectedCustomerId) return;
    const newId = Math.max(0, ...patterns.map(p => p.id)) + 1;
    const newPattern = {
      id: newId,
      japanese_reply: "新規パターン",
      english_translation: "New pattern",
      basis_of_decision: ["判定基準を入力してください"],
      patterns: initialText ? [`.*${initialText}.*`] : [".*パターン.*"],
      audio_path_female: "female/new.wav",
      audio_path_male: "male/new.wav",
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    setCustomers(prev => ({
      ...prev,
      [selectedCustomerId]: {
        ...prev[selectedCustomerId],
        patterns: [...prev[selectedCustomerId].patterns, newPattern]
      }
    }));
    setEditingPattern(newPattern);
    showNotification('新規パターンを追加しました');
  };

  // パターン保存
  const savePattern = (updatedPattern) => {
    setCustomers(prev => ({
      ...prev,
      [selectedCustomerId]: {
        ...prev[selectedCustomerId],
        patterns: prev[selectedCustomerId].patterns.map(p =>
          p.id === updatedPattern.id ? updatedPattern : p
        )
      }
    }));
    setEditingPattern(null);
    showNotification('パターンを保存しました');
  };

  // パターン削除
  const deletePattern = (id) => {
    if (!confirm('このパターンを削除しますか？')) return;
    setCustomers(prev => ({
      ...prev,
      [selectedCustomerId]: {
        ...prev[selectedCustomerId],
        patterns: prev[selectedCustomerId].patterns.filter(p => p.id !== id)
      }
    }));
    showNotification('パターンを削除しました');
  };

  // パターン複製
  const duplicatePattern = (pattern) => {
    const newId = Math.max(0, ...patterns.map(p => p.id)) + 1;
    const newPattern = {
      ...pattern,
      id: newId,
      japanese_reply: `${pattern.japanese_reply} (コピー)`,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    setCustomers(prev => ({
      ...prev,
      [selectedCustomerId]: {
        ...prev[selectedCustomerId],
        patterns: [...prev[selectedCustomerId].patterns, newPattern]
      }
    }));
    showNotification('パターンを複製しました');
  };

  // JSONエクスポート
  const exportJSON = () => {
    if (!currentCustomer) return;
    const data = JSON.stringify(currentCustomer.patterns, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_${currentCustomer.tenantId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('JSONをエクスポートしました');
  };

  // JSONインポート
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCustomerId) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          setCustomers(prev => ({
            ...prev,
            [selectedCustomerId]: {
              ...prev[selectedCustomerId],
              patterns: imported
            }
          }));
          showNotification(`${imported.length}件のパターンをインポートしました`);
        }
      } catch (err) {
        showNotification('JSONの読み込みに失敗しました', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  
  // ログインポート（CSV）
  const importLogs = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = parseCSV(event.target.result);
        setLogs(data);
        showNotification(`${data.length}件のログをインポートしました`);
      } catch (err) {
        showNotification('ログの読み込みに失敗しました', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // マッチングテスト
  const testMatching = (text) => {
    const results = [];
    for (const pattern of patterns) {
      for (const regex of pattern.patterns) {
        try {
          const re = new RegExp(regex, 'i');
          if (re.test(text)) {
            results.push({
              pattern,
              matchedRegex: regex
            });
            break;
          }
        } catch (e) {
          // 無効な正規表現はスキップ
        }
      }
    }
    return results;
  };

  const matchResults = testText ? testMatching(testText) : [];
  
  // ログからパターン作成
  const createPatternFromLog = (logText) => {
    // キーワードを抽出
    const keywords = logText.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,6}/g) || [];
    const uniqueKeywords = [...new Set(keywords)].slice(0, 3);
    const regexPattern = uniqueKeywords.length > 0 
      ? `.*(${ uniqueKeywords.join('|') }).*`
      : `.*${logText.slice(0, 10)}.*`;
    
    addPattern(regexPattern.replace(/\.\*\(\.\*\)\.\*/, ''));
    setActiveTab('patterns');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Noto Sans JP', 'SF Pro Display', sans-serif" }}>
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Icons.Phone />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  AIテレアポ パターンエディタ
                </h1>
                <p className="text-xs text-slate-500">data.json Visual Editor v3.0</p>
              </div>
            </div>
            
            {currentCustomer && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors border border-slate-600/50">
                  <Icons.Upload />
                  <span className="text-sm">インポート</span>
                  <input type="file" accept=".json" onChange={importJSON} className="hidden" />
                </label>
                <button
                  onClick={exportJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Icons.Download />
                  <span className="text-sm font-medium">エクスポート</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 通知 */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-xl animate-pulse ${
          notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* サイドバー - 顧客一覧 */}
          <aside className="w-72 flex-shrink-0">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-300 flex items-center gap-2">
                    <Icons.Building />
                    顧客一覧
                  </h2>
                  <button
                    onClick={() => setShowNewCustomerInput(true)}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-cyan-400"
                  >
                    <Icons.Plus />
                  </button>
                </div>
                
                {showNewCustomerInput && (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="顧客名を入力"
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
                      onKeyDown={(e) => e.key === 'Enter' && addCustomer()}
                      autoFocus
                    />
                    <button onClick={addCustomer} className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg">
                      <Icons.Check />
                    </button>
                    <button onClick={() => setShowNewCustomerInput(false)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
                      <Icons.X />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-2 max-h-96 overflow-y-auto">
                {Object.entries(customers).length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">顧客がありません</p>
                    <p className="text-xs mt-1">「+」ボタンで追加してください</p>
                  </div>
                ) : (
                  Object.entries(customers).map(([id, customer]) => (
                    <div
                      key={id}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        selectedCustomerId === id
                          ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30'
                          : 'hover:bg-slate-800/50'
                      }`}
                      onClick={() => setSelectedCustomerId(id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{customer.name}</p>
                        <p className="text-xs text-slate-500 truncate">{customer.patterns.length} パターン</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCustomer(id); }}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-600/20 rounded-lg transition-all text-rose-400"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* ログ分析サマリー（修正版） */}
            {logs.length > 0 && (
              <div className="mt-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4">
                <h3 className="font-semibold text-slate-300 flex items-center gap-2 mb-3">
                  <Icons.Chart />
                  ログ分析
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">総ログ数</span>
                    <span className="font-medium">{logAnalysis.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1">
                      最初の発話
                      <span className="text-xs text-slate-500">(仕様通り)</span>
                    </span>
                    <span className="font-medium text-slate-400">{logAnalysis.firstUtteranceCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">2回目以降</span>
                    <span className="font-medium text-emerald-400">{logAnalysis.matchedCount.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-rose-400 flex items-center gap-1">
                        <Icons.AlertTriangle />
                        ID:35（誤終話リスク）
                      </span>
                      <span className="font-bold text-rose-400">{logAnalysis.id35Count}</span>
                    </div>
                    {logAnalysis.id35Count > 0 && (
                      <p className="text-xs text-rose-300/70 mt-1">
                        「はい。」等の相槌が通話終了している可能性
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0">
            {!currentCustomer ? (
              <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icons.Building />
                </div>
                <h3 className="text-xl font-semibold mb-2">顧客を選択してください</h3>
                <p className="text-slate-500 mb-6">左のサイドバーから顧客を選択するか、新規顧客を追加してください</p>
                <button
                  onClick={() => setShowNewCustomerInput(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-medium hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Icons.Plus />
                  新規顧客を追加
                </button>
              </div>
            ) : (
              <>
                {/* タブ */}
                <div className="flex gap-2 mb-6">
                  {[
                    { id: 'patterns', label: 'パターン一覧', icon: Icons.Edit },
                    { id: 'test', label: 'マッチングテスト', icon: Icons.Play },
                    { id: 'logs', label: '誤終話分析', icon: Icons.PhoneOff }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400'
                      }`}
                    >
                      <tab.icon />
                      {tab.label}
                      {tab.id === 'logs' && logAnalysis.id35Count > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-rose-500/30 text-rose-300 text-xs rounded-full">
                          {logAnalysis.id35Count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === 'patterns' && (
                  <>
                    {/* 検索・追加バー */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 relative">
                        <Icons.Search />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="パターンを検索..."
                          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                          style={{ paddingLeft: '3rem' }}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                          <Icons.Search />
                        </div>
                      </div>
                      <button
                        onClick={() => addPattern()}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Icons.Plus />
                        パターン追加
                      </button>
                    </div>

                    {/* パターンカードグリッド */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredPatterns.map(pattern => {
                        const badge = getTypeBadge(pattern.type);
                        const matchCount = logAnalysis.patternCounts[pattern.id] || 0;
                        const isRisky = pattern.id === 35 && matchCount > 0;
                        return (
                          <div
                            key={pattern.id}
                            className={`bg-slate-900/50 rounded-2xl border p-5 hover:border-slate-600 transition-all group ${
                              isRisky ? 'border-rose-500/50' : 'border-slate-700/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-slate-600">#{pattern.id}</span>
                                <div>
                                  <h3 className="font-semibold text-lg">{pattern.japanese_reply}</h3>
                                  <p className="text-xs text-slate-500">{pattern.english_translation}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                  {badge.label}
                                </span>
                                {matchCount > 0 && (
                                  <span className={`text-xs ${isRisky ? 'text-rose-400' : 'text-slate-500'}`}>
                                    {matchCount}件マッチ
                                    {isRisky && ' ⚠️'}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-xs text-slate-500 mb-1">パターン数: {pattern.patterns.length}</p>
                              <div className="flex flex-wrap gap-1">
                                {pattern.patterns.slice(0, 3).map((p, i) => (
                                  <code key={i} className="text-xs px-2 py-1 bg-slate-800 rounded text-cyan-300 truncate max-w-48">
                                    {p.length > 30 ? p.slice(0, 30) + '...' : p}
                                  </code>
                                ))}
                                {pattern.patterns.length > 3 && (
                                  <span className="text-xs text-slate-500 px-2 py-1">
                                    +{pattern.patterns.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingPattern({...pattern})}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                              >
                                <Icons.Edit />
                                編集
                              </button>
                              <button
                                onClick={() => duplicatePattern(pattern)}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                              >
                                <Icons.Copy />
                              </button>
                              <button
                                onClick={() => deletePattern(pattern.id)}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 rounded-lg text-sm transition-colors text-rose-400"
                              >
                                <Icons.Trash />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {activeTab === 'test' && (
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Icons.Play />
                      マッチングテスト
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      テキストを入力すると、どのパターンにマッチするかリアルタイムで確認できます
                    </p>
                    
                    <textarea
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      placeholder="例：はい。"
                      className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-400 mb-3">
                        マッチ結果: {matchResults.length > 0 ? `${matchResults.length}件` : 'なし'}
                      </h4>
                      
                      {matchResults.length === 0 && testText && (
                        <div className="p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-300">
                          <p className="font-medium">マッチするパターンがありません</p>
                          <p className="text-sm text-slate-400/70 mt-1">2回目以降の発話でこの内容が来た場合、undefinedになります</p>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {matchResults.map((result, i) => {
                          const badge = getTypeBadge(result.pattern.type);
                          const isRisky = result.pattern.type === 'endCall';
                          return (
                            <div key={i} className={`p-4 rounded-xl ${
                              isRisky 
                                ? 'bg-rose-500/10 border border-rose-500/30' 
                                : 'bg-emerald-500/10 border border-emerald-500/30'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-semibold ${isRisky ? 'text-rose-300' : 'text-emerald-300'}`}>
                                  #{result.pattern.id} {result.pattern.japanese_reply}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                  {badge.label}
                                </span>
                              </div>
                              {isRisky && (
                                <p className="text-xs text-rose-300 mb-2 flex items-center gap-1">
                                  <Icons.AlertTriangle />
                                  この発話で通話が終了します
                                </p>
                              )}
                              <p className="text-xs text-slate-400">マッチした正規表現:</p>
                              <code className="text-xs text-cyan-300 bg-slate-800 px-2 py-1 rounded mt-1 inline-block break-all">
                                {result.matchedRegex}
                              </code>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'logs' && (
                  <div className="space-y-6">
                    {/* ログインポートエリア */}
                    {logs.length === 0 ? (
                      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 border-dashed p-12 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Icons.FileText />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">ログファイルをインポート</h3>
                        <p className="text-slate-500 mb-6">CloudWatch Logsからエクスポートしたログ（CSV形式）をアップロードしてください</p>
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-medium hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer">
                          <Icons.Upload />
                          CSVをインポート
                          <input type="file" accept=".csv" onChange={importLogs} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <>
                        {/* 分析ダッシュボード（修正版） */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-slate-700/20 to-slate-600/20 rounded-2xl border border-slate-500/30 p-5">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-slate-500/20 rounded-lg">
                                <Icons.Info />
                              </div>
                              <span className="text-slate-400 text-sm">最初の発話</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-300">{logAnalysis.firstUtteranceCount}</p>
                            <p className="text-xs text-slate-500 mt-1">仕様通り（undefinedは正常）</p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-2xl border border-emerald-500/30 p-5">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Icons.Check />
                              </div>
                              <span className="text-slate-400 text-sm">2回目以降（マッチ済）</span>
                            </div>
                            <p className="text-3xl font-bold text-emerald-300">{logAnalysis.matchedCount}</p>
                            <p className="text-xs text-slate-500 mt-1">パターンマッチング対象</p>
                          </div>
                          
                          <div className="bg-gradient-to-br from-rose-600/20 to-orange-600/20 rounded-2xl border border-rose-500/30 p-5">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-rose-500/20 rounded-lg">
                                <Icons.PhoneOff />
                              </div>
                              <span className="text-slate-400 text-sm">ID:35（誤終話リスク）</span>
                            </div>
                            <p className="text-3xl font-bold text-rose-300">{logAnalysis.id35Count}</p>
                            <p className="text-xs text-rose-400 mt-1">要確認：相槌で終話の可能性</p>
                          </div>
                        </div>

                        {/* 会話ターン数分析 */}
                        {logAnalysis.conversationAnalysis?.available && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 p-5">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                  <Icons.Users />
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

                        {/* 説明 */}
                        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                          <h4 className="font-medium text-slate-300 flex items-center gap-2 mb-2">
                            <Icons.Info />
                            誤終話分析について
                          </h4>
                          <p className="text-sm text-slate-400">
                            ID:35（判別不能）は type: endCall のため、マッチすると通話が終了します。
                            「はい。」等の相槌がID:35にマッチしている場合、会話の途中で誤って通話が切れている可能性があります。
                          </p>
                        </div>
                        
                        {/* ID:35の頻出ワード分析 */}
                        {logAnalysis.id35Count > 0 && (
                          <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-5">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <Icons.Zap />
                              ID:35にマッチした発話の頻出ワード
                              <span className="text-xs text-slate-500 font-normal">（誤終話の原因分析）</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {logAnalysis.frequentWords.slice(0, 20).map((item, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setLogSearchQuery(item.word);
                                    setSelectedLogFilter('id35');
                                  }}
                                  className="px-3 py-1.5 bg-rose-900/30 hover:bg-rose-800/40 border border-rose-500/30 rounded-lg text-sm transition-colors flex items-center gap-2"
                                >
                                  <span>{item.word}</span>
                                  <span className="text-xs text-rose-400">{item.count}</span>
                                </button>
                              ))}
                              {logAnalysis.frequentWords.length === 0 && (
                                <p className="text-slate-500 text-sm">頻出ワードなし（短い発話が多い可能性）</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* ログ一覧 */}
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Icons.FileText />
                              ログ一覧
                            </h3>
                            <div className="flex items-center gap-3">
                              <select
                                value={selectedLogFilter}
                                onChange={(e) => setSelectedLogFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
                              >
                                <option value="id35">ID:35のみ（誤終話リスク）</option>
                                <option value="endCall">終話系すべて</option>
                                <option value="first">最初の発話（参考）</option>
                                <option value="all">すべて</option>
                              </select>
                              <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors text-sm">
                                <Icons.Upload />
                                <span>別のCSVを読込</span>
                                <input type="file" accept=".csv" onChange={importLogs} className="hidden" />
                              </label>
                            </div>
                          </div>
                          
                          <div className="relative mb-4">
                            <input
                              type="text"
                              value={logSearchQuery}
                              onChange={(e) => setLogSearchQuery(e.target.value)}
                              placeholder="ログを検索..."
                              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                              <Icons.Search />
                            </div>
                          </div>
                          
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredLogs.length === 0 ? (
                              <div className="text-center py-8 text-slate-500">
                                <p>該当するログがありません</p>
                              </div>
                            ) : (
                              filteredLogs.map((log, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${
                                    log.selectedId === '35' 
                                      ? 'bg-rose-900/20 hover:bg-rose-900/30 border border-rose-500/20' 
                                      : 'bg-slate-800/50 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{log.transcript_text || '(空)'}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      {log['@timestamp'] ? new Date(log['@timestamp']).toLocaleString('ja-JP') : ''}
                                      {log.selectedId && (
                                        <span className={`ml-2 ${
                                          log.selectedId === 'undefined' ? 'text-slate-400' :
                                          log.selectedId === '35' ? 'text-rose-400' : 'text-emerald-400'
                                        }`}>
                                          → ID:{log.selectedId}
                                          {log.selectedId === '35' && ' (終話)'}
                                          {log.selectedId === 'undefined' && ' (最初の発話)'}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  {log.selectedId === '35' && (
                                    <button
                                      onClick={() => createPatternFromLog(log.transcript_text || '')}
                                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-medium transition-all"
                                    >
                                      <Icons.Plus />
                                      別パターン作成
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                          
                          {filteredLogs.length >= 100 && (
                            <p className="text-center text-xs text-slate-500 mt-4">
                              最初の100件を表示しています
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* 編集モーダル */}
      {editingPattern && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                パターン編集 #{editingPattern.id}
              </h3>
              <button
                onClick={() => setEditingPattern(null)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Icons.X />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">日本語名</label>
                  <input
                    type="text"
                    value={editingPattern.japanese_reply}
                    onChange={(e) => setEditingPattern({...editingPattern, japanese_reply: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">English Name</label>
                  <input
                    type="text"
                    value={editingPattern.english_translation}
                    onChange={(e) => setEditingPattern({...editingPattern, english_translation: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              
              {/* タイプ */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">タイプ</label>
                <select
                  value={editingPattern.type || ''}
                  onChange={(e) => setEditingPattern({...editingPattern, type: e.target.value || undefined})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="">通常応答</option>
                  <option value="transferCall">引継ぎ (transferCall)</option>
                  <option value="endCall">終了 (endCall)</option>
                </select>
              </div>
              
              {/* 判定基準 */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  判定基準 (basis_of_decision)
                </label>
                {editingPattern.basis_of_decision?.map((basis, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={basis}
                      onChange={(e) => {
                        const newBasis = [...editingPattern.basis_of_decision];
                        newBasis[i] = e.target.value;
                        setEditingPattern({...editingPattern, basis_of_decision: newBasis});
                      }}
                      className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                    />
                    <button
                      onClick={() => {
                        const newBasis = editingPattern.basis_of_decision.filter((_, j) => j !== i);
                        setEditingPattern({...editingPattern, basis_of_decision: newBasis});
                      }}
                      className="p-2 bg-rose-600/20 hover:bg-rose-600/30 rounded-lg text-rose-400"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setEditingPattern({
                    ...editingPattern,
                    basis_of_decision: [...(editingPattern.basis_of_decision || []), '']
                  })}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  + 判定基準を追加
                </button>
              </div>
              
              {/* パターン（正規表現） */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  パターン (正規表現)
                </label>
                {editingPattern.patterns?.map((pattern, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => {
                        const newPatterns = [...editingPattern.patterns];
                        newPatterns[i] = e.target.value;
                        setEditingPattern({...editingPattern, patterns: newPatterns});
                      }}
                      className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 text-sm font-mono"
                    />
                    <button
                      onClick={() => {
                        const newPatterns = editingPattern.patterns.filter((_, j) => j !== i);
                        setEditingPattern({...editingPattern, patterns: newPatterns});
                      }}
                      className="p-2 bg-rose-600/20 hover:bg-rose-600/30 rounded-lg text-rose-400"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setEditingPattern({
                    ...editingPattern,
                    patterns: [...(editingPattern.patterns || []), '']
                  })}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  + パターンを追加
                </button>
              </div>
              
              {/* 音声ファイル */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">音声ファイル (女性)</label>
                  <input
                    type="text"
                    value={editingPattern.audio_path_female}
                    onChange={(e) => setEditingPattern({...editingPattern, audio_path_female: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">音声ファイル (男性)</label>
                  <input
                    type="text"
                    value={editingPattern.audio_path_male}
                    onChange={(e) => setEditingPattern({...editingPattern, audio_path_male: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setEditingPattern(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => savePattern(editingPattern)}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
