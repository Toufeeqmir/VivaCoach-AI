import InterviewHeader from "./Header";
import SetupStep from "./SetupStep";
import QuestionStep from "./QuestionStep";
import ResultStep from "./ResultStep";
import FinalStep from "./FinalStep";

const InterviewUI = ({ state, actions, refs }) => (
  <div className="min-h-screen bg-[var(--bg-primary)] text-slate-200 p-6 font-sans">
    <InterviewHeader state={state} actions={actions} />

    {state.step === "setup" && <SetupStep state={state} actions={actions} refs={refs} />}
    {state.step === "question" && <QuestionStep state={state} actions={actions} refs={refs} />}
    {state.step === "live" && <QuestionStep state={state} actions={actions} refs={refs} live />}
    {state.step === "result" && <ResultStep state={state} actions={actions} refs={refs} />}
    {state.step === "final" && <FinalStep state={state} />}
  </div>
);

export default InterviewUI;
