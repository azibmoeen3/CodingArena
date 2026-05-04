import { getDiscussionById } from "@/services/discussionService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import DiscussionPost from "@/components/DiscussionPost";
import CommentSection from "@/components/CommentSection";
import { notFound } from "next/navigation";

export default async function DiscussionDetailPage({ params }) {
  const { id } = await params;
  const { userId } = await auth();
  const user = await currentUser();
  const discussion = await getDiscussionById(id);

  if (!discussion) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/community" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Discussions
        </Link>

        {/* Discussion Post */}
        <DiscussionPost discussion={discussion} initialUserId={userId} />

        {/* Comments Section */}
        <CommentSection 
          discussionId={id} 
          comments={discussion.comments || []} 
          user={user} 
        />
      </div>
    </div>
  );
}
