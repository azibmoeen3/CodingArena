"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function CommentSection({ discussionId, comments, user }) {
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to comment");
    if (!commentContent.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/discussions/${discussionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok) {
        setCommentContent("");
        router.refresh();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Comments ({comments?.length || 0})</h2>
      
      {/* Add Comment Form */}
      <div className="glass-card p-6 rounded-2xl border border-border/50 bg-secondary/10">
        <form onSubmit={handleComment} className="flex gap-4">
          <img 
            src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} 
            alt="Me"
            className="w-10 h-10 rounded-full border border-border/50 shadow-md"
          />
          <div className="flex-1 space-y-3">
            <textarea 
              placeholder={user ? "Add a helpful comment..." : "Please sign in to comment"}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={!user || submitting}
              className="w-full min-h-[100px] p-4 rounded-xl bg-background border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium"
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!user || submitting || !commentContent.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 rounded-xl h-11"
              >
                {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <><Send size={16} className="mr-2" /> Post Comment</>}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground font-medium">
            No comments yet. Start the conversation!
          </div>
        ) : (
          comments.map((comment, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-border/30 hover:border-primary/20 transition-all group">
              <img 
                src={comment.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`} 
                alt={comment.authorName}
                className="w-10 h-10 rounded-full border border-border/50 shadow-sm"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm text-foreground">{comment.authorName}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
