'use client';
/* STUDENT — Marketplace, Item details, Create/Edit listing, My exchange activity */
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Domain, Scoring } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import Form from '@/components/Form';
import { Avatar, Card, Chips, DataTable, Empty, I, Money, PageHeader, SearchInput, Select, Stat, StatusBadge, Tabs } from '@/components/ui';
import { useMessage, useReport } from '../shared';

const ICONS = { Books: 'book', Electronics: 'cpu', 'Lab Equipment': 'eyedropper', Stationery: 'pencil', Furniture: 'lamp', Clothing: 'bag', Sports: 'dribbble', Other: 'box-seam' };
const tone = s => ({ Available: 'success', Reserved: 'warning', Sold: 'secondary', Exchanged: 'secondary', Removed: 'danger' }[s] || 'secondary');

export function Thumb({ i, cls = 'thumb' }) {
  return <div className={cls}>{i.images && i.images.length ? <img src={i.images[0]} alt={i.title} /> : <I n={i.icon || 'box-seam'} />}{cls === 'thumb' && <span className="badge bg-white text-dark shadow-sm">{i.category}</span>}</div>;
}

function useRequest() {
  const me = useMe(); const { formModal, toast } = useUI();
  return i => formModal({
    title: <><I n="send" className="me-2" />Request “{i.title}”</>, submitText: 'Send request',
    intro: <div className="d-flex gap-3 align-items-center p-2 rounded-3 border mb-3"><Thumb i={i} cls="thumb-sm" /><div className="small"><div className="fw-semibold">{i.title}</div><div><Money price={i.price} isFree={i.isFree} /> · {i.condition}</div></div></div>,
    fields: [{ name: 'message', label: 'Message to owner', type: 'textarea', rows: 3, required: true, minlength: 10, value: `Hi ${U.user(i.ownerId)?.name.split(' ')[0]}, is “${i.title}” still available? I can meet on campus.` },
      { name: 'offer', label: i.isFree ? 'Offer (free item)' : `Your offer (${U.settings().currency})`, type: 'number', min: 0, value: String(i.price), disabled: i.isFree }],
    onSubmit: v => {
      Store.add('itemRequests', { itemId: i.id, requesterId: me.id, message: v.message, offer: i.isFree ? 0 : +v.offer || 0, status: 'pending', date: new Date().toISOString() }, 'r');
      Store.notify(i.ownerId, 'New request for your listing', `${me.name} sent a request for “${i.title}”.`, 'Exchange', '/student/exchange/my-activity');
      const c = Domain.conversationWith(me.id, i.ownerId);
      c.messages.push({ id: 'mg' + Date.now(), senderId: me.id, text: `[Item request · ${i.title}] ${v.message}`, date: new Date().toISOString(), read: false });
      Store.save('conversations', 'item request message');
      toast('Request sent! The owner has been notified.');
    }
  });
}

function ItemCard({ i, me }) {
  const message = useMessage();
  const o = U.user(i.ownerId) || {};
  return <div className="col-sm-6 col-xl-4"><div className="card h-100 hover-lift">
    <Link href={`/student/exchange/${i.id}`} className="text-reset"><Thumb i={i} /></Link>
    <div className="card-body d-flex flex-column">
      <div className="d-flex justify-content-between gap-2 mb-1"><Link href={`/student/exchange/${i.id}`} className="fw-semibold text-reset">{i.title}</Link>{i.featured && <I n="star-fill" className="text-warning" />}</div>
      <div className="d-flex align-items-center gap-2 mb-2"><span className="fs-5 fw-bold"><Money price={i.price} isFree={i.isFree} /></span><span className="badge badge-soft-secondary">{i.condition}</span><span className={`badge badge-soft-${tone(i.status)} ms-auto`}>{i.status}</span></div>
      <p className="small text-muted flex-grow-1 mb-2">{U.truncate(i.description, 90)}</p>
      <div className="d-flex align-items-center gap-2 small mb-3"><Avatar user={o} size={24} /><span className="text-truncate">{o.name}</span><span className="ms-auto xsmall text-muted text-nowrap">{U.ago(i.date)}</span></div>
      <div className="d-flex gap-2"><Link href={`/student/exchange/${i.id}`} className="btn btn-sm btn-light flex-grow-1">View details</Link>{i.ownerId === me.id ? <Link href="/student/exchange/my-activity" className="btn btn-sm btn-soft">Manage</Link> : <button className="btn btn-sm btn-primary" onClick={() => message(i.ownerId)}><I n="chat-dots" className="me-1" />Contact</button>}</div>
    </div></div></div>;
}

