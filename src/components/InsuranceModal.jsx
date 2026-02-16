import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { verifyCoverage } from '../services/dataService'; // Changed from validatePolicy

const InsuranceModal = ({ isOpen, onClose, hospital }) => {
    const [policyNumber, setPolicyNumber] = useState('');
    const [result, setResult] = useState(null);

    const handleCheck = (e) => {
        e.preventDefault();
        // 1. Verify availability in dataset
        const coverage = verifyCoverage(policyNumber);

        if (coverage && coverage.valid) {
            // 2. Check if THIS hospital accepts the provider
            const provider = coverage.provider; // verifyCoverage now returns provider

            // Logic to match provider with hospital.insurance array (Case insensitive loop)
            const isAccepted = hospital.insurance.some(ins =>
                ins.toLowerCase() === provider.toLowerCase() ||
                ins.toLowerCase().includes(provider.toLowerCase()) ||
                (provider === 'New Health Insurance Scheme' && (ins.includes('New Health') || ins.includes('CMCHIS'))) ||
                (provider === 'MA' && (ins.startsWith('MDI') || ins === 'MA'))
            );

            setResult({
                ...coverage,
                isAccepted,
                id: policyNumber
            });
        } else {
            setResult({ valid: false, id: policyNumber });
        }
    };

    const reset = () => {
        setResult(null);
        setPolicyNumber('');
    };

    if (!isOpen || !hospital) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass-card"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '450px',
                        background: 'white',
                        borderRadius: '20px',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', borderRadius: '50%', border: 'none', background: '#F1F5F9', cursor: 'pointer' }}>
                        <X size={20} color="#64748B" />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: '60px', height: '60px', background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#3B82F6' }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>Insurance Validation</h2>
                        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Check coverage at <br /><strong>{hospital.name}</strong></p>
                    </div>

                    {!result ? (
                        <form onSubmit={handleCheck}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                                    Insurance Number
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <CreditCard size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: '#94A3B8' }} />
                                    <input
                                        type="text"
                                        placeholder="e.g. INS-1"
                                        value={policyNumber}
                                        onChange={(e) => setPolicyNumber(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 48px',
                                            borderRadius: '12px',
                                            border: '1px solid #E2E8F0',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: '#334155',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        required
                                    />
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.5rem', marginLeft: '0.25rem' }}>
                                    Enter ID from your Insurance Card (e.g. INS-1)
                                </p>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: '#2563EB',
                                    color: 'white',
                                    fontWeight: 600,
                                    border: 'none',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Verify Coverage <ShieldCheck size={18} />
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'left' }}>
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{
                                    padding: '1.5rem',
                                    background: result.valid ? '#F8FAFC' : '#FEF2F2',
                                    borderRadius: '16px',
                                    border: `1px solid ${result.valid ? '#E2E8F0' : '#FECACA'}`,
                                    marginBottom: '1.5rem'
                                }}
                            >
                                {result.valid ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Insurance Number:</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 700 }}>{result.id}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Policy Status:</span>
                                            <span style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 700,
                                                color: result.isAccepted ? '#166534' : '#B91C1C',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}>
                                                {result.isAccepted ? <><CheckCircle size={14} /> Applicable</> : <><AlertCircle size={14} /> Not Applicable</>}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Applicable Hospitals:</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 700 }}>{result.hospitalCount} Network Hospitals</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Available Coverage:</span>
                                            <span style={{ fontSize: '1rem', color: '#2563EB', fontWeight: 800 }}>₹{result.coverageAmount}</span>
                                        </div>

                                        <div style={{ marginTop: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Explanation:</span>
                                            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>
                                                {result.isAccepted
                                                    ? `Policy is active and accepted at ${hospital.name}.`
                                                    : `Policy is active but ${hospital.name} is not in the network.`}
                                            </p>
                                        </div>

                                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.5rem', fontStyle: 'italic', textAlign: 'center' }}>
                                            Policy: {result.policyName} ({result.type})
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                                        <div style={{ color: '#EF4444', marginBottom: '0.5rem' }}><AlertCircle size={32} /></div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991B1B' }}>Verification Failed</h3>
                                        <p style={{ color: '#B91C1C', fontSize: '0.9rem' }}>Could not find policy for ID: <strong>{result.id}</strong></p>
                                    </div>
                                )}
                            </motion.div>

                            <button
                                onClick={reset}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    color: '#64748B',
                                    fontWeight: 600,
                                    border: 'none',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Check Another ID
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InsuranceModal;
