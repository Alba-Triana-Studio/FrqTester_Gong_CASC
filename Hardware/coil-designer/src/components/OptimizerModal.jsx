import { useState } from 'react';
import { X, Sparkles, Zap, CheckCircle2, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';

const TOPO_COLOR = {
  'Resonancia + Transformador': '#a855f7',
  'Resonancia': 'var(--accent-cyan)',
  'Transformador': '#c084fc',
  'Directo': '#64748b',
};

export default function OptimizerModal({ data, onApply, onClose }) {
  const [prevData, setPrevData] = useState(data);
  const [appliedRank, setAppliedRank] = useState(null);
  const [openRank, setOpenRank] = useState(1);

  // Reinicia el estado cuando llega un nuevo resultado (patrón de render de React).
  if (data !== prevData) {
    setPrevData(data);
    setAppliedRank(null);
    setOpenRank(data && data.options.length ? data.options[0].rank : null);
  }

  if (!data) return null;
  const { criteria, options } = data;

  const choose = (opt) => {
    onApply(opt.cfg);
    setAppliedRank(opt.rank);
    setOpenRank(opt.rank);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel optim-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        <h2 className="modal-title"><Sparkles color="var(--accent-yellow)" /> Cálculo automático · máxima FMM</h2>

        <div className="optim-criteria">
          <div><strong>Objetivo:</strong> {criteria.objetivo}</div>
          <div className="optim-law">{criteria.ley}</div>
          <div className="optim-constraints">
            <strong>Solo opciones viables:</strong> {criteria.restricciones.join(' · ')}
          </div>
        </div>

        {options.length === 0 ? (
          <div className="optim-empty">
            No se encontraron opciones viables con las variables bloqueadas. Desbloquea alguna (calibre,
            carrete, Rtarget…) o agranda el carrete y vuelve a intentarlo.
          </div>
        ) : (
          <>
            <div className="optim-sub">{options.length} opciones, ordenadas por FMM descendente. Haz clic para adoptar sus valores.</div>
            <div className="optim-list">
              {options.map((o) => {
                const open = openRank === o.rank;
                const applied = appliedRank === o.rank;
                return (
                  <div key={o.rank} className={`optim-item ${open ? 'open' : ''} ${applied ? 'applied' : ''}`}>
                    <button className="optim-row" onClick={() => choose(o)}>
                      <span className="optim-rank">#{o.rank}</span>
                      <span className="optim-fmm"><Zap size={13} /> {o.fmm.toFixed(0)}<small>A·v</small></span>
                      <span className="optim-topo" style={{ color: TOPO_COLOR[o.topo] }}>{o.topo}</span>
                      <span className="optim-specs">
                        AWG {o.awg} · R {o.Rtarget}Ω · N {o.N}
                        {o.tx ? ` · η ${o.eta.toFixed(0)}%` : ''}{o.res ? ` · Q ${o.Q.toFixed(0)}` : ''} · llenado {o.fill.toFixed(0)}%
                      </span>
                      {applied
                        ? <span className="optim-applied"><CheckCircle2 size={14} /> aplicada</span>
                        : <span className="optim-apply">adoptar <ArrowRight size={13} /></span>}
                    </button>

                    {open && (
                      <div className="optim-detail">
                        <div className="optim-pros">
                          <ThumbsUp size={13} />
                          <span>{o.good.join(' · ')}</span>
                        </div>
                        <div className="optim-cons">
                          <ThumbsDown size={13} />
                          <span>{o.bad.length ? o.bad.join(' · ') : 'pocos compromisos — opción equilibrada'}</span>
                        </div>
                        {o.changes.length > 0 && (
                          <div className="optim-changes">
                            <strong>Cambios respecto a lo actual:</strong> {o.changes.join(' · ')}
                          </div>
                        )}
                      </div>
                    )}
                    {!open && (
                      <button className="optim-expand" onClick={() => setOpenRank(o.rank)}>ver detalle ▾</button>
                    )}
                  </div>
                );
              })}
            </div>
            {appliedRank && (
              <div className="optim-footer-note">
                <CheckCircle2 size={14} /> Valores adoptados. Cierra para ver la interfaz con la opción #{appliedRank} cargada.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
