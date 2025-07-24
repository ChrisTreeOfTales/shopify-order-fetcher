// JavaScript for the Order Management Dashboard

// DOM elements
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const ordersGrid = document.getElementById('orders-grid');
const noOrdersDiv = document.getElementById('no-orders');
const orderModal = document.getElementById('order-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');

// API base URL
const API_BASE = '/api';

// Load orders when page loads
document.addEventListener('DOMContentLoaded', loadOrders);

// Close modal event listeners
closeModalBtn.addEventListener('click', closeModal);
orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) closeModal();
});

// Fetch and display orders
async function loadOrders() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/orders`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        
        if (!apiResponse.success) {
            throw new Error(apiResponse.error || 'Failed to load orders');
        }
        
        displayOrders(apiResponse.data || []);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders. Please check if the server is running.');
    }
}

// Display orders in the grid
function displayOrders(orders) {
    hideLoading();
    hideError();
    
    if (orders.length === 0) {
        showNoOrders();
        return;
    }
    
    ordersGrid.innerHTML = '';
    ordersGrid.classList.remove('hidden');
    
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersGrid.appendChild(orderCard);
    });
}

// Create individual order card
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card bg-white rounded-lg shadow-md p-6 cursor-pointer border border-gray-200 hover:border-blue-300';
    
    // Format date
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Status color
    const statusClass = getStatusClass(order.order_status);
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold text-gray-800">Order #${order.shopify_order_id}</h3>
                <p class="text-sm text-gray-600">${orderDate}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium text-white ${statusClass}">
                ${order.order_status || 'unknown'}
            </span>
        </div>
        
        <div class="mb-4">
            <h4 class="font-medium text-gray-700 mb-1">👤 ${order.customer_name || 'Guest'}</h4>
            ${order.customer_email ? `<p class="text-sm text-gray-500">${order.customer_email}</p>` : ''}
        </div>
        
        <div class="border-t pt-4">
            <div class="flex justify-between items-center">
                <div>
                    <span class="text-2xl font-bold text-gray-800">${order.total_price} SEK</span>
                    <p class="text-sm text-gray-500">${order.total_items} items (${order.total_quantity} qty)</p>
                </div>
                <div class="text-right">
                    <button class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        View Details →
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add click event to show order details
    card.addEventListener('click', () => showOrderDetails(order.order_id, order));
    
    return card;
}

// Get CSS class for order status
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'paid':
            return 'status-paid';
        case 'pending':
            return 'status-pending';
        case 'refunded':
            return 'status-refunded';
        default:
            return 'bg-gray-500';
    }
}

// Show order details in modal
async function showOrderDetails(orderId, order) {
    try {
        modalTitle.textContent = `Order #${order.shopify_order_id} Details`;
        modalContent.innerHTML = '<div class="flex justify-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>';
        orderModal.classList.remove('hidden');
        
        const response = await fetch(`${API_BASE}/orders/${orderId}/items`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        
        if (!apiResponse.success) {
            throw new Error(apiResponse.error || 'Failed to load order items');
        }
        
        displayOrderItems(apiResponse.data || [], order);
        
    } catch (error) {
        console.error('Error loading order details:', error);
        modalContent.innerHTML = '<div class="text-red-600 text-center py-4">Failed to load order details</div>';
    }
}

// Display order items in modal
function displayOrderItems(orderItems, order) {
    let itemsHTML = `
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">Order Summary</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Customer:</strong> ${order.customer_name || 'Guest'}</div>
                <div><strong>Total:</strong> ${order.total_price} SEK</div>
                <div><strong>Status:</strong> ${order.order_status}</div>
                <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
            </div>
        </div>
        
        <div class="space-y-4">
    `;
    
    orderItems.forEach((item, index) => {
        // Parse variant details
        const details = item.variant_details ? item.variant_details.split('|') : [];
        
        itemsHTML += `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="font-medium text-gray-800 flex-1 pr-4">${item.product_name || 'Product name not available'}</h5>
                    <span class="font-semibold text-gray-600">Qty: ${item.quantity}</span>
                </div>
                
                ${details.length > 0 ? `
                    <div class="mb-3">
                        <h6 class="text-sm font-medium text-gray-600 mb-1">Details:</h6>
                        <div class="text-sm text-gray-500 space-y-1">
                            ${details.map(detail => `<div>• ${detail.trim()}</div>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div class="printing-plates">
                        <span class="text-sm font-medium text-gray-600">Printing Plates: </span>
                        ${item.plates_in_queue > 0 ? `<span class="printing-plate-status plate-in-queue">${item.plates_in_queue} In Queue</span>` : ''}
                        ${item.plates_in_progress > 0 ? `<span class="printing-plate-status plate-in-progress">${item.plates_in_progress} In Progress</span>` : ''}
                        ${item.plates_printed > 0 ? `<span class="printing-plate-status plate-printed">${item.plates_printed} Printed</span>` : ''}
                        ${item.plates_done > 0 ? `<span class="printing-plate-status plate-done">${item.plates_done} Done</span>` : ''}
                        ${item.plates_blocked > 0 ? `<span class="printing-plate-status plate-blocked">${item.plates_blocked} Blocked</span>` : ''}
                    </div>
                    <div class="text-sm text-gray-600">
                        ${item.price} SEK each
                    </div>
                </div>
            </div>
        `;
    });
    
    itemsHTML += '</div>';
    modalContent.innerHTML = itemsHTML;
}

// Close modal
function closeModal() {
    orderModal.classList.add('hidden');
}

// Show loading state
function showLoading() {
    loadingDiv.classList.remove('hidden');
    ordersGrid.classList.add('hidden');
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
    ordersGrid.classList.add('hidden');
    noOrdersDiv.classList.add('hidden');
}

// Hide error state
function hideError() {
    errorDiv.classList.add('hidden');
}

// Show no orders state
function showNoOrders() {
    noOrdersDiv.classList.remove('hidden');
    ordersGrid.classList.add('hidden');
}

// Keyboard event for closing modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !orderModal.classList.contains('hidden')) {
        closeModal();
    }
});