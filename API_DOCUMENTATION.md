# Wishbee API Documentation

## Authentication

- **Access Token**: Required for protected routes (Bearer token in Authorization header)
- **Refresh Token**: Stored in HTTP-only cookies
- **Admin Routes**: Require both user authentication and admin role

---

## Rate Limiting

Rate limits apply per minute. **Admin users (ADMIN, SUPER_ADMIN) bypass all rate limits** when authenticated.

| Endpoint | Limit | Key | Bypass |
|----------|-------|-----|--------|
| `POST /auth/verify-msg91-otp` | 10/min | IP | N/A (public) |
| `POST /auth/login-admin` | 5/min | IP | N/A (public) |
| `POST /auth/generate-access-token` | 20/min | User | Admin |
| `POST /orders`, `POST /orders/verify` | 5/min | User | Admin |
| `POST /enquiry` | 5/min | User | Admin |
| `POST /upload/user/presigned-url`, `DELETE /upload/user/delete` | 20/min | User | Admin |
| `POST /coupons/validate` | 30/min | User or IP | Admin |
| `POST /cart/add`, `PUT /cart/update` | 30/min | User | Admin |

---

## Session Management (Zustand Implementation)

The frontend uses **Zustand** with persistence middleware for session management. This section explains how refresh tokens and access tokens are handled in the client-side implementation.

### Overview

The session management system implements a **dual-token authentication strategy**:
- **Refresh Token**: Long-lived token (30 days / 1 month) stored in HTTP-only cookies (managed by backend)
- **Access Token**: Short-lived token (15 minutes) stored in Zustand store

**Note**: Some authentication endpoints are implemented as **Next.js frontend API routes** (located in `frontend/src/app/api/auth/`) rather than backend routes. These frontend routes act as proxies that:
- Handle cookie management
- Forward requests to the backend API
- Provide a consistent frontend API interface

### Zustand Store Structure

The session store (`useSessionStore`) manages the following state:

```typescript
interface SessionState {
  user: Consumer | null;
  status: "authenticated" | "unauthenticated" | "loading";
  accessToken: {
    token: string;
    expiresAt: Date;
  } | null;
  refreshTokenExpiresAt: Date | null;
  otpExpiresAt: Date | null;
  // ... other fields
}
```

### Storage and Persistence

- **Storage**: Uses `sessionStorage` (via Zustand persist middleware)
- **Persisted Data**: User data, access token, token expiry times, and selected delivery address
- **Session Scope**: Data persists only for the browser session (cleared when tab/window closes)

### Token Lifecycle

#### 1. Login Flow

When a user successfully verifies OTP:

1. **Refresh Token**: Backend sets refresh token in HTTP-only cookie (30 days expiry)
2. **Refresh Token Expiry**: Store tracks expiry time (`refreshTokenExpiresAt`) - set to 30 days from login
3. **Access Token Generation**: Automatically calls `generateAccessToken()` after login
4. **Access Token Storage**: Access token stored in Zustand with 15-minute expiry

```typescript
// After OTP verification
set({
  user: userData,
  status: "authenticated",
  refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
});
await generateAccessToken(); // Generates and stores access token
```

#### 2. Access Token Management

**Automatic Injection**:
- The `apiClient` (Axios instance) automatically adds access token to all requests via request interceptor
- Token is retrieved from Zustand store using `getAccessToken()` function

**Token Refresh on 401**:
- When any API call receives a 401 (Unauthorized) response:
  1. Interceptor detects the 401 error
  2. Automatically calls `refreshAccessToken()` function
  3. Generates new access token using refresh token (via `/api/auth/access` Next.js frontend route, which proxies to backend)
  4. Retries the original request with new token
  5. If refresh fails, user is logged out

```typescript
// Automatic token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && refreshAccessToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config); // Retry original request
      }
    }
    return Promise.reject(error);
  }
);
```

#### 3. Token Validation

The store provides helper methods to check token validity:

- **`isTokenValid()`**: Checks if access token exists and hasn't expired
- **`isRefreshTokenExpiringSoon()`**: Checks if refresh token expires within 24 hours

### Key Methods

#### `generateAccessToken()`
- Calls `/api/auth/access` endpoint (Next.js frontend API route)
- This frontend route proxies to backend `/auth/generate-access-token` endpoint
- Uses refresh token from HTTP-only cookie
- Stores new access token with 15-minute expiry
- Called automatically after login and on 401 errors

#### `refreshRefreshToken()`
- Calls `/api/auth/refresh-token` endpoint (Next.js frontend API route)
- This frontend route proxies to backend `/auth/refresh-token` endpoint
- Updates `refreshTokenExpiresAt` to 30 days from now
- Can be called proactively before refresh token expires

#### `checkRefreshTokenExists()`
- Calls `/api/auth/me` endpoint (Next.js frontend API route)
- This is a **frontend-only route** that checks if refresh token cookie exists
- Does not call the backend - only verifies cookie presence
- Used to check authentication status on app initialization
- Logs out user if refresh token cookie is missing

#### `logout()`
- Calls `/api/auth/logout` endpoint
- Clears all session data from store
- Backend removes refresh token from cookie
- Redirects to home page

### Automatic Token Refresh Flow

```
User makes API request
    ↓
apiClient adds access token to header
    ↓
Request sent to backend
    ↓
Backend responds with 401 (token expired)
    ↓
Interceptor catches 401
    ↓
Calls refreshAccessToken()
    ↓
POST /api/auth/access (Next.js frontend route → proxies to backend /auth/generate-access-token)
    ↓
New access token received
    ↓
Store updated with new token
    ↓
Original request retried with new token
    ↓
Request succeeds
```

### Session Initialization

On app load:

1. Zustand store is hydrated from `sessionStorage`
2. Check if refresh token exists via `checkRefreshTokenExists()`
3. If valid:
   - Generate new access token
   - Fetch user profile
   - Set status to "authenticated"
4. If invalid:
   - Clear session data
   - Set status to "unauthenticated"

### Security Features

1. **HTTP-Only Cookies**: Refresh tokens stored in HTTP-only cookies (not accessible via JavaScript)
2. **Short-Lived Access Tokens**: 15-minute expiry reduces exposure window
3. **Automatic Cleanup**: Expired tokens are automatically refreshed or user is logged out
4. **Session Storage**: Access tokens stored in sessionStorage (cleared on tab close)
5. **Token Validation**: Built-in checks prevent using expired tokens

### Token Expiry Times

- **Access Token**: 15 minutes
- **Refresh Token**: 30 days (1 month)
- **OTP**: 60 seconds

### Error Handling

- **401 on Access Token**: Automatically refreshed (transparent to user)
- **401 on Refresh Token**: User is logged out and redirected
- **Network Errors**: Handled gracefully with appropriate error messages
- **Token Refresh Failure**: Session cleared, user must login again

---

## 1. Authentication Endpoints

### Send OTP

- **API**: `POST /api/auth/send-otp`
- **Access**: Public
- **Request**:
  ```json
  {
    "phoneNumber": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": true,
    "message": "OTP sent successfully"
  }
  ```
- **Error Response** (if requesting too frequently):
  ```json
  {
    "success": false,
    "message": "Please wait 60 seconds before requesting another OTP",
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "details": "OTP can only be requested once every 5 minutes"
    }
  }
  ```

### Verify OTP

- **API**: `POST /api/auth/verify-otp`
- **Access**: Public
- **Request**:
  ```json
  {
    "phoneNumber": "string",
    "otp": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "phoneNumber": "string",
      "role": "CUSTOMER",
      "isActive": true,
      "firstTimeLogin": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "OTP verified successfully!"
  }
  ```
- **Note**:
  - Refresh token is automatically set in HTTP-only cookie
  - Frontend should use NextAuth to manage session and generate access tokens
  - Use refresh token endpoint to get access tokens for API calls

### Refresh Token

- **API**: `POST /api/auth/refresh-token`
- **Access**: Public (uses refresh token from cookies)
- **Request**: None (uses refresh token from cookies)
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Refresh token refreshed successfully"
  }
  ```

### Login Admin

- **API**: `POST /api/auth/login-admin`
- **Access**: Admin or SUPER_ADMIN
- **Request**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "email": "string",
      "role": "ADMIN",
      "isActive": true,
      "permissions": ["DASHBOARD", "ORDERS", "CUSTOMERS", "INVENTORY"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Admin logged in successfully"
  }
  ```
- **Note**:
  - Works for both `ADMIN` and `SUPER_ADMIN` users
  - Refresh token is automatically set in HTTP-only cookie
  - Returns `permissions` array containing the admin's assigned permissions
  - `SUPER_ADMIN` users will have all permissions (handled on frontend)
  - If admin has no permissions assigned, returns empty array `[]`
  - Returns 401 error if account is not active
  - For `SUPER_ADMIN` users, the `role` field will be `"SUPER_ADMIN"` instead of `"ADMIN"`

### Generate Access Token

- **API**: `POST /api/auth/generate-access-token`
- **Access**: User
- **Request**: None (requires valid refresh token)
- **Response**:
  ```json
  {
    "success": true,
    "data": "string",
    "message": "Access token generated successfully"
  }
  ```

### Logout

- **API**: `POST /api/auth/logout`
- **Access**: User
- **Request**: None (requires Bearer token in Authorization header)
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Logged out successfully"
  }
  ```

### Change Admin Password

- **API**: `POST /api/auth/change-admin-password`
- **Access**: Admin
- **Request**:
  ```json
  {
    "password": "string",
    "confirmPassword": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Password changed successfully!"
  }
  ```

---

## 2. User Endpoints

### Get Profile

- **API**: `GET /api/user/profile`
- **Access**: User
- **Request**: None (requires Bearer token in Authorization header)
- **Response** (Customer):
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "phoneNumber": "string",
      "role": "CUSTOMER",
      "isActive": true,
      "firstName": "string",
      "lastName": "string",
      "photo": "string",
      "govtId": {
        "type": "GST",
        "number": "string"
      },
      "storeName": "string",
      "loyaltyTier": "BRONZE",
      "totalSpend": 0,
      "loyaltyDiscountPercent": 0,
      "defaultAddress": {
        "type": "HOME",
        "addressLine": "string",
        "city": "string",
        "state": "string",
        "postalCode": "string",
        "country": "string",
        "isDefault": true
      },
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Profile fetched successfully"
  }
  ```
- **Response** (Admin):
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "email": "string",
      "role": "ADMIN",
      "isActive": true,
      "firstName": "string",
      "lastName": "string",
      "photo": "string",
      "permissions": ["DASHBOARD", "ORDERS", "CUSTOMERS", "INVENTORY"],
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Profile fetched successfully"
  }
  ```
- **Note**:
  - For admin users, the response includes `permissions` array
  - For customer users, the response includes customer-specific fields like `govtId`, `storeName`, `loyaltyTier`, `totalSpend`, and `defaultAddress`
  - `govtId` is an optional object with `type` (enum: "GST", "PAN", "UDYAM", "SHOP_LICENSE", "OTHER") and `number` (string) fields
  - `SUPER_ADMIN` users will have permissions array (handled on frontend as all permissions)

### Get current loyalty tier and discount

- **API**: `GET /api/user/loyalty-discount`
- **Access**: User (authenticated)
- **Request**: None (requires Bearer token in Authorization header)
- **Description**: Returns the authenticated user's current loyalty tier and the discount percentage for that tier (from loyalty tier config). For admins, returns `currentTier: null` and `discountPercent: 0`.
- **Response** (Consumer):
  ```json
  {
    "success": true,
    "data": {
      "currentTier": "SILVER",
      "discountPercent": 5
    },
    "message": "Current tier and discount fetched"
  }
  ```
- **Response** (Admin/SUPER_ADMIN):
  ```json
  {
    "success": true,
    "data": {
      "currentTier": null,
      "discountPercent": 0
    },
    "message": "Current tier and discount fetched"
  }
  ```

### Update Profile

- **API**: `PUT /api/user/profile`
- **Access**: User (Consumer, Admin, or SUPER_ADMIN)
- **Request**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "photo": "string"
  }
  ```
- **Note**:
  - Either both `firstName` and `lastName` must be provided, or `photo` must be provided (or both)
  - Works for both Consumer and Admin/SUPER_ADMIN users
  - For Admin/SUPER_ADMIN users, the password field is automatically excluded from updates (use change password endpoint instead)
