import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, X, Send, MapPin, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = ({ onRadiusChange, onSearch }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your TN Health Assistant. What symptoms are you experiencing?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [pendingSearch, setPendingSearch] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);

        processInput(input);
        setInput('');
    };

    const processInput = (text) => {
        const lowerText = text.toLowerCase();

        // 1. Check for distance/radius mentions
        const kmMatch = lowerText.match(/(\d+)\s*km/);

        // 2. Extract potential symptoms (anything that isn't the distance)
        let potentialSymptom = lowerText.replace(/(\d+)\s*km/, '').replace(/within|under|less than|near/g, '').trim();

        if (kmMatch && potentialSymptom.length > 3) {
            // BOTH provided at once
            const radius = parseInt(kmMatch[1]);
            setPendingSearch(potentialSymptom);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: `Excellent! I'm suggesting hospitals for "${potentialSymptom}" within ${radius}km.`,
                    sender: 'bot'
                }]);
                onRadiusChange(radius);
                onSearch(potentialSymptom);
            }, 600);
            return;
        }

        if (kmMatch) {
            // ONLY distance provided
            const radius = parseInt(kmMatch[1]);
            setTimeout(() => {
                const searchName = pendingSearch || 'hospitals';
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: `Got it. Filtering results for "${searchName}" to strictly within ${radius}km.`,
                    sender: 'bot'
                }]);
                onRadiusChange(radius);
                if (pendingSearch) onSearch(pendingSearch);
            }, 600);
            return;
        }

        // Check for "reset" or "all"
        if (lowerText.includes("all") || lowerText.includes("reset") || lowerText.includes("any distance")) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: `Showing all nearby hospitals for "${pendingSearch || 'your needs'}" without distance limits.`,
                    sender: 'bot'
                }]);
                onRadiusChange(null);
                if (pendingSearch) onSearch(pendingSearch);
            }, 600);
            return;
        }

        // ONLY Symptom provided
        setPendingSearch(text);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `I've found hospitals for "${text}". To give you the closest suggestions (not far away), what is your preferred distance in KM?`,
                sender: 'bot'
            }]);
        }, 800);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(0, 98, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '6.5rem',
                            right: '2rem',
                            width: '100%',
                            maxWidth: '380px',
                            height: '500px',
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-2xl)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000,
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Compass size={24} className="animate-pulse" />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Proximity Assistant</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online • Strictly Nearby Support</div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F8FAFC' }}
                        >
                            {messages.map(m => (
                                <div
                                    key={m.id}
                                    style={{
                                        alignSelf: m.sender === 'bot' ? 'flex-start' : 'flex-end',
                                        maxWidth: '85%',
                                        background: m.sender === 'bot' ? 'white' : 'var(--primary)',
                                        color: m.sender === 'bot' ? 'var(--text-primary)' : 'white',
                                        padding: '10px 14px',
                                        borderRadius: m.sender === 'bot' ? '4px 16px 16px 16px' : '16px 16px 4px 16px',
                                        fontSize: '0.9rem',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                        border: m.sender === 'bot' ? '1px solid #E2E8F0' : 'none'
                                    }}
                                >
                                    {m.text}
                                </div>
                            ))}
                        </div>

                        {/* Quick Distance Buttons */}
                        <div style={{ display: 'flex', gap: '8px', padding: '8px 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                            {[2, 5, 10, 20].map(dist => (
                                <button
                                    key={dist}
                                    onClick={() => processInput(`${dist}km`)}
                                    style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'white', border: '1px solid #E2E8F0', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    {dist}km
                                </button>
                            ))}
                            <button
                                onClick={() => processInput(`any distance`)}
                                style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'white', border: '1px solid #E2E8F0', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                Reset
                            </button>
                        </div>

                        {/* Input */}
                        <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="e.g. '5km' or 'chest pain'..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: '8px 12px', outline: 'none', fontSize: '0.9rem' }}
                            />
                            <button
                                onClick={handleSend}
                                style={{ background: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
