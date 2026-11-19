'use client';
/* Toasts, modal dialogs, confirmation dialogs and form modals */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Form from '@/components/Form';
import Store from '@/lib/storage';

const UICtx = createContext(null);
const icons = { success: 'check-circle-fill', danger: 'x-octagon-fill', warning: 'exclamation-triangle-fill', info: 'info-circle-fill' };

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const idRef = useRef(0);

  const toast = useCallback((msg, type = 'success') => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600);
  }, []);
  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback(m => setModal(m), []);
  const confirm = useCallback((message, onYes, { title = 'Please confirm', okText = 'Confirm', danger = false } = {}) => {
    setModal({
      title: <><i className={`bi bi-${danger ? 'exclamation-triangle text-danger' : 'question-circle text-primary'} me-2`} />{title}</>,
      size: 'sm',
      body: <p className="mb-0">{message}</p>,
      footer: close => <><button className="btn btn-light" onClick={close}>Cancel</button><button className={`btn btn-${danger ? 'danger' : 'primary'}`} onClick={() => { close(); onYes(); }}>{okText}</button></>
    });
  }, []);
  const formModal = useCallback(({ title, fields, submitText = 'Save', size = '', intro = null, onSubmit }) => {
    setModal({
      title, size,
      body: close => <Form fields={fields} intro={intro} submitText={submitText} onCancel={close} footerClass="d-flex justify-content-end gap-2 mt-4 pt-3 border-top"
        onSubmit={async v => { const r = await onSubmit(v); if (r === false || (r && r.errors)) return r; close(); }} />
    });
  }, []);

  useEffect(() => { Store.setErrorHandler(m => toast(m, 'danger')); }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const onKey = e => { if (e.key === 'Escape') setModal(null); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('modal-open'); };
  }, [modal]);

  return (
    <UICtx.Provider value={{ toast, openModal, closeModal, confirm, formModal }}>
      {children}
      {modal && <>
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${modal.size ? 'modal-' + modal.size : ''}`}>
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title fw-semibold">{modal.title}</h5><button type="button" className="btn-close" aria-label="Close" onClick={closeModal} /></div>
              <div className="modal-body">{typeof modal.body === 'function' ? modal.body(closeModal) : modal.body}</div>
              {modal.footer && <div className="modal-footer">{typeof modal.footer === 'function' ? modal.footer(closeModal) : modal.footer}</div>}
            </div>
          </div>
        </div>
        <div className="modal-backdrop show" />
      </>}
      <div className="toast-host" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast show align-items-center border-0 toast-${t.type}`} role="status">
            <div className="d-flex"><div className="toast-body d-flex gap-2 align-items-start"><i className={`bi bi-${icons[t.type] || icons.info}`} /><span>{t.msg}</span></div>
              <button type="button" className="btn-close me-2 m-auto" aria-label="Close" onClick={() => setToasts(x => x.filter(y => y.id !== t.id))} /></div>
          </div>))}
      </div>
    </UICtx.Provider>
  );
}

export const useUI = () => useContext(UICtx);