- **Response** (Consumer):
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "phoneNumber": "string",
      "role": "CUSTOMER",
      "isActive": true,
      "firstName": "string",
      "lastName": "string",
      "photo": "string",
      "govtId": {
        "type": "GST",
        "number": "string"
      },
      "storeName": "string",
      "loyaltyTier": "BRONZE",
      "totalSpend": 0,
      "loyaltyDiscountPercent": 0,
      "defaultAddress": {
        "type": "HOME",
        "addressLine": "string",
        "city": "string",
        "state": "string",
        "postalCode": "string",
        "country": "string",
        "isDefault": true
      },
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Profile updated successfully"
  }
  ```
- **Response** (Admin/SUPER_ADMIN):
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "email": "string",
      "role": "ADMIN",
      "isActive": true,
      "firstName": "string",
      "lastName": "string",
      "photo": "string",
      "gender": "MALE",
      "permissions": ["DASHBOARD", "ORDERS", "CUSTOMERS", "INVENTORY"],
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Profile updated successfully"
  }
  ```

### Delete Profile

- **API**: `DELETE /api/user/profile`
- **Access**: User
- **Request**: None
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Profile deleted successfully"
  }
  ```

### Get Addresses

- **API**: `GET /api/user/addresses`
- **Access**: User
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "addresses": [
        {
          "type": "HOME",
          "addressLine": "string",
          "landmark": "string",
          "city": "string",
          "state": "string",
          "postalCode": "string",
          "country": "string",
          "isDefault": true
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "message": "Addresses fetched successfully"
  }
  ```

### Set Default Address

- **API**: `PATCH /api/user/addresses/:index/set-default`
- **Access**: User
- **Parameters**:
  - `index` (number) - Address index
- **Response**: Updated addresses array

### Create Address

- **API**: `POST /api/user/addresses`
- **Access**: User
- **Request**:
  ```json
  {
    "type": "HOME",
    "addressLine": "string",
    "landmark": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string",
    "latitude": 0,
    "longitude": 0
  }
  ```
- **Note**:
  - Maximum 25 addresses allowed per user
  - `type` must be one of: "HOME", "WORK", "OTHER", "STORE"
  - `latitude` and `longitude` are optional
- **Response**: Updated addresses array

### Update Address

- **API**: `PUT /api/user/addresses/:index`
- **Access**: User
- **Parameters**:
  - `index` (number) - Address index
- **Request**: Address fields to update
- **Response**: Updated addresses array

### Delete Address

- **API**: `DELETE /api/user/addresses/:index`
- **Access**: User
- **Parameters**:
  - `index` (number) - Address index
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Address deleted successfully"
  }
  ```

### Get All Users (Admin)

- **API**: `GET /api/users/all`
- **Access**: Admin
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `role` (string, default: "CUSTOMER") - Filter by user role
  - `isActive` (boolean) - Filter by active status
  - `search` (string) - Search in firstName, lastName, phoneNumber, email
  - `sortBy` (string, default: "createdAt") - Field to sort by. Valid values: "createdAt", "updatedAt", "firstName", "lastName", "totalSpend", or any other user field
  - `sortOrder` (string, default: "desc") - "asc" or "desc"
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "_id": "string",
          "email": "string",
          "photo": "string",
          "gender": "MALE",
          "firstName": "string",
          "lastName": "string",
          "phoneNumber": "string",
          "role": "CUSTOMER",
          "isActive": true,
          "govtId": {
            "type": "GST",
            "number": "string"
          },
          "storeName": "string",
          "loyaltyTier": "BRONZE",
          "totalSpend": 0,
          "loyaltyDiscountPercent": 0,
          "addresses": [
            {
              "type": "HOME",
              "addressLine": "string",
              "landmark": "string",
              "city": "string",
              "state": "string",
              "postalCode": "string",
              "country": "string",
              "isDefault": true
            }
          ],
          "orders": ["string"],
          "totalSpend": 1234.56,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "pages": 10
      }
    },
    "message": "All users fetched successfully"
  }
  ```
- **Note**:
  - Returns only CUSTOMER users by default (can be filtered by role)
  - Sensitive fields like `refreshTokens` and `permissions` are excluded
  - Supports search across firstName, lastName, phoneNumber, and email
  - Results are paginated and sortable
  - **Sorting by `totalSpend`**: When `sortBy=totalSpend`, users are sorted by their total spending amount. Use `sortOrder=asc` for ascending (lowest spend first) or `sortOrder=desc` for descending (highest spend first)
  - `orders`: Array of order IDs belonging to the user. Orders are automatically added to this array when created (latest order appears first). Defaults to empty array `[]` if user has no orders
  - `totalSpend`: Total amount spent by the user across all **DELIVERED** orders (sum of `totalAmount` for orders where `status === "DELIVERED"`). Automatically kept in sync when orders are marked as DELIVERED or when delivered orders are deleted. Defaults to `0` if user has no delivered orders

### Get User by ID (Admin)

- **API**: `GET /api/users/:userId`
- **Access**: Admin
- **Parameters**:
  - `userId` (string) - User ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "email": "string",
      "photo": "string",
      "gender": "MALE",
      "firstName": "string",
      "lastName": "string",
      "phoneNumber": "string",
      "role": "CUSTOMER",
      "isActive": true,
      "govtId": {
        "type": "GST",
        "number": "string"
      },
      "storeName": "string",
      "loyaltyTier": "BRONZE",
      "totalSpend": 0,
      "loyaltyDiscountPercent": 0,
      "orders": ["string"],
      "defaultAddress": {
        "type": "HOME",
        "addressLine": "string",
        "city": "string",
        "state": "string",
        "postalCode": "string",
        "country": "string",
        "isDefault": true
      },
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "User fetched successfully"
  }
  ```
- **Note**:
  - Returns user in protected format (sensitive fields excluded)
  - Includes default address if available
  - Returns 404 if user not found

### Get Comprehensive Customer Details (Admin)

- **API**: `GET /api/users/:userId/details`
- **Access**: Admin
- **Parameters**:
  - `userId` (string) - Customer ID
- **Query Parameters**:
  - `status` (string, optional) - Filter orders by status
  - `search` (string, optional) - Search in order reference ID, product names
  - `page` (number, default: 1) - Page number for orders
  - `limit` (number, default: 10) - Items per page for orders
  - `sortBy` (string, default: "createdAt") - Field to sort orders by
  - `sortOrder` (string, default: "desc") - "asc" or "desc"
  - `period` (string, optional) - Time period: "today", "currentDate", "7days", "30days", "lastMonth", "6months", "12months", "all-time"
  - `startDate` (string, ISO date, optional) - Custom start date (overrides period if provided with endDate)
  - `endDate` (string, ISO date, optional) - Custom end date (overrides period if provided with startDate)
- **Note**:
  - Returns comprehensive customer information including:
    - Customer basic details (name, email, phone, addresses, loyalty info, etc.)
    - Order history with period-wise filtering (similar to orders API)
    - Order statistics (total orders, total spend, counts by status and payment method)
  - **Period Filtering**:
    - If both `startDate` and `endDate` are provided, they override the `period` parameter
    - Date format should be ISO date strings (YYYY-MM-DD)
    - Start date must be before end date
    - Orders are filtered by `createdAt` field based on the specified period or date range
    - Valid periods:
      - `"today"` or `"currentDate"`: Today's orders
      - `"7days"`: Last 7 days
      - `"30days"` or `"lastMonth"`: Last 30 days
      - `"6months"`: Last 6 months
      - `"12months"`: Last 12 months
      - `"all-time"`: All orders from the beginning
  - Order statistics are calculated for **all orders** of the customer (not filtered by period)
  - Order history is paginated and can be filtered by period, status, and search term
  - The `user` field in each order is populated with user details (firstName, lastName, phoneNumber, email, role) instead of just the user ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "customer": {
        "_id": "string",
        "email": "string",
        "photo": "string",
        "gender": "MALE",
        "firstName": "string",
        "lastName": "string",
        "phoneNumber": "string",
        "role": "CUSTOMER",
        "isActive": true,
        "govtId": {
          "type": "GST",
          "number": "string"
        },
        "storeName": "string",
        "loyaltyTier": "BRONZE",
        "totalSpend": 0,
        "loyaltyDiscountPercent": 0,
        "addresses": [
          {
            "type": "HOME",
            "addressLine": "string",
            "landmark": "string",
            "city": "string",
            "state": "string",
            "postalCode": "string",
            "country": "string",
            "isDefault": true
          }
        ],
        "orders": ["string"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "orders": [
        {
          "_id": "string",
          "refId": "string",
          "user": {
            "_id": "string",
            "firstName": "string",
            "lastName": "string",
            "phoneNumber": "string",
            "email": "string",
            "role": "CUSTOMER"
          },
          "items": [
            {
              "product": {
                "_id": "string",
                "name": "string",
                "description": "string",
                "images": ["string"],
                "category": "string",
                "subCategory": "string",
                "mrp": 100,
                "gst": 5,
                "hsn": "string",
                "slug": "string"
              },
              "productType": "product",
              "quantity": 2,
              "priceAtPurchase": 90,
              "discountApplied": 10
            }
          ],
          "totalAmount": 180,
          "originalAmount": 200,
          "shippingAddress": {
            "type": "HOME",
            "addressLine": "string",
            "city": "string",
            "state": "string",
            "postalCode": "string",
            "country": "string"
          },
          "billingAddress": {
            "type": "HOME",
            "addressLine": "string",
            "city": "string",
            "state": "string",
            "postalCode": "string",
            "country": "string"
          },
          "status": "DELIVERED",
          "payment": {
            "method": "UPI",
            "transactionId": "string",
            "status": "COMPLETED",
            "amount": 180
          },
          "orderNotes": "string",
          "updateHistory": [
            {
              "status": "PENDING",
              "updatedAt": "2024-01-01T00:00:00.000Z",
              "updatedBy": "SYSTEM",
              "reason": "Order created"
            }
          ],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "orderStatistics": {
        "totalOrders": 50,
        "totalSpend": 50000,
        "totalDelivered": 45,
        "totalPending": 2,
        "totalCancelled": 1,
        "totalReturned": 2,
        "totalUPIOrders": 30,
        "totalCODOrders": 15,
        "totalCardOrders": 5
      },
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 50,
        "pages": 5
      }
    },
    "message": "Customer details retrieved successfully"
  }
  ```

### Update User (Admin)

- **API**: `PATCH /api/users/:userId`
- **Access**: Admin
- **Parameters**:
  - `userId` (string) - User ID to update
- **Request**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "photo": "string",
    "email": "string",
    "gender": "MALE",
    "isActive": true,
    "govtId": {
      "type": "GST",
      "number": "string"
    },
    "storeName": "string",
    "loyaltyTier": "BRONZE",
    "totalSpend": 0,
    "loyaltyDiscountPercent": 0,
    "password": "string"
  }
  ```
- **Note**:
  - All fields are optional, but at least one field must be provided
  - Only allowed fields can be updated (filters out unauthorized fields)
  - `gender` must be one of: "MALE", "FEMALE", "OTHER"
  - `loyaltyTier` must be one of: "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"
  - `isActive` is a boolean field
  - `govtId` is an optional object with `type` (enum: "GST", "PAN", "UDYAM", "SHOP_LICENSE", "OTHER") and `number` (string) fields
  - `password`: Only applicable for Admin users. Password is automatically hashed using bcrypt before storing. For Consumer users, password field is ignored (they use OTP authentication)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "email": "string",
      "photo": "string",
      "gender": "MALE",
      "firstName": "string",
      "lastName": "string",
      "phoneNumber": "string",
      "role": "CUSTOMER",
      "isActive": true,
      "govtId": {
        "type": "GST",
        "number": "string"
      },
      "storeName": "string",
      "loyaltyTier": "BRONZE",
      "totalSpend": 0,
      "defaultAddress": {
        "type": "HOME",
        "addressLine": "string",
        "city": "string",
        "state": "string",
        "postalCode": "string",
        "country": "string",
        "isDefault": true
      },
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "User updated successfully"
  }
  ```

### Create Admin (SUPER_ADMIN only)

- **API**: `POST /api/users/admins`
- **Access**: Private (SUPER_ADMIN only)
- **Request**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "photo": "string",
    "gender": "MALE",
    "permissions": ["DASHBOARD", "ORDERS", "CUSTOMERS", "INVENTORY"],
    "isActive": true
  }
  ```
- **Note**:
  - Only `SUPER_ADMIN` users can create new admin accounts
  - `email` and `password` are required fields
  - `password` must be at least 6 characters long
  - `email` must be a valid email format
  - `firstName`, `lastName`, `photo`, `gender`, `permissions`, and `isActive` are optional
  - `gender` must be one of: "MALE", "FEMALE", "OTHER"
  - `permissions` must be an array of valid permission constants (see below)
  - `isActive` defaults to `true` if not provided
  - Password is automatically hashed using bcrypt before storing
  - Email must be unique (cannot create admin with existing email)
  - Valid permission constants are:
    - `DASHBOARD` - Dashboard access
    - `INVENTORY` - Inventory management
    - `ORDERS` - Orders management
    - `CUSTOMERS` - Customers management
    - `OFFERS_BANNERS` - Offers & Banners management
    - `ANALYTICS` - Analytics access
    - `MOST_SELLING` - Most Selling products
    - `SETTINGS` - Settings access
    - `ADMINS` - Admin management
    - `SUPPORT` - Support/Enquiries access
  - Invalid permissions will be filtered out automatically
  - Empty permissions array is allowed (creates admin with no permissions)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "email": "admin@example.com",
      "photo": "string",
      "gender": "MALE",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN",
      "isActive": true,
      "permissions": ["DASHBOARD", "ORDERS", "CUSTOMERS", "INVENTORY"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Admin created successfully"
  }
  ```
