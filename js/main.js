// --- DATA MANAGEMENT FUNCTIONS ---
function getAllServices() {
    // Get services from localStorage
    const savedServices = JSON.parse(localStorage.getItem('iitWorksServices') || '[]');
    return savedServices;
}

function getServicesByCategory(category) {
    const allServices = getAllServices();
    if (category === 'all') return allServices;
    return allServices.filter(service => service.category === category);
}

function saveService(serviceData) {
    let savedServices = JSON.parse(localStorage.getItem('iitWorksServices') || '[]');
    savedServices.push(serviceData);
    localStorage.setItem('iitWorksServices', JSON.stringify(savedServices));
    return savedServices;
}

function getCategoryName(category) {
    const names = {
        'art': '🎨 Art & Design',
        'tech': '💻 Tech & Coding',
        'acad': '📚 Academic Help',
        'food': '🍕 Food & Snacks',
        'other': '✨ Other Services',
        'all': 'All Categories'
    };
    return names[category] || category;
}

// --- SEARCH FUNCTION ---
function searchServices(event) {
    if (event && event.keyCode && event.keyCode !== 13) return;
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const allServices = getAllServices();
    
    if (searchTerm === '') {
        renderFeed();
        return;
    }
    
    const filtered = allServices.filter(service => {
        const searchText = searchTerm.toLowerCase();
        return (
            service.title.toLowerCase().includes(searchText) ||
            service.description.toLowerCase().includes(searchText) ||
            service.student.toLowerCase().includes(searchText) ||
            service.course.toLowerCase().includes(searchText) ||
            service.price.toLowerCase().includes(searchText) ||
            getCategoryName(service.category).toLowerCase().includes(searchText)
        );
    });
    
    displaySearchResults(filtered, searchTerm);
}

function displaySearchResults(services, searchTerm) {
    const feed = document.getElementById('feed');
    
    if (services.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No services found for "${searchTerm}"</h3>
                <p>Try different search terms or browse by category</p>
            </div>
        `;
        return;
    }
    
    feed.innerHTML = '';
    
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'gig-card';
        card.onclick = () => selectService(service, card);
        
        card.innerHTML = `
            <div class="gig-title">${service.title}</div>
            <div class="gig-student"><i class="fas fa-user-graduate"></i> ${service.student}</div>
            <div class="gig-course">${service.course}</div>
            <div class="tags">
                <span class="tag price"><i class="fas fa-tag"></i> ${service.price}</span>
                <span class="tag ${service.category}">${getCategoryName(service.category)}</span>
            </div>
            <div class="gig-excerpt">${service.description.substring(0, 100)}...</div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 12px;"><i class="far fa-clock"></i> Posted ${service.posted}</div>
        `;
        feed.appendChild(card);
    });
}

// --- CATEGORY FILTER ---
let currentCategory = 'all';

function setCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const buttons = document.querySelectorAll('.category-btn');
    for (let btn of buttons) {
        if (btn.onclick && btn.onclick.toString().includes(`'${category}'`)) {
            btn.classList.add('active');
            break;
        }
    }
    
    if (document.getElementById('searchInput')) {
        document.getElementById('searchInput').value = '';
    }
    
    renderFeed();
}

function renderFeed() {
    const feed = document.getElementById('feed');
    if (!feed) return;
    
    const services = getServicesByCategory(currentCategory);
    
    if (services.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No services in ${getCategoryName(currentCategory)} yet</h3>
                <p>Be the first to post a service in this category!</p>
            </div>
        `;
        return;
    }
    
    feed.innerHTML = '';
    
    services.sort((a, b) => b.id - a.id).forEach((service, index) => {
        const card = document.createElement('div');
        card.className = 'gig-card';
        card.onclick = () => selectService(service, card);
        
        card.innerHTML = `
            <div class="gig-title">${service.title}</div>
            <div class="gig-student"><i class="fas fa-user-graduate"></i> ${service.student}</div>
            <div class="gig-course">${service.course}</div>
            <div class="tags">
                <span class="tag price"><i class="fas fa-tag"></i> ${service.price}</span>
                <span class="tag ${service.category}">${getCategoryName(service.category)}</span>
            </div>
            <div class="gig-excerpt">${service.description.substring(0, 100)}...</div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 12px;"><i class="far fa-clock"></i> Posted ${service.posted}</div>
        `;
        feed.appendChild(card);
    });
}

// --- SERVICE DETAILS ---
let selectedService = null;

