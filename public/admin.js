// Database Admin JavaScript

// DOM elements
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const tableSelectorDiv = document.getElementById('table-selector');
const tableContentDiv = document.getElementById('table-content');
const tableTitle = document.getElementById('table-title');
const dataTable = document.getElementById('data-table');
const tableHeader = document.getElementById('table-header');
const tableBody = document.getElementById('table-body');
const editModal = document.getElementById('edit-modal');
const modalTitle = document.getElementById('modal-title');
const editForm = document.getElementById('edit-form');
const formFields = document.getElementById('form-fields');
const deleteBtn = document.getElementById('delete-btn');

// API base URL
const API_BASE = '/api';

// Global state
let currentTable = '';
let currentData = [];
let editingRecord = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    showTables();
});

// Show tables selection
function showTables() {
    hideLoading();
    hideError();
    tableSelectorDiv.classList.remove('hidden');
    tableContentDiv.classList.add('hidden');
    currentTable = '';
}

// Load table data
async function loadTable(tableName) {
    try {
        showLoading();
        currentTable = tableName;
        
        const response = await fetch(`${API_BASE}/admin/tables/${tableName}`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load table data');
        }
        
        currentData = result.data || [];
        displayTable(tableName, currentData);
        
    } catch (error) {
        console.error('Error loading table:', error);
        showError(`Failed to load ${tableName} table: ${error.message}`);
    }
}

// Display table data
function displayTable(tableName, data) {
    hideLoading();
    hideError();
    tableSelectorDiv.classList.add('hidden');
    tableContentDiv.classList.remove('hidden');
    
    tableTitle.textContent = `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} Table`;
    
    if (data.length === 0) {
        tableHeader.innerHTML = '<tr><th class="px-4 py-2">No data available</th></tr>';
        tableBody.innerHTML = '';
        return;
    }
    
    // Get column names from first record
    const columns = Object.keys(data[0]);
    
    // Create header
    tableHeader.innerHTML = `
        <tr>
            ${columns.map(col => `<th class="px-4 py-2 text-left font-medium text-gray-900">${col}</th>`).join('')}
            <th class="px-4 py-2 text-left font-medium text-gray-900">Actions</th>
        </tr>
    `;
    
    // Create rows
    tableBody.innerHTML = data.map((record, index) => `
        <tr class="border-t hover:bg-gray-50">
            ${columns.map(col => {
                let value = record[col];
                if (value === null || value === undefined) {
                    value = '<span class="text-gray-400">null</span>';
                } else if (typeof value === 'string' && value.length > 50) {
                    value = value.substring(0, 50) + '...';
                }
                return `<td class="px-4 py-2 text-sm">${value}</td>`;
            }).join('')}
            <td class="px-4 py-2">
                <button onclick="editRecord(${index})" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    Edit
                </button>
            </td>
        </tr>
    `).join('');
}

// Edit record
function editRecord(index) {
    const record = currentData[index];
    editingRecord = { ...record, _index: index };
    
    modalTitle.textContent = `Edit ${currentTable.slice(0, -1)}`;
    deleteBtn.classList.remove('hidden');
    
    // Create form fields
    const fields = Object.keys(record).map(key => {
        const value = record[key] || '';
        const isId = key.includes('id') || key.includes('_id');
        const disabled = isId ? 'disabled' : '';
        
        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${key}</label>
                <input 
                    type="text" 
                    name="${key}" 
                    value="${value}" 
                    ${disabled}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'bg-gray-100' : ''}"
                >
            </div>
        `;
    }).join('');
    
    formFields.innerHTML = fields;
    editModal.classList.remove('hidden');
}

// Add new record
function addRecord() {
    if (currentData.length === 0) {
        showError('Cannot add record - no data structure available');
        return;
    }
    
    // Use first record as template
    const template = currentData[0];
    const newRecord = {};
    
    Object.keys(template).forEach(key => {
        if (key.includes('id') || key.includes('_id')) {
            newRecord[key] = ''; // Will be auto-generated
        } else if (key.includes('created_at') || key.includes('updated_at')) {
            newRecord[key] = new Date().toISOString();
        } else {
            newRecord[key] = '';
        }
    });
    
    editingRecord = newRecord;
    modalTitle.textContent = `Add ${currentTable.slice(0, -1)}`;
    deleteBtn.classList.add('hidden');
    
    // Create form fields
    const fields = Object.keys(newRecord).map(key => {
        const value = newRecord[key] || '';
        const isId = key.includes('id') || key.includes('_id');
        const disabled = isId ? 'disabled' : '';
        
        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${key}</label>
                <input 
                    type="text" 
                    name="${key}" 
                    value="${value}" 
                    ${disabled}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'bg-gray-100' : ''}"
                >
            </div>
        `;
    }).join('');
    
    formFields.innerHTML = fields;
    editModal.classList.remove('hidden');
}

// Save record
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const formData = new FormData(editForm);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            // Skip empty ID fields for new records
            if ((key.includes('id') || key.includes('_id')) && !value) {
                continue;
            }
            data[key] = value;
        }
        
        const isNew = !editingRecord._index && editingRecord._index !== 0;
        const url = isNew 
            ? `${API_BASE}/admin/tables/${currentTable}` 
            : `${API_BASE}/admin/tables/${currentTable}/${getRecordId(editingRecord)}`;
        
        const method = isNew ? 'POST' : 'PUT';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to save record');
        }
        
        closeModal();
        await loadTable(currentTable); // Reload table
        
    } catch (error) {
        console.error('Error saving record:', error);
        showError(`Failed to save record: ${error.message}`);
    }
});

// Delete record
async function deleteRecord() {
    if (!confirm('Are you sure you want to delete this record?')) {
        return;
    }
    
    try {
        const recordId = getRecordId(editingRecord);
        const response = await fetch(`${API_BASE}/admin/tables/${currentTable}/${recordId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to delete record');
        }
        
        closeModal();
        await loadTable(currentTable); // Reload table
        
    } catch (error) {
        console.error('Error deleting record:', error);
        showError(`Failed to delete record: ${error.message}`);
    }
}

// Get record ID for API calls
function getRecordId(record) {
    // Try common ID field names
    const idFields = ['id', 'customer_id', 'order_id', 'plate_id', 'product_id', 'item_id'];
    for (let field of idFields) {
        if (record[field]) {
            return record[field];
        }
    }
    return null;
}

// Close modal
function closeModal() {
    editModal.classList.add('hidden');
    editingRecord = null;
}

// Show loading
function showLoading() {
    loadingDiv.classList.remove('hidden');
    tableSelectorDiv.classList.add('hidden');
    tableContentDiv.classList.add('hidden');
    hideError();
}

// Hide loading
function hideLoading() {
    loadingDiv.classList.add('hidden');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
    hideLoading();
}

// Hide error
function hideError() {
    errorDiv.classList.add('hidden');
}

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
        closeModal();
    }
});