- **Error Responses**:
  - `400` - Bad Request: Missing required fields, invalid email format, password too short, invalid permissions, or email already exists
  - `401` - Unauthorized: User not authenticated
  - `403` - Forbidden: User is not a SUPER_ADMIN

### Update Admin Permissions (Admin with ADMINS permission)

- **API**: `PATCH /api/users/:adminId/permissions`
- **Access**: Private (Admin with ADMINS permission)
- **Parameters**:
  - `adminId` (string) - Admin user ID to update permissions for
- **Request**:
  ```json
  {
    "permissions": ["DASHBOARD", "ORDERS", "CUSTOMERS", "INVENTORY"]
  }
  ```
- **Note**:
  - Only admins with the `ADMINS` permission can use this endpoint
  - `SUPER_ADMIN` users automatically have access to all permissions
  - `permissions` must be an array of valid permission constants
  - Valid permission constants are:
    - `DASHBOARD` - Dashboard access
    - `INVENTORY` - Inventory management
    - `ORDERS` - Orders management
    - `CUSTOMERS` - Customers management
    - `OFFERS_BANNERS` - Offers & Banners management
    - `ANALYTICS` - Analytics access
    - `MOST_SELLING` - Most Selling products
    - `SETTINGS` - Settings access
    - `ADMINS` - Admin management
    - `SUPPORT` - Support/Enquiries access
  - Invalid permissions will be filtered out automatically
  - Empty array is allowed (removes all permissions from the admin)
  - The target user must be an admin (not a customer)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "email": "string",
      "photo": "string",
      "gender": "MALE",
      "firstName": "string",
      "lastName": "string",
      "role": "ADMIN",
      "isActive": true,
      "permissions": ["DASHBOARD", "ORDERS", "CUSTOMERS", "INVENTORY"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Admin permissions updated successfully"
  }
  ```
- **Error Responses**:
  - `400` - Bad Request: Missing adminId, missing permissions array, or invalid permissions
  - `401` - Unauthorized: User not authenticated or not an admin
  - `403` - Forbidden: User does not have ADMINS permission
  - `404` - Not Found: Admin user not found

### Delete User (Admin)

- **API**: `DELETE /api/user/:userId`
- **Access**: Admin
- **Parameters**:
  - `userId` (string) - User ID to delete
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "User deleted successfully"
  }
  ```
- **Note**:
  - Permanently deletes the user from the database
  - For Consumer users, also deletes associated cart
  - Removes order references from user's orders array
  - Prevents deletion of the last active SUPER_ADMIN
  - Returns 404 if user not found
- **Error Responses**:
  - `400` - Bad Request: Cannot delete the last active SUPER_ADMIN
  - `404` - Not Found: User not found

---

## 2.1 Loyalty Tier Config (Spend-based tiers)

Tiers are based on **total spend** (sum of delivered order totals). Admins set spend thresholds; when a customer's total spend reaches a threshold, they are promoted to the next tier. Tier names are fixed: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND.

### Get loyalty tier thresholds

- **API**: `GET /api/loyalty-tier-config`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "thresholds": [
        { "amount": 0, "tier": "BRONZE", "discountPercentage": 5 },
        { "amount": 50000, "tier": "SILVER", "discountPercentage": 10 },
        { "amount": 100000, "tier": "GOLD", "discountPercentage": 15 },
        { "amount": 200000, "tier": "PLATINUM", "discountPercentage": 20 },
        { "amount": 400000, "tier": "DIAMOND", "discountPercentage": 25 }
      ]
    }
  }
  ```

### Update loyalty tier thresholds (Admin)

- **API**: `PATCH /api/loyalty-tier-config`
- **Access**: Admin
- **Request**:
  ```json
  {
    "thresholds": [
      { "amount": 0, "tier": "BRONZE", "discountPercentage": 5 },
      { "amount": 50000, "tier": "SILVER", "discountPercentage": 10 },
      { "amount": 100000, "tier": "GOLD", "discountPercentage": 15 }
    ]
  }
  ```
- **Notes**:
  - `amount` is in ₹. When a customer's `totalSpend` (updated on order DELIVERED) meets or exceeds a threshold, their `loyaltyTier` is set to that tier. Tier names must be one of: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND.
  - `discountPercentage` (optional) defines the **loyalty discount** for that tier. This percentage is applied on the order total **after coupons** and is reflected in both cart totals and invoices.

---

## 3. Enquiry Endpoints

### Create Enquiry

- **API**: `POST /api/enquiry`
- **Access**: User
- **Request**:
  ```json
  {
    "type": "string",
    "message": "string",
    "images": ["string"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "userId": "string",
      "type": "string",
      "message": "string",
      "images": ["string"],
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Enquiry created successfully"
  }
  ```

### Get User Enquiries

- **API**: `GET /api/enquiry`
- **Access**: User (requires authentication)
- **Note**: This endpoint returns enquiries for the authenticated user only
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "userId": "string",
        "type": "string",
        "message": "string",
        "images": ["string"],
        "status": "PENDING",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "message": "Enquiries retrieved successfully"
  }
  ```

### Get All Enquiries (Admin)

- **API**: `GET /api/enquiry/all`
- **Access**: Admin
- **Query Parameters**:
  - `page` (number, default: 1) - Page number
  - `limit` (number, default: 10) - Items per page
  - `type` (string, optional) - Filter by enquiry type
  - `status` (string, optional) - Filter by status (PENDING, RESOLVED, CLOSED)
  - `userId` (string, optional) - Filter by user ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "enquiries": [
        {
          "_id": "string",
          "user": {
            "_id": "string",
            "firstName": "string",
            "lastName": "string",
            "phoneNumber": "string",
            "email": "string",
            "role": "CUSTOMER"
          },
          "type": "string",
          "message": "string",
          "images": ["string"],
          "status": "PENDING",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "total": 50,
      "totalPages": 5,
      "page": 1
    },
    "message": "Enquiries retrieved successfully"
  }
  ```

### Get Enquiry by ID

- **API**: `GET /api/enquiry/:enquiryId`
- **Access**: Admin
- **Response**: Single enquiry object

### Update Enquiry

- **API**: `PUT /api/enquiry/:enquiryId`
- **Access**: Admin
- **Request**:
  ```json
  {
    "status": "PENDING"
  }
  ```
- **Note**: Status must be one of: "PENDING", "RESOLVED", "CLOSED"
- **Response**: Updated enquiry object

### Delete Enquiry

- **API**: `DELETE /api/enquiry/:enquiryId`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Enquiry deleted successfully"
  }
  ```

---

## 4. Product Endpoints

### Get All Products

- **API**: `GET /api/products`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `category` (string) - Category ID
  - `subCategory` (string) - Subcategory ID
  - `status` (string) - ACTIVE, OUT_OF_STOCK, DISCONTINUED (if not specified, returns ACTIVE and OUT_OF_STOCK, excluding DISCONTINUED)
  - `isOrganic` (boolean)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `search` (string) - Search in name, description, SKU
  - `name` (string) - Filter by product name
  - `filter` (string) - "pfy" for Pay For Yourself products, "dotd" for Deal of the Day products
- **Note**:
  - By default, returns products with status ACTIVE and OUT_OF_STOCK (excludes DISCONTINUED)
  - Products are automatically sorted by status: ACTIVE products appear first, followed by OUT_OF_STOCK products
  - Within the same status, products are sorted by creation date (newest first)
  - To get only ACTIVE products, explicitly set `status=ACTIVE`
  - To get only OUT_OF_STOCK products, explicitly set `status=OUT_OF_STOCK`
  - To get DISCONTINUED products, explicitly set `status=DISCONTINUED`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "_id": "string",
          "sku": "string",
          "name": "string",
          "title2": "string",
          "title3": "string",
          "title4": "string",
          "type": "product",
          "description": "string",
          "highlights": [
            {
              "key": "string",
              "value": "string"
            }
          ],
          "category": "string",
          "subCategory": "string",
          "images": ["string"],
          "status": "ACTIVE",
          "isOrganic": true,
          "mrp": 100,
          "pricing_range": [
            {
              "quantity_start": 1,
              "quantity_end": 10,
              "price": 90
            }
          ],
          "discount": {
            "type": "percentage",
            "value": 10,
            "startDate": "2024-01-01T00:00:00.000Z",
            "endDate": "2024-12-31T23:59:59.000Z",
            "isActive": true
          },
          "minimumOrderQuantity": 1,
          "maximumOrderQuantity": 100,
          "stock": 50,
          "weight": {
            "value": 1,
            "unit": "kg"
          },
          "reviewsCount": 10,
          "totalRating": 4.5,
          "productCollections": [
            {
              "quantity": 1,
              "price": 90,
              "unit": "kg"
            }
          ],
          "alertExpiry": 7,
          "expiry": "2024-12-31T23:59:59.000Z",
          "metaTitle": "string",
          "metaDescription": "string",
          "metaKeywords": ["string"],
          "slug": "string",
          "isB2B": false,
          "dotd": false,
          "pfy": false,
          "isEssential": false,
          "productDiscountPage": false,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 10,
        "totalItems": 100,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "message": "Products retrieved successfully"
  }
  ```

- **Product Fields**:
  - `productDiscountPage` (boolean) - When true, the product appears on the dedicated discounts page (`/discounts`). Default: false.

### Get Product by ID

- **API**: `GET /api/products/:id`
- **Access**: Public
- **Response**: Same as single product object above

### Get Product by Slug

- **API**: `GET /api/products/slug/:slug`
- **Access**: Public
- **Response**: Same as single product object above

### Get Deal of the Day Products

- **API**: `GET /api/products/deal-of-the-day`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Note**: 
  - Returns only products with `dotd: true` and `status: "ACTIVE"`
  - Products are sorted by creation date (newest first)
- **Response**: Same as products list response

### Get PFY Products

- **API**: `GET /api/products/pfy`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Note**: 
  - Returns only products with `pfy: true` and `status: "ACTIVE"`
  - Products are sorted by creation date (newest first)
- **Response**: Same as products list response

### Get Essential Products

- **API**: `GET /api/products/essential`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Response**: Same as products list response
- **Note**: 
  - Returns only products where `isEssential: true` and `status: "ACTIVE"` (OUT_OF_STOCK essential products are excluded from this endpoint)
  - Products are sorted by creation date (newest first)

### Get Product Discount Page Products

- **API**: `GET /api/products/product-discount-page`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Response**: Same as products list response
- **Note**: 
  - Returns only products where `productDiscountPage: true` and `status: "ACTIVE"`
  - Products are sorted by status (ACTIVE first, then OUT_OF_STOCK) and creation date (newest first)
  - Used to power the dedicated discounts page (`/discounts`) on the frontend

### Get Out of Stock Products

- **API**: `GET /api/products/inventory/out-of-stock`
- **Access**: Admin
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `search` (string)
- **Response**: Same as products list response

### Get Expired Products

- **API**: `GET /api/products/inventory/expired`
- **Access**: Admin
- **Query Parameters**: Same as out of stock
- **Response**: Same as products list response

### Get Products Close to Expiry

- **API**: `GET /api/products/inventory/close-to-expiry`
- **Access**: Admin
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `search` (string)
- **Response**: Same as products list response
- **Note**: Returns products expiring within the next 7 days

### Get Long Unsold Products

- **API**: `GET /api/products/inventory/long-unsold`
- **Access**: Admin
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `daysThreshold` (number, default: 90) - Number of days to check for unsold products
  - `search` (string)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "_id": "string",
          "sku": "string",
          "name": "string",
          "title2": "string",
          "title3": "string",
          "title4": "string",
          "type": "product",
          "description": "string",
          "highlights": [
            {
              "key": "string",
              "value": "string"
            }
          ],
          "category": {
            "_id": "string",
            "name": "string"
          },
          "subCategory": {
            "_id": "string",
            "name": "string"
          },
          "images": ["string"],
          "status": "ACTIVE",
          "isOrganic": true,
          "mrp": 100,
          "pricing_range": [
            {
              "quantity_start": 1,
              "quantity_end": 10,
              "price": 90
            }
          ],
          "discount": {
            "type": "percentage",
            "value": 10,
            "startDate": "2024-01-01T00:00:00.000Z",
            "endDate": "2024-12-31T23:59:59.000Z",
            "isActive": true
          },
          "minimumOrderQuantity": 1,
          "maximumOrderQuantity": 100,
          "stock": 50,
          "weight": {
            "value": 1,
            "unit": "kg"
          },
          "reviewsCount": 10,
          "totalRating": 4.5,
          "productCollections": [
            {
              "quantity": 1,
              "price": 90,
              "unit": "kg"
            }
          ],
          "alertExpiry": 7,
          "expiry": "2024-12-31T23:59:59.000Z",
          "metaTitle": "string",
          "metaDescription": "string",
          "metaKeywords": ["string"],
          "slug": "string",
          "isB2B": false,
          "dotd": false,
          "pfy": false,
          "isEssential": false,
          "productDiscountPage": false,
          "lastSoldAt": "2024-01-01T00:00:00.000Z",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "total": 50,
      "totalPages": 5,
      "page": 1
    },
    "message": "Long unsold products retrieved successfully"
  }
  ```