function selectService(service, cardElement) {
    selectedService = service;
    if (cardElement) {
        document.querySelectorAll('.gig-card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
    }
    
    if(window.innerWidth <= 900 && document.getElementById('detailsPane')) {
        document.getElementById('detailsPane').classList.add('open');
    }

    updateServiceDetails(service);
}

function updateServiceDetails(service) {
    const detailContent = document.getElementById('detail-content');
    const studentContent = document.getElementById('student-content');
    
    if (!detailContent || !studentContent) return;
    
    detailContent.innerHTML = `
        <div class="detail-header">
            <div class="detail-title">${service.title}</div>
            <div class="detail-student">
                <i class="fas fa-user-graduate"></i> ${service.student}
                <span class="student-badge"><i class="fas fa-check-circle"></i> Verified IITian</span>
            </div>
            <div class="detail-course">${service.course}</div>
            <div class="tags" style="margin: 15px 0;">
                <span class="tag price" style="font-size: 14px;"><i class="fas fa-tag"></i> ${service.price}</span>
                <span class="tag ${service.category}" style="font-size: 14px;">${getCategoryName(service.category)}</span>
            </div>
            <button class="contact-btn" onclick="contactStudent('${service.student}', '${service.contact}')">
                <i class="fas fa-envelope"></i> Contact ${service.student.split(' ')[0]}
            </button>
        </div>
        <div>
            <h3 style="color: var(--primary); margin-bottom: 10px;">Service Description</h3>
            <p style="line-height: 1.6; margin-bottom: 20px;">${service.description}</p>
            
            <h3 style="color: var(--primary); margin-bottom: 10px;">Contact Information</h3>
            <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
                <p style="margin: 0; font-weight: 600;">${service.contact}</p>
                <small style="color: var(--muted); display: block; margin-top: 5px;"><i class="fas fa-lock"></i> Only visible to MSU-IIT students</small>
            </div>
            
            ${service.portfolio ? `
            <h3 style="color: var(--primary); margin-top: 20px; margin-bottom: 10px;">Portfolio/Samples</h3>
            <p style="color: var(--muted);">${service.portfolio}</p>
            ` : ''}
        </div>
    `;

    studentContent.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--primary), var(--primary-hover)); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; margin: 0 auto 20px;">
                ${service.student.split(' ').map(n => n[0]).join('')}
            </div>
            <div class="detail-title">${service.student}</div>
            <div class="detail-course" style="font-size: 16px; margin-bottom: 20px;">${service.course}</div>
            
            <div style="background: #fff5f5; padding: 20px; border-radius: 10px; text-align: left;">
                <h4 style="color: var(--primary); margin-bottom: 10px;">About ${service.student.split(' ')[0]}</h4>
                <p style="color: var(--text); line-height: 1.6;">${service.student.split(' ')[0]} is a dedicated MSU-IIT student offering ${getCategoryName(service.category).toLowerCase()} services to fellow IITians.</p>
            </div>
        </div>
    `;
}

function contactStudent(studentName, contactInfo) {
    showSuccessMessage(`Contact info for ${studentName}: ${contactInfo}`, 'success');
}

function switchTab(tabName) {
    document.querySelectorAll('.pane-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content-view').forEach(c => c.classList.remove('active'));
    
    if (tabName === 'details') {
        document.querySelector('.pane-tab:nth-child(1)').classList.add('active');
        document.getElementById('view-details').classList.add('active');
    } else {
        document.querySelector('.pane-tab:nth-child(2)').classList.add('active');
        document.getElementById('view-student').classList.add('active');
    }
}

function closeMobileDetails() {
    if (document.getElementById('detailsPane')) {
        document.getElementById('detailsPane').classList.remove('open');
    }
    document.querySelectorAll('.gig-card').forEach(c => c.classList.remove('selected'));
}

// --- SUCCESS MESSAGE ---
function showSuccessMessage(message, type = 'success') {
    const msg = document.getElementById('successMessage');
    const title = document.getElementById('successTitle');
    const subtitle = document.getElementById('successSubtitle');
    
    if (!msg || !title || !subtitle) return;
    
    title.textContent = message;
    subtitle.textContent = type === 'success' ? 'Your action was successful!' : 'Please try again';
    
    msg.style.background = type === 'success' ? '#047857' : '#dc2626';
    msg.classList.remove('hidden');
    
    setTimeout(() => {
        msg.classList.add('hidden');
    }, 3000);
}

// --- STUDENT DIRECTORY FUNCTIONS ---
function loadStudentDirectory() {
    const directory = document.getElementById('studentDirectory');
    if (!directory) return;
    
    const allServices = getAllServices();
    
    if (allServices.length === 0) {
        directory.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-users"></i>
                <h3>No students have posted services yet</h3>
                <p>Be the first to post a service!</p>
            </div>
        `;
        return;
    }
    
    directory.innerHTML = '';
    
    const studentMap = new Map();
    allServices.forEach(service => {
        if (!studentMap.has(service.student)) {
            studentMap.set(service.student, {
                name: service.student,
                course: service.course,
                category: service.category,
                services: 1
            });
        } else {
            studentMap.get(service.student).services++;
        }
    });
    
    const students = Array.from(studentMap.values());
    
    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'gig-card';
        card.style.textAlign = 'center';
        card.style.cursor = 'pointer';
        card.onclick = () => viewStudentProfile(student.name);
        
        const initials = student.name.split(' ').map(n => n[0]).join('');
        
        card.innerHTML = `
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--primary-hover)); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin: 0 auto 15px;">
                ${initials}
            </div>
            <div class="gig-title">${student.name}</div>
            <div class="gig-course">${student.course}</div>
            <div style="margin: 15px 0;">
                <span class="badge-iitian"><i class="fas fa-check-circle"></i> Verified IITian</span>
            </div>
            <div style="color: var(--muted); font-size: 14px; margin-bottom: 15px;">
                ${student.services} service${student.services > 1 ? 's' : ''} listed
            </div>
            <button class="contact-btn" style="width: auto; padding: 10px 20px;" onclick="event.stopPropagation(); viewStudentProfile('${student.name}')">
                <i class="fas fa-eye"></i> View Services
            </button>
        `;
        directory.appendChild(card);
    });
}

