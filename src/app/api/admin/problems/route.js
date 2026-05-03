import { connectToDatabase } from "@/lib/mongodb";
import { Problem } from "@/models/problem";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET — List all problems (including unpublished) for admin
export async function GET() {
  try {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (userEmail !== "azibmaher771@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const problems = await Problem.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

// POST — Create a new problem
export async function POST(request) {
  try {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (userEmail !== "azibmaher771@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.difficulty || !body.description) {
      return NextResponse.json(
        { error: "Title, difficulty, and description are required" },
        { status: 400 }
      );
    }

    if (!["Easy", "Medium", "Hard"].includes(body.difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be Easy, Medium, or Hard" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = slugify(body.title);

    // Check for duplicate slug
    const existing = await Problem.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: `A problem with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    // Get max order for new problem
    const maxOrderDoc = await Problem.findOne({}).sort({ order: -1 }).lean();
    const nextOrder = (maxOrderDoc?.order || 0) + 1;

    // Build starter codes array from the provided language codes
    const starterCodes = [];
    const languageMap = {
      javascript: { label: "JavaScript", judge0Id: 63 },
      python: { label: "Python", judge0Id: 71 },
      cpp: { label: "C++", judge0Id: 54 },
      java: { label: "Java", judge0Id: 62 },
    };

    if (body.starterCodes && typeof body.starterCodes === "object") {
      for (const [lang, code] of Object.entries(body.starterCodes)) {
        if (code && code.trim() && languageMap[lang]) {
          starterCodes.push({
            language: lang,
            label: languageMap[lang].label,
            judge0Id: languageMap[lang].judge0Id,
            code: code.trim(),
            sampleInput: body.sampleInputs?.[lang] || "",
            sampleOutput: body.sampleOutputs?.[lang] || "",
          });
        }
      }
    }

    // Build test cases
    const testCases = (body.testCases || []).map((tc) => ({
      input: tc.input || "",
      expectedOutput: tc.expectedOutput || "",
      isHidden: tc.isHidden || false,
      explanation: tc.explanation || "",
    }));

    const problemData = {
      slug,
      title: body.title.trim(),
      difficulty: body.difficulty,
      category: body.category || "General",
      tags: body.tags || [],
      description: body.description.trim(),
      examples: body.examples || [],
      constraints: body.constraints || [],
      hints: body.hints || [],
      likes: 0,
      dislikes: 0,
      acceptanceRate: 0,
      starterCodes,
      testCasesSource: body.testCasesSource || "",
      testCases,
      isPublished: body.isPublished !== false,
      order: nextOrder,
      companies: body.companies || [],
      visibleTestCaseCount: testCases.filter((tc) => !tc.isHidden).length,
      hiddenTestCaseCount: testCases.filter((tc) => tc.isHidden).length,
    };

    const problem = await Problem.create(problemData);

    return NextResponse.json(
      { success: true, problem: problem.toObject() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create problem" },
      { status: 500 }
    );
  }
}

// PUT — Update an existing problem
export async function PUT(request) {
  try {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (userEmail !== "azibmaher771@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json(
        { error: "Problem _id is required for updates" },
        { status: 400 }
      );
    }

    const existing = await Problem.findById(body._id);
    if (!existing) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // If title changed, update slug
    if (body.title && body.title !== existing.title) {
      const newSlug = slugify(body.title);
      const slugConflict = await Problem.findOne({
        slug: newSlug,
        _id: { $ne: body._id },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: `A problem with slug "${newSlug}" already exists` },
          { status: 409 }
        );
      }
      body.slug = newSlug;
    }

    // Rebuild starter codes if provided
    if (body.starterCodes && typeof body.starterCodes === "object" && !Array.isArray(body.starterCodes)) {
      const languageMap = {
        javascript: { label: "JavaScript", judge0Id: 63 },
        python: { label: "Python", judge0Id: 71 },
        cpp: { label: "C++", judge0Id: 54 },
        java: { label: "Java", judge0Id: 62 },
      };

      const starterCodesArray = [];
      for (const [lang, code] of Object.entries(body.starterCodes)) {
        if (code && code.trim() && languageMap[lang]) {
          starterCodesArray.push({
            language: lang,
            label: languageMap[lang].label,
            judge0Id: languageMap[lang].judge0Id,
            code: code.trim(),
            sampleInput: body.sampleInputs?.[lang] || "",
            sampleOutput: body.sampleOutputs?.[lang] || "",
          });
        }
      }
      body.starterCodes = starterCodesArray;
    }

    body.updatedAt = new Date();

    const updated = await Problem.findByIdAndUpdate(body._id, body, {
      new: true,
    });

    return NextResponse.json({ success: true, problem: updated.toObject() });
  } catch (error) {
    console.error("Admin PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update problem" },
      { status: 500 }
    );
  }
}

// DELETE — Delete a problem
export async function DELETE(request) {
  try {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (userEmail !== "azibmaher771@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Problem id is required" },
        { status: 400 }
      );
    }

    const deleted = await Problem.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Problem deleted" });
  } catch (error) {
    console.error("Admin DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete problem" },
      { status: 500 }
    );
  }
}
