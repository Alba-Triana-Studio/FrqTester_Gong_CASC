import React, { useState } from 'react';
import { X, Download, FileText } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, params, results }) {
  const [sections, setSections] = useState({
    part1: true,
    part2: true,
    part3: true
  });

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateMarkdown = () => {
    const { V_max, AWG, R_target, l_vuelta, f, mu_eff, A_c, l_c, h_w, d_w } = params;
    const { R_metro, diam_mm, l_total, N, L, XL, Z, I, FMM, turns_per_layer, num_layers, N_max, fill_percent } = results;

    let md = `# Reporte de Diseño de Bobina Electromagnética\n`;
    md += `*Generado por Motor de Simulación Alba Triana Studio*\n\n`;

    if (sections.part1) {
      md += `## 1. Datos Prácticos de Fabricación\n`;
      md += `*Especificaciones constructivas físicas.*\n\n`;
      md += `- **Calibre del Alambre (AWG)**: ${AWG}\n`;
      md += `- **Diámetro del Alambre (con esmalte)**: ${diam_mm} mm\n`;
      md += `- **Número Total de Vueltas (N)**: ${N.toFixed(0)} vueltas\n`;
      md += `- **Longitud del Alambre Requerido**: ${l_total.toFixed(2)} metros\n`;
      md += `- **Perímetro Promedio por Vuelta**: ${l_vuelta} m\n`;
      md += `- **Tipo de Núcleo**: Abierto (Tipo E o similar)\n`;
      md += `- **Área Transversal del Núcleo (A_c)**: ${(A_c * 10000).toFixed(1)} cm² (${A_c} m²)\n`;
      md += `- **Longitud del Camino Magnético (l_c)**: ${l_c} m\n`;
      md += `- **Ventana del Carrete (Alto x Profundidad)**: ${h_w} mm x ${d_w} mm\n`;
      md += `- **Llenado del Carrete**: ${fill_percent.toFixed(1)}% (Máximo teórico: ${N_max} vueltas)\n\n`;
    }

    if (sections.part2) {
      const power = Math.pow(I, 2) * R_target; // Estimación RMS/Pico simplificada de disipación térmica (P=I^2*R)
      md += `## 2. Especificaciones Técnicas y Operación\n`;
      md += `*Características eléctricas, térmicas y magnéticas de funcionamiento.*\n\n`;
      md += `- **Voltaje Máximo de Señal (Pico)**: ${V_max} V\n`;
      md += `- **Frecuencia de Diseño Actual**: ${f} Hz\n`;
      md += `- **Corriente Dinámica (I) a ${f}Hz**: ${I.toFixed(2)} A\n`;
      md += `- **Potencia Disipada (Calor Estimado)**: ${power.toFixed(2)} W\n`;
      md += `- **Resistencia DC Objetivo (Seguridad)**: ${R_target} Ω\n`;
      md += `- **Impedancia AC (Z) a ${f}Hz**: ${Z.toFixed(2)} Ω\n`;
      md += `- **Inductancia Calculada (L)**: ${(L * 1000).toFixed(4)} mH\n`;
      md += `- **Fuerza Magnetomotriz Máxima (Empuje)**: ${FMM.toFixed(2)} Amperios-vuelta\n\n`;
    }

    if (sections.part3) {
      const mu_0 = "4π×10⁻⁷";
      md += `## 3. Resolución Matemática\n`;
      md += `*Fórmulas y cálculos explícitos que validan los resultados.*\n\n`;
      
      md += `### 3.1 Longitud total del alambre\n`;
      md += `\`l_total = R_target / R_metro_AWG\`\n`;
      md += `\`l_total = ${R_target} / ${R_metro.toFixed(5)} = ${l_total.toFixed(2)} m\`\n\n`;

      md += `### 3.2 Número de vueltas (N)\n`;
      md += `\`N = l_total / l_vuelta\`\n`;
      md += `\`N = ${l_total.toFixed(2)} / ${l_vuelta} = ${N.toFixed(2)} vueltas\`\n\n`;

      md += `### 3.3 Inductancia (L)\n`;
      md += `\`L = (N² · μ₀ · μ_eff · A_c) / l_c\`\n`;
      md += `\`L = (${N.toFixed(1)}² · ${mu_0} · ${mu_eff} · ${A_c}) / ${l_c} = ${(L*1000).toFixed(4)} mH\`\n\n`;

      md += `### 3.4 Impedancia en AC (Z)\n`;
      md += `\`Z = √(R_target² + (2πfL)²)\`\n`;
      md += `\`Z = √(${R_target}² + (2π · ${f} · ${(L*1000).toFixed(2)}mH)²) = ${Z.toFixed(2)} Ω\`\n\n`;

      md += `### 3.5 Corriente Dinámica (I)\n`;
      md += `\`I = V_max / Z\`\n`;
      md += `\`I = ${V_max} / ${Z.toFixed(2)} = ${I.toFixed(2)} A\`\n\n`;

      md += `### 3.6 Fuerza Magnetomotriz (FMM)\n`;
      md += `\`FMM = N · I\`\n`;
      md += `\`FMM = ${N.toFixed(1)} · ${I.toFixed(2)} = ${FMM.toFixed(2)} A-vuelta\`\n\n`;

      md += `### 3.7 Capacidad del Carrete Físico\n`;
      md += `\`Vueltas por capa = ⌊h_w / diam_alambre⌋ = ⌊${h_w} / ${diam_mm}⌋ = ${turns_per_layer}\`\n`;
      md += `\`Capas totales = ⌊d_w / diam_alambre⌋ = ⌊${d_w} / ${diam_mm}⌋ = ${num_layers}\`\n`;
      md += `\`N_max = ${turns_per_layer} · ${num_layers} = ${N_max} vueltas máx\`\n`;
      md += `\`Llenado = (N / N_max) · 100 = ${fill_percent.toFixed(1)}%\`\n\n`;
    }

    return md;
  };

  const downloadReport = () => {
    const content = generateMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Bobina_AWG${params.AWG}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>
        
        <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText color="var(--accent-cyan)" /> Descargar Informe de Fabricación
        </h2>

        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Selecciona las secciones que deseas incluir en tu reporte (.MD). El documento reflejará exactamente la configuración que tienes actualmente en pantalla.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={sections.part1} onChange={() => handleToggle('part1')} style={{ marginTop: '4px', accentColor: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>1. Datos Prácticos de Fabricación</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dimensiones del núcleo, calibre AWG, vueltas totales, etc. Sólo datos duros para el fabricante.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={sections.part2} onChange={() => handleToggle('part2')} style={{ marginTop: '4px', accentColor: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>2. Especificaciones de Operación</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frecuencias, voltaje, corriente RMS esperada, potencia/calor e impedancia.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={sections.part3} onChange={() => handleToggle('part3')} style={{ marginTop: '4px', accentColor: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>3. Resolución Matemática</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fórmulas desglosadas paso a paso con su resultado explícito.</div>
            </div>
          </label>
        </div>

        <button 
          onClick={downloadReport}
          disabled={!sections.part1 && !sections.part2 && !sections.part3}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px',
            background: (sections.part1 || sections.part2 || sections.part3) ? 'var(--accent-cyan)' : '#333',
            color: '#000', fontWeight: 'bold', fontSize: '1rem',
            border: 'none', cursor: (sections.part1 || sections.part2 || sections.part3) ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <Download size={20} /> Descargar Archivo .MD
        </button>
      </div>
    </div>
  );
}
