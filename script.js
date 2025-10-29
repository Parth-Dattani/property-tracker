// Data Management
let properties = [];
let currentStep = 1;
let propertyData = {
    name: '',
    city: '',
    type: 'residential',
    subtype: '',
    status: 'ready',
    units: '',
    area: '',
    bathrooms: 2,
    furnished: 'unfurnished',
    price: '',
    rent: '',
    expenses: '',
    downPayment: '',
    images: []
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadPropertiesFromStorage();
    updatePropertiesList();
    updateAllPropertiesList();
    updateDashboardStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup bottom navigation
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const screen = this.getAttribute('data-screen');
            switchScreen(screen);
            
            // Update active state
            document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Setup advanced toggles
    document.getElementById('advanced-toggle').addEventListener('click', function() {
        const content = document.getElementById('advanced-content');
        content.classList.toggle('active');
        this.querySelector('span:last-child').textContent = 
            content.classList.contains('active') ? '▼' : '▶';
    });
    
    document.getElementById('advanced-toggle-2').addEventListener('click', function() {
        const content = document.getElementById('advanced-content-2');
        content.classList.toggle('active');
        this.querySelector('span:last-child').textContent = 
            content.classList.contains('active') ? '▼' : '▶';
    });
    
    document.getElementById('advanced-toggle-3').addEventListener('click', function() {
        const content = document.getElementById('advanced-content-3');
        content.classList.toggle('active');
        this.querySelector('span:last-child').textContent = 
            content.classList.contains('active') ? '▼' : '▶';
    });
    
    // Setup image upload
    document.getElementById('image-upload-area').addEventListener('click', function() {
        document.getElementById('image-upload').click();
    });
    
    document.getElementById('image-upload').addEventListener('change', function(e) {
        const files = e.target.files;
        const previewContainer = document.getElementById('image-preview-container');
        previewContainer.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'image-preview';
                previewContainer.appendChild(img);
                
                // Store image data
                propertyData.images.push(e.target.result);
            };
            
            reader.readAsDataURL(file);
        }
    });
});

// Load properties from storage
function loadPropertiesFromStorage() {
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
        try {
            properties = JSON.parse(storedProperties);
        } catch (e) {
            console.error('Error loading properties from storage:', e);
            properties = [];
        }
    }
}

// Save properties to storage
function savePropertiesToStorage() {
    try {
        localStorage.setItem('properties', JSON.stringify(properties));
    } catch (e) {
        console.error('Error saving properties to storage:', e);
    }
}

// Navigation functions
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Property form functions
function nextStep() {
    if (currentStep < 4) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        document.getElementById('step-number').textContent = currentStep;
        document.getElementById('step-number-progress').textContent = currentStep;
        document.getElementById('progress-fill').style.width = `${currentStep * 25}%`;
        
        // Show/hide previous button
        if (currentStep > 1) {
            document.getElementById('prev-btn').style.display = 'block';
        }
        
        if (currentStep === 4) {
            document.getElementById('next-btn').textContent = 'Save Property';
        }
        
        updateSummary();
    } else {
        saveProperty();
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        document.getElementById('step-number').textContent = currentStep;
        document.getElementById('step-number-progress').textContent = currentStep;
        document.getElementById('progress-fill').style.width = `${currentStep * 25}%`;
        document.getElementById('next-btn').textContent = 'Next';
        
        if (currentStep === 1) {
            document.getElementById('prev-btn').style.display = 'none';
        }
    }
}

function updateStepper(type, change) {
    if (type === 'bathrooms') {
        propertyData.bathrooms = Math.max(1, propertyData.bathrooms + change);
        document.getElementById('bathrooms').textContent = propertyData.bathrooms;
        updateSummary();
    }
}

