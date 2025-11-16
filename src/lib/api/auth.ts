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
  createdAt: string;
  updatedAt: string;
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
    const response = await fetch(`${API_BASE_URL}/auth/login-admin`, {
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
    const response = await fetch(
      `${API_BASE_URL}/auth/generate-access-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: Include cookies for refresh token
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to generate access token: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Refresh Token
  refreshToken: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
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

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
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
    const accessToken = await authApi.generateAccessToken();

    const response = await fetch(
      `${API_BASE_URL}/auth/change-admin-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ password, confirmPassword }),
      }
    );

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
      createdAt: profileData.createdAt || profileData.joinedAt,
      updatedAt: profileData.updatedAt,
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
