"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Heart, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DiscussionItem({ discussion, initialUserId }) {
  const [likes, setLikes] = useState(discussion.likes || []);
  const [isLiking, setIsLiking] = useState(false);

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    <Link 
      href={`/community/${discussion._id}`} 
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

        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors text-foreground">
          {discussion.title}
        </h3>
        
        <p className="text-muted-foreground line-clamp-2 mb-6 text-sm leading-relaxed">
          {discussion.content}
        </p>
        
        <div className="flex items-center gap-6 pt-4 border-t border-border/30">
          <button 
            onClick={toggleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            }`}
          >
            {isLiking ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            )}
            {likes.length}
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
  );
}
