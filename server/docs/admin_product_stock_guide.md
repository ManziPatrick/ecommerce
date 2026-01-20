# Admin & Vendor Product & Stock Management Guide

This guide summarizes the available administrative features for managing products, variants, and stock.

## Roles and Permissions

| Feature | Superadmin / Admin | Vendor |
| :--- | :--- | :--- |
| **Product Management** | Full Access (All Shops) | Own Shop Only |
| **Variant Management** | Full Access (All Shops) | Own Products Only |
| **Stock Restocking** | Full Access | Own Variants Only |
| **Order Management** | Full Access | Own Shop Items Only |
| **Categories** | Full Access | Create & List |
| **Attributes** | Full Access | Create & List |
| **Analytics** | System-wide Overview | Shop-specific (Planned) |
| **Shop Settings** | Full Access | Own Shop Only |

## Key Capabilities

### 1. Product & Variant Management
- **Create/Update/Delete Products**: Admins can manage the global catalog; Vendors manage their shop's inventory.
- **Variant Attributes**: Supports dynamic attributes (Size, Color, etc.) based on category requirements.
- **Bulk Import**: Supported for rapid catalog expansion.

### 2. Stock Control
- **Inventory Tracking**: Every variant tracks its current stock level.
- **Low Stock Alerts**: Configurable `lowStockThreshold` triggers alerts when inventory is low.
- **Restock History**: Transparent logging of all restock actions, including who performed them and when.
- **Stock Movement**: Specialized logging for every addition or removal of stock.

### 3. Advanced Analytics (Admin Only)
- **Interaction Logging**: Tracks user views, clicks, and general engagement.
- **Revenue Trends**: Monthly reports on revenue, order volume, and sales growth.
- **Product Performance**: Identifies top-performing products by revenue and quantity.
- **User Retention**: Insights into customer loyalty and repeat purchase rates.

## API Endpoints for Developers

### Products
- `GET /api/v1/products`: List products with advanced filtering (`shopId`, `categoryId`, etc.).
- `POST /api/v1/products`: Create a product (Isolated for Vendors).

### Variants & Stock
- `POST /api/v1/variants`: Create new variants.
- `PATCH /api/v1/variants/:id`: Update variant details.
- `POST /api/v1/variants/:id/restock`: Record a restock event and update stock levels.
- `GET /api/v1/variants/:id/restock-history`: View audit trail for a variant's stock changes.

### Analytics
- `GET /api/v1/analytics/overview`: High-level summary of system performance.
- `GET /api/v1/analytics/export`: Export data for external reporting.
