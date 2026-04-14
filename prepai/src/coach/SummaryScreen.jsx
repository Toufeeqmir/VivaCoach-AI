const SummaryScreen = ({
  summary,
  scoreColor,
  setStep,
  setMessages,
  setSummary,
  setSessionDuration,
}) => {
  return (
    <div className="min-h-screen bg-[#050810] p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* 🔷 Overall Score Card */}
        <div className="bg-[#0d1117] border border-cyan-500/20 rounded-3xl p-8 text-center mb-6">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">
            Session Complete
          </p>

          <div
            className={`text-7xl font-black mb-2 ${scoreColor(
              summary.summary.overallScore
            )}`}
          >
            {summary.summary.overallScore}
          </div>

          <p className="text-slate-400 text-sm">Overall Score</p>

          <p className="text-slate-400 text-sm leading-relaxed mt-4 max-w-md mx-auto">
            {summary.summary.summary}
          </p>
        </div>

        {/* 🔷 Score Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Communication",
              value: summary.summary.communicationScore,
              color: "text-cyan-400",
            },
            {
              label: "Confidence",
              value: summary.summary.confidenceScore,
              color: "text-yellow-400",
            },
            {
              label: "Clarity",
              value: summary.summary.clarityScore,
              color: "text-emerald-400",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-[#0d1117] border border-slate-800 rounded-2xl p-4 text-center"
            >
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="text-slate-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* 🔷 Multimodal Score */}
        {summary?.stats?.multimodalScore != null && (
          <div className="bg-[#0d1117] border border-cyan-500/20 rounded-2xl p-5 mb-6">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              Multimodal Analysis (Speech + Emotion)
            </p>
            <div className="flex items-end justify-between">
              <div>
                <div className={`text-4xl font-black ${scoreColor(summary.stats.multimodalScore)}`}>
                  {summary.stats.multimodalScore}
                </div>
                <p className="text-slate-500 text-xs">Combined sentiment score</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Speech sentiment: {summary.stats.speechSentimentScore ?? 0}</p>
                <p>Emotion confidence: {summary.stats.confidenceScore ?? 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* 🔷 Communication Behavior + Emotion Stability */}
        {summary?.stats && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 mb-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              Communication Behavior
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#050810] border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Pressure</p>
                <p className={`text-2xl font-black ${scoreColor(100 - (summary.stats.pressureScore || 0))}`}>
                  {summary.stats.pressureScore ?? 0}
                </p>
              </div>
              <div className="bg-[#050810] border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Emotion Shifts</p>
                <p className="text-2xl font-black text-cyan-400">
                  {summary.stats.emotionSwitchCount ?? 0}
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {summary.stats.communicationBehavior || "Behavior analysis unavailable."}
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Dominant emotion: <span className="text-slate-300 capitalize">{summary.stats.dominantEmotion || "neutral"}</span>
              {" • "}
              {summary.stats.frequentEmotionChanges ? "Emotion changed frequently during coaching." : "Emotion remained mostly stable during coaching."}
            </p>
          </div>
        )}

        {/* 🔷 Strengths & Improvements */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          
          {/* Strengths */}
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              Strengths
            </h3>

            {summary.summary.topStrengths?.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-slate-400 py-1"
              >
                <span className="text-emerald-400">✓</span>
                {s}
              </div>
            ))}
          </div>

          {/* Improvements */}
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-3">
              Improve
            </h3>

            {summary.summary.topImprovements?.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-slate-400 py-1"
              >
                <span className="text-yellow-400">→</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* 🔷 Next Steps */}
        {summary.summary.nextSteps && (
          <div className="bg-[#0d1117] border border-cyan-500/20 rounded-2xl p-5 mb-6">
            <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              Next Steps
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {summary.summary.nextSteps}
            </p>
          </div>
        )}

        {/* 🔷 Buttons */}
        <div className="flex gap-3">
          
          {/* Practice Again */}
          <button
            onClick={() => {
              setStep("setup");
              setMessages([]);
              setSummary(null);
              setSessionDuration(0);
            }}
            className="flex-1 bg-cyan-500 text-black font-bold py-4 rounded-2xl hover:bg-cyan-400 transition-all"
          >
            Practice Again
          </button>

          {/* Try Interview */}
          <button
            onClick={() => (window.location.href = "/interview")}
            className="flex-1 bg-[#0d1117] border border-slate-800 text-white font-bold py-4 rounded-2xl hover:border-slate-600 transition-all"
          >
            Try Interview
          </button>

        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;