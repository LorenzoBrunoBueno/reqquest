import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div id="toast" className={`toast${visible ? '' : ' hidden'}`}>{message}</div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
