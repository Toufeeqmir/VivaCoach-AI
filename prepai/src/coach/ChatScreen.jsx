const emotionColors = {
  happy: "text-yellow-400",
  neutral: "text-slate-400",
  sad: "text-blue-400",
  angry: "text-red-400",
  fear: "text-purple-400",
  disgust: "text-emerald-400",
  surprise: "text-orange-400",
};

const ChatScreen = ({
  messages,
  input,
  setInput,
  sendMessage,
  loading,
  isListening,
  startListening,
  stopListening,
  endSession,
  handleKeyDown,
  formatTime,
  sessionDuration,
  chatEndRef,
  videoRef,
  canvasRef,
  emotionSummary,
  currentEmotion,
  cameraReady,
}) => {
  const totalEmotionFrames = Object.values(emotionSummary || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="app-page">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)] lg:col-span-8">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Coach Session</p>
              <p className="text-xs text-slate-500">Duration: {formatTime(sessionDuration)}</p>
            </div>
            <button
              onClick={endSession}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 hover:bg-red-500/20 transition-all"
            >
              End Session
            </button>
          </div>

          <div className="h-[58vh] space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "ml-auto border border-[var(--blue-border)] bg-[var(--blue-tint)] text-[var(--text-primary)]"
                    : "border border-[var(--border)] bg-[var(--bg-secondary)] text-slate-200"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-[#050810] border border-slate-800 text-slate-400">
                Coach is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-[var(--border)] p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply..."
              className="ui-input min-h-[90px] resize-none"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-slate-900 text-slate-300 border border-slate-700"
                }`}
              >
                {isListening ? "Stop Mic" : "Use Voice"}
              </button>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="ui-btn-primary text-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-[10px] border border-[var(--border-strong)] bg-black">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            <canvas ref={canvasRef} className="hidden" />
            {currentEmotion && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-lg border border-white/10 bg-black/70">
                <span className={`text-[10px] font-black uppercase ${emotionColors[currentEmotion]}`}>
                  {currentEmotion}
                </span>
              </div>
            )}
          </div>
          <div className="section-card">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">
              Facial Signal {cameraReady ? "• Active" : "• Off"}
            </p>
            {Object.entries(emotionSummary || {}).map(([key, count]) => {
              const pct = totalEmotionFrames > 0 ? Math.round((count / totalEmotionFrames) * 100) : 0;
              return (
                <div key={key} className="mb-2">
                  <div className="flex justify-between text-[10px] text-slate-400 uppercase">
                    <span>{key}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
