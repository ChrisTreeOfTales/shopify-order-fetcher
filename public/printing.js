// JavaScript for the Printing Management Dashboard

// DOM elements
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const statsCards = document.getElementById('stats-cards');
const filtersDiv = document.getElementById('filters');
const platesTableContainer = document.getElementById('plates-table-container');
const platesTableBody = document.getElementById('plates-table-body');
const noplatesDiv = document.getElementById('no-plates');
const dropdownOverlay = document.getElementById('dropdown-overlay');

// API base URL
const API_BASE = '/api';

// Global data
let allPlates = [];
let currentFilter = 'all';

// SKU to shortform product name mapping
const SKU_TO_SHORTFORM = {
    'BB0001': 'Battlebox',
    'ACC044': '3" Measurement stick',
    'ACC110': 'Deep Strike Combo set',
    'TK030': '16mm Wound marker combo',
    'TOK0001': 'Objective Marker set',
    'DEPLOYMENT001': 'Double Deployment Zone set',
    'ACC139': '16mm Wound marker XL set',
    'M01': 'Battlebox',  // Default mapping
    'M002': 'Battlebox'  // Default mapping
};

// Available statuses (only active statuses that need attention)
const STATUSES = [
    { value: 'In Queue', label: 'In Queue', class: 'status-in-queue' },
    { value: 'In Progress', label: 'In Progress', class: 'status-in-progress' },
    { value: 'Blocked', label: 'Blocked', class: 'status-blocked' },
    { value: 'Reprint', label: 'Reprint', class: 'status-reprint' },
    { value: 'Printed', label: 'Mark as Printed', class: 'status-printed' }
];

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPrintingData();
    setupFilters();
});

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.className = 'filter-btn px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300';
        
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => {
                b.className = 'filter-btn px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300';
            });
            
            // Add active class to clicked button
            btn.className = 'filter-btn px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer bg-blue-500 text-white active';
            
            // Apply filter
            currentFilter = btn.dataset.status;
            displayPlates(filterPlates(allPlates));
        });
    });
}

