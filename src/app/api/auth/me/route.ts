import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Check if refresh token exists
 * This endpoint checks if the refresh token cookie exists
 * Actual validation happens when generating access tokens
 * 
 * Note: This endpoint is used by checkRefreshTokenExists() in the session store
 * The actual token validation will occur when generateAccessToken() is called
 */
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

    // Refresh token cookie exists
    // Validation will happen when generateAccessToken() is called
    return NextResponse.json({
      success: true,
      authenticated: true,
      message: "Refresh token cookie found",
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
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

