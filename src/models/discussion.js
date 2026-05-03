import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorImage: {
      type: String,
    },
    category: {
      type: String,
      default: "General",
      enum: ["General", "Discussion", "Interview Prep", "Help Request", "Solutions"],
    },
    likes: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        authorId: String,
        authorName: String,
        authorImage: String,
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Discussion = mongoose.models.Discussion || mongoose.model("Discussion", discussionSchema);
