# API Documentation

Base URL: `/api`

## Authentication (`/auth`)

| Method | Endpoint | Description | Required Data (Body) |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Register a new user | `name`, `email`, `password`, `confirmPassword`, `role` ("customer" or "vendor"). <br> **If Vendor:** `companyName`, `gstin` |
| `POST` | `/login` | User login | `email`, `password` |
| `POST` | `/forgot-password` | Request password reset | `email` |
| `POST` | `/reset-password` | Reset password with token | `token`, `password`, `confirmPassword` |

## Users (`/users`)
*Requires Authentication*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Get current user profile | - |
| `PUT` | `/profile` | Update profile | `name` (optional), `companyName` (vendor only), `gstin` (vendor only) |
| `PUT` | `/change-password` | Change password | `currentPassword`, `newPassword`, `confirmPassword` |
| `GET` | `/addresses` | List user addresses | - |
| `POST` | `/addresses` | Create address | `line1`, `city`, `state`, `pincode`, `addressType` ("billing", "shipping", "both"), `label` (optional), `line2` (optional), `country` (default "India"), `isDefault` (bool) |
| `PUT` | `/addresses/:id` | Update address | Same as create (all optional) |
| `DELETE` | `/addresses/:id` | Delete address | - |

## Products (`/products`)
*Requires Vendor or Admin*

> **Note:** `POST /` and `PUT /:id` accept `multipart/form-data` for image uploads. Include an optional `image` field with the file.

| Method | Endpoint | Description | Required Data (Body) |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List products | **Query:** `page`, `limit`, `vendorId` (Admin only) |
| `POST` | `/` | Create product | `name`, `sku`, `costPrice`, `salesPrice`, `isRentable` (bool), `qtyOnHand`, `isPublished`, `description`, `image` (file, optional) |
| `GET` | `/:id` | Get product details | - |
| `PUT` | `/:id` | Update product | Same as create (all optional), `image` (file, optional) |
| `DELETE` | `/:id` | Delete product | - |
| `PUT` | `/:id/publish` | Toggle publish status | `isPublished` (bool) |
| `GET` | `/:id/pricing` | Get product pricing tiers | - |
| `POST` | `/:id/pricing` | Upsert pricing tier | `periodTypeId`, `price`, `isActive` |
| `DELETE` | `/:id/pricing/:pricingId` | Delete pricing tier | - |
| `GET` | `/:id/variants` | Get variants | - |
| `POST` | `/:id/variants` | Create variant | `sku`, `priceOverride`, `qtyOnHand`, `isActive`, `attributeValueIds` (array of IDs) |
| `PUT` | `/:id/variants/:variantId` | Update variant | `sku`, `priceOverride`, `qtyOnHand`, `isActive` |
| `DELETE` | `/:id/variants/:variantId` | Delete variant | - |
| `GET` | `/:id/attributes` | Get attribute mapping | - |
| `POST` | `/:id/attributes` | Map attribute to product | `attributeId` |
| `DELETE` | `/:id/attributes/:attributeId` | Remove attribute | - |

## Catalog (`/catalog`)
*Public / Optional Auth*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Browse products | **Query:** `page`, `limit`, `search` |
| `GET` | `/products/:id` | Get product details | - |
| `GET` | `/products/:id/availability` | Check availability | **Query:** `startDate`, `endDate`, `quantity` (default 1), `variantId` (optional) |

## Quotations (`/quotations`)
*Requires Authentication*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List quotations | **Query:** `page`, `limit`, `customerId` (Admin/Vendor only) |
| `POST` | `/` | Create draft quotation | - |
| `GET` | `/:id` | Get quotation details | - |
| `POST` | `/:id/lines` | Add item | `productId`, `rentalStart`, `rentalEnd`, `quantity` (default 1), `variantId` (optional) |
| `PUT` | `/:id/lines/:lineId` | Update item | `quantity`, `rentalStart`, `rentalEnd` |
| `DELETE` | `/:id/lines/:lineId` | Remove item | - |
| `POST` | `/:id/confirm` | Confirm & Create Order | `billingAddressId` (optional), `shippingAddressId` (optional) |

