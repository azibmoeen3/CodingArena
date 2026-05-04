import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Discussion } from "@/models/discussion";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const query = category && category !== "all" ? { category } : {};

    const discussions = await Discussion.find(query).sort({ createdAt: -1 });

    return NextResponse.json(discussions);
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    await connectToDatabase();

    const discussion = await Discussion.create({
      title,
      content,
      category: category || "General",
      authorId: userId,
      authorName: user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username || "Anonymous",
      authorImage: user.imageUrl,
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (error) {
    console.error("Error creating discussion:", error);
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 });
  }
}
