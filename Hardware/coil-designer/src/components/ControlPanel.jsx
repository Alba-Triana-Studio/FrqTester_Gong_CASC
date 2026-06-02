import { SlidersHorizontal, Magnet, CircuitBoard, Radio, Wand2, Lock, LockOpen, Sparkles } from 'lucide-react';

function LockBtn({ locked, onLock }) {
  if (!onLock) return null;
  return (
    <button
      type="button"
      className={`lock-btn ${locked ? 'locked' : ''}`}
      onClick={onLock}
      title={locked ? 'Bloqueado: el cálculo automático lo mantiene fijo' : 'Desbloqueado: el cálculo automático puede variarlo'}
    >
      {locked ? <Lock size={12} /> : <LockOpen size={12} />}
    </button>
  );
}

function Slider({ label, name, min, max, step, value, unit, onChange, hint, action, locked, onLock }) {
  return (
    <div className={`input-group ${locked ? 'locked' : ''}`}>
      <div className="label-row">
        <span className="label-left"><LockBtn locked={locked} onLock={onLock} /><label>{label}</label></span>
        {action}
      </div>
      <div className="input-value">
        <input type="range" name={name} min={min} max={max} step={step} value={value} onChange={onChange} style={{ flex: 1, marginRight: '16px' }} />
        <span className="val">{value}{unit}</span>
      </div>
      {hint && <div className="input-hint">{hint}</div>}
    </div>
  );
}

function NumberField({ label, name, min, max, step, value, unit, onChange, hint, locked, onLock }) {
  return (
    <div className={`input-group ${locked ? 'locked' : ''}`}>
      <div className="label-row">
        <span className="label-left"><LockBtn locked={locked} onLock={onLock} /><label>{label}</label></span>
      </div>
      <div className="input-value">
        <input type="number" name={name} min={min} max={max} step={step} value={value} onChange={onChange} style={{ flex: 1, marginRight: '12px' }} />
        <span className="val">{unit}</span>
      </div>
      {hint && <div className="input-hint">{hint}</div>}
    </div>
  );
}

function Toggle({ label, name, checked, onChange, hint, locked, onLock }) {
  return (
    <div className={`toggle-wrap ${locked ? 'locked' : ''}`}>
      <LockBtn locked={locked} onLock={onLock} />
      <label className="toggle-row">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} />
        <span className="toggle-track"><span className="toggle-thumb" /></span>
        <div>
          <div className="toggle-label">{label}</div>
          {hint && <div className="input-hint" style={{ marginTop: 0 }}>{hint}</div>}
        </div>
      </label>
    </div>
  );
}

