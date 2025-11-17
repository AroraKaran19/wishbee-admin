import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/login-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Login failed",
          error: data.error,
        },
        { status: response.status }
      );
    }

    // Create a Next.js response with the data
    const nextResponse = NextResponse.json({
      success: true,
      message: data.message,
      data: data.data,
    });

    // Forward all Set-Cookie headers from the backend to the client
    // The backend response may have multiple Set-Cookie headers
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      // If there's a single Set-Cookie header, forward it directly
      nextResponse.headers.set("Set-Cookie", setCookieHeader);
    } else {
      // Try to get all Set-Cookie headers (some servers send them separately)
      const allCookies = response.headers.getSetCookie();
      allCookies.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Error in login-admin proxy:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
