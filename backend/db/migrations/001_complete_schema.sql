-- =============================================================
-- RENTAL SYSTEM — COMPLETE DATABASE SCHEMA (WITHOUT COUPON TABLES)
-- =============================================================
-- Engine  : PostgreSQL 15+
-- Order   : Run top to bottom. FK dependencies are resolved
--           sequentially — each section only references tables
--           defined above it.
-- =============================================================


-- =============================================================
-- SECTION 1 — AUTH & USER MANAGEMENT
-- =============================================================
-- Covers: Login, Signup, Forgot Password,
--         User roles, Company & GSTIN, User addresses

CREATE TABLE users (
    id              SERIAL      PRIMARY KEY,
    name            TEXT        NOT NULL,
    email           TEXT        UNIQUE NOT NULL,
    password_hash   TEXT        NOT NULL,
    role            TEXT        NOT NULL DEFAULT 'customer'
                                CHECK (role IN ('admin', 'vendor', 'customer')),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- Only vendors have a company. Customers do not.
-- company.user_id points to the vendor who owns it.
CREATE TABLE companies (
    id              SERIAL      PRIMARY KEY,
    user_id         INT         UNIQUE NOT NULL REFERENCES users(id),  -- the vendor
    name            TEXT        NOT NULL,
    gstin           TEXT        UNIQUE NOT NULL,             -- mandatory for invoicing
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_user ON companies (user_id);

-- Forgot-password token (single-use, expiring)
CREATE TABLE password_reset_tokens (
    id              SERIAL      PRIMARY KEY,
    user_id         INT         NOT NULL REFERENCES users(id),
    token           TEXT        UNIQUE NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used            BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Customer shipping / billing addresses
CREATE TABLE user_addresses (
    id              SERIAL      PRIMARY KEY,
    user_id         INT         NOT NULL REFERENCES users(id),
    label           TEXT,                                   -- "Home", "Office", etc.
    address_type    TEXT        NOT NULL
                                CHECK (address_type IN ('billing', 'shipping', 'both')),
    line1           TEXT        NOT NULL,
    line2           TEXT,
    city            TEXT        NOT NULL,
    state           TEXT        NOT NULL,
    pincode         TEXT        NOT NULL,
    country         TEXT        NOT NULL DEFAULT 'India',
    is_default      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON user_addresses (user_id);


-- =============================================================
-- SECTION 2 — SETTINGS & CONFIGURATION
-- =============================================================
-- Covers: Rental period types, GST/Tax config

-- Admin-configurable rental period types
CREATE TABLE rental_period_types (
    id              SERIAL      PRIMARY KEY,
    label           TEXT        UNIQUE NOT NULL,            -- "Hourly", "Daily", "Weekly"
    unit            TEXT        NOT NULL
                                CHECK (unit IN ('hour', 'day', 'week')),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE
);

-- Seed default period types
INSERT INTO rental_period_types (label, unit) VALUES
    ('Hourly',  'hour'),
    ('Daily',   'day'),
    ('Weekly',  'week');

-- GST / Tax configuration (admin manages slabs)
CREATE TABLE tax_configurations (
    id              SERIAL      PRIMARY KEY,
    name            TEXT        NOT NULL,                   -- "GST 18%", "IGST 18%", "CGST 9%", "SGST 9%"
    tax_type        TEXT        NOT NULL
                                CHECK (tax_type IN ('IGST', 'CGST', 'SGST')),
    rate            NUMERIC(5,2) NOT NULL,                  -- e.g. 18.00, 9.00
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- SECTION 3 — PRODUCTS, ATTRIBUTES & VARIANTS
-- =============================================================
-- Covers: Product catalog, rental pricing tiers,
--         attributes (global), attribute values, variants

CREATE TABLE products (
    id              SERIAL      PRIMARY KEY,
    vendor_id       INT         NOT NULL REFERENCES users(id),  -- the vendor who owns this product
    name            TEXT        NOT NULL,
    sku             TEXT        UNIQUE NOT NULL,
    is_rentable     BOOLEAN     NOT NULL DEFAULT TRUE,
    cost_price      NUMERIC(10,2) NOT NULL,                -- what the vendor paid
    sales_price     NUMERIC(10,2) NOT NULL,                -- base rental price (fallback)
    qty_on_hand     INT         NOT NULL DEFAULT 0,
    is_published    BOOLEAN     NOT NULL DEFAULT FALSE,    -- visible on website
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_qty_on_hand   CHECK (qty_on_hand >= 0),
    CONSTRAINT chk_prices        CHECK (sales_price >= 0 AND cost_price >= 0)
);

CREATE INDEX idx_products_vendor     ON products (vendor_id);
CREATE INDEX idx_products_published  ON products (is_published) WHERE is_published = TRUE;

-- Per-product rental pricing tiers (hourly / daily / weekly / custom)
CREATE TABLE rental_pricing (
    id              SERIAL      PRIMARY KEY,
    product_id      INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    period_type_id  INT         NOT NULL REFERENCES rental_period_types(id),
    price           NUMERIC(10,2) NOT NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,

    UNIQUE (product_id, period_type_id)                     -- one price per period type per product
);

-- Global attribute definitions (configurable from Admin Settings)
-- e.g. "Brand", "Color", "Size" — these exist independently of any product
CREATE TABLE product_attributes (
    id              SERIAL      PRIMARY KEY,
    name            TEXT        UNIQUE NOT NULL,            -- "Color", "Brand"
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Values for each attribute (also global, admin-managed)
-- e.g. Color → Red, Blue, Green
CREATE TABLE product_attribute_values (
    id              SERIAL      PRIMARY KEY,
    attribute_id    INT         NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    value           TEXT        NOT NULL,                   -- "Red", "Large"
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (attribute_id, value)
);

CREATE INDEX idx_attr_values_attribute ON product_attribute_values (attribute_id);

-- Which attributes are used on which product
-- (links global attributes to specific products)
CREATE TABLE product_attribute_mapping (
    id              SERIAL      PRIMARY KEY,
    product_id      INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_id    INT         NOT NULL REFERENCES product_attributes(id),

    UNIQUE (product_id, attribute_id)
);

-- Product variants (each variant = a specific combo of attribute values)
-- e.g. Product "Drill" → Variant "Red + Large"
CREATE TABLE product_variants (
    id              SERIAL      PRIMARY KEY,
    product_id      INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku             TEXT        UNIQUE NOT NULL,            -- variant-level SKU
    price_override  NUMERIC(10,2),                         -- NULL = inherit product sales_price
    qty_on_hand     INT         NOT NULL DEFAULT 0,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_variant_qty CHECK (qty_on_hand >= 0)
);

CREATE INDEX idx_variants_product ON product_variants (product_id);

-- Junction: which attribute values make up a variant
CREATE TABLE variant_attribute_values (
    id              SERIAL      PRIMARY KEY,
    variant_id      INT         NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_value_id INT      NOT NULL REFERENCES product_attribute_values(id),

    UNIQUE (variant_id, attribute_value_id)
);


-- =============================================================
-- SECTION 4 — QUOTATIONS & RENTAL ORDERS
-- =============================================================
-- Covers: Cart (= quotation), quotation lines, order
--         confirmation, rental order lines, reservations

CREATE TABLE quotations (
    id              SERIAL      PRIMARY KEY,
    customer_id     INT         NOT NULL REFERENCES users(id),
    status          TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'sent', 'confirmed', 'cancelled')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotations_customer ON quotations (customer_id);

CREATE TABLE quotation_lines (
    id              SERIAL      PRIMARY KEY,
    quotation_id    INT         NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id      INT         NOT NULL REFERENCES products(id),
    variant_id      INT         REFERENCES product_variants(id),   -- NULL if product has no variants
    quantity        INT         NOT NULL DEFAULT 1,
    rental_start    DATE        NOT NULL,
    rental_end      DATE        NOT NULL,
    unit_price      NUMERIC(10,2) NOT NULL,                 -- price at time of add-to-cart

    CONSTRAINT chk_ql_dates CHECK (rental_end > rental_start),
    CONSTRAINT chk_ql_qty   CHECK (quantity > 0)
);

CREATE INDEX idx_ql_quotation ON quotation_lines (quotation_id);
CREATE INDEX idx_ql_product   ON quotation_lines (product_id);

-- Rental order (created 1:1 when quotation is confirmed)
CREATE TABLE rental_orders (
    id              SERIAL      PRIMARY KEY,
    quotation_id    INT         UNIQUE NOT NULL REFERENCES quotations(id),
    customer_id     INT         NOT NULL REFERENCES users(id),
    billing_address_id  INT     REFERENCES user_addresses(id),
    shipping_address_id INT     REFERENCES user_addresses(id),
    status          TEXT        NOT NULL DEFAULT 'confirmed'
                                CHECK (status IN ('confirmed', 'active', 'returned', 'cancelled')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON rental_orders (customer_id);

-- Frozen line snapshot at confirmation (never mutates after creation)
CREATE TABLE rental_order_lines (
    id              SERIAL      PRIMARY KEY,
    rental_order_id INT         NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    product_id      INT         NOT NULL REFERENCES products(id),
    variant_id      INT         REFERENCES product_variants(id),
    quantity        INT         NOT NULL,
    rental_start    DATE        NOT NULL,
    rental_end      DATE        NOT NULL,
    unit_price      NUMERIC(10,2) NOT NULL,

    CONSTRAINT chk_rol_dates CHECK (rental_end > rental_start),
    CONSTRAINT chk_rol_qty   CHECK (quantity > 0)
);

CREATE INDEX idx_rol_order   ON rental_order_lines (rental_order_id);
CREATE INDEX idx_rol_product ON rental_order_lines (product_id);

-- Reservation ledger (blocks availability for a date range)
CREATE TABLE reservations (
    id              SERIAL      PRIMARY KEY,
    rental_order_id INT         NOT NULL REFERENCES rental_orders(id),
    product_id      INT         NOT NULL REFERENCES products(id),
    variant_id      INT         REFERENCES product_variants(id),
    quantity        INT         NOT NULL,
    rental_start    DATE        NOT NULL,
    rental_end      DATE        NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'released')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Only active reservations need fast overlap lookups
CREATE INDEX idx_reservations_overlap
    ON reservations (product_id, rental_start, rental_end)
    WHERE status = 'active';


-- =============================================================
-- SECTION 5 — STOCK LOCATIONS & MOVES
-- =============================================================

CREATE TABLE stock_locations (
    id      SERIAL  PRIMARY KEY,
    name    TEXT    UNIQUE NOT NULL,
    type    TEXT    NOT NULL CHECK (type IN ('internal', 'transit', 'customer'))
);

INSERT INTO stock_locations (name, type) VALUES
    ('warehouse',        'internal'),
    ('in_transit_out',   'transit'),
    ('with_customer',    'customer'),
    ('in_transit_back',  'transit');

-- Append-only stock movement log — never update or delete rows
CREATE TABLE stock_moves (
    id              SERIAL      PRIMARY KEY,
    rental_order_id INT         NOT NULL REFERENCES rental_orders(id),
    product_id      INT         NOT NULL REFERENCES products(id),
    variant_id      INT         REFERENCES product_variants(id),
    quantity        INT         NOT NULL,
    from_location   INT         NOT NULL REFERENCES stock_locations(id),
    to_location     INT         NOT NULL REFERENCES stock_locations(id),
    moved_at        TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_move_locations CHECK (from_location <> to_location)
);

CREATE INDEX idx_moves_product ON stock_moves (product_id, moved_at);


-- =============================================================
-- SECTION 6 — PICKUP & RETURN DOCUMENTS
-- =============================================================

CREATE TABLE pickup_documents (
    id                  SERIAL      PRIMARY KEY,
    rental_order_id     INT         UNIQUE NOT NULL REFERENCES rental_orders(id),
    status              TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'dispatched', 'completed', 'cancelled')),
    instructions        TEXT,                               -- vendor-facing pickup notes
    scheduled_date      DATE        NOT NULL,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pickup_lines (
    id                      SERIAL      PRIMARY KEY,
    pickup_document_id      INT         NOT NULL REFERENCES pickup_documents(id) ON DELETE CASCADE,
    rental_order_line_id    INT         NOT NULL REFERENCES rental_order_lines(id),
    quantity_expected       INT         NOT NULL,
    quantity_picked         INT         NOT NULL DEFAULT 0,
    picked_at               TIMESTAMPTZ,

    CONSTRAINT chk_pickup_qty CHECK (quantity_picked <= quantity_expected)
);

CREATE TABLE return_documents (
    id                  SERIAL      PRIMARY KEY,
    rental_order_id     INT         UNIQUE NOT NULL REFERENCES rental_orders(id),
    status              TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'in_transit', 'received', 'cancelled')),
    scheduled_date      DATE        NOT NULL,               -- = rental_end of the order
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE return_lines (
    id                      SERIAL      PRIMARY KEY,
    return_document_id      INT         NOT NULL REFERENCES return_documents(id) ON DELETE CASCADE,
    rental_order_line_id    INT         NOT NULL REFERENCES rental_order_lines(id),
    quantity_expected       INT         NOT NULL,
    quantity_returned       INT         NOT NULL DEFAULT 0,
    returned_at             TIMESTAMPTZ,

    CONSTRAINT chk_return_qty CHECK (quantity_returned <= quantity_expected)
);


-- =============================================================
-- SECTION 7 — LATE FEES
-- =============================================================

-- Configurable policy: product-specific or global (product_id IS NULL)
CREATE TABLE late_fee_policies (
    id                  SERIAL      PRIMARY KEY,
    product_id          INT         REFERENCES products(id) UNIQUE,   -- NULL = global fallback
    grace_period_days   INT         NOT NULL DEFAULT 1,
    fee_per_day         NUMERIC(10,2) NOT NULL,
    max_fee_multiplier  NUMERIC(4,2)  NOT NULL DEFAULT 2.00           -- cap at N× daily price
);

-- Computed late charges — written once at return processing, never recalculated
CREATE TABLE late_fees (
    id                      SERIAL      PRIMARY KEY,
    return_line_id          INT         NOT NULL REFERENCES return_lines(id),
    rental_order_line_id    INT         NOT NULL REFERENCES rental_order_lines(id),
    rental_end              DATE        NOT NULL,
    actual_return_date      DATE        NOT NULL,
    late_days               INT         NOT NULL DEFAULT 0,
    fee_amount              NUMERIC(10,2) NOT NULL,

    CONSTRAINT chk_late_days   CHECK (late_days >= 0),
    CONSTRAINT chk_fee_amount  CHECK (fee_amount >= 0)
);


-- =============================================================
-- SECTION 8 — NOTIFICATIONS
-- =============================================================
-- Covers: Pre-return reminders, delayed-return alerts

CREATE TABLE notifications (
    id              SERIAL      PRIMARY KEY,
    user_id         INT         NOT NULL REFERENCES users(id),
    rental_order_id INT         REFERENCES rental_orders(id),
    type            TEXT        NOT NULL
                                CHECK (type IN (
                                    'return_reminder',      -- scheduled before rental_end
                                    'return_overdue',       -- triggered after rental_end passes
                                    'pickup_scheduled',     -- pickup document dispatched
                                    'order_confirmed',      -- quotation → order
                                    'payment_received'      -- payment confirmation
                                )),
    message         TEXT        NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'sent', 'failed')),
    scheduled_at    TIMESTAMPTZ,                            -- when it should fire (for reminders)
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user   ON notifications (user_id);
CREATE INDEX idx_notifications_order  ON notifications (rental_order_id);
CREATE INDEX idx_notifications_sched  ON notifications (scheduled_at) WHERE status = 'pending';


-- =============================================================
-- SECTION 9 — INVOICING
-- =============================================================
-- Covers: Invoice creation from order, line items,
--         tax application, payment types (full / partial / deposit)

CREATE TABLE invoices (
    id                  SERIAL      PRIMARY KEY,
    rental_order_id     INT         NOT NULL REFERENCES rental_orders(id),
    customer_id         INT         NOT NULL REFERENCES users(id),
    billing_address_id  INT         REFERENCES user_addresses(id),
    status              TEXT        NOT NULL DEFAULT 'draft'
                                    CHECK (status IN ('draft', 'posted', 'paid', 'partial', 'cancelled')),
    invoice_number      TEXT        UNIQUE,                 -- generated on posting (e.g. INV-2026-00001)
    subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,   -- sum of line totals before tax
    total_tax           NUMERIC(12,2) NOT NULL DEFAULT 0,   -- sum of all taxes
    total_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,   -- subtotal + total_tax
    amount_due          NUMERIC(12,2) NOT NULL DEFAULT 0,   -- total_amount - total paid
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_order    ON invoices (rental_order_id);
CREATE INDEX idx_invoices_customer ON invoices (customer_id);

-- One invoice line per rental order line
CREATE TABLE invoice_lines (
    id                      SERIAL      PRIMARY KEY,
    invoice_id              INT         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    rental_order_line_id    INT         NOT NULL REFERENCES rental_order_lines(id),
    description             TEXT        NOT NULL,           -- snapshot of product name + variant
    quantity                INT         NOT NULL,
    unit_price              NUMERIC(10,2) NOT NULL,
    line_total              NUMERIC(12,2) NOT NULL,         -- quantity × unit_price
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_lines_invoice ON invoice_lines (invoice_id);

-- Taxes applied to each invoice line (IGST or CGST+SGST)
CREATE TABLE invoice_taxes (
    id                  SERIAL      PRIMARY KEY,
    invoice_line_id     INT         NOT NULL REFERENCES invoice_lines(id) ON DELETE CASCADE,
    tax_config_id       INT         NOT NULL REFERENCES tax_configurations(id),
    tax_amount          NUMERIC(10,2) NOT NULL             -- computed: line_total × rate / 100
);


-- =============================================================
-- SECTION 10 — PAYMENTS
-- =============================================================
-- Covers: Online gateway payments (Stripe), partial/deposit support,
--         payment status tracking

CREATE TABLE payments (
    id                  SERIAL      PRIMARY KEY,
    invoice_id          INT         NOT NULL REFERENCES invoices(id),
    amount              NUMERIC(12,2) NOT NULL,
    payment_type        TEXT        NOT NULL
                                    CHECK (payment_type IN ('full', 'partial', 'security_deposit')),
    gateway_transaction_id  TEXT,                           -- Stripe Payment Intent ID
    stripe_payment_intent_id TEXT,                          -- Stripe Payment Intent ID
    status              TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paid_at             TIMESTAMPTZ,                        -- timestamp of successful payment
    created_at          TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_invoice ON payments (invoice_id);
CREATE INDEX idx_payments_stripe ON payments (stripe_payment_intent_id);


-- =============================================================
-- CONVENIENCE VIEWS (for reports & dashboards)
-- =============================================================

-- Total rental revenue per vendor
CREATE VIEW v_vendor_revenue AS
SELECT
    u.id                            AS vendor_id,
    u.name                          AS vendor_name,
    c.name                          AS company_name,
    c.gstin,
    COUNT(DISTINCT ro.id)           AS total_orders,
    COALESCE(SUM(p_pay.amount), 0)  AS total_revenue
FROM users u
JOIN companies c          ON c.user_id = u.id
JOIN products pr          ON pr.vendor_id = u.id
JOIN rental_order_lines rol ON rol.product_id = pr.id
JOIN rental_orders ro     ON ro.id = rol.rental_order_id
JOIN invoices inv         ON inv.rental_order_id = ro.id
LEFT JOIN payments p_pay  ON p_pay.invoice_id = inv.id AND p_pay.status = 'completed'
WHERE u.role = 'vendor'
GROUP BY u.id, u.name, c.name, c.gstin;

-- Most-rented products (by total quantity rented)
CREATE VIEW v_most_rented_products AS
SELECT
    pr.id                       AS product_id,
    pr.name                     AS product_name,
    SUM(rol.quantity)           AS total_qty_rented,
    COUNT(DISTINCT ro.id)       AS total_orders
FROM products pr
JOIN rental_order_lines rol ON rol.product_id = pr.id
JOIN rental_orders ro       ON ro.id = rol.rental_order_id
WHERE ro.status NOT IN ('cancelled')
GROUP BY pr.id, pr.name
ORDER BY total_qty_rented DESC;

-- Order trends over time (monthly)
CREATE VIEW v_order_trends AS
SELECT
    DATE_TRUNC('month', ro.created_at)  AS month,
    COUNT(*)                            AS order_count,
    COALESCE(SUM(inv.total_amount), 0)  AS revenue
FROM rental_orders ro
LEFT JOIN invoices inv ON inv.rental_order_id = ro.id
WHERE ro.status NOT IN ('cancelled')
GROUP BY month
ORDER BY month;