export default function ControlPanel({ params, setParams, results, recommendedAWG, locks = {}, toggleLock, onOptimize }) {
  const handleNumber = (e) => {
    const { name, value } = e.target;
    const v = parseFloat(value);
    setParams((prev) => ({ ...prev, [name]: isNaN(v) ? 0 : v }));
  };
  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setParams((prev) => ({ ...prev, [name]: checked }));
  };
  const set = (patch) => setParams((prev) => ({ ...prev, ...patch }));
  const lk = (name) => ({ locked: !!locks[name], onLock: toggleLock ? () => toggleLock(name) : undefined });

  const match = results.match;
  const matchClass = match.status === 'ok' ? 'good' : 'bad';

  return (
    <div className="glass-panel control-panel">
      <h2 className="panel-section-title"><SlidersHorizontal size={18} /> Variables Eléctricas</h2>

      <NumberField {...lk('Vmax')}
        label="Voltaje de pico (Vmax)" name="Vmax" min={0.1} max={100} step={0.01}
        value={params.Vmax} unit="V pico" onChange={handleNumber}
        hint={`≈ ${(params.Vmax * 2).toFixed(2)} Vpp`}
      />
      <Slider {...lk('Rtarget')}
        label="Resistencia DC de la bobina (Rtarget)" name="Rtarget" min={1} max={32} step={0.5}
        value={params.Rtarget} unit="Ω" onChange={handleNumber}
        action={params.Rtarget !== params.Zamp && (
          <button type="button" className="mini-btn" onClick={() => set({ Rtarget: params.Zamp })}>
            <Wand2 size={12} /> = Zamp
          </button>
        )}
        hint={`La construyes tú (define las vueltas). En resonancia es lo que ve el ampli → apúntala a Zamp (${params.Zamp}Ω).`}
      />
      <Slider {...lk('f')}
        label="Frecuencia de operación (f)" name="f" min={20} max={5000} step={5}
        value={params.f} unit="Hz" onChange={handleNumber}
        hint="Rango típico de trabajo 100–2000 Hz."
      />

      <hr className="divider" />
      <h2 className="panel-section-title"><Magnet size={18} /> Variables Magnéticas</h2>

      <Slider {...lk('mu_eff')}
        label="Permeabilidad efectiva (μ_eff)" name="mu_eff" min={1} max={100} step={0.5}
        value={params.mu_eff} unit="" onChange={handleNumber}
        hint="Núcleo E abierto con entrehierro severo: valor bajo (≈5–100). Mídelo con un LCR."
      />
      <NumberField {...lk('Ac')}
        label="Área del núcleo (Ac)" name="Ac" min={10} max={10000} step={10}
        value={params.Ac} unit="mm²" onChange={handleNumber}
        hint={`= ${(params.Ac / 100).toFixed(1)} cm²`}
      />
      <Slider {...lk('lc')}
        label="Camino magnético efectivo (lc)" name="lc" min={10} max={500} step={1}
        value={params.lc} unit="mm" onChange={handleNumber}
        hint="Incluye el entrehierro de aire."
      />

      <hr className="divider" />
      <h2 className="panel-section-title"><CircuitBoard size={18} /> Geometría del Alambre / Carrete</h2>

      <Slider {...lk('awg')}
        label="Calibre del alambre (AWG)" name="awg" min={18} max={32} step={1}
        value={params.awg} unit="" onChange={handleNumber}
        action={recommendedAWG && recommendedAWG.awg !== params.awg && (
          <button type="button" className="mini-btn" onClick={() => set({ awg: recommendedAWG.awg })}>
            <Wand2 size={12} /> AWG {recommendedAWG.awg}
          </button>
        )}
        hint={`Ø esmaltado ${results.d_ext_mm.toFixed(3)} mm · máx segura ${results.i_safe_rms.toFixed(2)} A · ${recommendedAWG ? `recomendado AWG ${recommendedAWG.awg}` : ''}`}
      />
      <Slider {...lk('hw')}
        label="Alto de la ventana (hw)" name="hw" min={5} max={120} step={1}
        value={params.hw} unit="mm" onChange={handleNumber}
        hint={`Caben ${results.turns_per_layer} vueltas por capa.`}
      />
      <Slider {...lk('dw')}
        label="Profundidad de la ventana (dw)" name="dw" min={2} max={60} step={1}
        value={params.dw} unit="mm" onChange={handleNumber}
        hint={`Capacidad máx. ${results.layers_max} capas (${results.N_max} vueltas).`}
      />
      <Slider {...lk('perim')}
        label="Perímetro medio por vuelta (perim)" name="perim" min={20} max={600} step={1}
        value={params.perim} unit="mm" onChange={handleNumber}
        hint="Longitud de una espira media alrededor del carrete."
      />

      <hr className="divider" />
      <h2 className="panel-section-title"><Radio size={18} /> Adaptación al Amplificador</h2>

      <Slider {...lk('Zamp')}
        label="Impedancia del amplificador (Zamp)" name="Zamp" min={1} max={16} step={0.5}
        value={params.Zamp} unit="Ω" onChange={handleNumber}
        hint="Fija: es propiedad de tu ampli (ej. 4 u 8 Ω). La bobina debe adaptarse a ella."
      />

      <div className={`match-note ${matchClass}`}>
        <strong>{match.status === 'ok' ? '✓' : '⚠'} {match.label}.</strong>{' '}
        El amplificador {params.usar_transformador ? 've a través de T1' : 've'} <strong>{results.Z_seen.toFixed(1)} Ω</strong> frente
        a sus {params.Zamp} Ω ({match.ratio.toFixed(2)}×).{params.usar_transformador ? '' : ` ${match.advice}`}
      </div>

      <Toggle {...lk('usar_resonancia')}
        label="Resonancia serie (capacitor)" name="usar_resonancia"
        checked={params.usar_resonancia} onChange={handleToggle}
        hint={params.usar_resonancia
          ? `C = ${results.C_res_uF.toFixed(3)} µF · Q = ${results.Q.toFixed(0)} · ×${results.mult.toFixed(0)} corriente`
          : 'Cancela X_L: el ampli pasa a ver solo R y la corriente se multiplica por Q.'}
      />
      <Toggle {...lk('usar_transformador')}
        label="Adaptación con transformador" name="usar_transformador"
        checked={params.usar_transformador} onChange={handleToggle}
        hint={params.usar_transformador
          ? `a = ${results.tx.a.toFixed(2)} · η = ${results.tx.eta.toFixed(0)}% · el ampli ve ${results.tx.Zve.toFixed(1)} Ω`
          : 'Adapta la impedancia de la bobina a la del amplificador (estabiliza la carga en banda).'}
      />

      {params.usar_transformador && (
        <div className="tx-controls">
          <div className="seg">
            <button type="button" className={params.modo_relacion !== 'manual' ? 'on' : ''} onClick={() => set({ modo_relacion: 'auto' })}>Auto</button>
            <button type="button" className={params.modo_relacion === 'manual' ? 'on' : ''} onClick={() => set({ modo_relacion: 'manual' })}>Manual</button>
          </div>
          {params.modo_relacion === 'manual' ? (
            <Slider
              label="Relación a (V_sec / V_pri)" name="a_manual" min={0.1} max={20} step={0.1}
              value={params.a_manual} unit=":1" onChange={handleNumber}
              hint={`óptima ≈ ${results.a_opt.toFixed(2)} (√(Z_bobina/Zamp))`}
            />
          ) : (
            <div className="input-hint" style={{ paddingLeft: 2 }}>
              Relación óptima: <strong style={{ color: 'var(--accent-cyan)' }}>a = {results.a_opt.toFixed(2)}</strong> = √(Z_bobina/Zamp)
            </div>
          )}
          <Slider
            label="R primario de T1 (R_pri)" name="R_pri" min={0} max={10} step={0.1}
            value={params.R_pri} unit="Ω" onChange={handleNumber}
            hint="Cobre del primario. Cuanto mayor, menor η (calor inútil)."
          />
          <Slider
            label="R secundario de T1 (R_sec)" name="R_sec" min={0} max={5} step={0.05}
            value={params.R_sec} unit="Ω" onChange={handleNumber}
            hint="Cobre del secundario (opcional, suele ser pequeño)."
          />
          <Slider
            label="Acoplamiento k" name="acoplamiento_k" min={0.5} max={1} step={0.01}
            value={params.acoplamiento_k} unit="" onChange={handleNumber}
            hint="1 = ideal. <1 modela fuga de flujo (se contabiliza como pérdida)."
          />
        </div>
      )}

      <hr className="divider" />
      <button type="button" className="optimize-btn" onClick={onOptimize}>
        <Sparkles size={16} /> Cálculo automático · máx FMM
      </button>
      <div className="input-hint" style={{ textAlign: 'center' }}>
        Busca las mejores bobinas variando lo desbloqueado. Usa el 🔒 para fijar lo que no quieras que cambie.
      </div>
    </div>
  );
}