function updateSummary() {
    const step1Summary = document.getElementById('summary-text-1');
    const step2Summary = document.getElementById('summary-text-2');
    const step3Summary = document.getElementById('summary-text-3');
    const step4Summary = document.getElementById('summary-text-4');
    
    if (propertyData.name && propertyData.city) {
        step1Summary.textContent = `${propertyData.name} in ${propertyData.city}`;
    } else {
        step1Summary.textContent = 'Summary will appear here';
    }
    
    if (propertyData.units || propertyData.area) {
        let summary = '';
        if (propertyData.units) summary += `${propertyData.units} units`;
        if (propertyData.area) summary += `${propertyData.units ? ', ' : ''}${propertyData.area} sq ft`;
        step2Summary.textContent = summary || 'Summary will appear here';
    } else {
        step2Summary.textContent = 'Summary will appear here';
    }
    
    if (propertyData.price || propertyData.rent) {
        let summary = '';
        if (propertyData.price) summary += `$${Number(propertyData.price).toLocaleString()}`;
        if (propertyData.rent) summary += `${propertyData.price ? ', ' : ''}$${Number(propertyData.rent).toLocaleString()}/month`;
        step3Summary.textContent = summary || 'Summary will appear here';
    } else {
        step3Summary.textContent = 'Summary will appear here';
    }
    
    step4Summary.textContent = propertyData.images.length 
        ? `${propertyData.images.length} image(s) uploaded` 
        : 'No images uploaded yet';
}

function saveProperty() {
    // Validate required fields
    if (!propertyData.name || !propertyData.city || !propertyData.units || 
        !propertyData.area || !propertyData.price || !propertyData.rent) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create property object
    const property = {
        id: Date.now(),
        name: propertyData.name,
        city: propertyData.city,
        type: propertyData.type,
        subtype: propertyData.subtype,
        status: propertyData.status,
        units: propertyData.units,
        area: propertyData.area,
        bathrooms: propertyData.bathrooms,
        furnished: propertyData.furnished,
        price: parseFloat(propertyData.price),
        rent: parseFloat(propertyData.rent),
        expenses: parseFloat(propertyData.expenses) || 0,
        downPayment: parseFloat(propertyData.downPayment) || 20,
        images: propertyData.images,
        dateAdded: new Date().toISOString()
    };
    
    // Add to properties array
    properties.push(property);
    
    // Save to storage
    savePropertiesToStorage();
    
    // Reset form
    resetPropertyForm();
    
    // Show success message and navigate to properties screen
    alert('Property added successfully!');
    switchScreen('properties');
    
    // Update active nav item
    document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    document.querySelector('.bottom-nav .nav-item[data-screen="properties"]').classList.add('active');
    
    updatePropertiesList();
    updateAllPropertiesList();
    updateDashboardStats();
}

function resetPropertyForm() {
    currentStep = 1;
    propertyData = {
        name: '',
        city: '',
        type: 'residential',
        subtype: '',
        status: 'ready',
        units: '',
        area: '',
        bathrooms: 2,
        furnished: 'unfurnished',
        price: '',
        rent: '',
        expenses: '',
        downPayment: '',
        images: []
    };
    
    // Reset UI
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step-1').classList.add('active');
    document.getElementById('step-number').textContent = '1';
    document.getElementById('step-number-progress').textContent = '1';
    document.getElementById('progress-fill').style.width = '25%';
    document.getElementById('next-btn').textContent = 'Next';
    document.getElementById('prev-btn').style.display = 'none';
    
    // Reset form fields
    document.getElementById('prop-name').value = '';
    document.getElementById('prop-city').value = '';
    document.getElementById('prop-units').value = '';
    document.getElementById('prop-area').value = '';
    document.getElementById('prop-price').value = '';
    document.getElementById('prop-rent').value = '';
    document.getElementById('prop-expenses').value = '';
    document.getElementById('prop-down').value = '';
    document.getElementById('bathrooms').textContent = '2';
    document.getElementById('image-preview-container').innerHTML = '';
    
    // Reset toggles and chips
    document.querySelectorAll('.toggle-option[data-type]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.toggle-option[data-type="residential"]').classList.add('active');
    
    document.querySelectorAll('.toggle-option[data-status]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.toggle-option[data-status="ready"]').classList.add('active');
    
    document.querySelectorAll('.chip-btn').forEach(chip => {
        chip.classList.remove('selected');
    });
    
    updateSummary();
}

