"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  FileText,
  Code2,
  TestTube,
  Settings2,
} from "lucide-react";

export default function AdminPage() {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    category: "Array",
    description: "",
    starterCodes: {
      javascript: "",
      python: "",
      cpp: "",
      java: "",
    },
    sampleInputs: {
      javascript: "",
      python: "",
      cpp: "",
      java: "",
    },
    sampleOutputs: {
      javascript: "",
      python: "",
      cpp: "",
      java: "",
    },
    testCases: [],
    hints: [],
    constraints: [],
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await fetch("/api/admin/problems");
      
      if (!res.ok) {
        if (res.status === 403) {
          console.warn("Unauthorized access to admin API");
          return;
        }
        throw new Error(`API error: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API returned non-JSON response");
      }

      const data = await res.json();
      setProblems(data.problems || []);
    } catch (err) {
      console.error("Failed to fetch problems", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (problem) => {
    setCurrentProblem(problem);
    setFormData({
      ...problem,
      starterCodes: Object.fromEntries(
        problem.starterCodes.map((sc) => [sc.language, sc.code])
      ),
      sampleInputs: Object.fromEntries(
        problem.starterCodes.map((sc) => [sc.language, sc.sampleInput])
      ),
      sampleOutputs: Object.fromEntries(
        problem.starterCodes.map((sc) => [sc.language, sc.sampleOutput])
      ),
    });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentProblem(null);
    setFormData({
      title: "",
      difficulty: "Easy",
      category: "Array",
      description: "",
      starterCodes: { javascript: "", python: "", cpp: "", java: "" },
      sampleInputs: { javascript: "", python: "", cpp: "", java: "" },
      sampleOutputs: { javascript: "", python: "", cpp: "", java: "" },
      testCases: [],
      hints: [],
      constraints: [],
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = currentProblem ? "PUT" : "POST";
      const payload = currentProblem ? { ...formData, _id: currentProblem._id } : formData;
      
      const res = await fetch("/api/admin/problems", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEditing(false);
        fetchProblems();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save problem");
      }
    } catch (err) {
      console.error("Error saving problem", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    try {
      const res = await fetch(`/api/admin/problems?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchProblems();
    } catch (err) {
      console.error("Error deleting problem", err);
    }
  };

  if (loading || !isUserLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === "azibmaher771@gmail.com";

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="mb-6 rounded-full bg-red-500/10 p-6">
          <X className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Unauthorized Access</h1>
        <p className="max-w-md text-muted-foreground">
          You do not have permission to access the admin dashboard. This area is reserved for administrators only.
        </p>
        <Button onClick={() => window.location.href = "/"} className="mt-8 rounded-xl">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and create coding problems</p>
          </div>
          {!isEditing && (
            <Button onClick={handleCreateNew} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Add Problem
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="glass-card overflow-hidden rounded-2xl border border-border/50 bg-card/50">
            <div className="flex items-center justify-between border-b border-border/50 p-6 bg-secondary/20">
              <h2 className="text-xl font-semibold">
                {currentProblem ? `Edit Problem: ${currentProblem.title}` : "Create New Problem"}
              </h2>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Problem
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-semibold">
                   <Settings2 className="h-5 w-5" /> Basic Information
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Two Sum"
                      className="bg-secondary/30 border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                      >
                        <SelectTrigger className="bg-secondary/30 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Array"
                        className="bg-secondary/30 border-border/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <FileText className="h-5 w-5" /> Description (Markdown)
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-96 w-full rounded-xl bg-secondary/30 border border-border/50 p-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="# Problem Statement..."
                  />
                </div>
              </div>

              {/* Starter Code */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-semibold">
                   <Code2 className="h-5 w-5" /> Starter Code
                </div>
                <div className="space-y-4">
                  {Object.keys(formData.starterCodes).map((lang) => (
                    <div key={lang} className="space-y-2">
                      <label className="text-xs font-medium capitalize text-muted-foreground">{lang}</label>
                      <textarea
                        value={formData.starterCodes[lang]}
                        onChange={(e) => {
                          const newCodes = { ...formData.starterCodes, [lang]: e.target.value };
                          setFormData({ ...formData, starterCodes: newCodes });
                        }}
                        className="h-32 w-full rounded-xl bg-secondary/30 border border-border/50 p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder={`Initial code for ${lang}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem) => (
              <div
                key={problem._id}
                className="glass-card group flex flex-col justify-between rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/30"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        problem.difficulty === "Easy"
                          ? "bg-green-500/10 text-green-400"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{problem.category}</span>
                  </div>
                  <h3 className="mb-4 text-lg font-bold group-hover:text-primary transition-colors">
                    {problem.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-border/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(problem)}
                    className="flex-1 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit2 className="mr-2 h-3 w-3" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(problem._id)}
                    className="rounded-lg hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
