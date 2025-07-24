# Scripts Directory

This directory contains utility scripts for development, debugging, and maintenance of the order management system.

## Structure

### `/debug/` - Debugging Scripts
Scripts used for investigating issues and understanding system behavior:

- `check-colors.js` - Check color mapping for Deployment Zone orders
- `check-deployment.js` - Check Deployment Zone orders and their plates
- `check-measurement-sticks.js` - Check 3" Measurement stick orders
- `check-products.js` - Check products in database
- `check-thomas-order.js` - Check specific customer order details
- `check-variant-structure.js` - Check order item field structure
- `check-wound-mapping.js` - Check wound marker order-to-product mapping
- `check-wound-markers.js` - Check wound marker orders and plates
- `check-wound-products.js` - Check wound marker products in database
- `debug-csv.js` - Debug CSV parsing for product information
- `debug-shopify-properties.js` - Debug Shopify line item properties
- `debug-variant-format.js` - Debug variant details format in database
- `test-deployment.js` - Test Deployment Zone fix
- `test-plate-count.js` - Test plate counting functionality

### `/migrations/` - Database Migrations
Scripts for updating database schema:

- `add-plate-type-migration.js` - Add plate_type field to printing_plates table
- `add-product-plates-table.js` - Create product_plates table for plate descriptions
- `update-schema.js` - General schema updates

### `/utils/` - Utility Scripts
Useful maintenance and setup scripts:

- `clear-orders.js` - Clear all order data for testing
- `clear-plates-test.js` - Clear printing plates for testing
- `database-setup.js` - Initial database setup
- `reset-for-testing.js` - Reset system for fresh testing
- `setup-products.js` - Set up initial products
- `sku-mapping.js` - Create/update SKU to product mappings
- `update-from-csv.js` - Update products and colors from CSV files

## Usage

Most scripts can be run directly with Node.js:
```bash
node scripts/utils/sku-mapping.js
node scripts/debug/check-products.js
```

**Note**: Make sure you're in the project root directory when running scripts, as they expect to find the database and other files there.