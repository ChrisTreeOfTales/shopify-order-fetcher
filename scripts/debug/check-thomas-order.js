const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🔍 Checking Thomas Gonsor\'s order specifically...');

// Find Thomas Gonsor's order
db.all(`
  SELECT 
    o.shopify_order_id,
    c.name as customer_name,
    c.email,
    oi.order_item_id,
    oi.product_name as order_product_name,
    oi.sku,
    oi.variant_details,
    p.product_name as mapped_product_name,
    p.product_id,
    pp.plate_type
  FROM orders o
  LEFT JOIN customers c ON o.customer_id = c.customer_id
  LEFT JOIN order_items oi ON o.order_id = oi.order_id
  LEFT JOIN products p ON oi.product_id = p.product_id
  LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id
  WHERE c.name LIKE '%Thomas%' OR c.name LIKE '%Gonsor%'
  ORDER BY o.order_id, oi.order_item_id
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (rows.length === 0) {
    console.log('❌ No orders found for Thomas Gonsor');
    
    // Let's also search for similar names
    db.all(`
      SELECT DISTINCT c.name, c.email
      FROM customers c
      WHERE c.name LIKE '%Thomas%' OR c.name LIKE '%Gons%'
      LIMIT 10
    `, [], (err, customers) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      if (customers.length > 0) {
        console.log('\n🔍 Found similar customer names:');
        customers.forEach(customer => {
          console.log(`   ${customer.name} (${customer.email})`);
        });
      }
      
      db.close();
    });
  } else {
    console.log('📦 Found Thomas Gonsor\'s order:');
    console.log('');
    
    let currentOrderItem = null;
    
    rows.forEach(row => {
      if (currentOrderItem !== row.order_item_id) {
        currentOrderItem = row.order_item_id;
        console.log(`📦 Order Item ID: ${row.order_item_id}`);
        console.log(`   Customer: ${row.customer_name} (${row.email})`);
        console.log(`   Shopify Order: ${row.shopify_order_id}`);
        console.log(`   Order Product: ${row.order_product_name}`);
        console.log(`   SKU: ${row.sku}`);
        console.log(`   Variant Details: ${row.variant_details}`);
        console.log(`   Mapped to Product: ${row.mapped_product_name} (ID: ${row.product_id})`);
        console.log(`   Plate Type: ${row.plate_type}`);
        console.log('   ---');
      }
    });
    
    db.close();
  }
});