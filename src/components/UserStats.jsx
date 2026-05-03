"use client";

import { useAppContext } from "@/lib/context";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function UserStats() {
  const { user, userSubmissions, isSignedIn, loading } = useAppContext();

  if (!isSignedIn) {
    return (
      <div className="glass-card rounded-xl p-6">
        <p className="text-sm text-muted-foreground text-center">
          Sign in to track your progress
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-secondary rounded w-2/3 mb-4" />
        <div className="h-8 bg-secondary rounded w-1/2 mb-6" />
        <div className="space-y-3">
          <div className="h-3 bg-secondary rounded" />
          <div className="h-3 bg-secondary rounded w-4/5" />
          <div className="h-3 bg-secondary rounded w-3/5" />
        </div>
      </div>
    );
  }

  const accepted = userSubmissions.filter(s => s.status === "Accepted");
  const uniqueSolved = new Set(accepted.map(s => s.problemId)).size;
  const totalSubmissions = userSubmissions.length;

  // Count by difficulty (from accepted unique problems)
  const easyCount = accepted.filter(s => s.problemTitle && s.status === "Accepted").length;

  return (
    <div className="glass-card rounded-xl p-6 space-y-5">
      {/* User greeting */}
      <div>
        <h3 className="text-sm text-muted-foreground font-medium">Welcome back</h3>
        <p className="text-lg font-semibold text-foreground truncate">
          {user?.fullName || user?.email || "Coder"}
        </p>
      </div>

      {/* Solved counter */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <span className="text-xl font-bold text-primary">{uniqueSolved}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Problems Solved</p>
          <p className="text-xs text-muted-foreground">{totalSubmissions} total submissions</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <CheckCircle className="h-4 w-4 text-green-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">
            {accepted.length}
          </p>
          <p className="text-[10px] text-muted-foreground">Accepted</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <XCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">
            {userSubmissions.filter(s => s.status === "Wrong Answer").length}
          </p>
          <p className="text-[10px] text-muted-foreground">Wrong</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">
            {userSubmissions.filter(s => s.status === "Time Limit Exceeded").length}
          </p>
          <p className="text-[10px] text-muted-foreground">TLE</p>
        </div>
      </div>
    </div>
  );
}
