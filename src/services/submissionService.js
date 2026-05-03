import { connectToDatabase } from "@/lib/mongodb";
import { Submission } from "@/models/submission";
import { submissionVerdicts } from "@/lib/submission";

export async function createSubmission(submissionData) {
  try {
    await connectToDatabase();

    const submission = new Submission({
      userId: submissionData.userId,
      problemId: String(submissionData.problemId),
      problemTitle: submissionData.problemTitle,
      language: submissionData.language,
      languageId: submissionData.languageId,
      code: submissionData.code,
      status: submissionVerdicts.PROCESSING,
      verdict: submissionVerdicts.PROCESSING,
      sourceToken: submissionData.sourceToken,
      judgeToken: submissionData.judgeToken || submissionData.sourceToken,
      stdin: submissionData.stdin || "",
      expectedOutput: submissionData.expectedOutput || "",
      output: "",
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await submission.save();
    return JSON.parse(JSON.stringify(submission));
  } catch (error) {
    console.error("Error creating submission:", error);
    throw error;
  }
}

export async function updateSubmissionStatus(
  submissionId,
  status,
  results = {}
) {
  try {
    await connectToDatabase();

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return null;
    }

    submission.status = status;
    submission.verdict = status;
    submission.runtime = results.runtime;
    submission.memory = results.memory;
    submission.output = results.output;
    submission.stdout = results.stdout;
    submission.stderr = results.stderr;
    submission.compileOutput = results.compileOutput;
    submission.passedCount = results.passedCount ?? submission.passedCount;
    submission.totalCount = results.totalCount ?? submission.totalCount;
    submission.testResults = results.testResults ?? submission.testResults;
    submission.finishedAt = results.finishedAt || new Date();
    submission.updatedAt = new Date();

    await submission.save();
    return JSON.parse(JSON.stringify(submission));
  } catch (error) {
    console.error("Error updating submission status:", error);
    throw error;
  }
}

export async function getUserSubmissions(userId) {
  try {
    await connectToDatabase();
    const submissions = await Submission.find({ userId })
      .sort({ createdAt: -1 }) // Latest submissions first
      .limit(100); // Limit to avoid performance issues

    return JSON.parse(JSON.stringify(submissions));
  } catch (error) {
    console.error("Error getting user submissions:", error);
    throw error;
  }
}

export async function getSubmissionById(id) {
  try {
    await connectToDatabase();
    const submission = await Submission.findById(id);
    return submission ? JSON.parse(JSON.stringify(submission)) : null;
  } catch (error) {
    console.error("Error getting submission:", error);
    throw error;
  }
}

export async function getSubmissionsByProblem(userId, problemId) {
  try {
    await connectToDatabase();
    const submissions = await Submission.find({
      userId,
      problemId: String(problemId),
    }).sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(submissions));
  } catch (error) {
    console.error("Error getting problem submissions:", error);
    throw error;
  }
}

export async function updateSubmissionByJudgeToken(judgeToken, status, results = {}) {
  try {
    await connectToDatabase();

    const submission = await Submission.findOne({
      $or: [{ judgeToken }, { sourceToken: judgeToken }],
    });

    if (!submission) {
      return null;
    }

    submission.status = status;
    submission.verdict = status;
    submission.runtime = results.runtime ?? submission.runtime;
    submission.memory = results.memory ?? submission.memory;
    submission.output = results.output ?? submission.output;
    submission.stdout = results.stdout ?? submission.stdout;
    submission.stderr = results.stderr ?? submission.stderr;
    submission.compileOutput = results.compileOutput ?? submission.compileOutput;
    submission.passedCount = results.passedCount ?? submission.passedCount;
    submission.totalCount = results.totalCount ?? submission.totalCount;
    submission.testResults = results.testResults ?? submission.testResults;
    submission.finishedAt = results.finishedAt || new Date();
    submission.updatedAt = new Date();

    await submission.save();
    return JSON.parse(JSON.stringify(submission));
  } catch (error) {
    console.error("Error updating submission by judge token:", error);
    throw error;
  }
}
