'use client';
/* Shows what the app has saved in the browser cache (our "database" for now) */
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { useData } from '@/context/AppDataContext';
import { Avatar, Empty, I } from './ui';

const nice = k => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

export default function CacheInspector({ compact = false }) {
  useData();
  const info = Store.cacheInfo();
  const newUsers = Store.cachedUsers();
  return <div>
    <div className="d-flex flex-wrap gap-3 mb-3">
      <div className="p-3 rounded-3 soft-primary flex-grow-1"><div className="xsmall">Storage engine</div><div className="fw-semibold"><I n="hdd-stack" className="me-1" />Browser cache (localStorage)</div></div>
      <div className="p-3 rounded-3 soft-success flex-grow-1"><div className="xsmall">Saved collections</div><div className="fw-semibold">{info.collections.length}</div></div>
      <div className="p-3 rounded-3 soft-warning flex-grow-1"><div className="xsmall">Cache size</div><div className="fw-semibold">{U.fmtSize(info.total || 0)} / ~5 MB</div></div>
      <div className="p-3 rounded-3 soft-info flex-grow-1"><div className="xsmall">Accounts created here</div><div className="fw-semibold">{newUsers.length}</div></div>
    </div>
    <p className="small text-muted">No database is connected yet. Seed records come from <code>src/data/data.js</code>; everything you add or change (registrations, uploads, posts, approvals…) is stored in this browser’s cache, so it survives refreshes and is visible to every role on this device.</p>
    {newUsers.length > 0 && <>
      <h3 className="h6 fw-semibold mt-3">Accounts stored in cache</h3>
      <div className="table-responsive mb-3"><table className="table table-sm align-middle small mb-0"><thead><tr><th>User</th><th>Email</th><th>Password</th><th>Role</th><th>Created</th></tr></thead>
        <tbody>{newUsers.map(u => <tr key={u.id}><td><span className="d-flex align-items-center gap-2"><Avatar user={u} size={24} />{u.name}</span></td><td>{u.email}</td><td><code>{u.password}</code></td><td className="text-capitalize">{u.role}</td><td>{U.ago(u.joined)}</td></tr>)}</tbody></table></div>
    </>}
    <div className="row g-3">
      <div className={compact ? 'col-12' : 'col-lg-6'}>
        <h3 className="h6 fw-semibold">Cached collections</h3>
        {info.collections.length ? <div className="table-responsive"><table className="table table-sm align-middle small mb-0"><thead><tr><th>Collection</th><th>Records</th><th>Seed</th><th>Size</th></tr></thead>
          <tbody>{info.collections.map(c => <tr key={c.key}><td><code>ush:{c.key}</code><div className="xsmall text-muted">{nice(c.key)}</div></td><td>{c.records}</td><td className="text-muted">{c.seedCount}{c.records > c.seedCount && <span className="text-success ms-1">(+{c.records - c.seedCount})</span>}</td><td>{U.fmtSize(c.bytes)}</td></tr>)}</tbody></table></div>
          : <Empty icon="database" title="Cache is empty" text="Everything is still coming from data.js. Make a change and it will appear here." />}
      </div>
      <div className={compact ? 'col-12' : 'col-lg-6'}>
        <h3 className="h6 fw-semibold">Recent cache writes</h3>
        {info.log.length ? <div className="timeline small" style={{ maxHeight: 320, overflowY: 'auto' }}>{info.log.slice(0, compact ? 8 : 25).map((l, i) =>
          <div className="tl-item" key={i}><span className={`badge badge-soft-${l.action === 'create' ? 'success' : l.action === 'delete' ? 'danger' : 'primary'} me-1`}>{l.action}</span><code>{l.key}</code>{l.label && <> · {l.label}</>}<div className="xsmall text-muted">{U.ago(l.at)}</div></div>)}</div>
          : <p className="small text-muted">No writes yet.</p>}
      </div>
    </div>
  </div>;
}
