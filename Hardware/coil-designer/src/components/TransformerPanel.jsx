import { Cable, AlertTriangle, CheckCircle2 } from 'lucide-react';

function Stat({ label, value, sub, accent }) {
  return (
    <div className="t1-stat">
      <span className="t1-stat-label">{label}</span>
      <span className="t1-stat-value" style={accent ? { color: accent } : undefined}>{value}</span>
      {sub && <span className="t1-stat-sub">{sub}</span>}
    </div>
  );
}

export default function TransformerPanel({ params, results, transformerData }) {
  const tx = results.tx;
  const zs = (transformerData || []).map((d) => d.Z_amp_ve).filter((v) => isFinite(v));
  const zmin = zs.length ? Math.min(...zs) : tx.Zve;
  const zmax = zs.length ? Math.max(...zs) : tx.Zve;
  const etaColor = tx.eta >= 80 ? 'var(--accent-green)' : tx.eta >= 60 ? 'var(--accent-yellow)' : 'var(--accent-pink)';
  const bobPct = tx.P_total > 0 ? (tx.P_bobina / tx.P_total) * 100 : 0;

  return (
    <div className="glass-panel t1-panel">
      <div className="t1-head">
        <span className="t1-title"><Cable size={16} /> Especificaciones de T1 (transformador)</span>
        <span className="t1-mode">{tx.mode === 'manual' ? 'relación manual' : 'relación automática'}</span>
        {tx.balance_ok
          ? <span className="t1-balance ok"><CheckCircle2 size={13} /> balance energético ✓</span>
          : <span className="t1-balance bad"><AlertTriangle size={13} /> balance roto</span>}
      </div>

      <div className="t1-grid">
        <Stat label="Relación a = V_sec/V_pri" value={tx.a.toFixed(2)} sub={`inversa ${tx.a_inv.toFixed(2)} · vueltas ${tx.turns_ratio}`} accent="var(--accent-cyan)" />
        <Stat label="Z reflejada a f_op" value={`${tx.Z_refl_mag.toFixed(1)} Ω`} sub={`el ampli ve ${tx.Zve.toFixed(1)} Ω (Zamp ${params.Zamp})`} />
        <Stat label="Z vista en la banda" value={`${zmin.toFixed(0)}–${zmax.toFixed(0)} Ω`} sub="min–max (más plana = mejor)" />
        <Stat label="Tensión secundario V_sec" value={`${tx.V_sec.toFixed(2)} V`} sub={`pico · primario ${params.Vmax} V`} />
        <Stat label="Corriente primario (ampli)" value={`${tx.I_amp.toFixed(3)} A`} sub="I_amp = a · I_bobina" />
        <Stat label="Corriente secundario (bobina)" value={`${tx.I_bobina.toFixed(3)} A`} sub="la que genera la FMM" accent="var(--accent-yellow)" />
      </div>

      {/* Reparto de potencia + eficiencia */}
      <div className="t1-power">
        <div className="t1-power-head">
          <span>Reparto de potencia</span>
          <span className="t1-eta" style={{ color: etaColor }}>η = {tx.eta.toFixed(0)}%</span>
        </div>
        <div className="t1-bar">
          <div className="t1-bar-bob" style={{ width: `${bobPct}%` }} title={`Bobina ${tx.P_bobina.toFixed(2)} W`} />
          <div className="t1-bar-loss" style={{ width: `${100 - bobPct}%` }} title={`Pérdidas T1 ${tx.P_loss.toFixed(2)} W`} />
        </div>
        <div className="t1-power-legend">
          <span><i className="bob" /> Bobina (útil) {tx.P_bobina.toFixed(2)} W</span>
          <span><i className="loss" /> Pérdidas T1 {tx.P_loss.toFixed(2)} W</span>
          <span className="t1-power-total">Total ampli {tx.P_total.toFixed(2)} W</span>
        </div>
        <div className="t1-loss-breakdown">
          R_pri: {tx.P_Rpri.toFixed(2)} W · R_sec: {tx.P_Rsec.toFixed(2)} W · acoplamiento (k={tx.k}): {tx.P_coupling.toFixed(2)} W
        </div>
      </div>

      <div className={`t1-sat ${tx.sat_risk ? 'risk' : 'ok'}`}>
        <AlertTriangle size={13} />
        {tx.sat_risk
          ? <span><strong>Riesgo de saturación de T1:</strong> a {params.f} Hz con V_sec = {tx.V_sec.toFixed(1)} V el flujo del núcleo es alto (B ∝ V_sec/f). Usa un núcleo mayor para T1 o sube la frecuencia.</span>
          : <span>Flujo de T1 moderado (índice V_sec/f = {tx.flux_index.toExponential(2)}). A frecuencias más bajas con V_sec alto, vigila la saturación del núcleo de T1.</span>}
      </div>
    </div>
  );
}