- **Note**:
  - Returns products that haven't been sold in completed/delivered orders within the specified number of days
  - Each product includes `lastSoldAt` field which is the date when the product was last sold (null if never sold)
  - Only checks orders with status "COMPLETED" or "DELIVERED"

### Create Product

- **API**: `POST /api/products`
- **Access**: Admin
- **Request**:
  ```json
  {
    "sku": "string",
    "name": "string",
    "title2": "string",
    "title3": "string",
    "title4": "string",
    "description": "string",
    "highlights": [
      {
        "key": "string",
        "value": "string"
      }
    ],
    "category": "string",
    "subCategory": "string",
    "images": ["string"],
    "status": "ACTIVE",
    "isOrganic": true,
    "mrp": 100,
    "pricing_range": [
      {
        "quantity_start": 1,
        "quantity_end": 10,
        "price": 90
      }
    ],
    "discount": {
      "type": "percentage",
      "value": 10,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "isActive": true
    },
    "minimumOrderQuantity": 1,
    "maximumOrderQuantity": 100,
    "stock": 50,
    "weight": {
      "value": 1,
      "unit": "kg"
    },
    "productCollections": [
      {
        "quantity": 1,
        "price": 90,
        "unit": "kg"
      }
    ],
    "alertExpiry": 7,
    "expiry": "2024-12-31T23:59:59.000Z",
    "metaTitle": "string",
    "metaDescription": "string",
    "metaKeywords": ["string"],
    "slug": "string",
    "isB2B": false,
    "dotd": false,
    "pfy": false,
    "isEssential": false,
    "productDiscountPage": false
  }
  ```
- **Note**:
  - `subCategory` is optional - products can be created without a subcategory
  - `category` is required for products with status other than "DISCONTINUED"
  - `dotd`, `pfy`, `isEssential`, and `productDiscountPage` are boolean fields (default: false)
  - `productDiscountPage` - when true, product appears on the discounts page (`/discounts`)
  - `title2`, `title3`, and `title4` are optional string fields
- **Response**: Created product object

### Update Product

- **API**: `PUT /api/products/:id`
- **Access**: Admin
- **Request**: Any product fields to update
- **Note**:
  - `subCategory` is optional - can be set to null to remove subcategory from product
  - `category` is required for products with status other than "DISCONTINUED"
- **Response**: Updated product object

### Delete Product

- **API**: `DELETE /api/products/:id`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Product deleted successfully"
  }
  ```

---

## 6. Category Endpoints

### Get All Categories

- **API**: `GET /api/categories`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `isActive` (boolean)
  - `parentCategory` (string)
  - `search` (string)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "categories": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "image": "string",
          "isActive": true,
          "parentCategory": "string",
          "metaTitle": "string",
          "metaDescription": "string",
          "metaKeywords": ["string"],
          "slug": "string",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "message": "Categories retrieved successfully"
  }
  ```

### Get Category by ID

- **API**: `GET /api/categories/:id`
- **Access**: Public
- **Response**: Single category object

### Get Category Products by ID

- **API**: `GET /api/categories/:id/products`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Response**: Products list response
- **Note**: 
  - Returns products with status ACTIVE and OUT_OF_STOCK (excludes DISCONTINUED)
  - Products are automatically sorted by status: ACTIVE products appear first, followed by OUT_OF_STOCK products
  - Within the same status, products are sorted by creation date (newest first)

### Get Category Products by Slug

- **API**: `GET /api/categories/slug/:slug/products`
- **Access**: Public
- **Query Parameters**: Same as above
- **Response**: Products list response
- **Note**: 
  - Returns products with status ACTIVE and OUT_OF_STOCK (excludes DISCONTINUED)
  - Products are automatically sorted by status: ACTIVE products appear first, followed by OUT_OF_STOCK products
  - Within the same status, products are sorted by creation date (newest first)

### Get Subcategories

- **API**: `GET /api/categories/:id/subcategories`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "parentCategory": "string",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "message": "Subcategories retrieved successfully"
  }
  ```

### Get Subcategory by ID

- **API**: `GET /api/categories/subcategories/:id`
- **Access**: Public
- **Response**: Single subcategory object

### Create Category

- **API**: `POST /api/categories`
- **Access**: Admin
- **Request**:
  ```json
  {
    "name": "string",
    "description": "string",
    "image": "string",
    "isActive": true,
    "parentCategory": "string",
    "metaTitle": "string",
    "metaDescription": "string",
    "metaKeywords": ["string"],
    "slug": "string"
  }
  ```
- **Response**: Created category object

### Create Subcategory

- **API**: `POST /api/categories/subcategories`
- **Access**: Admin
- **Request**:
  ```json
  {
    "name": "string",
    "description": "string",
    "parentCategory": "string",
    "isActive": true
  }
  ```
- **Response**: Created subcategory object

### Update Category

- **API**: `PUT /api/categories/:id`
- **Access**: Admin
- **Request**: Any category fields to update
- **Response**: Updated category object

### Update Subcategory

- **API**: `PUT /api/categories/subcategories/:id`
- **Access**: Admin
- **Request**: Any subcategory fields to update
- **Response**: Updated subcategory object

### Delete Category

- **API**: `DELETE /api/categories/:id`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Category deleted successfully"
  }
  ```
- **Note**:
  - Categories can be deleted even if they have associated products
  - When a category is deleted:
    - All products with this category will have their `category` field set to `null`
    - All subcategories with this category as parent will be **deleted** (cascading deletion)
    - For each deleted subcategory, products referencing it will have their `subCategory` field set to `null`
    - Category image will be deleted from S3

### Delete Subcategory

- **API**: `DELETE /api/categories/subcategories/:id`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Subcategory deleted successfully"
  }
  ```
- **Note**:
  - Subcategories can be deleted even if they have associated products
  - When a subcategory is deleted:
    - All products with this subcategory will have their `subCategory` field set to `null`
    - Subcategory image will be deleted from S3

---

## 7. Cart Endpoints

### Get Cart

- **API**: `GET /api/cart`
- **Access**: User
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "product": "string",
          "productType": "product",
          "quantity": 2,
          "addedAt": "2024-01-01T00:00:00.000Z",
          "productDetails": {
            "_id": "string",
            "name": "string",
            "mrp": 100,
            "images": ["string"]
          }
        }
      ],
      "totalItems": 2,
      "totalPrice": 200
    },
    "message": "Cart retrieved successfully"
  }
  ```

### Add to Cart

- **API**: `POST /api/cart/add`
- **Access**: User
- **Request**:
  ```json
  {
    "productId": "string",
    "productType": "product",
    "quantity": 1
  }
  ```
- **Note**:
  - `productType` must be either "product" or "combo"
  - `quantity` must be greater than 0
- **Response**: Updated cart object

### Update Cart Item

- **API**: `PUT /api/cart/update`
- **Access**: User
- **Request**:
  ```json
  {
    "productId": "string",
    "productType": "product",
    "quantity": 3
  }
  ```
- **Note**:
  - `productType` must be either "product" or "combo"
  - `quantity` must be greater than or equal to 0 (0 removes the item)
- **Response**: Updated cart object

### Remove from Cart

- **API**: `DELETE /api/cart/remove`
- **Access**: User
- **Request**:
  ```json
  {
    "productId": "string",
    "productType": "product"
  }
  ```
- **Response**: Updated cart object

---

## 5. Shipping Charges Endpoints

### Get Shipping Charges

- **API**: `GET /api/shipping-charges`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "charges": 50
    },
    "message": "Shipping charges retrieved successfully"
  }
  ```
- **Note**: Used by cart and payment to display delivery charges. Returns 0 if no charges configured.

### Update Shipping Charges

- **API**: `PUT /api/shipping-charges`
- **Access**: Admin
- **Request**:
  ```json
  {
    "charges": 50
  }
  ```
- **Response**: Updated shipping charges document
- **Note**: `charges` must be a non-negative number.

---

## 6. Combo Endpoints

### Get All Combos

- **API**: `GET /api/combos`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `status` (string)
  - `isOrganic` (boolean)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `search` (string)
  - `random` (boolean) - If true, returns random combos
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "combos": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "type": "combo",
          "images": ["string"],
          "status": "ACTIVE",
          "isOrganic": true,
          "mrp": 200,
          "productIds": ["string"],
          "products": [
            {
              "_id": "string",
              "name": "string",
              "mrp": 100,
              "images": ["string"]
            }
          ],
          "stock": 10,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "message": "Combos retrieved successfully"
  }
  ```

### Get Combo by ID

- **API**: `GET /api/combos/:id`
- **Access**: Public
- **Response**: Single combo object

### Get Combo Products

- **API**: `GET /api/combos/:id/products`
- **Access**: Public
- **Response**: Products list in the combo

### Get Suggested Combo Deals

- **API**: `GET /api/combos/suggested/:productId`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Response**: Combos list response

### Validate Combo

- **API**: `GET /api/combos/:id/validate`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "isValid": true,
      "availableStock": 10,
      "errors": []
    },
    "message": "Combo validation completed"
  }
  ```

### Get Combo Stats

- **API**: `GET /api/combos/:id/stats`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalViews": 100,
      "totalPurchases": 50,
      "conversionRate": 0.5
    },
    "message": "Combo stats retrieved successfully"
  }
  ```

### Create Combo

- **API**: `POST /api/combos`
- **Access**: Admin
- **Request**:
  ```json
  {
    "name": "string",
    "description": "string",
    "images": ["string"],
    "status": "ACTIVE",
    "isOrganic": true,
    "mrp": 200,
    "products": ["string"],
    "stock": 10
  }
  ```
- **Note**: `products` array is required and must contain at least one product ID
- **Response**: Created combo object

### Update Combo

- **API**: `PUT /api/combos/:id`
- **Access**: Admin
- **Request**: Any combo fields to update
- **Response**: Updated combo object

### Update Combo Stock

- **API**: `PATCH /api/combos/:id/stock`
- **Access**: Admin
- **Request**:
  ```json
  {
    "quantity": 20
  }
  ```
- **Response**: Updated combo object

### Delete Combo

- **API**: `DELETE /api/combos/:id`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Combo deleted successfully"
  }
  ```

---

## 8. Coupon Endpoints

### Coupon Access Types

Coupons have two access types:
- **GENERAL** (default): Accessible by everyone
- **LIMITED**: Restricted to specific users only; requires `allowedUserIds` array

When validating or fetching applicable coupons:
- **Validate** (`POST /api/coupons/validate`): Send `Authorization: Bearer <token>` when logged in. LIMITED coupons require authentication and the user must be in `allowedUserIds`.
- **Applicable for Product** (`GET /api/coupons/applicable-for-product/:productId`): Send `Authorization: Bearer <token>` when logged in. Returns only GENERAL coupons for unauthenticated requests; includes LIMITED coupons for allowed users when authenticated.

### Applicable Products & Categories

Coupons can be restricted by products and/or categories:
- **applicableProducts** (optional): Array of product IDs. Leave empty to apply to all products. When set, cart must contain at least one of these products.
- **applicableCategories** (optional): Array of category IDs. Leave empty to apply to all categories. When set, cart must contain at least one product from these categories.
- When **both** are set, cart qualifies if it has a matching product **OR** a matching category (either condition is enough).
- Validation uses `productIds` and `categoryIds` from the cart when calling `POST /api/coupons/validate`.

### Get All Coupons (Admin)

- **API**: `GET /api/coupons`
- **Access**: Admin
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `isActive` (boolean)
  - `type` (string)
  - `search` (string)
  - `validOnly` (boolean)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "coupons": [
        {
          "_id": "string",
          "code": "string",
          "type": "percentage",
          "description": "string",
          "value": 10,
          "accessType": "GENERAL",
          "allowedUserIds": ["string"],
          "applicableProducts": ["string"],
          "applicableCategories": ["string"],
          "minimumPurchaseAmount": 100,
          "maximumDiscountAmount": 50,
          "validFrom": "2024-01-01T00:00:00.000Z",
          "validUntil": "2024-12-31T23:59:59.000Z",
          "maxUses": 100,
          "currentUses": 25,
          "maxUsesPerUser": 1,
          "perUserResetHours": 24,
          "isActive": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "message": "Coupons retrieved successfully"
  }
  ```

