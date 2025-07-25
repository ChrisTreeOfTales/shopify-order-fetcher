// Fix customer order counts
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'orders.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing customer order counts...');

// Update customer order counts to match actual orders
const updateQuery = `
UPDATE customers 
SET number_of_orders = (
    SELECT COUNT(*) 
    FROM orders 
    WHERE orders.customer_id = customers.customer_id
)`;

db.run(updateQuery, function(err) {
    if (err) {
        console.error('❌ Error updating customer counts:', err.message);
        process.exit(1);
    }
    
    console.log(`✅ Updated ${this.changes} customer records`);
    
    // Verify the fix by showing the updated counts
    const verifyQuery = `
    SELECT 
        c.customer_id,
        c.name,
        c.number_of_orders as stored_count,
        COUNT(o.order_id) as actual_count
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.name, c.number_of_orders
    ORDER BY c.customer_id DESC
    LIMIT 10`;
    
    db.all(verifyQuery, [], (err, rows) => {
        if (err) {
            console.error('❌ Error verifying counts:', err.message);
            process.exit(1);
        }
        
        console.log('\n📊 Verification (showing top 10 customers):');
        console.log('Customer ID | Name                  | Stored | Actual');
        console.log('-----------|----------------------|--------|-------');
        
        rows.forEach(row => {
            const match = row.stored_count === row.actual_count ? '✅' : '❌';
            console.log(`${String(row.customer_id).padEnd(10)} | ${String(row.name).padEnd(20)} | ${String(row.stored_count).padEnd(6)} | ${String(row.actual_count).padEnd(6)} ${match}`);
        });
        
        console.log('\n✅ Customer order counts have been corrected!');
        
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            } else {
                console.log('✅ Database connection closed');
            }
            process.exit(0);
        });
    });
});