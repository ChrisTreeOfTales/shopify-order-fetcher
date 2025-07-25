// JavaScript for the Assembly Dashboard

// DOM elements
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const completedOrdersContainer = document.getElementById('completed-orders-container');
const completedOrdersGrid = document.getElementById('completed-orders-grid');
const noOrdersDiv = document.getElementById('no-orders');

// API base URL
const API_BASE = '/api';

// Global data
let completedOrders = [];

// SKU to shortform product name mapping (for display consistency)
const SKU_TO_SHORTFORM = {
    'BB0001': 'Battlebox',
    'ACC044': '3" Measurement stick',
    'ACC110': 'Deep Strike Combo set',
    'TK030': 'Wound marker', // Generic for wound markers
    'TOK0001': 'Objective Marker set',
    'DEPLOYMENT001': 'Double Deployment Zone set',
    'ACC139': '16mm Wound marker XL set',
    'M01': 'Battlebox',
    'M002': 'Battlebox'
};

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCompletedOrders();
});

// Load completed orders
async function loadCompletedOrders() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/printing/completed-orders`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch completed orders');
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load completed orders');
        }
        
        completedOrders = result.data || [];
        displayCompletedOrders();
        
    } catch (error) {
        console.error('Error loading completed orders:', error);
        showError(error.message);
    }
}

// Show loading state
function showLoading() {
    hideAll();
    loadingDiv.classList.remove('hidden');
}

// Show error state
function showError(message) {
    hideAll();
    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Hide all states
function hideAll() {
    loadingDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    completedOrdersContainer.classList.add('hidden');
    noOrdersDiv.classList.add('hidden');
}

// Display completed orders
function displayCompletedOrders() {
    hideAll();
    
    if (completedOrders.length === 0) {
        noOrdersDiv.classList.remove('hidden');
        return;
    }
    
    completedOrdersContainer.classList.remove('hidden');
    completedOrdersGrid.innerHTML = completedOrders.map(order => createOrderCard(order)).join('');
}

// Parse all color combinations for any multi-part product
function parseAllColorCombinations(details, sku = null) {
    const detailString = details.join('|');
    const colorRows = [];
    
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
        return '<div class="text-xs text-gray-400">No color</div>';
    }
    
    // Special handling for Battlebox products (4 components)
    if (sku && (sku === 'BB0001' || sku === 'M01' || sku === 'M002')) {
        const baseColorMatch = detailString.match(/Base color:\s*([^|]+)/i);
        const trimColorMatch = detailString.match(/Trim color:\s*([^|]+)/i);
        
        if (baseColorMatch || trimColorMatch) {
            const baseColorIndicator = baseColorMatch ? findColorAndCreateIndicator(baseColorMatch[1]) : '<div class="text-xs text-gray-400">-</div>';
            const trimColorIndicator = trimColorMatch ? findColorAndCreateIndicator(trimColorMatch[1]) : '<div class="text-xs text-gray-400">-</div>';
            
            // Create 4 rows representing the 4 Battlebox plates
            colorRows.push(
                {
                    label: 'Base',
                    primaryColor: baseColorIndicator,
                    secondaryColor: '<div class="text-xs text-gray-400">-</div>'
                },
                {
                    label: 'Lid',
                    primaryColor: baseColorIndicator,
                    secondaryColor: trimColorIndicator
                },
                {
                    label: 'Rack',
                    primaryColor: baseColorIndicator,
                    secondaryColor: '<div class="text-xs text-gray-400">-</div>'
                },
                {
                    label: 'Storage',
                    primaryColor: baseColorIndicator,
                    secondaryColor: trimColorIndicator
                }
            );
            
            return colorRows;
        }
    }
    
    // Check for Deployment Zone patterns first
    const deploymentZonePatterns = [
        { regex: /Box base color:\s*([^|]+)/i, label: 'Box', type: 'primary' },
        { regex: /Lid text color:\s*([^|]+)/i, label: 'Box', type: 'secondary' },
        { regex: /Base color — First set:\s*([^|]+)/i, label: 'Set 1', type: 'primary' },
        { regex: /Text color — First set:\s*([^|]+)/i, label: 'Set 1', type: 'secondary' },
        { regex: /Base color — Second set:\s*([^|]+)/i, label: 'Set 2', type: 'primary' },
        { regex: /Text color — Second set:\s*([^|]+)/i, label: 'Set 2', type: 'secondary' }
    ];
    
    // Check if this is a Deployment Zone product
    const hasDeploymentZonePatterns = deploymentZonePatterns.some(pattern => 
        detailString.match(pattern.regex)
    );
    
    if (hasDeploymentZonePatterns) {
        // Use only Deployment Zone patterns
        const colorGroups = {};
        
        deploymentZonePatterns.forEach(pattern => {
            const match = detailString.match(pattern.regex);
            if (match) {
                if (!colorGroups[pattern.label]) {
                    colorGroups[pattern.label] = {};
                }
                colorGroups[pattern.label][pattern.type] = findColorAndCreateIndicator(match[1]);
            }
        });
        
        // Convert groups to rows
        Object.keys(colorGroups).forEach(label => {
            const group = colorGroups[label];
            colorRows.push({
                label: label,
                primaryColor: group.primary || '<div class="text-xs text-gray-400">-</div>',
                secondaryColor: group.secondary || '<div class="text-xs text-gray-400">-</div>'
            });
        });
        
        return colorRows;
    }
    
    // Universal parsing patterns for other products
    const colorPatterns = [
        // Standard patterns (Base color, Trim color, etc.)
        { regex: /Base color:\s*([^|]+)/i, label: 'Main', type: 'primary' },
        { regex: /Trim color:\s*([^|]+)/i, label: 'Main', type: 'secondary' },
        
        // Additional patterns for other products
        { regex: /Primary color:\s*([^|]+)/i, label: 'Main', type: 'primary' },
        { regex: /Secondary color:\s*([^|]+)/i, label: 'Main', type: 'secondary' },
        { regex: /Text color:\s*([^|]+)/i, label: 'Main', type: 'secondary' }
    ];
    
    // Group colors by label
    const colorGroups = {};
    
    colorPatterns.forEach(pattern => {
        const match = detailString.match(pattern.regex);
        if (match) {
            if (!colorGroups[pattern.label]) {
                colorGroups[pattern.label] = {};
            }
            colorGroups[pattern.label][pattern.type] = findColorAndCreateIndicator(match[1]);
        }
    });
    
    // Convert groups to rows
    Object.keys(colorGroups).forEach(label => {
        const group = colorGroups[label];
        colorRows.push({
            label: label,
            primaryColor: group.primary || '<div class="text-xs text-gray-400">-</div>',
            secondaryColor: group.secondary || '<div class="text-xs text-gray-400">-</div>'
        });
    });
    
    return colorRows;
}

// Create color indicator HTML
function createColorIndicator(colorName, fallbackHex, cssVar) {
    return `
        <div class="color-indicator">
            <div class="color-circle" style="background-color: ${cssVar || fallbackHex}"></div>
            <span class="color-name">${colorName}</span>
        </div>
    `;
}

// Create order card
function createOrderCard(order) {
    // Use shortform name if available, otherwise use display name or product name
    let displayName;
    if (SKU_TO_SHORTFORM[order.sku]) {
        displayName = SKU_TO_SHORTFORM[order.sku];
    } else {
        displayName = order.display_product_name || order.product_name || 'Unknown Product';
    }
    
    // Parse variant details to extract colors and other details
    const details = order.variant_details ? order.variant_details.split('|') : [];
    
    // Extract lid design for Battlebox products
    let lidDesignLabel = '';
    if (order.sku === 'BB0001' || order.sku === 'M01' || order.sku === 'M002') {
        const detailString = details.join('|');
        const lidDesignMatch = detailString.match(/Lid design:\s*([^|]+)/i);
        if (lidDesignMatch) {
            lidDesignLabel = `
                <div class="text-xs text-gray-500 mt-1 mb-2 px-2 py-1 bg-gray-100 rounded-md inline-block">
                    Lid: ${lidDesignMatch[1].trim()}
                </div>
            `;
        }
    }
    
    // Use universal parser for all products, passing SKU for specialized handling
    let colorContent = '';
    const colorRows = parseAllColorCombinations(details, order.sku);
    
    if (colorRows.length > 0) {
        // Multi-row layout for products with multiple color combinations
        colorContent = colorRows.map(row => `
            <div class="mb-1 pb-1 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                <div class="flex items-center gap-3">
                    <div class="text-xs font-medium text-gray-600 w-12 flex-shrink-0">${row.label}</div>
                    <div class="flex gap-3 flex-1">
                        ${row.primaryColor}
                        ${row.secondaryColor}
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        // Fallback to simple display if no patterns match
        colorContent = `
            <div class="flex items-center gap-3">
                <div class="text-xs font-medium text-gray-600 w-12 flex-shrink-0">Main</div>
                <div class="flex gap-3 flex-1">
                    <div class="text-xs text-gray-400">No color info</div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="order-card bg-white rounded-lg shadow-md p-4">
            <!-- Header -->
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">${displayName}</h3>
                    ${lidDesignLabel}
                </div>
                <div class="text-right">
                    <span class="completion-badge">Ready</span>
                </div>
            </div>
            
            <!-- Color Details -->
            <div class="mb-3">
                ${colorContent}
            </div>
            
            <!-- Action Buttons -->
            <div class="mt-3 space-y-2">
                <button 
                    onclick="markAsDone(${order.order_item_id}, this)" 
                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <span class="mr-2">📦</span>
                    Assembled
                </button>
                <button 
                    onclick="markAsReprint(${order.order_item_id}, this)" 
                    class="w-full bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <span class="mr-2">🔄</span>
                    Mark as reprint
                </button>
            </div>
        </div>
    `;
}

// Mark order item as reprint (placeholder function)
async function markAsReprint(orderItemId, buttonElement) {
    // Placeholder function - no logic implemented yet
    console.log(`Reprint requested for order item ${orderItemId}`);
    alert('Reprint functionality will be implemented soon');
}

// Mark order item as done
async function markAsDone(orderItemId, buttonElement) {
    try {
        // Show loading state on button
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '<span class="animate-spin mr-2">⟳</span>Marking as Done...';
        buttonElement.disabled = true;

        const response = await fetch(`${API_BASE}/printing/mark-done/${orderItemId}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to mark as done');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to mark as done');
        }

        // Remove the card from the display
        const card = buttonElement.closest('.order-card');
        if (card) {
            card.style.opacity = '0.5';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.remove();
                
                // Check if there are no more orders
                if (completedOrdersGrid.children.length === 0) {
                    hideAll();
                    noOrdersDiv.classList.remove('hidden');
                }
            }, 300);
        }

    } catch (error) {
        console.error('Error marking as done:', error);
        
        // Restore button state
        buttonElement.innerHTML = originalContent;
        buttonElement.disabled = false;
        
        alert('Failed to mark as done: ' + error.message);
    }
}