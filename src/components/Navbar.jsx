import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Languages, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onLoginClick, isLogged, userName, onProfileClick }) => {
    const { t, toggleLanguage } = useLanguage();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Effect for top navbar shadow on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                        <Shield color="white" size={24} />
                    </div>
                    <div>
                        <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>{t.appName}</span>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button
                        onClick={toggleLanguage}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <Languages size={20} />
                        {t.languageToggle}
                    </button>

                    {isLogged ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '8px 16px', background: 'var(--bg-base)',
                                    color: 'var(--text-primary)', border: '1px solid var(--border-strong)',
                                    borderRadius: 'var(--radius-full)', cursor: 'pointer',
                                    fontWeight: 500, transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-light)' }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                            >
                                <div style={{ background: 'var(--bg-accent)', padding: '4px', borderRadius: '50%' }}>
                                    <User size={16} color="var(--primary)" />
                                </div>
                                <span>{userName || "Profile"}</span>
                                <ChevronDown size={14} color="var(--text-secondary)" />
                            </button>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '220px', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'white', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-lg)', zIndex: 1000 }}
                                    >
                                        <button
                                            onClick={() => { setShowProfileMenu(false); onProfileClick(); }}
                                            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', background: 'transparent', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                        >
                                            <User size={18} color="currentColor" /> Edit Profile
                                        </button>
                                        <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />
                                        <button
                                            onClick={logout}
                                            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--error)', background: 'transparent', border: 'none', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="primary-button"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 24px' }}
                        >
                            <User size={18} />
                            {t.login}
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="mobile-toggle" style={{ display: 'none' }}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            <style>{`
            @media (max-width: 768px) {
                .desktop-menu { display: none !important; }
                .mobile-toggle { display: block !important; }
            }
            `}</style>
        </nav>
    );
};

export default Navbar;
