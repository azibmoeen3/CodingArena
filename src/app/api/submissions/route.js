import {
  getUserSubmissions,
  getSubmissionsByProblem,
} from "@/services/submissionService";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get userId from the query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const problemId = searchParams.get("problemId");

    // Only allow users to access their own data (or implement admin check)
    if (authUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let submissions;

    // Get submissions filtered by problem if problemId is provided
    if (problemId) {
      submissions = await getSubmissionsByProblem(userId, problemId);
    } else {
      // Get all user submissions
      submissions = await getUserSubmissions(userId);
    }

    // Return the submission data
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error in GET /api/submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
