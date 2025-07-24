// Script to update the system with CSV data for products and colors
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('📊 Updating system with CSV data...');

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

// Helper function to get data from database
function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
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
        // Remove outer quotes and parse as JSON-like array
        const cleaned = plateDescStr.replace(/^"/, '').replace(/"$/, '');
        const parsed = JSON.parse(cleaned.replace(/'/g, '"'));
        return parsed;
    } catch (error) {
        console.warn(`⚠️ Could not parse plate descriptions: ${plateDescStr}`);
        return [];
    }
}

async function updateProductsFromCSV() {
    console.log('📦 Reading product information CSV...');
    
    try {
        const productData = parseCSV('./docs/product_information.csv');
        
        // Clear existing products and product plates
        await runQuery('DELETE FROM product_plates');
        await runQuery('DELETE FROM products');
        console.log('🗑️ Cleared existing product data');
        
        for (const product of productData) {
            if (!product['Product Name']) continue;
            
            const plateDescriptions = parsePlateDescriptions(product['Plate Descriptions']);
            const numberOfPlates = parseInt(product['Number of Plates']) || plateDescriptions.length;
            
            // Insert product with shortform name
            const result = await runQuery(
                `INSERT INTO products (sku, product_name, category, number_of_printing_plates, box_size) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    'AUTO_' + product['Product Name'].replace(/[^a-zA-Z0-9]/g, '_').toUpperCase(),
                    product['Product Name'], // Using shortform name from CSV
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
            
            console.log(`✅ Added: ${product['Product Name']} (${numberOfPlates} plates)`);
            console.log(`   Plates: ${plateDescriptions.join(', ')}`);
        }
        
        console.log(`🎉 Successfully updated ${productData.length} products from CSV!`);
        
    } catch (error) {
        console.error('❌ Error updating products from CSV:', error.message);
    }
}

async function createColorMapping() {
    console.log('🎨 Reading available colors CSV...');
    
    try {
        const colorData = parseCSV('./docs/available_colors.csv');
        
        // Create color mapping with default hex codes
        const colorMapping = {};
        const cssVariables = [];
        
        for (const color of colorData) {
            const colorName = color['Color Name'];
            if (!colorName) continue;
            
            // Generate CSS variable name
            const cssVarName = '--color-' + colorName.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            
            // Default hex codes (you can customize these)
            const defaultHex = getDefaultHexForColor(colorName);
            
            colorMapping[colorName.toLowerCase()] = {
                name: colorName,
                cssVar: cssVarName,
                hex: defaultHex
            };
            
            cssVariables.push(`  ${cssVarName}: ${defaultHex};`);
        }
        
        // Write color mapping to JavaScript file
        const colorMapContent = `// Auto-generated color mapping from available_colors.csv
export const COLOR_MAPPING = ${JSON.stringify(colorMapping, null, 2)};

// Available color names for detection
export const AVAILABLE_COLORS = [
${colorData.map(c => `  '${c['Color Name']}'`).filter(c => c !== "  ''").join(',\n')}
];
`;
        
        fs.writeFileSync('./public/color-mapping.js', colorMapContent);
        console.log('✅ Created color mapping JavaScript file');
        
        // Write CSS variables to file
        const cssContent = `/* Auto-generated color variables from available_colors.csv */
:root {
${cssVariables.join('\n')}
}

/* Color utility classes */
${Object.values(colorMapping).map(color => 
    `.bg-${color.cssVar.replace('--color-', '')} { 
      background-color: var(${color.cssVar}); 
    }`
).join('\n')}
`;
        
        fs.writeFileSync('./public/colors.css', cssContent);
        console.log('✅ Created CSS color variables file');
        
        console.log(`🎨 Successfully processed ${colorData.length} colors!`);
        
    } catch (error) {
        console.error('❌ Error creating color mapping:', error.message);
    }
}

// Default hex code mapping
function getDefaultHexForColor(colorName) {
    const defaults = {
        'army green': '#4b5d31',
        'black': '#000000',
        'blue': '#3b82f6',
        'neon green': '#39ff14',
        'brown': '#8b4513',
        'copper': '#b87333',
        'cyan': '#00ffff',
        'dark blue': '#00008b',
        'dark grey': '#2d2d2d',
        'dark purple': '#301934',
        'dark red': '#8b0000',
        'dark silver': '#71706e',
        'gold': '#ffd700',
        'green': '#10b981',
        'grey': '#6b7280',
        'light blue': '#add8e6',
        'light brown': '#d2b48c',
        'light green': '#90ee90',
        'neon orange': '#ff6600',
        'neon pink': '#ff1493',
        'neon green': '#39ff14', // Handle duplicate
        'orange': '#ffa500',
        'pink': '#ffc0cb',
        'purple': '#800080',
        'red': '#ff0000',
        'silver': '#c0c0c0',
        'white': '#ffffff',
        'yellow': '#ffff00',
        'unknown': '#808080'
    };
    
    return defaults[colorName.toLowerCase()] || '#808080';
}

async function main() {
    try {
        await updateProductsFromCSV();
        await createColorMapping();
        
        console.log('\n🎉 CSV integration complete!');
        console.log('📁 Files created:');
        console.log('   - public/color-mapping.js (color data for JavaScript)');
        console.log('   - public/colors.css (CSS variables for colors)');
        console.log('\n💡 Next steps:');
        console.log('   1. Include colors.css in your HTML files');
        console.log('   2. Update color detection logic to use new color list');
        console.log('   3. Customize hex codes in public/colors.css as needed');
        
    } catch (error) {
        console.error('❌ Error in main process:', error.message);
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

main();