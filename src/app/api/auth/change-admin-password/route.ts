import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, confirmPassword } = body;

    if (!password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Password and confirmPassword are required",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 }
      );
    }

    // Get access token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token is required",
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/change-admin-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify({ password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to change password",
          error: data.error,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Password changed successfully",
      data: data.data,
    });
  } catch (error) {
    console.error("Error in change-admin-password proxy:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