export function Marketplace() {
  const me = useMe();
  const [f, setF] = useState({ q: '', cat: '', price: '', cond: '', sort: 'recent', availableOnly: true, free: false });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const priceOk = i => !f.price || (f.price === 'free' ? i.isFree : f.price === '0-15' ? i.price > 0 && i.price <= 15 : f.price === '15-40' ? i.price > 15 && i.price <= 40 : i.price > 40);
  const sorts = { recent: (a, b) => new Date(b.date) - new Date(a.date), low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, popular: (a, b) => b.views - a.views };
  const list = Store.where('marketplaceItems', i => i.status !== 'Removed' && (!f.availableOnly || i.status === 'Available') && (!f.free || i.isFree) && (!f.cat || i.category === f.cat) && (!f.cond || i.condition === f.cond) && priceOk(i) && U.match(f.q, i.title, i.description, i.category)).sort(sorts[f.sort]);
  const featured = Store.where('marketplaceItems', i => i.featured && i.status === 'Available').slice(0, 3);
  const pending = Store.where('itemRequests', r => r.status === 'pending' && Store.find('marketplaceItems', r.itemId)?.ownerId === me.id).length;
  return <>
    <PageHeader title="Student Exchange Corner" subtitle="Buy, sell, exchange or give away items within the university community.">
      <Link href="/student/exchange/my-activity" className="btn btn-light"><I n="arrow-left-right" className="me-1" />My activity {pending > 0 && <span className="badge bg-danger rounded-pill">{pending}</span>}</Link><Link href="/student/exchange/create" className="btn btn-primary"><I n="plus-lg" className="me-1" />Create listing</Link></PageHeader>
    {featured.length > 0 && <><h2 className="h6 fw-semibold mb-3"><I n="star-fill" className="text-warning me-1" />Featured items</h2><div className="row g-3 mb-4">{featured.map(i => <div className="col-md-4" key={i.id}><Link href={`/student/exchange/${i.id}`} className="card hover-lift text-reset d-flex flex-row align-items-center gap-3 p-3"><Thumb i={i} cls="thumb-sm" /><div className="min-w-0"><div className="fw-semibold small text-truncate">{i.title}</div><div className="small"><Money price={i.price} isFree={i.isFree} /> · <span className="text-muted">{i.condition}</span></div></div><I n="chevron-right" className="ms-auto text-muted" /></Link></div>)}</div></>}
    <div className="card mb-3"><div className="card-body">
      <div className="d-flex flex-wrap gap-2 mb-3"><Chips items={Store.obj('marketplaceCategories').map(c => ({ value: c, label: c, icon: ICONS[c] }))} active={f.cat} onChange={v => set('cat', v)} />
        <button className={`chip chip-btn ${f.free ? 'active' : ''}`} onClick={() => set('free', !f.free)}><I n="gift" />Free items ({Store.where('marketplaceItems', i => i.isFree && i.status === 'Available').length})</button></div>
      <div className="row g-2">
        <div className="col-lg-4"><SearchInput value={f.q} onChange={v => set('q', v)} placeholder="Search items…" /></div>
        <div className="col-6 col-lg-2"><Select className="form-select" value={f.price} onChange={v => set('price', v)} all="Any price" options={[{ value: 'free', label: 'Free' }, { value: '0-15', label: 'Up to 15' }, { value: '15-40', label: '15 – 40' }, { value: '40+', label: 'Above 40' }]} /></div>
        <div className="col-6 col-lg-2"><Select className="form-select" value={f.cond} onChange={v => set('cond', v)} all="Any condition" options={['New', 'Like New', 'Good', 'Fair']} /></div>
        <div className="col-6 col-lg-2"><Select className="form-select" value={f.sort} onChange={v => set('sort', v)} label="Sort" options={[{ value: 'recent', label: 'Recently added' }, { value: 'low', label: 'Price: low to high' }, { value: 'high', label: 'Price: high to low' }, { value: 'popular', label: 'Most viewed' }]} /></div>
        <div className="col-6 col-lg-2 d-flex align-items-center"><div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" id="avOnly" checked={f.availableOnly} onChange={e => set('availableOnly', e.target.checked)} /><label className="form-check-label small" htmlFor="avOnly">Available only</label></div></div>
      </div></div></div>
    <div className="small text-muted mb-2">{U.plural(list.length, 'item')}</div>
    <div className="row g-3">{list.length ? list.map(i => <ItemCard key={i.id} i={i} me={me} />) : <div className="col-12"><Empty icon="shop" title="No items match your filters" text="Try another category or price range — or list something yourself!"><Link href="/student/exchange/create" className="btn btn-sm btn-primary">Create listing</Link></Empty></div>}</div>
  </>;
}

