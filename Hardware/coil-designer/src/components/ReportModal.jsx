import { useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { fmtForce } from '../engine/coilMath';
import { buildSystemDiagramSvg, buildTransformerDetailSvg } from '../engine/diagramSvg';

// Rasteriza un SVG (string) a PNG data-URL usando el propio navegador.
// scale=2 para que la imagen quede nítida en el documento.
function svgToPngDataUrl(svgStr, scale = 2) {
  return new Promise((resolve, reject) => {
    const m = svgStr.match(/width="(\d+)"\s+height="(\d+)"/);
    const w = m ? parseInt(m[1]) : 1160;
    const h = m ? parseInt(m[2]) : 660;
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) { reject(err); }
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
  });
}

export default function ReportModal({ isOpen, onClose, params, results, recommendedAWG }) {
  const [sections, setSections] = useState({ part1: true, part2: true, part3: true });
  const [format, setFormat] = useState('md'); // 'md' o 'docx'

  if (!isOpen) return null;

  const handleToggle = (key) => setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const buildAssemblyDiagram = () => {
    const { Vmax, Zamp, awg, usar_resonancia, usar_transformador, modo_capacitor } = params;
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
      const modeStr = modo_capacitor === 'manual' ? 'manual' : 'auto';
      lines.push(tee);
      lines.push(lbl('CAPACITOR (C)', `C = ${e(C_res_uF, 3)} uF (${modeStr})`));
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
  A["Amplificador<br/>${Zamp} ohm · ${Vmax} V pico"]${usar_transformador ? ` --> X["Transformador T1<br/>a = ${e(tx.a)}"]` : ''} --> ${usar_resonancia ? `C["Capacitor serie<br/>${e(C_res_uF, 3)} µF<br/>(${modo_capacitor === 'manual' ? 'manual' : 'auto'})"] --> ` : ''}B["Bobina núcleo E<br/>N ${N} · AWG ${awg}<br/>R ${e(R_real)} ohm · L ${e(L_mH, 1)} mH"]
  B -. "entrehierro de aire" .-> G["Gong de bronce<br/>corrientes de Foucault"]
\`\`\`
`;
  };

  const generateMarkdown = (images = {}) => {
    const {
      Vmax, Rtarget, f, mu_eff, Ac, lc, awg, hw, dw, perim,
      Zamp, usar_resonancia, usar_transformador,
      modo_capacitor, filtrar_comerciales,
      gap, w_polo, rho_t, t_gong, B_sat,
    } = params;
    const {
      d_cu_mm, d_ext_mm, A_wire, ohm_m, i_safe_rms, N_exact, N, l_total, R_real,
      delta_cu_mm, F_R, R_ac,
      L_mH, omega, XL, Z, Zcoil_op, phi_deg, I_pico, FMM,
      C_res_uF, C_res_opt_uF, C_res, I_res, FMM_res, FMM_op, Q, mult, P, P_avg,
      V_C_pk, A_surf_cm2, deltaT_est,
      B_core_pk, sat_pct, sat_ok, decay_gap, B_gap_pk,
      delta_t_mm, t_eff_mm, S_shield, K_eddy, F_avg, F_ac, F_pk, F_avg_gf, f_mech,
      lcr_active, R_ref, P_gong, eta_gong,
      a_opt, Z_load, Z_seen, match, tx, I_op, I_op_rms, current_ok, current_use_pct,
      turns_per_layer, layers_max, num_layers, N_max, fill_percent, overflow,
    } = results;

    const e = (x, d = 3) => (isFinite(x) ? x.toExponential(d) : '—');
    const fx = (x, d = 2) => (isFinite(x) ? x.toFixed(d) : '—');

    let md = `# Reporte de Diseño de Bobina Electromagnética\n`;
    md += `*Coil Designer — Excitación acústica por inducción · Gong de bronce*\n\n`;
    md += `> **Principio rector:** la fuerza sobre el bronce (no magnético) es de repulsión por corrientes de Foucault: `;
    md += `F ≈ (B_gap²·Ac/4μ₀)·K(f), y con seno puro **el gong vibra a 2·f eléctrica**. `;
    md += `La FMM la limitan la potencia disipable y el volumen de cobre (FMM ∝ √P, no el nº de vueltas); `;
    md += `B = μ₀·μ_eff·FMM/lc hasta la saturación del núcleo; la resonancia serie cancela X_L y multiplica la corriente por Q.\n\n`;

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

      if (usar_transformador) {
        md += `### Plano del transformador T1\n\n`;
        if (images.txPng) {
          md += `![Plano del transformador T1 con terminales y datos](${images.txPng})\n\n`;
        } else {
          md += `*(No se pudo rasterizar el plano de T1 — ábrelo en la aplicación.)*\n\n`;
        }
        md += `- **Relación a = V_sec/V_pri**: ${fx(tx.a, 2)} (${tx.a >= 1 ? 'elevador' : 'reductor'}) · vueltas pri:sec ≈ **${tx.turns_ratio}** · k = ${fx(tx.k, 2)}\n`;
        md += `- **Devanados**: primario R_pri = ${fx(params.R_pri, 1)} Ω (al amplificador) · secundario R_sec = ${fx(params.R_sec, 2)} Ω (a ${usar_resonancia ? 'C y ' : ''}bobina)\n`;
        md += `- **Operación**: ${fx(Vmax, 2)} Vp → ${fx(tx.V_sec, 1)} Vp · ${fx(tx.I_amp, 2)} A pk → ${fx(tx.I_bobina, 2)} A pk · η = ${fx(tx.eta, 0)}%\n`;
        md += `- **Núcleo**: acorazado (EI o toroidal de audio/línea) · potencia nominal ≥ **${fx(Math.max(tx.P_total, 5), 0)} W continuos** a ${f} Hz\n`;
        md += `- **Flujo**: índice V_sec/f = ${tx.flux_index.toExponential(2)} V·s — ${tx.sat_risk ? '⚠ riesgo de saturación: usa núcleo mayor o sube f' : 'sin riesgo aparente ✓'}\n`;
        md += `- **Fase**: respeta los puntos (P1/S1 = inicio de devanado) para conservar la polaridad\n\n`;
      } else {
        md += `*Topología sin transformador: no se requiere fabricar T1.*\n\n`;
      }
    }

    if (sections.part2) {
      md += `## 2. Especificaciones Técnicas y Operación\n\n`;
      md += `### Diagrama de montaje\n\n`;
      md += `Conexión en serie: amplificador → ${usar_transformador ? 'transformador → ' : ''}${usar_resonancia ? 'capacitor de resonancia → ' : ''}bobina sobre núcleo en 'E', enfrentada sin contacto al gong.\n\n`;
      if (images.sysPng) {
        md += `![Plano completo del sistema: isométrico con cotas, camino magnético, cobre, gong y cadena eléctrica con V/I/P por sección](${images.sysPng})\n\n`;
        md += `*Plano del sistema tal como se ve en la aplicación: isométrico con cotas (mm), camino magnético lc, cobre en la ventana, distancia al gong, y cadena eléctrica con V, I y P̄ de cada sección.*\n\n`;
      } else {
        md += `*(No se pudo rasterizar el plano del sistema — está disponible en la aplicación.)*\n\n`;
      }
      md += `#### Diagrama de conexiones (esquema de texto)\n\n`;
      md += buildAssemblyDiagram();
      md += `\n`;

      // --- Lista de materiales (BOM) ---
      const matNucleo = params.B_sat <= 0.6 ? 'ferrita' : 'acero laminado (Fe-Si)';
      const pesoCu = results.V_cu * 8.96e6; // g (densidad del cobre 8.96 g/cm³)
      md += `#### Lista de materiales (BOM)\n\n`;
      md += `| # | Componente | Especificación | Cant. |\n`;
      md += `|---|---|---|---|\n`;
      md += `| 1 | Alambre magneto esmaltado | AWG ${awg} · Ø Cu ${fx(d_cu_mm, 3)} mm (ext. ${fx(d_ext_mm, 3)}) · ${fx(l_total * 1.1, 1)} m (incluye 10% de margen) · ≈ ${fx(pesoCu, 0)} g | 1 rollo |\n`;
      md += `| 2 | Núcleo en 'E' (${matNucleo}) | Ac = ${Ac} mm² (polo ≈ ${fx(Math.sqrt(Ac), 1)}×${fx(Math.sqrt(Ac), 1)} mm) · lc = ${lc} mm · paso polar w = ${w_polo} mm · B_sat ≥ ${fx(B_sat, 2)} T | 1 |\n`;
      md += `| 3 | Carrete / bobbin | ventana ${hw} × ${dw} mm (para ${N} vueltas en ${num_layers} capas) | 1 |\n`;
      if (usar_resonancia) {
        md += `| 4 | Capacitor de resonancia | ${fx(C_res_uF, 3)} µF film/MKP **no polarizado** · ≥ ${fx(V_C_pk * 1.5, 0)} V DC · ≥ ${fx(I_op_rms, 2)} A rms${modo_capacitor === 'manual' && filtrar_comerciales ? ' (valor comercial E12)' : ''} | 1 |\n`;
      }
      if (usar_transformador) {
        md += `| 5 | Transformador T1 | relación ${tx.turns_ratio} (a = ${fx(tx.a, 2)}) · ≥ ${fx(Math.max(tx.P_total, 5), 0)} W · R_pri ${fx(params.R_pri, 1)} Ω / R_sec ${fx(params.R_sec, 2)} Ω | 1 |\n`;
      }
      md += `| 6 | Amplificador de audio | Z nominal ${Zamp} Ω · ≥ ${fx(Math.max((usar_transformador ? tx.P_total : P) * 1.5, 5), 0)} W programa · banda de trabajo ${f} Hz | 1 (existente) |\n`;
      md += `| 7 | Soporte / separador de montaje | fija el entrehierro bobina–gong en ${gap} mm, sin contacto (rígido, no magnético) | 1 |\n`;
      md += `| 8 | Cable de altavoz + terminales | sección ≥ 0.75 mm² · largo según instalación | — |\n\n`;

      // --- Conexiones paso a paso ---
      md += `#### Conexiones paso a paso\n\n`;
      const steps = [];
      if (usar_transformador) {
        steps.push(`**Salida (+) del amplificador** → terminal **P1** del primario de T1 (respeta el punto de fase).`);
        steps.push(`Terminal **P2** del primario → **salida (−) del amplificador** (cierra el lazo primario).`);
        if (usar_resonancia) {
          steps.push(`Terminal **S1** del secundario → **terminal 1 del capacitor C** (${fx(C_res_uF, 3)} µF, en serie).`);
          steps.push(`**Terminal 2 del capacitor C** → terminal **A** de la bobina.`);
          steps.push(`Terminal **B** de la bobina → terminal **S2** del secundario (cierra el lazo secundario).`);
        } else {
          steps.push(`Terminal **S1** del secundario → terminal **A** de la bobina.`);
          steps.push(`Terminal **B** de la bobina → terminal **S2** del secundario (cierra el lazo secundario).`);
        }
      } else if (usar_resonancia) {
        steps.push(`**Salida (+) del amplificador** → **terminal 1 del capacitor C** (${fx(C_res_uF, 3)} µF, siempre EN SERIE).`);
        steps.push(`**Terminal 2 del capacitor C** → terminal **A** de la bobina.`);
        steps.push(`Terminal **B** de la bobina → **salida (−) del amplificador**.`);
      } else {
        steps.push(`**Salida (+) del amplificador** → terminal **A** de la bobina.`);
        steps.push(`Terminal **B** de la bobina → **salida (−) del amplificador**.`);
      }
      steps.push(`Monta la bobina con el polo central enfrentado al centro del gong y fija el entrehierro en **${gap} mm** (verifica que el gong nunca toque el núcleo al vibrar).`);
      steps.push(`Antes de dar señal: mide L y R de la bobina con el LCR y ajusta C si es necesario (L real ≠ L calculada).`);
      steps.forEach((st, i) => { md += `${i + 1}. ${st}\n`; });
      md += `\n`;
      if (usar_resonancia) {
        md += `> ⚠ **Seguridad**: en resonancia el capacitor y la bobina alcanzan ≈ **${fx(V_C_pk, 0)} V pico**. No toques terminales con la señal activa y usa conexiones aisladas.\n\n`;
      }

      md += `### Parámetros de operación\n\n`;
      md += `- **Voltaje de pico (Vmax)**: ${Vmax} V (${fx(Vmax * 2, 2)} Vpp) · **Voltaje RMS**: ${fx(Vmax / Math.SQRT2, 2)} V\n`;
      md += `- **Frecuencia ELÉCTRICA de operación (f)**: ${f} Hz → **el gong se excita a 2f = ${Math.round(f_mech)} Hz** (F ∝ B², seno puro)\n`;
      md += `- **Resistencia DC de la bobina (Rtarget)**: ${Rtarget} Ω · real con N entero = ${fx(R_real, 2)} Ω\n`;
      md += `- **Resistencia AC @ ${f} Hz (piel/proximidad, Dowell)**: F_R = ${fx(F_R, 2)} → R_ac = ${fx(R_ac, 2)} Ω (δ_Cu = ${fx(delta_cu_mm, 2)} mm, ${num_layers} capas)\n`;
      md += `- **Inductancia (L)**: ${fx(L_mH, 4)} mH\n`;
      md += `- **Impedancia (Z) @ ${f} Hz**: ${fx(Z, 2)} Ω · fase φ = ${fx(phi_deg, 1)}°\n`;
      md += `- **Adaptación al amplificador**: ${usar_transformador ? 'a través de T1 ve' : 've'} ${fx(Z_seen, 1)} Ω frente a Zamp ${Zamp} Ω (${fx(match.ratio, 2)}×) → **${match.label}**\n`;
      if (usar_resonancia) {
        const capModeStr = modo_capacitor === 'manual'
          ? `manual${filtrar_comerciales ? ' (comercial E12)' : ''}`
          : 'auto';
        md += `- **Capacitor de resonancia serie (C)**: ${fx(C_res_uF, 3)} µF (${e(C_res)} F) · modo: **${capModeStr}**\n`;
        if (modo_capacitor === 'manual') {
          md += `- **Capacitor óptimo sugerido**: ${fx(C_res_opt_uF, 3)} µF\n`;
        }
        md += `- **Factor de calidad (Q)**: ${fx(Q, 1)} → multiplica la corriente ×${fx(mult, 1)}\n`;
        md += `- **Corriente en resonancia (I_res)**: ${fx(I_res, 3)} A pico\n`;
        md += `- ⚠ **Tensión en el capacitor (V_C ≈ Q·V)**: **${fx(V_C_pk, 0)} V pico** · corriente ${fx(I_op_rms, 2)} A rms → usar **film/MKP no polarizado** con rating ≥ ${fx(V_C_pk * 1.5, 0)} V (nunca electrolítico). Precaución: tensión peligrosa en C y bobina durante la operación.\n`;
      } else {
        md += `- **Corriente directa de pico (I)**: ${fx(I_pico, 4)} A\n`;
      }
      md += `- **Corriente de operación**: ${fx(I_op, 3)} A pico (${fx(I_op_rms, 3)} A rms) · `;
      md += current_ok ? `seguro (${fx(current_use_pct, 0)}% del límite del AWG ${awg}, ${fx(i_safe_rms, 2)} A rms)\n` : `⚠ **SOBRECORRIENTE** para AWG ${awg} (límite ${fx(i_safe_rms, 2)} A rms) — sube el calibre\n`;
      md += `- **Potencia disipada (P = I²·R_ac)**: ${fx(P, 2)} W pico · ≈ ${fx(P_avg, 2)} W promedio\n`;
      md += `- **ΔT estimada de la bobina**: ≈ ${isFinite(deltaT_est) ? fx(deltaT_est, 0) : '∞'} °C sobre ambiente (convección natural, superficie ≈ ${fx(A_surf_cm2, 0)} cm²)\n`;
      md += `- **FMM (pico)**: ${fx(FMM_op, 1)} A·vuelta${usar_resonancia ? ` (resonancia) — directa serían ${fx(FMM, 1)}` : ''}\n`;
      md += `\n`;

      md += `### Acoplamiento al gong (física del bronce — Lenz / Foucault)\n\n`;
      md += `- **Campo en el núcleo (B, pico)**: ${fx(B_core_pk * 1000, 1)} mT · B_sat = ${fx(B_sat * 1000, 0)} mT → **${fx(sat_pct, 0)}% ${sat_ok ? '(sin saturar ✓)' : '⚠ SATURADO — resultado no válido'}**\n`;
      md += `- **Campo en la cara del bronce (B_gap)**: ${fx(B_gap_pk * 1000, 2)} mT — decaimiento e^(−π·gap/w) = ×${fx(decay_gap, 2)} con gap = ${gap} mm y paso polar w = ${w_polo} mm\n`;
      md += `- **Bronce**: ρ_t = ${rho_t} nΩ·m · espesor t = ${t_gong} mm · piel δ_t @ ${f} Hz = ${fx(delta_t_mm, 1)} mm (t_eff = ${fx(t_eff_mm, 1)} mm)\n`;
      md += `- **Acoplamiento Foucault**: S = ${fx(S_shield, 2)} → **K = ${fx(K_eddy * 100, 1)}%** del empuje ideal (K crece con f)\n`;
      md += `- **Fuerza estimada sobre el gong**: media **${fmtForce(F_avg)}** (≈ ${fx(F_avg_gf, 1)} gf) · oscilación ±${fmtForce(F_ac)} a **${Math.round(f_mech)} Hz** · pico ${fmtForce(F_pk)}\n`;
      md += `- *Modelo de primer orden (presión de Maxwell × lámina delgada): fiable en tendencias y orden de magnitud; calibrar el valor absoluto en banco.*\n`;
      if (lcr_active) {
        md += `- **Medición LCR**: ΔR = ${fx(R_ref, 2)} Ω (${fx(params.R_lcr_0, 2)} → ${fx(params.R_lcr_g, 2)} Ω con gong) → **P transferida al gong ≈ ${fx(P_gong, 2)} W** (${fx(eta_gong, 0)}% de la potencia de bobina)\n`;
      } else {
        md += `- *Verificación recomendada: mide con LCR la R de la bobina a ${f} Hz sin gong y con gong a distancia de trabajo; ΔR·I_rms² = potencia real transferida al bronce.*\n`;
      }
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
      md += `- **l_vuelta** = ${fx(perim / 1000, 3)} m · **Vmax** = ${Vmax} V (Vrms = ${fx(Vmax / Math.SQRT2, 2)} V) · **f** = ${f} Hz\n\n`;

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
      if (modo_capacitor === 'manual') {
        md += `\`C_opt = 1/(ω²L) = ${fx(C_res_opt_uF, 3)} µF\`\n`;
        md += `\`C_usado (manual) = ${fx(C_res_uF, 3)} µF\`\n`;
        md += `\`Z_res = √(R² + (X_L - 1/(ωC))²) = ${fx(Zcoil_op, 2)} Ω\`\n`;
        md += `\`I_res = Vmax/Z_res = ${fx(I_res, 3)} A\` · \`Q = X_L/R = ${fx(Q, 1)}\`\n`;
        md += `\`FMM_res = N·I_res = ${fx(FMM_res, 1)} A·vuelta\` · \`Z/Z_res = ×${fx(mult, 1)}\`\n\n`;
      } else {
        md += `\`C = 1/(ω²L) = ${fx(C_res_uF, 3)} µF\`\n`;
        md += `\`I_res = Vmax/R = ${fx(I_res, 3)} A\`  ·  \`Q = X_L/R = ${fx(Q, 1)}\`\n`;
        md += `\`FMM_res = N·I_res = ${fx(FMM_res, 1)} A·vuelta\`  ·  \`FMM_res/FMM = Z/R = ×${fx(mult, 1)}\`\n\n`;
      }

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

      md += `### 3.9 Campo en el núcleo y saturación\n`;
      md += `\`B = μ₀·μ_eff·FMM/lc = 4π×10⁻⁷·${mu_eff}·${fx(FMM_op, 0)}/${fx(lc / 1000, 3)} = ${fx(B_core_pk * 1000, 1)} mT\`\n`;
      md += `\`B/B_sat = ${fx(sat_pct, 0)}%\` → ${sat_ok ? 'sin saturar ✓' : '⚠ **SATURADO**: μ_eff colapsa y el cálculo deja de valer'}\n\n`;

      md += `### 3.10 Campo que llega al bronce (entrehierro)\n`;
      md += `\`B_gap = B·e^(−π·gap/w) = ${fx(B_core_pk * 1000, 1)}·e^(−π·${gap}/${w_polo}) = ${fx(B_gap_pk * 1000, 2)} mT\`\n\n`;

      md += `### 3.11 Corrientes de Foucault en el bronce (acoplamiento K)\n`;
      md += `\`δ_t = √(2ρ_t/(ω·μ₀)) = ${fx(delta_t_mm, 1)} mm\`  ·  \`t_eff = min(t, δ_t) = ${fx(t_eff_mm, 1)} mm\`\n`;
      md += `\`S = ω·μ₀·t_eff·w/(2π·ρ_t) = ${fx(S_shield, 2)}\`  ·  \`K = S²/(1+S²) = ${fx(K_eddy * 100, 1)}%\`\n`;
      md += `> El bronce (no magnético) reacciona por Ley de Lenz: repele siempre, y acopla mejor a mayor frecuencia.\n\n`;

      md += `### 3.12 Fuerza de repulsión sobre el gong\n`;
      md += `\`F_med = B_gap²·Ac·K/(4μ₀) = ${fmtForce(F_avg)}\` (≈ ${fx(F_avg_gf, 1)} gf)\n`;
      md += `\`F(t) = F_med·(1−cos 2ωt)\` → oscila ±${fmtForce(F_ac)} a \`2f = ${Math.round(f_mech)} Hz\` · pico ${fmtForce(F_pk)}\n`;
      md += `> **El gong se excita al DOBLE de la frecuencia eléctrica** (F ∝ B²). Para sonar una moda del gong a f_m, alimenta la bobina a f_m/2.\n\n`;
    }

    md += `---\n*Recuerda medir la bobina real con un LCR: L (y el capacitor de resonancia) es muy sensible al μ_eff de un núcleo en E abierto.*\n`;
    return md;
  };

  const convertMarkdownToHtml = (md) => {
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Encabezados
    html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
    html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');

    // Imágenes (data-URL de los planos)
    html = html.replace(/!\[([^\]]*)\]\((data:image\/[^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%;height:auto;"/>');

    // Citas / Blockquotes
    html = html.replace(/^&gt;\s+(.*)$/gm, '<blockquote>$1</blockquote>');

    // Negritas
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Cursivas
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bloques de código
    html = html.replace(/```text\s*([\s\S]*?)```/g, '<pre class="diagram-code"><code>$1</code></pre>');
    html = html.replace(/```mermaid\s*([\s\S]*?)```/g, '<pre class="diagram-mermaid"><code>$1</code></pre>');

    // Código inline y ecuaciones
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Listas
    html = html.replace(/^-\s+(.*)$/gm, '<li>$1</li>');

    // Líneas
    html = html.replace(/^---$/gm, '<hr/>');

    // Agrupar listas/tablas y estructurar párrafos
    const lines = html.split('\n');
    let inList = false;
    let inTable = false;
    let tableRow = 0;
    const processed = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|')) {
        if (inList) { processed.push('</ul>'); inList = false; }
        if (!inTable) { processed.push('<table>'); inTable = true; tableRow = 0; }
        // Fila separadora del markdown (|---|---|): se omite
        if (trimmed.replace(/[|\s:-]/g, '') === '') continue;
        const cells = trimmed.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
        const tagName = tableRow === 0 ? 'th' : 'td';
        processed.push('<tr>' + cells.map((cell) => `<${tagName}>${cell}</${tagName}>`).join('') + '</tr>');
        tableRow++;
        continue;
      }
      if (inTable) { processed.push('</table>'); inTable = false; }
      if (trimmed.startsWith('<li>')) {
        if (!inList) {
          processed.push('<ul>');
          inList = true;
        }
        processed.push(line);
      } else {
        if (inList) {
          processed.push('</ul>');
          inList = false;
        }
        if (trimmed &&
            !trimmed.startsWith('<h') &&
            !trimmed.startsWith('</h') &&
            !trimmed.startsWith('<pre') &&
            !trimmed.startsWith('</pre') &&
            !trimmed.startsWith('<code') &&
            !trimmed.startsWith('</code') &&
            !trimmed.startsWith('<blockquote') &&
            !trimmed.startsWith('</blockquote>') &&
            !trimmed.startsWith('<ul') &&
            !trimmed.startsWith('</ul') &&
            !trimmed.startsWith('<img') &&
            !trimmed.startsWith('<hr') &&
            !trimmed.startsWith('<li>')) {
          processed.push(`<p>${line}</p>`);
        } else {
          processed.push(line);
        }
      }
    }
    if (inList) {
      processed.push('</ul>');
    }
    if (inTable) {
      processed.push('</table>');
    }

    return processed.join('\n');
  };

  const getWordTemplate = (content) => {
    return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Reporte de Diseño de Bobina</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: letter;
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: .5in;
      mso-footer-margin: .5in;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
      background-color: #ffffff;
    }
    h1 {
      font-size: 22pt;
      color: #0f172a;
      border-bottom: 2px solid #00c8ff;
      padding-bottom: 6px;
      margin-top: 24pt;
      margin-bottom: 12pt;
      font-weight: bold;
    }
    h2 {
      font-size: 15pt;
      color: #1e293b;
      margin-top: 20pt;
      margin-bottom: 10pt;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      font-weight: bold;
    }
    h3 {
      font-size: 12.5pt;
      color: #0284c7;
      margin-top: 16pt;
      margin-bottom: 8pt;
      font-weight: bold;
    }
    h4 {
      font-size: 11.5pt;
      color: #334155;
      margin-top: 14pt;
      margin-bottom: 6pt;
      font-weight: bold;
    }
    img {
      max-width: 100%;
      height: auto;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      margin: 10pt 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 10pt 0 14pt 0;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5pt 7pt;
      font-size: 9.5pt;
      text-align: left;
      vertical-align: top;
    }
    th { background-color: #f1f5f9; color: #0f172a; }
    p, li {
      margin-bottom: 8pt;
      text-align: justify;
    }
    ul {
      margin-top: 0;
      margin-bottom: 14pt;
      padding-left: 24px;
    }
    blockquote {
      margin: 14pt 0;
      padding: 10pt 14pt;
      background-color: #f8fafc;
      border-left: 4px solid #00c8ff;
      color: #475569;
      font-style: italic;
      border-radius: 4px;
    }
    code {
      font-family: Consolas, 'Courier New', monospace;
      font-size: 10pt;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 4px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
    }
    pre {
      font-family: Consolas, 'Courier New', monospace;
      font-size: 9.5pt;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      margin: 14pt 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .diagram-code {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #64748b;
    }
    .diagram-mermaid {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #22c55e;
      color: #166534;
    }
    hr {
      border: none;
      border-top: 1px solid #cbd5e1;
      margin: 24pt 0;
    }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto;">
    ${content}
  </div>
</body>
</html>
`;
  };

  const downloadReport = async () => {
    // Rasteriza los planos (mismos generadores que la app, tema claro imprimible).
    const images = {};
    try {
      if (sections.part2) {
        images.sysPng = await svgToPngDataUrl(buildSystemDiagramSvg(params, results, { theme: 'light' }), 2);
      }
      if (sections.part1 && params.usar_transformador) {
        images.txPng = await svgToPngDataUrl(buildTransformerDetailSvg(params, results, { theme: 'light' }), 2);
      }
    } catch {
      // Sin canvas o SVG no rasterizable: el reporte sale igual, con nota.
    }
    const markdownContent = generateMarkdown(images);

    if (format === 'md') {
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Bobina_AWG${params.awg}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const htmlContent = convertMarkdownToHtml(markdownContent);
      const fullDocContent = getWordTemplate(htmlContent);
      const blob = new Blob([fullDocContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Bobina_AWG${params.awg}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    onClose();
  };

  const anySelected = sections.part1 || sections.part2 || sections.part3;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-card" onClick={(ev) => ev.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>

        <h2 className="modal-title">
          <FileText color="var(--accent-cyan)" /> Exportar reporte ({format === 'md' ? '.md' : '.doc'})
        </h2>
        <p className="modal-desc">
          Elige las secciones a incluir. El documento refleja exactamente la configuración actual en pantalla.
        </p>

        <div className="modal-options">
          <label className="modal-option">
            <input type="checkbox" checked={sections.part1} onChange={() => handleToggle('part1')} />
            <div>
              <div className="modal-option-title">1 · Datos prácticos de fabricación</div>
              <div className="modal-option-desc">AWG, diámetros, N, longitud de alambre, núcleo, carrete, llenado y plano de T1 con sus datos.</div>
            </div>
          </label>
          <label className="modal-option">
            <input type="checkbox" checked={sections.part2} onChange={() => handleToggle('part2')} />
            <div>
              <div className="modal-option-title">2 · Especificaciones técnicas y operación</div>
              <div className="modal-option-desc">Plano del sistema (imagen), lista de materiales, conexiones paso a paso + Vmax, f, I, P, Z, C, Q, fuerza.</div>
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

        <div className="modal-format-section" style={{ marginBottom: '22px' }}>
          <div className="modal-option-title" style={{ marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Formato del Reporte:
          </div>
          <div className="seg">
            <button 
              type="button" 
              className={format === 'md' ? 'on' : ''} 
              onClick={() => setFormat('md')}
            >
              Markdown (.md)
            </button>
            <button 
              type="button" 
              className={format === 'docx' ? 'on' : ''} 
              onClick={() => setFormat('docx')}
            >
              Documento Word (.doc)
            </button>
          </div>
        </div>

        <button className="modal-download" onClick={downloadReport} disabled={!anySelected}>
          <Download size={20} /> Descargar archivo {format === 'md' ? '.md' : '.doc'}
        </button>
      </div>
    </div>
  );
}
