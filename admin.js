document.addEventListener('DOMContentLoaded', function() {
    let refreshInterval;
    let autoRefreshEnabled = true;
    const refreshTime = 10000; // 10 seconds
    
    // Initialize auto-refresh
    startAutoRefresh();
    
    // Toggle auto-refresh
    document.getElementById('toggle-refresh').addEventListener('click', function() {
        if (autoRefreshEnabled) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
        }
    });
    
    // Manual refresh
    document.getElementById('manual-refresh').addEventListener('click', function() {
        fetchRequests();
    });
    
    // Status filter
    document.getElementById('status-filter').addEventListener('change', function() {
        fetchRequests();
    });
    
    // Search functionality
    document.getElementById('search-requests').addEventListener('input', function() {
        fetchRequests();
    });
    
    // Status update button
    document.getElementById('update-status').addEventListener('click', function() {
        const requestId = this.getAttribute('data-id');
        const newStatus = document.getElementById('status-update').value;
        updateRequestStatus(requestId, newStatus);
    });
    
    // Function to start auto-refresh
    function startAutoRefresh() {
        autoRefreshEnabled = true;
        document.getElementById('refresh-status').textContent = 'Auto-refresh: Active';
        document.getElementById('toggle-refresh').textContent = 'Pause Auto-refresh';
        refreshInterval = setInterval(fetchRequests, refreshTime);
    }
    
    // Function to stop auto-refresh
    function stopAutoRefresh() {
        autoRefreshEnabled = false;
        document.getElementById('refresh-status').textContent = 'Auto-refresh: Paused';
        document.getElementById('toggle-refresh').textContent = 'Enable Auto-refresh';
        clearInterval(refreshInterval);
    }
    
    // Function to fetch requests
    function fetchRequests() {
        // Get filter values
        const statusFilter = document.getElementById('status-filter').value;
        const searchTerm = document.getElementById('search-requests').value.toLowerCase();
        
        fetch('http://127.0.0.1:5000/get-requests')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched requests:', data);
                
                // Filter requests based on status and search term
                let filteredRequests = data;
                
                if (statusFilter !== 'all') {
                    filteredRequests = filteredRequests.filter(request => request.status === statusFilter);
                }
                
                if (searchTerm) {
                    filteredRequests = filteredRequests.filter(request => {
                        // Search in multiple fields
                        return request.name.toLowerCase().includes(searchTerm) ||
                               request.location.toLowerCase().includes(searchTerm) ||
                               request.description.toLowerCase().includes(searchTerm) ||
                               request.vehicle.toLowerCase().includes(searchTerm);
                    });
                }
                
                displayRequests(filteredRequests);
            })
            .catch(error => {
                console.error('Error fetching requests:', error);
                document.getElementById('requests-list').innerHTML = `
                    <div class="loading">Error loading requests. Please try again.</div>
                `;
            });
    }
    
    // Function to display requests in the list
    function displayRequests(requests) {
        const requestsList = document.getElementById('requests-list');
        
        if (requests.length === 0) {
            requestsList.innerHTML = `
                <div class="loading">No requests found.</div>
            `;
            return;
        }
        
        // Sort requests by timestamp (newest first)
        requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        let html = '';
        requests.forEach(request => {
            // Format timestamp
            const date = new Date(request.timestamp);
            const formattedTime = date.toLocaleString();
            
            // Get service name
            let serviceName = getServiceName(request.service);
            if (request.service === 'other' && request.otherService) {
                serviceName += `: ${request.otherService}`;
            }
            
            html += `
                <div class="request-item" data-id="${request.id}">
                    <div class="request-header">
                        <span class="request-name">${request.name}</span>
                        <span class="request-time">${formattedTime}</span>
                    </div>
                    <div class="request-meta">
                        <span class="request-service">${serviceName}</span>
                        <span class="request-status status-${request.status}">${request.status.toUpperCase()}</span>
                    </div>
                </div>
            `;
        });
        
        requestsList.innerHTML = html;
        
        // Add click event for request items
        document.querySelectorAll('.request-item').forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all items
                document.querySelectorAll('.request-item').forEach(el => {
                    el.classList.remove('active');
                });
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Get request ID and show details
                const requestId = this.getAttribute('data-id');
                const request = requests.find(req => req.id === requestId);
                if (request) {
                    showRequestDetails(request);
                }
            });
        });
    }
    
    // Function to show request details
    function showRequestDetails(request) {
        // Hide default panel, show content panel
        document.querySelector('.panel-default').classList.add('hidden');
        document.getElementById('detail-content').classList.remove('hidden');
        
        // Set request ID in the header and status button
        document.getElementById('detail-id').textContent = `Request ID: ${request.id}`;
        document.getElementById('update-status').setAttribute('data-id', request.id);
        
        // Set current status in dropdown
        document.getElementById('status-update').value = request.status;
        
        // Format service name
        let serviceName = getServiceName(request.service);
        if (request.service === 'other' && request.otherService) {
            serviceName += `: ${request.otherService}`;
        }
        
        // Format timestamp
        const date = new Date(request.timestamp);
        const formattedTime = date.toLocaleString();
        
        // Generate detail fields HTML
        const detailFields = document.getElementById('detail-fields');
        detailFields.innerHTML = `
            <div class="detail-field">
                <div class="detail-label">Name</div>
                <div class="detail-value">${request.name}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">Phone</div>
                <div class="detail-value">${request.phone}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">Location</div>
                <div class="detail-value">${request.location}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">Vehicle Details</div>
                <div class="detail-value">${request.vehicle}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">Service</div>
                <div class="detail-value">${serviceName}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">Description</div>
                <div class="detail-value">${request.description}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">Time Submitted</div>
                <div class="detail-value">${formattedTime}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">Status</div>
                <div class="detail-value">${request.status.toUpperCase()}</div>
            </div>
        `;
        
        // Set notes if they exist
        document.getElementById('request-notes').value = request.notes || '';
        
        // Set up the save notes button
        document.getElementById('save-notes').setAttribute('data-id', request.id);
        document.getElementById('save-notes').onclick = function() {
            const notes = document.getElementById('request-notes').value;
            updateRequestNotes(request.id, notes);
        };
        
        // Set up action buttons
        document.getElementById('assign-tech').onclick = function() {
            alert('This would open the technician assignment interface.');
        };
        
        document.getElementById('contact-customer').onclick = function() {
            alert(`This would initialize contact with ${request.name} at ${request.phone}.`);
        };
    }
    
    // Function to update request status
    function updateRequestStatus(requestId, newStatus) {
      fetch('http://127.0.0.1:5000/update-request-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: requestId,
                status: newStatus
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Status updated:', data);
            // Refresh the requests list
            fetchRequests();
        })
        .catch(error => {
            console.error('Error updating status:', error);
            alert('There was a problem updating the request status.');
        });
    }
    
    // Function to update request notes
    function updateRequestNotes(requestId, notes) {
      fetch('http://127.0.0.1:5000/update-request-notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: requestId,
                notes: notes
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Notes updated:', data);
            alert('Notes saved successfully!');
        })
        .catch(error => {
            console.error('Error updating notes:', error);
            alert('There was a problem saving the notes.');
        });
    }
    
    // Helper function to get service name from value
    function getServiceName(serviceValue) {
        const serviceMap = {
            'towing': 'Towing Service',
            'fuel': 'Emergency Fuel Delivery',
            'mechanic': 'Mobile Mechanic',
            'battery': 'Battery Jump Start',
            'tire': 'Flat Tire Assistance',
            'lockout': 'Vehicle Lockout Service',
            'other': 'Other Assistance'
        };
        return serviceMap[serviceValue] || serviceValue;
    }
    
    // Initial fetch
    fetchRequests();
  });
  // Add this function to your existing admin.js
