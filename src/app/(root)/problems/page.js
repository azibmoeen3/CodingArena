"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserStats from "@/components/UserStats";
import { useAppContext } from "@/lib/context";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";

export default function Home() {
  const { userSubmissions } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchProblems = async () => {
      setLoadingProblems(true);
      setLoadError("");
      try {
        const response = await fetch("/api/problems?includeMeta=true");
        if (!response.ok) throw new Error("Failed to load problems");
        const data = await response.json();
        if (isMounted) {
          setProblems(data.problems || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error loading problems:", error);
        if (isMounted) setLoadError("Unable to load problems right now.");
      } finally {
        if (isMounted) setLoadingProblems(false);
      }
    };
    fetchProblems();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let result = [...problems];
    const solvedIds = new Set(
      userSubmissions
        .filter((s) => s.status === "Accepted")
        .map((s) => String(s.problemId))
    );

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (difficulty !== "all") result = result.filter((p) => p.difficulty === difficulty);
    if (category !== "all") result = result.filter((p) => p.category === category);

    result.sort((a, b) => {
      let cA, cB;
      switch (sortField) {
        case "acceptance":
          cA = parseFloat(a.acceptance || "0");
          cB = parseFloat(b.acceptance || "0");
          break;
        case "title":
          return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        case "solved":
          cA = solvedIds.has(String(a.id)) ? 1 : 0;
          cB = solvedIds.has(String(b.id)) ? 1 : 0;
          break;
        default:
          cA = a.id;
          cB = b.id;
      }
      return sortDirection === "asc" ? cA - cB : cB - cA;
    });

    setFilteredProblems(result);
  }, [searchQuery, difficulty, category, sortField, sortDirection, problems, userSubmissions]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
  };

  const getDifficultyClass = (d) => {
    if (d === "Easy") return "bg-difficulty-easy";
    if (d === "Medium") return "bg-difficulty-medium";
    return "bg-difficulty-hard";
  };

  const solvedIds = new Set(
    userSubmissions.filter((s) => s.status === "Accepted").map((s) => String(s.problemId))
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <UserStats />
            {/* Category quick filters */}
            <div className="glass-card rounded-xl p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Difficulty</h4>
              <div className="flex flex-wrap gap-2">
                {["all", "Easy", "Medium", "Hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      difficulty === d
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    {d === "all" ? "All" : d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-border/50">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <h1 className="text-xl font-bold text-foreground">
                    Problems
                    {!loadingProblems && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({filteredProblems.length})
                      </span>
                    )}
                  </h1>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-lg"
                      />
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-36 bg-secondary/50 border-border/50 rounded-lg">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Topics</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="hidden md:grid grid-cols-[50px_32px_1fr_100px_100px_80px] items-center px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/30 bg-secondary/20">
                <div className="cursor-pointer flex items-center gap-1" onClick={() => toggleSort("id")}>
                  # <SortIcon field="id" />
                </div>
                <div className="cursor-pointer" onClick={() => toggleSort("solved")}>
                  <SortIcon field="solved" />
                </div>
                <div className="cursor-pointer flex items-center gap-1" onClick={() => toggleSort("title")}>
                  Title <SortIcon field="title" />
                </div>
                <div className="text-center">Difficulty</div>
                <div className="cursor-pointer flex items-center justify-center gap-1" onClick={() => toggleSort("acceptance")}>
                  Acceptance <SortIcon field="acceptance" />
                </div>
                <div />
              </div>

              {/* Problem Rows */}
              <div>
                {loadingProblems ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading problems...</span>
                  </div>
                ) : loadError ? (
                  <div className="flex justify-center items-center py-20 text-red-400">
                    {loadError}
                  </div>
                ) : filteredProblems.length === 0 ? (
                  <div className="flex justify-center items-center py-20 text-muted-foreground">
                    No problems match your filters.
                  </div>
                ) : (
                  filteredProblems.map((problem, idx) => {
                    const isSolved = solvedIds.has(String(problem.id));
                    return (
                      <Link
                        key={problem.id}
                        href={`/problem/${problem.slug}`}
                        className={`grid grid-cols-1 md:grid-cols-[50px_32px_1fr_100px_100px_80px] items-center px-5 py-3.5 border-b border-border/20 transition-colors hover:bg-secondary/30 group ${
                          idx % 2 === 0 ? "" : "bg-secondary/10"
                        }`}
                      >
                        {/* # */}
                        <div className="hidden md:block text-sm text-muted-foreground">{problem.id}</div>

                        {/* Solved */}
                        <div className="hidden md:flex justify-center">
                          {isSolved && (
                            <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                          )}
                        </div>

                        {/* Title + mobile info */}
                        <div>
                          <div className="flex items-center gap-2 md:hidden mb-1">
                            <span className="text-xs text-muted-foreground">#{problem.id}</span>
                            {isSolved && <Check className="h-3 w-3 text-primary" />}
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

                        {/* Difficulty */}
                        <div className="hidden md:flex justify-center">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getDifficultyClass(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>

                        {/* Acceptance */}
                        <div className="hidden md:block text-center text-sm text-muted-foreground">
                          {problem.acceptance}
                        </div>

                        {/* Solve button */}
                        <div className="hidden md:flex justify-end">
                          <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Solve →
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
