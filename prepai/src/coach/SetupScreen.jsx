const SetupScreen = ({
  topic,
  setTopic,
  topics,
  startSession,
  loading,
}) => {
  return (
    <div className="min-h-screen bg-[#050810] p-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        
        {/* 🔷 Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <span className="text-2xl font-black text-black">AI</span>
          </div>

          <h1 className="text-3xl font-black text-white">
            Communication Coach
          </h1>

          <p className="text-slate-500 text-sm mt-2">
            Your personal AI coach for interviews and English
          </p>
        </div>

        {/* 🔷 Main Card */}
        <div className="bg-[#0d1117] border border-slate-800 rounded-3xl p-6">
          
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
            Choose Focus Area
          </p>

          {/* 🔷 Topics */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all
                  ${
                    topic === t.id
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-800 bg-[#050810] text-slate-400 hover:border-slate-600"
                  }`}
              >
                <span>{t.icon}</span>
                <span className="font-medium text-xs">{t.label}</span>
              </button>
            ))}
          </div>

          {/* 🔷 Features */}
          <div className="bg-[#050810] border border-slate-800 rounded-xl p-4 mb-6 space-y-2">
            {[
              "Chat naturally like ChatGPT",
              "Get grammar corrections instantly",
              "Practice interview questions",
              "Voice input supported",
              "Session summary at the end",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-slate-400"
              >
                <span className="text-cyan-500">✓</span>
                {item}
              </div>
            ))}
          </div>

          {/* 🔷 Start Button */}
          <button
            onClick={startSession}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Coaching Session →"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default SetupScreen;