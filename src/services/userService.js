import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/user";

export async function getUser(userId) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });
    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

export async function createUser(userData) {
  try {
    await connectToDatabase();
    const user = new User({
      clerkId: userData.id,
      email: userData.email_addresses[0].email_address,
      fullName:
        userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : userData.username || userData.email_addresses[0].email_address,
      firstName: userData.first_name || "",
      lastName: userData.last_name || "",
      profileImageUrl: userData.profile_image_url || "",
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(),
    });

    await user.save();
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(userData) {
  try {
    await connectToDatabase();

    // Find user by clerk ID
    const user = await User.findOne({ clerkId: userData.id });

    if (!user) {
      return null;
    }

    // Update user properties
    user.email = userData.email_addresses[0].email_address;
    user.fullName =
      userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : userData.username || userData.email_addresses[0].email_address;
    user.firstName = userData.first_name || "";
    user.lastName = userData.last_name || "";
    user.profileImageUrl = userData.profile_image_url || "";
    user.updatedAt = new Date();

    await user.save();
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    await connectToDatabase();
    const result = await User.deleteOne({ clerkId: userId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
