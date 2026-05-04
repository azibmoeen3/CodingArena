import { auth, currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Trophy, BarChart3, Code, ExternalLink, Calendar } from "lucide-react";
import ContributionGraph from "@/components/ContributionGraph";
import { getUserSubmissions } from "@/services/submissionService";

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // Fetch submissions on the server
  const userSubmissions = await getUserSubmissions(userId);

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
    <div className="min-h-screen pb-20">
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                {user?.imageUrl && (
                  <div className="relative inline-block mb-6">
                    <img
                      src={user.imageUrl}
                      alt={user.firstName || "User"}
                      className="w-28 h-28 rounded-full border-4 border-white/5 shadow-2xl relative z-10"
                    />
                    <div className="absolute inset-0 rounded-full bg-primary blur-xl opacity-20 scale-110" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {user?.fullName || "Code Warrior"}
                </h2>
                <p className="text-muted-foreground text-sm mb-6 font-medium">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">Pro Member</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-muted-foreground text-[10px] font-bold uppercase border border-white/10">Rank #128</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl">
                  Settings
                </Button>
              </div>
            </div>

            {/* Achievement Badges Placeholder */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Achievements
              </h3>
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-help opacity-40">
                    <Trophy className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Submissions", value: userSubmissions?.length || 0, icon: Code, color: "text-blue-400" },
                { label: "Solved", value: solvedProblems, icon: CheckCircle2, color: "text-green-400" },
                { label: "Success", value: `${successRate}%`, icon: BarChart3, color: "text-purple-400" },
                { label: "Streak", value: "3 Days", icon: Calendar, color: "text-orange-400" },
              ].map((stat, i) => (
                <div key={i} className="glass-card rounded-xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Contribution Graph */}
            <ContributionGraph submissions={userSubmissions || []} />

            {/* Recent Submissions */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Recent Activity</h3>
                <Link href="/problems">
                  <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold text-primary tracking-widest hover:bg-primary/5">
                    View All <ExternalLink className="ml-1.5 h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {userSubmissions && userSubmissions.length > 0 ? (
                  userSubmissions.slice(0, 8).map((submission) => (
                    <div key={submission._id} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{submission.problemTitle}</span>
                        <span className="text-[10px] font-mono text-muted-foreground mt-1">{submission.language} • {new Date(submission.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          submission.status === "Accepted"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : submission.status === "Processing"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-muted-foreground text-sm font-medium">No activity recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

