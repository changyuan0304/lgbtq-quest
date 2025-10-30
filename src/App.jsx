import React, { useEffect, useState } from "react";

// 🎮 心理諮商 × LGBTQ+ 闖關式互動學習
// 手機版優先設計 | 關卡解鎖機制

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

const stages = [
  { id: 1, title: "代名詞練習", emoji: "🧑‍🤝‍🧑", color: "violet" },
  { id: 2, title: "語言檢視", emoji: "🗣️", color: "blue" },
  { id: 3, title: "情境決策", emoji: "🧭", color: "purple" },
  { id: 4, title: "友善行動", emoji: "✅", color: "green" },
  { id: 5, title: "反思牆", emoji: "📝", color: "pink" },
];

export default function App() {
  const [view, setView] = useState("map"); // map | stage
  const [currentStage, setCurrentStage] = useState(null);
  const [progress, setProgress] = useLocalStorage("lg_progress", {});
  const [name, setName] = useLocalStorage("lg_name", "");
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    if (!name) {
      setShowNameInput(true);
    }
  }, []);

  const isUnlocked = (stageId) => {
    if (stageId === 1) return true;
    return progress[stageId - 1]?.completed || false;
  };

  const completeStage = (stageId, stars) => {
    setProgress((prev) => ({
      ...prev,
      [stageId]: { completed: true, stars, timestamp: Date.now() },
    }));
    setTimeout(() => {
      setView("map");
      setCurrentStage(null);
    }, 1500);
  };

  const openStage = (stage) => {
    if (!isUnlocked(stage.id)) return;
    setCurrentStage(stage);
    setView("stage");
  };

  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const totalStars = Object.values(progress).reduce((sum, p) => sum + (p.stars || 0), 0);

  if (showNameInput) {
    return <NameInputScreen name={name} setName={setName} onContinue={() => setShowNameInput(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 overflow-hidden">
      {view === "map" ? (
        <MapView
          stages={stages}
          progress={progress}
          isUnlocked={isUnlocked}
          openStage={openStage}
          name={name}
          completedCount={completedCount}
          totalStars={totalStars}
          onNameClick={() => setShowNameInput(true)}
        />
      ) : (
        <StageView stage={currentStage} onComplete={completeStage} onBack={() => setView("map")} name={name} />
      )}
    </div>
  );
}

// 📛 名字輸入畫面
function NameInputScreen({ name, setName, onContinue }) {
  const [input, setInput] = useState(name);

  const handleContinue = () => {
    if (input.trim()) {
      setName(input.trim());
      onContinue();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-slideIn">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🌈</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">歡迎來到</h1>
          <h2 className="text-lg font-semibold text-violet-600">心理諮商 × LGBTQ+</h2>
          <h2 className="text-lg font-semibold text-violet-600">闖關學習之旅</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">請輸入你的名字</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如：小明"
              className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none text-lg"
              onKeyPress={(e) => e.key === "Enter" && handleContinue()}
              autoFocus
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={!input.trim()}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            開始闖關 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

// 🗺️ 關卡地圖
function MapView({ stages, progress, isUnlocked, openStage, name, completedCount, totalStars, onNameClick }) {
  return (
    <div className="min-h-screen pb-20">
      {/* 頂部狀態列 */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🌈</div>
            <div>
              <div className="text-xs opacity-90">闖關者</div>
              <button onClick={onNameClick} className="font-bold text-lg active:scale-95 transition">
                {name} ✏️
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">⭐ {totalStars}</div>
            <div className="text-xs opacity-90">累積星星</div>
          </div>
        </div>

        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500"
            style={{ width: `${(completedCount / stages.length) * 100}%` }}
          />
        </div>
        <div className="text-center text-xs mt-1 opacity-90">
          已完成 {completedCount} / {stages.length} 關
        </div>
      </div>

      {/* 關卡列表 */}
      <div className="p-4 space-y-4 mt-4">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
          選擇關卡開始學習 🎯
        </h2>

        {stages.map((stage, idx) => {
          const unlocked = isUnlocked(stage.id);
          const completed = progress[stage.id]?.completed || false;
          const stars = progress[stage.id]?.stars || 0;

          return (
            <div key={stage.id} className="animate-slideIn" style={{ animationDelay: `${idx * 0.1}s` }}>
              <StageCard
                stage={stage}
                unlocked={unlocked}
                completed={completed}
                stars={stars}
                onClick={() => openStage(stage)}
              />
            </div>
          );
        })}
      </div>

      {/* 完成慶祝 */}
      {completedCount === stages.length && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-slideIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">恭喜完成所有關卡！</h2>
            <p className="text-slate-600 mb-4">你獲得了 {totalStars} 顆星星</p>
            <p className="text-sm text-slate-500">你已經學會如何在心理諮商中</p>
            <p className="text-sm text-slate-500">更好地支持 LGBTQ+ 群體 🌈</p>
            <p className="text-sm text-slate-500">開發者：ViralArc.ai</p>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎴 關卡卡片
function StageCard({ stage, unlocked, completed, stars, onClick }) {
  const colorStyles = {
    violet: "from-violet-500 to-purple-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    pink: "from-pink-500 to-rose-500",
  };

  if (!unlocked) {
    return (
      <div className="bg-slate-200 rounded-2xl p-6 relative overflow-hidden opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl grayscale">{stage.emoji}</div>
            <div>
              <h3 className="font-bold text-slate-500">第 {stage.id} 關</h3>
              <p className="text-sm text-slate-400">{stage.title}</p>
            </div>
          </div>
          <div className="text-4xl">🔒</div>
        </div>
        <div className="text-xs text-slate-400 mt-2">完成上一關後解鎖</div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${colorStyles[stage.color]} rounded-2xl p-6 text-white shadow-lg active:scale-95 transition-transform relative overflow-hidden`}
    >
      {completed && (
        <div className="absolute top-2 right-2 bg-white/30 rounded-full px-3 py-1 text-xs font-bold backdrop-blur">
          ✓ 已完成
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{stage.emoji}</div>
          <div className="text-left">
            <h3 className="font-bold text-lg">第 {stage.id} 關</h3>
            <p className="text-sm opacity-90">{stage.title}</p>
          </div>
        </div>
        {!completed && <div className="text-2xl">▶️</div>}
      </div>

      {completed && (
        <div className="flex gap-1 justify-center">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-2xl ${s <= stars ? "opacity-100" : "opacity-30"}`}>
              ⭐
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

// 🎮 關卡遊戲視圖
function StageView({ stage, onComplete, onBack, name }) {
  if (!stage) return null;

  return (
    <div className="min-h-screen">
      {/* 頂部返回列 */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="p-4 flex items-center gap-3">
          <button onClick={onBack} className="text-2xl active:scale-90 transition">
            ⬅️
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{stage.emoji}</span>
            <div>
              <div className="text-xs text-slate-500">第 {stage.id} 關</div>
              <div className="font-bold text-slate-800">{stage.title}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 關卡內容 */}
      <div className="p-4">
        {stage.id === 1 && <Stage1 onComplete={(stars) => onComplete(stage.id, stars)} />}
        {stage.id === 2 && <Stage2 onComplete={(stars) => onComplete(stage.id, stars)} />}
        {stage.id === 3 && <Stage3 onComplete={(stars) => onComplete(stage.id, stars)} />}
        {stage.id === 4 && <Stage4 onComplete={(stars) => onComplete(stage.id, stars)} />}
        {stage.id === 5 && <Stage5 onComplete={(stars) => onComplete(stage.id, stars)} name={name} />}
      </div>
    </div>
  );
}

// 📦 關卡容器組件
function StageContainer({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-slideIn">
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white p-5">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// 🎯 第一關：代名詞練習
function Stage1({ onComplete }) {
  const questions = [
    { text: "___ 下午三點要見諮商師。", answer: "他們", options: ["他", "她", "他們", "Ta"] },
    { text: "這是 ___ 的病歷表。", answer: "他們的", options: ["他的", "她的", "他們的", "Ta的"] },
    { text: "請尊重 ___ 的身份認同。", answer: "他們", options: ["他", "她", "他們", "Ta"] },
  ];

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  const choose = (opt) => {
    setSelected(opt);
    const isCorrect = opt === q.answer;
    if (isCorrect) setScore(score + 1);

    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setSelected(null);
      } else {
        setFinished(true);
        const stars = score + (isCorrect ? 1 : 0) >= 3 ? 3 : score + (isCorrect ? 1 : 0) >= 2 ? 2 : 1;
        setShowResult(true);
        setTimeout(() => onComplete(stars), 2000);
      }
    }, 1000);
  };

  if (showResult) {
    return (
      <StageContainer title="完成！" subtitle="太棒了！">
        <div className="text-center py-8 animate-bounce-once">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-2xl font-bold text-slate-800 mb-2">答對 {score} / {questions.length} 題</p>
          <p className="text-slate-600 text-sm mt-4">💡 小提醒</p>
          <p className="text-slate-600 text-sm">若不確定對方的代名詞，</p>
          <p className="text-slate-600 text-sm">可以先使用「他們」(They)，</p>
          <p className="text-slate-600 text-sm">或禮貌地詢問對方！</p>
        </div>
      </StageContainer>
    );
  }

  return (
    <StageContainer title="代名詞練習" subtitle="選出最尊重對方身份的代名詞">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i < idx ? "bg-green-500" : i === idx ? "bg-violet-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-600 text-center">第 {idx + 1} / {questions.length} 題</p>
      </div>

      <div className="bg-violet-50 rounded-2xl p-6 mb-6">
        <p className="text-lg font-medium text-slate-800">{q.text}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === q.answer;
          const showFeedback = selected !== null;

          return (
            <button
              key={opt}
              onClick={() => !selected && choose(opt)}
              disabled={selected !== null}
              className={`p-4 rounded-xl border-2 font-semibold text-lg transition-all active:scale-95 ${
                showFeedback
                  ? isSelected
                    ? isCorrect
                      ? "bg-green-500 text-white border-green-500 animate-bounce-once"
                      : "bg-red-500 text-white border-red-500 animate-shake"
                    : isCorrect
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-slate-100 border-slate-300 text-slate-400"
                  : "bg-white border-violet-300 hover:border-violet-500 hover:bg-violet-50"
              }`}
            >
              {opt}
              {showFeedback && isCorrect && " ✓"}
            </button>
          );
        })}
      </div>
    </StageContainer>
  );
}

// 🗣️ 第二關：語言檢視
function Stage2({ onComplete }) {
  const phrases = [
    { text: "你真不像同志。", correct: false, explanation: "這是刻板印象，每個人的樣子都不同" },
    { text: "我會尊重你的代名詞。", correct: true, explanation: "這是肯認和尊重的表達" },
    { text: "你確定你是那樣嗎？", correct: false, explanation: "質疑他人的身份認同是不當的" },
    { text: "謝謝你願意分享。", correct: true, explanation: "感謝個案的信任和開放" },
  ];

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  const p = phrases[idx];

  const choose = (answer) => {
    setSelected(answer);
    const isCorrect = answer === p.correct;
    if (isCorrect) setScore(score + 1);

    setTimeout(() => {
      if (idx + 1 < phrases.length) {
        setIdx(idx + 1);
        setSelected(null);
      } else {
        setFinished(true);
        const stars = score + (isCorrect ? 1 : 0) >= 4 ? 3 : score + (isCorrect ? 1 : 0) >= 3 ? 2 : 1;
        setTimeout(() => onComplete(stars), 2000);
      }
    }, 2000);
  };

  if (finished) {
    return (
      <StageContainer title="完成！">
        <div className="text-center py-8 animate-bounce-once">
          <div className="text-6xl mb-4">🎊</div>
          <p className="text-2xl font-bold text-slate-800 mb-2">答對 {score} / {phrases.length} 題</p>
          <p className="text-slate-600 text-sm mt-4">記得在諮商中使用</p>
          <p className="text-slate-600 text-sm">開放、尊重、肯認的語言！</p>
        </div>
      </StageContainer>
    );
  }

  return (
    <StageContainer title="語言檢視" subtitle="判斷這些語句是否適當">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          {phrases.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i < idx ? "bg-green-500" : i === idx ? "bg-blue-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-600 text-center">第 {idx + 1} / {phrases.length} 題</p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 mb-6">
        <p className="text-lg font-medium text-slate-800 text-center">「{p.text}」</p>
      </div>

      {selected === null ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => choose(true)}
            className="p-6 rounded-xl border-2 border-green-300 bg-white hover:bg-green-50 active:scale-95 transition"
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="font-semibold text-green-700">適當語言</div>
          </button>
          <button
            onClick={() => choose(false)}
            className="p-6 rounded-xl border-2 border-red-300 bg-white hover:bg-red-50 active:scale-95 transition"
          >
            <div className="text-3xl mb-2">❌</div>
            <div className="font-semibold text-red-700">不當語言</div>
          </button>
        </div>
      ) : (
        <div
          className={`p-6 rounded-xl ${
            selected === p.correct ? "bg-green-100 border-2 border-green-500" : "bg-red-100 border-2 border-red-500"
          } animate-slideIn`}
        >
          <div className="text-center mb-3">
            <span className="text-4xl">{selected === p.correct ? "✓" : "✗"}</span>
            <p className="font-bold text-lg mt-2">{selected === p.correct ? "正確！" : "再想想"}</p>
          </div>
          <p className="text-sm text-slate-700 text-center">{p.explanation}</p>
        </div>
      )}
    </StageContainer>
  );
}

// 🧭 第三關：情境決策
function Stage3({ onComplete }) {
  const scenario = {
    title: "個案小安的困境",
    description: "小安（18歲）在會談中表示自己是跨性別者，但在家中不敢出櫃，擔心家人無法接受。小安看起來很痛苦，問你應該怎麼做。",
    options: [
      {
        text: "探討安全與自主性，陪伴小安思考",
        stars: 3,
        feedback: "✓ 優秀！這是最好的做法。尊重個案的自主性，同時關注其安全，協助評估出櫃的時機與方式。",
      },
      {
        text: "鼓勵小安立即向家人出櫃",
        stars: 1,
        feedback: "✗ 需要更謹慎。應該先評估家庭環境的安全性，不能強迫個案在不安全的情況下出櫃。",
      },
      {
        text: "建議小安不要告訴家人",
        stars: 1,
        feedback: "✗ 這不是我們的角色。諮商師應該幫助個案探索選項，而非替他們做決定。",
      },
      {
        text: "邀請家長一起來會談",
        stars: 2,
        feedback: "△ 需要先徵得小安的同意，並評估這麼做是否安全。在某些情況下可能有幫助，但不能在沒有準備的情況下進行。",
      },
    ],
  };

  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  const choose = (option) => {
    setSelected(option);
    setTimeout(() => {
      setFinished(true);
      setTimeout(() => onComplete(option.stars), 2000);
    }, 3000);
  };

  if (finished) {
    return (
      <StageContainer title="完成！">
        <div className="text-center py-8 animate-bounce-once">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg font-bold text-slate-800 mb-4">你的決策獲得了</p>
          <div className="flex gap-1 justify-center mb-4">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-3xl ${s <= selected.stars ? "opacity-100" : "opacity-30"}`}>
                ⭐
              </span>
            ))}
          </div>
          <p className="text-slate-600 text-sm">在諮商中，平衡安全與自主</p>
          <p className="text-slate-600 text-sm">是非常重要的專業能力！</p>
        </div>
      </StageContainer>
    );
  }

  return (
    <StageContainer title="情境決策" subtitle="思考諮商師如何在安全與肯認間取得平衡">
      <div className="bg-purple-50 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
          <span>📖</span> {scenario.title}
        </h3>
        <p className="text-slate-700 text-sm leading-relaxed">{scenario.description}</p>
      </div>

      {selected === null ? (
        <div className="space-y-3">
          <p className="font-medium text-slate-700 mb-3">你會如何回應？</p>
          {scenario.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(opt)}
              className="w-full p-4 rounded-xl border-2 border-purple-300 bg-white hover:bg-purple-50 active:scale-98 transition text-left"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">💭</span>
                <span className="text-slate-800">{opt.text}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 animate-slideIn">
          <div className="text-center mb-4">
            <div className="flex gap-1 justify-center mb-2">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`text-3xl ${s <= selected.stars ? "opacity-100 animate-bounce-once" : "opacity-30"}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-slate-800 text-sm leading-relaxed">{selected.feedback}</p>
          </div>
        </div>
      )}
    </StageContainer>
  );
}

// ✅ 第四關：友善行動（單選題）
function Stage4({ onComplete }) {
  const questions = [
    {
      question: "個案提到同性伴侶時，最適當的回應是？",
      options: [
        { text: "詢問「誰是男生誰是女生？」", correct: false },
        { text: "自然回應，如同對待異性戀伴侶", correct: true },
        { text: "表示「我不會歧視」以示友善", correct: false },
        { text: "刻意避免深入討論", correct: false },
      ],
    },
    {
      question: "表單設計上，性別欄位最友善的做法是？",
      options: [
        { text: "只提供「男」和「女」選項", correct: false },
        { text: "提供多元選項並允許自填", correct: true },
        { text: "不詢問性別資訊", correct: false },
        { text: "標註「生理性別」", correct: false },
      ],
    },
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const selectOption = (option) => {
    if (showFeedback) return;
    setSelected(option);
  };

  const submit = () => {
    if (!selected) return;
    setShowFeedback(true);

    setTimeout(() => {
      const newAnswers = [...answers, selected.correct];
      setAnswers(newAnswers);

      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
        setShowFeedback(false);
      } else {
        // 所有題目完成，計算分數
        const correctCount = newAnswers.filter(Boolean).length;
        const stars = correctCount === 2 ? 3 : correctCount >= 1 ? 2 : 1;
        setTimeout(() => onComplete(stars), 1500);
      }
    }, 1500);
  };

  const currentQuestion = questions[currentQ];
  const isComplete = currentQ === questions.length - 1 && showFeedback;
  const correctCount = answers.filter(Boolean).length + (showFeedback && selected?.correct ? 1 : 0);

  if (isComplete) {
    const stars = correctCount === 2 ? 3 : correctCount >= 1 ? 2 : 1;
    return (
      <StageContainer title="完成！">
        <div className="text-center py-8 animate-bounce-once">
          <div className="text-6xl mb-4">🌟</div>
          <div className="flex gap-1 justify-center mb-4">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-30"}`}>
                ⭐
              </span>
            ))}
          </div>
          <p className="text-slate-800 mb-2">答對了 {correctCount} / 2 題</p>
          <p className="text-slate-600 text-sm mt-4">持續學習和實踐</p>
          <p className="text-slate-600 text-sm">讓諮商空間更加友善！</p>
        </div>
      </StageContainer>
    );
  }

  return (
    <StageContainer title="友善行動" subtitle={`第 ${currentQ + 1} / ${questions.length} 題`}>
      <p className="text-lg font-medium text-slate-800 mb-4">{currentQuestion.question}</p>

      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, i) => {
          const isSelected = selected === option;
          const showResult = showFeedback && isSelected;
          const isCorrect = option.correct;

          return (
            <button
              key={i}
              onClick={() => selectOption(option)}
              disabled={showFeedback}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition active:scale-95 text-left ${
                showResult
                  ? isCorrect
                    ? "bg-green-50 border-green-500 shadow-md"
                    : "bg-red-50 border-red-500 shadow-md"
                  : isSelected
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-slate-300 hover:border-blue-400 hover:shadow-sm"
              } ${showFeedback ? "cursor-not-allowed" : ""}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                showResult
                  ? isCorrect
                    ? "bg-green-500 border-green-500"
                    : "bg-red-500 border-red-500"
                  : isSelected
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-slate-400"
              }`}>
                {isSelected && !showFeedback && (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
                {showResult && (
                  <span className="text-white font-bold text-base">
                    {isCorrect ? "✓" : "✗"}
                  </span>
                )}
              </div>
              <span className={`flex-1 ${isSelected ? "text-slate-900 font-medium" : "text-slate-800"}`}>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className={`mb-4 p-4 rounded-xl ${selected?.correct ? "bg-green-50" : "bg-red-50"}`}>
          <p className={`text-sm ${selected?.correct ? "text-green-800" : "text-red-800"}`}>
            {selected?.correct ? "✓ 正確！" : "✗ 這個選項可能不夠友善"}
          </p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={!selected || showFeedback}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
      >
        {!selected ? "請選擇一個答案" : showFeedback ? "載入下一題..." : "確認答案 ✓"}
      </button>
    </StageContainer>
  );
}

// 📝 第五關：反思牆
function Stage5({ onComplete, name }) {
  const [msg, setMsg] = useState("");
  const [list, setList] = useLocalStorage("lg_notes", []);
  const [submitted, setSubmitted] = useState(false);

  const add = () => {
    if (!msg.trim()) return;
    setList([{ id: Date.now(), text: msg, by: name, timestamp: Date.now() }, ...list]);
    setSubmitted(true);
    setTimeout(() => onComplete(3), 2000);
  };

  if (submitted) {
    return (
      <StageContainer title="完成！">
        <div className="text-center py-8 animate-bounce-once">
          <div className="text-6xl mb-4">💝</div>
          <p className="text-2xl font-bold text-slate-800 mb-4">感謝你的反思！</p>
          <p className="text-slate-600 text-sm">你的學習將幫助更多人</p>
          <p className="text-slate-600 text-sm">感受到被理解和尊重 🌈</p>
        </div>
      </StageContainer>
    );
  }

  return (
    <StageContainer title="反思牆" subtitle="寫下一句你想帶走的學習">
      <div className="mb-6">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="例如：我要學會主動詢問代名詞，不做任何假設..."
          className="w-full px-4 py-3 rounded-xl border-2 border-pink-300 focus:border-pink-500 focus:outline-none resize-none"
          rows="4"
        />
        <button
          onClick={add}
          disabled={!msg.trim()}
          className="w-full mt-3 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
        >
          送出我的反思 💭
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span>🌟</span> 其他人的反思
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
          {list.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">還沒有人留言，成為第一個吧！</p>
          ) : (
            list.map((l) => (
              <div key={l.id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                <p className="text-sm font-semibold text-pink-700 mb-1">{l.by}</p>
                <p className="text-slate-700">{l.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </StageContainer>
  );
}
