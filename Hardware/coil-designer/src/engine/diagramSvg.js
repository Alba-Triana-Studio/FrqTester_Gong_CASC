// ============================================================================
//  diagramSvg.js — Planos técnicos del sistema (SVG generado por código)
//
//  buildSystemDiagramSvg(params, results, {theme})
//    Isométrico esquemático del núcleo E con COTAS (√Ac, hw, dw, w, gap, t,
//    alto total), camino magnético lc (lazo punteado), cobre en la ventana,
//    gong a distancia gap, y a la derecha la CADENA ELÉCTRICA en serie
//    (ampli → T1 → C → bobina → gong) con V, I y P̄ de cada sección.
//
//  buildTransformerDetailSvg(params, results, {theme})
//    Plano del transformador T1 (tipo acorazado) con terminales, polaridad
//    y todos sus datos eléctricos, para la sección de fabricación del reporte.
//
//  Los dibujos son ESQUEMAS con cotas = valores de diseño (no CAD a escala).
//  theme: 'dark' (app) | 'light' (reporte imprimible).
// ============================================================================

import { fmtForce } from './coilMath.js';

const C30 = Math.cos(Math.PI / 6);
const fx = (x, d = 1) => (isFinite(x) ? Number(x).toFixed(d) : '—');

const PAL = {
  light: {
    bg: '#ffffff', text: '#0f172a', sub: '#475569', dim: '#475569', tagBg: '#ffffff',
    coreT: '#dbe3ee', coreL: '#aab8cc', coreR: '#8fa1b8', coreS: '#334155',
    cuT: '#eaa64d', cuL: '#cf822c', cuR: '#b26c1e', cuS: '#7c4a10', cuLine: '#8a5514',
    gongT: '#dcb277', gongL: '#c3923f', gongR: '#a87a2c', gongS: '#6b4a14',
    flux: '#0e7490', force: '#dc2626', eddy: '#0e7490',
    block: '#f8fafc', blockS: '#94a3b8', chipBg: '#eef2f7', wire: '#334155',
    railA: '#dc2626', railB: '#475569',
  },
  dark: {
    bg: null, text: '#e2e8f0', sub: '#94a3b8', dim: '#94a3b8', tagBg: '#0b1222',
    coreT: '#64748b', coreL: '#475569', coreR: '#394a63', coreS: '#a7b6cc',
    cuT: '#f59e0b', cuL: '#d97706', cuR: '#b45309', cuS: '#fcd34d', cuLine: '#7c3a06',
    gongT: '#d8ab5e', gongL: '#bd8a38', gongR: '#9f7128', gongS: '#ecc989',
    flux: '#22d3ee', force: '#f87171', eddy: '#22d3ee',
    block: 'rgba(15,23,42,0.55)', blockS: '#334155', chipBg: '#16233b', wire: '#cbd5e1',
    railA: '#f87171', railB: '#94a3b8',
  },
};

const clampNum = (x, lo, hi) => Math.min(Math.max(x, lo), hi);

