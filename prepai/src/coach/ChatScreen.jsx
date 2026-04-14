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
    <div className="min-h-screen bg-[#050810] p-6 text-slate-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
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

          <div className="h-[58vh] overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-cyan-500/15 border border-cyan-500/25 text-cyan-100"
                    : "bg-[#050810] border border-slate-800 text-slate-200"
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

          <div className="p-4 border-t border-slate-800">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply..."
              className="w-full rounded-2xl bg-[#050810] border border-slate-800 px-4 py-3 text-sm text-slate-200 min-h-[90px] focus:outline-none focus:border-cyan-500/40"
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-black rounded-3xl overflow-hidden border border-slate-800 relative aspect-square">
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
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-4">
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