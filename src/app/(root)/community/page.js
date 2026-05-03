"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Users, MessageSquare, Heart, Share2, Loader2, Plus, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

export default function CommunityPage() {
  const { user } = useUser();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/discussions");
      const data = await res.json();
      setDiscussions(data);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to post");
    
    try {
      setSubmitting(true);
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setShowForm(false);
        fetchDiscussions();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert("Please sign in to like");

    try {
      const res = await fetch(`/api/discussions/${id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setDiscussions(discussions.map(d => d._id === id ? updated : d));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Users className="text-primary" size={32} />
              </div>
              Community
            </h1>
            <p className="text-muted-foreground text-lg">
              Share knowledge, ask questions, and connect with other coders.
            </p>
          </div>
          
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              Start Discussion
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Users, label: "Members", value: "2.1M+", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: MessageSquare, label: "Discussions", value: discussions.length + " +", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: Heart, label: "Likes", value: discussions.reduce((acc, d) => acc + (d.likes?.length || 0), 0) , color: "text-red-500", bg: "bg-red-500/10" },
            { icon: Share2, label: "Solutions", value: "512K+", color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl border border-border/50 flex flex-col items-center text-center">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {showForm && (
              <div className="glass-card p-6 rounded-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">New Discussion</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input 
                    placeholder="What's on your mind?" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 text-lg font-medium bg-secondary/30 border-border/50"
                    required
                  />
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 px-3 rounded-lg bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="General">General</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Interview Prep">Interview Prep</option>
                    <option value="Help Request">Help Request</option>
                    <option value="Solutions">Solutions</option>
                  </select>
                  <textarea 
                    placeholder="Describe your discussion in detail..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[200px] p-4 rounded-xl bg-secondary/30 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    required
                  />
                  <div className="flex justify-end pt-2">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-11 rounded-lg font-bold"
                    >
                      {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : "Post Discussion"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Loading discussions...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl border border-dashed border-border">
                <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-xl font-semibold mb-2">No discussions yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a conversation!</p>
                <Button onClick={() => setShowForm(true)} variant="outline">Start Discussion</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <Link 
                    href={`/community/${discussion._id}`} 
                    key={discussion._id}
                    className="block group"
                  >
                    <div className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={discussion.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${discussion.authorName}`} 
                            alt={discussion.authorName}
                            className="w-10 h-10 rounded-full border border-border shadow-sm"
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">{discussion.authorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(discussion.createdAt))} ago
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">
                          {discussion.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {discussion.title}
                      </h3>
                      
                      <p className="text-muted-foreground line-clamp-2 mb-6 text-sm leading-relaxed">
                        {discussion.content}
                      </p>
                      
                      <div className="flex items-center gap-6 pt-4 border-t border-border/30">
                        <button 
                          onClick={(e) => toggleLike(discussion._id, e)}
                          className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                            user && discussion.likes?.includes(user.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart size={16} fill={user && discussion.likes?.includes(user.id) ? "currentColor" : "none"} />
                          {discussion.likes?.length || 0}
                        </button>
                        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <MessageSquare size={16} />
                          {discussion.comments?.length || 0}
                        </span>
                        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          👁 {discussion.views || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-border/50">
              <h3 className="text-lg font-bold mb-4">Trending Topics</h3>
              <div className="space-y-2">
                {["Array", "Dynamic Programming", "Interview Tips", "Career Advice", "System Design"].map((tag) => (
                  <button key={tag} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                    # {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-border/50 bg-primary/5">
              <h3 className="text-lg font-bold mb-2">Weekly Contest</h3>
              <p className="text-sm text-muted-foreground mb-4">Participate in our weekly contest and win exciting prizes!</p>
              <Link href="/contests">
                <Button className="w-full bg-primary text-primary-foreground font-bold">Join Now</Button>
              </Link>
            </div>

            <Link href="/problems" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors pl-2">
              <ArrowLeft size={16} />
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
