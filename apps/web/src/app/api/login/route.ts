import { signIn } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    await signIn("credentials", {
      token,
      redirect: false
    });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to login", reason: error?.cause?.err?.message || "Unknown" },
      { status: 500 }
    );
  }
}
