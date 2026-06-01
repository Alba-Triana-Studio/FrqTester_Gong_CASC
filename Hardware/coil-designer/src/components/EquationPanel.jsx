import { useState } from 'react';
import { ChevronRight, ChevronLeft, Sigma, Info } from 'lucide-react';

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

  const { Vmax, Rtarget, f, mu_eff, Ac, lc, awg, perim, hw, Zamp, usar_resonancia, usar_transformador } = params;
  const {
    d_cu_mm, A_wire, ohm_m, N_exact, N, l_total, R_real,
    L, L_mH, omega, XL, Z, phi_deg, I_pico, FMM,
    C_res_uF, I_res, FMM_res, Q, mult, P, P_avg,
    a_opt, Z_refl, Z_op, turns_per_layer, layers_max, num_layers, N_max, fill_percent,
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
            <li><b>Vmax</b> = {Vmax} V pico · <b>f</b> = {f} Hz · <b>Zamp</b> = {Zamp} Ω</li>
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
          n="3.4" title="Impedancia en AC (ω, X_L, Z, φ)"
          formula={<>ω = 2πf · X_L = ωL · Z = √(R²+X_L²) · φ = atan2(X_L,R)</>}
          steps={<>ω = {fx(omega, 0)} rad/s · X_L = {fx(XL, 1)} Ω</>}
          result={<>Z = <strong>{fx(Z, 1)} Ω</strong> · φ = {fx(phi_deg, 1)}°</>}
          desc="A mayor f, X_L domina y la impedancia ahoga la corriente."
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
          n="3.5b" title="Resonancia serie (C, Q, I_res)"
          formula={<>C = 1/(ω²L) · I_res = Vmax/R · Q = X_L/R</>}
          steps={<>C = 1/({fx(omega, 0)}²·{fx(L, 5)}) = {fx(C_res_uF, 3)} µF</>}
          result={<>I_res = {fx(I_res, 3)} A · FMM_res = <strong>{fx(FMM_res, 1)}</strong> · Q = {fx(Q, 0)}</>}
          accent="var(--accent-cyan)"
          desc={<>La reactancia se cancela y Z colapsa a R. Multiplicador FMM_res/FMM = Z/R = <strong>×{fx(mult, 1)}</strong>.</>}
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
          <Eq
            n="3.7" title="Adaptación con transformador"
            formula={<>a_opt = √(Z/Zamp) · Z_refl = Z/a²</>}
            steps={<>a = √({fx(Z_op, 1)}/{Zamp}) = {fx(a_opt, 2)} : 1</>}
            result={<>Z_reflejada = <strong>{fx(Z_refl, 1)} Ω</strong> (objetivo {Zamp} Ω)</>}
            desc="Refleja la impedancia de la bobina a la del amplificador."
          />
        )}

        <Eq
          n="3.8" title="Factor de llenado del carrete"
          formula={<>v/capa = ⌊hw/d_ext⌋ · capas = ⌈N/v⌉ · N_max = v·⌊dw/d_ext⌋</>}
          steps={<>⌊{hw}/d_ext⌋ = {turns_per_layer} v/capa · {num_layers} capas · máx {layers_max} capas</>}
          result={<>N_max = <strong>{N_max}</strong> · llenado = {isFinite(fill_percent) ? fx(fill_percent, 1) : '∞'}%</>}
          desc="Empaquetado por capas con el diámetro esmaltado. >100 % no cabe físicamente."
        />

        <div className="lcr-warning">
          <strong>⚠ Calibra con un LCR.</strong> L (y por tanto C de resonancia) es muy sensible al μ_eff real
          de un núcleo en E abierto. Trata estos valores como punto de partida y mide la bobina física para afinar C.
        </div>
      </div>
    </div>
  );
}
