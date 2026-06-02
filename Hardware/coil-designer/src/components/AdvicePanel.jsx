import { Lightbulb, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const STYLE = {
  ok:   { color: 'var(--accent-green)', Icon: CheckCircle2 },
  warn: { color: 'var(--accent-yellow)', Icon: AlertTriangle },
  bad:  { color: 'var(--accent-pink)', Icon: XCircle },
};

export default function AdvicePanel({ advice }) {
  if (!advice) return null;
  const { color, Icon } = STYLE[advice.status] || STYLE.ok;

  return (
    <div className="glass-panel advice-panel" style={{ borderColor: color }}>
      <div className="advice-head">
        <span className="advice-tag"><Lightbulb size={14} /> Consejo</span>
        <Icon size={16} style={{ color }} />
        <span className="advice-title" style={{ color }}>{advice.title}</span>
      </div>
      <div className="advice-detail">{advice.detail}</div>
      {advice.numbers && advice.numbers.length > 0 && (
        <div className="advice-chips">
          {advice.numbers.map((n) => (
            <span key={n.label} className="advice-chip">
              <b>{n.label}</b> {n.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