export function ItemDetails() {
  const me = useMe();
  const { itemId } = useParams();
  const message = useMessage();
  const request = useRequest();
  const report = useReport();
  const [img, setImg] = useState(0);
  const i = Store.find('marketplaceItems', itemId);
  useEffect(() => {
    if (i && i.ownerId !== me.id && !sessionStorage.getItem('iv_' + i.id)) { sessionStorage.setItem('iv_' + i.id, 1); Store.update('marketplaceItems', i.id, x => { x.views++; }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);
  if (!i || i.status === 'Removed') return <Empty icon="box" title="Listing not available" text="It may have been removed by the owner or a moderator."><Link className="btn btn-primary" href="/student/exchange">Back to marketplace</Link></Empty>;
  const o = U.user(i.ownerId) || {};
  const mine = i.ownerId === me.id;
  const myReq = Store.all('itemRequests').find(r => r.itemId === i.id && r.requesterId === me.id);
  const similar = Store.where('marketplaceItems', x => x.id !== i.id && x.category === i.category && x.status === 'Available').slice(0, 3);
  let action;
  if (mine) action = <><Link href={`/student/exchange/create?edit=${i.id}`} className="btn btn-primary flex-grow-1"><I n="pencil" className="me-1" />Edit listing</Link><Link href="/student/exchange/my-activity" className="btn btn-light">Manage requests ({Store.where('itemRequests', r => r.itemId === i.id).length})</Link></>;
  else if (myReq) action = <div className={`alert alert-${myReq.status === 'accepted' ? 'success' : myReq.status === 'rejected' ? 'secondary' : 'info'} small mb-0 flex-grow-1`}><I n="info-circle" className="me-1" />Your request is <strong>{myReq.status}</strong>{myReq.status === 'pending' ? ' — the owner will respond soon.' : '.'}</div>;
  else if (i.status !== 'Available') action = <div className="alert alert-secondary small mb-0 flex-grow-1">This item is {i.status.toLowerCase()} and no longer accepting requests.</div>;
  else action = <button className="btn btn-primary btn-lg flex-grow-1" onClick={() => request(i)}><I n="send" className="me-1" />Send request</button>;
  return <div className="row g-4">
    <div className="col-lg-7">
      <div className="gallery-main mb-2">{i.images && i.images.length ? <img src={i.images[img]} alt={i.title} /> : <I n={i.icon || 'box-seam'} />}</div>
      {i.images && i.images.length > 1 ? <div className="gallery-thumbs d-flex gap-2">{i.images.map((src, k) => <img key={k} src={src} className={k === img ? 'active' : ''} onClick={() => setImg(k)} alt={`Photo ${k + 1}`} />)}</div> : (!i.images || !i.images.length) && <p className="xsmall text-muted">The owner has not uploaded photos for this item.</p>}
      <div className="card mt-4"><div className="card-body"><h2 className="h6 fw-semibold">Description</h2><p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{i.description}</p></div></div>
    </div>
    <div className="col-lg-5"><div className="sticky-side d-grid gap-4">
      <div className="card"><div className="card-body p-4">
        <div className="d-flex flex-wrap gap-2 mb-2"><span className={`badge badge-soft-${tone(i.status)}`}>{i.status}</span><span className="badge badge-soft-primary">{i.category}</span>{i.featured && <span className="badge badge-soft-warning"><I n="star-fill" className="me-1" />Featured</span>}</div>
        <h1 className="h3 fw-bold">{i.title}</h1><div className="display-6 fw-bold mb-3"><Money price={i.price} isFree={i.isFree} /></div>
        <div className="row g-2 small mb-4">{[['Condition', i.condition], ['Category', i.category], ['Listed', U.date(i.date)], ['Views', i.views]].map(([l, v]) => <div className="col-6" key={l}><div className="p-2 rounded-3 border"><div className="xsmall text-muted">{l}</div><div className="fw-semibold">{v}</div></div></div>)}</div>
        <div className="d-flex flex-wrap gap-2">{action}</div>
        {!mine && <button className="btn btn-link btn-sm text-danger px-0 mt-2" onClick={() => report('listing', i.id, ['Misleading description', 'Prohibited item', 'Suspected scam', 'Duplicate listing', 'Other'])}><I n="flag" className="me-1" />Report this listing</button>}
      </div></div>
      <div className="card"><div className="card-body"><h2 className="h6 fw-semibold mb-3">Owner</h2><div className="d-flex align-items-center gap-3 mb-3"><Avatar user={o} size={48} /><div><div className="fw-semibold">{o.name}</div><div className="small text-muted">{U.dept(o.department)} · Semester {o.semester}</div><div className="xsmall text-muted">{Store.where('marketplaceItems', x => x.ownerId === o.id).length} listings · member since {new Date(o.joined).getFullYear()}</div></div></div>
        <div className="small d-grid gap-2 mb-3">{(i.contactPref || []).map(c => <div key={c}><I n={c === 'Message' ? 'chat-dots' : c === 'Email' ? 'envelope' : 'telephone'} className="me-2 text-primary" />{c === 'Message' ? 'In-app message' : c === 'Email' ? o.email : (i.phone || o.phone || 'Shared on request')}</div>)}</div>
        {!mine && <button className="btn btn-light w-100" onClick={() => message(o.id)}><I n="chat-dots" className="me-1" />Contact owner</button>}</div></div>
      <Card title="Similar items" bodyClass="py-1">{similar.length ? similar.map(x => <Link key={x.id} href={`/student/exchange/${x.id}`} className="list-row text-reset"><Thumb i={x} cls="thumb-sm" /><div className="min-w-0"><div className="small fw-semibold text-truncate">{x.title}</div><div className="small"><Money price={x.price} isFree={x.isFree} /> · <span className="text-muted">{x.condition}</span></div></div></Link>) : <p className="small text-muted mb-0 py-2">No similar items right now.</p>}</Card>
    </div></div>
  </div>;
}

export function CreateListing() {
  const me = useMe();
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useUI();
  const edit = sp.get('edit') ? Store.find('marketplaceItems', sp.get('edit')) : null;
  const [images, setImages] = useState(edit ? [...(edit.images || [])] : []);
  useEffect(() => { if (edit && edit.ownerId !== me.id) router.replace('/student/exchange'); }, [edit, me.id, router]);
  const fields = [
    { name: 'title', label: 'Item name', required: true, minlength: 3, value: edit?.title, placeholder: 'e.g. Calculus textbook, 8th edition' },
    { name: 'category', label: 'Category', type: 'select', required: true, col: 'col-md-6', value: edit?.category, options: Store.obj('marketplaceCategories') },
    { name: 'condition', label: 'Condition', type: 'select', required: true, col: 'col-md-6', value: edit?.condition, options: ['New', 'Like New', 'Good', 'Fair'] },
    { name: 'description', label: 'Description', type: 'textarea', required: true, minlength: 15, rows: 4, value: edit?.description, placeholder: 'Include edition, defects, accessories and pickup location.' },
    { name: 'price', label: `Price (${U.settings().currency})`, type: 'number', min: 0, step: '0.5', col: 'col-md-6', value: edit ? String(edit.price) : '', disabled: v => v.isFree, validate: (v, all) => all.isFree || v !== '' ? '' : 'Enter a price or mark the item as free.' },
    { name: 'isFree', label: 'This item is free (give-away)', type: 'switch', col: 'col-md-6 d-flex align-items-end pb-2', value: !!edit?.isFree },
    { name: 'contact', label: 'Contact preferences', type: 'checkboxes', required: true, value: edit?.contactPref || ['Message'], options: ['Message', 'Email', 'Phone'] },
    { name: 'phone', label: 'Phone number', type: 'tel', value: edit?.phone, help: 'Only shown if you select Phone.', validate: (v, all) => (all.contact || []).includes('Phone') && !v ? 'Phone number is required when Phone is selected.' : '' }];
  const addImages = async e => {
    const next = [...images];
    for (const f of e.target.files) {
      if (next.length >= 3) { toast('Maximum 3 images per listing.', 'warning'); break; }
      if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) { toast(`${f.name}: only PNG, JPG or WEBP.`, 'warning'); continue; }
      if (f.size > 800 * 1024) { toast(`${f.name} is larger than 800 KB (demo limit).`, 'warning'); continue; }
      next.push(await U.readFile(f));
    }
    e.target.value = ''; setImages(next);
  };
  const submit = v => {
    const data = { title: v.title, category: v.category, condition: v.condition, description: v.description, price: v.isFree ? 0 : +v.price, isFree: v.isFree || +v.price === 0, contactPref: v.contact, phone: v.phone, images, icon: ICONS[v.category] || 'box-seam' };
    let id = edit?.id;
    if (id) { Store.update('marketplaceItems', id, data); toast('Listing updated.'); }
    else { const it = Store.add('marketplaceItems', { ...data, ownerId: me.id, status: 'Available', date: new Date().toISOString(), featured: false, views: 0, reported: false }, 'i'); if (!it) return; id = it.id; toast('Your listing is live in the marketplace!'); }
    router.push('/student/exchange/' + id);
  };
  return <>
    <PageHeader title={edit ? 'Edit listing' : 'Create a listing'} subtitle={edit ? 'Update the details of your item.' : 'Sell, exchange or give away something useful to fellow students.'} />
    <div className="row g-4"><div className="col-lg-8"><div className="card"><div className="card-body p-4">
      <Form fields={fields} onSubmit={submit} submitText={edit ? 'Save changes' : 'Publish listing'} onCancel={() => router.push(edit ? '/student/exchange/my-activity' : '/student/exchange')} footerClass="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
        <div className="mt-3"><label className="form-label">Photos <span className="text-muted fw-normal">(up to 3)</span></label>
          <div className="upload-preview d-flex flex-wrap gap-2 mb-2">{images.length ? images.map((src, k) => <div className="position-relative" key={k}><img src={src} alt={`Item photo ${k + 1}`} /><button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 py-0 px-1" onClick={() => setImages(images.filter((_, x) => x !== k))} aria-label="Remove image"><I n="x" /></button></div>) : <div className="small text-muted">No photos yet — items with photos get 3× more requests.</div>}</div>
          <label className="btn btn-light btn-sm"><I n="image" className="me-1" />Add photos<input type="file" accept="image/png,image/jpeg,image/webp" multiple className="d-none" onChange={addImages} /></label></div>
      </Form></div></div></div>
      <div className="col-lg-4"><Card title={<><I n="shield-check" className="me-2 text-success" />Safe exchange tips</>}><ul className="small ps-3 mb-0 d-grid gap-2"><li>Meet in public campus spaces like the library or student centre.</li><li>Inspect items before paying.</li><li>Use in-app messages to keep a record.</li><li>Prohibited: exam material, weapons, alcohol, counterfeit goods.</li></ul></Card></div></div>
  </>;
}

export function MyExchange() {
  const me = useMe();
  const { confirm, toast } = useUI();
  const message = useMessage();
  const [tab, setTab] = useState('listings');
  const mine = Store.where('marketplaceItems', i => i.ownerId === me.id && i.status !== 'Removed');
  const ids = mine.map(i => i.id);
  const incoming = Store.where('itemRequests', r => ids.includes(r.itemId)).sort((a, b) => new Date(b.date) - new Date(a.date));
  const sent = Store.where('itemRequests', r => r.requesterId === me.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const reserved = [...mine.filter(i => i.status === 'Reserved'), ...sent.filter(r => r.status === 'accepted').map(r => Store.find('marketplaceItems', r.itemId)).filter(i => i && i.status === 'Reserved')];
  const done = mine.filter(i => ['Sold', 'Exchanged'].includes(i.status));
  const setStatus = (id, status) => {
    Store.update('marketplaceItems', id, { status });
    if (status === 'Available') { Store.where('itemRequests', r => r.itemId === id && r.status === 'accepted').forEach(r => { r.status = 'rejected'; }); Store.save('itemRequests'); }
    toast(['Sold', 'Exchanged'].includes(status) ? `Marked as ${status.toLowerCase()} — +${Scoring.rules().exchangeCompleted} exchange points!` : `Listing status updated to ${status}.`);
  };
  const del = id => confirm('Delete this listing permanently? Pending requests will be cancelled.', () => { Store.remove('marketplaceItems', id); Store.removeWhere('itemRequests', r => r.itemId === id); toast('Listing deleted.', 'info'); }, { danger: true, okText: 'Delete listing' });
  const respond = (rid, accept) => {
    const r = Store.find('itemRequests', rid); const it = Store.find('marketplaceItems', r.itemId);
    r.status = accept ? 'accepted' : 'rejected';
    if (accept) { it.status = 'Reserved'; Store.where('itemRequests', x => x.itemId === it.id && x.id !== rid && x.status === 'pending').forEach(x => { x.status = 'rejected'; Store.notify(x.requesterId, 'Request declined', `“${it.title}” has been reserved for another student.`, 'Exchange', '/student/exchange/my-activity'); }); Store.save('marketplaceItems'); }
    Store.save('itemRequests');
    Store.notify(r.requesterId, accept ? 'Request accepted 🎉' : 'Request declined', accept ? `${me.name} accepted your request for “${it.title}”. Arrange pickup via messages.` : `Your request for “${it.title}” was declined.`, 'Exchange', '/student/exchange/my-activity');
    toast(accept ? 'Request accepted — the item is now reserved.' : 'Request declined.', accept ? 'success' : 'info');
  };
  const cancel = rid => confirm('Cancel this request?', () => { Store.remove('itemRequests', rid); toast('Request cancelled.', 'info'); }, { okText: 'Cancel request', danger: true });
  const ItemCell = ({ i }) => i ? <div className="d-flex align-items-center gap-2 text-start"><Thumb i={i} cls="thumb-sm" /><div className="min-w-0"><Link href={`/student/exchange/${i.id}`} className="fw-semibold small text-reset">{i.title}</Link><div className="xsmall text-muted"><Money price={i.price} isFree={i.isFree} /> · {i.category}</div></div></div> : <span className="text-muted small">Listing removed</span>;
  let body;
  if (tab === 'listings') body = <DataTable rows={mine} empty="You have no listings yet." cols={[
    { label: 'Item', render: i => <ItemCell i={i} /> }, { label: 'Listed', render: i => <span className="small">{U.date(i.date)}</span> },
    { label: 'Requests', render: i => incoming.filter(r => r.itemId === i.id && r.status === 'pending').length },
    { label: 'Status', render: i => <select className="form-select form-select-sm" style={{ minWidth: 130 }} value={i.status} onChange={e => setStatus(i.id, e.target.value)} aria-label="Listing status">{['Available', 'Reserved', 'Sold', 'Exchanged'].map(s => <option key={s}>{s}</option>)}</select> },
    { label: '', render: i => <div className="d-flex gap-1 justify-content-end"><Link className="btn btn-sm btn-light" href={`/student/exchange/create?edit=${i.id}`} title="Edit"><I n="pencil" /></Link><button className="btn btn-sm btn-light text-danger" onClick={() => del(i.id)} title="Delete"><I n="trash" /></button></div> }]} />;
  else if (tab === 'incoming') body = <DataTable rows={incoming} empty="No requests for your listings yet." cols={[
    { label: 'Item', render: r => <ItemCell i={Store.find('marketplaceItems', r.itemId)} /> },
    { label: 'From', render: r => <div className="d-flex align-items-center gap-2"><Avatar user={U.user(r.requesterId)} size={28} /><span className="small">{U.user(r.requesterId)?.name}</span></div> },
    { label: 'Message', render: r => <span className="small">{U.truncate(r.message, 70)}</span> }, { label: 'Offer', render: r => <Money price={r.offer} isFree={!r.offer} /> },
    { label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { label: '', render: r => r.status === 'pending' ? <div className="d-flex gap-1 justify-content-end"><button className="btn btn-sm btn-success" onClick={() => respond(r.id, true)}>Accept</button><button className="btn btn-sm btn-light" onClick={() => respond(r.id, false)}>Decline</button></div> : <button className="btn btn-sm btn-light" onClick={() => message(r.requesterId)} aria-label="Message"><I n="chat-dots" /></button> }]} />;
  else if (tab === 'sent') body = <DataTable rows={sent} empty="You have not requested any items." cols={[
    { label: 'Item', render: r => <ItemCell i={Store.find('marketplaceItems', r.itemId)} /> },
    { label: 'Owner', render: r => U.user(Store.find('marketplaceItems', r.itemId)?.ownerId)?.name || '—' },
    { label: 'Sent', render: r => <span className="small">{U.ago(r.date)}</span> }, { label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { label: '', render: r => { const it = Store.find('marketplaceItems', r.itemId); return <div className="d-flex gap-1 justify-content-end">{it && <button className="btn btn-sm btn-light" onClick={() => message(it.ownerId)} title="Message owner"><I n="chat-dots" /></button>}{r.status === 'pending' && <button className="btn btn-sm btn-light text-danger" onClick={() => cancel(r.id)}>Cancel</button>}</div>; } }]} />;
  else if (tab === 'reserved') body = reserved.length ? reserved.map(i => <div className="list-row flex-wrap" key={i.id}><ItemCell i={i} /><span className="ms-auto small text-muted">{i.ownerId === me.id ? 'Reserved by you for a buyer' : 'Reserved for you by ' + U.user(i.ownerId)?.name}</span>
    {i.ownerId === me.id ? <><button className="btn btn-sm btn-success" onClick={() => setStatus(i.id, 'Sold')}>Mark sold</button><button className="btn btn-sm btn-light" onClick={() => setStatus(i.id, 'Exchanged')}>Mark exchanged</button></> : <button className="btn btn-sm btn-light" onClick={() => message(i.ownerId)}>Message</button>}</div>) : <Empty icon="bookmark" title="No reserved items" />;
  else body = done.length ? done.map(i => <div className="list-row" key={i.id}><ItemCell i={i} /><span className="ms-auto"><StatusBadge status={i.status} /></span><button className="btn btn-sm btn-light" onClick={() => setStatus(i.id, 'Available')}>Relist</button></div>) : <Empty icon="bag-check" title="No completed exchanges yet" />;
  return <>
    <PageHeader title="My Exchange Activity" subtitle="Manage your listings and item requests."><Link href="/student/exchange/create" className="btn btn-primary"><I n="plus-lg" className="me-1" />New listing</Link></PageHeader>
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-3"><Stat icon="tags" label="Active listings" value={mine.filter(i => i.status === 'Available').length} /></div>
      <div className="col-6 col-lg-3"><Stat icon="inbox" label="Pending requests" value={incoming.filter(r => r.status === 'pending').length} tone="warning" /></div>
      <div className="col-6 col-lg-3"><Stat icon="send" label="Requests sent" value={sent.length} tone="info" /></div>
      <div className="col-6 col-lg-3"><Stat icon="recycle" label="Completed exchanges" value={done.length} tone="success" /></div></div>
    <Tabs active={tab} onChange={setTab} items={[{ key: 'listings', label: 'My listings', count: mine.length }, { key: 'incoming', label: 'Incoming requests', count: incoming.filter(r => r.status === 'pending').length }, { key: 'sent', label: 'Sent requests', count: sent.length }, { key: 'reserved', label: 'Reserved', count: reserved.length }, { key: 'done', label: 'Sold / exchanged', count: done.length }]} />
    <div className="card"><div className="card-body">{body}</div></div>
  </>;
}
