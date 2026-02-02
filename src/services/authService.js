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
    register: async (name, email, mobile, emergencyContact, password) => {
        await delay(800);

        // 1. Get existing users
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');

        // 2. Check if email exists
        if (users.find(u => u.email === email)) {
            throw new Error("User with this email already exists.");
        }

        // 3. Hash password (Simulated)
        const hashedPassword = btoa(password);

        // 4. Create User Object
        const newUser = {
            id: Date.now(),
            name,
            email,
            mobile,
            emergencyContact,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        // 5. Save to DB
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

        // 2. Validate password
        if (!user || user.password !== btoa(password)) {
            throw new Error("Invalid email or password.");
        }

        // 3. Create Session
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
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
    }
};