function cancelAddProperty() {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
        resetPropertyForm();
        switchScreen('home-screen');
        
        // Update active nav item
        document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelector('.bottom-nav .nav-item[data-screen="home-screen"]').classList.add('active');
    }
}

// Property list functions
function updatePropertiesList() {
    const propertiesList = document.getElementById('properties-list');
    
    if (properties.length === 0) {
        propertiesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No properties added yet. Click "Add Property" to get started.</p>';
        return;
    }
    
    // Show only the last 3 properties
    const recentProperties = properties.slice(-3).reverse();
    let html = '';
    
    recentProperties.forEach(property => {
        const capRate = calculateCapRate(property);
        const cashFlow = calculateCashFlow(property);
        
        html += `
            <div class="property-card">
                <h3>${property.name}</h3>
                <div class="property-info">
                    <label>Address:</label>
                    <value>${property.city}</value>
                </div>
                <div class="property-info">
                    <label>Purchase Price:</label>
                    <value>$${Number(property.price).toLocaleString()}</value>
                </div>
                <div class="property-info">
                    <label>Units:</label>
                    <value>${property.units}</value>
                </div>
                <div class="property-info">
                    <label>Cap Rate:</label>
                    <value>${capRate}%</value>
                </div>
                <div class="property-info">
                    <label>Cash Flow:</label>
                    <value>$${cashFlow}</value>
                </div>
            </div>
        `;
    });
    
    propertiesList.innerHTML = html;
}

function updateAllPropertiesList() {
    const allPropertiesList = document.getElementById('all-properties-list');
    
    if (properties.length === 0) {
        allPropertiesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No properties added yet. Click "Add New Property" to get started.</p>';
        return;
    }
    
    let html = '';
    
    properties.forEach(property => {
        const capRate = calculateCapRate(property);
        const roi = calculateROI(property);
        
        html += `
            <div class="property-card">
                <h3>${property.name}</h3>
                <div class="property-info" style="font-size: 12px;">
                    <label>Type:</label>
                    <value>${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</value>
                </div>
                <div class="property-info" style="font-size: 12px;">
                    <label>Units:</label>
                    <value>${property.units}</value>
                </div>
                <div class="property-info" style="font-size: 12px;">
                    <label>Value:</label>
                    <value>$${formatCurrency(property.price)}</value>
                </div>
                <div class="property-info" style="font-size: 12px;">
                    <label>ROI:</label>
                    <value style="color: #10b981;">${roi}%</value>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 10px; font-size: 12px;">View Details</button>
            </div>
        `;
    });
    
    allPropertiesList.innerHTML = html;
}

function updateDashboardStats() {
    const totalProperties = properties.length;
    const totalValue = properties.reduce((sum, prop) => sum + prop.price, 0);
    const totalRent = properties.reduce((sum, prop) => sum + prop.rent, 0);
    const totalExpenses = properties.reduce((sum, prop) => sum + (prop.expenses || 0), 0);
    
    // Calculate total cash flow
    const totalCashFlow = totalRent - (totalExpenses / 12);
    
    // Calculate occupancy rate (simplified - assuming all units are occupied)
    const totalUnits = properties.reduce((sum, prop) => sum + parseInt(prop.units), 0);
    const occupancyRate = totalUnits > 0 ? 95 : 0;
    
    // Update DOM elements
    document.getElementById('total-properties').textContent = totalProperties;
    document.getElementById('total-value').textContent = `$${formatCurrency(totalValue)}`;
    document.getElementById('total-cash-flow').textContent = `$${formatCurrency(totalCashFlow)}`;
    document.getElementById('occupancy-rate').textContent = `${occupancyRate}%`;
    
    // Simplified calculations for other metrics
    document.getElementById('total-equity').textContent = `$${formatCurrency(totalValue * 0.3)}`;
    document.getElementById('total-loan-balance').textContent = `$${formatCurrency(totalValue * 0.7)}`;
    document.getElementById('total-annual-noi').textContent = `$${formatCurrency(totalRent * 12 - totalExpenses)}`;
}

