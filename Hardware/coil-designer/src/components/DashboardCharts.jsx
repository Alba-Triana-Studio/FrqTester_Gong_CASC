import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
  BarChart, Bar, Cell, Label,
} from 'recharts';

const tooltipStyle = {
  background: 'rgba(8,12,22,0.92)',
  border: '1px solid #2a3550',
  borderRadius: '8px',
  color: '#fff',
};
const axis = { stroke: '#94a3b8', fontSize: 12 };

const STATUS_COLOR = {
  ok: '#22c55e',        // verde: cabe y aguanta la corriente
  hot: '#facc15',       // amarillo: cabe pero se calienta
  overflow: '#ff0055',  // rojo: no cabe en el carrete
};

// Marca de frecuencia de operación más cercana en el eje categórico.
function nearestLabel(data, f) {
  return data.reduce((a, b) => (Math.abs(b.f - f) < Math.abs(a.f - f) ? b : a)).f_label;
}

export default function DashboardCharts({
  impedanceData, currentData, awgData, forceData, params, results, recommendedAWG,
}) {
  const fMark = nearestLabel(impedanceData, params.f);
  const res = params.usar_resonancia;

  return (
    <div className="charts-grid">

      {/* 1) Impedancia vs Frecuencia */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">1 · ¿Qué impedancia ve el amplificador? <span className="chart-axis-tag">eje Ω log</span></h3>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={impedanceData} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="f_label" tick={axis} />
              <YAxis tick={axis} width={50} unit="Ω" scale="log" domain={[1, 'dataMax']} allowDataOverflow tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} Ω`, n]} labelFormatter={(l) => `f = ${l}Hz`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {/* Impedancia objetivo del amplificador */}
              <ReferenceLine y={params.Zamp} stroke="var(--accent-green)" strokeDasharray="6 3">
                <Label value={`Zamp ${params.Zamp}Ω (objetivo)`} position="insideTopRight" fill="var(--accent-green)" fontSize={10} />
              </ReferenceLine>
              <ReferenceLine x={fMark} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4">
                <Label value="operación" position="top" fill="#cbd5e1" fontSize={10} />
              </ReferenceLine>
              <Line type="monotone" dataKey="Z_coil" stroke="var(--accent-pink)" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Bobina sola" />
              <Line type="monotone" dataKey="Z_amp" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} name="Con capacitor (lo que ve el ampli)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-note">
          Sola, la bobina dispara su impedancia con la frecuencia (rosa). El capacitor de resonancia la <strong>hunde hasta R</strong> (cian) en la
          frecuencia de trabajo. <strong>Buena práctica:</strong> que ese mínimo toque la línea verde <em>Zamp</em>.
        </div>
      </div>

      {/* 2) Corriente vs Frecuencia */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">2 · ¿Cuánta corriente circula? (y el límite del alambre)</h3>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="f_label" tick={axis} />
              <YAxis tick={axis} width={50} unit="A" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} A`, n]} labelFormatter={(l) => `f = ${l}Hz`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {/* Zona segura del alambre (por debajo de la corriente máx del calibre) */}
              <ReferenceArea y1={0} y2={results.i_safe_pk} fill="rgba(34,197,94,0.10)" strokeOpacity={0} />
              <ReferenceLine y={results.i_safe_pk} stroke="var(--accent-green)" strokeDasharray="6 3">
                <Label value={`máx segura AWG ${params.awg} (${results.i_safe_pk.toFixed(2)} A)`} position="insideTopLeft" fill="var(--accent-green)" fontSize={10} />
              </ReferenceLine>
              <ReferenceLine x={fMark} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="I_sin" stroke="#64748b" strokeWidth={2} dot={false} name="Sin resonancia" />
              <Line type="monotone" dataKey="I_res" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} name="Con resonancia serie" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-note">
          La resonancia crea un pico de corriente (cian) justo en la frecuencia de trabajo. <strong>Buena práctica:</strong> mantén el pico
          <strong> bajo la línea verde</strong> o el alambre se sobrecalienta — si la cruza, sube el calibre.
        </div>
      </div>

      {/* 3) Selección de calibre */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">3 · ¿Qué calibre usar? (llenado del carrete)</h3>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={awgData} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="AWG" tick={axis} />
              <YAxis tick={axis} width={50} unit="%" domain={[0, 'dataMax']} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                formatter={(v, n, item) => [`${item.payload.fill_real}% llenado · FMM ${item.payload.FMM}`, `AWG ${item.payload.AWG}`]}
              />
              <ReferenceLine y={100} stroke="var(--accent-pink)" strokeDasharray="6 3">
                <Label value="no cabe (100%)" position="insideTopRight" fill="var(--accent-pink)" fontSize={10} />
              </ReferenceLine>
              {recommendedAWG && (
                <ReferenceLine x={recommendedAWG.awg} stroke="var(--accent-green)" strokeWidth={2}>
                  <Label value="★ recomendado" position="top" fill="var(--accent-green)" fontSize={10} />
                </ReferenceLine>
              )}
              <Bar dataKey="fill" radius={[4, 4, 0, 0]} name="Llenado">
                {awgData.map((e) => (
                  <Cell
                    key={e.AWG}
                    fill={STATUS_COLOR[e.status]}
                    stroke={e.AWG === params.awg ? '#fff' : 'none'}
                    strokeWidth={e.AWG === params.awg ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          <span><i style={{ background: STATUS_COLOR.ok }} /> cabe y aguanta</span>
          <span><i style={{ background: STATUS_COLOR.hot }} /> cabe pero se calienta</span>
          <span><i style={{ background: STATUS_COLOR.overflow }} /> no cabe</span>
          <span><i className="ring" /> tu calibre</span>
        </div>
        <div className="chart-note">
          A misma Rtarget la corriente es igual en todos; el alambre <strong>más grueso</strong> da más FMM pero llena antes el carrete.
          <strong> Elige el más grueso que siga verde</strong> → marcado con ★.
        </div>
      </div>

      {/* 4) Fuerza vs Frecuencia */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">4 · ¿Cuánta fuerza (FMM) sobre el gong?</h3>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forceData} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="f_label" tick={axis} />
              <YAxis tick={axis} width={50} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} A·vuelta`, n]} labelFormatter={(l) => `f = ${l}Hz`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine x={fMark} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4">
                <Label value="operación" position="top" fill="#cbd5e1" fontSize={10} />
              </ReferenceLine>
              <Line type="monotone" dataKey="FMM_sin" stroke="#64748b" strokeWidth={2} dot={false} name="Sin resonancia" />
              <Line type="monotone" dataKey="FMM_res" stroke="var(--accent-yellow)" strokeWidth={3} dot={false} name="Con resonancia serie" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-note">
          Esta es la fuerza magnética que empuja el bronce. La resonancia (amarillo) la multiplica por <strong>Q = {results.Q.toFixed(0)}</strong> frente
          al accionamiento directo (gris). <strong>Buena práctica:</strong> céntrate en la frecuencia del pico {res ? '— ya estás en ella' : '(activa la resonancia)'}.
        </div>
      </div>

    </div>
  );
}
