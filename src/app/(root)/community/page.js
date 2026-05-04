import { getDiscussions } from "@/services/discussionService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, MessageSquare, Heart, Share2, ArrowLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import NewDiscussionForm from "@/components/NewDiscussionForm";
import DiscussionItem from "@/components/DiscussionItem";

export default async function CommunityPage() {
  const { userId } = await auth();
  const discussions = await getDiscussions();

  const totalLikes = discussions.reduce((acc, d) => acc + (d.likes?.length || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3 text-foreground">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Users className="text-primary" size={32} />
              </div>
              Community
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Share knowledge, ask questions, and connect with other coders.
            </p>
          </div>
          
          <NewDiscussionForm user={userId} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Users, label: "Members", value: "2.1M+", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: MessageSquare, label: "Discussions", value: discussions.length + " +", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: Heart, label: "Likes", value: totalLikes , color: "text-red-500", bg: "bg-red-500/10" },
            { icon: Share2, label: "Solutions", value: "512K+", color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl border border-border/50 flex flex-col items-center text-center">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {discussions.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl border border-dashed border-border/50">
                <MessageSquare className="mx-auto mb-4 text-muted-foreground opacity-20" size={64} />
                <h3 className="text-xl font-bold mb-2 text-foreground">No discussions yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <DiscussionItem 
                    key={discussion._id} 
                    discussion={discussion} 
                    initialUserId={userId} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-border/50">
              <h3 className="text-lg font-bold mb-4 text-foreground">Trending Topics</h3>
              <div className="space-y-2">
                {["Array", "Dynamic Programming", "Interview Tips", "Career Advice", "System Design"].map((tag) => (
                  <button key={tag} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-primary transition-all font-medium">
                    # {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-border/50 bg-primary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Trophy size={64} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground relative z-10">Weekly Contest</h3>
              <p className="text-sm text-muted-foreground mb-6 relative z-10">Participate in our weekly contest and win exciting prizes!</p>
              <Link href="/contests" className="relative z-10">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11">Join Now</Button>
              </Link>
            </div>

            <Link href="/problems" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all pl-2 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

