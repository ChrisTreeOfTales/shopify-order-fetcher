const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🔍 Testing filtered printing view...');

// Check what plates are shown in the new filtered view
db.all(`
  SELECT 
    pp.plate_id,
    pp.plate_type,
    pp.status,
    COALESCE(p.product_name, oi.product_name) as product_name,
    c.name as customer_name
  FROM printing_plates pp
  LEFT JOIN order_items oi ON pp.order_item_id = oi.order_item_id
  LEFT JOIN customers c ON oi.customer_id = c.customer_id
  LEFT JOIN products p ON oi.product_id = p.product_id
  WHERE pp.status IN ('In Queue', 'In Progress', 'Blocked')
  ORDER BY pp.created_at ASC
`, [], (err, activeRows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('📊 Active plates (shown in printing view):');
  console.log('');
  
  if (activeRows.length === 0) {
    console.log('✅ No active plates found - all plates are printed or done!');
  } else {
    activeRows.forEach((row, i) => {
      console.log(`${i+1}. ${row.product_name} - ${row.plate_type}`);
      console.log(`   Customer: ${row.customer_name}`);
      console.log(`   Status: ${row.status}`);
      console.log('');
    });
  }
  
  // Also check how many plates were filtered out
  db.all(`
    SELECT 
      pp.status,
      COUNT(*) as count
    FROM printing_plates pp
    GROUP BY pp.status
    ORDER BY pp.status
  `, [], (err, statusRows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    console.log('📈 All plates by status:');
    statusRows.forEach(row => {
      const isVisible = ['In Queue', 'In Progress', 'Blocked'].includes(row.status);
      const visibility = isVisible ? '👁️ VISIBLE' : '🚫 HIDDEN';
      console.log(`   ${visibility} ${row.status}: ${row.count} plates`);
    });
    
    const activeCount = activeRows.length;
    const totalCount = statusRows.reduce((sum, row) => sum + row.count, 0);
    const hiddenCount = totalCount - activeCount;
    
    console.log('');
    console.log(`🎯 Summary: Showing ${activeCount} active plates, hiding ${hiddenCount} completed plates`);
    
    db.close();
  });
});