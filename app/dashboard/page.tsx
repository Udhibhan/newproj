import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createGroupOrder, createSupplyRequest, joinGroupOrder, saveProfile } from '../actions';

function money(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 2 }).format(value);
}

function countByItem(rows: Array<{ item_name: string; quantity: number | null }>) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const key = row.item_name.trim().toLowerCase();
    map.set(key, (map.get(key) ?? 0) + (row.quantity ?? 0));
  });
  return [...map.entries()].map(([item, qty]) => ({ item, qty }));
}

function likelySupplier(item: string, suppliers: Array<{ name: string; category: string; notes: string | null }>) {
  const lower = item.toLowerCase();
  return suppliers
    .filter((supplier) => {
      const text = `${supplier.name} ${supplier.category} ${supplier.notes ?? ''}`.toLowerCase();
      return lower.includes('chicken')
        ? text.includes('poultry') || text.includes('chicken')
        : lower.includes('fish')
          ? text.includes('seafood') || text.includes('fish')
          : lower.includes('veg') || lower.includes('vegetable')
            ? text.includes('produce') || text.includes('vegetable') || text.includes('veg')
            : true;
    })
    .slice(0, 3);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [profileRes, suppliersRes, requestsRes, ordersRes, membersRes, allProfilesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('suppliers').select('*').order('created_at', { ascending: true }),
    supabase.from('supply_requests').select('*').order('created_at', { ascending: false }).limit(30),
    supabase.from('group_orders').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('group_order_members').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20),
  ]);

  const profile = profileRes.data;
  const suppliers = suppliersRes.data ?? [];
  const requests = requestsRes.data ?? [];
  const groupOrders = ordersRes.data ?? [];
  const members = membersRes.data ?? [];
  const profiles = allProfilesRes.data ?? [];

  const requestSignals = countByItem(requests);

  return (
    <main className="shell container">
      <div className="topbar">
        <div className="brand">
          <strong>TradeBase SG</strong>
          <span>{profile ? `${profile.stall_name} · ${profile.hawker_centre}` : 'Claim your stall profile and start posting.'}</span>
        </div>
        <div className="nav">
          <Link href="/" className="button-ghost">
            Home
          </Link>
          <a href="/logout" className="button-ghost">
            Sign out
          </a>
        </div>
      </div>

      <section className="grid-2">
        <div className="card pad">
          <span className="kicker">Your TradeBase ID</span>
          <h2 style={{ margin: '8px 0 10px', fontSize: '2rem' }}>{profile?.tradebase_id ?? 'Unclaimed'}</h2>
          <p className="subtle">This is your stall’s identity inside the network. Keep it unique so suppliers and other hawkers can find you.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <span className="tag">Email: {user.email}</span>
            <span className="tag good">Status: {profile ? 'active' : 'onboarding'}</span>
          </div>
        </div>
        <div className="card pad">
          <span className="kicker">Network snapshot</span>
          <div className="stats" style={{ marginTop: 12 }}>
            <div className="stat">
              <strong>{profiles.length}</strong>
              <span className="subtle">stalls in directory</span>
            </div>
            <div className="stat">
              <strong>{requests.length}</strong>
              <span className="subtle">open supply requests</span>
            </div>
            <div className="stat">
              <strong>{groupOrders.length}</strong>
              <span className="subtle">group buys collecting</span>
            </div>
            <div className="stat">
              <strong>{suppliers.length}</strong>
              <span className="subtle">suppliers in catalog</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section split">
        <div className="card pad">
          <h3>{profile ? 'Update stall profile' : 'Claim your stall profile'}</h3>
          <p className="subtle">Need the basics before the network can do anything useful. A rare victory for structure.</p>
          <form className="form" action={saveProfile}>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="tradebase_id">TradeBase ID</label>
                <input id="tradebase_id" name="tradebase_id" defaultValue={profile?.tradebase_id ?? ''} placeholder="maxwell-101" required />
              </div>
              <div className="field">
                <label htmlFor="stall_name">Stall name</label>
                <input id="stall_name" name="stall_name" defaultValue={profile?.stall_name ?? ''} placeholder="Ah Ma Chicken Rice" required />
              </div>
              <div className="field">
                <label htmlFor="hawker_centre">Hawker centre</label>
                <input id="hawker_centre" name="hawker_centre" defaultValue={profile?.hawker_centre ?? ''} placeholder="Maxwell Food Centre" required />
              </div>
              <div className="field">
                <label htmlFor="cuisine">Cuisine</label>
                <input id="cuisine" name="cuisine" defaultValue={profile?.cuisine ?? ''} placeholder="Chicken rice" />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone / WhatsApp</label>
                <input id="phone" name="phone" defaultValue={profile?.phone ?? ''} placeholder="+65 9xxx xxxx" />
              </div>
              <div className="field">
                <label htmlFor="notes">Notes</label>
                <input id="notes" name="notes" defaultValue={profile?.notes ?? ''} placeholder="Needs early morning veg delivery" />
              </div>
            </div>
            <div className="form-actions">
              <button className="button" type="submit">
                Save profile
              </button>
              <span className="notice">The network only gets smarter once each stall stops being a mystery blob.</span>
            </div>
          </form>
        </div>

        <div className="card pad">
          <h3>Post supply request</h3>
          <p className="subtle">This is the demand signal. Without demand, the rest is just decorative software.</p>
          <form className="form" action={createSupplyRequest}>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="item_name">Item</label>
                <input id="item_name" name="item_name" placeholder="Chicken thigh" required />
              </div>
              <div className="field">
                <label htmlFor="quantity">Quantity</label>
                <input id="quantity" name="quantity" type="number" step="0.1" min="0" placeholder="30" required />
              </div>
              <div className="field">
                <label htmlFor="unit">Unit</label>
                <input id="unit" name="unit" placeholder="kg" required />
              </div>
              <div className="field">
                <label htmlFor="target_price">Target price</label>
                <input id="target_price" name="target_price" type="number" step="0.01" min="0" placeholder="4.50" />
              </div>
              <div className="field">
                <label htmlFor="needed_by">Needed by</label>
                <input id="needed_by" name="needed_by" type="date" />
              </div>
              <div className="field">
                <label htmlFor="preferred_supplier">Preferred supplier</label>
                <input id="preferred_supplier" name="preferred_supplier" placeholder="Optional" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="req_hawker_centre">Hawker centre</label>
              <input id="req_hawker_centre" name="hawker_centre" defaultValue={profile?.hawker_centre ?? ''} placeholder="Your centre" />
            </div>
            <div className="field">
              <label htmlFor="req_notes">Notes</label>
              <textarea id="req_notes" name="notes" placeholder="Early delivery, preferred cut, packaging details, etc." />
            </div>
            <div className="form-actions">
              <button className="button" type="submit">
                Publish request
              </button>
              <span className="notice">Open demand drives the supply aggregation. That is the point, tragically enough.</span>
            </div>
          </form>
        </div>
      </section>

      <section className="section split">
        <div className="card pad">
          <h3>Create group buy</h3>
          <p className="subtle">A hawker can post a target volume; the rest of the network can join the order.</p>
          <form className="form" action={createGroupOrder}>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="go_item">Item</label>
                <input id="go_item" name="item_name" placeholder="Chicken wings" required />
              </div>
              <div className="field">
                <label htmlFor="go_unit">Unit</label>
                <input id="go_unit" name="unit" placeholder="kg" required />
              </div>
              <div className="field">
                <label htmlFor="go_qty">Target quantity</label>
                <input id="go_qty" name="target_quantity" type="number" step="0.1" min="0" placeholder="120" />
              </div>
              <div className="field">
                <label htmlFor="go_date">Target date</label>
                <input id="go_date" name="target_date" type="date" />
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="go_centre">Hawker centre</label>
                <input id="go_centre" name="hawker_centre" defaultValue={profile?.hawker_centre ?? ''} placeholder="Your centre" />
              </div>
              <div className="field">
                <label htmlFor="go_supplier">Supplier hint</label>
                <input id="go_supplier" name="supplier_hint" placeholder="Optional supplier" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="go_notes">Notes</label>
              <textarea id="go_notes" name="notes" placeholder="Packing preferences, timing, collection notes." />
            </div>
            <div className="form-actions">
              <button className="button" type="submit">
                Start group buy
              </button>
              <span className="notice">Once volume is visible, supplier leverage starts behaving like a real thing.</span>
            </div>
          </form>
        </div>

        <div className="card pad">
          <h3>Join a group buy</h3>
          <p className="subtle">If the deal is good enough, other stalls can pile in before the supplier closes it.</p>
          <div className="list">
            {groupOrders.slice(0, 4).map((order) => (
              <form key={order.id} className="item form" action={joinGroupOrder}>
                <input type="hidden" name="group_order_id" value={order.id} />
                <div className="item-head">
                  <div>
                    <strong>{order.item_name}</strong>
                    <div className="subtle">
                      {order.hawker_centre || 'Network'} · {order.unit} · target {order.target_quantity ?? '—'}
                    </div>
                  </div>
                  <span className="tag warn">{order.status}</span>
                </div>
                <div className="field-grid">
                  <div className="field">
                    <label>Join quantity</label>
                    <input name="quantity" type="number" step="0.1" min="0" placeholder="20" required />
                  </div>
                  <div className="field">
                    <label>Notes</label>
                    <input name="notes" placeholder="Split delivery / asap / etc." />
                  </div>
                </div>
                <button className="button" type="submit">
                  Join this order
                </button>
              </form>
            ))}
            {groupOrders.length === 0 ? <div className="item subtle">No group buys yet. Start the first one, since somebody has to be first.</div> : null}
          </div>
        </div>
      </section>

      <section className="section grid-2">
        <div className="card pad">
          <div className="section-header">
            <div>
              <h3>Open supply requests</h3>
              <p>Aggregated demand signals across the network.</p>
            </div>
          </div>
          <div className="list">
            {requestSignals.slice(0, 8).map((signal) => {
              const related = requests.filter((request) => request.item_name.trim().toLowerCase() === signal.item);
              const best = related[0];
              return (
                <div key={signal.item} className="item">
                  <div className="item-head">
                    <div>
                      <strong>{best?.item_name ?? signal.item}</strong>
                      <div className="subtle">Combined quantity: {signal.qty}</div>
                    </div>
                    <span className="tag good">{related.length} requests</span>
                  </div>
                  <div className="subtle">Example target price: {money(best?.target_price)}</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {likelySupplier(best?.item_name ?? signal.item, suppliers).map((supplier) => (
                      <span key={supplier.name} className="tag">
                        {supplier.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {requests.length === 0 ? <div className="item subtle">No requests yet. The board is empty, which is deeply on brand for a fresh product.</div> : null}
          </div>
        </div>

        <div className="card pad">
          <div className="section-header">
            <div>
              <h3>TradeBase directory</h3>
              <p>Visible stalls across Singapore that opted into the network.</p>
            </div>
          </div>
          <div className="list">
            {profiles.map((p) => (
              <div key={p.id} className="item">
                <div className="item-head">
                  <div>
                    <strong>{p.stall_name}</strong>
                    <div className="subtle">
                      {p.hawker_centre} · {p.cuisine || 'Cuisine not set'}
                    </div>
                  </div>
                  <span className="tag">{p.tradebase_id}</span>
                </div>
                <div className="subtle">{p.notes || 'No notes yet.'}</div>
              </div>
            ))}
            {profiles.length === 0 ? <div className="item subtle">No stall profiles yet.</div> : null}
          </div>
        </div>
      </section>

      <section className="section grid-2">
        <div className="card pad">
          <div className="section-header">
            <div>
              <h3>Suppliers</h3>
              <p>Seeded catalog. Replace with actual supplier relationships once the network is real.</p>
            </div>
          </div>
          <div className="list">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="item">
                <div className="item-head">
                  <div>
                    <strong>{supplier.name}</strong>
                    <div className="subtle">{supplier.category}</div>
                  </div>
                  <span className="tag good">Lead time {supplier.typical_delivery_days ?? '—'}d</span>
                </div>
                <div className="subtle">Areas: {(supplier.service_areas ?? []).join(', ') || '—'}</div>
                <div className="subtle">Min order: {money(supplier.min_order)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card pad">
          <h3>How the mechanics work</h3>
          <div className="list">
            <div className="item">
              <strong>1. Claim a stall ID</strong>
              <p>Each hawker creates a profile so the system can tie requests to a real stall instead of anonymous noise.</p>
            </div>
            <div className="item">
              <strong>2. Post demand</strong>
              <p>The network sees aggregated item demand instead of 20 separate small orders.</p>
            </div>
            <div className="item">
              <strong>3. Join volumes</strong>
              <p>Stalls opt into group buys when the order is worth their time.</p>
            </div>
            <div className="item">
              <strong>4. Press suppliers</strong>
              <p>Suppliers see better volume, better routing, and a reason to compete on price.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
