import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: String,
    output: String,
    explanation: String,
  },
  { _id: false }
);

const starterCodeSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    judge0Id: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    sampleInput: {
      type: String,
      default: "",
    },
    sampleOutput: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      default: "",
    },
    expectedOutput: {
      type: String,
      default: "",
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    explanation: String,
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    legacyId: {
      type: Number,
      index: true,
      unique: true,
      sparse: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    tags: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    examples: {
      type: [exampleSchema],
      default: [],
    },
    constraints: {
      type: [String],
      default: [],
    },
    hints: {
      type: [String],
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
    },
    starterCodes: {
      type: [starterCodeSchema],
      default: [],
    },
    testCasesSource: {
      type: String,
      default: "",
    },
    testCases: {
      type: [testCaseSchema],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    companies: {
      type: [String],
      default: [],
    },
    visibleTestCaseCount: {
      type: Number,
      default: 0,
    },
    hiddenTestCaseCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);

problemSchema.index({ difficulty: 1, category: 1 });
problemSchema.index({ title: "text", description: "text", category: "text", tags: "text" });

export const Problem =
  mongoose.models.Problem || mongoose.model("Problem", problemSchema);
