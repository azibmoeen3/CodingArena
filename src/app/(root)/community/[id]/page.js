"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { MessageSquare, Heart, Loader2, ArrowLeft, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

export default function DiscussionDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useUser();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/discussions/${id}`);
      const data = await res.json();
      setDiscussion(data);
    } catch (error) {
      console.error("Error fetching discussion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to comment");
    if (!commentContent.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/discussions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok) {
        setCommentContent("");
        fetchDiscussion();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async () => {
    if (!user) return alert("Please sign in to like");

    try {
      const res = await fetch(`/api/discussions/${id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setDiscussion(updated);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Discussion not found</h2>
        <Link href="/community">
          <Button variant="outline">Back to Community</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/community" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Discussions
        </Link>

        {/* Discussion Post */}
        <div className="glass-card p-8 rounded-3xl border border-border/50 mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img 
                src={discussion.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${discussion.authorName}`} 
                alt={discussion.authorName}
                className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5"
              />
              <div>
                <p className="font-bold text-foreground text-lg">{discussion.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  Posted {formatDistanceToNow(new Date(discussion.createdAt))} ago • {discussion.category}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                user && discussion.likes?.includes(user.id) 
                  ? "bg-red-500/10 text-red-500" 
                  : "bg-secondary/50 text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart size={20} fill={user && discussion.likes?.includes(user.id) ? "currentColor" : "none"} />
              <span className="font-bold">{discussion.likes?.length || 0}</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-6">{discussion.title}</h1>
          
          <div className="prose prose-invert max-w-none mb-10 text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {discussion.content}
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-border/30 text-sm text-muted-foreground">
             <span className="flex items-center gap-2">
                <MessageSquare size={18} />
                {discussion.comments?.length || 0} Comments
             </span>
             <span className="flex items-center gap-2">
                👁 {discussion.views || 0} Views
             </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Comments ({discussion.comments?.length || 0})</h2>
          
          {/* Add Comment Form */}
          <div className="glass-card p-6 rounded-2xl border border-border/50 bg-secondary/20">
            <form onSubmit={handleComment} className="flex gap-4">
              <img 
                src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} 
                alt="Me"
                className="w-10 h-10 rounded-full border border-border/50"
              />
              <div className="flex-1 space-y-3">
                <textarea 
                  placeholder={user ? "Add a helpful comment..." : "Please sign in to comment"}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  disabled={!user || submitting}
                  className="w-full min-h-[100px] p-4 rounded-xl bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!user || submitting || !commentContent.trim()}
                    className="bg-primary text-primary-foreground font-bold px-6 rounded-lg"
                  >
                    {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <><Send size={16} className="mr-2" /> Post Comment</>}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {discussion.comments?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No comments yet. Start the conversation!
              </div>
            ) : (
              discussion.comments.map((comment, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/20 transition-all">
                  <img 
                    src={comment.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`} 
                    alt={comment.authorName}
                    className="w-10 h-10 rounded-full border border-border/50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm">{comment.authorName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
