# Database Schema for Order Management System

## Customers (`customers`)
- customer_id: Integer (PK)
- name: String
- email: String
- number_of_orders: Integer
- created_at: Datetime

## Products (`products`)
- product_id: Integer (PK)
- product_name: String
- category: String
- number_of_printing_plates: Integer
- box_size: String
- sku: String (Unique)

## Filaments (`filaments`)
- filament_id: Integer (PK)
- color_name: String
- price: Float
- hex_code: String
- supplier: String

## Orders (`orders`)
- order_id: Integer (PK)
- customer_id: Integer (FK to customers)
- ship_by_date: Date
- order_status: String (calculated)
- created_at: Datetime
- updated_at: Datetime
- completed_at: Datetime

## Order Items (`order_items`)
- order_item_id: Integer (PK)
- order_id: Integer (FK to orders)
- product_id: Integer (FK to products)
- customer_id: Integer (FK to customers)
- created_at: Datetime
- updated_at: Datetime
- completed_at: Datetime

## Printing Plates (`printing_plates`)
- plate_id: Integer (PK)
- order_item_id: Integer (FK to order_items)
- status: String (`In Queue`, `In Progress`, `Blocked`, `Reprint`, `Printed`, `Done`)
- created_at: Datetime
- updated_at: Datetime
- completed_at: Datetime

## Junction Table: Plate-Filaments (`plate_filaments`)
- plate_id: Integer (FK to printing_plates)
- filament_id: Integer (FK to filaments)

Composite PK: (plate_id, filament_id)

## Relationships & Logic
- Orders status calculated based on linked items and plates statuses.
- Each product can require multiple printing plates, each with their own status.