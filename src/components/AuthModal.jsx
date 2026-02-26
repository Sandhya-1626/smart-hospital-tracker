import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, Phone, Heart } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        emergencyContact: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        if (!isLogin) {
            if (!/^\d{10}$/.test(formData.mobile)) {
                setError("Please enter a valid 10-digit mobile number.");
                return false;
            }
            if (!/^\d{10}$/.test(formData.emergencyContact)) {
                setError("Please enter a valid 10-digit emergency contact number.");
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
                    formData.password,
                    formData.mobile,
                    formData.emergencyContact
                );
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

    // Google Login Mock
    const handleGoogleLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            // In a real app, this would trigger OAuth
            alert("Google Login Integration would go here.");
        }, 1000);
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
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '450px',
                        padding: '2.5rem 2rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-xl)',
                        boxShadow: 'var(--shadow-lg)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)', background: 'var(--bg-base)', padding: '6px', borderRadius: '50%', display: 'flex', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-accent)' }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-base)' }}>
                        <X size={20} />
                    </button>

                    <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', textAlign: 'center', color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: 800 }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                        {isLogin ? 'Enter your details to access your account' : 'Sign up for emergency services'}
                    </p>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: 'var(--bg-base)',
                            border: '1px solid var(--border-strong)',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-accent)' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-base)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {!isLogin && (
                            <>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        placeholder="Mobile Number (10 digits)"
                                        required
                                        maxLength="10"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', outline: 'none' }}
                                    />
                                </div>
                            </>
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
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', outline: 'none' }}
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
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>

                        {!isLogin && (
                            <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                                <div style={{ position: 'relative', marginBottom: '8px' }}>
                                    <Heart size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--error)' }} />
                                    <input
                                        type="tel"
                                        name="emergencyContact"
                                        placeholder="Emergency Contact (Family)"
                                        required
                                        maxLength="10"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--error)', color: 'var(--text-primary)', outline: 'none' }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--error)', margin: 0, paddingLeft: '4px', fontWeight: 500 }}>
                                    *Used ONLY during Panic Mode to alert family.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'underline', border: 'none', background: 'transparent', cursor: 'pointer' }}
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
