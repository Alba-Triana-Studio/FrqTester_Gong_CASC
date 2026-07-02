import { useState } from 'react';
import { ChevronRight, ChevronLeft, Sigma, Info } from 'lucide-react';
import { fmtForce } from '../engine/coilMath';

function Eq({ n, title, formula, steps, result, desc, accent }) {
  return (
    <div className="eq-block">
      <div className="eq-title">{n}. {title}</div>
      <div className="eq-formula">
        <div className="eq-symbolic">{formula}</div>
        {steps && <div className="eq-steps">{steps}</div>}
        <div className="eq-result" style={accent ? { color: accent } : undefined}>= {result}</div>
      </div>
      {desc && <div className="eq-desc">{desc}</div>}
    </div>
  );
}

export default function EquationPanel({ params, results }) {
  const [isOpen, setIsOpen] = useState(false);

  const { Vmax, Rtarget, f, mu_eff, Ac, lc, awg, perim, hw, Zamp, usar_resonancia, usar_transformador, modo_capacitor,
    gap, w_polo, rho_t, t_gong, B_sat } = params;
  const {
    d_cu_mm, A_wire, ohm_m, N_exact, N, l_total, R_real,
    delta_cu_mm, F_R, R_ac,
    L, L_mH, omega, XL, Z, Zcoil_op, phi_deg, I_pico, FMM,
    C_res_uF, C_res_opt_uF, I_res, FMM_res, Q, mult, P, P_avg, V_C_pk,
    Z_refl, tx, turns_per_layer, layers_max, num_layers, N_max, fill_percent,
    B_core_pk, sat_pct, sat_ok, decay_gap, B_gap_pk,
    delta_t_mm, t_eff_mm, S_shield, K_eddy, F_avg, F_ac, f_mech, FMM_op,
  } = results;

  const e = (x, d = 3) => (isFinite(x) ? x.toExponential(d) : '—');
  const fx = (x, d = 2) => (isFinite(x) ? x.toFixed(d) : '—');

  return (
    <div className={`equation-panel-wrapper ${!isOpen ? 'closed' : ''}`}>
      <button className="eq-toggle" onClick={() => setIsOpen(!isOpen)} title="Panel de ecuaciones">
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="glass-panel equation-panel-content">
        <h2 className="panel-section-title"><Sigma size={18} /> Ecuaciones en vivo</h2>

        {/* Principio físico */}
        <div className="principle-box">
          <Info size={16} className="principle-icon" />
          <div>
            La <strong>FMM máxima</strong> está limitada por la <strong>potencia disipable</strong>, no por N.
            El número de vueltas adapta la impedancia; la <strong>resonancia serie</strong> multiplica la
            corriente por el factor <strong>Q</strong>. A volumen de cobre fijo: <em>R ∝ N²</em> ⇒ <em>FMM ∝ √P</em>.
          </div>
        </div>

        {/* Glosario de constantes */}
        <details className="glossary" open>
          <summary>Constantes y variables</summary>
          <ul className="glossary-list">
            <li><b>ρ_Cu</b> = 1.724×10⁻⁸ Ω·m — resistividad del cobre @20 °C</li>
            <li><b>μ₀</b> = 4π×10⁻⁷ H/m — permeabilidad del vacío</li>
            <li><b>μ_eff</b> = {mu_eff} — permeabilidad relativa efectiva del núcleo</li>
            <li><b>Ac</b> = {Ac} mm² = {e(Ac / 1e6)} m² — sección del núcleo</li>
            <li><b>lc</b> = {lc} mm — camino magnético (incl. entrehierro)</li>
            <li><b>l_vuelta</b> = {perim} mm — perímetro medio de una espira</li>
            <li><b>Vmax</b> = {Vmax} V pico (Vrms = {fx(Vmax / Math.SQRT2, 2)} V) · <b>f</b> = {f} Hz · <b>Zamp</b> = {Zamp} Ω</li>
            <li><b>gap</b> = {gap} mm · <b>w</b> = {w_polo} mm — entrehierro y paso polar</li>
            <li><b>ρ_t</b> = {rho_t} nΩ·m · <b>t</b> = {t_gong} mm — bronce del gong</li>
            <li><b>B_sat</b> = {B_sat} T — saturación del núcleo</li>
          </ul>
        </details>

        <Eq
          n="3.1" title="Sección del cobre (A_wire)"
          formula={<>A_wire = π·(d_cobre/2)²</>}
          steps={<>d_cobre = 0.127·92^((36−{awg})/39) = {fx(d_cu_mm, 3)} mm</>}
          result={<>{e(A_wire)} m² · ρ/A = {fx(ohm_m, 4)} Ω/m</>}
          desc="Diámetro del cobre desnudo por la fórmula AWG; de ahí su sección."
        />

        <Eq
          n="3.2" title="Número de vueltas (N)"
          formula={<>N = Rtarget·A_wire / (ρ_Cu·l_vuelta)</>}
          steps={<>N = {Rtarget}·{e(A_wire)} / ({e(1.724e-8, 2)}·{fx(perim / 1000, 3)}) = {fx(N_exact, 1)}</>}
          result={<><strong>{N}</strong> vueltas (⌊·⌋) · L_w = {fx(l_total, 2)} m · R_real = {fx(R_real, 2)} Ω</>}
          desc="Se redondea al entero inferior y se recalcula la resistencia real."
        />

        <Eq
          n="3.3" title="Inductancia (L)"
          formula={<>L = μ₀·μ_eff·N²·Ac / lc</>}
          steps={<>L = (4π×10⁻⁷·{mu_eff}·{N}²·{e(Ac / 1e6)}) / {fx(lc / 1000, 3)}</>}
          result={<><strong>{fx(L_mH, 4)} mH</strong></>}
          desc="Modelo de reluctancia con μ_eff. Es una estimación: mídela con un LCR."
        />

        <Eq
          n="3.4" title="Impedancia en AC (R_ac, X_L, Z, φ)"
          formula={<>R_ac = F_R·R (Dowell) · X_L = ωL · Z = √(R_ac²+X_L²)</>}
          steps={<>δ_Cu = {fx(delta_cu_mm, 2)} mm · F_R({num_layers} capas) = {fx(F_R, 2)} → R_ac = {fx(R_ac, 2)} Ω · X_L = {fx(XL, 1)} Ω</>}
          result={<>Z = <strong>{fx(Z, 1)} Ω</strong> · φ = {fx(phi_deg, 1)}°</>}
          desc="El efecto piel/proximidad sube la R con la frecuencia (castiga alambre grueso multicapa). A mayor f, X_L domina y ahoga la corriente."
        />

        <Eq
          n="3.5" title="Corriente de pico y FMM (sin resonancia)"
          formula={<>I_pico = Vmax/Z · FMM = N·I_pico</>}
          steps={<>I = {Vmax}/{fx(Z, 1)} = {fx(I_pico, 4)} A</>}
          result={<>FMM = <strong>{fx(FMM, 2)}</strong> A·vuelta</>}
          accent="var(--accent-yellow)"
          desc="Voltaje de pico aplicado directamente a la bobina."
        />

        <Eq
          n="3.5b" title={modo_capacitor === 'manual' ? "Resonancia serie manual (C, Q, Z_res, I_res)" : "Resonancia serie (C, Q, I_res)"}
          formula={modo_capacitor === 'manual'
            ? <>C_opt = 1/(ω²L) · Z_res = √(R² + (X_L - 1/(ωC))²) · I_res = Vmax/Z_res</>
            : <>C = 1/(ω²L) · I_res = Vmax/R · Q = X_L/R</>
          }
          steps={modo_capacitor === 'manual'
            ? <>C_opt = {fx(C_res_opt_uF, 3)} µF · C_usado = {fx(C_res_uF, 3)} µF · Z_res = {fx(Zcoil_op, 2)} Ω</>
            : <>C = 1/({fx(omega, 0)}²·{fx(L, 5)}) = {fx(C_res_uF, 3)} µF</>
          }
          result={<>I_res = {fx(I_res, 3)} A · FMM_res = <strong>{fx(FMM_res, 1)}</strong> · Q = {fx(Q, 0)} · V_C ≈ <strong>{fx(V_C_pk, 0)} V pico</strong></>}
          accent="var(--accent-cyan)"
          desc={modo_capacitor === 'manual'
            ? <>Reactancia cancelada parcialmente por C manual. Multiplicador de corriente respecto a directa: Z/Z_res = <strong>×{fx(mult, 1)}</strong>. ⚠ El capacitor ve V_C = I·X_C: usa film/MKP no polarizado con rating ≥ {fx(V_C_pk * 1.5, 0)} V.</>
            : <>La reactancia se cancela y Z colapsa a R_ac. Multiplicador FMM_res/FMM = Z/R_ac = <strong>×{fx(mult, 1)}</strong>. ⚠ El capacitor (y la bobina) ven ≈ Q·V = {fx(V_C_pk, 0)} V pico: film/MKP no polarizado con rating ≥ {fx(V_C_pk * 1.5, 0)} V.</>
          }
        />

        <Eq
          n="3.6" title="Potencia disipada (calor) — límite real"
          formula={<>P = I²·R {usar_resonancia ? '(I_res)' : '(I_pico)'}</>}
          steps={<>P = {fx(usar_resonancia ? I_res : I_pico, 4)}²·{fx(R_real, 2)}</>}
          result={<><strong>{fx(P, 2)} W</strong> pico · ≈ {fx(P_avg, 2)} W promedio</>}
          accent="var(--accent-pink)"
          desc="A cobre fijo R ∝ N², así que FMM ∝ √P: subir N no aumenta la FMM si P es la misma."
        />

        {usar_transformador && (
          <>
            <div className="principle-box" style={{ background: 'rgba(168,85,247,0.10)', borderColor: 'rgba(168,85,247,0.4)' }}>
              <Info size={16} style={{ color: '#a855f7', flexShrink: 0 }} />
              <div>
                <strong>Convención:</strong> <em style={{ color: '#c084fc', fontStyle: 'normal' }}>a = V_secundario / V_primario</em> (a&gt;1 = elevador).
                La impedancia reflejada al primario va por <strong>1/a²</strong>. El transformador adapta impedancia: no crea FMM ni potencia.
              </div>
            </div>

            <Eq
              n="3.7a" title="Relación óptima (auto)"
              formula={<>a_opt = √(|Z_bobina(f_op)| / Zamp)</>}
              steps={<>a = √({fx(Zcoil_op, 1)}/{Zamp}){usar_resonancia ? ' (Z_bobina≈R por resonancia)' : ''}</>}
              result={<>a = <strong>{fx(tx.a, 2)}</strong> · vueltas {tx.turns_ratio}</>}
              accent="#c084fc"
              desc="Con resonancia, Z_bobina≈R en f_op, así que a sale mucho menor."
            />
            <Eq
              n="3.7b" title="Lo que ve el amplificador"
              formula={<>Z_amp_ve = R_pri + Z_bobina/a²</>}
              steps={<>= {params.R_pri} + {fx(Zcoil_op, 1)}/{fx(tx.a * tx.a, 2)}</>}
              result={<>Z_reflejada = {fx(Z_refl, 1)} Ω · ve = <strong>{fx(tx.Zve, 1)} Ω</strong> (Zamp {Zamp})</>}
              accent="#c084fc"
              desc="Incluye la R del primario de T1; por eso el mínimo no toca Zamp exacto."
            />
            <Eq
              n="3.7c" title="Tensión y corrientes"
              formula={<>V_sec = a·V_pri · I_amp = a·I_bobina</>}
              steps={<>V_sec = {fx(tx.V_sec, 2)} V · I_amp = {fx(tx.I_amp, 3)} A</>}
              result={<>I_bobina = <strong>{fx(tx.I_bobina, 3)} A</strong> = V_sec/|Z_bobina|</>}
              accent="var(--accent-yellow)"
              desc="La FMM la da I_bobina (secundario), no la corriente del primario."
            />
            <Eq
              n="3.7d" title="Potencia y eficiencia (balance)"
              formula={<>η = P_bobina / (P_bobina + P_pérdida_T1)</>}
              steps={<>P_ampli {fx(tx.P_total, 2)} = bobina {fx(tx.P_bobina, 2)} + pérdidas {fx(tx.P_loss, 2)} W</>}
              result={<>η = <strong>{fx(tx.eta, 0)} %</strong> · balance {tx.balance_ok ? '✓' : '✗ (bug)'}</>}
              accent={tx.eta >= 80 ? 'var(--accent-green)' : 'var(--accent-pink)'}
              desc="P entregada = P en bobina + pérdidas T1. Siempre debe cerrar."
            />
          </>
        )}

        <Eq
          n="3.8" title="Factor de llenado del carrete"
          formula={<>v/capa = ⌊hw/d_ext⌋ · capas = ⌈N/v⌉ · N_max = v·⌊dw/d_ext⌋</>}
          steps={<>⌊{hw}/d_ext⌋ = {turns_per_layer} v/capa · {num_layers} capas · máx {layers_max} capas</>}
          result={<>N_max = <strong>{N_max}</strong> · llenado = {isFinite(fill_percent) ? fx(fill_percent, 1) : '∞'}%</>}
          desc="Empaquetado por capas con el diámetro esmaltado. >100 % no cabe físicamente."
        />

        <div className="principle-box" style={{ background: 'rgba(0,200,255,0.08)', borderColor: 'rgba(0,200,255,0.35)' }}>
          <Info size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <div>
            <strong>Del circuito a la física del gong:</strong> el bronce no es magnético — la fuerza nace de las
            corrientes de Foucault que induce el flujo variable (Ley de Lenz) y es <em>siempre de repulsión</em>.
            Como F ∝ B², con seno puro a f el empuje tiene una parte constante y una oscilación a <strong>2f</strong>.
          </div>
        </div>

        <Eq
          n="3.9" title="Campo en el núcleo y saturación"
          formula={<>B = μ₀·μ_eff·FMM / lc</>}
          steps={<>B = 4π×10⁻⁷·{mu_eff}·{fx(FMM_op, 0)} / {fx(lc / 1000, 3)}</>}
          result={<><strong>{fx(B_core_pk * 1000, 0)} mT</strong> pico · {fx(sat_pct, 0)}% de B_sat ({fx(B_sat * 1000, 0)} mT) {sat_ok ? '✓' : '⚠ SATURA'}</>}
          accent={sat_ok ? undefined : 'var(--accent-pink)'}
          desc="Si B toca B_sat, μ_eff colapsa: cae L, se desafina la resonancia y aparecen armónicos duros. Con B limitado, la fuerza extra se gana con más Ac."
        />

        <Eq
          n="3.10" title="Campo que llega al bronce (entrehierro)"
          formula={<>B_gap = B·e^(−π·gap/w)</>}
          steps={<>e^(−π·{gap}/{w_polo}) = ×{fx(decay_gap, 2)}</>}
          result={<><strong>{fx(B_gap_pk * 1000, 1)} mT</strong> en la cara del gong</>}
          desc="El campo de un núcleo E decae exponencialmente al alejarse: cada mm de entrehierro cuesta fuerza. w grande = campo de mayor alcance."
        />

        <Eq
          n="3.11" title="Corrientes de Foucault en el bronce (K)"
          formula={<>δ_t = √(2ρ_t/ωμ₀) · S = ωμ₀·t_eff·w/(2πρ_t) · K = S²/(1+S²)</>}
          steps={<>δ_t = {fx(delta_t_mm, 1)} mm · t_eff = {fx(t_eff_mm, 1)} mm · S = {fx(S_shield, 2)}</>}
          result={<>K = <strong>{fx(K_eddy * 100, 1)} %</strong> del empuje ideal</>}
          accent="var(--accent-cyan)"
          desc="El bronce reacciona mejor cuanto más rápido cambia el flujo (Lenz): K crece con f y satura en 1. Por eso el gong responde mejor arriba de ~100 Hz."
        />

        <Eq
          n="3.12" title="Fuerza de repulsión sobre el gong"
          formula={<>F_med = B_gap²·Ac·K/(4μ₀) · F(t) = F_med·(1−cos 2ωt)</>}
          steps={<>F_med = ({fx(B_gap_pk * 1000, 1)} mT)²·{Ac} mm²·{fx(K_eddy, 3)}/(4μ₀)</>}
          result={<><strong>{fmtForce(F_avg)}</strong> medio · oscila ±{fmtForce(F_ac)} a <strong>{Math.round(f_mech)} Hz</strong></>}
          accent="var(--accent-cyan)"
          desc="Presión de Maxwell × acoplamiento K. Modelo de primer orden: el orden de magnitud y las tendencias son fiables; calibra el valor absoluto en banco."
        />

        <div className="lcr-warning">
          <strong>⚠ Calibra con un LCR.</strong> L (y por tanto C de resonancia) es muy sensible al μ_eff real
          de un núcleo en E abierto. Trata estos valores como punto de partida y mide la bobina física para afinar C.
        </div>
      </div>
    </div>
  );
}