// Load printing plates and statistics
async function loadPrintingData() {
    try {
        showLoading();
        
        // Load both plates and stats in parallel
        const [platesResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE}/printing/plates`),
            fetch(`${API_BASE}/printing/stats`)
        ]);
        
        if (!platesResponse.ok || !statsResponse.ok) {
            throw new Error('Failed to fetch printing data');
        }
        
        const platesResult = await platesResponse.json();
        const statsResult = await statsResponse.json();
        
        if (!platesResult.success || !statsResult.success) {
            throw new Error(platesResult.error || statsResult.error || 'Failed to load data');
        }
        
        allPlates = platesResult.data || [];
        displayStats(statsResult.data);
        displayPlates(filterPlates(allPlates));
        
    } catch (error) {
        console.error('Error loading printing data:', error);
        showError('Failed to load printing data. Please check if the server is running.');
    }
}

// Display statistics cards
function displayStats(stats) {
    if (!stats) return;
    
    const statsData = [
        { label: 'Active Plates', value: stats.total_plates, class: 'bg-gray-500' },
        { label: 'In Queue', value: stats.in_queue, class: 'bg-yellow-500' },
        { label: 'In Progress', value: stats.in_progress, class: 'bg-blue-500' },
        { label: 'Blocked', value: stats.blocked, class: 'bg-red-500' },
        { label: 'Reprint', value: stats.reprint, class: 'bg-orange-500' }
    ];
    
    statsCards.innerHTML = statsData.map(stat => `
        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex items-center">
                <div class="w-4 h-4 rounded-full ${stat.class} mr-3"></div>
                <div>
                    <p class="text-sm font-medium text-gray-600">${stat.label}</p>
                    <p class="text-2xl font-bold text-gray-900">${stat.value || 0}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter plates based on current filter
function filterPlates(plates) {
    if (currentFilter === 'all') {
        return plates;
    }
    return plates.filter(plate => plate.status === currentFilter);
}

// Parse Deployment Zone colors based on plate type
function parseDeploymentZoneColors(details, plateType) {
    const detailString = details.join('|');
    let primaryColor = '';
    let secondaryColor = '';
    
    // Available colors from CSV (case-insensitive matching)
    const availableColors = [
        'Army Green', 'Black', 'Blue', 'Neon Green', 'Brown', 'Copper', 'Cyan',
        'Dark Blue', 'Dark Grey', 'Dark Purple', 'Dark red', 'Dark Silver', 'Gold',
        'Green', 'Grey', 'Light Blue', 'Light Brown', 'Light Green', 'Neon GReen',
        'Neon Orange', 'Neon pink', 'orange', 'pink', 'purple', 'red', 'silver',
        'white', 'Yellow', 'Unknown'
    ];
    
    // Color mapping to CSS variables and hex codes
    const colorMap = {
        'army green': { hex: 'var(--color-army-green)', fallback: '#4b5d31' },
        'black': { hex: 'var(--color-black)', fallback: '#000000' },
        'blue': { hex: 'var(--color-blue)', fallback: '#3b82f6' },
        'neon green': { hex: 'var(--color-neon-green)', fallback: '#39ff14' },
        'brown': { hex: 'var(--color-brown)', fallback: '#8b4513' },
        'copper': { hex: 'var(--color-copper)', fallback: '#b87333' },
        'cyan': { hex: 'var(--color-cyan)', fallback: '#00ffff' },
        'dark blue': { hex: 'var(--color-dark-blue)', fallback: '#00008b' },
        'dark grey': { hex: 'var(--color-dark-grey)', fallback: '#2d2d2d' },
        'dark purple': { hex: 'var(--color-dark-purple)', fallback: '#301934' },
        'dark red': { hex: 'var(--color-dark-red)', fallback: '#8b0000' },
        'dark silver': { hex: 'var(--color-dark-silver)', fallback: '#71706e' },
        'gold': { hex: 'var(--color-gold)', fallback: '#ffd700' },
        'green': { hex: 'var(--color-green)', fallback: '#10b981' },
        'grey': { hex: 'var(--color-grey)', fallback: '#6b7280' },
        'light blue': { hex: 'var(--color-light-blue)', fallback: '#add8e6' },
        'light brown': { hex: 'var(--color-light-brown)', fallback: '#d2b48c' },
        'light green': { hex: 'var(--color-light-green)', fallback: '#90ee90' },
        'neon orange': { hex: 'var(--color-neon-orange)', fallback: '#ff6600' },
        'neon pink': { hex: 'var(--color-neon-pink)', fallback: '#ff1493' },
        'orange': { hex: 'var(--color-orange)', fallback: '#ffa500' },
        'pink': { hex: 'var(--color-pink)', fallback: '#ffc0cb' },
        'purple': { hex: 'var(--color-purple)', fallback: '#800080' },
        'red': { hex: 'var(--color-red)', fallback: '#ff0000' },
        'silver': { hex: 'var(--color-silver)', fallback: '#c0c0c0' },
        'white': { hex: 'var(--color-white)', fallback: '#ffffff' },
        'yellow': { hex: 'var(--color-yellow)', fallback: '#ffff00' },
        'unknown': { hex: 'var(--color-unknown)', fallback: '#808080' }
    };
    
    // Helper function to find color and create indicator
    function findColorAndCreateIndicator(text) {
        const foundColor = availableColors.find(color => 
            text.toLowerCase().includes(color.toLowerCase())
        );
        
        if (foundColor) {
            const colorKey = foundColor.toLowerCase();
            const colorInfo = colorMap[colorKey];
            if (colorInfo) {
                return createColorIndicator(foundColor, colorInfo.fallback, colorInfo.hex);
            }
        }
        return null;
    }
    
    // Parse colors based on plate type
    if (plateType.includes('Set 1')) {
        // Extract First set colors
        const baseColorMatch = detailString.match(/Base color — First set:\s*([^|]+)/i);
        const textColorMatch = detailString.match(/Text color — First set:\s*([^|]+)/i);
        
        if (baseColorMatch) {
            primaryColor = findColorAndCreateIndicator(baseColorMatch[1]) || '';
        }
        if (textColorMatch) {
            secondaryColor = findColorAndCreateIndicator(textColorMatch[1]) || '';
        }
    } else if (plateType.includes('Set 2')) {
        // Extract Second set colors
        const baseColorMatch = detailString.match(/Base color — Second set:\s*([^|]+)/i);
        const textColorMatch = detailString.match(/Text color — Second set:\s*([^|]+)/i);
        
        if (baseColorMatch) {
            primaryColor = findColorAndCreateIndicator(baseColorMatch[1]) || '';
        }
        if (textColorMatch) {
            secondaryColor = findColorAndCreateIndicator(textColorMatch[1]) || '';
        }
    } else if (plateType.includes('Box')) {
        // Extract Box colors
        const baseColorMatch = detailString.match(/Box base color:\s*([^|]+)/i);
        const textColorMatch = detailString.match(/Lid text color:\s*([^|]+)/i);
        
        if (baseColorMatch) {
            primaryColor = findColorAndCreateIndicator(baseColorMatch[1]) || '';
        }
        if (textColorMatch) {
            secondaryColor = findColorAndCreateIndicator(textColorMatch[1]) || '';
        }
    }
    
    return {
        primaryColor: primaryColor || '<div class="text-xs text-gray-400">No color</div>',
        secondaryColor: secondaryColor || '<div class="text-xs text-gray-400">-</div>',
        otherDetails: '<div class="text-xs text-gray-400">-</div>'
    };
}

// Parse details to extract colors and create color indicators
function parseDetailsForColors(details) {
    // Available colors from CSV (case-insensitive matching)
    const availableColors = [
        'Army Green', 'Black', 'Blue', 'Neon Green', 'Brown', 'Copper', 'Cyan',
        'Dark Blue', 'Dark Grey', 'Dark Purple', 'Dark red', 'Dark Silver', 'Gold',
        'Green', 'Grey', 'Light Blue', 'Light Brown', 'Light Green', 'Neon GReen',
        'Neon Orange', 'Neon pink', 'orange', 'pink', 'purple', 'red', 'silver',
        'white', 'Yellow', 'Unknown'
    ];
    
    // Color mapping to CSS variables and hex codes
    const colorMap = {
        'army green': { hex: 'var(--color-army-green)', fallback: '#4b5d31' },
        'black': { hex: 'var(--color-black)', fallback: '#000000' },
        'blue': { hex: 'var(--color-blue)', fallback: '#3b82f6' },
        'neon green': { hex: 'var(--color-neon-green)', fallback: '#39ff14' },
        'brown': { hex: 'var(--color-brown)', fallback: '#8b4513' },
        'copper': { hex: 'var(--color-copper)', fallback: '#b87333' },
        'cyan': { hex: 'var(--color-cyan)', fallback: '#00ffff' },
        'dark blue': { hex: 'var(--color-dark-blue)', fallback: '#00008b' },
        'dark grey': { hex: 'var(--color-dark-grey)', fallback: '#2d2d2d' },
        'dark purple': { hex: 'var(--color-dark-purple)', fallback: '#301934' },
        'dark red': { hex: 'var(--color-dark-red)', fallback: '#8b0000' },
        'dark silver': { hex: 'var(--color-dark-silver)', fallback: '#71706e' },
        'gold': { hex: 'var(--color-gold)', fallback: '#ffd700' },
        'green': { hex: 'var(--color-green)', fallback: '#10b981' },
        'grey': { hex: 'var(--color-grey)', fallback: '#6b7280' },
        'light blue': { hex: 'var(--color-light-blue)', fallback: '#add8e6' },
        'light brown': { hex: 'var(--color-light-brown)', fallback: '#d2b48c' },
        'light green': { hex: 'var(--color-light-green)', fallback: '#90ee90' },
        'neon orange': { hex: 'var(--color-neon-orange)', fallback: '#ff6600' },
        'neon pink': { hex: 'var(--color-neon-pink)', fallback: '#ff1493' },
        'orange': { hex: 'var(--color-orange)', fallback: '#ffa500' },
        'pink': { hex: 'var(--color-pink)', fallback: '#ffc0cb' },
        'purple': { hex: 'var(--color-purple)', fallback: '#800080' },
        'red': { hex: 'var(--color-red)', fallback: '#ff0000' },
        'silver': { hex: 'var(--color-silver)', fallback: '#c0c0c0' },
        'white': { hex: 'var(--color-white)', fallback: '#ffffff' },
        'yellow': { hex: 'var(--color-yellow)', fallback: '#ffff00' },
        'unknown': { hex: 'var(--color-unknown)', fallback: '#808080' }
    };
    
    let primaryColor = '';
    let secondaryColor = '';
    let otherDetails = [];
    
    details.forEach(detail => {
        const detailLower = detail.toLowerCase().trim();
        
        // Find color in available colors list (case-insensitive)
        const foundColor = availableColors.find(color => 
            detailLower.includes(color.toLowerCase())
        );
        
        if (foundColor) {
            const colorKey = foundColor.toLowerCase();
            const colorInfo = colorMap[colorKey];
            
            if (colorInfo && !primaryColor) {
                primaryColor = createColorIndicator(foundColor, colorInfo.fallback, colorInfo.hex);
            } else if (colorInfo && !secondaryColor) {
                secondaryColor = createColorIndicator(foundColor, colorInfo.fallback, colorInfo.hex);
            } else {
                otherDetails.push(`<div class="text-xs text-gray-500">${detail.trim()}</div>`);
            }
        } else {
            otherDetails.push(`<div class="text-xs text-gray-500">${detail.trim()}</div>`);
        }
    });
    
    return {
        primaryColor: primaryColor || '<div class="text-xs text-gray-400">No color</div>',
        secondaryColor: secondaryColor || '<div class="text-xs text-gray-400">-</div>',
        otherDetails: otherDetails.length > 0 ? otherDetails.join('') : '<div class="text-xs text-gray-400">-</div>'
    };
}

// Create color indicator with circle and text
function createColorIndicator(colorName, fallbackHex, cssVar = null) {
    const useColor = cssVar || fallbackHex;
    const borderColor = fallbackHex === '#ffffff' ? '#d1d5db' : fallbackHex;
    
    // Use CSS variable if available, fallback to hex
    const backgroundColor = cssVar ? `background-color: ${useColor}; background-color: ${fallbackHex};` : `background-color: ${fallbackHex};`;
    
    return `
        <div class="color-indicator">
            <div class="color-circle" style="${backgroundColor} border-color: ${borderColor};"></div>
            <span class="text-sm text-gray-900 capitalize">${colorName}</span>
        </div>
    `;
}

// Display printing plates in table
function displayPlates(plates) {
    hideLoading();
    hideError();
    
    if (plates.length === 0) {
        showNoPlates();
        return;
    }
    
    filtersDiv.classList.remove('hidden');
    platesTableContainer.classList.remove('hidden');
    noplatesDiv.classList.add('hidden');
    
    platesTableBody.innerHTML = plates.map(plate => createPlateRow(plate)).join('');
}

// Create individual plate row
function createPlateRow(plate) {
    const createdDate = new Date(plate.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const statusInfo = STATUSES.find(s => s.value === plate.status) || STATUSES[0];
    
    // Parse variant details to extract colors and other details
    const details = plate.variant_details ? plate.variant_details.split('|') : [];
    
    // Use specialized parsing for Deployment Zone products
    let parsedDetails;
    if (plate.product_name && plate.product_name.toLowerCase().includes('deployment zone')) {
        parsedDetails = parseDeploymentZoneColors(details, plate.plate_type);
    } else {
        parsedDetails = parseDetailsForColors(details);
    }
    
    // For wound markers (TK030), use the mapped product name from database instead of SKU mapping
    // This allows proper display of 12mm/16mm and Combo/XL variations
    let displayName;
    if (plate.sku === 'TK030' && plate.product_name) {
        displayName = plate.product_name; // Use the actual mapped product name
    } else {
        displayName = SKU_TO_SHORTFORM[plate.sku] || plate.product_name || 'Unknown Product';
    }
    
    return `
        <tr class="table-row compact-row">
            <td class="product-column">
                <div class="text-sm font-semibold text-gray-900">${displayName}</div>
                <div class="text-sm font-medium text-blue-600">${plate.plate_type}</div>
                ${plate.sku ? `<div class="text-xs text-gray-500">SKU: ${plate.sku}</div>` : ''}
            </td>
            <td class="color-column">
                ${parsedDetails.primaryColor}
            </td>
            <td class="color-column">
                ${parsedDetails.secondaryColor}
            </td>
            <td class="details-column">
                ${parsedDetails.otherDetails}
            </td>
            <td class="status-column">
                <div class="status-cell">
                    <span class="status-badge ${statusInfo.class}" 
                          onclick="toggleStatusDropdown(${plate.plate_id}, this)"
                          data-plate-id="${plate.plate_id}">
                        ${plate.status}
                    </span>
                </div>
            </td>
            <td class="created-column text-xs text-gray-500">
                ${createdDate}
            </td>
        </tr>
    `;
}

// Toggle status dropdown
function toggleStatusDropdown(plateId, element) {
    // Close any existing dropdowns
    closeAllDropdowns();
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    dropdown.innerHTML = STATUSES.map(status => `
        <div class="dropdown-item ${status.class}" 
             onclick="updatePlateStatus(${plateId}, '${status.value}', this)">
            ${status.label}
        </div>
    `).join('');
    
    // Position and show dropdown
    const statusCell = element.parentElement;
    statusCell.appendChild(dropdown);
    
    // Show overlay
    dropdownOverlay.classList.remove('hidden');
    dropdownOverlay.onclick = closeAllDropdowns;
}

// Close all dropdowns
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => dropdown.remove());
    dropdownOverlay.classList.add('hidden');
}

// Update plate status
async function updatePlateStatus(plateId, newStatus, dropdownItem) {
    try {
        // Show loading state
        dropdownItem.innerHTML = '<div class="text-xs">Updating...</div>';
        
        const response = await fetch(`${API_BASE}/printing/plates/${plateId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to update status');
        }
        
        // Close dropdown
        closeAllDropdowns();
        
        // Reload data to reflect changes
        await loadPrintingData();
        
        // Show success message (optional)
        console.log(`✅ Updated plate ${plateId} to ${newStatus}`);
        
    } catch (error) {
        console.error('Error updating plate status:', error);
        
        // Restore dropdown item
        dropdownItem.innerHTML = newStatus;
        
        // Show error (you could add a toast notification here)
        alert(`Failed to update status: ${error.message}`);
    }
}

// Show loading state
function showLoading() {
    loadingDiv.classList.remove('hidden');
    platesTableContainer.classList.add('hidden');
    filtersDiv.classList.add('hidden');
    noplatesDiv.classList.add('hidden');
    hideError();
}

// Hide loading state
function hideLoading() {
    loadingDiv.classList.add('hidden');
}

// Show error state
function showError(message) {
    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
    hideLoading();
    platesTableContainer.classList.add('hidden');
    filtersDiv.classList.add('hidden');
    noplatesDiv.classList.add('hidden');
}

// Hide error state
function hideError() {
    errorDiv.classList.add('hidden');
}

// Show no plates state
function showNoPlates() {
    noplatesDiv.classList.remove('hidden');
    platesTableContainer.classList.add('hidden');
    filtersDiv.classList.add('hidden');
}

// Keyboard event for closing dropdowns
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllDropdowns();
    }
});

// Auto-refresh every 30 seconds (optional)
setInterval(() => {
    if (!document.hidden) {
        loadPrintingData();
    }
}, 30000);