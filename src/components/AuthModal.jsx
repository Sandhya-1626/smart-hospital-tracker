import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, ShieldAlert, AlertCircle, CheckCircle, Chrome } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        emergencyContact: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        if (!isLogin) {
            if (!formData.name || !formData.email || !formData.mobile || !formData.emergencyContact || !formData.password) {
                setError("Please fill in all safety fields.");
                return false;
            }
            if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                setError("Invalid email format.");
                return false;
            }
            if (!/^\d{10}$/.test(formData.mobile) || !/^\d{10}$/.test(formData.emergencyContact)) {
                setError("Phone numbers must be 10 digits.");
                return false;
            }
        } else {
            if (!formData.email || !formData.password) {
                setError("Email and Password are required.");
                return false;
            }
        }
        return true;
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        // Simulating Google Login
        setTimeout(async () => {
            try {
                // We'll use a dummy account for the Google simulation
                await login("guest@google.com", "googlepass");
                onClose();
            } catch (err) {
                setError("Google entry failed. Please try manual login.");
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                onClose();
            } else {
                await register(
                    formData.name,
                    formData.email,
                    formData.mobile,
                    formData.emergencyContact,
                    formData.password
                );
                setSuccess('Account Secured! Switching to login...');
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccess('');
                }, 2000);
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
            <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.6)', backdropFilter: 'blur(10px)' }}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    className="glass-card"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '420px',
                        maxHeight: '85vh',
                        padding: '2rem',
                        background: 'white',
                        border: '1px solid var(--glass-border)',
                        overflowY: 'auto',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)', padding: '8px' }}>
                        <X size={24} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <ShieldAlert size={28} />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {isLogin ? 'Sign In' : 'Safety Registration'}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isLogin ? 'Welcome back to TN Health AI' : 'Complete onboarding for emergency support'}
                        </p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            cursor: 'pointer',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        <Chrome size={18} color="#EA4335" /> Continue with Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>OR MANUAL ENTRY</span>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {!isLogin && (
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                                />
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                            />
                        </div>

                        {!isLogin && (
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    type="tel"
                                    name="mobile"
                                    placeholder="Your Mobile Number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                                />
                            </div>
                        )}

                        {!isLogin && (
                            <div style={{ position: 'relative' }}>
                                <ShieldAlert size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--error)' }} />
                                <input
                                    type="tel"
                                    name="emergencyContact"
                                    placeholder="Emergency Contact (Guardian)"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '12px', border: '1px solid #FEE2E2', outline: 'none', fontSize: '0.85rem', background: '#FFFBFB' }}
                                />
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                            />
                        </div>

                        {!isLogin && (
                            <div style={{ fontSize: '0.7rem', color: '#0369A1', background: '#F0F9FF', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #0EA5E9' }}>
                                <strong>Privacy:</strong> We only use your emergency contact during Panic Mode alerts.
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#059669', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={14} /> {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-button"
                            style={{
                                width: '100%',
                                marginTop: '0.5rem',
                                padding: '14px',
                                opacity: isLoading ? 0.7 : 1,
                                borderRadius: '12px',
                                border: 'none',
                                background: 'var(--primary)',
                                color: 'white',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Enter App' : 'Secure My Account')}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {isLogin ? "New user? " : "Already registered? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                            style={{ fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }}
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
