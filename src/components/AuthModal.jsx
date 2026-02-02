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
                setError("All fields are required.");
                return false;
            }
            if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                setError("Please enter a valid email address.");
                return false;
            }
            if (!/^\d{10}$/.test(formData.mobile)) {
                setError("Mobile number must be 10 digits.");
                return false;
            }
            if (!/^\d{10}$/.test(formData.emergencyContact)) {
                setError("Emergency contact must be 10 digits.");
                return false;
            }
            if (formData.password.length < 6) {
                setError("Password must be at least 6 characters.");
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
                setSuccess('Account created! Sign in to continue.');
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
                    style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.4)', backdropFilter: 'blur(8px)' }}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="glass-card"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '440px',
                        maxHeight: '90vh',
                        padding: '2.5rem',
                        background: 'white',
                        border: '1px solid var(--glass-border)',
                        overflowY: 'auto',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                            {isLogin ? 'Welcome Back' : 'Secure Onboarding'}
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {isLogin ? 'Access your healthcare dashboard' : 'Join TN Health for smart emergency support'}
                        </p>
                    </div>

                    <button
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '1.5rem',
                            cursor: 'pointer'
                        }}
                        onClick={() => alert("Google Login simulation activated.")}
                    >
                        <Chrome size={20} color="#EA4335" /> Continue with Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR MANUAL {isLogin ? 'LOGIN' : 'SIGNUP'}</span>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {!isLogin && (
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>

                        {!isLogin && (
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    type="tel"
                                    name="mobile"
                                    placeholder="Mobile Number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>
                        )}

                        {!isLogin && (
                            <div style={{ position: 'relative' }}>
                                <ShieldAlert size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--error)' }} />
                                <input
                                    type="tel"
                                    name="emergencyContact"
                                    placeholder="Emergency Contact (Capregiver)"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #FEE2E2', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>

                        {!isLogin && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#F8FAFC', padding: '10px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
                                <strong>Safety Consent:</strong> Your emergency contact is mandatory. It will ONLY be used to send your location during Panic Mode.
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-sm)', color: '#059669', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={16} /> {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-button"
                            style={{ width: '100%', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1, padding: '14px' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Wait a moment...' : (isLogin ? 'Enter Platform' : 'Secure My Account')}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {isLogin ? "New to the platform? " : "Joined us before? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                            style={{ fontWeight: 700, color: 'var(--primary)' }}
                        >
                            {isLogin ? 'Start Onboarding' : 'Sign In'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
