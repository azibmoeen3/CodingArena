import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createUser, updateUser, deleteUser } from "@/services/userService";

export async function POST(request) {
  try {
    // Get the headers
    const headersList = headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    // If there are no headers, return error
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing svix headers");
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with the webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    let evt;

    // Verify the webhook
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return NextResponse.json(
        { error: "Error verifying webhook" },
        { status: 400 }
      );
    }

    // Get the event type
    const { type } = evt;
    const eventData = evt.data;

    console.log(`Webhook received: ${type}`);

    // Process the event based on type
    switch (type) {
      case "user.created":
        console.log("Creating user in MongoDB:", eventData.id);
        await createUser(eventData);
        break;

      case "user.updated":
        console.log("Updating user in MongoDB:", eventData.id);
        await updateUser(eventData);
        break;

      case "user.deleted":
        console.log("Deleting user from MongoDB:", eventData.id);
        await deleteUser(eventData.id);
        break;

      default:
        // Ignore other event types
        console.log("Ignoring event type:", type);
        break;
    }

    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