### Get Coupon by Code

- **API**: `GET /api/coupons/code/:code`
- **Access**: Public
- **Response**: Single coupon object

### Get Coupon by ID

- **API**: `GET /api/coupons/:id`
- **Access**: Admin
- **Response**: Single coupon object

### Get Coupon Stats

- **API**: `GET /api/coupons/:id/stats`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalUses": 25,
      "remainingUses": 75,
      "totalDiscountGiven": 500,
      "conversionRate": 0.15
    },
    "message": "Coupon stats retrieved successfully"
  }
  ```

### Create Coupon

- **API**: `POST /api/coupons`
- **Access**: Admin (requires `verifyUser` + `verifyAdmin`)
- **Request**:
  ```json
  {
    "code": "string",
    "type": "percentage",
    "description": "string",
      "value": 10,
      "accessType": "GENERAL",
      "allowedUserIds": ["string"],
      "applicableProducts": ["string"],
      "applicableCategories": ["string"],
      "minimumPurchaseAmount": 100,
      "maximumDiscountAmount": 50,
      "validFrom": "2024-01-01T00:00:00.000Z",
      "validUntil": "2024-12-31T23:59:59.000Z",
      "maxUses": 100,
      "maxUsesPerUser": 1,
      "perUserResetHours": 24,
      "isActive": true
  }
  ```
- **Required**: `code`, `type`, `description`, `value`, `validFrom`, `validUntil`
- **Optional**: `accessType`, `allowedUserIds`, `applicableProducts`, `applicableCategories`, `minimumPurchaseAmount`, `maximumDiscountAmount`, `maxUses`, `maxUsesPerUser`, `perUserResetHours`, `isActive`
- **Notes**:
  - `accessType` (optional, default: "GENERAL"): "GENERAL" for everyone, "LIMITED" for specific users only
  - `allowedUserIds` (optional): Array of user IDs who can use the coupon; required when `accessType` is "LIMITED"
  - `code` is automatically converted to uppercase
  - `maxUses` (optional): Global usage cap across all users
  - `maxUsesPerUser` (optional): Maximum number of times a single user can use this coupon within the reset window
  - `perUserResetHours` (optional): Rolling reset window in hours for `maxUsesPerUser` (e.g. `24` = once per day per user, `6` = once every 6 hours per user). If omitted, `maxUsesPerUser` applies over the coupon's entire lifetime
- **Response**: Created coupon object

### Validate Coupon

- **API**: `POST /api/coupons/validate`
- **Access**: Public (optional auth for LIMITED coupons)
- **Headers**: `Authorization: Bearer <accessToken>` (optional; required for LIMITED coupons)
- **Request**:
  ```json
  {
    "code": "string",
    "cartTotal": 200,
    "productIds": ["string"],
    "categoryIds": ["string"]
  }
  ```
- **Response** (valid):
  ```json
  {
    "success": true,
    "data": {
      "isValid": true,
      "discountAmount": 20,
      "message": "Coupon is valid",
      "coupon": { }
    },
    "message": "Coupon is valid"
  }
  ```
- **Response** (invalid): `isValid: false`, `discountAmount: 0`, and a specific `message` (e.g. "Coupon not applicable to items in cart", "Minimum purchase amount of ₹X required")
- **Note**:
  - `productIds` and `categoryIds` should be extracted from cart items for applicability checks
  - For LIMITED coupons: requires auth; returns "This coupon is restricted to specific users. Please log in to use it." when unauthenticated
  - Returns "You are not eligible to use this coupon" when user is not in `allowedUserIds`

### Get Applicable Coupons for Product

- **API**: `GET /api/coupons/applicable-for-product/:productId`
- **Access**: Public (optional auth for LIMITED coupons)
- **Headers**: `Authorization: Bearer <accessToken>` (optional; when present, includes LIMITED coupons if user is in `allowedUserIds`)
- **Parameters**: `productId` - The product ID
- **Response**: Array of coupon objects applicable to that product
- **Note**:
  - Unauthenticated: returns only GENERAL coupons
  - Authenticated: returns GENERAL coupons + LIMITED coupons where user is in `allowedUserIds`

### Get Applicable Coupons for Cart

- **API**: `POST /api/coupons/applicable-for-cart`
- **Access**: Public (optional auth for LIMITED coupons)
- **Headers**: `Authorization: Bearer <accessToken>` (optional; when present, includes LIMITED coupons if user is in `allowedUserIds`)
- **Request**:
  ```json
  {
    "productIds": ["string"],
    "categoryIds": ["string"],
    "cartTotal": 200
  }
  ```
- **Response**: Array of coupon objects applicable to the cart (filtered by products, categories, min purchase, usage limits)
- **Note**: Returns only coupons that match cart items and meet minimum purchase; use `GET /api/coupons/available-for-display` to show all coupons regardless of applicability

### Get Available Coupons for Display

- **API**: `GET /api/coupons/available-for-display`
- **Access**: Public (optional auth for LIMITED coupons)
- **Headers**: `Authorization: Bearer <accessToken>` (optional; when present, includes LIMITED coupons if user is in `allowedUserIds`)
- **Response**: Array of all displayable coupon objects (active, within valid dates, not maxed out)
- **Note**:
  - Returns **all** coupons without filtering by product/category or minimum purchase
  - Use for displaying in cart/checkout; validation will reject non-applicable coupons when user attempts to apply
  - Unauthenticated: returns only GENERAL coupons
  - Authenticated: returns GENERAL + LIMITED coupons where user is in `allowedUserIds`

### Update Coupon

- **API**: `PUT /api/coupons/:id`
- **Access**: Admin
- **Request**: Any coupon fields to update
- **Response**: Updated coupon object

### Delete Coupon

- **API**: `DELETE /api/coupons/:id`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Coupon deleted successfully"
  }
  ```

---

## 9. Dashboard Endpoints (Admin Only)

### Get Complete Dashboard

- **API**: `GET /api/dashboard`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "todaySales": 1000,
        "totalSales": 50000,
        "totalOrders": 200,
        "totalCustomers": 150
      },
      "salesReport": {
        "period": "12months",
        "data": [
          {
            "month": "2024-01",
            "sales": 5000,
            "orders": 20
          }
        ]
      },
      "topSellingProducts": [
        {
          "productId": "string",
          "name": "string",
          "totalSales": 1000,
          "totalQuantity": 50
        }
      ],
      "lowStockProducts": [
        {
          "productId": "string",
          "name": "string",
          "currentStock": 5,
          "threshold": 10
        }
      ],
      "inventorySummary": {
        "totalProducts": 100,
        "outOfStock": 5,
        "lowStock": 10,
        "totalValue": 100000
      }
    },
    "message": "Dashboard data retrieved successfully"
  }
  ```

### Get Dashboard Stats

- **API**: `GET /api/dashboard/stats`
- **Access**: Admin
- **Response**: Stats object from complete dashboard

### Get Sales Report

- **API**: `GET /api/dashboard/sales-report`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string) - "7days", "30days", "6months", "12months" (default: "12months")
- **Response**: Sales report object from complete dashboard

### Get Top Selling Products

- **API**: `GET /api/dashboard/top-selling`
- **Access**: Admin
- **Query Parameters**:
  - `limit` (number, default: 10, max: 50) - Number of top products to return
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "sku": "string",
        "name": "string",
        "type": "product",
        "description": "string",
        "highlights": [
          {
            "key": "string",
            "value": "string"
          }
        ],
        "category": {
          "_id": "string",
          "name": "string"
        },
        "subCategory": {
          "_id": "string",
          "name": "string"
        },
        "images": ["string"],
        "status": "ACTIVE",
        "isOrganic": true,
        "mrp": 100,
        "pricing_range": [
          {
            "quantity_start": 1,
            "quantity_end": 10,
            "price": 90
          }
        ],
        "discount": {
          "type": "percentage",
          "value": 10,
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-12-31T23:59:59.000Z",
          "isActive": true
        },
        "minimumOrderQuantity": 1,
        "maximumOrderQuantity": 100,
        "stock": 50,
        "weight": {
          "value": 1,
          "unit": "kg"
        },
        "reviewsCount": 10,
        "totalRating": 4.5,
        "productCollections": [
          {
            "quantity": 1,
            "price": 90,
            "unit": "kg"
          }
        ],
        "alertExpiry": 7,
        "expiry": "2024-12-31T23:59:59.000Z",
        "metaTitle": "string",
        "metaDescription": "string",
        "metaKeywords": ["string"],
        "slug": "string",
        "isB2B": false,
        "dotd": false,
        "pfy": false,
        "isEssential": false,
        "productDiscountPage": false,
        "soldQuantity": 150,
        "revenue": 13500,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "message": "Top selling products retrieved successfully"
  }
  ```
- **Note**:
  - Returns products sorted by sold quantity (last 30 days)
  - Only includes products from completed/delivered orders in the last 30 days
  - Each product includes full product information plus:
    - `soldQuantity`: Total quantity sold in the last 30 days
    - `revenue`: Total revenue generated in the last 30 days
  - Only returns products (not combos)

### Get Low Stock Products

- **API**: `GET /api/dashboard/low-stock`
- **Access**: Admin
- **Query Parameters**:
  - `threshold` (number, default: 10) - Stock threshold for low stock alert
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "productId": "string",
        "name": "string",
        "currentStock": 5,
        "type": "product",
        "status": "ACTIVE"
      }
    ],
    "message": "Low stock products retrieved successfully"
  }
  ```
- **Note**: Returns both products and combos with stock at or below the threshold, sorted by stock (lowest first)

### Get Inventory Summary

- **API**: `GET /api/dashboard/inventory-summary`
- **Access**: Admin
- **Response**: Inventory summary object

### Get Product Summary

- **API**: `GET /api/dashboard/product-summary`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalProducts": 100,
      "activeProducts": 95,
      "outOfStockProducts": 5,
      "totalCategories": 10,
      "totalSubcategories": 25
    },
    "message": "Product summary retrieved successfully"
  }
  ```

### Export Sales Report

- **API**: `GET /api/dashboard/export-sales-report`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string) - "7days", "30days", "6months", "12months" (default: "12months")
- **Response**: Excel file download

### Get Inventory

- **API**: `GET /api/dashboard/inventory`
- **Access**: Admin
- **Query Parameters**:
  - `page` (number, default: 1) - Page number
  - `limit` (number, default: 10, max: 100) - Items per page
  - `search` (string) - Search term to search across product name, category name, and subcategory name
