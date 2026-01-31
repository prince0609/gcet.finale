# Test Data Payloads

Copy and paste these JSON blocks into the "Body" (raw JSON) section of your API client (Postman, Insomnia, etc.).

## 1. Authentication

### Signup (Vendor)
**POST** `/api/auth/signup`
```json
{
  "name": "Acme Rentals",
  "email": "vendor@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "vendor",
  "companyName": "Acme Rentals Pvt Ltd",
  "gstin": "22AAAAA0000A1Z5"
}
```

### Signup (Customer)
**POST** `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "customer@example.com",
  "password": "Password123!",
  "role": "customer"
}
```

### Login
**POST** `/api/auth/login`
```json
{
  "email": "vendor@example.com",
  "password": "Password123!"
}
```

---

## 2. Product Management (Vendor)

### Create Product
**POST** `/api/products`
```json
{
  "name": "Hilti Breaker TE 3000",
  "sku": "TE-3000-AVR",
  "costPrice": 150000,
  "salesPrice": 2000,
  "isRentable": true,
  "qtyOnHand": 5,
  "isPublished": true,
  "description": "Heavy-duty concrete breaker for demanding demolition work."
}
```

### Add Variant
**POST** `/api/products/:id/variants`
```json
{
  "sku": "TE-3000-AVR-PRO",
  "priceOverride": 2500,
  "qtyOnHand": 2,
  "isActive": true
}
```

### Set Pricing (Daily)
**POST** `/api/products/:id/pricing`
```json
{
  "periodTypeId": 2,
  "price": 1800,
  "isActive": true
}
```
*(Note: ID 2 is usually 'Daily' based on standard seed data)*

---

## 3. Customer Profile & Address

### Add Address
**POST** `/api/users/addresses`
```json
{
  "label": "Site Office",
  "addressType": "both",
  "line1": "123 Construction Road",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380001",
  "country": "India",
  "isDefault": true
}
```

---

## 4. Rental Flow (Customer)

### Create Quotation (Cart)
**POST** `/api/quotations`
*(No body required)*

### Add Item to Quotation
**POST** `/api/quotations/:id/lines`
```json
{
  "productId": 1,
  "quantity": 1,
  "rentalStart": "2026-02-10",
  "rentalEnd": "2026-02-15"
}
```

### Confirm Order
**POST** `/api/quotations/:id/confirm`
```json
{
  "billingAddressId": 1,
  "shippingAddressId": 1
}
```

---

## 5. Order Management (Vendor/Admin)

### Update Order Status
**PUT** `/api/orders/:id/status`
```json
{
  "status": "active"
}
```

### Dispatch Pickup
**PUT** `/api/pickups/:id/status`
```json
{
  "status": "dispatched"
}
```

### Complete Return
**POST** `/api/returns/:id/complete`
```json
{
  "actualReturnDate": "2026-02-15",
  "lines": [
    {
      "lineId": 1,
      "quantityReturned": 1
    }
  ]
}
```

---

## 6. Admin Settings

### Create Tax Configuration
**POST** `/api/admin/tax-configurations`
```json
{
  "name": "GST 18%",
  "taxType": "IGST",
  "rate": 18.00,
  "isActive": true
}
```

### Create Rental Period
**POST** `/api/admin/rental-periods`
```json
{
  "label": "Monthly",
  "unit": "month",
  "isActive": true
}
```
