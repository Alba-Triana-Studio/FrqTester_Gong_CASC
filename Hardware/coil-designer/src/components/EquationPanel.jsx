import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { AWG_TABLE } from '../engine/coilMath';

export default function EquationPanel({ params, results }) {
  const [isOpen, setIsOpen] = useState(false);

  const { V_max, AWG, R_target, l_vuelta, f, mu_eff, A_c, l_c, h_w, d_w } = params;
  const { R_metro, diam_mm, l_total, N, L, XL, Z, I, FMM, turns_per_layer, num_layers, N_max, fill_percent } = results;

  const mu_0_str = "4π×10⁻⁷";

  return (
    <div className={`equation-panel-wrapper ${!isOpen ? 'closed' : ''}`}>
      <button className="eq-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="glass-panel equation-panel-content">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          Constantes del Sistema
        </h2>
        
        <div className="eq-block" style={{ fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
              <strong>μ₀ (Permeabilidad del Vacío): {mu_0_str} H/m</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.8rem', lineHeight: '1.3' }}>Constante física que define cuánta resistencia ofrece el vacío a la creación de un campo magnético.</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
              <strong>μ_eff (Permeabilidad del Núcleo): {mu_eff}</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.8rem', lineHeight: '1.3' }}>Multiplicador que indica cuánto amplifica el metal del núcleo al campo magnético en comparación con el vacío (al ser un circuito abierto, es un valor bajo).</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
              <strong>A_c (Área Transversal): {A_c} m²</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.8rem', lineHeight: '1.3' }}>Área física de la cara del núcleo donde se enrolla la bobina. A mayor área, mayor flujo magnético.</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
              <strong>l_c (Longitud del Camino): {l_c} m</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.8rem', lineHeight: '1.3' }}>Distancia promedio que recorren las líneas de flujo magnético a través del bloque de hierro.</div>
            </div>
          </div>

          <details style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>Tabla de Resistencias AWG</summary>
            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {Object.entries(AWG_TABLE).map(([calibre, data]) => (
                <div key={calibre} style={{ 
                  padding: '4px', 
                  background: parseInt(calibre) === AWG ? 'rgba(250, 204, 21, 0.2)' : 'transparent',
                  border: parseInt(calibre) === AWG ? '1px solid var(--accent-yellow)' : '1px solid transparent',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <strong>#{calibre}</strong><br/>{data.res}Ω
                </div>
              ))}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Valores en Ohmios por metro (Ω/m)
            </div>
          </details>
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text-main)' }}>
          Resolución Matemática
        </h2>

      <div className="eq-block">
        <div className="eq-title">1. Longitud total del alambre (l_total)</div>
        <div className="eq-formula">
          l_total = R_target / R_metro_AWG<br/>
          l_total = {R_target} / {R_metro.toFixed(5)}<br/>
          l_total = <strong>{l_total.toFixed(2)} m</strong>
        </div>
        <div className="eq-desc">
          Calcula cuántos metros de alambre AWG {AWG} se necesitan para alcanzar la resistencia objetivo de seguridad.
        </div>
      </div>

      <div className="eq-block">
        <div className="eq-title">2. Número de vueltas (N)</div>
        <div className="eq-formula">
          N = l_total / l_vuelta<br/>
          N = {l_total.toFixed(2)} / {l_vuelta}<br/>
          N = <strong>{N.toFixed(2)} vueltas</strong>
        </div>
        <div className="eq-desc">
          Divide la longitud total entre el perímetro del carrete físico. Alerta: Si N es muy alto, podría no caber físicamente.
        </div>
      </div>

      <div className="eq-block">
        <div className="eq-title">3. Inductancia Estimada (L)</div>
        <div className="eq-formula">
          L = (N² · μ₀ · μ_eff · A_c) / l_c<br/>
          L = ({N.toFixed(1)}² · {mu_0_str} · {mu_eff} · {A_c}) / {l_c}<br/>
          L = <strong>{(L * 1000).toFixed(4)} mH</strong>
        </div>
        <div className="eq-desc">
          Mide la capacidad de la bobina para inducir voltaje oponiéndose al cambio de corriente.
        </div>
      </div>

      <div className="eq-block">
        <div className="eq-title">4. Impedancia en AC (Z)</div>
        <div className="eq-formula">
          Z = √(R_target² + (2πfL)²)<br/>
          Z = √({R_target}² + (2π · {f} · {(L*1000).toFixed(2)}mH)²)<br/>
          Z = <strong>{Z.toFixed(2)} Ω</strong>
        </div>
        <div className="eq-desc">
          La resistencia real que "ve" el amplificador. A mayor frecuencia, la inductancia dispara la impedancia limitando la corriente.
        </div>
      </div>

      <div className="eq-block">
        <div className="eq-title">5. Corriente Dinámica (I)</div>
        <div className="eq-formula">
          I = V_max / Z<br/>
          I = {V_max} / {Z.toFixed(2)}<br/>
          I = <strong>{I.toFixed(2)} A</strong>
        </div>
        <div className="eq-desc">
          Corriente eléctrica real que fluye por la bobina en el pico del voltaje.
        </div>
      </div>

      <div className="eq-block">
        <div className="eq-title">6. Fuerza Magnetomotriz (FMM)</div>
        <div className="eq-formula">
          FMM = N · I<br/>
          FMM = {N.toFixed(1)} · {I.toFixed(2)}<br/>
          FMM = <strong>{FMM.toFixed(2)} A-vuelta</strong>
        </div>
        <div className="eq-desc">
          Magnitud de la fuerza de empuje magnético. Este es el valor a maximizar para obtener la mejor respuesta física en el Gong.
        </div>
      </div>

      <div className="eq-block">
        <div className="eq-title">7. Capacidad del Carrete (Espacio Físico)</div>
        <div className="eq-formula">
          Vueltas por capa = ⌊h_w / diam_alambre⌋<br/>
          Vueltas por capa = ⌊{params.h_w} / {diam_mm}⌋ = {turns_per_layer}<br/>
          <br/>
          Capas totales = ⌊d_w / diam_alambre⌋<br/>
          Capas totales = ⌊{params.d_w} / {diam_mm}⌋ = {num_layers}<br/>
          <br/>
          N_max = {turns_per_layer} · {num_layers} = <strong>{N_max} vueltas máx</strong><br/>
          Llenado = (N / N_max) · 100 = <strong>{fill_percent.toFixed(1)}%</strong>
        </div>
        <div className="eq-desc">
          Calcula la cantidad máxima teórica de vueltas asumiendo un empaquetado cuadrado perfecto. Si el porcentaje de llenado supera el 100%, la bobina física se desbordará.
        </div>
      </div>
    </div>
  </div>
  );
}