## Orders (`/orders`)
*Requires Authentication*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List orders | **Query:** `page`, `limit` |
| `GET` | `/:id` | Get order details | - |
| `PUT` | `/:id/status` | Update status (Admin/Vendor) | `status` ("confirmed", "active", "returned", "cancelled") |

## Pickups (`/pickups`)
*Requires Vendor or Admin*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List pickups | **Query:** `page`, `limit`, `vendorId` (Admin only) |
| `GET` | `/:id` | Get pickup details | - |
| `PUT` | `/:id/status` | Update status | `status` ("pending", "dispatched", "completed", "cancelled") |
| `POST` | `/:id/complete` | Complete pickup | `lines` (array of `{ lineId, quantityPicked }`) or empty for all |

## Returns (`/returns`)
*Requires Vendor or Admin*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List returns | **Query:** `page`, `limit`, `vendorId` (Admin only) |
| `GET` | `/:id` | Get return details | - |
| `PUT` | `/:id/status` | Update status | `status` ("pending", "in_transit", "received", "cancelled") |
| `POST` | `/:id/complete` | Complete return | `lines` (array of `{ lineId, quantityReturned }`), `actualReturnDate` (optional) |

## Invoices (`/invoices`)
*Requires Authentication*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List invoices | **Query:** `page`, `limit` |
| `POST` | `/` | Create invoice (Admin/Vendor) | `rentalOrderId`, `billingAddressId` (optional) |
| `GET` | `/:id` | Get invoice details | - |
| `PUT` | `/:id/post` | Post invoice (Finalize) | - |

## Payments (`/payments`)
*Requires Authentication*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List payments | **Query:** `page`, `limit`, `invoiceId` (optional), `customerId` (Admin only) |
| `POST` | `/` | Create Payment Intent | `invoiceId`, `amount`, `paymentType` ("full", "partial", "security_deposit") |
| `GET` | `/:id` | Get payment details | - |
| `POST` | `/webhook` | Stripe Webhook | Stripe signature in headers |

## Dashboard (`/dashboard`)
*Requires Authentication*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin` | Admin Stats | - |
| `GET` | `/vendor` | Vendor Stats | **Query:** `vendorId` (Required if Admin) |
| `GET` | `/customer` | Customer Stats | **Query:** `customerId` (Required if Admin) |

## Reports (`/reports`)
*Requires Vendor or Admin*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/vendor-revenue` | Revenue stats | - |
| `GET` | `/most-rented` | Top products | **Query:** `limit` |
| `GET` | `/order-trends` | Order history | **Query:** `startDate`, `endDate` |
| `GET` | `/revenue` | Revenue over time | **Query:** `startDate`, `endDate` |
| `GET` | `/export` | Export CSV | **Query:** `type` ("vendor-revenue", "most-rented", "order-trends"), `startDate`, `endDate` |

## Notifications (`/notifications`)
*Requires Authentication*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List notifications | **Query:** `page`, `limit` |
| `PUT` | `/:id/read` | Mark as read | - |

## Admin Settings (`/admin`)
*Requires Admin*

| Method | Endpoint | Description | Required Data |
| :--- | :--- | :--- | :--- |
| `GET` | `/rental-periods` | List periods | - |
| `POST` | `/rental-periods` | Create period | `label`, `unit` ("hour", "day", "week"), `isActive` |
| `PUT` | `/rental-periods/:id` | Update period | `label`, `unit`, `isActive` |
| `GET` | `/tax-configurations` | List taxes | - |
| `POST` | `/tax-configurations` | Create tax | `name`, `taxType` ("IGST", "CGST", "SGST"), `rate`, `isActive` |
| `PUT` | `/tax-configurations/:id` | Update tax | `name`, `taxType`, `rate`, `isActive` |
| `GET` | `/product-attributes` | List attributes | - |
| `POST` | `/product-attributes` | Create attribute | `name`, `isActive` |
| `POST` | `/attribute-values` | Create value | `attributeId`, `value` |
| `GET` | `/users` | List all users | **Query:** `page`, `limit` |
| `PUT` | `/users/:id/status` | Activate/Deactivate | `isActive` (bool) |
| `GET` | `/late-fee-policies` | List policies | - |
| `POST` | `/late-fee-policies` | Create policy | `productId` (optional), `gracePeriodDays`, `feePerDay`, `maxFeeMultiplier` |
