import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Discussion } from "@/models/discussion";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    const discussion = await Discussion.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
    }
    
    return NextResponse.json(discussion);
  } catch (error) {
    console.error("Error fetching discussion:", error);
    return NextResponse.json({ error: "Failed to fetch discussion" }, { status: 500 });
  }
}

// For adding comments
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const discussion = await Discussion.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            authorId: userId,
            authorName: user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username || "Anonymous",
            authorImage: user.imageUrl,
            content,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
    }

    return NextResponse.json(discussion);
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

// For liking
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
    }

    const hasLiked = discussion.likes.includes(userId);
    const update = hasLiked 
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedDiscussion = await Discussion.findByIdAndUpdate(id, update, { new: true });

    return NextResponse.json(updatedDiscussion);
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
