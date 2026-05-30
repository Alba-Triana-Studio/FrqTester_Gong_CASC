import React from 'react';

export default function ControlPanel({ params, setParams }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  return (
    <div className="glass-panel control-panel">
      <h2 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '1.2rem' }}>
        Parámetros de Entrada
      </h2>

      <div className="input-group">
        <label>Voltaje Máximo (V_max)</label>
        <div className="input-value">
          <input 
            type="range" 
            name="V_max" 
            min="5" max="100" step="1" 
            value={params.V_max} 
            onChange={handleChange} 
            style={{flex: 1, marginRight: '16px'}}
          />
          <span className="val">{params.V_max}V</span>
        </div>
      </div>

      <div className="input-group">
        <label>Calibre (AWG)</label>
        <div className="input-value">
          <input 
            type="range" 
            name="AWG" 
            min="18" max="32" step="1" 
            value={params.AWG} 
            onChange={handleChange} 
            style={{flex: 1, marginRight: '16px'}}
          />
          <span className="val">{params.AWG}</span>
        </div>
      </div>

      <div className="input-group">
        <label>Resistencia Objetivo (R_target)</label>
        <div className="input-value">
          <input 
            type="range" 
            name="R_target" 
            min="2" max="16" step="0.5" 
            value={params.R_target} 
            onChange={handleChange} 
            style={{flex: 1, marginRight: '16px'}}
          />
          <span className="val">{params.R_target}Ω</span>
        </div>
      </div>

      <div className="input-group">
        <label>Longitud media por vuelta (m)</label>
        <div className="input-value">
          <input 
            type="range" 
            name="l_vuelta" 
            min="0.01" max="0.5" step="0.01" 
            value={params.l_vuelta} 
            onChange={handleChange} 
            style={{flex: 1, marginRight: '16px'}}
          />
          <span className="val">{params.l_vuelta}m</span>
        </div>
      </div>

        <div className="input-group">
          <label>Frecuencia de Señal (f)</label>
          <div className="input-value">
            <input 
              type="range" 
              name="f" 
              min="10" max="20000" step="10" 
              value={params.f} 
              onChange={handleChange} 
              style={{flex: 1, marginRight: '16px'}}
            />
            <span className="val">{params.f}Hz</span>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--panel-border)', margin: '16px 0' }} />
        
        <h2 style={{ color: 'var(--text-main)', marginBottom: '8px', fontSize: '1.2rem' }}>
          Propiedades del Núcleo
        </h2>

        <div className="input-group">
          <label>Permeabilidad Efectiva (μ_eff)</label>
          <div className="input-value">
            <input 
              type="range" 
              name="mu_eff" 
              min="1" max="50" step="0.5" 
              value={params.mu_eff} 
              onChange={handleChange} 
              style={{flex: 1, marginRight: '16px'}}
            />
            <span className="val">{params.mu_eff}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multiplicador del hierro. Núcleos abiertos (forma E) suelen tener un valor muy bajo (ej. 1.5 a 10).</div>
        </div>

        <div className="input-group">
          <label>Longitud del camino (l_c)</label>
          <div className="input-value">
            <input 
              type="range" 
              name="l_c" 
              min="0.01" max="0.5" step="0.01" 
              value={params.l_c} 
              onChange={handleChange} 
              style={{flex: 1, marginRight: '16px'}}
            />
            <span className="val">{params.l_c}m</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distancia promedio del flujo magnético en el metal.</div>
        </div>

        <div className="input-group">
          <label>Área Transversal (A_c)</label>
          <div className="input-value">
            <input 
              type="number" 
              name="A_c" 
              min="0.0001" max="0.1" step="0.0001" 
              value={params.A_c} 
              onChange={handleChange} 
              style={{flex: 1, marginRight: '16px'}}
            />
            <span className="val">{params.A_c}m²</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Área física de la cara del núcleo (ej. 0.001 m² = 10 cm²).</div>
        </div>
        <hr style={{ borderColor: 'var(--panel-border)', margin: '16px 0' }} />
        
        <h2 style={{ color: 'var(--text-main)', marginBottom: '8px', fontSize: '1.2rem' }}>
          Espacio Físico (Carrete)
        </h2>

        <div className="input-group">
          <label>Alto de la Ventana (h_w)</label>
          <div className="input-value">
            <input 
              type="range" 
              name="h_w" 
              min="10" max="100" step="1" 
              value={params.h_w} 
              onChange={handleChange} 
              style={{flex: 1, marginRight: '16px'}}
            />
            <span className="val">{params.h_w}mm</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Espacio vertical disponible para enrollar alambre en el carrete plástico.</div>
        </div>

        <div className="input-group">
          <label>Profundidad de Ventana (d_w)</label>
          <div className="input-value">
            <input 
              type="range" 
              name="d_w" 
              min="5" max="50" step="1" 
              value={params.d_w} 
              onChange={handleChange} 
              style={{flex: 1, marginRight: '16px'}}
            />
            <span className="val">{params.d_w}mm</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grosor horizontal desde la pared interior del carrete hacia afuera.</div>
        </div>
      </div>
    );
  }
