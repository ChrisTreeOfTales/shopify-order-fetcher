// Create a mapping between existing SKUs and CSV product names
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('🔗 Creating SKU mapping for CSV products...');

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

// Parse CSV file
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
}

// Parse plate descriptions from string
function parsePlateDescriptions(plateDescStr) {
    try {
        const cleaned = plateDescStr.replace(/^"/, '').replace(/"$/, '');
        const parsed = JSON.parse(cleaned.replace(/'/g, '"'));
        return parsed;
    } catch (error) {
        console.warn(`⚠️ Could not parse plate descriptions: ${plateDescStr}`);
        return [];
    }
}

// Manual mapping of existing SKUs to CSV product names
const skuToProductMapping = {
    'BB0001': 'Battlebox',
    'ACC044': '3 Measurement stick', // Fixed: matches CSV parsing output  
    'ACC110': 'Deep Strike Combo set', // 9" & 6" markers
    'TK030': '16mm Wound marker combo', // Default mapping for TK030 (will be overridden by variant logic)
    'TK030_12mm_combo': '12mm Wound marker combo', // Virtual SKU for variant mapping
    'TK030_12mm_xl': '12mm Wound marker XL set', // Virtual SKU for variant mapping
    'TK030_16mm_xl': '16mm Wound marker XL set', // Virtual SKU for variant mapping
    'TOK0001': 'Objective Marker set',
    'DEPLOYMENT001': 'Double Deployment Zone set',
    'ACC139': '16mm Wound marker XL set', // Magnetic wound tracker
    'M01': 'Battlebox', // Default for unknown products
    'M002': 'Battlebox' // Default for unknown products
};

async function updateProductsWithSKUMapping() {
    try {
        const productData = parseCSV('./docs/product_information.csv');
        
        // Clear existing products and product plates
        await runQuery('DELETE FROM product_plates');
        await runQuery('DELETE FROM products');
        console.log('🗑️ Cleared existing product data');
        
        // Create products using actual SKUs
        for (const [sku, csvProductName] of Object.entries(skuToProductMapping)) {
            const productInfo = productData.find(p => p['Product Name'] === csvProductName);
            
            if (productInfo) {
                const plateDescriptions = parsePlateDescriptions(productInfo['Plate Descriptions']);
                const numberOfPlates = parseInt(productInfo['Number of Plates']) || plateDescriptions.length;
                
                // Insert product with actual SKU
                const result = await runQuery(
                    `INSERT INTO products (sku, product_name, category, number_of_printing_plates, box_size) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        sku,
                        productInfo['Product Name'], // Use shortform name from CSV
                        'General',
                        numberOfPlates,
                        'Medium'
                    ]
                );
                
                const productId = result.id;
                
                // Insert plate descriptions
                for (let i = 0; i < plateDescriptions.length; i++) {
                    await runQuery(
                        `INSERT INTO product_plates (product_id, plate_order, plate_name) 
                         VALUES (?, ?, ?)`,
                        [productId, i + 1, plateDescriptions[i]]
                    );
                }
                
                console.log(`✅ Mapped SKU ${sku} -> ${productInfo['Product Name']} (${numberOfPlates} plates)`);
                console.log(`   Plates: ${plateDescriptions.join(', ')}`);
            } else {
                console.warn(`⚠️ No CSV product found for ${csvProductName}, creating default`);
                await runQuery(
                    `INSERT INTO products (sku, product_name, category, number_of_printing_plates, box_size) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [sku, csvProductName, 'General', 2, 'Medium']
                );
            }
        }
        
        console.log('🎉 Successfully updated products with SKU mapping!');
        
    } catch (error) {
        console.error('❌ Error updating products:', error.message);
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

updateProductsWithSKUMapping();