- **Note**:
  - The `search` parameter performs case-insensitive search across:
    - Product name
    - Category name
    - Subcategory name
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalInventoryValue": 1000000,
      "totalProducts": 150,
      "totalCombos": 25,
      "data": {
        "products": [
          {
            "_id": "string",
            "sku": "string",
            "name": "string",
            "type": "product",
            "description": "string",
            "highlights": [
              {
                "key": "string",
                "value": "string"
              }
            ],
            "category": {
              "_id": "string",
              "name": "string"
            },
            "subCategory": {
              "_id": "string",
              "name": "string"
            },
            "images": ["string"],
            "status": "ACTIVE",
            "isOrganic": true,
            "mrp": 100,
            "pricing_range": [
              {
                "quantity_start": 1,
                "quantity_end": 10,
                "price": 90
              }
            ],
            "discount": {
              "type": "percentage",
              "value": 10,
              "startDate": "2024-01-01T00:00:00.000Z",
              "endDate": "2024-12-31T23:59:59.000Z",
              "isActive": true
            },
            "minimumOrderQuantity": 1,
            "maximumOrderQuantity": 100,
            "stock": 50,
            "weight": {
              "value": 1,
              "unit": "kg"
            },
            "reviewsCount": 10,
            "totalRating": 4.5,
            "productCollections": [
              {
                "quantity": 1,
                "price": 90,
                "unit": "kg"
              }
            ],
            "alertExpiry": 7,
            "expiry": "2024-12-31T23:59:59.000Z",
            "metaTitle": "string",
            "metaDescription": "string",
            "metaKeywords": ["string"],
            "slug": "string",
            "isB2B": false,
            "dotd": false,
            "pfy": false,
            "isEssential": false,
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
          }
        ],
        "page": 1,
        "totalPages": 15
      }
    },
    "message": "Inventory data retrieved successfully"
  }
  ```
- **Note**:
  - `totalInventoryValue` is calculated as the sum of (MRP × stock) for all active products plus (price × stock) for all active combos
  - `totalProducts` is the total count of all products (regardless of status)
  - `totalCombos` is the total count of all combos (regardless of status)
  - Products are sorted by creation date (newest first)
  - Products include populated category and subCategory fields

### Get Dashboard Statistics

- **API**: `GET /api/dashboard/statistics`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "performanceSummary": {
        "todaySales": 5000,
        "totalSales": 500000,
        "totalOrders": 2000,
        "totalCustomers": 1500
      },
      "orderStatistics": {
        "totalReceivedOrders": 1800,
        "totalReceivedRevenue": 450000,
        "totalReturnedOrders": 50,
        "totalReturnedRevenue": 12500,
        "ordersOnTheWay": 150,
        "ordersOnTheWayCost": 37500
      },
      "salesReport": {
        "salesTrend": [
          {
            "date": "2024-01-01",
            "sales": 5000
          }
        ],
        "ordersTrend": [
          {
            "date": "2024-01-01",
            "orders": 20
          }
        ]
      },
      "inventorySummary": {
        "totalProducts": 150,
        "outOfStockProducts": 10,
        "lowStockProducts": 25,
        "totalInventoryValue": 1000000
      },
      "productAnalytics": {
        "topSellingProducts": [
          {
            "name": "Product Name",
            "soldQuantity": 150,
            "revenue": 13500,
            "stock": 50
          }
        ],
        "lowQuantityStock": [
          {
            "name": "Product Name",
            "currentStock": 5,
            "threshold": 10
          }
        ]
      },
      "customerAnalytics": {
        "newCustomers": 25,
        "newCustomersGrowth": 15.5
      },
      "categoryAnalytics": [
        {
          "categoryName": "Category Name",
          "totalSales": 50000,
          "percentage": 30.5
        }
      ],
      "growthMetrics": {
        "todaySalesGrowth": 10.5,
        "totalSalesGrowth": 20.3,
        "totalOrdersGrowth": 15.2,
        "totalCustomersGrowth": 12.8
      }
    },
    "message": "Dashboard statistics retrieved successfully"
  }
  ```
- **Note**:
  - **Performance Summary**: Today's sales, total sales, total orders, and total customers
  - **Order Statistics**: All-time statistics for received, returned, and on-the-way orders
  - **Sales Report**: Last 30 days trends for sales and orders (daily breakdown). Includes orders with status "COMPLETED" or "DELIVERED"
  - **Inventory Summary**: Total products, out of stock count, low stock count, and total inventory value
  - **Product Analytics**:
    - Top selling products (last 30 days) with sold quantity, revenue, and stock
    - Low quantity stock products (threshold: 10)
  - **Customer Analytics**: New customers in last 30 days with growth percentage (compared to previous 30 days)
  - **Category Analytics**: Sales breakdown by category with percentages
  - **Growth Metrics**:
    - Today's sales growth (compared to yesterday)
    - Total sales growth (compared to previous 30 days)
    - Total orders growth (compared to previous 30 days)
    - Total customers growth (compared to previous 30 days)
  - All growth percentages are rounded to 2 decimal places

---

## 10. Analytics Endpoints (Admin Only)

### Get Analytics Page

- **API**: `GET /api/analytics/page`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, default: "30days") - Time period: "today", "7days", "30days", "6months", "12months", "all-time"
  - `startDate` (string, ISO date, optional) - Custom start date (overrides period if provided)
  - `endDate` (string, ISO date, optional) - Custom end date (overrides period if provided)
- **Note**:
  - If both `startDate` and `endDate` are provided, they override the `period` parameter
  - Date format should be ISO date strings (YYYY-MM-DD)
  - Start date must be before end date
  - When custom dates are provided, the period label will show the date range (e.g., "2025-10-21 to 2025-11-20")
  - Valid periods:
    - `"today"`: Today's data only
    - `"7days"`: Last 7 days
    - `"30days"`: Last 30 days
    - `"6months"`: Last 6 months
    - `"12months"`: Last 12 months
    - `"all-time"`: All time data
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "keyMetrics": {
        "totalOrders": {
          "count": 2000,
          "growthPercentage": 15.5,
          "periodLabel": "Last 30 Days"
        },
        "totalRevenue": {
          "amount": 500000,
          "growthPercentage": 20.3,
          "periodLabel": "Last 30 Days"
        },
        "newCustomers": {
          "count": 150,
          "growthPercentage": 12.8,
          "periodLabel": "Last 30 Days"
        }
      },
      "profitAndRevenueChart": {
        "trend": [
          {
            "date": "2024-01-01",
            "revenue": 5000,
            "profit": 5000
          }
        ],
        "totalRevenue": 500000,
        "totalProfit": 500000,
        "revenueGrowth": 20.3,
        "profitGrowth": 20.3,
        "periodLabel": "Last 30 Days"
      },
      "salesByCategory": [
        {
          "categoryName": "Category Name",
          "totalSales": 50000,
          "percentage": 30.5
        }
      ],
      "summary": {
        "totalOrders": {
          "count": 2000,
          "growthPercentage": 15.5
        },
        "totalRevenue": {
          "amount": 500000,
          "growthPercentage": 20.3
        },
        "newCustomers": {
          "count": 150,
          "growthPercentage": 12.8
        }
      },
      "period": "30days"
    },
    "message": "Analytics page data retrieved successfully"
  }
  ```
- **Note**:
  - **Key Metrics**: Total orders, total revenue, and new customers with growth percentages compared to previous period
  - **Profit & Revenue Chart**: Daily time-series data for profit and revenue trends (profit currently equals revenue as cost tracking is not implemented)
  - **Sales by Category**: Top 20 categories with sales amounts and percentages
  - **Summary**: Aggregated summary of key metrics
  - All growth percentages are rounded to 2 decimal places
  - Period labels are human-readable (e.g., "Today", "Last 30 Days", "Last 6 Months")
  - Valid periods: "today", "7days", "30days", "6months", "12months", "all-time"

### Get New Customers

- **API**: `GET /api/analytics/new-customers`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, default: "30days") - "7days", "30days", "6months", "12months"
  - `startDate` (string, ISO date) - Custom start date (optional, overrides period)
  - `endDate` (string, ISO date) - Custom end date (optional, overrides period)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "count": 25,
      "period": "30days",
      "growth": 0.15
    },
    "message": "New customers data retrieved successfully"
  }
  ```

### Get Total Revenue

- **API**: `GET /api/analytics/total-revenue`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, default: "30days") - "7days", "30days", "6months", "12months", "all-time"
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalRevenue": 100000,
      "monthlyRevenue": 10000,
      "growth": 0.2
    },
    "message": "Total revenue data retrieved successfully"
  }
  ```

### Get Total Orders

- **API**: `GET /api/analytics/total-orders`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, default: "30days") - "7days", "30days", "6months", "12months", "all-time"
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalOrders": 500,
      "monthlyOrders": 50,
      "growth": 0.1
    },
    "message": "Total orders data retrieved successfully"
  }
  ```

### Get Sales by Category

- **API**: `GET /api/analytics/sales-by-category`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, default: "30days") - "7days", "30days", "6months", "12months", "all-time"
  - `limit` (number, default: 10, max: 50) - Number of top categories to return
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "categoryId": "string",
        "categoryName": "string",
        "totalSales": 10000,
        "percentage": 0.3
      }
    ],
    "message": "Sales by category data retrieved successfully"
  }
  ```

### Get Analytics Dashboard

- **API**: `GET /api/analytics/dashboard`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, default: "30days") - "7days", "30days", "6months", "12months"
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "newCustomers": {
        "count": 25,
        "growth": 0.15
      },
      "totalRevenue": {
        "amount": 100000,
        "growth": 0.2
      },
      "totalOrders": {
        "count": 500,
        "growth": 0.1
      },
      "salesByCategory": [
        {
          "categoryId": "string",
          "categoryName": "string",
          "totalSales": 10000,
          "percentage": 0.3
        }
      ]
    },
    "message": "Analytics dashboard data retrieved successfully"
  }
  ```

---

## 11. Combined Products Endpoints

### Get Combined Products

- **API**: `GET /api/combined-products`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `status` (string) - ACTIVE, OUT_OF_STOCK, DISCONTINUED (if not specified, returns ACTIVE and OUT_OF_STOCK, excluding DISCONTINUED)
  - `isOrganic` (boolean)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `search` (string)
  - `type` (string) - "product", "combo", "all" (default: "all")
  - `category` (string) - Category ID
  - `subCategory` (string) - Subcategory ID
