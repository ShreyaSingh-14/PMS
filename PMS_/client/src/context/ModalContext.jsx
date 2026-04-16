import React, { createContext, useState, useContext } from 'react';
import { X, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert', 'confirm', 'prompt'
    inputType: 'text',
    onConfirm: () => {},
    onCancel: () => {},
    defaultValue: '',
    inputValue: ''
  });

  const showAlert = (title, message) => {
    setModal(prev => ({ ...prev, isOpen: true, title, message, type: 'alert', onConfirm: () => {} }));
  };

  const showConfirm = (title, message, onConfirm) => {
    setModal(prev => ({ ...prev, isOpen: true, title, message, type: 'confirm', onConfirm }));
  };

  const showPrompt = (title, message, onComplete, defaultValue = '') => {
    setModal(prev => ({ 
        ...prev, 
        isOpen: true, 
        title, 
        message, 
        type: 'prompt', 
        onConfirm: (val) => onComplete(val),
        defaultValue,
        inputValue: defaultValue
    }));
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false, inputValue: '' }));
  };

  const handleConfirm = () => {
    const callback = modal.onConfirm;
    const value = modal.inputValue;
    const type = modal.type;

    // We close first so that if the callback opens a NEW modal, 
    // it will be the last state update processed.
    closeModal();
    
    if (callback) {
      if (type === 'prompt') {
          callback(value);
      } else {
          callback();
      }
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      {modal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }} className="animate-fade-in">
          <div style={{
            background: '#fff', borderRadius: '1.25rem', padding: '2rem',
            width: '100%', maxWidth: '420px', boxShadow: '0 40px 80px rgba(0,0,0,0.15)',
            position: 'relative', border: '1px solid rgba(0,0,0,0.05)'
          }} className="animate-slide-up">
            <button onClick={closeModal} style={{
              position: 'absolute', top: '1rem', right: '1rem', background: 'none',
              border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
            }}><X size={20} /></button>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px', 
                background: modal.type === 'alert' ? 'rgba(49, 184, 140, 0.1)' : 'rgba(4, 102, 69, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {modal.type === 'alert' ? <AlertCircle size={20} color="var(--accent-color)" /> : <HelpCircle size={20} color="var(--accent-color)" />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{modal.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{modal.message}</p>
              </div>
            </div>

            {modal.type === 'prompt' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  autoFocus
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
                  value={modal.inputValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModal(prev => ({ ...prev, inputValue: val }));
                  }}
                  placeholder="Enter value..."
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {(modal.type === 'confirm' || modal.type === 'prompt') && (
                <button className="btn btn-outline" style={{ flex: 1, padding: '0.6rem' }} onClick={closeModal}>Cancel</button>
              )}
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.6rem', background: 'var(--text-primary)' }} 
                onClick={handleConfirm}
              >
                {modal.type === 'alert' ? 'Understood' : 'Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
