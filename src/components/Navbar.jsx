import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Languages, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onLoginClick, isLogged, userName, onProfileClick }) => {
    const { t, toggleLanguage, lang } = useLanguage();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <nav className="glass-card" style={{ margin: '1rem', borderRadius: 'var(--radius-md)', position: 'sticky', top: '1rem', zIndex: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                        <Shield color="white" size={24} />
                    </div>
                    <div>
                        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>{t.appName}</span>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button
                        onClick={toggleLanguage}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}
                    >
                        <Languages size={20} />
                        {t.languageToggle}
                    </button>

                    {isLogged ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="primary-button"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 16px', background: 'rgba(0, 98, 255, 0.1)', color: 'var(--primary)' }}
                            >
                                <User size={18} />
                                <span>{userName || "Profile"}</span>
                                <ChevronDown size={14} />
                            </button>

                            {showProfileMenu && (
                                <div className="glass-card" style={{ position: 'absolute', top: '120%', right: 0, width: '200px', padding: '0.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', background: 'white' }}>
                                    <button
                                        onClick={() => { setShowProfileMenu(false); onProfileClick(); }}
                                        style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', borderRadius: '4px', marginBottom: '4px' }}
                                    >
                                        <User size={16} /> Edit Profile
                                    </button>
                                    <button
                                        onClick={logout}
                                        style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', borderRadius: '4px', borderTop: '1px solid #F1F5F9' }}
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="primary-button"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <User size={18} />
                            {t.login}
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="mobile-toggle" style={{ display: 'none' }}>
                    <button onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X /> : <Menu />}
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
