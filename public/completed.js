// JavaScript for the Completed Orders Dashboard

// DOM elements
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const summaryStats = document.getElementById('summary-stats');
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
        displaySummaryStats(completedOrders);
        displayCompletedOrders(completedOrders);
        
    } catch (error) {
        console.error('Error loading completed orders:', error);
        showError('Failed to load completed orders. Please check if the server is running.');
    }
}

// Display summary statistics
function displaySummaryStats(orders) {
    const totalOrders = orders.length;
    const totalPlates = orders.reduce((sum, order) => sum + (order.total_plates || 0), 0);
    const uniqueCustomers = new Set(orders.map(order => order.customer_email)).size;
    const recentlyCompleted = orders.filter(order => {
        const completedDate = new Date(order.created_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return completedDate > dayAgo;
    }).length;
    
    const stats = [
        { label: 'Completed Items', value: totalOrders, icon: '✅', class: 'bg-green-500' },
        { label: 'Total Plates', value: totalPlates, icon: '🖨️', class: 'bg-blue-500' },
        { label: 'Customers', value: uniqueCustomers, icon: '👥', class: 'bg-purple-500' },
        { label: 'Last 24h', value: recentlyCompleted, icon: '⏰', class: 'bg-orange-500' }
    ];
    
    summaryStats.innerHTML = stats.map(stat => `
        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex items-center">
                <div class="w-4 h-4 rounded-full ${stat.class} mr-3 flex items-center justify-center text-white text-xs">
                    ${stat.icon}
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-600">${stat.label}</p>
                    <p class="text-2xl font-bold text-gray-900">${stat.value}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Display completed orders as cards
function displayCompletedOrders(orders) {
    hideLoading();
    hideError();
    
    if (orders.length === 0) {
        showNoOrders();
        return;
    }
    
    completedOrdersContainer.classList.remove('hidden');
    noOrdersDiv.classList.add('hidden');
    
    completedOrdersGrid.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

// Create individual order card
function createOrderCard(order) {
    const completedDate = new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Get display name for the product
    let displayName;
    if (order.sku === 'TK030' && order.display_product_name) {
        displayName = order.display_product_name; // Use specific wound marker type
    } else {
        displayName = SKU_TO_SHORTFORM[order.sku] || order.display_product_name || order.product_name || 'Unknown Product';
    }
    
    // Parse variant details for display
    const variantDetails = order.variant_details ? order.variant_details.split('|') : [];
    const mainDetails = variantDetails.slice(0, 2).join(' • '); // Show first 2 details
    
    return `
        <div class="order-card bg-white rounded-lg shadow-md p-6">
            <!-- Header -->
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">${displayName}</h3>
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="completion-badge">Completed</span>
                        <span class="plate-count">${order.total_plates} plate${order.total_plates !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-500">Order #${order.shopify_order_id}</div>
                    <div class="text-xs text-gray-400">Qty: ${order.quantity}</div>
                </div>
            </div>
            
            <!-- Customer Info -->
            <div class="mb-4 p-3 bg-gray-50 rounded-md">
                <div class="customer-info">
                    <div class="font-medium text-gray-700">${order.customer_name || 'Guest Customer'}</div>
                    <div class="text-sm">${order.customer_email || 'No email'}</div>
                </div>
            </div>
            
            <!-- Product Details -->
            ${mainDetails ? `
                <div class="mb-4">
                    <div class="text-sm text-gray-600 mb-2">Details:</div>
                    <div class="text-sm text-gray-800">${mainDetails}</div>
                </div>
            ` : ''}
            
            <!-- SKU Badge -->
            ${order.sku ? `
                <div class="flex items-center justify-between mb-4">
                    <span class="product-badge">SKU: ${order.sku}</span>
                    <span class="text-xs text-gray-500">Completed: ${completedDate}</span>
                </div>
            ` : `
                <div class="text-right mb-4">
                    <span class="text-xs text-gray-500">Completed: ${completedDate}</span>
                </div>
            `}
            
            <!-- Action Button -->
            <div class="mt-4">
                <button 
                    onclick="markAsDone(${order.order_item_id}, this)" 
                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <span class="mr-2">✓</span>
                    Mark as Done
                </button>
            </div>
        </div>
    `;
}

// Mark order item as done
async function markAsDone(orderItemId, buttonElement) {
    try {
        // Show loading state on button
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '<span class="animate-spin mr-2">⟳</span>Marking as Done...';
        buttonElement.disabled = true;
        buttonElement.classList.add('opacity-75', 'cursor-not-allowed');
        
        const response = await fetch(`${API_BASE}/printing/order-items/${orderItemId}/mark-done`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to mark as done');
        }
        
        // Show success state briefly
        buttonElement.innerHTML = '<span class="mr-2">✅</span>Done!';
        buttonElement.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
        buttonElement.classList.add('bg-green-600');
        
        // Remove the card from view after a short delay
        setTimeout(() => {
            const card = buttonElement.closest('.order-card');
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.transform = 'scale(0.95)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    card.remove();
                    
                    // Refresh the data to update stats and check if any orders remain
                    loadCompletedOrders();
                }, 300);
            }
        }, 1000);
        
        console.log(`✅ Marked order item ${orderItemId} as done (${result.data.updatedPlates} plates updated)`);
        
    } catch (error) {
        console.error('Error marking order as done:', error);
        
        // Restore button to original state
        buttonElement.innerHTML = originalContent;
        buttonElement.disabled = false;
        buttonElement.classList.remove('opacity-75', 'cursor-not-allowed');
        
        // Show error message
        alert(`Failed to mark as done: ${error.message}`);
    }
}

// Show loading state
function showLoading() {
    loadingDiv.classList.remove('hidden');
    completedOrdersContainer.classList.add('hidden');
    noOrdersDiv.classList.add('hidden');
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
    completedOrdersContainer.classList.add('hidden');
    noOrdersDiv.classList.add('hidden');
}

// Hide error state
function hideError() {
    errorDiv.classList.add('hidden');
}

// Show no orders state
function showNoOrders() {
    noOrdersDiv.classList.remove('hidden');
    completedOrdersContainer.classList.add('hidden');
}

// Auto-refresh every 2 minutes
setInterval(() => {
    if (!document.hidden) {
        loadCompletedOrders();
    }
}, 120000);