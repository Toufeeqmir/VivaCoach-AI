import { useCoachLogic } from "./useCoachLogic";
import SetupScreen from "./SetupScreen";
import ChatScreen from "./ChatScreen";
import SummaryScreen from "./SummaryScreen";

const Coach = () => {
  const coach = useCoachLogic();

  if (coach.step === "setup") return <SetupScreen {...coach} />;
  if (coach.step === "summary" && coach.summary) return <SummaryScreen {...coach} />;

  return <ChatScreen {...coach} />;
};

export default Coach;