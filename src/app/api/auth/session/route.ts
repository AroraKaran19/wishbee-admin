import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken");

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "No refresh token found",
        },
        { status: 401 }
      );
    }

    // Optionally validate the token with the backend
    // For now, we'll just check if it exists
    return NextResponse.json({
      success: true,
      authenticated: true,
      message: "Session is valid",
    });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Error checking session",
      },
      { status: 500 }
    );
  }
}
