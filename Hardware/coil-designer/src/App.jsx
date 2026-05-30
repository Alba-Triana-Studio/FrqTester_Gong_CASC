import React, { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import DashboardCharts from './components/DashboardCharts';
import EquationPanel from './components/EquationPanel';
import ReportModal from './components/ReportModal';
import { calculateCoil, generateImpedanceCurve, generateAWGComparison, generateACComparison } from './engine/coilMath';
import { Activity, Zap, AlertTriangle, Download } from 'lucide-react';

function App() {
  const [params, setParams] = useState({
    V_max: 20,
    AWG: 24,
    R_target: 8,
    l_vuelta: 0.1, // 10cm perimeter
    f: 1000, // 1kHz
    mu_eff: 1.5,
    A_c: 0.001,
    l_c: 0.1,
    h_w: 40, // Alto del carrete en mm
    d_w: 15  // Profundidad del carrete en mm
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const results = useMemo(() => calculateCoil(params), [params]);
  const impedanceData = useMemo(() => generateImpedanceCurve(params), [params]);
  const awgData = useMemo(() => generateAWGComparison(params), [params]);
  const acData = useMemo(() => generateACComparison(params), [params]);

  const isNTooHigh = results.fill_percent > 100;

  return (
    <div className="app-container">
      {/* Columna Izquierda: Controles */}
      <ControlPanel params={params} setParams={setParams} />

      {/* Columna Central: Dashboard */}
      <div className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity color="var(--accent-cyan)" /> Motor de Diseño de Bobinas
          </h1>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'}
          >
            <Download size={18} /> Exportar Reporte
          </button>
        </div>

        {/* Resumen de Métricas */}
        <div className="metrics-grid">
          <div className={`glass-panel metric-card ${isNTooHigh ? 'warning' : ''}`}>
            <span className="metric-label">Llenado del Carrete</span>
            <span className="metric-value">{results.fill_percent.toFixed(1)}%</span>
            {isNTooHigh && (
              <span style={{color: 'var(--accent-pink)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px'}}>
                <AlertTriangle size={14}/> {results.N.toFixed(0)} vueltas no caben
              </span>
            )}
          </div>
          
          <div className="glass-panel metric-card">
            <span className="metric-label">Alambre a Comprar (L_total)</span>
            <span className="metric-value">{results.l_total.toFixed(2)}m</span>
          </div>

          <div className="glass-panel metric-card">
            <span className="metric-label">Impedancia Actual (Z)</span>
            <span className="metric-value">{results.Z.toFixed(2)}Ω</span>
          </div>

          <div className="glass-panel metric-card" style={{borderColor: 'var(--accent-yellow)'}}>
            <span className="metric-label" style={{color: 'var(--accent-yellow)'}}><Zap size={14} style={{display: 'inline', marginBottom: '-2px'}}/> FMM Máxima</span>
            <span className="metric-value" style={{color: 'var(--accent-yellow)'}}>{results.FMM.toFixed(2)}</span>
          </div>
        </div>

        {/* Gráficas */}
        <DashboardCharts 
          impedanceData={impedanceData} 
          awgData={awgData} 
          acData={acData}
          currentAWG={params.AWG} 
          currentAc={params.A_c}
        />
      </div>

      {/* Columna Derecha: Panel de Ecuaciones (Retractil) */}
      <EquationPanel params={params} results={results} />

      {/* Modal de Reporte */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        params={params} 
        results={results} 
      />
    </div>
  );
}

export default App;
