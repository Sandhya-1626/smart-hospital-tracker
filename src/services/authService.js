/**
 * Service to handle User Authentication
 * Note: In a real production environment, this would communicate with a Backend API
 * (Node.js/Express/Python) instead of using LocalStorage.
 */

const STORAGE_KEY_USERS = 'tn_health_users';
const STORAGE_KEY_SESSION = 'tn_health_session';

// Simulating a delay for realistic API feel
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
    /**
     * Register a new user
     * @param {string} name 
     * @param {string} email 
     * @param {string} password 
     * @param {string} mobile 
     * @param {string} emergencyContact 
     */
    register: async (name, email, password, mobile, emergencyContact) => {
        await delay(800);

        // 1. Get existing users
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');

        // 2. Check if email exists
        if (users.find(u => u.email === email)) {
            throw new Error("User with this email already exists.");
        }

        // 3. Hash password (Simulated - use bcrypt in backend)
        const hashedPassword = btoa(password); // Simple encoding

        // 4. Create User Object
        const newUser = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword,
            mobile,
            emergencyContact,
            createdAt: new Date().toISOString()
        };

        // 5. Save to DB (LocalStorage)
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

        return { success: true, message: "Account created successfully!" };
    },

    /**
     * Log in a user
     * @param {string} email 
     * @param {string} password 
     */
    login: async (email, password) => {
        await delay(800);

        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');

        // 1. Find user
        const user = users.find(u => u.email === email);

        // 2. Validate password (Simulated)
        // In real app: const match = await bcrypt.compare(password, user.password);
        if (!user || user.password !== btoa(password)) {
            throw new Error("Invalid email or password.");
        }

        // 3. Create Session
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            emergencyContact: user.emergencyContact,
            token: "mock-jwt-token-" + Date.now()
        };

        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
        return sessionData;
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem(STORAGE_KEY_SESSION);
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: () => {
        const session = localStorage.getItem(STORAGE_KEY_SESSION);
        return session ? JSON.parse(session) : null;
    },

    /**
     * Update user profile
     * @param {number} userId 
     * @param {object} updates { name, mobile, emergencyContact }
     */
    updateProfile: async (userId, updates) => {
        await delay(500);

        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error("User not found.");
        }

        // Update User in DB
        const updatedUser = { ...users[userIndex], ...updates };
        users[userIndex] = updatedUser;
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

        // Update Session if it matches current user
        const session = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION));
        if (session && session.id === userId) {
            const updatedSession = { ...session, ...updates };
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedSession));
            return updatedSession;
        }

        return null;
    }
};
