import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Check if any users exist — setup only works for first user
    const existingUsers = await db.user.count();
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed" },
        { status: 403 }
      );
    }

    const { name, email, password, orgName } = await req.json();

    if (!name || !email || !password || !orgName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const org = await db.organization.create({
      data: { name: orgName, slug },
    });

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "SUPER_ADMIN",
        organizationId: org.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
