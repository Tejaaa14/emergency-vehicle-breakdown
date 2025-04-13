document.addEventListener('DOMContentLoaded', function() {
    // Dynamic API URL detection
    const API_BASE_URL = (() => {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        return `http://${window.location.hostname}:5000`;
    })();

    console.log('Backend API URL:', API_BASE_URL);

    // Test backend connection immediately
    checkBackendConnection();

    // Service selection handler
    document.getElementById('service').addEventListener('change', function() {
        const otherServiceContainer = document.getElementById('other-service-container');
        otherServiceContainer.style.display = this.value === 'other' ? 'block' : 'none';
        document.getElementById('other-service').toggleAttribute('required', this.value === 'other');
    });
  
    // Form submission handler
    document.getElementById('emergency-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const formData = collectFormData();
            validateFormData(formData);
            
            const response = await submitFormData(formData);
            handleSuccessResponse(response);
            
            this.reset();
        } catch (error) {
            handleSubmissionError(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Emergency Request';
        }
    });

    // Helper functions
    function checkBackendConnection() {
        fetch(`${API_BASE_URL}/health`)
            .then(response => {
                if (!response.ok) throw new Error('Backend unreachable');
                return response.json();
            })
            .then(data => console.log('Backend connection successful:', data))
            .catch(error => {
                console.error('Backend connection failed:', error);
                showConnectionError();
            });
    }

    function collectFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            location: document.getElementById('location').value.trim(),
            vehicle: document.getElementById('vehicle').value.trim(),
            service: document.getElementById('service').value,
            description: document.getElementById('description').value.trim(),
            ...(document.getElementById('service').value === 'other' && {
                otherService: document.getElementById('other-service').value.trim()
            })
        };
    }

    function validateFormData(data) {
        if (!data.name || !data.phone || !data.location || !data.vehicle || !data.description) {
            throw new Error('Please fill all required fields');
        }
    }

    async function submitFormData(data) {
        const response = await fetch(`${API_BASE_URL}/submit-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Submission failed');
        }

        return response.json();
    }

    function handleSuccessResponse(response) {
        document.getElementById('no-request').classList.add('hidden');
        document.getElementById('request-confirmation').classList.remove('hidden');
        
        const serviceName = response.service === 'other' 
            ? `Other: ${response.otherService || ''}` 
            : getServiceName(response.service);

        document.getElementById('request-summary').innerHTML = `
            <div class="confirmation-message">
                <h3>Request Submitted!</h3>
                <p>ID: <strong>${response.id}</strong></p>
                <p class="response-time">Technician will contact you within <span class="highlight">15-30 minutes</span></p>
            </div>
            <div class="request-info">
                <h3>Request Details</h3>
                <p><span class="label">Name:</span> ${response.name}</p>
                <p><span class="label">Service:</span> ${serviceName}</p>
                <p><span class="label">Timestamp:</span> ${new Date().toLocaleString()}</p>
            </div>
        `;
    }

    function handleSubmissionError(error) {
        console.error('Submission error:', error);
        alert(`Error: ${error.message}\n\nPlease try again or contact support`);
    }

    function showConnectionError() {
        alert(`Cannot connect to backend at ${API_BASE_URL}\n\nPlease ensure:\n1. Flask server is running\n2. Port 5000 is accessible\n3. No firewall blocking`);
    }

    function getServiceName(serviceValue) {
        const services = {
            'towing': 'Towing Service',
            'fuel': 'Emergency Fuel Delivery',
            'mechanic': 'Mobile Mechanic',
            'battery': 'Battery Jump Start',
            'tire': 'Flat Tire Assistance',
            'lockout': 'Vehicle Lockout Service',
            'other': 'Other Assistance'
        };
        return services[serviceValue] || serviceValue;
    }
});