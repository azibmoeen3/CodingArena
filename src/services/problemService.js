import { connectToDatabase } from "@/lib/mongodb";
import { Problem } from "@/models/problem";

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProblem(problemDoc) {
  const problem = JSON.parse(JSON.stringify(problemDoc));

  return {
    ...problem,
    id: problem.legacyId || problem._id,
    slug: problem.slug || slugify(problem.title),
    acceptance: `${problem.acceptanceRate.toFixed(1)}%`,
    languages: problem.starterCodes.map(({ language, label, judge0Id }) => ({
      value: language,
      label,
      id: judge0Id,
    })),
    initialCode: Object.fromEntries(
      problem.starterCodes.map(({ language, code }) => [language, code])
    ),
    standardInput: Object.fromEntries(
      problem.starterCodes.map(({ language, sampleInput }) => [language, sampleInput])
    ),
    expectedOutput: Object.fromEntries(
      problem.starterCodes.map(({ language, sampleOutput }) => [
        language,
        sampleOutput,
      ])
    ),
  };
}

export async function getProblems(filters = {}) {
  await connectToDatabase();

  const query = { isPublished: true };

  if (filters.difficulty && filters.difficulty !== "all") {
    query.difficulty = filters.difficulty;
  }

  if (filters.category && filters.category !== "all") {
    query.category = filters.category;
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { category: { $regex: filters.search, $options: "i" } },
      { tags: { $elemMatch: { $regex: filters.search, $options: "i" } } },
    ];
  }

  const problemsList = await Problem.find(query).sort({ order: 1, legacyId: 1 });
  return problemsList.map(normalizeProblem);
}

export async function getProblemByIdentifier(identifier) {
  await connectToDatabase();

  const numericId = Number.parseInt(identifier, 10);
  const query = Number.isNaN(numericId)
    ? { slug: identifier, isPublished: true }
    : {
        $or: [{ legacyId: numericId }, { slug: identifier }],
        isPublished: true,
      };

  const problem = await Problem.findOne(query);
  return problem ? normalizeProblem(problem) : null;
}

export async function getProblemCategories() {
  await connectToDatabase();
  return Problem.distinct("category", { isPublished: true });
}