// ---------------------------------------------------------------------------
export function buildSystemDiagramSvg(params, results, { theme = 'dark' } = {}) {
  const pal = PAL[theme] || PAL.dark;
  const id = `cd${theme === 'light' ? 'l' : 'd'}`;
  const W = 1160, H = 660;

  const {
    N, R_real, R_ac, F_R, L_mH, Zcoil_op, I_op, I_op_rms, FMM_op, P, P_avg,
    C_res_uF, V_C_pk, Q, tx, d_ext_mm, depth_used_mm, fill_percent, num_layers,
    B_core_pk, sat_pct, B_gap_pk, K_eddy, F_ac, f_mech, deltaT_est,
  } = results;
  const useTx = !!params.usar_transformador;
  const useRes = !!params.usar_resonancia;

  // ----- Geometría del modelo (mm) -----
  const c = Math.max(Math.sqrt(Math.max(params.Ac, 1)), 8);   // lado del polo
  const yk = Math.max(c / 2, 6);                              // espesor del yugo
  const hwm = Math.max(params.hw, 8);
  const dwm = Math.max(params.dw, 3);
  const b = clampNum(depth_used_mm || 2, 1.6, dwm);           // build de cobre
  // El polo sobresale solo 0.5 mm más que el build de cobre: apenas asoma para
  // que se vea el núcleo, sin un saliente que confunda al fabricante.
  const legLen = hwm + b + 0.5;
  const gapm = Math.max(params.gap ?? 3, 0.5);
  const tg = Math.max(params.t_gong ?? 3, 1.5);
  const Ht = 2 * c + 2 * dwm;                                 // alto total del E
  const yOutT = c / 2;                                        // pierna inferior
  const yWin0 = c / 2, yWin1 = c / 2 + dwm;
  const yc0 = yWin1, yc1 = yc0 + c;                           // pierna central
  const yTop0 = yc1 + dwm, yTop1 = yTop0 + c / 2;
  const pfx = yk + legLen;                                    // plano de polos
  const gx = pfx + gapm;                                      // cara del gong
  const gy0 = -0.18 * Ht, gy1 = 1.18 * Ht;
  const gz0 = -0.25 * c, gz1 = 1.25 * c;
  const xc0 = yk + 2;                                         // inicio bobina

  // ----- Proyección isométrica + encaje en el área izquierda -----
  const p0 = (x, y, z) => [(x - z) * C30, (x + z) * 0.5 - y];
  const xs = [0, gx + tg + 8], ys = [gy0, gy1], zs = [gz0, gz1];
  let sx0 = 1e9, sx1 = -1e9, sy0 = 1e9, sy1 = -1e9;
  for (const x of xs) for (const y of ys) for (const z of zs) {
    const [sx, sy] = p0(x, y, z);
    sx0 = Math.min(sx0, sx); sx1 = Math.max(sx1, sx);
    sy0 = Math.min(sy0, sy); sy1 = Math.max(sy1, sy);
  }
  const AX0 = 108, AX1 = 596, AY0 = 92, AY1 = 585;
  const k = Math.min((AX1 - AX0) / (sx1 - sx0), (AY1 - AY0) / (sy1 - sy0));
  const ox = AX0 + ((AX1 - AX0) - (sx1 - sx0) * k) / 2 - sx0 * k;
  const oy = AY0 + ((AY1 - AY0) - (sy1 - sy0) * k) / 2 - sy0 * k;
  const pr = (x, y, z) => [ox + (x - z) * C30 * k, oy + ((x + z) * 0.5 - y) * k];
  const UX = [C30, 0.5];                    // dirección +x proyectada (unitaria)
  const PDN = [-0.5, C30];                  // perpendicular hacia abajo-izquierda

  const s = [];
  const T = (x, y, txt, o = {}) => {
    const { size = 11, c: col = pal.text, a = 'middle', b: bold = false, op = 1 } = o;
    return `<text x="${fx(x)}" y="${fx(y)}" font-size="${size}" fill="${col}" text-anchor="${a}"${bold ? ' font-weight="700"' : ''}${op < 1 ? ` opacity="${op}"` : ''}>${txt}</text>`;
  };
  const tag = (x, y, txt, o = {}) => {
    const { size = 10.5, c: col = pal.text, a = 'middle', b: bold = false } = o;
    const w = txt.length * size * 0.56 + 10;
    const rx = a === 'middle' ? x - w / 2 : a === 'start' ? x - 5 : x - w + 5;
    return `<rect x="${fx(rx)}" y="${fx(y - size - 1)}" width="${fx(w)}" height="${size + 6}" rx="4" fill="${pal.tagBg}" opacity="0.88"/>` +
      T(x, y, txt, { size, c: col, a, b: bold });
  };
  const line = (a, bp, col, w = 1, dash = '', op = 1) =>
    `<line x1="${fx(a[0])}" y1="${fx(a[1])}" x2="${fx(bp[0])}" y2="${fx(bp[1])}" stroke="${col}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const poly = (pts, fill, stroke, o = {}) =>
    `<polygon points="${pts.map((p) => `${fx(p[0])},${fx(p[1])}`).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${o.w ?? 1}" stroke-linejoin="round"${o.op ? ` opacity="${o.op}"` : ''}/>`;
  const box3 = (x0, x1, y0, y1, z0, z1, f) =>
    poly([pr(x0, y1, z0), pr(x1, y1, z0), pr(x1, y1, z1), pr(x0, y1, z1)], f.t, f.s) +
    poly([pr(x0, y0, z1), pr(x1, y0, z1), pr(x1, y1, z1), pr(x0, y1, z1)], f.l, f.s) +
    poly([pr(x1, y0, z0), pr(x1, y0, z1), pr(x1, y1, z1), pr(x1, y1, z0)], f.r, f.s);
  const tri = (P, dir, size, col, op = 1) => {
    const [ux, uy] = dir, nx = -uy, ny = ux;
    return poly([
      [P[0] + ux * size, P[1] + uy * size],
      [P[0] - ux * size * 0.55 + nx * size * 0.55, P[1] - uy * size * 0.55 + ny * size * 0.55],
      [P[0] - ux * size * 0.55 - nx * size * 0.55, P[1] - uy * size * 0.55 - ny * size * 0.55],
    ], col, 'none', { op });
  };
  const dim = (A, B, off, label) => {
    const n = Math.hypot(off[0], off[1]) || 1;
    const u = [off[0] / n, off[1] / n];
    const a2 = [A[0] + off[0], A[1] + off[1]], b2 = [B[0] + off[0], B[1] + off[1]];
    const ext = 5;
    let out = line(A, [a2[0] + u[0] * ext, a2[1] + u[1] * ext], pal.dim, 0.8, '', 0.85);
    out += line(B, [b2[0] + u[0] * ext, b2[1] + u[1] * ext], pal.dim, 0.8, '', 0.85);
    out += `<line x1="${fx(a2[0])}" y1="${fx(a2[1])}" x2="${fx(b2[0])}" y2="${fx(b2[1])}" stroke="${pal.dim}" stroke-width="1" marker-start="url(#${id}-da)" marker-end="url(#${id}-da)"/>`;
    const mx = (a2[0] + b2[0]) / 2 + u[0] * 13, my = (a2[1] + b2[1]) / 2 + u[1] * 13;
    out += tag(mx, my + 3.5, label);
    return out;
  };
  const leader = (P, L, label, a = 'start') =>
    `<circle cx="${fx(P[0])}" cy="${fx(P[1])}" r="2" fill="${pal.dim}"/>` +
    line(P, L, pal.dim, 0.8, '', 0.85) + tag(L[0] + (a === 'start' ? 4 : -4), L[1] + 3.5, label, { a });

  // ----- Cabecera del documento SVG -----
  s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`);
  s.push(`<defs><marker id="${id}-da" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${pal.dim}"/></marker></defs>`);
  if (pal.bg) s.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="${pal.bg}"/>`);
  s.push(T(24, 30, 'PLANO DEL SISTEMA — bobina de inducción sobre gong (cotas en mm)', { size: 14, a: 'start', b: true }));
  s.push(T(24, 47, 'Isométrico esquemático: cotas = valores de diseño · lazo punteado = camino magnético lc · derecha: conexión eléctrica en serie con V / I / P̄ por sección', { size: 10.5, a: 'start', c: pal.sub }));

  // ----- Núcleo E (yugo + 3 piernas) -----
  const CORE = { t: pal.coreT, l: pal.coreL, r: pal.coreR, s: pal.coreS };
  const CU = { t: pal.cuT, l: pal.cuL, r: pal.cuR, s: pal.cuS };
  const GNG = { t: pal.gongT, l: pal.gongL, r: pal.gongR, s: pal.gongS };
  s.push(box3(0, yk, 0, Ht, 0, c, CORE));                      // yugo
  s.push(box3(yk, pfx, 0, yOutT, 0, c, CORE));                 // pierna inferior
  s.push(box3(yk, pfx, yc0, yc1, 0, c, CORE));                 // pierna central
  s.push(box3(yk, pfx, yTop0, yTop1, 0, c, CORE));             // pierna superior

  // ----- Bobina (cobre) alrededor de la pierna central -----
  // Levemente translúcida para que se intuya la pierna central que envuelve.
  const coilParts = [box3(xc0, xc0 + hwm, yc0 - b, yc1 + b, -b, c + b, CU)];
  const nw = clampNum(Math.round(hwm / 4), 6, 14);
  for (let i = 1; i < nw; i++) {
    const xi = xc0 + (hwm * i) / nw;
    coilParts.push(line(pr(xi, yc1 + b, -b), pr(xi, yc1 + b, c + b), pal.cuLine, 0.7, '', 0.5));
    coilParts.push(line(pr(xi, yc0 - b, c + b), pr(xi, yc1 + b, c + b), pal.cuLine, 0.7, '', 0.5));
  }
  s.push(`<g opacity="0.82">${coilParts.join('')}</g>`);
  // Aristas OCULTAS de la pierna central dentro del cobre (línea discontinua,
  // convención de dibujo técnico): el núcleo atraviesa la bobina.
  for (const [yh, zh] of [[yc1, c], [yc0, c], [yc1, 0]]) {
    s.push(line(pr(xc0, yh, zh), pr(xc0 + hwm, yh, zh), pal.coreS, 1.2, '5 3.5', 0.9));
  }
  // Punta del polo central dibujada SOBRE la bobina (orden de pintado): el
  // núcleo emerge del centro de la cara de cobre hacia el gong.
  s.push(box3(xc0 + hwm, pfx, yc0, yc1, 0, c, CORE));

  // ----- Camino magnético lc (lazo punteado, plano frontal z = c) -----
  const zf = c + 0.01;
  const ycM = yc0 + c / 2, yoU = yTop0 + c / 4, yoD = c / 4, xyk = yk * 0.55;
  const bulge = gapm + tg + 6;
  const fluxLoop = (yOuter, op, withArrows) => {
    const S = pr(xyk, ycM, zf), A = pr(pfx, ycM, zf), B = pr(pfx, yOuter, zf), Cp = pr(xyk, yOuter, zf);
    const cp1 = pr(pfx + bulge, ycM, zf), cp2 = pr(pfx + bulge, yOuter, zf);
    let d = `M ${fx(S[0])},${fx(S[1])} L ${fx(A[0])},${fx(A[1])} C ${fx(cp1[0])},${fx(cp1[1])} ${fx(cp2[0])},${fx(cp2[1])} ${fx(B[0])},${fx(B[1])} L ${fx(Cp[0])},${fx(Cp[1])} L ${fx(S[0])},${fx(S[1])}`;
    let out = `<path d="${d}" fill="none" stroke="${pal.flux}" stroke-width="1.6" stroke-dasharray="6 4" opacity="${op}"/>`;
    if (withArrows) {
      out += tri(pr((yk + pfx) / 2, ycM, zf), UX, 6, pal.flux);                 // por la pierna central →
      out += tri(pr((yk + pfx) / 2, yOuter, zf), [-UX[0], -UX[1]], 6, pal.flux); // por la pierna externa ←
      out += tri(pr(xyk, (ycM + yOuter) / 2, zf), [0, yOuter > ycM ? 1 : -1], 6, pal.flux); // por el yugo
    }
    return out;
  };
  s.push(fluxLoop(yoU, 0.95, true));
  s.push(fluxLoop(yoD, 0.45, false));

  // ----- Gong (placa de bronce a distancia gap) -----
  // Semitransparente: deja ver el polo central de la E, sus cotas y el flujo
  // cruzando el entrehierro detrás de la placa.
  s.push(`<g opacity="0.45">${box3(gx, gx + tg, gy0, gy1, gz0, gz1, GNG)}</g>`);
  // Corrientes de Foucault (representadas en la cara visible)
  const e1 = pr(gx + tg, yc0 + c * 0.5, c * 0.5), e2 = pr(gx + tg, yc0 + c * 1.6, c * 0.5);
  for (const e of [e1, e2]) {
    s.push(`<circle cx="${fx(e[0])}" cy="${fx(e[1])}" r="10" fill="none" stroke="${pal.eddy}" stroke-width="1.4" stroke-dasharray="3 2.5"/>`);
    s.push(tri([e[0] + 10, e[1]], [0, -1], 4.5, pal.eddy));
  }
  // Flecha de fuerza (repulsión, +x)
  const F0p = pr(gx + tg, ycM, c * 0.35);
  const F1p = [F0p[0] + UX[0] * 52, F0p[1] + UX[1] * 52];
  s.push(line(F0p, F1p, pal.force, 3));
  s.push(tri(F1p, UX, 9, pal.force));
  s.push(tag(F1p[0] + 6, F1p[1] + 18, `F ≈ ${fmtForce(F_ac)} @ ${Math.round(f_mech)} Hz (repulsión)`, { a: 'end', c: pal.force, b: true }));
  s.push(tag(e2[0] + 14, e2[1] - 12, `Foucault · K = ${fx(K_eddy * 100, 0)}%`, { a: 'start', c: pal.eddy }));

  // ----- Cotas -----
  s.push(dim(pr(0, 0, c), pr(0, Ht, c), [-46, 0], `alto ≈ ${fx(Ht, 0)}`));
  s.push(dim(pr(0, yoD, c), pr(0, ycM, c), [-16, 0], `w = ${fx(params.w_polo ?? 30, 0)}`));
  s.push(dim(pr(xc0, yc0 - b, c), pr(xc0 + hwm, yc0 - b, c), [PDN[0] * 42, PDN[1] * 42], `hw = ${fx(hwm, 0)}`));
  s.push(dim(pr(yk + 3, yWin0, c), pr(yk + 3, yWin1, c), [-C30 * 30, 0.5 * 30], `dw = ${fx(dwm, 0)}`));
  s.push(dim(pr(pfx, yc1, c), pr(gx, yc1, c), [0.5 * 34, -C30 * 34], `gap = ${fx(gapm, 1)}`));
  s.push(dim(pr(gx, gy1, c), pr(gx + tg, gy1, c), [0.5 * 16, -C30 * 16], `t = ${fx(tg, 1)}`));

  // ----- Etiquetas con línea guía (banda inferior compacta) -----
  const yLbl = AY1 + 16;
  s.push(leader(pr(pfx, yc0 + 2, c * 0.5), [AX0 + 6, yLbl], `polo ${fx(c, 1)}×${fx(c, 1)} mm (Ac = ${fx(params.Ac, 0)} mm²) · B = ${fx(B_core_pk * 1000, 0)} mT (${fx(sat_pct, 0)}% sat)`));
  s.push(leader(pr(xc0 + hwm * 0.62, yc0 - b, c + b), [AX0 + 6, yLbl + 18], `cobre: ${N} vueltas AWG ${params.awg} · build ${fx(depth_used_mm, 1)}/${fx(dwm, 0)} mm (${fx(fill_percent, 0)}%) · ${num_layers} capas (Ø ${fx(d_ext_mm, 2)})`));
  s.push(leader(pr(xyk, (yoD + ycM) / 2, c), [AX0 + 6, yLbl + 36], `camino magnético lc = ${fx(params.lc, 0)} mm (incl. entrehierro) · μ_eff = ${fx(params.mu_eff, 0)}`));
  s.push(leader(pr(gx + tg, yc0 + c * 1.6, gz1 - 4), [AX0 + 356, yLbl + 18], `GONG · B_gap = ${fx(B_gap_pk * 1000, 1)} mT`));

  // =========================================================================
  //  CADENA ELÉCTRICA (columna derecha)
  // =========================================================================
  const EX0 = 652, EX1 = 1140, railA = 716, railB = 1078, cx = (railA + railB) / 2;
  const Vrms = params.Vmax / Math.SQRT2;
  const I_amp = useTx ? tx.I_amp : I_op;
  const P_amp_avg = (useTx ? tx.P_total : P) / 2;
  const V_bob = I_op * Zcoil_op;

  const items = [];
  items.push({ t: 'amp', h: 86 });
  items.push({ t: 'chip', h: 30, txt: `V ${fx(params.Vmax, 2)} Vp (${fx(Vrms, 2)} Vrms) · I ${fx(I_amp, 2)} A pk · P̄ ${fx(P_amp_avg, 1)} W` });
  if (useTx) {
    items.push({ t: 't1', h: 112 });
    items.push({ t: 'chip', h: 30, txt: `V_sec ${fx(tx.V_sec, 1)} Vp · I_bobina ${fx(tx.I_bobina, 2)} A pk · P̄ bobina ${fx(P_avg, 1)} W` });
  }
  if (useRes) {
    items.push({ t: 'cap', h: 72 });
    items.push({ t: 'chip', h: 30, txt: `I ${fx(I_op, 2)} A pk (${fx(I_op_rms, 2)} rms) · V bobina ≈ ${fx(V_bob, 1)} Vp` });
  }
  items.push({ t: 'coil', h: 118 });
  items.push({ t: 'gapz', h: 46 });
  items.push({ t: 'gong', h: 62 });
  const totH = items.reduce((a, o) => a + o.h, 0);
  let ey = Math.max(64, (H - totH) / 2 + 16);
  s.push(T(cx, ey - 10, 'CONEXIÓN ELÉCTRICA (todo en SERIE)', { size: 12, b: true }));

  const blockRect = (y, h) => `<rect x="${EX0}" y="${fx(y)}" width="${EX1 - EX0}" height="${fx(h)}" rx="10" fill="${pal.block}" stroke="${pal.blockS}"/>`;
  const rails = (y0, y1) => line([railA, y0], [railA, y1], pal.railA, 2) + line([railB, y0], [railB, y1], pal.railB, 2);
  const bumps = (x1, x2, y, n, col) => {
    const r = (x2 - x1) / (2 * n);
    let d = `M ${fx(x1)},${fx(y)}`;
    for (let i = 0; i < n; i++) d += ` A ${fx(r)} ${fx(r)} 0 0 1 ${fx(x1 + 2 * r * (i + 1))},${fx(y)}`;
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2"/>`;
  };

  let prevBottom = null;
  for (const it of items) {
    const y = ey, h = it.h, yb = y + h;
    if (it.t === 'chip') {
      s.push(rails(y, yb));
      s.push(tag(cx, y + h / 2 + 3.5, it.txt, { size: 10.5 }));
      ey = yb; prevBottom = null; continue;
    }
    if (prevBottom != null) s.push(rails(prevBottom, y));

    if (it.t === 'amp') {
      s.push(blockRect(y, h));
      const cyA = y + h / 2 - 6;
      s.push(poly([[EX0 + 26, cyA - 17], [EX0 + 26, cyA + 17], [EX0 + 62, cyA]], 'none', pal.wire, { w: 1.6 }));
      s.push(T(EX0 + 76, y + 24, 'AMPLIFICADOR DE AUDIO', { a: 'start', b: true, size: 12 }));
      s.push(T(EX0 + 76, y + 42, `Z nominal ${fx(params.Zamp, 0)} Ω · ve ${fx(results.Z_seen, 1)} Ω (${results.match.label})`, { a: 'start', size: 10.5, c: pal.sub }));
      s.push(T(EX0 + 76, y + 58, `Vp ${fx(params.Vmax, 2)} V · P̄ entregada ≈ ${fx(P_amp_avg, 1)} W`, { a: 'start', size: 10.5, c: pal.sub }));
      s.push(`<circle cx="${railA}" cy="${fx(yb)}" r="3.2" fill="${pal.railA}"/>`);
      s.push(`<circle cx="${railB}" cy="${fx(yb)}" r="3.2" fill="${pal.railB}"/>`);
      s.push(T(railA - 12, yb - 5, '+', { c: pal.railA, b: true }));
      s.push(T(railB + 12, yb - 5, '−', { c: pal.railB, b: true }));
    } else if (it.t === 't1') {
      s.push(blockRect(y, h));
      const yP = y + 34, yS = y + 62, gapC = 7;
      s.push(line([railA, y], [railA, yP], pal.railA, 2));
      s.push(line([railB, y], [railB, yP], pal.railB, 2));
      s.push(bumps(railA, railB, yP, 7, pal.wire));
      s.push(line([railA, yP + gapC], [railB, yP + gapC], pal.wire, 1.6));
      s.push(line([railA, yS - gapC], [railB, yS - gapC], pal.wire, 1.6));
      s.push(bumps(railA, railB, yS, 7, pal.wire));
      s.push(line([railA, yS], [railA, yb], pal.railA, 2));
      s.push(line([railB, yS], [railB, yb], pal.railB, 2));
      s.push(`<circle cx="${railA + 8}" cy="${fx(yP - 8)}" r="2.6" fill="${pal.wire}"/>`);
      s.push(`<circle cx="${railA + 8}" cy="${fx(yS + 8)}" r="2.6" fill="${pal.wire}"/>`);
      s.push(T(EX0 + 12, y + 18, 'T1', { a: 'start', b: true, size: 12 }));
      s.push(T(railA - 14, yP + 4, 'PRI', { a: 'end', size: 9.5, c: pal.sub }));
      s.push(T(railA - 14, yS + 4, 'SEC', { a: 'end', size: 9.5, c: pal.sub }));
      s.push(T(cx, y + 88, `a = ${fx(tx.a, 2)} (V_sec/V_pri) · vueltas ${tx.turns_ratio} · k = ${fx(tx.k, 2)}`, { size: 10.5 }));
      s.push(T(cx, y + 103, `R_pri ${fx(params.R_pri, 1)} Ω · R_sec ${fx(params.R_sec, 2)} Ω · η ${fx(tx.eta, 0)}% · P̄ pérdidas ${fx(tx.P_loss / 2, 1)} W`, { size: 10.5, c: pal.sub }));
    } else if (it.t === 'cap') {
      s.push(blockRect(y, h));
      const yc = y + h / 2;
      s.push(line([railA, y], [railA, yc - 5], pal.railA, 2));
      s.push(line([railA - 13, yc - 5], [railA + 13, yc - 5], pal.wire, 2.4));
      s.push(line([railA - 13, yc + 5], [railA + 13, yc + 5], pal.wire, 2.4));
      s.push(line([railA, yc + 5], [railA, yb], pal.railA, 2));
      s.push(line([railB, y], [railB, yb], pal.railB, 2));
      s.push(T(railA + 24, y + 22, `C = ${fx(C_res_uF, 3)} µF (${params.modo_capacitor === 'manual' ? 'manual' : 'auto'})`, { a: 'start', b: true, size: 11.5 }));
      s.push(T(railA + 24, y + 40, `film/MKP no polarizado ≥ ${fx(V_C_pk * 1.5, 0)} V`, { a: 'start', size: 10.5, c: pal.sub }));
      s.push(T(railA + 24, y + 56, `V_C ≈ ${fx(V_C_pk, 0)} V pico · I ${fx(I_op_rms, 2)} A rms · Q ${fx(Q, 0)}`, { a: 'start', size: 10.5, c: pal.sub }));
    } else if (it.t === 'coil') {
      s.push(blockRect(y, h));
      const yL = y + 40;
      s.push(line([railA, y], [railA, yL], pal.railA, 2));
      s.push(line([railB, y], [railB, yL], pal.railB, 2));
      s.push(bumps(railA, railB, yL, 9, pal.cuT));
      s.push(line([railA, yL - 12], [railB, yL - 12], pal.wire, 1.6));
      s.push(T(EX0 + 12, y + 18, 'BOBINA (núcleo E)', { a: 'start', b: true, size: 12 }));
      s.push(T(cx, y + 62, `N = ${N} vueltas AWG ${params.awg} · L = ${fx(L_mH, 1)} mH`, { size: 10.5 }));
      s.push(T(cx, y + 78, `R_dc ${fx(R_real, 2)} Ω · R_ac ${fx(R_ac, 2)} Ω (F_R ${fx(F_R, 2)}) · Z_op ${fx(Zcoil_op, 1)} Ω`, { size: 10.5, c: pal.sub }));
      s.push(T(cx, y + 94, `FMM ${fx(FMM_op, 0)} A·v · P̄ calor ${fx(P_avg, 1)} W · ΔT ≈ ${fx(deltaT_est, 0)} °C`, { size: 10.5, c: pal.sub }));
      s.push(T(cx, y + 110, `B núcleo ${fx(B_core_pk * 1000, 0)} mT (${fx(sat_pct, 0)}% de B_sat)`, { size: 10.5, c: pal.sub }));
    } else if (it.t === 'gapz') {
      for (const dx of [-34, 0, 34]) {
        s.push(line([cx + dx, y + 4], [cx + dx, y + 30], pal.flux, 1.6, '4 3'));
        s.push(tri([cx + dx, y + 34], [0, 1], 5.5, pal.flux));
      }
      s.push(tag(cx + 130, y + 22, `entrehierro ${fx(gapm, 1)} mm — SIN contacto`, { a: 'middle', c: pal.flux }));
    } else if (it.t === 'gong') {
      s.push(`<rect x="${EX0}" y="${fx(y)}" width="${EX1 - EX0}" height="${fx(h)}" rx="10" fill="${pal.gongL}" stroke="${pal.gongS}" opacity="0.92"/>`);
      s.push(T(cx, y + 24, `GONG bronce 38″ · t ${fx(tg, 1)} mm · ρ_t ${fx(params.rho_t ?? 220, 0)} nΩ·m`, { b: true, size: 11.5, c: theme === 'light' ? '#3b2a08' : '#1c1405' }));
      s.push(T(cx, y + 44, `F ≈ ${fmtForce(F_ac)} a ${Math.round(f_mech)} Hz (2·f) · K ${fx(K_eddy * 100, 0)}% · gap ${fx(gapm, 1)} mm`, { size: 10.5, c: theme === 'light' ? '#3b2a08' : '#1c1405' }));
    }
    ey = yb; prevBottom = yb;
  }

  // ----- Leyenda (arriba, bajo el subtítulo — la banda inferior es de cotas) -----
  const ly = 68;
  s.push(line([24, ly - 4], [56, ly - 4], pal.flux, 1.6, '6 4'));
  s.push(T(62, ly, 'camino magnético (lc)', { a: 'start', size: 10, c: pal.sub }));
  s.push(`<rect x="212" y="${ly - 11}" width="12" height="9" fill="${pal.cuL}"/>`);
  s.push(T(230, ly, 'cobre (bobina)', { a: 'start', size: 10, c: pal.sub }));
  s.push(`<rect x="332" y="${ly - 11}" width="12" height="9" fill="${pal.gongL}"/>`);
  s.push(T(350, ly, 'gong (bronce)', { a: 'start', size: 10, c: pal.sub }));
  s.push(T(460, ly, 'esquema — no a escala exacta', { a: 'start', size: 10, c: pal.sub, op: 0.8 }));

  s.push('</svg>');
  return s.join('\n');
}

