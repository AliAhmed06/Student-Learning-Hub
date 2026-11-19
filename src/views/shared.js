'use client';
/* Helpers & small components shared by several portal pages */
import { useRouter } from 'next/navigation';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Domain } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { I } from '@/components/ui';

export const deptOptions = () => Store.all('departments').map(d => ({ value: d.id, label: d.name }));
export const semOptions = () => Store.all('semesters').map(s => ({ value: String(s.id), label: s.name }));
export const courseOptions = (list = Store.all('courses')) => list.map(c => ({ value: c.id, label: `${c.code} · ${c.title}` }));

/** open (or create) a conversation with another user */
export function useMessage() {
  const me = useMe(); const router = useRouter(); const { toast } = useUI();
  return userId => {
    if (userId === me.id) return toast('That is your own post.', 'info');
    const c = Domain.conversationWith(me.id, userId);
    router.push('/student/messages?c=' + c.id);
  };
}

/** report modal for any content type */
export function useReport() {
  const me = useMe(); const { formModal, toast } = useUI();
  return (type, id, reasons = ['Spam', 'Harassment or bullying', 'Academic dishonesty', 'Misinformation', 'Copyright / plagiarism', 'Inappropriate content', 'Other']) => formModal({
    title: <><I n="flag" className="me-2 text-danger" />Report {type}</>, submitText: 'Submit report',
    fields: [{ name: 'reason', label: 'Reason', type: 'select', required: true, options: reasons }, { name: 'details', label: 'Additional details', type: 'textarea', rows: 3 }],
    onSubmit: v => { Domain.report(type, id, me.id, v.reason + (v.details ? ' — ' + v.details : '')); toast('Report submitted. Moderators will review it shortly.'); }
  });
}

/** Viewer for faculty study materials */
export function useMaterialViewer() {
  const me = useMe(); const { openModal, toast, closeModal } = useUI();
  const download = m => {
    if (m.file && m.file.dataUrl) U.download(m.file.name, m.file.dataUrl);
    else U.download(U.slug(m.title) + '.txt', Domain.materialText(m));
    toast('Download started.');
  };
  const view = id => {
    const m = Store.find('studyMaterials', id);
    const c = U.course(m.courseId) || {};
    const isStudent = me && me.role === 'student';
    let preview = <div className="reader-page reader"><h3 className="mt-0">{m.title}</h3><p className="text-muted">{m.description}</p><p>{m.content || 'Preview not available.'}</p></div>;
    if (m.file && m.file.dataUrl && /pdf/.test(m.file.type)) preview = <iframe className="reader-frame" src={m.file.dataUrl} title={m.title} />;
    else if (m.file && m.file.dataUrl && /^image\//.test(m.file.type)) preview = <img src={m.file.dataUrl} className="img-fluid rounded" alt={m.title} />;
    else if (m.file && m.file.text) preview = <pre className="reader-page small" style={{ whiteSpace: 'pre-wrap' }}>{m.file.text}</pre>;
    openModal({
      title: <><i className={U.fileIcon(m.fileType) + ' me-2'} />{m.title}</>, size: 'lg',
      body: <><div className="d-flex flex-wrap gap-2 mb-3 small"><span className="badge badge-soft-primary">{m.type}</span><span className="chip">{c.code} · {c.title}</span><span className="chip">{m.fileType} · {m.size}</span><span className="chip">{U.user(m.uploadedBy)?.name}</span><span className="chip">{U.date(m.date)}</span></div>{preview}</>,
      footer: <>{isStudent && <button className="btn btn-light" onClick={() => { const a = Store.toggleUs(me.id, 'savedResources', id); toast(a ? 'Saved to your resources.' : 'Removed from saved resources.', a ? 'success' : 'info'); closeModal(); }}><I n={`bookmark${Store.us(me.id).savedResources.includes(id) ? '-fill' : ''}`} className="me-1" />{Store.us(me.id).savedResources.includes(id) ? 'Saved' : 'Save'}</button>}
        <button className="btn btn-primary" onClick={() => download(m)}><I n="download" className="me-1" />Download</button></>
    });
  };
  return { view, download };
}

export const catIcon = c => (Store.all('achievementCategories').find(x => x.id === c) || {}).icon || 'award';

/** Achievement evidence viewer (student / faculty / admin) */
export function useEvidence() {
  const { openModal } = useUI();
  return id => {
    const a = Store.find('achievements', id);
    const ev = a.evidence || {};
    let body;
    if (ev.dataUrl && /^image\//.test(ev.type)) body = <img src={ev.dataUrl} className="img-fluid rounded border" alt={`Evidence for ${a.title}`} />;
    else if (ev.dataUrl && /pdf/.test(ev.type)) body = <iframe className="reader-frame" src={ev.dataUrl} title="Evidence" />;
    else body = <div className="reader-page text-center"><I n="file-earmark-check" className="display-4 text-primary" /><h3 className="h5 mt-3">{ev.name || 'evidence.pdf'}</h3>
      <div className="border rounded-3 p-4 mt-3 mx-auto text-start" style={{ maxWidth: 460, background: 'linear-gradient(135deg,var(--hub-lav),transparent)' }}>
        <div className="xsmall text-uppercase text-muted fw-semibold">Certificate of {a.category === 'Competition' ? 'Achievement' : a.category}</div>
        <div className="h5 fw-bold my-2">{a.title}</div><div className="small">Awarded to <strong>{U.user(a.studentId)?.name}</strong></div>
        <div className="small text-muted mt-2">{a.details}</div><div className="small mt-2">Date: {U.date(a.date)}</div></div>
      <p className="xsmall text-muted mt-3 mb-0">Sample evidence preview generated from seeded demo data.</p></div>;
    openModal({ title: <><I n="paperclip" className="me-2" />Evidence — {a.title}</>, size: 'lg', body,
      footer: ev.dataUrl ? <button className="btn btn-primary" onClick={() => U.download(ev.name, ev.dataUrl)}><I n="download" className="me-1" />Download</button> : null });
  };
}
