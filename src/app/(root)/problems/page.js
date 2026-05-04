import Link from "next/link";
import { getProblems, getProblemCategories } from "@/services/problemService";
import ProblemFilters from "@/components/ProblemFilters";
import SolvedStatus from "@/components/SolvedStatus";
import UserStats from "@/components/UserStats";
import {
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const search = params.search || "";
  const difficulty = params.difficulty || "all";
  const category = params.category || "all";
  const sortField = params.sort || "id";
  const sortDirection = params.dir || "asc";

  // Fetch problems and categories in parallel on the server
  const [problems, categories] = await Promise.all([
    getProblems({ search, difficulty, category }),
    getProblemCategories(),
  ]);

  // Server-side sorting
  const sortedProblems = [...problems].sort((a, b) => {
    let cA, cB;
    switch (sortField) {
      case "acceptance":
        cA = parseFloat(a.acceptance || "0");
        cB = parseFloat(b.acceptance || "0");
        break;
      case "title":
        return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      default:
        cA = a.id;
        cB = b.id;
    }
    return sortDirection === "asc" ? cA - cB : cB - cA;
  });

  const getDifficultyClass = (d) => {
    if (d === "Easy") return "bg-difficulty-easy";
    if (d === "Medium") return "bg-difficulty-medium";
    return "bg-difficulty-hard";
  };

  const toggleSortUrl = (field) => {
    const newDir = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    const newParams = new URLSearchParams(params);
    newParams.set("sort", field);
    newParams.set("dir", newDir);
    return `?${newParams.toString()}`;
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <UserStats />
            
            {/* Quick Difficulty Filter */}
            <div className="glass-card rounded-xl p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Filter</h4>
              <div className="flex flex-wrap gap-2">
                {["all", "Easy", "Medium", "Hard"].map((d) => {
                  const active = difficulty === d;
                  const newParams = new URLSearchParams(params);
                  if (d === "all") newParams.delete("difficulty");
                  else newParams.set("difficulty", d);
                  
                  return (
                    <Link
                      key={d}
                      href={`?${newParams.toString()}`}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        active
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
                      }`}
                    >
                      {d === "all" ? "All" : d}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl overflow-hidden">
              <ProblemFilters 
                categories={categories} 
                currentFilters={{ search, difficulty, category }} 
              />

              {/* Table Header */}
              <div className="hidden md:grid grid-cols-[50px_32px_1fr_100px_100px_80px] items-center px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/30 bg-secondary/20">
                <Link href={toggleSortUrl("id")} className="cursor-pointer flex items-center gap-1">
                  # <SortIcon field="id" />
                </Link>
                <div></div>
                <Link href={toggleSortUrl("title")} className="cursor-pointer flex items-center gap-1">
                  Title <SortIcon field="title" />
                </Link>
                <div className="text-center">Difficulty</div>
                <Link href={toggleSortUrl("acceptance")} className="cursor-pointer flex items-center justify-center gap-1">
                  Acceptance <SortIcon field="acceptance" />
                </Link>
                <div />
              </div>

              {/* Problem Rows */}
              <div className="divide-y divide-border/20">
                {sortedProblems.length === 0 ? (
                  <div className="flex justify-center items-center py-20 text-muted-foreground">
                    No problems match your filters.
                  </div>
                ) : (
                  sortedProblems.map((problem, idx) => (
                    <Link
                      key={problem.id}
                      href={`/problem/${problem.slug}`}
                      className={`grid grid-cols-1 md:grid-cols-[50px_32px_1fr_100px_100px_80px] items-center px-5 py-3.5 transition-colors hover:bg-secondary/30 group ${
                        idx % 2 === 0 ? "" : "bg-secondary/5"
                      }`}
                    >
                      <div className="hidden md:block text-sm text-muted-foreground">{problem.id}</div>
                      
                      <div className="hidden md:flex justify-center">
                        <SolvedStatus problemId={problem.id} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 md:hidden mb-1">
                          <span className="text-xs text-muted-foreground">#{problem.id}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getDifficultyClass(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {problem.title}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground hidden md:inline">
                          {problem.category}
                        </span>
                      </div>

                      <div className="hidden md:flex justify-center">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getDifficultyClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>

                      <div className="hidden md:block text-center text-sm text-muted-foreground">
                        {problem.acceptance}
                      </div>

                      <div className="hidden md:flex justify-end">
                        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Solve →
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

