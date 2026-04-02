import Link from 'next/link';

const bullets = [
  'Join the network with a TradeBase ID',
  'See supply requests and group buys across hawkers',
  'Coordinate bulk orders without exposing private pricing',
];

const stats = [
  ['1 ID', 'per stall profile'],
  ['1 board', 'for open demand'],
  ['1 place', 'for shared buying signals'],
];

export default function HomePage() {
  return (
    <main className="shell container">
      <div className="topbar">
        <div className="brand">
          <strong>TradeBase SG</strong>
          <span>Hawker supply network, group-buy board, and stall identity layer.</span>
        </div>
        <div className="nav">
          <Link href="/login" className="button-ghost">
            Join network
          </Link>
          <Link href="/dashboard" className="button">
            Open dashboard
          </Link>
        </div>
      </div>

      <section className="hero">
        <div className="card pad">
          <span className="kicker">Singapore hawker network</span>
          <h1>Shared supply power for stalls that still run on memory and WhatsApp.</h1>
          <p>
            TradeBase gives each hawker a unique ID, a live profile, a supply request board, and a group-buy layer.
            No theatrics. Just less waste, fewer calls, and stronger buying power.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="button">
              Get a TradeBase ID
            </Link>
            <Link href="/dashboard" className="button-ghost">
              See the live board
            </Link>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {bullets.map((bullet) => (
              <span key={bullet} className="tag good">
                {bullet}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-aside">
          <div className="card pad">
            <h3 style={{ marginBottom: 10 }}>Why it exists</h3>
            <div className="list">
              {stats.map(([value, label]) => (
                <div key={value} className="stat" style={{ margin: 0 }}>
                  <strong>{value}</strong>
                  <span className="subtle">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card pad">
            <h3 style={{ marginBottom: 10 }}>TradeBase loop</h3>
            <div className="codebox">
              hawker posts need → network aggregates demand → supplier sees volume →
              better price → hawker saves money → repeat
            </div>
          </div>
        </div>
      </section>

      <section className="grid-3 section">
        <div className="card pad">
          <h3>Hawker profiles</h3>
          <p className="subtle">Public stall identity with the fields that matter: centre, cuisine, contact, and buying needs.</p>
        </div>
        <div className="card pad">
          <h3>Supply requests</h3>
          <p className="subtle">Post what you need, when you need it, and at what target price. The board stays visible to the network.</p>
        </div>
        <div className="card pad">
          <h3>Group buys</h3>
          <p className="subtle">Pull matching orders together so suppliers see volume instead of a stack of tiny one-off calls.</p>
        </div>
      </section>
    </main>
  );
}
