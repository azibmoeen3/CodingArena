import mongoose from "mongoose";
import { submissionVerdicts } from "@/lib/submission";

const testResultSchema = new mongoose.Schema(
  {
    index: Number,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    status: String,
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  problemId: {
    type: String,
    required: true,
    index: true,
  },
  problemTitle: String,
  language: {
    type: String,
    required: true,
  },
  languageId: Number,
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(submissionVerdicts),
    default: submissionVerdicts.PROCESSING,
    index: true,
  },
  verdict: {
    type: String,
    enum: Object.values(submissionVerdicts),
    default: submissionVerdicts.PROCESSING,
  },
  runtime: Number,
  memory: Number,
  sourceToken: String,
  judgeToken: String,
  stdin: String,
  expectedOutput: String,
  output: String,
  stdout: String,
  stderr: String,
  compileOutput: String,
  passedCount: {
    type: Number,
    default: 0,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  testResults: {
    type: [testResultSchema],
    default: [],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  finishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for faster queries
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ userId: 1, problemId: 1, status: 1 });
submissionSchema.index({ judgeToken: 1 });

// Prevent duplicate model initialization
export const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
