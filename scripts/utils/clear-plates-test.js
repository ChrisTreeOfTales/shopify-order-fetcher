// Test script to clear existing plates and create new ones with proper plate types
const sqlite3 = require('sqlite3').verbose();

console.log('🧹 Clearing existing printing plates for testing...');

const db = new sqlite3.Database('./orders.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Clear existing printing plates
db.run("DELETE FROM printing_plates", (err) => {
    if (err) {
        console.error('❌ Error clearing printing plates:', err.message);
        db.close();
        process.exit(1);
    } else {
        console.log('✅ Cleared all printing plates');
        console.log('ℹ️ Now run: curl -X POST http://localhost:3001/api/shopify/fetch-orders');
        console.log('ℹ️ This will recreate plates with proper plate types');
    }
    
    // Close database connection
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Test setup complete!');
        }
    });
});