// ---------------------------------------------------------------------------
//  Plano del transformador T1 para la sección de FABRICACIÓN del reporte
// ---------------------------------------------------------------------------
export function buildTransformerDetailSvg(params, results, { theme = 'light' } = {}) {
  const pal = PAL[theme] || PAL.light;
  const W = 940, H = 440;
  const { tx, P_avg } = results;
  const s = [];
  const T = (x, y, txt, o = {}) => {
    const { size = 11.5, c: col = pal.text, a = 'start', b: bold = false } = o;
    return `<text x="${fx(x)}" y="${fx(y)}" font-size="${size}" fill="${col}" text-anchor="${a}"${bold ? ' font-weight="700"' : ''}>${txt}</text>`;
  };
  const line = (x1, y1, x2, y2, col, w = 1.6, dash = '') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

  s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`);
  if (pal.bg) s.push(`<rect width="${W}" height="${H}" fill="${pal.bg}"/>`);
  s.push(T(24, 32, 'TRANSFORMADOR DE ADAPTACIÓN T1 — plano y datos', { size: 14, b: true }));
  s.push(T(24, 50, `Convención: a = V_sec / V_pri = ${fx(tx.a, 2)} (${tx.a >= 1 ? 'elevador' : 'reductor'}) · modo ${tx.mode}`, { size: 10.5, c: pal.sub }));

  // Núcleo acorazado (EI): rectángulo con dos ventanas y pierna central
  const cX0 = 70, cY0 = 90, cX1 = 470, cY1 = 380;
  const limbW = 56, cw = 34;   // pierna central y espesor del marco
  const mid = (cX0 + cX1) / 2;
  s.push(`<rect x="${cX0}" y="${cY0}" width="${cX1 - cX0}" height="${cY1 - cY0}" rx="6" fill="${pal.coreL}" stroke="${pal.coreS}"/>`);
  s.push(`<rect x="${cX0 + cw}" y="${cY0 + cw}" width="${mid - limbW / 2 - cX0 - cw}" height="${cY1 - cY0 - 2 * cw}" fill="${pal.bg || '#0b1222'}" stroke="${pal.coreS}"/>`);
  s.push(`<rect x="${mid + limbW / 2}" y="${cY0 + cw}" width="${cX1 - cw - mid - limbW / 2}" height="${cY1 - cY0 - 2 * cw}" fill="${pal.bg || '#0b1222'}" stroke="${pal.coreS}"/>`);
  s.push(T(cX0 + 8, cY1 + 22, 'núcleo acorazado (EI o toroidal de audio/línea)', { size: 10, c: pal.sub }));

  // Devanados sobre la pierna central: PRI arriba, SEC abajo
  const wX0 = mid - limbW / 2 - 52, wX1 = mid + limbW / 2 + 52;
  s.push(`<rect x="${wX0}" y="${cY0 + 48}" width="${wX1 - wX0}" height="86" rx="8" fill="${pal.cuL}" stroke="${pal.cuS}"/>`);
  s.push(`<rect x="${wX0}" y="${cY1 - 134}" width="${wX1 - wX0}" height="86" rx="8" fill="${pal.cuT}" stroke="${pal.cuS}"/>`);
  s.push(T(mid, cY0 + 98, `PRIMARIO (al amplificador) · R_pri = ${fx(params.R_pri, 1)} Ω`, { a: 'middle', b: true, size: 11, c: '#3b2408' }));
  s.push(T(mid, cY1 - 84, `SECUNDARIO (a ${params.usar_resonancia ? 'C y ' : ''}bobina) · R_sec = ${fx(params.R_sec, 2)} Ω`, { a: 'middle', b: true, size: 11, c: '#3b2408' }));

  // Terminales
  const pY1 = cY0 + 66, pY2 = cY0 + 116, sY1 = cY1 - 116, sY2 = cY1 - 66;
  s.push(line(wX0, pY1, 24, pY1, pal.railA, 2)); s.push(line(wX0, pY2, 24, pY2, pal.railB, 2));
  s.push(line(wX1, sY1, 516, sY1, pal.railA, 2)); s.push(line(wX1, sY2, 516, sY2, pal.railB, 2));
  s.push(`<circle cx="30" cy="${pY1}" r="4" fill="${pal.railA}"/><circle cx="30" cy="${pY2}" r="4" fill="${pal.railB}"/>`);
  s.push(`<circle cx="510" cy="${sY1}" r="4" fill="${pal.railA}"/><circle cx="510" cy="${sY2}" r="4" fill="${pal.railB}"/>`);
  s.push(T(38, pY1 - 8, 'P1 (+) · punto = fase', { size: 10, c: pal.sub }));
  s.push(T(38, pY2 + 16, 'P2 (−)', { size: 10, c: pal.sub }));
  s.push(T(505, sY1 - 8, 'S1 (+) · punto = fase', { size: 10, c: pal.sub, a: 'end' }));
  s.push(T(505, sY2 + 16, 'S2 (−)', { size: 10, c: pal.sub, a: 'end' }));
  s.push(`<circle cx="${wX0 + 10}" cy="${pY1}" r="3" fill="${pal.text}"/>`);
  s.push(`<circle cx="${wX1 - 10}" cy="${sY1}" r="3" fill="${pal.text}"/>`);

  // Panel de datos (incluye especificación de fabricación: calibres, potencia,
  // aislamiento — todo lo que necesita el fabricante del transformador)
  const awgTxt = (r) => (r.ok ? `AWG ${r.awg}` : `sección ≥ ${fx(r.mm2, 1)} mm² (hilos en paralelo)`);
  const dX = 560, rows = [
    ['Relación a = V_sec/V_pri', `${fx(tx.a, 2)}  (inversa ${fx(tx.a_inv, 2)})`],
    ['Relación de vueltas pri:sec', tx.turns_ratio],
    ['Alambre primario', `${awgTxt(tx.awg_pri)} · ${fx(tx.I_amp_rms, 2)} A rms (J = 4 A/mm²)`],
    ['Alambre secundario', `${awgTxt(tx.awg_sec)} · ${fx(tx.I_bobina_rms, 2)} A rms (J = 4 A/mm²)`],
    ['Acoplamiento k', fx(tx.k, 2)],
    ['Tensión', `${fx(params.Vmax, 2)} Vp → ${fx(tx.V_sec, 1)} Vp`],
    ['Corriente', `${fx(tx.I_amp, 2)} A pk → ${fx(tx.I_bobina, 2)} A pk`],
    ['Potencia media', `entra ${fx(tx.P_total / 2, 1)} W → bobina ${fx(P_avg, 1)} W`],
    ['Pérdidas / eficiencia', `${fx(tx.P_loss / 2, 1)} W · η = ${fx(tx.eta, 0)}%`],
    ['Índice de flujo V_sec/f', `${tx.flux_index.toExponential(2)} V·s ${tx.sat_risk ? '⚠ riesgo de saturación' : '✓'}`],
    ['Potencia nominal / aislamiento', `≥ ${tx.P_nom} W continuos @ ${fx(params.f, 0)} Hz · aislamiento ≥ ${tx.V_iso} V`],
  ];
  s.push(T(dX, 78, 'DATOS DE T1 (especificación de fabricación)', { size: 12.5, b: true }));
  rows.forEach(([kx, v], i) => {
    const y = 100 + i * 29;
    s.push(T(dX, y, kx, { size: 10, c: pal.sub }));
    s.push(T(dX, y + 13, v, { size: 11, b: true }));
    s.push(line(dX, y + 19, W - 30, y + 19, pal.blockS, 0.5));
  });

  s.push('</svg>');
  return s.join('\n');
}
