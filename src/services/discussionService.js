import { connectToDatabase } from "@/lib/mongodb";
import { Discussion } from "@/models/discussion";

export async function getDiscussions(category = "all") {
  try {
    await connectToDatabase();
    const query = category && category !== "all" ? { category } : {};
    const discussions = await Discussion.find(query).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(discussions));
  } catch (error) {
    console.error("Error getting discussions:", error);
    throw error;
  }
}

export async function getDiscussionById(id) {
  try {
    await connectToDatabase();
    const discussion = await Discussion.findById(id);
    return discussion ? JSON.parse(JSON.stringify(discussion)) : null;
  } catch (error) {
    console.error("Error getting discussion by id:", error);
    throw error;
  }
}
