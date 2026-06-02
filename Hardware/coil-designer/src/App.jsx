import { useState, useMemo, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import DashboardCharts from './components/DashboardCharts';
import EquationPanel from './components/EquationPanel';
import ReportModal from './components/ReportModal';
import AdvicePanel from './components/AdvicePanel';
import TransformerPanel from './components/TransformerPanel';
import OptimizerModal from './components/OptimizerModal';
import {
  calculateCoil,
  recommendAWG,
  optimizeFMM,
  generateImpedanceCurve,
  generateCurrentCurve,
  generateAWGComparison,
  generateForceCurve,
  generateTransformerCurve,
} from './engine/coilMath';
import { Activity, Zap, AlertTriangle, Download, Power, Radio, Gauge, CheckCircle2, Thermometer, Save, Upload } from 'lucide-react';

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
  // Transformador de adaptación T1
  modo_relacion: 'auto',  // 'auto' | 'manual'
  a_manual: 3,            // relación a = V_sec/V_pri (modo manual)
  R_pri: 2.2,            // Ω resistencia del primario de T1
  R_sec: 0.2,           // Ω resistencia del secundario de T1
  acoplamiento_k: 0.98, // coeficiente de acoplamiento (0–1)
};

const MATCH_COLOR = { ok: 'var(--accent-green)', low: 'var(--accent-pink)', high: 'var(--accent-yellow)', na: 'var(--text-muted)' };

// Variables que se pueden bloquear para el optimizador. Por defecto se bloquea
// el amplificador (Vmax, Zamp) y la frecuencia de trabajo: son datos fijos.
const DEFAULT_LOCKS = {
  Vmax: true, Rtarget: false, f: true, mu_eff: false, Ac: false, lc: false,
  awg: false, hw: false, dw: false, perim: false, Zamp: true,
  usar_resonancia: false, usar_transformador: false,
};

function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [locks, setLocks] = useState(DEFAULT_LOCKS);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [optimizer, setOptimizer] = useState(null); // { criteria, options } | null
  const fileInputRef = useRef(null);

  const handleSaveSession = () => {
    try {
      const data = {
        params,
        locks,
        version: "1.0.0",
        timestamp: new Date().toISOString()
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Coil_Designer_Sesion_${params.awg}AWG_${params.f}Hz.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al guardar la sesión: " + error.message);
    }
  };

  const handleLoadSession = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && data.params && data.locks) {
          setParams(data.params);
          setLocks(data.locks);
          e.target.value = ''; // Permite volver a cargar el mismo archivo si es necesario
        } else {
          alert("El archivo seleccionado no es una sesión válida de Coil Designer.");
        }
      } catch (err) {
        alert("Error al procesar el archivo JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const toggleLock = (name) => setLocks((prev) => ({ ...prev, [name]: !prev[name] }));
  const runOptimizer = () => setOptimizer(optimizeFMM(params, locks));
  const applyOption = (cfg) => setParams((prev) => ({ ...prev, ...cfg }));

  const results = useMemo(() => calculateCoil(params), [params]);
  const recommendedAWG = useMemo(() => recommendAWG(params), [params]);
  const impedanceData = useMemo(() => generateImpedanceCurve(params), [params]);
  const currentData = useMemo(() => generateCurrentCurve(params), [params]);
  const awgData = useMemo(() => generateAWGComparison(params), [params]);
  const forceData = useMemo(() => generateForceCurve(params), [params]);
  const transformerData = useMemo(() => generateTransformerCurve(params), [params]);

  const res = params.usar_resonancia;
  const match = results.match;

  return (
    <div className="app-container">
      <ControlPanel
        params={params} setParams={setParams} results={results} recommendedAWG={recommendedAWG}
        locks={locks} toggleLock={toggleLock} onOptimize={runOptimizer}
      />

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="app-title">
            <Activity color="var(--accent-cyan)" /> Coil Designer
            <span className="app-subtitle">Excitación acústica por inducción · Gong de bronce</span>
          </h1>
          <div className="header-actions">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleLoadSession}
            />
            <button className="session-btn load" onClick={() => fileInputRef.current?.click()} title="Cargar Sesión desde archivo JSON">
              <Upload size={18} /> Cargar Sesion
            </button>
            <button className="session-btn save" onClick={handleSaveSession} title="Guardar Sesión actual en archivo JSON">
              <Save size={18} /> Guardar Sesion
            </button>
            <button className="report-btn" onClick={() => setIsReportModalOpen(true)}>
              <Download size={18} /> Exportar Reporte
            </button>
          </div>
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
            <span className="metric-sub">
              {params.usar_transformador ? 'con T1 ve' : 've'} {results.Z_seen.toFixed(1)}Ω · Zamp {params.Zamp}Ω ({match.ratio.toFixed(2)}×)
            </span>
          </div>

          <div className="glass-panel metric-card" style={{ borderColor: 'var(--accent-yellow)' }}>
            <span className="metric-label" style={{ color: 'var(--accent-yellow)' }}>
              <Zap size={13} className="ic" /> FMM {params.usar_transformador ? (res ? '(T1+res)' : '(con T1)') : res ? '(resonancia)' : '(directa)'}
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

        {/* Consejo de optimización (cubre las 4 combinaciones de toggles) */}
        <AdvicePanel advice={results.advice} />

        {/* Especificaciones de T1 (solo si el transformador está activo) */}
        {params.usar_transformador && (
          <TransformerPanel params={params} results={results} transformerData={transformerData} />
        )}

        <DashboardCharts
          impedanceData={impedanceData}
          currentData={currentData}
          awgData={awgData}
          forceData={forceData}
          transformerData={transformerData}
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

      <OptimizerModal
        data={optimizer}
        onApply={applyOption}
        onClose={() => setOptimizer(null)}
      />
    </div>
  );
}

export default App;
