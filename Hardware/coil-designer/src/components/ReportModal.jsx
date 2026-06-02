import { useState } from 'react';
import { X, Download, FileText } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, params, results, recommendedAWG }) {
  const [sections, setSections] = useState({ part1: true, part2: true, part3: true });

  if (!isOpen) return null;

  const handleToggle = (key) => setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const buildAssemblyDiagram = () => {
    const { Vmax, Zamp, awg, usar_resonancia, usar_transformador } = params;
    const { N, R_real, L_mH, C_res_uF, tx } = results;
    const e = (x, d = 2) => (isFinite(x) ? x.toFixed(d) : '—');

    const center = (s, w = 18) => {
      s = String(s).slice(0, w);
      const pad = w - s.length;
      const l = Math.floor(pad / 2);
      return ' '.repeat(l) + s + ' '.repeat(pad - l);
    };
    const tee = '   +--------+---------+';
    const conn = '            |';
    const lbl = (s, note) => `   |${center(s)}|${note ? '   ' + note : ''}`;

    const lines = [];
    lines.push(tee);
    lines.push(lbl('AMPLIFICADOR', `Zamp = ${Zamp} ohm · Vmax = ${Vmax} V pico`));
    lines.push(tee);
    lines.push(`${conn}   senal de audio (100-2000 Hz)`);
    if (usar_transformador) {
      lines.push(tee);
      lines.push(lbl('TRANSFORMADOR', `a = ${e(tx.a)} (V_sec/V_pri)`));
      lines.push(tee);
      lines.push(conn);
    }
    if (usar_resonancia) {
      lines.push(tee);
      lines.push(lbl('CAPACITOR (C)', `C = ${e(C_res_uF, 3)} uF  (cancela X_L)`));
      lines.push(tee);
      lines.push(conn);
    }
    lines.push(tee);
    lines.push(lbl('BOBINA  (nucleo E)', `N = ${N} vueltas · AWG ${awg}`));
    lines.push(lbl('', `R = ${e(R_real)} ohm · L = ${e(L_mH, 1)} mH`));
    lines.push(tee);
    lines.push(`${conn}|   entrehierro de aire (sin contacto)`);
    lines.push('    ~~~~~~~~~~~~~~~~~~~~~   GONG de bronce');
    lines.push('                          -> corrientes de Foucault -> sonido');

    return `\`\`\`text\n${lines.join('\n')}\n\`\`\`

\`\`\`mermaid
flowchart LR
  A["Amplificador<br/>${Zamp} ohm · ${Vmax} V pico"]${usar_transformador ? ` --> X["Transformador T1<br/>a = ${e(tx.a)}"]` : ''} --> ${usar_resonancia ? `C["Capacitor serie<br/>${e(C_res_uF, 3)} µF"] --> ` : ''}B["Bobina núcleo E<br/>N ${N} · AWG ${awg}<br/>R ${e(R_real)} ohm · L ${e(L_mH, 1)} mH"]
  B -. "entrehierro de aire" .-> G["Gong de bronce<br/>corrientes de Foucault"]
\`\`\`
`;
  };

  const generateMarkdown = () => {
    const {
      Vmax, Rtarget, f, mu_eff, Ac, lc, awg, hw, dw, perim,
      Zamp, usar_resonancia, usar_transformador,
    } = params;
    const {
      d_cu_mm, d_ext_mm, A_wire, ohm_m, i_safe_rms, N_exact, N, l_total, R_real,
      L_mH, omega, XL, Z, Zcoil_op, phi_deg, I_pico, FMM,
      C_res_uF, C_res, I_res, FMM_res, FMM_op, Q, mult, P, P_avg,
      a_opt, Z_load, Z_seen, match, tx, I_op, I_op_rms, current_ok, current_use_pct,
      turns_per_layer, layers_max, num_layers, N_max, fill_percent, overflow,
    } = results;

    const e = (x, d = 3) => (isFinite(x) ? x.toExponential(d) : '—');
    const fx = (x, d = 2) => (isFinite(x) ? x.toFixed(d) : '—');

    let md = `# Reporte de Diseño de Bobina Electromagnética\n`;
    md += `*Coil Designer — Excitación acústica por inducción · Gong de bronce*\n\n`;
    md += `> **Principio rector:** la FMM la limitan la potencia disipable y el volumen de cobre, no el nº de vueltas. `;
    md += `Con el carrete lleno, FMM ∝ √P. El calibre fija la impedancia a la que trabaja el amplificador; `;
    md += `la resonancia serie cancela X_L y multiplica la corriente por Q.\n\n`;

    if (sections.part1) {
      md += `## 1. Datos Prácticos de Fabricación\n\n`;
      md += `- **Calibre del alambre (AWG)**: ${awg}`;
      md += recommendedAWG ? ` · recomendado: **AWG ${recommendedAWG.awg}**\n` : `\n`;
      md += `- **Diámetro del cobre desnudo**: ${fx(d_cu_mm, 3)} mm\n`;
      md += `- **Diámetro exterior con esmalte**: ${fx(d_ext_mm, 3)} mm\n`;
      md += `- **Número total de vueltas (N)**: ${N} vueltas\n`;
      md += `- **Longitud total de alambre (L_w)**: ${fx(l_total, 2)} m\n`;
      md += `- **Perímetro medio por vuelta**: ${perim} mm\n`;
      md += `- **Tipo de núcleo**: 'E' abierto con entrehierro de aire (μ_eff = ${mu_eff})\n`;
      md += `- **Área del núcleo (Ac)**: ${Ac} mm² = ${(Ac / 100).toFixed(1)} cm²\n`;
      md += `- **Camino magnético (lc)**: ${lc} mm\n`;
      md += `- **Ventana del carrete (alto × prof.)**: ${hw} mm × ${dw} mm\n`;
      md += `- **Vueltas por capa / nº de capas**: ${turns_per_layer} / ${num_layers}\n`;
      md += `- **Capacidad máx. del carrete (N_max)**: ${N_max} vueltas\n`;
      md += `- **Factor de llenado**: ${isFinite(fill_percent) ? fx(fill_percent, 1) : '∞'} %`;
      md += overflow ? ` ⚠ **EXCEDE EL CARRETE**\n\n` : `\n\n`;
    }

    if (sections.part2) {
      md += `## 2. Especificaciones Técnicas y Operación\n\n`;
      md += `### Diagrama de montaje\n\n`;
      md += `Conexión en serie: amplificador → ${usar_transformador ? 'transformador → ' : ''}${usar_resonancia ? 'capacitor de resonancia → ' : ''}bobina sobre núcleo en 'E', enfrentada sin contacto al gong.\n\n`;
      md += buildAssemblyDiagram();
      md += `\n`;

      md += `### Parámetros de operación\n\n`;
      md += `- **Voltaje de pico (Vmax)**: ${Vmax} V (${fx(Vmax * 2, 2)} Vpp)\n`;
      md += `- **Frecuencia de operación (f)**: ${f} Hz\n`;
      md += `- **Resistencia DC de la bobina (Rtarget)**: ${Rtarget} Ω · real con N entero = ${fx(R_real, 2)} Ω\n`;
      md += `- **Inductancia (L)**: ${fx(L_mH, 4)} mH\n`;
      md += `- **Impedancia (Z) @ ${f} Hz**: ${fx(Z, 2)} Ω · fase φ = ${fx(phi_deg, 1)}°\n`;
      md += `- **Adaptación al amplificador**: ${usar_transformador ? 'a través de T1 ve' : 've'} ${fx(Z_seen, 1)} Ω frente a Zamp ${Zamp} Ω (${fx(match.ratio, 2)}×) → **${match.label}**\n`;
      if (usar_resonancia) {
        md += `- **Capacitor de resonancia serie (C)**: ${fx(C_res_uF, 3)} µF (${e(C_res)} F)\n`;
        md += `- **Factor de calidad (Q)**: ${fx(Q, 1)} → multiplica la corriente ×${fx(mult, 1)}\n`;
        md += `- **Corriente en resonancia (I_res)**: ${fx(I_res, 3)} A pico\n`;
      } else {
        md += `- **Corriente directa de pico (I)**: ${fx(I_pico, 4)} A\n`;
      }
      md += `- **Corriente de operación**: ${fx(I_op, 3)} A pico (${fx(I_op_rms, 3)} A rms) · `;
      md += current_ok ? `seguro (${fx(current_use_pct, 0)}% del límite del AWG ${awg}, ${fx(i_safe_rms, 2)} A rms)\n` : `⚠ **SOBRECORRIENTE** para AWG ${awg} (límite ${fx(i_safe_rms, 2)} A rms) — sube el calibre\n`;
      md += `- **Potencia disipada (P = I²·R)**: ${fx(P, 2)} W pico · ≈ ${fx(P_avg, 2)} W promedio\n`;
      md += `- **FMM (empuje sobre el gong)**: ${fx(FMM_op, 1)} A·vuelta${usar_resonancia ? ` (resonancia) — directa serían ${fx(FMM, 1)}` : ''}\n`;
      md += `\n`;

      if (usar_transformador) {
        md += `### Transformador de adaptación T1\n\n`;
        md += `- **Relación a = V_sec/V_pri**: ${fx(tx.a, 2)} (inversa ${fx(tx.a_inv, 2)}) · vueltas pri:sec ≈ ${tx.turns_ratio} · modo ${tx.mode}\n`;
        md += `- **Impedancia reflejada a f_op**: ${fx(tx.Z_refl_mag, 1)} Ω · el ampli ve ${fx(tx.Zve, 1)} Ω (objetivo ${Zamp} Ω)\n`;
        md += `- **Tensión de pico en el secundario (V_sec)**: ${fx(tx.V_sec, 2)} V\n`;
        md += `- **Corriente de primario (I_amp)**: ${fx(tx.I_amp, 3)} A · **secundario (I_bobina)**: ${fx(tx.I_bobina, 3)} A\n`;
        md += `- **Reparto de potencia**: bobina ${fx(tx.P_bobina, 2)} W · pérdidas T1 ${fx(tx.P_loss, 2)} W (R_pri ${fx(tx.P_Rpri, 2)} + R_sec ${fx(tx.P_Rsec, 2)} + acoplamiento ${fx(tx.P_coupling, 2)})\n`;
        md += `- **Eficiencia de acoplamiento (η)**: ${fx(tx.eta, 0)} % · balance energético ${tx.balance_ok ? '✓ cierra' : '✗ ROTO (bug)'}\n`;
        md += `- **Saturación de T1**: ${tx.sat_risk ? `⚠ riesgo a ${f} Hz con V_sec = ${fx(tx.V_sec, 1)} V (B ∝ V_sec/f) — usa un núcleo mayor para T1` : 'sin riesgo aparente; vigila a frecuencias bajas con V_sec alto'}\n`;
        md += `\n`;
      }
    }

    if (sections.part3) {
      md += `## 3. Resolución Matemática\n\n`;
      md += `### Glosario\n`;
      md += `- **ρ_Cu** = 1.724×10⁻⁸ Ω·m (resistividad del cobre @20 °C)\n`;
      md += `- **μ₀** = 4π×10⁻⁷ H/m (permeabilidad del vacío)\n`;
      md += `- **μ_eff** = ${mu_eff} · **Ac** = ${e(Ac / 1e6)} m² · **lc** = ${fx(lc / 1000, 3)} m\n`;
      md += `- **l_vuelta** = ${fx(perim / 1000, 3)} m · **Vmax** = ${Vmax} V · **f** = ${f} Hz\n\n`;

      md += `### 3.1 Sección del cobre\n`;
      md += `\`d_cobre = 0.127·92^((36-${awg})/39) = ${fx(d_cu_mm, 3)} mm\`\n`;
      md += `\`A_wire = π·(d/2)² = ${e(A_wire)} m²\`  →  \`ρ/A = ${fx(ohm_m, 4)} Ω/m\`\n\n`;

      md += `### 3.2 Número de vueltas\n`;
      md += `\`N = Rtarget·A_wire/(ρ_Cu·l_vuelta) = ${fx(N_exact, 1)} → ${N} (⌊·⌋)\`\n`;
      md += `\`L_w = N·l_vuelta = ${fx(l_total, 2)} m\`  ·  \`R_real = ρ·L_w/A_wire = ${fx(R_real, 2)} Ω\`\n\n`;

      md += `### 3.3 Inductancia\n`;
      md += `\`L = μ₀·μ_eff·N²·Ac/lc = ${fx(L_mH, 4)} mH\`\n\n`;

      md += `### 3.4 Impedancia en AC\n`;
      md += `\`ω = 2πf = ${fx(omega, 0)} rad/s\`  ·  \`X_L = ωL = ${fx(XL, 1)} Ω\`\n`;
      md += `\`Z = √(R²+X_L²) = ${fx(Z, 2)} Ω\`  ·  \`φ = atan2(X_L,R) = ${fx(phi_deg, 1)}°\`\n\n`;

      md += `### 3.5 Corriente y FMM (directa)\n`;
      md += `\`I_pico = Vmax/Z = ${fx(I_pico, 4)} A\`  ·  \`FMM = N·I = ${fx(FMM, 2)} A·vuelta\`\n\n`;

      md += `### 3.5b Resonancia serie\n`;
      md += `\`C = 1/(ω²L) = ${fx(C_res_uF, 3)} µF\`\n`;
      md += `\`I_res = Vmax/R = ${fx(I_res, 3)} A\`  ·  \`Q = X_L/R = ${fx(Q, 1)}\`\n`;
      md += `\`FMM_res = N·I_res = ${fx(FMM_res, 1)} A·vuelta\`  ·  \`FMM_res/FMM = Z/R = ×${fx(mult, 1)}\`\n\n`;

      md += `### 3.6 Potencia (límite físico de la FMM)\n`;
      md += `\`P = I²·R = ${fx(P, 2)} W\` (pico) · ≈ ${fx(P_avg, 2)} W (promedio sinusoidal)\n`;
      md += `> Como R ∝ N² a volumen de cobre fijo, **FMM ∝ √P**: subir N no aumenta la FMM si P es la misma.\n\n`;

      md += `### 3.7 Adaptación de impedancia\n`;
      md += `\`Carga de la bobina = ${usar_resonancia ? 'R (en resonancia)' : 'Z'} = ${fx(Z_load, 2)} Ω\`  vs  \`Zamp = ${Zamp} Ω\` → ${match.label}\n\n`;
      if (usar_transformador) {
        md += `**Transformador T1** (convención a = V_sec/V_pri):\n`;
        md += `\`a_opt = √(|Z_bobina(f_op)|/Zamp) = √(${fx(Zcoil_op, 2)}/${Zamp}) = ${fx(a_opt, 2)}\`\n`;
        md += `\`Z_reflejada = Z_bobina/a² = ${fx(tx.Z_refl_mag, 2)} Ω\`  ·  \`Z_amp_ve = R_pri + Z/a² = ${fx(tx.Zve, 2)} Ω\`\n`;
        md += `\`V_sec = a·V_pri ⇒ ${fx(tx.V_sec, 2)} V\`  ·  \`I_bobina = V_sec/|Z_bobina| = ${fx(tx.I_bobina, 3)} A\`  ·  \`I_amp = a·I_bobina = ${fx(tx.I_amp, 3)} A\`\n`;
        md += `\`η = P_bobina/(P_bobina+P_pérdida_T1) = ${fx(tx.P_bobina, 2)}/(${fx(tx.P_bobina, 2)}+${fx(tx.P_loss, 2)}) = ${fx(tx.eta, 0)} %\`\n`;
        md += `> **Verificación de conservación**: P_ampli = ${fx(tx.P_total, 3)} W ; P_bobina + pérdidas = ${fx(tx.P_bobina + tx.P_loss, 3)} W → ${tx.balance_ok ? 'cierra ✓' : 'NO cierra ✗ (bug)'}\n`;
      }
      md += `\n`;

      md += `### 3.8 Capacidad del carrete por capas\n`;
      md += `\`v/capa = ⌊hw/d_ext⌋ = ⌊${hw}/${fx(d_ext_mm, 3)}⌋ = ${turns_per_layer}\`\n`;
      md += `\`capas usadas = ⌈N/v⌉ = ${num_layers}\`  ·  \`capas máx = ⌊dw/d_ext⌋ = ${layers_max}\`\n`;
      md += `\`N_max = ${turns_per_layer}·${layers_max} = ${N_max}\`  ·  \`llenado = ${isFinite(fill_percent) ? fx(fill_percent, 1) : '∞'}%\`\n\n`;
    }

    md += `---\n*Recuerda medir la bobina real con un LCR: L (y el capacitor de resonancia) es muy sensible al μ_eff de un núcleo en E abierto.*\n`;
    return md;
  };

  const downloadReport = () => {
    const content = generateMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Bobina_AWG${params.awg}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const anySelected = sections.part1 || sections.part2 || sections.part3;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-card" onClick={(ev) => ev.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>

        <h2 className="modal-title"><FileText color="var(--accent-cyan)" /> Exportar reporte (.md)</h2>
        <p className="modal-desc">
          Elige las secciones a incluir. El documento refleja exactamente la configuración actual en pantalla.
        </p>

        <div className="modal-options">
          <label className="modal-option">
            <input type="checkbox" checked={sections.part1} onChange={() => handleToggle('part1')} />
            <div>
              <div className="modal-option-title">1 · Datos prácticos de fabricación</div>
              <div className="modal-option-desc">AWG, diámetros, N, longitud de alambre, núcleo, carrete y llenado.</div>
            </div>
          </label>
          <label className="modal-option">
            <input type="checkbox" checked={sections.part2} onChange={() => handleToggle('part2')} />
            <div>
              <div className="modal-option-title">2 · Especificaciones técnicas y operación</div>
              <div className="modal-option-desc">Diagrama de montaje + Vmax, f, I, P, Z, adaptación, C, Q, FMM.</div>
            </div>
          </label>
          <label className="modal-option">
            <input type="checkbox" checked={sections.part3} onChange={() => handleToggle('part3')} />
            <div>
              <div className="modal-option-title">3 · Resolución matemática</div>
              <div className="modal-option-desc">Glosario y desglose paso a paso con todos los valores sustituidos.</div>
            </div>
          </label>
        </div>

        <button className="modal-download" onClick={downloadReport} disabled={!anySelected}>
          <Download size={20} /> Descargar archivo .md
        </button>
      </div>
    </div>
  );
}
