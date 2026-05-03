import { NextResponse } from "next/server";
import { getProblemByIdentifier } from "@/services/problemService";
import { problems } from "@/lib/problems";

export async function GET(request, { params }) {
  try {
    const { problemId } = await params;
    
    try {
      const problem = await getProblemByIdentifier(problemId);

      if (!problem) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 });
      }

      return NextResponse.json(problem);
    } catch (dbError) {
      // Fallback to static problems when database is unavailable
      console.warn("Database unavailable, using fallback problem data");
      const numId = Number.parseInt(problemId, 10);
      const fallbackProblem = problems.find(
        (p) => p.id === numId || p.title.toLowerCase().includes(String(problemId).toLowerCase())
      );

      if (!fallbackProblem) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 });
      }

      return NextResponse.json(fallbackProblem);
    }
  } catch (error) {
    console.error("Error in GET /api/problems/[problemId]:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}
