// Check what tables exist in the database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'orders.db');

console.log('🔍 Checking database tables...\n');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
});

// Get all table names
db.all(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
`, [], (err, rows) => {
    if (err) {
        console.error('❌ Error querying tables:', err.message);
        return;
    }
    
    console.log('📋 Tables in database:');
    rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name}`);
    });
    
    // Check if parts table exists
    const hasPartsTable = rows.some(row => row.name === 'parts');
    
    if (hasPartsTable) {
        console.log('\n✅ Parts table exists');
        
        // Check parts table structure
        db.all("PRAGMA table_info(parts)", [], (err, columns) => {
            if (err) {
                console.error('❌ Error checking parts table structure:', err.message);
                return;
            }
            
            console.log('\n📋 Parts table structure:');
            columns.forEach(col => {
                console.log(`  ${col.name}: ${col.type}`);
            });
            
            db.close();
        });
    } else {
        console.log('\n❌ Parts table does NOT exist');
        db.close();
    }
});