import { SlidersHorizontal, Magnet, CircuitBoard, Radio, Wand2 } from 'lucide-react';

function Slider({ label, name, min, max, step, value, unit, onChange, hint, action }) {
  return (
    <div className="input-group">
      <div className="label-row">
        <label>{label}</label>
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

function NumberField({ label, name, min, max, step, value, unit, onChange, hint }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-value">
        <input type="number" name={name} min={min} max={max} step={step} value={value} onChange={onChange} style={{ flex: 1, marginRight: '12px' }} />
        <span className="val">{unit}</span>
      </div>
      {hint && <div className="input-hint">{hint}</div>}
    </div>
  );
}

function Toggle({ label, name, checked, onChange, hint }) {
  return (
    <label className="toggle-row">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span className="toggle-track"><span className="toggle-thumb" /></span>
      <div>
        <div className="toggle-label">{label}</div>
        {hint && <div className="input-hint" style={{ marginTop: 0 }}>{hint}</div>}
      </div>
    </label>
  );
}

export default function ControlPanel({ params, setParams, results, recommendedAWG }) {
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

  const match = results.match;
  const matchClass = match.status === 'ok' ? 'good' : 'bad';

  return (
    <div className="glass-panel control-panel">
      <h2 className="panel-section-title"><SlidersHorizontal size={18} /> Variables Eléctricas</h2>

      <NumberField
        label="Voltaje de pico (Vmax)" name="Vmax" min={0.1} max={100} step={0.01}
        value={params.Vmax} unit="V pico" onChange={handleNumber}
        hint={`≈ ${(params.Vmax * 2).toFixed(2)} Vpp`}
      />
      <Slider
        label="Resistencia DC de la bobina (Rtarget)" name="Rtarget" min={1} max={32} step={0.5}
        value={params.Rtarget} unit="Ω" onChange={handleNumber}
        action={params.Rtarget !== params.Zamp && (
          <button type="button" className="mini-btn" onClick={() => set({ Rtarget: params.Zamp })}>
            <Wand2 size={12} /> = Zamp
          </button>
        )}
        hint={`La construyes tú (define las vueltas). En resonancia es lo que ve el ampli → apúntala a Zamp (${params.Zamp}Ω).`}
      />
      <Slider
        label="Frecuencia de operación (f)" name="f" min={20} max={5000} step={5}
        value={params.f} unit="Hz" onChange={handleNumber}
        hint="Rango típico de trabajo 100–2000 Hz."
      />

      <hr className="divider" />
      <h2 className="panel-section-title"><Magnet size={18} /> Variables Magnéticas</h2>

      <Slider
        label="Permeabilidad efectiva (μ_eff)" name="mu_eff" min={1} max={100} step={0.5}
        value={params.mu_eff} unit="" onChange={handleNumber}
        hint="Núcleo E abierto con entrehierro severo: valor bajo (≈5–100). Mídelo con un LCR."
      />
      <NumberField
        label="Área del núcleo (Ac)" name="Ac" min={10} max={10000} step={10}
        value={params.Ac} unit="mm²" onChange={handleNumber}
        hint={`= ${(params.Ac / 100).toFixed(1)} cm²`}
      />
      <Slider
        label="Camino magnético efectivo (lc)" name="lc" min={10} max={500} step={1}
        value={params.lc} unit="mm" onChange={handleNumber}
        hint="Incluye el entrehierro de aire."
      />

      <hr className="divider" />
      <h2 className="panel-section-title"><CircuitBoard size={18} /> Geometría del Alambre / Carrete</h2>

      <Slider
        label="Calibre del alambre (AWG)" name="awg" min={18} max={32} step={1}
        value={params.awg} unit="" onChange={handleNumber}
        action={recommendedAWG && recommendedAWG.awg !== params.awg && (
          <button type="button" className="mini-btn" onClick={() => set({ awg: recommendedAWG.awg })}>
            <Wand2 size={12} /> AWG {recommendedAWG.awg}
          </button>
        )}
        hint={`Ø esmaltado ${results.d_ext_mm.toFixed(3)} mm · máx segura ${results.i_safe_rms.toFixed(2)} A · ${recommendedAWG ? `recomendado AWG ${recommendedAWG.awg}` : ''}`}
      />
      <Slider
        label="Alto de la ventana (hw)" name="hw" min={5} max={120} step={1}
        value={params.hw} unit="mm" onChange={handleNumber}
        hint={`Caben ${results.turns_per_layer} vueltas por capa.`}
      />
      <Slider
        label="Profundidad de la ventana (dw)" name="dw" min={2} max={60} step={1}
        value={params.dw} unit="mm" onChange={handleNumber}
        hint={`Capacidad máx. ${results.layers_max} capas (${results.N_max} vueltas).`}
      />
      <Slider
        label="Perímetro medio por vuelta (perim)" name="perim" min={20} max={600} step={1}
        value={params.perim} unit="mm" onChange={handleNumber}
        hint="Longitud de una espira media alrededor del carrete."
      />

      <hr className="divider" />
      <h2 className="panel-section-title"><Radio size={18} /> Adaptación al Amplificador</h2>

      <Slider
        label="Impedancia del amplificador (Zamp)" name="Zamp" min={1} max={16} step={0.5}
        value={params.Zamp} unit="Ω" onChange={handleNumber}
        hint="Fija: es propiedad de tu ampli (ej. 4 u 8 Ω). La bobina debe adaptarse a ella."
      />

      {/* Veredicto de adaptación */}
      <div className={`match-note ${matchClass}`}>
        <strong>{match.status === 'ok' ? '✓' : '⚠'} {match.label}.</strong>{' '}
        El amplificador ve <strong>{results.Z_load.toFixed(1)} Ω</strong> frente a sus {params.Zamp} Ω
        ({match.ratio.toFixed(2)}×). {match.advice}
      </div>

      <Toggle
        label="Resonancia serie (capacitor)" name="usar_resonancia"
        checked={params.usar_resonancia} onChange={handleToggle}
        hint={params.usar_resonancia
          ? `C = ${results.C_res_uF.toFixed(3)} µF · Q = ${results.Q.toFixed(0)} · ×${results.mult.toFixed(0)} corriente`
          : 'Cancela X_L: el ampli pasa a ver solo R y la corriente se multiplica por Q.'}
      />
      <Toggle
        label="Adaptación con transformador" name="usar_transformador"
        checked={params.usar_transformador} onChange={handleToggle}
        hint={params.usar_transformador
          ? `Relación óptima a = ${results.a_opt.toFixed(2)} : 1 → refleja ${results.Z_load.toFixed(1)}Ω a ${results.Z_refl.toFixed(1)}Ω`
          : 'Si no puedes igualar Rtarget a Zamp, un transformador adapta la impedancia.'}
      />
    </div>
  );
}
