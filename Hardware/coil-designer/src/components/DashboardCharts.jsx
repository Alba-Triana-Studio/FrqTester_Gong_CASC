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

const STATUS_COLOR = { ok: '#22c55e', hot: '#facc15', overflow: '#ff0055' };
const TX_COLOR = '#a855f7';    // transformador (violeta)
const AMP_COLOR = '#c084fc';   // corriente del amplificador

const FTICKS = [20, 50, 100, 200, 500, 1000, 2000, 5000];
const fmtHz = (v) => (v >= 1000 ? `${v / 1000}k` : `${v}`);
const freqXAxis = () => (
  <XAxis
    dataKey="f" type="number" scale="log" domain={[20, 5000]}
    ticks={FTICKS} tickFormatter={fmtHz} tick={axis} allowDataOverflow
  />
);

export default function DashboardCharts({
  impedanceData, currentData, awgData, forceData, params, results, recommendedAWG,
}) {
  const res = params.usar_resonancia;
  const tx = params.usar_transformador;
  const opLabel = { value: `operación ${fmtHz(params.f)}Hz`, position: 'top', fill: '#cbd5e1', fontSize: 10 };

  return (
    <div className="charts-grid">

      {/* 1) Impedancia vs Frecuencia */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">1 · ¿Qué impedancia ve el amplificador? <span className="chart-axis-tag">eje Ω log</span></h3>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={impedanceData} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              {freqXAxis()}
              <YAxis tick={axis} width={50} unit="Ω" scale="log" domain={[1, 'dataMax']} allowDataOverflow tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} Ω`, n]} labelFormatter={(l) => `f = ${l} Hz`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={params.Zamp} stroke="var(--accent-green)" strokeDasharray="6 3">
                <Label value={`Zamp ${params.Zamp}Ω (objetivo)`} position="insideBottomRight" fill="var(--accent-green)" fontSize={10} />
              </ReferenceLine>
              <ReferenceLine x={params.f} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4"><Label {...opLabel} /></ReferenceLine>
              <Line type="monotone" dataKey="Z_coil" stroke="var(--accent-pink)" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Bobina sola" />
              {res && <Line type="monotone" dataKey="Z_cap" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} name="Con capacitor" />}
              {tx && <Line type="monotone" dataKey="Z_tx" stroke={TX_COLOR} strokeWidth={3} dot={false} name="Con transformador (lo que ve el ampli)" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-note">
          {tx
            ? <>El transformador (violeta) <strong>aplana</strong> y acerca la carga a <em>Zamp</em> en toda la banda — ese es su valor. {res && 'Con resonancia, el valle cae sobre Zamp.'}</>
            : <>Sola, la bobina dispara su impedancia (rosa). {res ? <>El capacitor la <strong>hunde hasta R</strong> (cian) en la frecuencia de trabajo: que ese mínimo toque la línea verde <em>Zamp</em>.</> : 'Activa la resonancia o el transformador para acercarla a Zamp.'}</>}
        </div>
      </div>

      {/* 2) Corriente vs Frecuencia */}
      <div className="glass-panel chart-container">
        <h3 className="chart-title">2 · ¿Cuánta corriente circula? (y el límite del alambre)</h3>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              {freqXAxis()}
              <YAxis tick={axis} width={50} unit="A" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} A`, n]} labelFormatter={(l) => `f = ${l} Hz`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceArea y1={0} y2={results.i_safe_pk} fill="rgba(34,197,94,0.10)" strokeOpacity={0} />
              <ReferenceLine y={results.i_safe_pk} stroke="var(--accent-green)" strokeDasharray="6 3">
                <Label value={`máx segura AWG ${params.awg} (${results.i_safe_pk.toFixed(2)} A)`} position="insideTopLeft" fill="var(--accent-green)" fontSize={10} />
              </ReferenceLine>
              <ReferenceLine x={params.f} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4"><Label {...opLabel} /></ReferenceLine>
              {tx ? (
                <>
                  <Line type="monotone" dataKey="I_bobina" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} name="En la bobina (hace FMM)" />
                  <Line type="monotone" dataKey="I_amp" stroke={AMP_COLOR} strokeWidth={2} strokeDasharray="5 4" dot={false} name="Del amplificador" />
                </>
              ) : res ? (
                <Line type="monotone" dataKey="I_res" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} name="Con resonancia serie" />
              ) : (
                <Line type="monotone" dataKey="I_direct" stroke="#64748b" strokeWidth={2} dot={false} name="Sin resonancia" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-note">
          {tx
            ? <>La <strong>corriente de bobina</strong> (cian) hace la FMM; la del <strong>amplificador</strong> (violeta) es a·I_bobina. <strong>Buena práctica:</strong> que la cian no cruce la línea verde del alambre.</>
            : res
              ? <>La resonancia crea un pico de corriente en la frecuencia de trabajo. <strong>Mantén el pico bajo la línea verde</strong> o el alambre se sobrecalienta.</>
              : <>Sin resonancia la corriente cae con la frecuencia y es baja. Actívala (o el transformador) para subirla.</>}
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
                  <Cell key={e.AWG} fill={STATUS_COLOR[e.status]} stroke={e.AWG === params.awg ? '#fff' : 'none'} strokeWidth={e.AWG === params.awg ? 2 : 0} />
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
          El color usa la corriente real de la topología activa{tx ? ' (con transformador)' : res ? ' (con resonancia)' : ''}.
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
              {freqXAxis()}
              <YAxis tick={axis} width={50} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} A·vuelta`, n]} labelFormatter={(l) => `f = ${l} Hz`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine x={params.f} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4"><Label {...opLabel} /></ReferenceLine>
              <Line type="monotone" dataKey="FMM_sin" stroke="#64748b" strokeWidth={2} dot={false} name="Directo sin resonancia" />
              {res && !tx && <Line type="monotone" dataKey="FMM_res" stroke="var(--accent-yellow)" strokeWidth={3} dot={false} name="Directo con resonancia" />}
              {tx && <Line type="monotone" dataKey="FMM_tx" stroke={TX_COLOR} strokeWidth={3} dot={false} name={res ? 'Transformador + resonancia' : 'Con transformador'} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-note">
          Fuerza magnética sobre el bronce. {res && <>La resonancia da el pico (×Q = {results.Q.toFixed(0)}). </>}
          {tx
            ? <>El transformador <strong>no inventa FMM</strong>: a igualdad de potencia coincide con el directo bien adaptado; su valor es estabilizar la carga.</>
            : <>El gris es la baseline directa.</>}
        </div>
      </div>

    </div>
  );
}
