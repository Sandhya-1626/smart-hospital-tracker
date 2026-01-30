import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                onClose(); // Close modal on successful login
            } else {
                await register(formData.name, formData.email, formData.password);
                setSuccess('Account created! Please log in.');
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccess('');
                    setFormData(prev => ({ ...prev, password: '' }));
                }, 1500);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="glass-card"
                    style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: '2.5rem', background: 'white', border: '1px solid var(--glass-border)' }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>

                    <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', textAlign: 'center' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        {isLogin ? 'Enter your details to access your account' : 'Sign up to get started'}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {!isLogin && (
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none' }}
                                />
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>

                        {error && (
                            <div style={{ padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-sm)', color: '#059669', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={16} /> {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-button"
                            style={{ width: '100%', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                            style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'underline' }}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
