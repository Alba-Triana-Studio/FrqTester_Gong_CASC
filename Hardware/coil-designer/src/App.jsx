import { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import DashboardCharts from './components/DashboardCharts';
import EquationPanel from './components/EquationPanel';
import ReportModal from './components/ReportModal';
import {
  calculateCoil,
  recommendAWG,
  generateImpedanceCurve,
  generateCurrentCurve,
  generateAWGComparison,
  generateForceCurve,
} from './engine/coilMath';
import { Activity, Zap, AlertTriangle, Download, Power, Radio, Gauge, CheckCircle2, Thermometer } from 'lucide-react';

const DEFAULT_PARAMS = {
  Vmax: 4.24,      // V pico (8.48 Vpp)
  Rtarget: 8,      // Ω  (≈ Zamp para buena adaptación)
  f: 1000,         // Hz
  mu_eff: 10,      // permeabilidad efectiva (núcleo E abierto)
  Ac: 1000,        // mm²  (= 10 cm²)
  lc: 100,         // mm   (= 0.1 m)
  awg: 24,         // calibre
  hw: 40,          // alto de ventana [mm]
  dw: 15,          // profundidad de ventana [mm]
  perim: 100,      // perímetro medio de una vuelta [mm]
  Zamp: 8,         // Ω impedancia del amplificador
  usar_transformador: false,
  usar_resonancia: true,
};

const MATCH_COLOR = { ok: 'var(--accent-green)', low: 'var(--accent-pink)', high: 'var(--accent-yellow)', na: 'var(--text-muted)' };

function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const results = useMemo(() => calculateCoil(params), [params]);
  const recommendedAWG = useMemo(() => recommendAWG(params), [params]);
  const impedanceData = useMemo(() => generateImpedanceCurve(params), [params]);
  const currentData = useMemo(() => generateCurrentCurve(params), [params]);
  const awgData = useMemo(() => generateAWGComparison(params), [params]);
  const forceData = useMemo(() => generateForceCurve(params), [params]);

  const res = params.usar_resonancia;
  const match = results.match;

  return (
    <div className="app-container">
      <ControlPanel params={params} setParams={setParams} results={results} recommendedAWG={recommendedAWG} />

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="app-title">
            <Activity color="var(--accent-cyan)" /> Coil Designer
            <span className="app-subtitle">Excitación acústica por inducción · Gong de bronce</span>
          </h1>
          <button className="report-btn" onClick={() => setIsReportModalOpen(true)}>
            <Download size={18} /> Exportar Reporte
          </button>
        </div>

        <div className="principle-banner">
          <Zap size={18} className="principle-icon" />
          <div>
            <strong>La fuerza (FMM) la limitan la potencia y el cobre, no el nº de vueltas.</strong>{' '}
            Con el carrete lleno, <em>FMM ∝ √P</em>: añadir vueltas no da más fuerza. El calibre solo fija la
            impedancia a la que trabaja el ampli; la <em>resonancia serie</em> multiplica la corriente por Q.
          </div>
        </div>

        <div className="metrics-grid">
          {/* Adaptación bobina ↔ amplificador */}
          <div className="glass-panel metric-card" style={{ borderColor: MATCH_COLOR[match.status] }}>
            <span className="metric-label" style={{ color: MATCH_COLOR[match.status] }}>
              {match.status === 'ok' ? <CheckCircle2 size={13} className="ic" /> : <AlertTriangle size={13} className="ic" />} Adaptación al ampli
            </span>
            <span className="metric-value" style={{ color: MATCH_COLOR[match.status], fontSize: '1.25rem' }}>{match.label}</span>
            <span className="metric-sub">ve {results.Z_load.toFixed(1)}Ω · Zamp {params.Zamp}Ω ({match.ratio.toFixed(2)}×)</span>
          </div>

          <div className="glass-panel metric-card" style={{ borderColor: 'var(--accent-yellow)' }}>
            <span className="metric-label" style={{ color: 'var(--accent-yellow)' }}>
              <Zap size={13} className="ic" /> FMM {res ? '(resonancia)' : '(directa)'}
            </span>
            <span className="metric-value" style={{ color: 'var(--accent-yellow)' }}>{results.FMM_op.toFixed(0)}</span>
            <span className="metric-sub">A·vuelta de empuje sobre el gong</span>
          </div>

          <div className="glass-panel metric-card" style={{ borderColor: 'var(--accent-pink)' }}>
            <span className="metric-label" style={{ color: 'var(--accent-pink)' }}><Power size={13} className="ic" /> Potencia (calor)</span>
            <span className="metric-value" style={{ color: 'var(--accent-pink)' }}>{results.P.toFixed(2)}<small>W</small></span>
            <span className="metric-sub">prom. sinusoidal ≈ {results.P_avg.toFixed(2)} W</span>
          </div>

          <div className={`glass-panel metric-card ${results.current_ok ? '' : 'warning'}`}>
            <span className="metric-label"><Thermometer size={13} className="ic" /> Corriente / alambre</span>
            <span className="metric-value" style={{ color: results.current_ok ? 'var(--text-main)' : 'var(--accent-pink)' }}>
              {results.I_op.toFixed(2)}<small>A</small>
            </span>
            <span className="metric-sub">
              {results.current_ok ? `seguro · ${results.current_use_pct.toFixed(0)}% del límite` : '¡sube el calibre!'}
            </span>
          </div>

          <div className={`glass-panel metric-card ${res ? '' : 'dim'}`} style={{ borderColor: res ? 'var(--accent-cyan)' : 'var(--panel-border)' }}>
            <span className="metric-label" style={{ color: res ? 'var(--accent-cyan)' : 'var(--text-muted)' }}><Radio size={13} className="ic" /> Resonancia · Q</span>
            <span className="metric-value" style={{ color: res ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{res ? results.Q.toFixed(0) : '—'}</span>
            <span className="metric-sub">{res ? `C = ${results.C_res_uF.toFixed(3)} µF · ×${results.mult.toFixed(0)} corriente` : 'desactivada'}</span>
          </div>

          <div className={`glass-panel metric-card ${results.overflow ? 'warning' : ''}`}>
            <span className="metric-label"><Gauge size={13} className="ic" /> Carrete</span>
            <span className="metric-value">{isFinite(results.fill_percent) ? results.fill_percent.toFixed(0) : '∞'}%</span>
            <span className="metric-sub">
              {results.overflow ? <span style={{ color: 'var(--accent-pink)' }}>no caben {results.N} vueltas</span> : `recomendado: AWG ${recommendedAWG.awg}`}
            </span>
          </div>
        </div>

        <DashboardCharts
          impedanceData={impedanceData}
          currentData={currentData}
          awgData={awgData}
          forceData={forceData}
          params={params}
          results={results}
          recommendedAWG={recommendedAWG}
        />
      </div>

      <EquationPanel params={params} results={results} />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        params={params}
        results={results}
        recommendedAWG={recommendedAWG}
      />
    </div>
  );
}

export default App;
