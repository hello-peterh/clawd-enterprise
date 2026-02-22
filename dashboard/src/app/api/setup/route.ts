import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const count = await db.user.count();
    return NextResponse.json({ setupRequired: count === 0 });
  } catch (error) {
    console.error("Setup status check error:", error);
    return NextResponse.json(
      { error: "Could not check setup status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const existingUsers = await db.user.count();
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, orgName } = body as {
      name?: string;
      email?: string;
      password?: string;
      orgName?: string;
    };

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!slug) {
      return NextResponse.json(
        { error: "Organization name must contain at least one alphanumeric character" },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: orgName, slug },
      });

      await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "SUPER_ADMIN",
          organizationId: org.id,
        },
      });
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