function viewStudentProfile(studentName) {
    const allServices = getAllServices();
    const studentServices = allServices.filter(s => s.student === studentName);
    
    if (studentServices.length > 0) {
        // Redirect to homepage with filter
        window.location.href = `index.html?student=${encodeURIComponent(studentName)}`;
    }
}

// Initialize on homepage
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', function() {
        renderFeed();
        
        // Check for student filter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const studentFilter = urlParams.get('student');
        if (studentFilter) {
            const allServices = getAllServices();
            const studentServices = allServices.filter(s => s.student === studentFilter);
            if (studentServices.length > 0) {
                selectService(studentServices[0]);
            }
        }
    });
}
// --- AUTHENTICATION HELPER FUNCTIONS ---

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Update UI based on auth status
    const authElements = document.querySelectorAll('.auth-only, .admin-only, .guest-only');
    
    authElements.forEach(el => {
        if (el.classList.contains('auth-only')) {
            el.style.display = user ? '' : 'none';
        }
        if (el.classList.contains('admin-only')) {
            el.style.display = (user && user.role === 'admin') ? '' : 'none';
        }
        if (el.classList.contains('guest-only')) {
            el.style.display = user ? 'none' : '';
        }
    });
    
    // Update user display name
    const userDisplayElements = document.querySelectorAll('.user-display-name');
    if (user && userDisplayElements.length > 0) {
        userDisplayElements.forEach(el => {
            el.textContent = user.name;
        });
    }
    
    return user;
}

function updateNavForAuth() {
    const user = checkAuth();
    const navRight = document.querySelector('.nav-right');
    
    if (navRight) {
        if (user) {
            // User is logged in
            navRight.innerHTML = `
                <div class="user-menu">
                    <span style="color: white; margin-right: 15px;">
                        <i class="fas fa-user-circle"></i> ${user.name}
                        ${user.role === 'admin' ? '<span class="badge-iitian" style="margin-left: 8px;">ADMIN</span>' : ''}
                    </span>
                    <a href="profile.html" class="sign-in">
                        <i class="fas fa-user"></i> My Profile
                    </a>
                    ${user.role === 'admin' ? `
                    <a href="admin.html" class="sign-in">
                        <i class="fas fa-crown"></i> Admin Panel
                    </a>
                    ` : ''}
                    <a href="#" class="sign-in" onclick="logoutUser()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
                <a href="post.html" class="post-gig-link">
                    <i class="fas fa-plus-circle"></i> Post Your Service
                </a>
            `;
        } else {
            // User is not logged in
            navRight.innerHTML = `
                <a href="auth.html" class="sign-in">
                    <i class="fas fa-graduation-cap"></i> IIT Sign In
                </a>
                <a href="post.html" class="post-gig-link">
                    <i class="fas fa-plus-circle"></i> Post Your Service
                </a>
            `;
        }
    }
}

