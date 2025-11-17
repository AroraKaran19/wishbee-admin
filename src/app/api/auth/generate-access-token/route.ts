import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/generate-access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to generate access token",
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

    // Forward any Set-Cookie headers from the backend
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("Set-Cookie", setCookieHeader);
    } else {
      const allCookies = response.headers.getSetCookie();
      allCookies.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Error in generate-access-token proxy:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
