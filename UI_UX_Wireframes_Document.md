# UI/UX Wireframes Document
## Project: Basic E-Commerce Website

---

## 1. Overview
This document outlines the user interface and user experience design for the Basic E-Commerce Website. The design focuses on simplicity, ease of navigation, and a clear path to purchase for customers, while providing a functional and efficient dashboard for administrators.

**Design Principles:**
*   **Clean & Minimalist:** Focus on product imagery and essential information.
*   **Intuitive Navigation:** Standard e-commerce patterns (top nav, search bar, clear CTA buttons).
*   **Mobile-Responsive:** Layouts adapt to mobile, tablet, and desktop screens.

---

## 2. User Flows

### 2.1 Customer Purchase Flow
1.  **Landing:** User arrives at **Home Page**.
2.  **Discovery:** User searches or browses categories -> **Product Listing Page**.
3.  **Selection:** User clicks a product -> **Product Detail Page** -> Clicks "Add to Cart".
4.  **Review:** User views **Cart Drawer/Page** -> Clicks "Checkout".
5.  **Checkout:** User fills **Checkout Page** (Shipping/Payment) -> Clicks "Place Order".
6.  **Confirmation:** User sees **Order Success Page** with Order ID.

### 2.2 Admin Inventory Management
1.  **Login:** Admin arrives at **Login Page** -> Enters credentials.
2.  **Dashboard:** Land on **Admin Dashboard (Orders)** overview.
3.  **Product Management:** Click "Products" tab -> **Product List View**.
4.  **Edit/Add:** Click "Edit" or "Add New Product" -> **Product Editor Modal/Page**.
5.  **Save:** Save changes -> Return to **Product List View**.

---

## 3. Screen List

**Public (Customer):**
1.  Home Page
2.  Product Listing Page (Category View)
3.  Product Detail Page
4.  Shopping Cart Page
5.  Checkout Page
6.  Order Confirmation Page
7.  Order Tracking Page
8.  Login / Registration Page

**Private (Admin):**
1.  Admin Login
2.  Admin Dashboard (Orders Overview)
3.  Product Management (List & Edit)

---

## 4. Wireframe Descriptions & Samples

### 4.1 Home Page
*   **Purpose:** Brand introduction, promote featured products, and entry point to navigation.
*   **Layout:**
    *   **Header:** Logo, Search Bar, Account Icon, Cart Icon.
    *   **Hero Section:** Large banner image with "Shop Now" Call-to-Action (CTA).
    *   **Featured Categories:** Grid of top categories (e.g., Electronics, Fashion).
    *   **Footer:** Links to support, social media, policies.

**Sample Wireframe:**
```text
+-------------------------------------------------------+
|  [LOGO]    [ Search Products... ]   [User] [Cart (0)] |  <-- Header
+-------------------------------------------------------+
|                                                       |
|                  HERO BANNER IMAGE                    |
|             [    SHOP NEW ARRIVALS    ]               |
|                                                       |
+-------------------------------------------------------+
|  Featured Categories                                  |
|  +-------+  +-------+  +-------+  +-------+           |
|  | CAT A |  | CAT B |  | CAT C |  | CAT D |           |
|  +-------+  +-------+  +-------+  +-------+           |
+-------------------------------------------------------+
| [Footer Links]                                        |
+-------------------------------------------------------+
```

### 4.2 Product Listing Page
*   **Purpose:** Browse products within a category or search results.
*   **Layout:**
    *   **Sidebar (Left):** Filters (Price range, Category, Sort by).
    *   **Main Content (Right):** Grid of product cards.
    *   **Product Card:** Image, Name, Price, "Add to Cart" button.

**Sample Wireframe:**
```text
+-------------------------------------------------------+
|  [LOGO]    [ Search Products... ]   [User] [Cart (2)] |
+-------------------------------------------------------+
| Filter By:   |  Results for "Shoes"                   |
|              |                                        |
| [ ] Under $50|  +-------+  +-------+  +-------+       |
| [ ] $50-$100 |  | IMG   |  | IMG   |  | IMG   |       |
|              |  | Name  |  | Name  |  | Name  |       |
| Sort By:     |  | $40   |  | $90   |  | $120  |       |
| [ Low-High ] |  | [Add] |  | [Add] |  | [Add] |       |
|              |  +-------+  +-------+  +-------+       |
|              |                                        |
|              |  +-------+  +-------+  +-------+       |
|              |  | IMG   |  | IMG   |  | IMG   |       |
+-------------------------------------------------------+
```