function logoutUser() {
    localStorage.setItem('currentUser', JSON.stringify(null));
    showSuccessMessage('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// --- UPDATED JOB FUNCTIONS ---

function saveService(serviceData) {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!user) {
        showSuccessMessage('Please sign in to post a service', 'error');
        return null;
    }
    
    const jobData = {
        ...serviceData,
        id: Date.now(),
        userId: user.id, // Link job to user
        userEmail: user.email,
        posted: 'Just now'
    };
    
    let savedServices = JSON.parse(localStorage.getItem('iitWorksServices') || '[]');
    savedServices.push(jobData);
    localStorage.setItem('iitWorksServices', JSON.stringify(savedServices));
    
    return jobData;
}

function getAllServices() {
    const services = JSON.parse(localStorage.getItem('iitWorksServices') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Add ownership info to each service
    return services.map(service => {
        return {
            ...service,
            isOwner: currentUser && service.userId === currentUser.id,
            canDelete: currentUser && (service.userId === currentUser.id || currentUser.role === 'admin')
        };
    });
}

// Update renderFeed function to include delete buttons
function renderFeed() {
    const feed = document.getElementById('feed');
    if (!feed) return;
    
    const services = getServicesByCategory(currentCategory);
    const currentUser = checkAuth();
    
    if (services.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No services in ${getCategoryName(currentCategory)} yet</h3>
                <p>Be the first to post a service in this category!</p>
            </div>
        `;
        return;
    }
    
    feed.innerHTML = '';
    
    services.sort((a, b) => b.id - a.id).forEach((service, index) => {
        const card = document.createElement('div');
        card.className = 'gig-card';
        card.onclick = () => selectService(service, card);
        
        // Delete button (only for owner or admin)
        const deleteButton = service.canDelete ? `
            <button class="delete-job-btn" onclick="event.stopPropagation(); confirmDeleteJob(${service.id})" 
                    style="position: absolute; top: 15px; right: 15px; background: #dc2626; color: white; border: none; border-radius: 6px; padding: 5px 10px; font-size: 12px; cursor: pointer;">
                <i class="fas fa-trash"></i> Delete
            </button>
        ` : '';
        
        // Owner badge
        const ownerBadge = service.isOwner ? `
            <span class="badge-iitian" style="position: absolute; top: 15px; left: 15px;">
                <i class="fas fa-user-check"></i> Your Post
            </span>
        ` : '';
        
        card.innerHTML = `
            ${deleteButton}
            ${ownerBadge}
            <div class="gig-title">${service.title}</div>
            <div class="gig-student"><i class="fas fa-user-graduate"></i> ${service.student}</div>
            <div class="gig-course">${service.course}</div>
            <div class="tags">
                <span class="tag price"><i class="fas fa-tag"></i> ${service.price}</span>
                <span class="tag ${service.category}">${getCategoryName(service.category)}</span>
            </div>
            <div class="gig-excerpt">${service.description.substring(0, 100)}...</div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 12px;">
                <i class="far fa-clock"></i> Posted ${service.posted}
                ${service.isOwner ? '<span style="margin-left: 10px; color: var(--primary);"><i class="fas fa-star"></i> Your Post</span>' : ''}
            </div>
        `;
        feed.appendChild(card);
    });
}

// Delete job function
function confirmDeleteJob(jobId) {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
        const result = Admin.deleteJob(jobId);
        
        if (result.success) {
            showSuccessMessage(result.message);
            renderFeed();
            
            // Clear details pane if viewing deleted job
            const detailContent = document.getElementById('detail-content');
            if (detailContent) {
                detailContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-trash"></i>
                        <p>This service has been deleted</p>
                    </div>
                `;
            }
        } else {
            showSuccessMessage(result.message, 'error');
        }
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    if (typeof Auth !== 'undefined') {
        Auth.init();
    }
    
    // Update UI based on auth status
    checkAuth();
    updateNavForAuth();
    
    // Check if user needs to be redirected
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const currentPage = window.location.pathname;
    
    // Redirect rules
    if (currentPage.includes('post.html') && !user) {
        showSuccessMessage('Please sign in to post a service', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
    }
    
    if (currentPage.includes('admin.html') && (!user || user.role !== 'admin')) {
        showSuccessMessage('Admin access required', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
    
    // Render feed if on homepage
    if (currentPage.includes('index.html') || currentPage === '/') {
        renderFeed();
    }
});