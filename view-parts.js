// View Parts Database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'orders.db');

console.log('📋 Viewing Parts Database...\n');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
});

// Helper function to format time as hours and minutes
function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
}

// Query all parts
db.all(`
    SELECT 
        part_id,
        part_name,
        part_description,
        number_of_colors,
        printing_cost_sek,
        printing_time_minutes,
        created_at
    FROM parts 
    ORDER BY part_name
`, [], (err, rows) => {
    if (err) {
        console.error('❌ Error querying parts:', err.message);
        return;
    }
    
    if (rows.length === 0) {
        console.log('No parts found in database');
        return;
    }
    
    console.log(`Found ${rows.length} parts:\n`);
    
    // Table header
    console.log('ID'.padEnd(4) + 'Name'.padEnd(30) + 'Colors'.padEnd(8) + 'Cost SEK'.padEnd(10) + 'Time'.padEnd(10) + 'Description');
    console.log('-'.repeat(90));
    
    rows.forEach(row => {
        const id = row.part_id.toString().padEnd(4);
        const name = row.part_name.padEnd(30);
        const colors = row.number_of_colors.toString().padEnd(8);
        const cost = `${row.printing_cost_sek} kr`.padEnd(10);
        const time = formatTime(row.printing_time_minutes).padEnd(10);
        const desc = row.part_description || '';
        
        console.log(id + name + colors + cost + time + desc);
    });
    
    // Summary statistics
    const totalParts = rows.length;
    const totalCost = rows.reduce((sum, row) => sum + parseFloat(row.printing_cost_sek), 0);
    const totalTime = rows.reduce((sum, row) => sum + row.printing_time_minutes, 0);
    const avgColors = (rows.reduce((sum, row) => sum + row.number_of_colors, 0) / totalParts).toFixed(1);
    
    console.log('\n📊 Summary:');
    console.log(`Total parts: ${totalParts}`);
    console.log(`Total printing cost: ${totalCost.toFixed(2)} SEK`);
    console.log(`Total printing time: ${formatTime(totalTime)} (${totalTime} minutes)`);
    console.log(`Average colors per part: ${avgColors}`);
});

db.close();