### 4.3 Product Detail Page
*   **Purpose:** detailed information to drive purchase decision.
*   **Layout:**
    *   **Left:** Large Product Image + Thumbnails.
    *   **Right:** Product Name, Price, Rating, Dropdown for Quantity/Size, "Add to Cart" (Primary Button), Description text.

**Sample Wireframe:**
```text
+-------------------------------------------------------+
|  [LOGO]    [ Search Products... ]   [User] [Cart (2)] |
+-------------------------------------------------------+
|  < Back to Results                                    |
|                                                       |
|  +------------------+    **Product Name**             |
|  |                  |    $99.00  ***** (55 reviews)   |
|  |   MAIN IMAGE     |                                 |
|  |                  |    Description:                 |
|  +------------------+    Lorem ipsum dolor sit amet.  |
|  +---+ +---+ +---+                                    |
|  |[ ]| |[ ]| |[ ]|       Qty: [ 1 v ]                 |
|  +---+ +---+ +---+                                    |
|                          [ ADD TO CART ]              |
+-------------------------------------------------------+
```

### 4.4 Checkout Page
*   **Purpose:** Securely collect shipping and payment info.
*   **Layout:**
    *   **Left Column:** Shipping Address Form, Payment Method (Card inputs).
    *   **Right Column:** Order Summary (Items, Subtotal, Tax, Total).
    *   **Bottom:** "Place Order" button.

**Sample Wireframe:**
```text
+-------------------------------------------------------+
|  [LOGO]                                     Checkout  |
+-------------------------------------------------------+
|  1. Shipping Address          |  Order Summary        |
|  [ Name        ]              |  -------------------  |
|  [ Address     ]              |  Item A ....... $40   |
|  [ City, Zip   ]              |  Item B ....... $90   |
|                               |  -------------------  |
|  2. Payment Details           |  Total ........ $130  |
|  [ Card Number      ]         |                       |
|  [ MM/YY ] [ CVC ]            |                       |
|                               |                       |
|  [   PLACE ORDER   ]          |                       |
+-------------------------------------------------------+
```

### 4.5 Admin Product Management (List View)
*   **Purpose:** Manage inventory and product details.
*   **Layout:**
    *   **Sidebar:** Dashboard, Products, Orders, Customers.
    *   **Main Area:** Table of products with actions (Edit, Delete) and "Add New Product" button at top.

**Sample Wireframe:**
```text
+-------------------------------------------------------+
| [Admin Panel]  [Logout]                               |
+-------+-----------------------------------------------+
| Dash  |  Products                 [ + Add Product ]   |
|       |                                               |
| Prods |  ID   | Name      | Stock | Price | Actions   |
|       |  -----|-----------|-------|-------|--------   |
| Orders|  001  | T-Shirt   | 50    | $20   | [Edit][X] |
|       |  002  | Jeans     | 20    | $40   | [Edit][X] |
|       |  003  | Cap       | 0     | $15   | [Edit][X] |
|       |                                               |
+-------+-----------------------------------------------+
```

### 4.6 Admin Orders View
*   **Purpose:** View and update order statuses.
*   **Layout:**
    *   **Table:** Order ID, Customer Name, Total, Date, Status (Dropdown).

**Sample Wireframe:**
```text
+-------------------------------------------------------+
| [Admin Panel]  [Logout]                               |
+-------+-----------------------------------------------+
| Dash  |  Orders                                       |
|       |                                               |
| Prods |   Order ID | Customer | Total | Status        |
|       |   ---------|----------|-------|-------------  |
| Orders|   #1023    | John Doe | $130  | [Shipped v]   |
|       |   #1024    | Jane Doe | $45   | [Pending v]   |
|       |   #1025    | Bob S.   | $200  | [Pending v]   |
+-------+-----------------------------------------------+
```