- **Note**:
  - By default, returns products and combos with status ACTIVE and OUT_OF_STOCK (excludes DISCONTINUED)
  - Products are automatically sorted by status: ACTIVE products appear first, followed by OUT_OF_STOCK products
  - Within the same status, products are sorted by creation date (newest first)
  - To get only ACTIVE items, explicitly set `status=ACTIVE`
  - To get only OUT_OF_STOCK items, explicitly set `status=OUT_OF_STOCK`
  - To get DISCONTINUED items, explicitly set `status=DISCONTINUED`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "_id": "string",
          "name": "string",
          "type": "product",
          "mrp": 100,
          "images": ["string"],
          "status": "ACTIVE",
          "isOrganic": true
        }
      ],
      "combos": [
        {
          "_id": "string",
          "name": "string",
          "type": "combo",
          "mrp": 200,
          "images": ["string"],
          "status": "ACTIVE",
          "isOrganic": true
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 10,
        "totalItems": 100,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "message": "Combined products retrieved successfully"
  }
  ```

### Get Combined Products Stats

- **API**: `GET /api/combined-products/stats`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalProducts": 100,
      "totalCombos": 20,
      "activeProducts": 95,
      "activeCombos": 18,
      "outOfStockProducts": 5,
      "outOfStockCombos": 2
    },
    "message": "Combined products stats retrieved successfully"
  }
  ```

### Get Combined Product by Type and ID

- **API**: `GET /api/combined-products/:type/:id`
- **Access**: Public
- **Parameters**:
  - `type` (string) - "product" or "combo"
  - `id` (string) - Product/Combo ID
- **Response**: Single product or combo object

### Get Combined Products by Category

- **API**: `GET /api/combined-products/category/:categoryId`
- **Access**: Public
- **Query Parameters**: Same as combined products list
- **Response**: Combined products list response

---

## 12. Order Endpoints

### Create Order

- **API**: `POST /api/orders`
- **Access**: User
- **Request**:
  ```json
  {
    "shippingAddress": {
      "type": "HOME",
      "addressLine": "string",
      "landmark": "string",
      "city": "string",
      "state": "string",
      "postalCode": "string",
      "country": "string",
      "isDefault": true
    },
    "billingAddress": {
      "type": "HOME",
      "addressLine": "string",
      "landmark": "string",
      "city": "string",
      "state": "string",
      "postalCode": "string",
      "country": "string",
      "isDefault": true
    },
    "payment": {
      "method": "COD",
      "transactionId": "string",
      "status": "PENDING",
      "amount": 100
    },
    "orderNotes": "string",
    "deliverySlot": "string",
    "couponCode": "string"
  }
  ```
- **Optional**: `couponCode` - Applied coupon code; validated and discount applied to order total; usage count incremented on success
- **Note**:
  - **COD**: Creates order directly and returns the order object. Backend uses its calculated total as source of truth; frontend `payment.amount` must be within ₹1 of backend total (allows rounding tolerance).
  - **Online (CARD/UPI/etc.)**: Creates Razorpay order and returns `{ razorpayOrderId, amount, currency }`; frontend uses `NEXT_PUBLIC_RAZORPAY_KEY_ID`; call `POST /api/orders/verify` after payment to create the order
  - `shippingAddress`, `billingAddress`, and `payment` are required fields
  - `orderNotes` and `deliverySlot` are optional
  - **Order is automatically added to the user's `orders` array** (latest order appears first in the array)
  - Product stock is automatically decremented based on order items
  - User's cart is automatically cleared after successful order creation
  - Coupon usage count is incremented when `couponCode` is applied and order is created successfully
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "refId": "string",
      "user": "string",
      "items": [
        {
          "product": "string",
          "productType": "product",
          "quantity": 2,
          "priceAtPurchase": 100,
          "discountApplied": 10
        }
      ],
      "totalAmount": 200,
      "itemsTotal": 180,
      "shippingCharges": 40,
      "couponDiscount": 20,
      "couponCode": "SAVE10",
      "loyaltyDiscountPercent": 5,
      "loyaltyDiscountAmount": 10,
      "storeName": "My Store Pvt Ltd",
      "shippingAddress": {
        "type": "HOME",
        "addressLine": "string",
        "landmark": "string",
        "city": "string",
        "state": "string",
        "postalCode": "string",
        "country": "string",
        "isDefault": true
      },
      "billingAddress": {
        "type": "HOME",
        "addressLine": "string",
        "landmark": "string",
        "city": "string",
        "state": "string",
        "postalCode": "string",
        "country": "string",
        "isDefault": true
      },
      "status": "PENDING",
      "payment": {
        "method": "CARD",
        "transactionId": "string",
        "status": "PENDING",
        "amount": 200
      },
      "orderNotes": "string",
      "updateHistory": [
        {
          "status": "PENDING",
          "updatedAt": "2024-01-01T00:00:00.000Z",
          "updatedBy": "USER",
          "reason": "string",
          "notes": "string"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Order created successfully"
  }
  ```

- **Online payment flow**: When `payment.method` is not "COD", `POST /api/orders` returns `{ razorpayOrderId, amount, currency }` for Razorpay Checkout. Frontend uses `NEXT_PUBLIC_RAZORPAY_KEY_ID` for the key. Use `POST /api/orders/verify` after payment to create the order.
- **Rate limit**: Order creation endpoints are limited to 5 requests per minute per user to prevent abuse.
- **Order breakdown** (returned in order object): `itemsTotal` = sum of items at purchase price; `shippingCharges` = delivery fee (stored on order schema); `couponDiscount` = discount from coupon; `loyaltyDiscountAmount` = loyalty tier discount; `totalAmount` = itemsTotal + shippingCharges - couponDiscount - loyaltyDiscountAmount. These fields appear on Order Summary and invoices.

### Verify Payment and Create Order

- **API**: `POST /api/orders/verify`
- **Access**: User
- **Request**:
  ```json
  {
    "razorpayOrderId": "string",
    "razorpayPaymentId": "string",
    "razorpaySignature": "string",
    "shippingAddress": { },
    "billingAddress": { },
    "payment": { "method": "CARD", "amount": 180 },
    "orderNotes": "string",
    "deliverySlot": "string",
    "couponCode": "string"
  }
  ```
- **Optional**: `couponCode` - Same coupon used when creating Razorpay order; validated before order creation
- **Response**: Created order object
- **Note**: Call after user completes Razorpay payment. Payment amount must match order total (items + shipping - coupon discount - loyalty discount)

### Get User Orders

- **API**: `GET /api/orders`
- **Access**: User
- **Query Parameters**:
  - `status` (string) - Filter by order status
  - `search` (string) - Search in order reference ID
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "orders": [
        {
          "_id": "string",
          "refId": "string",
          "user": "string",
          "items": [
            {
              "product": "string",
              "productType": "product",
              "quantity": 2,
              "priceAtPurchase": 100,
              "discountApplied": 10
            }
          ],
          "totalAmount": 200,
          "itemsTotal": 180,
          "shippingCharges": 40,
          "couponDiscount": 20,
          "couponCode": "SAVE10",
          "loyaltyDiscountPercent": 5,
          "loyaltyDiscountAmount": 4.30,
          "shippingAddress": {
            "type": "HOME",
            "addressLine": "string",
            "landmark": "string",
            "city": "string",
            "state": "string",
            "postalCode": "string",
            "country": "string",
            "isDefault": true
          },
          "billingAddress": {
            "type": "HOME",
            "addressLine": "string",
            "landmark": "string",
            "city": "string",
            "state": "string",
            "postalCode": "string",
            "country": "string",
            "isDefault": true
          },
          "status": "PENDING",
          "payment": {
            "method": "CARD",
            "transactionId": "string",
            "status": "PENDING",
            "amount": 200
          },
          "orderNotes": "string",
          "updateHistory": [
            {
              "status": "PENDING",
              "updatedAt": "2024-01-01T00:00:00.000Z",
              "updatedBy": "USER",
              "reason": "string",
              "notes": "string"
            }
          ],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "message": "Orders fetched successfully"
  }
  ```

### Get All Orders (Admin)

- **API**: `GET /api/orders/all`
- **Access**: Admin
- **Query Parameters**:
  - `status` (string) - Filter by order status
  - `userId` (string) - Filter by user ID
  - `search` (string) - Search term to search across order ID, reference ID, customer name, customer phone number, and product/combo names
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `sortBy` (string, default: "createdAt")
  - `sortOrder` (string, default: "desc")
  - `period` (string, optional) - Time period: "today", "currentDate", "7days", "30days", "lastMonth", "6months", "12months", "all-time"
  - `startDate` (string, ISO date, optional) - Custom start date (overrides period if provided with endDate)
  - `endDate` (string, ISO date, optional) - Custom end date (overrides period if provided with startDate)
- **Note**:
  - The `search` parameter performs case-insensitive search across:
    - Order ID (MongoDB `_id`)
    - Order reference ID (`refId`)
    - Customer first name and last name
    - Customer phone number
    - Product names in order items
    - Combo names in order items
  - **Period Filtering**:
    - If both `startDate` and `endDate` are provided, they override the `period` parameter
    - Date format should be ISO date strings (YYYY-MM-DD)
    - Start date must be before end date
    - Orders are filtered by `createdAt` field based on the specified period or date range
    - Valid periods:
      - `"today"` or `"currentDate"`: Today's orders
      - `"7days"`: Last 7 days
      - `"30days"` or `"lastMonth"`: Last 30 days
      - `"6months"`: Last 6 months
      - `"12months"`: Last 12 months
      - `"all-time"`: All orders from the beginning
- **Response**: Same as user orders response

### Get Order by ID

- **API**: `GET /api/orders/:orderId`
- **Access**: User/Admin
- **Response**: Single order object (includes `itemsTotal`, `shippingCharges`, `couponDiscount`, `couponCode`, `loyaltyDiscountPercent`, `loyaltyDiscountAmount` when available)

### Get Order by Reference ID

- **API**: `GET /api/orders/ref/:refId`
- **Access**: User/Admin
- **Response**: Single order object (same structure as Get Order by ID)

### Order Object Fields (Breakdown)

| Field | Type | Description |
|-------|------|-------------|
| `itemsTotal` | number | Sum of items at purchase price (optional; present on new orders) |
| `shippingCharges` | number | Delivery/shipping fee from order schema; 0 when free (optional) |
| `couponDiscount` | number | Discount from applied coupon (optional) |
| `couponCode` | string | Applied coupon code when discount was used (optional) |
| `loyaltyDiscountPercent` | number | User's loyalty tier discount % at order time (optional) |
| `loyaltyDiscountAmount` | number | Loyalty discount amount applied (optional) |
| `storeName` | string | Customer's store/business name at order time (optional; from user profile) |
| `totalAmount` | number | Final amount paid: itemsTotal + shippingCharges - couponDiscount - loyaltyDiscountAmount |

- These fields appear on Order Summary (track-order page) and invoices. Older orders may not have them; UI falls back to `originalAmount` for items total.
- **Shipping**: `shippingCharges` comes from the order schema (set at order creation). Order Summary and invoices use this value.
- **Loyalty discount**: When present, `loyaltyDiscountAmount` is shown as a separate line in Order Summary and on the invoice.
- `storeName` is captured from the user's profile when the order is created and used for invoice "Bill To" name (B2B).
- **Order items** (when product is populated): Include `name`, `title2`, `title3`, `title4` (product titles), `description`, `images`, `category`, `subCategory`, `price`, `mrp`, `gst`, `hsn`, `slug`.

### Update Order Status

- **API**: `PATCH /api/orders/:orderId/status`
- **Access**: Admin
- **Request**:
  ```json
  {
    "status": "PROCESSING",
    "notes": "string",
    "payment": {
      "method": "UPI",
      "status": "COMPLETED",
      "transactionId": "TXN123456"
    }
  }
  ```
- **Note**:
  - Valid statuses are: "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"
  - Status is case-insensitive (e.g., "Cancelled" will be normalized to "CANCELLED")
  - Order cannot be changed once it has been CANCELLED or REFUNDED
  - `payment` object is optional and allows updating payment information:
    - `method`: "CARD", "UPI", "COD", "NET_BANKING" (optional)
    - `status`: "PENDING", "COMPLETED", "FAILED" (optional)
    - `transactionId`: string (optional, can be set to empty string to clear it)
  - All payment fields are optional - you can update just the status, just payment info, or both together
  - Payment changes are logged in the order's update history
  - **Loyalty totals**: When status changes to `"DELIVERED"` (from any other status), the backend automatically recalculates the customer's `totalSpend` as the sum of all their DELIVERED orders and updates their `loyaltyTier` based on the configured spend thresholds
- **Response**: Updated order object

### Cancel Order

- **API**: `PATCH /api/orders/:orderId/cancel`
- **Access**: User/Admin
- **Request**:
  ```json
  {
    "reason": "string"
  }
  ```
- **Response**: Updated order object

### Get or Generate Invoice Number

- **API**: `GET /api/orders/:orderId/invoice-number`
- **Access**: User/Admin
- **Parameters**:
  - `orderId` (string) - Order ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "invoiceNumber": "000001"
    },
    "message": "Invoice number retrieved successfully"
  }
  ```
- **Note**:
  - Returns the invoice number for the order (6-digit format, e.g., 000001, 000002)
  - If the order doesn't have an invoice number, it will be generated and assigned
  - Invoice numbers are sequential and unique
  - Format: 6-digit number with leading zeros (000001, 000002, etc.)
  - **Invoice numbers are only generated when payment status is "COMPLETED" AND order status is "DELIVERED"**
  - If payment is not completed or order is not delivered, returns an error

### Delete Order

- **API**: `DELETE /api/orders/:orderId`
- **Access**: Admin
- **Parameters**:
  - `orderId` (string) - Order ID to delete
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Order deleted successfully"
  }
  ```
- **Note**:
  - Permanently deletes the order from the database
  - Removes order reference from user's orders array
  - If the deleted order had status `"DELIVERED"`, the backend automatically recalculates the customer's `totalSpend` (sum of remaining DELIVERED orders) and updates their `loyaltyTier` accordingly
  - Returns 404 if order not found
- **Error Responses**:
  - `404` - Not Found: Order not found

### Get Order Analytics

- **API**: `GET /api/orders/analytics`
- **Access**: Admin
- **Query Parameters**:
  - `startDate` (string) - Start date filter
  - `endDate` (string) - End date filter
  - `status` (string) - Filter by order status
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalOrders": 100,
      "totalRevenue": 50000,
      "averageOrderValue": 500,
      "ordersByStatus": {
        "PENDING": 10,
        "PROCESSING": 20,
        "SHIPPED": 30,
        "DELIVERED": 35,
        "CANCELLED": 5
      },
      "revenueByStatus": {
        "PENDING": 5000,
        "PROCESSING": 10000,
        "SHIPPED": 15000,
        "DELIVERED": 20000,
        "CANCELLED": 0
      }
    },
    "message": "Order analytics fetched successfully"
  }
  ```

### Get Order Statistics (Dashboard)

- **API**: `GET /api/orders/stats`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, optional, default: "7days") - Time period: "today", "currentDate", "7days", "30days", "lastMonth", "6months", "12months", "all-time"
  - `startDate` (string, ISO date, optional) - Custom start date (overrides period if provided with endDate)
  - `endDate` (string, ISO date, optional) - Custom end date (overrides period if provided with startDate)
- **Note**:
  - If both `startDate` and `endDate` are provided, they override the `period` parameter
  - Date format should be ISO date strings (YYYY-MM-DD)
  - Start date must be before end date
  - When custom dates are provided, the period label will show the date range (e.g., "2025-11-01 to 2025-11-21")
  - Orders are filtered by `createdAt` field based on the specified period or date range
  - Valid periods:
    - `"today"` or `"currentDate"`: Today's orders
    - `"7days"`: Last 7 days (default)
    - `"30days"` or `"lastMonth"`: Last 30 days
    - `"6months"`: Last 6 months
    - `"12months"`: Last 12 months
    - `"all-time"`: All orders from the beginning
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalOrders": 2,
      "totalReceived": {
        "count": 0,
        "revenue": 2820
      },
      "totalReturned": {
        "count": 0,
        "revenue": 0
      },
      "onTheWay": {
        "count": 0,
        "cost": 0
      },
      "totalCancelled": 1,
      "totalDelivered": 0,
      "totalPending": 1,
      "totalUPIOrders": 1,
      "totalCODOrders": 1,
      "totalCardOrders": 0,
      "period": "Last 7 Days"
    },
    "message": "Order statistics retrieved successfully"
  }
  ```