function calculateCapRate(property) {
    const annualRent = property.rent * 12;
    const annualExpenses = property.expenses || 0;
    const noi = annualRent - annualExpenses;
    return property.price > 0 ? ((noi / property.price) * 100).toFixed(1) : 0;
}

function calculateCashFlow(property) {
    const monthlyRent = property.rent;
    const monthlyExpenses = (property.expenses || 0) / 12;
    return formatCurrency(monthlyRent - monthlyExpenses);
}

function calculateROI(property) {
    const annualRent = property.rent * 12;
    const annualExpenses = property.expenses || 0;
    const annualCashFlow = annualRent - annualExpenses;
    const downPayment = property.price * (property.downPayment / 100);
    return downPayment > 0 ? ((annualCashFlow / downPayment) * 100).toFixed(1) : 0;
}

function formatCurrency(value) {
    const num = Number(value);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toFixed(0);
}

// Setup event listeners for form elements
function setupEventListeners() {
    // Property type toggle
    document.querySelectorAll('.toggle-option[data-type]').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.toggle-option[data-type]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            propertyData.type = this.getAttribute('data-type');
            updateSummary();
        });
    });
    
    // Property status toggle
    document.querySelectorAll('.toggle-option[data-status]').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.toggle-option[data-status]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            propertyData.status = this.getAttribute('data-status');
            updateSummary();
        });
    });
    
    // Subtype chips
    document.querySelectorAll('.chip-btn[data-subtype]').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.chip-btn[data-subtype]').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
            propertyData.subtype = this.getAttribute('data-subtype');
            updateSummary();
        });
    });
    
    // Units chips
    document.querySelectorAll('.chip-btn[data-units]').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.chip-btn[data-units]').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
            propertyData.units = this.getAttribute('data-units');
            document.getElementById('prop-units').value = propertyData.units;
            updateSummary();
        });
    });
    
    // Down payment chips
    document.querySelectorAll('.chip-btn[data-down]').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.chip-btn[data-down]').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
            propertyData.downPayment = this.getAttribute('data-down');
            document.getElementById('prop-down').value = propertyData.downPayment;
            updateSummary();
        });
    });
    
    // Input field listeners
    document.getElementById('prop-name').addEventListener('input', function() {
        propertyData.name = this.value;
        updateSummary();
    });
    
    document.getElementById('prop-city').addEventListener('input', function() {
        propertyData.city = this.value;
        updateSummary();
    });
    
    document.getElementById('prop-units').addEventListener('input', function() {
        propertyData.units = this.value;
        updateSummary();
    });
    
    document.getElementById('prop-area').addEventListener('input', function() {
        propertyData.area = this.value;
        updateSummary();
    });
    
    document.getElementById('prop-price').addEventListener('input', function() {
        propertyData.price = this.value;
        updateSummary();
    });
    
    document.getElementById('prop-rent').addEventListener('input', function() {
        propertyData.rent = this.value;
        updateSummary();
    });
    
    document.getElementById('prop-expenses').addEventListener('input', function() {
        propertyData.expenses = this.value;
        updateSummary();
    });
    
    document.getElementById('prop-down').addEventListener('input', function() {
        propertyData.downPayment = this.value;
        updateSummary();
    });
    
    document.getElementById('prop-furnished').addEventListener('change', function() {
        propertyData.furnished = this.value;
        updateSummary();
    });
}