function deleteRequest(requestId) {
    if (!confirm('Are you sure you want to delete this request?')) {
        return;
    }
    
    fetch(`${API_BASE_URL}/delete-request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: requestId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Request deleted:', data);
        fetchRequests(); // Refresh the list
    })
    .catch(error => {
        console.error('Error deleting request:', error);
        alert('There was a problem deleting the request.');
    });
}

// Update the displayRequests function to include close buttons
function displayRequests(requests) {
    const requestsList = document.getElementById('requests-list');
    
    if (requests.length === 0) {
        requestsList.innerHTML = `
            <div class="loading">No requests found.</div>
        `;
        return;
    }
    
    requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let html = '';
    requests.forEach(request => {
        const date = new Date(request.timestamp);
        const formattedTime = date.toLocaleString();
        
        let serviceName = getServiceName(request.service);
        if (request.service === 'other' && request.otherService) {
            serviceName += `: ${request.otherService}`;
        }
        
        html += `
            <div class="request-item" data-id="${request.id}">
                <div class="request-header">
                    <span class="request-name">${request.name}</span>
                    <span class="request-time">${formattedTime}</span>
                </div>
                <div class="request-meta">
                    <span class="request-service">${serviceName}</span>
                    <span class="request-status status-${request.status}">${request.status.toUpperCase()}</span>
                </div>
                <button class="close-btn" onclick="event.stopPropagation(); deleteRequest('${request.id}')">×</button>
            </div>
        `;
    });
    
    requestsList.innerHTML = html;
    
    // Rest of your existing displayRequests code...
}