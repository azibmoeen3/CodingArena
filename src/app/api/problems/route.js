import { NextResponse } from "next/server";
import { getProblemCategories, getProblems, slugify } from "@/services/problemService";



export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty") || "all";
    const category = searchParams.get("category") || "all";
    const includeMeta = searchParams.get("includeMeta") === "true";

    let dbProblems = [];
    let dbCategories = [];

    try {
      const result = await Promise.all([
        getProblems({ search, difficulty, category }),
        includeMeta ? getProblemCategories() : Promise.resolve([]),
      ]);
      dbProblems = result[0];
      dbCategories = result[1];
    } catch (dbError) {
      console.warn("Database unavailable, using fallback data:", dbError.message);
      // Use fallback data when MongoDB is unavailable
      const { problems: fallbackProblems } = require("@/lib/problems");
      dbProblems = fallbackProblems.map(p => ({
        ...p,
        slug: p.slug || slugify(p.title)
      }));
      dbCategories = [...new Set(dbProblems.map(p => p.category))];
      
      if (difficulty !== "all") dbProblems = dbProblems.filter(p => p.difficulty === difficulty);
      if (category !== "all") dbProblems = dbProblems.filter(p => p.category === category);
      if (search) dbProblems = dbProblems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    }

    return NextResponse.json({
      problems: dbProblems,
      categories: dbCategories,
      total: dbProblems.length,
    });
  } catch (error) {
    console.error("Error in GET /api/problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
