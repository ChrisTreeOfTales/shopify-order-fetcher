// Reset script to clear data for testing new plate types
const sqlite3 = require('sqlite3').verbose();

console.log('🔄 Resetting data for plate type testing...');

const db = new sqlite3.Database('./orders.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Helper function to run database queries with promises
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

async function resetData() {
    try {
        // Clear in order due to foreign key constraints
        await runQuery('DELETE FROM printing_plates');
        console.log('✅ Cleared printing_plates');
        
        await runQuery('DELETE FROM order_items');
        console.log('✅ Cleared order_items');
        
        await runQuery('DELETE FROM orders');
        console.log('✅ Cleared orders');
        
        await runQuery('DELETE FROM customers');
        console.log('✅ Cleared customers');
        
        console.log('🎉 Reset complete! Now fetch orders to test new plate types:');
        console.log('   curl -X POST http://localhost:3001/api/shopify/fetch-orders');
        
    } catch (error) {
        console.error('❌ Error resetting data:', error.message);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            } else {
                console.log('✅ Database connection closed');
            }
        });
    }
}

resetData();