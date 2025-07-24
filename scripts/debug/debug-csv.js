const fs = require('fs');

// Parse CSV file - same logic as in sku-mapping.js
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

console.log('🔍 Debugging CSV parsing...');

const productData = parseCSV('./docs/product_information.csv');

console.log('📊 Parsed products:');
productData.forEach((product, i) => {
    console.log(`${i+1}. Product Name: "${product['Product Name']}" | Plates: ${product['Number of Plates']}`);
});

console.log('\n🔍 Looking for 3" Measurement stick specifically:');
const measurementStick = productData.find(p => p['Product Name'].includes('Measurement'));
if (measurementStick) {
    console.log('✅ Found:', measurementStick);
} else {
    console.log('❌ Not found');
}

console.log('\n🔍 Checking exact match for "3\\" Measurement stick":');
const exactMatch = productData.find(p => p['Product Name'] === '3" Measurement stick');
if (exactMatch) {
    console.log('✅ Exact match found:', exactMatch);
} else {
    console.log('❌ No exact match');
}