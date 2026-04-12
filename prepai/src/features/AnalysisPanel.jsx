/**
 * prepai/src/features/AnalysisPanel.jsx
 *
 * Purpose
 * - Shows the live camera preview and a simple emotion distribution summary.
 * - Used by Interview Mode to help users see what the emotion model is detecting.
 *
 * Notes
 * - `emotionSummary` is expected to be a cumulative count map:
 *   `{ happy: number, neutral: number, ... }`
 * - Percentages are computed client-side from counts.
 */

const emotionColors = { happy: "text-yellow-400", neutral: "text-slate-400", sad: "text-blue-400", angry: "text-red-400", fear: "text-purple-400", disgust: "text-emerald-400", surprise: "text-orange-400" };
const emotionBg = { happy: "bg-yellow-400", neutral: "bg-slate-400", sad: "bg-blue-400", angry: "bg-red-400", fear: "bg-purple-400", disgust: "bg-emerald-400", surprise: "bg-orange-400" };

/**
 * Camera + emotion analysis visualization panel.
 * @param {{
 *  videoRef: any,
 *  canvasRef: any,
 *  cameraReady?: boolean,
 *  currentEmotion?: string | null,
 *  emotionSummary: Record<string, number>
 * }} props
 * @returns {JSX.Element}
 */
const AnalysisPanel = ({ videoRef, canvasRef, cameraReady, currentEmotion, emotionSummary }) => (
  <div className="space-y-4">
    <div className="bg-black rounded-3xl overflow-hidden border border-slate-800 relative aspect-square">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
      <canvas ref={canvasRef} className="hidden" />
      {currentEmotion && (
        <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 rounded-lg border border-white/10">
          <span className={`text-[10px] font-black uppercase ${emotionColors[currentEmotion]}`}>{currentEmotion}</span>
        </div>
      )}
    </div>
    <div className="bg-[#0d1117] border border-slate-800 p-5 rounded-2xl">
      {Object.entries(emotionSummary).map(([em, count]) => {
        const total = Object.values(emotionSummary).reduce((a, b) => a + b, 0);
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={em} className="mb-3">
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase"><span>{em}</span><span>{Math.round(pct)}%</span></div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${emotionBg[em]}`} style={{ width: `${pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  </div>
);

export default AnalysisPanel;