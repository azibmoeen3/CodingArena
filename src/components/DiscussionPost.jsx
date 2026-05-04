"use client";

import { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DiscussionPost({ discussion, initialUserId }) {
  const [likes, setLikes] = useState(discussion.likes || []);
  const [isLiking, setIsLiking] = useState(false);

  const toggleLike = async () => {
    if (!initialUserId) return alert("Please sign in to like");

    try {
      setIsLiking(true);
      const res = await fetch(`/api/discussions/${discussion._id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setLikes(updated.likes);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const isLiked = initialUserId && likes.includes(initialUserId);

  return (
    <div className="glass-card p-8 rounded-3xl border border-border/50 mb-10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img 
              src={discussion.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${discussion.authorName}`} 
              alt={discussion.authorName}
              className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5 shadow-xl"
            />
            <div>
              <p className="font-bold text-foreground text-lg">{discussion.authorName}</p>
              <p className="text-xs text-muted-foreground font-medium">
                Posted {formatDistanceToNow(new Date(discussion.createdAt))} ago • {discussion.category}
              </p>
            </div>
          </div>
          <button 
            onClick={toggleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold ${
              isLiked 
                ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                : "bg-secondary/50 text-muted-foreground hover:text-red-500 border border-transparent"
            }`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span>{likes.length}</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-foreground tracking-tight">{discussion.title}</h1>
        
        <div className="prose prose-invert max-w-none mb-10 text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
          {discussion.content}
        </div>

        <div className="flex items-center gap-6 pt-6 border-t border-border/30 text-xs font-bold text-muted-foreground uppercase tracking-widest">
           <span className="flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              {discussion.comments?.length || 0} Comments
           </span>
           <span className="flex items-center gap-2">
              👁 {discussion.views || 0} Views
           </span>
        </div>
      </div>
    </div>
  );
}
