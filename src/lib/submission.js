export const submissionVerdicts = {
  PROCESSING: "Processing",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  RUNTIME_ERROR: "Runtime Error",
  COMPILATION_ERROR: "Compilation Error",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
  OUTPUT_LIMIT_EXCEEDED: "Output Limit Exceeded",
  INTERNAL_ERROR: "Internal Error",
};

export const finalVerdicts = new Set([
  submissionVerdicts.ACCEPTED,
  submissionVerdicts.WRONG_ANSWER,
  submissionVerdicts.TIME_LIMIT_EXCEEDED,
  submissionVerdicts.RUNTIME_ERROR,
  submissionVerdicts.COMPILATION_ERROR,
  submissionVerdicts.MEMORY_LIMIT_EXCEEDED,
  submissionVerdicts.OUTPUT_LIMIT_EXCEEDED,
  submissionVerdicts.INTERNAL_ERROR,
]);

export function getVerdictFromJudge0(statusId, statusDescription = "") {
  switch (statusId) {
    case 1:
    case 2:
      return submissionVerdicts.PROCESSING;
    case 3:
      return submissionVerdicts.ACCEPTED;
    case 4:
      return submissionVerdicts.WRONG_ANSWER;
    case 5:
      return submissionVerdicts.TIME_LIMIT_EXCEEDED;
    case 6:
      return submissionVerdicts.COMPILATION_ERROR;
    case 7:
    case 8:
    case 9:
    case 10:
    case 12:
    case 13:
      return submissionVerdicts.RUNTIME_ERROR;
    case 11:
      return submissionVerdicts.INTERNAL_ERROR;
    case 14:
      return submissionVerdicts.INTERNAL_ERROR;
    default:
      if (/memory/i.test(statusDescription)) {
        return submissionVerdicts.MEMORY_LIMIT_EXCEEDED;
      }
      if (/output/i.test(statusDescription)) {
        return submissionVerdicts.OUTPUT_LIMIT_EXCEEDED;
      }
      return submissionVerdicts.INTERNAL_ERROR;
  }
}

export function getResultStatusTone(verdict) {
  switch (verdict) {
    case submissionVerdicts.ACCEPTED:
      return "accepted";
    case submissionVerdicts.WRONG_ANSWER:
      return "wrong-answer";
    case submissionVerdicts.TIME_LIMIT_EXCEEDED:
      return "time-limit";
    case submissionVerdicts.COMPILATION_ERROR:
      return "compile-error";
    case submissionVerdicts.RUNTIME_ERROR:
    case submissionVerdicts.MEMORY_LIMIT_EXCEEDED:
    case submissionVerdicts.OUTPUT_LIMIT_EXCEEDED:
    case submissionVerdicts.INTERNAL_ERROR:
      return "error";
    default:
      return "processing";
  }
}
