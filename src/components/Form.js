'use client';
/* ==========================================================================
   Form — schema-driven form with validation (used by pages and modals)
   field: { name, label, type, required, value, options, placeholder, help,
            col, rows, min, max, step, minlength, maxlength, accept, exts,
            maxSize, maxFiles, multiple, disabled, validate(v, values),
            onChange(v, set) }
   ========================================================================== */
import { useState, useRef } from 'react';
import U from '@/lib/utils';

const initial = fields => Object.fromEntries(fields.map(f => [f.name, f.value ?? (f.type === 'checkboxes' ? [] : f.type === 'switch' ? false : f.type === 'file' ? null : '')]));

export function validateFields(fields, values) {
  const errors = {};
  for (const f of fields) {
    const v = values[f.name];
    const disabled = typeof f.disabled === 'function' ? f.disabled(values) : f.disabled;
    if (disabled || f.hidden) continue;
    const label = typeof f.label === 'string' ? f.label : 'This field';
    let err = '';
    const empty = v === '' || v === null || v === undefined || (Array.isArray(v) && !v.length);
    if (f.required && empty) err = `${label} is required.`;
    else if (!empty && f.type === 'email' && !U.validEmail(v)) err = 'Enter a valid email address.';
    else if (!empty && f.type === 'number' && f.min !== undefined && +v < f.min) err = `Must be at least ${f.min}.`;
    else if (!empty && f.minlength && String(v).length < f.minlength) err = `Must be at least ${f.minlength} characters.`;
    else if (f.type === 'file' && v) {
      const files = Array.isArray(v) ? v : [v];
      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (f.exts && !f.exts.includes(ext)) { err = `Unsupported file type .${ext}. Allowed: ${f.exts.join(', ')}`; break; }
        if (f.maxSize && file.size > f.maxSize) { err = `File is too large (max ${U.fmtSize(f.maxSize)} in this demo).`; break; }
      }
      if (!err && f.maxFiles && files.length > f.maxFiles) err = `Select up to ${f.maxFiles} files.`;
    }
    if (!err && f.validate) err = f.validate(v, values) || '';
    if (err) errors[f.name] = err;
  }
  return errors;
}

export function Field({ f, value, error, set, values }) {
  const id = 'f_' + f.name;
  const disabled = typeof f.disabled === 'function' ? f.disabled(values) : f.disabled;
  const cls = error ? ' is-invalid' : '';
  const label = <label className="form-label" htmlFor={id}>{f.label}{f.required && <span className="text-danger"> *</span>}</label>;
  const opts = (f.options || []).map(o => (typeof o === 'object' ? o : { value: o, label: o }));
  let input;
  switch (f.type) {
    case 'textarea':
      input = <textarea id={id} className={'form-control' + cls} rows={f.rows || 4} value={value} placeholder={f.placeholder} maxLength={f.maxlength} disabled={disabled} onChange={e => set(e.target.value)} />; break;
    case 'select':
      input = <select id={id} className={'form-select' + cls} value={value} disabled={disabled} onChange={e => set(e.target.value)}>
        {f.placeholder !== false && <option value="">{f.placeholder || 'Select…'}</option>}
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>; break;
    case 'checkboxes':
      input = <div className={'check-grid border rounded-3 p-2' + cls} id={id}>{opts.length ? opts.map((o, i) => (
        <div className="form-check" key={o.value}><input className="form-check-input" type="checkbox" id={`${id}_${i}`} checked={(value || []).includes(o.value)}
          onChange={e => set(e.target.checked ? [...(value || []), o.value] : (value || []).filter(x => x !== o.value))} /><label className="form-check-label small" htmlFor={`${id}_${i}`}>{o.label}</label></div>)) : <span className="text-muted small">No options available</span>}</div>; break;
    case 'switch':
      return <div className={f.col || 'col-12'}><div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" id={id} checked={!!value} disabled={disabled} onChange={e => set(e.target.checked)} /><label className="form-check-label" htmlFor={id}>{f.label}</label></div>{f.help && <div className="form-text">{f.help}</div>}</div>;
    case 'file':
      input = <input id={id} className={'form-control' + cls} type="file" accept={f.accept} multiple={f.multiple} disabled={disabled} onChange={e => set(f.multiple ? [...e.target.files] : e.target.files[0] || null)} />; break;
    default:
      input = <input id={id} className={'form-control' + cls} type={f.type || 'text'} value={value} placeholder={f.placeholder} min={f.min} max={f.max} step={f.step} disabled={disabled} autoComplete={f.autoComplete} onChange={e => set(e.target.value)} />;
  }
  return <div className={f.col || 'col-12'}>{label}{input}{error && <div className="invalid-feedback d-block">{error}</div>}{f.help && <div className="form-text">{f.help}</div>}</div>;
}

/** Full form. `children` render between fields and the buttons. */
export default function Form({ fields, onSubmit, submitText = 'Save', submitIcon = 'check2', onCancel, cancelText = 'Cancel', footerClass = 'd-flex justify-content-end gap-2 mt-4', children, intro, resetOnSubmit = false, values: controlled, setValues: setControlled }) {
  const [own, setOwn] = useState(() => initial(fields));
  const values = controlled || own;
  const setValues = setControlled || setOwn;
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);
  const set = (name, v) => {
    setValues(prev => {
      const next = { ...prev, [name]: v };
      const f = fields.find(x => x.name === name);
      if (f && f.onChange) f.onChange(v, (k, val) => { next[k] = val; }, next);
      return next;
    });
    setErrors(e => ({ ...e, [name]: undefined }));
  };
  const submit = async e => {
    e.preventDefault();
    const errs = validateFields(fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setTimeout(() => { const el = formRef.current && formRef.current.querySelector('.is-invalid'); if (el) el.focus(); }, 0);
      return;
    }
    setBusy(true);
    try {
      const res = await onSubmit(values, { setErrors });
      if (res && res.errors) setErrors(res.errors);
      else if (resetOnSubmit) { setValues(initial(fields)); if (formRef.current) formRef.current.reset(); }
    } finally { setBusy(false); }
  };
  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      {intro}
      <div className="row g-3">{fields.filter(f => !f.hidden).map(f => <Field key={f.name} f={f} value={values[f.name] ?? ''} error={errors[f.name]} values={values} set={v => set(f.name, v)} />)}</div>
      {children}
      <div className={footerClass}>
        {onCancel && <button type="button" className="btn btn-light" onClick={onCancel}>{cancelText}</button>}
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner-border spinner-border-sm me-1" /> : <i className={`bi bi-${submitIcon} me-1`} />}{submitText}</button>
      </div>
    </form>
  );
}
