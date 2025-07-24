const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🔍 Debugging variant details format in database...');

// Check what the actual variant_details look like for TK030 items
db.all(`
  SELECT 
    oi.order_item_id,
    oi.product_name,
    oi.sku,
    oi.variant_details,
    p.product_name as mapped_product_name
  FROM order_items oi 
  LEFT JOIN products p ON oi.product_id = p.product_id
  WHERE oi.sku = 'TK030'
  LIMIT 5
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (rows.length === 0) {
    console.log('📦 No TK030 orders found in database');
  } else {
    console.log('🔍 TK030 orders in database:');
    console.log('');
    
    rows.forEach(row => {
      console.log(`📦 Order Item ID: ${row.order_item_id}`);
      console.log(`   Product Name: ${row.product_name}`);
      console.log(`   SKU: ${row.sku}`);
      console.log(`   Variant Details: "${row.variant_details}"`);
      console.log(`   Mapped to Product: ${row.mapped_product_name}`);
      console.log('');
      
      // Parse the variant details to see what we're working with
      const details = row.variant_details ? row.variant_details.split('|') : [];
      console.log('   Parsed variant details:');
      details.forEach((detail, i) => {
        console.log(`     ${i+1}. "${detail}"`);
      });
      console.log('   ---');
    });
    
    console.log('\n💡 Analysis:');
    console.log('   - Check if the variant details match our parsing logic');
    console.log('   - Look for "Dice size: 12mm" and "Type: XL pack" patterns');
    console.log('   - Verify case sensitivity in matching');
  }
  
  db.close();
});