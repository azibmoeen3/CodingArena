"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewDiscussionForm({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const router = useRouter();

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
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Button 
        onClick={() => setShowForm(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
      >
        <Plus size={20} />
        Start Discussion
      </Button>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">New Discussion</h2>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          placeholder="What's on your mind?" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 text-lg font-medium bg-secondary/30 border-border/50 text-foreground"
          required
        />
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-12 px-3 rounded-lg bg-secondary/30 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          className="w-full min-h-[200px] p-4 rounded-xl bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
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
  );
}