- **Note**:
  - Returns order statistics for the specified time period
  - `totalOrders`: Total count of all orders in the specified period
  - `totalReceived`: Count and revenue of DELIVERED orders
  - `totalReturned`: Count and revenue of RETURNED and REFUNDED orders (includes both statuses)
  - `onTheWay`: Count and cost (total amount) of PROCESSING or SHIPPED orders
  - `totalCancelled`: Count of orders with status "CANCELLED"
  - `totalDelivered`: Count of orders with status "DELIVERED"
  - `totalPending`: Count of orders with status "PENDING"
  - `totalUPIOrders`: Count of orders with payment method "UPI"
  - `totalCODOrders`: Count of orders with payment method "COD"
  - `totalCardOrders`: Count of orders with payment method "CARD"
  - `period`: Human-readable label for the time period (e.g., "Today", "Last 7 Days", "2025-11-01 to 2025-11-21")

---

## 13. Search Endpoints

### Search Database

- **API**: `GET /api/search/:search`
- **Access**: Public
- **Parameters**:
  - `search` (string) - Search term (optional if showAll=true)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `showAll` (boolean, default: false) - If true, returns all items without search filtering

**Usage Examples**:

- Search for specific term: `GET /api/search/rice?page=1&limit=10`
- Get all items: `GET /api/search/all?showAll=true&page=1&limit=20`

**Note**:

- If `showAll` is false, search term is required
- If `showAll` is true, search term can be any value (e.g., "all")
- Returns products and combos with status ACTIVE and OUT_OF_STOCK (excludes DISCONTINUED)
- Both search results and `showAll=true` include OUT_OF_STOCK items
- Results are automatically sorted by status: ACTIVE products appear first, followed by OUT_OF_STOCK products
- Within the same status, results are sorted by relevance score (for search) or creation date (for showAll)

**Fuzzy Search Implementation**:

The search endpoint uses advanced fuzzy matching to handle typos, spelling variations, and transliteration differences. The fuzzy search algorithm:

1. **Search Strategy**:
   - First performs direct regex matching on product names, descriptions, slugs, and meta keywords
   - Searches in category and subcategory names
   - Fetches products/combos with similar starting characters (first 2 characters) for broader fuzzy matching
   - Applies fuzzy matching algorithm to filter and score results

2. **Fuzzy Matching Types** (in priority order):
   - **Exact Match**: Perfect match (score: 100)
   - **Starts With**: Search term appears at the beginning (score: 90)
   - **Substring Match**: Search term appears anywhere in the text (score: 80)
   - **Fuzzy Substring**: All characters of search term appear in order (score: 70)
   - **Similarity Match**: Uses Levenshtein distance algorithm with similarity threshold of 0.4 (score: 0-60)
     - Handles typos like "sooji" vs "souji" or "besan" vs "busan"
     - More lenient for short strings (≤6 characters) with 1-2 character differences
     - Checks similarity against individual words in multi-word product names

3. **Result Sorting**:
   - Primary: By product status (ACTIVE → OUT_OF_STOCK → DISCONTINUED)
   - Secondary: By fuzzy match score (higher = better match)
   - Tertiary: By match type priority (direct match → category match → subcategory match)
   - Final: By creation date (newest first)

4. **Examples of What Fuzzy Search Handles**:
   - Typos: "sooji" finds "suji", "souji", "sooji"
   - Transliteration variations: "besan" finds "busan", "besan"
   - Partial matches: "rice" finds "basmati rice", "rice flour"
   - Case-insensitive: "RICE" finds "rice", "Rice", "RICE"
   - Word order variations: Searches within individual words of product names

- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "_id": "string",
          "name": "string",
          "type": "product",
          "mrp": 100,
          "images": ["string"],
          "category": "string"
        }
      ],
      "combos": [
        {
          "_id": "string",
          "name": "string",
          "type": "combo",
          "mrp": 200,
          "images": ["string"]
        }
      ],
      "categories": [
        {
          "_id": "string",
          "name": "string",
          "slug": "string"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "message": "Search results retrieved successfully"
  }
  ```

---

## 14. Upload Endpoints (Admin Only)

### Generate Presigned URL

- **API**: `POST /api/upload/presigned-url`
- **Access**: Admin
- **Request**:
  ```json
  {
    "fileName": "string",
    "folder": "string",
    "contentType": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "uploadUrl": "string",
      "key": "string",
      "expiresIn": 3600
    }
  }
  ```

### Delete File

- **API**: `DELETE /api/upload/delete`
- **Access**: Admin
- **Query Parameters**:
  - `key` (string) - File key in S3
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "File deleted successfully"
  }
  ```

---

## 15. Banner Endpoints (Hero Section)

### Get Active Banners (Public)

- **API**: `GET /api/banners/active`
- **Access**: Public
- **Query Parameters**:
  - `type` (string, optional) - Filter by type: "hero", "offers", "hero-mob", "offers-mob", or "authentication"
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "imageUrl": "string",
        "type": "hero",
        "order": 0,
        "isActive": true,
        "link": "string",
        "title": "string",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "message": "Active banners retrieved successfully"
  }
  ```
- **Note**:
  - Returns only active banners, sorted by type and order (ascending)
  - If `type` is provided, only returns banners of that type
  - Valid types: "hero" (desktop hero), "offers" (desktop offers), "hero-mob" (mobile hero), "offers-mob" (mobile offers), "authentication" (authentication page banners)

### Get All Banners (Admin)

- **API**: `GET /api/banners`
- **Access**: Admin
- **Query Parameters**:
  - `type` (string, optional) - Filter by type: "hero", "offers", "hero-mob", "offers-mob", or "authentication"
- **Response**: Same as active banners, but includes inactive banners too
- **Note**: Banners are sorted by type, then by order (ascending)

### Create Banner (Admin)

- **API**: `POST /api/banners`
- **Access**: Admin
- **Request**:
  ```json
  {
    "imageUrl": "string",
    "type": "hero",
    "order": 0,
    "isActive": true,
    "link": "string",
    "title": "string"
  }
  ```
- **Note**:
  - `imageUrl` is required (use presigned URL to upload, then save the URL here)
  - `type` is required and must be one of: "hero", "offers", "hero-mob", "offers-mob", "authentication"
  - `order` is optional - if not provided, will be set to highest order + 1 for the specified type
  - `isActive` defaults to true
  - `link` and `title` are optional
  - **Order uniqueness**: Order numbers must be unique within each type, but can be the same across different types
    - Example: A "hero" banner with order 0 and an "offers" banner with order 0 can both exist
    - But two "hero" banners cannot both have order 0
- **Response**: Created banner object

### Update Banner (Admin)

- **API**: `PATCH /api/banners/:bannerId`
- **Access**: Admin
- **Parameters**:
  - `bannerId` (string) - Banner ID
- **Request**:
  ```json
  {
    "imageUrl": "string",
    "type": "hero",
    "order": 0,
    "isActive": true,
    "link": "string",
    "title": "string"
  }
  ```
- **Note**:
  - All fields are optional, but at least one field must be provided
  - `type` must be one of: "hero", "offers", "hero-mob", "offers-mob", "authentication" if provided
  - **Order uniqueness**: When updating order or type, the new order must be unique within the target type
- **Response**: Updated banner object

### Delete Banner (Admin)

- **API**: `DELETE /api/banners/:bannerId`
- **Access**: Admin
- **Parameters**:
  - `bannerId` (string) - Banner ID
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Banner deleted successfully"
  }
  ```

### Reorder Banners (Admin)

- **API**: `PATCH /api/banners/reorder`
- **Access**: Admin
- **Request**:
  ```json
  {
    "bannerOrders": [
      {
        "id": "string",
        "order": 0
      }
    ]
  }
  ```
- **Note**:
  - Updates the order of multiple banners at once
  - Each object must have `id` and `order` fields
  - Lower order numbers appear first
  - **Order uniqueness**: The new orders must be unique within each banner type
- **Response**: Updated banners array (sorted by type and order)

---

## 16. Most Selling Page Endpoints (Admin Only)

### Get Most Selling Page Data

- **API**: `GET /api/most-selling`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, optional, default: "30days") - Time period: "7days", "30days", "6months", "12months", "all-time"
  - `startDate` (string, ISO date, optional) - Custom start date (overrides period if provided)
  - `endDate` (string, ISO date, optional) - Custom end date (overrides period if provided)
- **Note**:
  - If both `startDate` and `endDate` are provided, they override the `period` parameter
  - Date format should be ISO date strings (YYYY-MM-DD)
  - Start date must be before end date
  - When custom dates are provided, the period label will show the date range (e.g., "2025-10-20 to 2025-11-20")
  - Default period is "30days" if no parameters are provided
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "salePerformance": {
        "salesAmount": 63750,
        "growthPercentage": 36.0,
        "period": "Last 30 Days",
        "chartData": [
          {
            "date": "2025-10-21",
            "sales": 5000
          },
          {
            "date": "2025-10-22",
            "sales": 3500
          }
        ]
      },
      "shortToExpiryProducts": [
        {
          "productId": "string",
          "productName": "Product Name",
          "expiryDate": "2024-01-15T00:00:00.000Z",
          "daysLeft": 5,
          "currentStock": 20
        }
      ]
    },
    "message": "Most selling page data retrieved successfully"
  }
  ```
- **Note**:
  - **Sale Performance**:
    - Sales amount and growth percentage compared to previous period
    - Chart data grouped by selected period type (daily, weekly, monthly, etc.)
    - Period label is human-readable (e.g., "This Month", "This Year")
  - **Short to Expiry Products**:
    - Products expiring in the next 30 days
    - Includes expiry date, days left, and current stock
    - Sorted by expiry date (earliest first)
  - **Top Selling Products**: Available via separate endpoint `/api/most-selling/top-products` with period filtering
  - **Least Selling Products**: Available via separate endpoint `/api/most-selling/least-products` with period filtering
  - All revenue calculations include DELIVERED orders and PROCESSING/SHIPPED orders with COMPLETED payment
  - Growth percentage is rounded to 2 decimal places

### Get Top Selling Products (Admin)

- **API**: `GET /api/most-selling/top-products`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, optional, default: "30days") - Time period: "7days", "30days", "6months", "12months", "all-time"
  - `startDate` (string, ISO date, optional) - Custom start date (overrides period if provided)
  - `endDate` (string, ISO date, optional) - Custom end date (overrides period if provided)
  - `limit` (number, optional, default: 20, max: 100) - Number of products to return
- **Note**:
  - If both `startDate` and `endDate` are provided, they override the `period` parameter
  - Date format should be ISO date strings (YYYY-MM-DD)
  - Start date must be before end date
  - Returns products sorted by sold quantity (highest first)
  - **Only includes products with sold quantity > 5 units** to avoid overlap with least selling products
  - Only includes products from orders with status "DELIVERED" or ("PROCESSING"/"SHIPPED" with "COMPLETED" payment)
  - Excludes cancelled and refunded orders
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "productId": "string",
        "productName": "Product Name",
        "soldQuantity": 150,
        "revenue": 13500,
        "remainingQuantity": 50
      }
    ],
    "message": "Top selling products retrieved successfully"
  }
  ```

### Get Least Selling Products (Admin)

- **API**: `GET /api/most-selling/least-products`
- **Access**: Admin
- **Query Parameters**:
  - `period` (string, optional, default: "30days") - Time period: "7days", "30days", "6months", "12months", "all-time"
  - `startDate` (string, ISO date, optional) - Custom start date (overrides period if provided)
  - `endDate` (string, ISO date, optional) - Custom end date (overrides period if provided)
  - `limit` (number, optional, default: 20, max: 100) - Number of products to return
  - `maxSoldQuantity` (number, optional, default: 5) - Maximum sold quantity to filter (products with sold quantity <= this value)
- **Note**:
  - If both `startDate` and `endDate` are provided, they override the `period` parameter
  - Date format should be ISO date strings (YYYY-MM-DD)
  - Start date must be before end date
  - Returns products with low or zero sales (sold quantity <= maxSoldQuantity, default: 5)
  - **Only includes products with sold quantity ≤ 5 units** to avoid overlap with top selling products
  - Sorted by days since last order (most recent first), then by sold quantity
  - Products that were never sold have `daysSinceLastOrder: null`
  - Only includes active products (status != "DISCONTINUED")
  - Only includes products from orders with status "DELIVERED" or ("PROCESSING"/"SHIPPED" with "COMPLETED" payment)
  - Excludes cancelled and refunded orders
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "productId": "string",
        "productName": "Product Name",
        "soldQuantity": 2,
        "daysSinceLastOrder": 15,
        "currentStock": 100
      }
    ],
    "message": "Least selling products retrieved successfully"
  }
  ```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## CORS

- All origins allowed
- Credentials enabled
- Preflight requests supported

---

## Notes

- All timestamps are in ISO 8601 format
- All monetary values are in the base currency unit
- Pagination is 1-indexed
- Maximum file upload size: 50MB
- Refresh tokens expire in 30 days (1 month)
- Access tokens expire in 15 minutes
