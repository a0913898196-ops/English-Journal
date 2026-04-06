import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "english-learning-app";

const TABS = ["📚 單字", "💬 句子", "📝 文法", "✅ 打卡", "📊 統計", "🎯 測驗"];

const SAMPLE_WORDS = [
  { id: 1, word: "serendipity", meaning: "意外的好運、緣分", example: "Finding that café was pure serendipity.", level: 3, nextReview: Date.now(), reviewCount: 0, tag: "名詞" },
  { id: 2, word: "ephemeral", meaning: "短暫的、轉瞬即逝的", example: "The beauty of cherry blossoms is ephemeral.", level: 2, nextReview: Date.now(), reviewCount: 1, tag: "形容詞" },
];

const SAMPLE_PHRASES = [
  { id: 1, phrase: "break a leg", meaning: "祝你好運！", example: "Break a leg at your presentation!", tag: "慣用語" },
];

const SAMPLE_GRAMMAR = [
  { id: 1, title: "現在完成式", rule: "have/has + 過去分詞", example: "I have lived here for 5 years.", note: "強調動作對現在的影響" },
];

function getFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
}

function saveToStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

const LEVEL_COLORS = ["#ffd6d6", "#ffecd2", "#fff3cd", "#d4edda", "#cce5ff"];
const LEVEL_LABELS = ["新單字", "熟悉中", "還不錯", "很熟了", "精通！"];

function Badge({ text, color = "#f0f0f0", textColor = "#555" }) {
  return (
    <span style={{
      background: color, color: textColor, borderRadius: 20, padding: "2px 10px",
      fontSize: 11, fontWeight: 700, display: "inline-block"
    }}>{text}</span>
  );
}

