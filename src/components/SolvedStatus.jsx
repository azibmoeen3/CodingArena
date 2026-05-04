"use client";

import { Check } from "lucide-react";
import { useAppContext } from "@/lib/context";

export default function SolvedStatus({ problemId }) {
  const { userSubmissions } = useAppContext();
  
  const isSolved = userSubmissions?.some(
    (s) => String(s.problemId) === String(problemId) && s.status === "Accepted"
  );

  if (!isSolved) return null;

  return (
    <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
      <Check className="h-3 w-3 text-primary" />
    </div>
  );
}
