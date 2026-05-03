"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/context";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Trophy, BarChart3, Code } from "lucide-react";

export default function ProfilePage() {
  const { userId, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { user, userSubmissions, loading } = useAppContext();

  if (!isSignedIn) {
    redirect("/sign-in");
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading profile...</p>
      </div>
    );
  }

  const acceptedSubmissions = userSubmissions?.filter(
    (sub) => sub.status === "Accepted"
  ) || [];
  const solvedProblems = new Set(
    acceptedSubmissions.map((sub) => String(sub.problemId))
  ).size;
  const successRate =
    userSubmissions && userSubmissions.length > 0
      ? Math.round((acceptedSubmissions.length / userSubmissions.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                {clerkUser?.profileImageUrl && (
                  <img
                    src={clerkUser.profileImageUrl}
                    alt={clerkUser.firstName || "User"}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold">
                  {clerkUser?.firstName} {clerkUser?.lastName}
                </h2>
                <p className="text-gray-600 text-sm mb-4">{clerkUser?.emailAddresses?.[0]?.emailAddress}</p>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Code className="text-blue-500" size={20} />
                  <p className="text-gray-600 text-sm">Total Submissions</p>
                </div>
                <p className="text-3xl font-bold">{userSubmissions?.length || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <p className="text-gray-600 text-sm">Problems Solved</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{solvedProblems}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="text-yellow-500" size={20} />
                  <p className="text-gray-600 text-sm">Acceptance Rate</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{successRate}%</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="text-purple-500" size={20} />
                  <p className="text-gray-600 text-sm">Success Rate</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">{successRate}%</p>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Recent Submissions</h3>
              {userSubmissions && userSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {userSubmissions.slice(0, 5).map((submission) => (
                    <div key={submission._id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{submission.problemTitle}</p>
                        <p className="text-sm text-gray-600">{submission.language}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          submission.status === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : submission.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No submissions yet</p>
              )}
              <Link href="/problems" className="mt-4 block">
                <Button variant="outline" className="w-full">
                  View All Submissions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