function FloatingEmoji({ emojis = ["⭐", "✨", "🌟"], trigger }) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!trigger) return;
    const newP = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 200 - 100,
      y: -(Math.random() * 80 + 40),
      rotate: Math.random() * 360,
    }));
    setParticles(newP);
    setTimeout(() => setParticles([]), 1200);
  }, [trigger]);
  return (
    <div style={{ position: "absolute", top: 0, left: "50%", pointerEvents: "none", zIndex: 999 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", fontSize: 22,
          animation: "floatUp 1.1s ease-out forwards",
          transform: `translateX(${p.x}px)`,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [words, setWords] = useState(() => getFromStorage("words", SAMPLE_WORDS));
  const [phrases, setPhrases] = useState(() => getFromStorage("phrases", SAMPLE_PHRASES));
  const [grammar, setGrammar] = useState(() => getFromStorage("grammar", SAMPLE_GRAMMAR));
  const [checkIns, setCheckIns] = useState(() => getFromStorage("checkins", []));
  const [celebrate, setCelebrate] = useState(0);

  useEffect(() => { saveToStorage("words", words); }, [words]);
  useEffect(() => { saveToStorage("phrases", phrases); }, [phrases]);
  useEffect(() => { saveToStorage("grammar", grammar); }, [grammar]);
  useEffect(() => { saveToStorage("checkins", checkIns); }, [checkIns]);

  const triggerCelebrate = () => setCelebrate(c => c + 1);

  const todayStr = new Date().toISOString().split("T")[0];
  const checkedToday = checkIns.includes(todayStr);
  const streak = (() => {
    let s = 0, d = new Date();
    while (true) {
      const ds = d.toISOString().split("T")[0];
      if (checkIns.includes(ds)) { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  })();

  const dueWords = words.filter(w => w.nextReview <= Date.now());

  return (
    <div style={{
      minHeight: "100vh", fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #fff9f0 0%, #fef0f8 50%, #f0f4ff 100%)",
      paddingBottom: 80,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-90px) scale(0.5)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes wiggle { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card { background:white; border-radius:20px; padding:18px; margin-bottom:14px;
          box-shadow:0 4px 20px rgba(255,150,200,0.12), 0 1px 4px rgba(0,0,0,0.06);
          animation: slideIn 0.3s ease; transition: transform 0.15s, box-shadow 0.15s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,150,200,0.18); }
        .btn { border:none; cursor:pointer; border-radius:14px; font-family:inherit; font-weight:700;
          transition: all 0.15s; }
        .btn:hover { transform: scale(1.05); }
        .btn:active { transform: scale(0.97); }
        .tab-btn { background:transparent; border:none; cursor:pointer; font-family:inherit;
          font-size:13px; font-weight:700; padding:8px 12px; border-radius:12px;
          transition:all 0.2s; white-space:nowrap; }
        input, textarea { font-family:inherit; border:2px solid #f0d9ff; border-radius:12px;
          padding:10px 14px; outline:none; transition:border-color 0.2s; font-size:14px; }
        input:focus, textarea:focus { border-color:#ff9fd3; box-shadow:0 0 0 3px rgba(255,159,211,0.2); }
        select { font-family:inherit; border:2px solid #f0d9ff; border-radius:12px;
          padding:8px 12px; outline:none; font-size:13px; background:white; }
        .star { cursor:pointer; font-size:20px; transition:transform 0.15s; }
        .star:hover { transform:scale(1.3); animation: wiggle 0.3s; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #ff9fd3, #c084fc, #7dd3fc)", padding: "24px 20px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "rgba(255,255,255,0.15)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 10, left: -30, width: 80, height: 80, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          ✏️ English Journal
        </div>
        <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 4 }}>
          今天也要努力學習喔！🌈
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 14, padding: "8px 16px", backdropFilter: "blur(8px)" }}>
            <div style={{ color: "white", fontSize: 11, opacity: 0.9 }}>連續打卡</div>
            <div style={{ color: "white", fontFamily: "'Fredoka One'", fontSize: 22 }}>{streak} 天 🔥</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 14, padding: "8px 16px", backdropFilter: "blur(8px)" }}>
            <div style={{ color: "white", fontSize: 11, opacity: 0.9 }}>單字量</div>
            <div style={{ color: "white", fontFamily: "'Fredoka One'", fontSize: 22 }}>{words.length} 個 📚</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 14, padding: "8px 16px", backdropFilter: "blur(8px)" }}>
            <div style={{ color: "white", fontSize: 11, opacity: 0.9 }}>待複習</div>
            <div style={{ color: "white", fontFamily: "'Fredoka One'", fontSize: 22 }}>{dueWords.length} 個 ⏰</div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: "white", borderRadius: "20px 20px 0 0", marginTop: -24, padding: "12px 8px 0", boxShadow: "0 -4px 20px rgba(255,150,200,0.1)", position: "sticky", top: 0, zIndex: 50, overflowX: "auto", display: "flex", gap: 4, whiteSpace: "nowrap" }}>
        {TABS.map((t, i) => (
          <button key={i} className="tab-btn" onClick={() => setTab(i)} style={{
            color: tab === i ? "#fff" : "#aaa",
            background: tab === i ? "linear-gradient(135deg, #ff9fd3, #c084fc)" : "transparent",
            boxShadow: tab === i ? "0 4px 12px rgba(192,132,252,0.4)" : "none",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {tab === 0 && <WordsTab words={words} setWords={setWords} triggerCelebrate={triggerCelebrate} celebrate={celebrate} />}
        {tab === 1 && <PhrasesTab phrases={phrases} setPhrases={setPhrases} triggerCelebrate={triggerCelebrate} />}
        {tab === 2 && <GrammarTab grammar={grammar} setGrammar={setGrammar} triggerCelebrate={triggerCelebrate} />}
        {tab === 3 && <CheckInTab checkIns={checkIns} setCheckIns={setCheckIns} todayStr={todayStr} checkedToday={checkedToday} streak={streak} triggerCelebrate={triggerCelebrate} celebrate={celebrate} />}
        {tab === 4 && <StatsTab words={words} phrases={phrases} grammar={grammar} checkIns={checkIns} />}
        {tab === 5 && <QuizTab words={words} setWords={setWords} triggerCelebrate={triggerCelebrate} />}
      </div>
    </div>
  );
}

// ─── CAMERA SCAN MODAL ───
function CameraScanModal({ onClose, onAddWords }) {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedWords, setScannedWords] = useState(null);
  const [selected, setSelected] = useState({});
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageBase64(e.target.result.split(",")[1]);
      setScannedWords(null);
    };
    reader.readAsDataURL(file);
  };

  const scanImage = async () => {
    if (!imageBase64) return;
    setScanning(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: imageBase64 }
              },
              {
                type: "text",
                text: `Please find all English words or phrases in this image that are worth learning. For each word/phrase, provide the Chinese meaning and part of speech. 
Return ONLY a JSON array, no other text:
[{"word": "...", "meaning": "中文意思", "tag": "名詞/動詞/形容詞/副詞/片語", "example": "a short example sentence"}]
Focus on interesting vocabulary. If there are no English words, return [].`
              }
            ]
          }]
        })
      });
      const data = await res.json();
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setScannedWords(parsed);
      const sel = {};
      parsed.forEach((_, i) => sel[i] = true);
      setSelected(sel);
    } catch (e) {
      setScannedWords([]);
    }
    setScanning(false);
  };

  const addSelected = () => {
    const toAdd = scannedWords.filter((_, i) => selected[i]).map(w => ({
      ...w, id: Date.now() + Math.random(), level: 0,
      nextReview: Date.now(), reviewCount: 0
    }));
    onAddWords(toAdd);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200,
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "white", borderRadius: "24px 24px 0 0", padding: 24,
        width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
        animation: "slideIn 0.3s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Fredoka One'", fontSize: 20, color: "#c084fc" }}>📷 拍照辨識單字</div>
          <button className="btn" onClick={onClose} style={{ background: "#f3f4f6", color: "#888", padding: "6px 12px" }}>✕</button>
        </div>

        {!image ? (
          <div>
            <div style={{
              border: "3px dashed #f0d9ff", borderRadius: 20, padding: 40,
              textAlign: "center", cursor: "pointer", background: "#fdf9ff",
              marginBottom: 14
            }} onClick={() => fileRef.current.click()}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>📸</div>
              <div style={{ fontWeight: 800, color: "#c084fc", marginBottom: 4 }}>點擊上傳圖片</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>支援拍照、截圖、書本、菜單、文章等</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment"
              style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => { fileRef.current.setAttribute("capture","environment"); fileRef.current.click(); }}
                style={{ flex: 1, background: "linear-gradient(135deg, #ff9fd3, #c084fc)", color: "white", padding: "12px 0", fontSize: 14 }}>
                📷 開啟相機
              </button>
              <button className="btn" onClick={() => { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }}
                style={{ flex: 1, background: "linear-gradient(135deg, #a5f3fc, #818cf8)", color: "white", padding: "12px 0", fontSize: 14 }}>
                🖼️ 選擇圖片
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <img src={image} alt="uploaded" style={{ width: "100%", borderRadius: 16, maxHeight: 240, objectFit: "cover" }} />
              <button className="btn" onClick={() => { setImage(null); setScannedWords(null); }}
                style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", padding: "4px 10px", fontSize: 12 }}>
                重選
              </button>
            </div>

            {!scannedWords && (
              <button className="btn" onClick={scanImage} disabled={scanning} style={{
                width: "100%", padding: "14px 0", fontSize: 15,
                background: scanning ? "#e0e0e0" : "linear-gradient(135deg, #ff9fd3, #c084fc)",
                color: scanning ? "#aaa" : "white",
                boxShadow: scanning ? "none" : "0 6px 20px rgba(192,132,252,0.4)"
              }}>
                {scanning ? (
                  <span>🤖 AI 辨識中，請稍候...</span>
                ) : "🔍 開始辨識單字"}
              </button>
            )}

            {scanning && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#c084fc" }}>
                <div style={{ fontSize: 36, animation: "bounce 1s infinite" }}>🔍</div>
                <div style={{ fontSize: 13, marginTop: 8 }}>Claude 正在分析圖片中的單字...</div>
              </div>
            )}

            {scannedWords && scannedWords.length === 0 && (
              <div style={{ textAlign: "center", padding: 20, color: "#aaa" }}>
                😅 圖片中沒有找到英文單字，換一張試試！
              </div>
            )}

            {scannedWords && scannedWords.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, color: "#7c3aed" }}>找到 {scannedWords.length} 個單字！</div>
                  <button className="btn" onClick={() => {
                    const allSel = scannedWords.every((_, i) => selected[i]);
                    const newSel = {};
                    scannedWords.forEach((_, i) => newSel[i] = !allSel);
                    setSelected(newSel);
                  }} style={{ background: "#f0e8ff", color: "#7c3aed", padding: "4px 12px", fontSize: 12 }}>
                    {scannedWords.every((_, i) => selected[i]) ? "取消全選" : "全選"}
                  </button>
                </div>
                <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 14 }}>
                  {scannedWords.map((w, i) => (
                    <div key={i} onClick={() => setSelected(s => ({ ...s, [i]: !s[i] }))}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                        borderRadius: 14, marginBottom: 8, cursor: "pointer",
                        background: selected[i] ? "#f5f0ff" : "#f9f9f9",
                        border: `2px solid ${selected[i] ? "#c084fc" : "#eee"}`,
                        transition: "all 0.15s"
                      }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
                        background: selected[i] ? "linear-gradient(135deg, #ff9fd3, #c084fc)" : "#e0e0e0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, color: "white", fontWeight: 800
                      }}>{selected[i] ? "✓" : ""}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontFamily: "'Fredoka One'", fontSize: 16, color: "#7c3aed" }}>{w.word}</span>
                          <Badge text={w.tag} color="#f0d9ff" textColor="#9333ea" />
                        </div>
                        <div style={{ color: "#555", fontSize: 13 }}>{w.meaning}</div>
                        {w.example && <div style={{ color: "#aaa", fontSize: 11, fontStyle: "italic" }}>"{w.example}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn" onClick={addSelected}
                  disabled={!Object.values(selected).some(Boolean)}
                  style={{
                    width: "100%", padding: "14px 0", fontSize: 15,
                    background: Object.values(selected).some(Boolean)
                      ? "linear-gradient(135deg, #ff9fd3, #c084fc)" : "#e0e0e0",
                    color: Object.values(selected).some(Boolean) ? "white" : "#aaa",
                    boxShadow: Object.values(selected).some(Boolean) ? "0 6px 20px rgba(192,132,252,0.4)" : "none"
                  }}>
                  ➕ 加入單字本（{Object.values(selected).filter(Boolean).length} 個）
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WORDS TAB ───
function WordsTab({ words, setWords, triggerCelebrate, celebrate }) {
  const [showForm, setShowForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [form, setForm] = useState({ word: "", meaning: "", tag: "名詞" });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExample, setAiExample] = useState("");
  const [filter, setFilter] = useState("all");

  const addWord = () => {
    if (!form.word || !form.meaning) return;
    const newWord = {
      id: Date.now(), word: form.word, meaning: form.meaning,
      example: aiExample || "", level: 0, nextReview: Date.now(),
      reviewCount: 0, tag: form.tag,
    };
    setWords(w => [newWord, ...w]);
    setForm({ word: "", meaning: "", tag: "名詞" });
    setAiExample("");
    setShowForm(false);
    triggerCelebrate();
  };

  const handleAddScannedWords = (newWords) => {
    setWords(w => [...newWords, ...w]);
    triggerCelebrate();
  };

  const generateExample = async () => {
    if (!form.word) return;
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `Give me 2 short, natural English example sentences using the word "${form.word}". Reply in this JSON format only: {"sentences": ["...", "..."]}` }]
        })
      });
      const data = await res.json();
      const text = data.content[0].text;
      const parsed = JSON.parse(text);
      setAiExample(parsed.sentences.join(" / "));
    } catch { setAiExample("Unable to generate examples. Try again!"); }
    setAiLoading(false);
  };

  const updateLevel = (id, delta) => {
    setWords(ws => ws.map(w => {
      if (w.id !== id) return w;
      const newLevel = Math.max(0, Math.min(4, w.level + delta));
      const intervals = [1, 3, 7, 14, 30];
      const nextReview = Date.now() + intervals[newLevel] * 86400000;
      return { ...w, level: newLevel, nextReview, reviewCount: w.reviewCount + 1 };
    }));
    if (delta > 0) triggerCelebrate();
  };

  const filtered = filter === "all" ? words : filter === "due" ? words.filter(w => w.nextReview <= Date.now()) : words.filter(w => w.tag === filter);
  const tags = [...new Set(words.map(w => w.tag))];

  return (
    <div>
      {showCamera && <CameraScanModal onClose={() => setShowCamera(false)} onAddWords={handleAddScannedWords} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Fredoka One'", fontSize: 18, color: "#c084fc" }}>我的單字本 📖</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setShowCamera(true)} style={{
            background: "linear-gradient(135deg, #a5f3fc, #818cf8)", color: "white",
            padding: "8px 14px", fontSize: 13
          }}>📷 拍照</button>
          <button className="btn" onClick={() => setShowForm(!showForm)} style={{
            background: "linear-gradient(135deg, #ff9fd3, #c084fc)", color: "white",
            padding: "8px 18px", fontSize: 13
          }}>+ 新增</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {["all", "due", ...tags].map(f => (
          <button key={f} className="btn" onClick={() => setFilter(f)} style={{
            background: filter === f ? "#ffd6f0" : "#f8f0ff", color: filter === f ? "#c084fc" : "#aaa",
            padding: "5px 14px", fontSize: 12, borderRadius: 10, whiteSpace: "nowrap"
          }}>{f === "all" ? "全部" : f === "due" ? `⏰ 待複習 (${words.filter(w => w.nextReview <= Date.now()).length})` : f}</button>
        ))}
      </div>

      {showForm && (
        <div className="card" style={{ border: "2px dashed #f9a8d4", background: "#fff5fb" }}>
          <div style={{ fontWeight: 800, color: "#c084fc", marginBottom: 10 }}>✨ 新增單字</div>
          <input placeholder="英文單字" value={form.word} onChange={e => setForm(f => ({ ...f, word: e.target.value }))} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <input placeholder="中文意思" value={form.meaning} onChange={e => setForm(f => ({ ...f, meaning: e.target.value }))} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} style={{ marginBottom: 8 }}>
            {["名詞", "動詞", "形容詞", "副詞", "片語", "其他"].map(t => <option key={t}>{t}</option>)}
          </select>
          <button className="btn" onClick={generateExample} disabled={aiLoading} style={{
            background: aiLoading ? "#e0e0e0" : "linear-gradient(135deg, #a5f3fc, #818cf8)",
            color: "white", padding: "8px 16px", fontSize: 12, marginBottom: 8, width: "100%"
          }}>{aiLoading ? "🤖 AI 生成中..." : "🤖 AI 生成例句"}</button>
          {aiExample && <div style={{ background: "#f0fff4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 10, fontSize: 13, color: "#059669", marginBottom: 8 }}>💡 {aiExample}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={addWord} style={{ background: "linear-gradient(135deg, #ff9fd3, #c084fc)", color: "white", padding: "8px 20px", flex: 1 }}>儲存</button>
            <button className="btn" onClick={() => setShowForm(false)} style={{ background: "#f3f4f6", color: "#888", padding: "8px 16px" }}>取消</button>
          </div>
        </div>
      )}

      {filtered.map(w => (
        <div key={w.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Fredoka One'", fontSize: 20, color: "#7c3aed" }}>{w.word}</span>
                <Badge text={w.tag} color="#f0d9ff" textColor="#9333ea" />
                <Badge text={LEVEL_LABELS[w.level]} color={LEVEL_COLORS[w.level]} textColor="#555" />
              </div>
              <div style={{ color: "#555", fontSize: 14, marginBottom: 4 }}>🇹🇼 {w.meaning}</div>
              {w.example && <div style={{ color: "#888", fontSize: 12, fontStyle: "italic" }}>"{w.example}"</div>}
              <div style={{ color: "#ccc", fontSize: 11, marginTop: 6 }}>
                複習 {w.reviewCount} 次 · 下次: {new Date(w.nextReview).toLocaleDateString("zh-TW")}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
              <button className="btn" onClick={() => updateLevel(w.id, -1)} style={{ background: "#ffd6d6", color: "#e53e3e", padding: "4px 10px", fontSize: 16, borderRadius: 10 }}>😅</button>
              <button className="btn" onClick={() => updateLevel(w.id, 1)} style={{ background: "#d4edda", color: "#28a745", padding: "4px 10px", fontSize: 16, borderRadius: 10 }}>😊</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= w.level ? "#c084fc" : "#f0e0ff", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div style={{ textAlign: "center", color: "#ccc", padding: 40 }}>還沒有單字喔！快去新增吧 ✏️</div>}
    </div>
  );
}

// ─── PHRASES TAB ───
function PhrasesTab({ phrases, setPhrases, triggerCelebrate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ phrase: "", meaning: "", example: "", tag: "慣用語" });

  const add = () => {
    if (!form.phrase || !form.meaning) return;
    setPhrases(p => [{ ...form, id: Date.now() }, ...p]);
    setForm({ phrase: "", meaning: "", example: "", tag: "慣用語" });
    setShowForm(false);
    triggerCelebrate();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Fredoka One'", fontSize: 18, color: "#f97316" }}>句子 & 片語 💬</div>
        <button className="btn" onClick={() => setShowForm(!showForm)} style={{ background: "linear-gradient(135deg, #fdba74, #f97316)", color: "white", padding: "8px 18px", fontSize: 13 }}>+ 新增</button>
      </div>
      {showForm && (
        <div className="card" style={{ border: "2px dashed #fdba74", background: "#fff8f0" }}>
          <div style={{ fontWeight: 800, color: "#f97316", marginBottom: 10 }}>💬 新增片語/句子</div>
          <input placeholder="英文片語 / 句子" value={form.phrase} onChange={e => setForm(f => ({ ...f, phrase: e.target.value }))} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <input placeholder="中文意思" value={form.meaning} onChange={e => setForm(f => ({ ...f, meaning: e.target.value }))} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <input placeholder="例句（選填）" value={form.example} onChange={e => setForm(f => ({ ...f, example: e.target.value }))} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} style={{ marginBottom: 8 }}>
            {["慣用語", "諺語", "口語表達", "書面用語", "商務英文"].map(t => <option key={t}>{t}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={add} style={{ background: "linear-gradient(135deg, #fdba74, #f97316)", color: "white", padding: "8px 20px", flex: 1 }}>儲存</button>
            <button className="btn" onClick={() => setShowForm(false)} style={{ background: "#f3f4f6", color: "#888", padding: "8px 16px" }}>取消</button>
          </div>
        </div>
      )}
      {phrases.map(p => (
        <div key={p.id} className="card" style={{ borderLeft: "4px solid #fdba74" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: "'Fredoka One'", fontSize: 17, color: "#ea580c" }}>{p.phrase}</span>
            <Badge text={p.tag} color="#fff0e0" textColor="#f97316" />
          </div>
          <div style={{ color: "#555", fontSize: 14, marginBottom: 4 }}>🇹🇼 {p.meaning}</div>
          {p.example && <div style={{ color: "#888", fontSize: 12, fontStyle: "italic" }}>"{p.example}"</div>}
        </div>
      ))}
      {phrases.length === 0 && <div style={{ textAlign: "center", color: "#ccc", padding: 40 }}>新增你學到的片語！💪</div>}
    </div>
  );
}

// ─── GRAMMAR TAB ───
function GrammarTab({ grammar, setGrammar, triggerCelebrate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", rule: "", example: "", note: "" });

  const add = () => {
    if (!form.title || !form.rule) return;
    setGrammar(g => [{ ...form, id: Date.now() }, ...g]);
    setForm({ title: "", rule: "", example: "", note: "" });
    setShowForm(false);
    triggerCelebrate();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Fredoka One'", fontSize: 18, color: "#10b981" }}>文法筆記 📝</div>
        <button className="btn" onClick={() => setShowForm(!showForm)} style={{ background: "linear-gradient(135deg, #6ee7b7, #10b981)", color: "white", padding: "8px 18px", fontSize: 13 }}>+ 新增</button>
      </div>
      {showForm && (
        <div className="card" style={{ border: "2px dashed #6ee7b7", background: "#f0fff8" }}>
          <div style={{ fontWeight: 800, color: "#10b981", marginBottom: 10 }}>📝 新增文法筆記</div>
          <input placeholder="文法主題（如：現在完成式）" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <input placeholder="公式 / 規則" value={form.rule} onChange={e => setForm(f => ({ ...f, rule: e.target.value }))} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <input placeholder="例句" value={form.example} onChange={e => setForm(f => ({ ...f, example: e.target.value }))} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
          <textarea placeholder="筆記 / 提醒" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={3} style={{ width: "100%", marginBottom: 8, boxSizing: "border-box", resize: "vertical" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={add} style={{ background: "linear-gradient(135deg, #6ee7b7, #10b981)", color: "white", padding: "8px 20px", flex: 1 }}>儲存</button>
            <button className="btn" onClick={() => setShowForm(false)} style={{ background: "#f3f4f6", color: "#888", padding: "8px 16px" }}>取消</button>
          </div>
        </div>
      )}
      {grammar.map(g => (
        <div key={g.id} className="card" style={{ borderLeft: "4px solid #6ee7b7" }}>
          <div style={{ fontFamily: "'Fredoka One'", fontSize: 17, color: "#059669", marginBottom: 6 }}>{g.title}</div>
          <div style={{ background: "#f0fff8", borderRadius: 10, padding: "6px 12px", fontSize: 13, color: "#047857", marginBottom: 6, fontFamily: "monospace" }}>📐 {g.rule}</div>
          {g.example && <div style={{ color: "#555", fontSize: 13, fontStyle: "italic", marginBottom: 4 }}>e.g. "{g.example}"</div>}
          {g.note && <div style={{ color: "#888", fontSize: 12, background: "#fffbeb", borderRadius: 8, padding: "5px 10px" }}>💡 {g.note}</div>}
        </div>
      ))}
      {grammar.length === 0 && <div style={{ textAlign: "center", color: "#ccc", padding: 40 }}>記錄你的文法筆記吧！📚</div>}
    </div>
  );
}

// ─── CHECK IN TAB ───
function CheckInTab({ checkIns, setCheckIns, todayStr, checkedToday, streak, triggerCelebrate, celebrate }) {
  const [celebrateRef, setCelebrateRef] = useState(0);

  const doCheckIn = () => {
    if (checkedToday) return;
    setCheckIns(c => [...c, todayStr]);
    triggerCelebrate();
    setCelebrateRef(r => r + 1);
  };

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div>
      <div style={{ fontFamily: "'Fredoka One'", fontSize: 18, color: "#f59e0b", marginBottom: 14 }}>每日打卡 ✅</div>
      <div className="card" style={{ textAlign: "center", padding: 30, background: "linear-gradient(135deg, #fef3c7, #fde68a)", position: "relative" }}>
        <FloatingEmoji emojis={["⭐", "🎉", "✨", "🌟", "💫"]} trigger={celebrateRef} />
        <div style={{ fontSize: 60, marginBottom: 8, animation: "bounce 2s infinite" }}>🔥</div>
        <div style={{ fontFamily: "'Fredoka One'", fontSize: 36, color: "#d97706" }}>{streak}</div>
        <div style={{ color: "#92400e", fontSize: 14, marginBottom: 20 }}>連續學習天數</div>
        <button className="btn" onClick={doCheckIn} disabled={checkedToday} style={{
          background: checkedToday ? "#d1fae5" : "linear-gradient(135deg, #fbbf24, #f59e0b)",
          color: checkedToday ? "#059669" : "white",
          padding: "14px 36px", fontSize: 16,
          boxShadow: checkedToday ? "none" : "0 6px 20px rgba(245,158,11,0.4)"
        }}>
          {checkedToday ? "✅ 今天已打卡！" : "📅 今天打卡"}
        </button>
      </div>

      <div style={{ fontWeight: 800, color: "#92400e", marginBottom: 10, marginTop: 16 }}>過去 30 天紀錄</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {last30.map(d => (
          <div key={d} style={{
            aspectRatio: "1", borderRadius: 8, background: checkIns.includes(d) ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : "#f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: checkIns.includes(d) ? 16 : 11, color: checkIns.includes(d) ? "white" : "#ccc",
            boxShadow: checkIns.includes(d) ? "0 2px 8px rgba(245,158,11,0.4)" : "none",
          }}>{checkIns.includes(d) ? "⭐" : new Date(d).getDate()}</div>
        ))}
      </div>
    </div>
  );
}

// ─── STATS TAB ───
function StatsTab({ words, phrases, grammar, checkIns }) {
  const levelCounts = [0, 1, 2, 3, 4].map(l => words.filter(w => w.level === l).length);
  const masteredPct = words.length ? Math.round((words.filter(w => w.level >= 3).length / words.length) * 100) : 0;
  const totalReviews = words.reduce((s, w) => s + w.reviewCount, 0);

  return (
    <div>
      <div style={{ fontFamily: "'Fredoka One'", fontSize: 18, color: "#6366f1", marginBottom: 14 }}>學習統計 📊</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {[
          { label: "單字總數", value: words.length, icon: "📚", color: "#ede9fe" },
          { label: "片語總數", value: phrases.length, icon: "💬", color: "#fef3c7" },
          { label: "文法筆記", value: grammar.length, icon: "📝", color: "#d1fae5" },
          { label: "累計打卡", value: checkIns.length, icon: "✅", color: "#dbeafe" },
          { label: "總複習次數", value: totalReviews, icon: "🔄", color: "#fce7f3" },
          { label: "精通單字", value: `${masteredPct}%`, icon: "🏆", color: "#fef9c3" },
        ].map(s => (
          <div key={s.label} className="card" style={{ background: s.color, textAlign: "center", padding: "16px 8px" }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Fredoka One'", fontSize: 26, color: "#374151" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontWeight: 800, color: "#6366f1", marginBottom: 12 }}>單字熟悉度分佈</div>
        {LEVEL_LABELS.map((label, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#555" }}>{label}</span>
              <span style={{ color: "#888" }}>{levelCounts[i]} 個</span>
            </div>
            <div style={{ background: "#f3f4f6", borderRadius: 6, height: 10, overflow: "hidden" }}>
              <div style={{
                width: words.length ? `${(levelCounts[i] / words.length) * 100}%` : "0%",
                height: "100%", background: LEVEL_COLORS[i].replace(")", ", 1)").replace("#", "hsl("),
                background: ["#ffb3c1", "#ffcba4", "#ffe08a", "#95d5b2", "#74b9ff"][i],
                borderRadius: 6, transition: "width 0.5s"
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUIZ TAB ───
function QuizTab({ words, setWords, triggerCelebrate }) {
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [celebQ, setCelebQ] = useState(0);

  const startQuiz = () => {
    if (words.length < 4) return;
    const word = words[Math.floor(Math.random() * words.length)];
    const others = words.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...others.map(w => w.meaning), word.meaning].sort(() => Math.random() - 0.5);
    setQuiz({ word, answer: word.meaning, options });
    setSelected(null);
    setShowResult(false);
  };

  const answer = (opt) => {
    if (selected) return;
    setSelected(opt);
    setShowResult(true);
    const correct = opt === quiz.answer;
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) { triggerCelebrate(); setCelebQ(c => c + 1); }
  };

  const accuracy = score.total ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div>
      <div style={{ fontFamily: "'Fredoka One'", fontSize: 18, color: "#ec4899", marginBottom: 14 }}>單字測驗 🎯</div>

      <div className="card" style={{ background: "linear-gradient(135deg, #fdf2f8, #fce7f3)", textAlign: "center", padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          <div><div style={{ fontFamily: "'Fredoka One'", fontSize: 24, color: "#ec4899" }}>{score.correct}</div><div style={{ fontSize: 11, color: "#888" }}>答對</div></div>
          <div><div style={{ fontFamily: "'Fredoka One'", fontSize: 24, color: "#6366f1" }}>{score.total}</div><div style={{ fontSize: 11, color: "#888" }}>作答</div></div>
          <div><div style={{ fontFamily: "'Fredoka One'", fontSize: 24, color: "#f59e0b" }}>{accuracy}%</div><div style={{ fontSize: 11, color: "#888" }}>正確率</div></div>
        </div>
      </div>

      {words.length < 4 ? (
        <div style={{ textAlign: "center", color: "#ccc", padding: 40 }}>至少需要 4 個單字才能測驗喔！先去新增單字吧 📚</div>
      ) : !quiz ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 60, marginBottom: 16, animation: "bounce 2s infinite" }}>🎯</div>
          <button className="btn" onClick={startQuiz} style={{ background: "linear-gradient(135deg, #f9a8d4, #ec4899)", color: "white", padding: "14px 40px", fontSize: 16, boxShadow: "0 6px 20px rgba(236,72,153,0.4)" }}>開始測驗！</button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <FloatingEmoji emojis={["🎉", "⭐", "✨"]} trigger={celebQ} />
          <div className="card" style={{ textAlign: "center", padding: 30, background: "linear-gradient(135deg, #fdf2f8, #f5f3ff)" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>這個單字的意思是？</div>
            <div style={{ fontFamily: "'Fredoka One'", fontSize: 32, color: "#7c3aed" }}>{quiz.word.word}</div>
            {quiz.word.example && <div style={{ color: "#aaa", fontSize: 12, fontStyle: "italic", marginTop: 8 }}>"{quiz.word.example}"</div>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {quiz.options.map((opt, i) => {
              let bg = "white", border = "2px solid #f0d9ff", color = "#555";
              if (selected) {
                if (opt === quiz.answer) { bg = "#d4edda"; border = "2px solid #28a745"; color = "#155724"; }
                else if (opt === selected) { bg = "#f8d7da"; border = "2px solid #dc3545"; color = "#721c24"; }
                else { border = "2px solid #e9ecef"; color = "#aaa"; }
              }
              return (
                <button key={i} className="btn" onClick={() => answer(opt)} style={{
                  background: bg, border, color, padding: "14px 20px", textAlign: "left",
                  fontSize: 14, fontWeight: selected && opt === quiz.answer ? 800 : 600,
                  borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}>
                  {selected && opt === quiz.answer && "✅ "}{selected && opt === selected && opt !== quiz.answer && "❌ "}{opt}
                </button>
              );
            })}
          </div>

          {showResult && (
            <button className="btn" onClick={startQuiz} style={{ background: "linear-gradient(135deg, #f9a8d4, #ec4899)", color: "white", padding: "12px 30px", fontSize: 15, width: "100%", boxShadow: "0 4px 16px rgba(236,72,153,0.3)" }}>
              下一題 →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
