import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function POST(request) {
  try {
    const body = await request.json();
    const { clerkId, email, firstName, lastName, fullName, profileImageUrl } = body;

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: "clerkId and email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user fields if they changed
      user.email = email;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.fullName = fullName || user.fullName;
      user.profileImageUrl = profileImageUrl || user.profileImageUrl;
      user.updatedAt = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        clerkId,
        email,
        fullName: fullName || `${firstName || ""} ${lastName || ""}`.trim() || email,
        firstName: firstName || "",
        lastName: lastName || "",
        profileImageUrl: profileImageUrl || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
    }

    return NextResponse.json(JSON.parse(JSON.stringify(user)));
  } catch (error) {
    console.error("Error in POST /api/users/ensure:", error);
    return NextResponse.json(
      { error: "Failed to ensure user" },
      { status: 500 }
    );
  }
}
