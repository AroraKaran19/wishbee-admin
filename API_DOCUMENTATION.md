# Wishbee API Documentation

## Authentication

- **Access Token**: Required for protected routes (Bearer token in Authorization header)
- **Refresh Token**: Stored in HTTP-only cookies
- **Admin Routes**: Require both user authentication and admin role

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
      "user": {
        "_id": "string",
        "phoneNumber": "string",
        "role": "CUSTOMER",
        "isActive": true,
        "firstTimeLogin": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "message": "OTP verified successfully"
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
- **Access**: Admin
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
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Admin logged in successfully"
  }
  ```

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
- **Response**:
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
      "addresses": [
        {
          "street": "string",
          "city": "string",
          "state": "string",
          "postalCode": "string",
          "country": "string",
          "isDefault": true
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Profile fetched successfully"
  }
  ```

### Update Profile

- **API**: `PUT /api/user/profile`
- **Access**: User
- **Request**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "photo": "string"
  }
  ```
- **Response**: Updated profile object

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
          "street": "string",
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
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  }
  ```
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
- **Access**: User
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

- **API**: `GET /api/enquiry`
- **Access**: Admin
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `type` (string)
  - `status` (string)
  - `userId` (string)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "enquiries": [
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
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "hasNext": true,
        "hasPrev": false
      }
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
  - `status` (string) - ACTIVE, OUT_OF_STOCK, DISCONTINUED
  - `isOrganic` (boolean)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `search` (string) - Search in name, description, SKU
  - `name` (string) - Filter by product name
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
- **Response**: Same as products list response

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
- **Query Parameters**: Same as out of stock
- **Response**: Same as products list response

### Create Product

- **API**: `POST /api/products`
- **Access**: Admin
- **Request**:
  ```json
  {
    "sku": "string",
    "name": "string",
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
    "isB2B": false
  }
  ```
- **Response**: Created product object

### Update Product

- **API**: `PUT /api/products/:id`
- **Access**: Admin
- **Request**: Any product fields to update
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

### Get Category Products by Slug

- **API**: `GET /api/categories/slug/:slug/products`
- **Access**: Public
- **Query Parameters**: Same as above
- **Response**: Products list response

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

- **API**: `GET /api/subcategories/:id`
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

- **API**: `POST /api/subcategories`
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

- **API**: `PUT /api/subcategories/:id`
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

### Delete Subcategory

- **API**: `DELETE /api/subcategories/:id`
- **Access**: Admin
- **Response**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Subcategory deleted successfully"
  }
  ```

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


## 5. Combo Endpoints

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
    "productIds": ["string"],
    "stock": 10
  }
  ```
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
          "applicableProducts": ["string"],
          "applicableCategories": ["string"],
          "minimumPurchaseAmount": 100,
          "maximumDiscountAmount": 50,
          "validFrom": "2024-01-01T00:00:00.000Z",
          "validUntil": "2024-12-31T23:59:59.000Z",
          "maxUses": 100,
          "usedCount": 25,
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
- **Access**: Admin
- **Request**:
  ```json
  {
    "code": "string",
    "type": "percentage",
    "description": "string",
    "value": 10,
    "applicableProducts": ["string"],
    "applicableCategories": ["string"],
    "minimumPurchaseAmount": 100,
    "maximumDiscountAmount": 50,
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validUntil": "2024-12-31T23:59:59.000Z",
    "maxUses": 100,
    "isActive": true
  }
  ```
- **Response**: Created coupon object

### Validate Coupon

- **API**: `POST /api/coupons/validate`
- **Access**: Public
- **Request**:
  ```json
  {
    "code": "string",
    "cartTotal": 200,
    "productIds": ["string"],
    "categoryIds": ["string"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "isValid": true,
      "discountAmount": 20,
      "finalAmount": 180,
      "message": "Coupon applied successfully"
    },
    "message": "Coupon validation completed"
  }
  ```

### Get Applicable Coupons for Product

- **API**: `GET /api/coupons/applicable-for-product/:productId`
- **Access**: Public
- **Response**: Coupons list response

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
  - `limit` (number, default: 10, max: 50)
- **Response**: Top selling products array

### Get Low Stock Products

- **API**: `GET /api/dashboard/low-stock`
- **Access**: Admin
- **Query Parameters**:
  - `threshold` (number, default: 100)
- **Response**: Low stock products array

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

---

## 10. Analytics Endpoints (Admin Only)

### Get New Customers

- **API**: `GET /api/analytics/new-customers`
- **Access**: Admin
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
  - `status` (string) - ACTIVE, OUT_OF_STOCK, DISCONTINUED
  - `isOrganic` (boolean)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `search` (string)
  - `type` (string) - "product", "combo", "all" (default: "all")
  - `category` (string) - Category ID
  - `subCategory` (string) - Subcategory ID
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
      "method": "CARD",
      "transactionId": "string",
      "status": "PENDING",
      "amount": 100
    },
    "orderNotes": "string",
    "deliverySlot": "string"
  }
  ```
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
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `sortBy` (string, default: "createdAt")
  - `sortOrder` (string, default: "desc")
- **Response**: Same as user orders response

### Get Order by ID

- **API**: `GET /api/orders/:orderId`
- **Access**: User/Admin
- **Response**: Single order object

### Get Order by Reference ID

- **API**: `GET /api/orders/ref/:refId`
- **Access**: User/Admin
- **Response**: Single order object

### Update Order Status

- **API**: `PATCH /api/orders/:orderId/status`
- **Access**: Admin
- **Request**:
  ```json
  {
    "status": "PROCESSING",
    "notes": "string"
  }
  ```
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
  - `showAll` (boolean, default: false) - If true, returns all active items without search filtering

**Usage Examples**:
- Search for specific term: `GET /api/search/rice?page=1&limit=10`
- Get all items: `GET /api/search/all?showAll=true&page=1&limit=20`

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
- Refresh tokens expire in 7 days
- Access tokens expire in 15 minutes
