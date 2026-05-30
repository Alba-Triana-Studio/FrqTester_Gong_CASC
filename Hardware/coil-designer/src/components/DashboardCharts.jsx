import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea,
  BarChart, Bar, Cell
} from 'recharts';

export default function DashboardCharts({ impedanceData, awgData, acData, currentAWG, currentAc }) {
  
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #333', padding: '10px', borderRadius: '8px' }}>
          <p style={{ color: '#fff', margin: 0 }}>{`Freq: ${label}`}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color, margin: 0 }}>
              {`${p.name}: ${p.value} ${p.name === 'Z' ? 'Ω' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
      
      {/* Gráfica Z vs f */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">Impedancia (Z) vs Frecuencia</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={impedanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="f" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              {/* Reference line showing safe minimum resistance zone */}
              <ReferenceArea y1={0} y2={impedanceData[0]?.R_target || 8} fill="var(--safe-zone)" strokeOpacity={0} />
              
              <Line type="monotone" dataKey="Z" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-color)', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Impedancia (Ω)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          La zona verde marca el límite de seguridad (Z &lt; R_target). Impedancias más altas reducen la corriente.
        </div>
      </div>

      {/* Gráfica FMM vs AWG */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">Fuerza Magnetomotriz (FMM) por Calibre AWG</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={awgData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="AWG" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="FMM" name="Fuerza (A-vuelta)" radius={[4, 4, 0, 0]}>
                {awgData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={parseInt(entry.AWG) === currentAWG ? 'var(--accent-yellow)' : 'var(--accent-cyan)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          El calibre {currentAWG} está resaltado en amarillo. Busca el pico para maximizar la fuerza mecánica.
        </div>
      </div>

      {/* Gráfica FMM vs A_c */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">Impacto del Área Transversal (A_c) en la Fuerza Magnetomotriz</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={acData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="A_c_cm2" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="FMM" stroke="var(--accent-pink)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-color)', strokeWidth: 2 }} activeDot={{ r: 6 }} name="FMM (A-vuelta)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Evalúa cómo aumentar o reducir el tamaño del núcleo (cm²) afecta la fuerza final para el calibre AWG {currentAWG}. Tu área actual es {(currentAc * 10000).toFixed(0)} cm² ({currentAc} m²).
        </div>
      </div>
    </div>
  );
}
