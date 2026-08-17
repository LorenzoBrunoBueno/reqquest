import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [content, setContent] = useState(null);

  const open = useCallback((node) => setContent(node), []);
  const close = useCallback(() => setContent(null), []);

  return (
    <ModalContext.Provider value={{ open, close, isOpen: content != null }}>
      {children}
      {content != null && createPortal(
        <div
          className="modal-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="modal">{content}</div>
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal precisa estar dentro de <ModalProvider>');
  return ctx;
}
