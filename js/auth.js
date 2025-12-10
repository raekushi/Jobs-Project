// Authentication System
const Auth = {
    // Initialize with default admin account
    init() {
        // Check if users exist in localStorage, if not create default
        if (!localStorage.getItem('iitWorksUsers')) {
            const defaultUsers = [
                {
                    id: 1,
                    email: 'admin@msuiit.edu.ph',
                    password: 'admin123',
                    name: 'System Admin',
                    course: 'Administration',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    email: 'student@msuiit.edu.ph',
                    password: 'student123',
                    name: 'Sample Student',
                    course: 'BS Computer Science 3rd Year',
                    role: 'user',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('iitWorksUsers', JSON.stringify(defaultUsers));
        }
        
        // Initialize current user
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(null));
        }
    },

    // Get all users
    getAllUsers() {
        return JSON.parse(localStorage.getItem('iitWorksUsers') || '[]');
    },

    // Get current user
    getCurrentUser() {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return user;
    },

    // Set current user
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Logout
    logout() {
        localStorage.setItem('currentUser', JSON.stringify(null));
        window.location.href = 'index.html';
    },

    // Login
    login(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.setCurrentUser(user);
            return { success: true, user };
        }
        return { success: false, message: 'Invalid email or password' };
    },

    // Signup
    signup(userData) {
        const users = this.getAllUsers();
        
        // Check if email already exists
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Validate IIT email
        if (!userData.email.includes('@g.msuiit.edu.ph')) {
            return { success: false, message: 'Please use MSU-IIT email (@g.msuiit.edu.ph)' };
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            email: userData.email,
            password: userData.password,
            name: userData.name,
            course: userData.course,
            role: 'user', // Default role is user
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('iitWorksUsers', JSON.stringify(users));
        
        // Auto login after signup
        this.setCurrentUser(newUser);
        
        return { success: true, user: newUser };
    },

    // Check if user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Update user profile
    updateProfile(updatedData) {
        const users = this.getAllUsers();
        const currentUser = this.getCurrentUser();
        
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            // Keep email and role unchanged
            users[userIndex] = {
                ...users[userIndex],
                name: updatedData.name || users[userIndex].name,
                course: updatedData.course || users[userIndex].course,
                bio: updatedData.bio || users[userIndex].bio
            };
            
            localStorage.setItem('iitWorksUsers', JSON.stringify(users));
            this.setCurrentUser(users[userIndex]);
            return { success: true };
        }
        
        return { success: false };
    }
};