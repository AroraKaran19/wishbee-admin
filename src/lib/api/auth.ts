const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface AdminLoginResponse {
  _id: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  permissions: string[];
  firstName?: string;
  lastName?: string;
  photo?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  createdAt?: string;
  updatedAt?: string;
  joinedAt?: string; // Used in profile responses
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  // Login Admin
  loginAdmin: async (
    credentials: LoginCredentials
  ): Promise<AdminLoginResponse> => {
    // Use Next.js API route to proxy the request and handle cookies
    const response = await fetch("/api/auth/login-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: Include cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Login failed: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Generate Access Token
  generateAccessToken: async (): Promise<string> => {
    // Use Next.js API route to proxy the request and handle cookies
    const response = await fetch("/api/auth/generate-access-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: Include cookies for refresh token
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message ||
          `Failed to generate access token: ${response.statusText}`
      ) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data;
  },

  // Refresh Token
  refreshToken: async (): Promise<void> => {
    // Use Next.js API route to proxy the request and handle cookies
    const response = await fetch("/api/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: Include cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to refresh token: ${response.statusText}`
      );
    }
  },

  // Logout
  logout: async (accessToken?: string): Promise<void> => {
    try {
      // Use provided token or generate a new one
      let token = accessToken;
      if (!token) {
        token = await authApi.generateAccessToken();
      }

      // Use Next.js API route to proxy the request and handle cookies
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Logout failed: ${response.statusText}`
        );
      }
    } catch (error) {
      // Even if logout fails, clear local storage
      console.error("Error during logout:", error);
      throw error;
    }
  },

  // Change Admin Password
  changePassword: async (
    password: string,
    confirmPassword: string
  ): Promise<void> => {
    // Generate access token first
    const accessToken = await authApi.generateAccessToken();

    // Use Next.js API route to proxy the request and handle cookies
    const response = await fetch("/api/auth/change-admin-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify({ password, confirmPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to change password: ${response.statusText}`
      );
    }
  },

  // Get Admin Profile
  getProfile: async (accessToken: string): Promise<AdminLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch profile: ${response.statusText}`
      );
    }

    const result = await response.json();
    // Transform the profile response to match AdminLoginResponse format
    const profileData = result.data;
    return {
      _id: profileData._id,
      email: profileData.email,
      role: profileData.role as "ADMIN" | "SUPER_ADMIN",
      isActive: profileData.isActive,
      permissions: profileData.permissions || [],
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      photo: profileData.photo,
      gender: profileData.gender,
      createdAt: profileData.createdAt || profileData.joinedAt,
      updatedAt: profileData.updatedAt,
      joinedAt: profileData.joinedAt || profileData.createdAt,
    };
  },

  // Update Profile
  updateProfile: async (
    accessToken: string,
    data: {
      firstName?: string;
      lastName?: string;
      photo?: string;
    }
  ): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update profile: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },
};
