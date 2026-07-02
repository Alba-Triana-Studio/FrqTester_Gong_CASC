import { useMemo } from 'react';
import { buildSystemDiagramSvg } from '../engine/diagramSvg';

// Plano técnico en vivo: isométrico del núcleo E con cotas, camino magnético,
// cobre, gong a distancia gap, y la cadena eléctrica con V/I/P̄ por sección.
// El SVG se genera como string (mismo generador que usa el reporte).
export default function DiagramPanel({ params, results }) {
  const svg = useMemo(
    () => buildSystemDiagramSvg(params, results, { theme: 'dark' }),
    [params, results],
  );

  return (
    <div className="glass-panel chart-container diagram-panel">
      <h3 className="chart-title">
        Plano del sistema · núcleo, bobina, acople y gong{' '}
        <span className="chart-axis-tag">cotas en mm · V/I/P̄ por sección</span>
      </h3>
      <div className="diagram-wrap" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="chart-note">
        Isométrico esquemático (cotas = valores de diseño, no CAD a escala). El lazo punteado es el
        camino magnético <em>lc</em>; a la derecha, la conexión en serie al amplificador con voltaje,
        corriente y potencia media de cada sección. Este mismo plano se exporta como imagen en el reporte.
      </div>
    </div>
  );
}
