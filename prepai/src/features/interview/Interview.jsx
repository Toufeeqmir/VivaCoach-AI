import InterviewUI from "../InterviewUI";
import { useLocation } from "react-router-dom";
import { useInterviewController } from "./useInterviewController";

const Interview = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const modeParam = params.get("mode");
  const initialMode = modeParam === "live" ? "live" : modeParam === "practice" ? "practice" : undefined;

  const { state, actions, refs } = useInterviewController({ initialMode });
  return <InterviewUI state={state} actions={actions} refs={refs} />;
};

export default Interview;

