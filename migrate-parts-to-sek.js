// Migration script to update parts table from cents to SEK
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'orders.db');

console.log('🔄 Migrating parts table to use SEK instead of cents...\n');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    // Check if new column already exists
    db.all("PRAGMA table_info(parts)", [], (err, columns) => {
        if (err) {
            console.error('❌ Error checking table info:', err.message);
            return;
        }
        
        const hasNewColumn = columns.some(col => col.name === 'printing_cost_sek');
        
        if (hasNewColumn) {
            console.log('✅ Column printing_cost_sek already exists, skipping migration');
            db.close();
            return;
        }
        
        console.log('Adding new printing_cost_sek column...');
        
        // Add new column
        db.run(`ALTER TABLE parts ADD COLUMN printing_cost_sek DECIMAL(10,2) DEFAULT 0.00`, (err) => {
            if (err) {
                console.error('❌ Error adding new column:', err.message);
                return;
            }
            
            console.log('✅ Added printing_cost_sek column');
            
            // Convert existing data (assuming ~10 SEK = 1 USD, so cents/100 * 10 = SEK)
            console.log('Converting existing costs from cents to SEK...');
            
            db.run(`UPDATE parts SET printing_cost_sek = ROUND(printing_cost_cents * 0.11, 2)`, (err) => {
                if (err) {
                    console.error('❌ Error converting costs:', err.message);
                    return;
                }
                
                console.log('✅ Converted costs to SEK');
                
                // Update existing parts with realistic SEK values
                const updates = [
                    ['Battlebox Base', 5.50],
                    ['Battlebox Lid', 8.25],
                    ['Battlebox Dice Rack', 4.40],
                    ['Battlebox Storage Spacers', 3.30],
                    ['Deployment Box Base', 4.95],
                    ['Deployment Box Lid', 3.85],
                    ['Deployment Zone Marker Set 1', 6.60],
                    ['Deployment Zone Marker Set 2', 6.60],
                    ['Wound Marker 16mm', 1.65],
                    ['Measurement Stick 3inch', 2.75],
                    ['Objective Marker', 2.20]
                ];
                
                console.log('Updating parts with realistic SEK values...');
                
                const updateStmt = db.prepare(`UPDATE parts SET printing_cost_sek = ? WHERE part_name = ?`);
                
                let completed = 0;
                updates.forEach(([name, cost]) => {
                    updateStmt.run([cost, name], (err) => {
                        if (err) {
                            console.error(`❌ Error updating ${name}:`, err.message);
                        } else {
                            console.log(`✅ Updated ${name}: ${cost} SEK`);
                        }
                        
                        completed++;
                        if (completed === updates.length) {
                            updateStmt.finalize(() => {
                                console.log('\n🎉 Migration completed successfully!');
                                console.log('📋 Run "npm run view-parts" to see the updated data');
                                db.close();
                            });
                        }
                    });
                });
            });
        });
    });
});