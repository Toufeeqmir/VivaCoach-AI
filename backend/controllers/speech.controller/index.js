const { correctText } = require("./correct");
const { transcribeAudio } = require("./transcribe");
const { getSessionTranscripts } = require("./transcripts");

module.exports = { correctText, transcribeAudio, getSessionTranscripts };

