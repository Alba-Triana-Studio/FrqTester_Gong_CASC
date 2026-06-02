// ============================================================================
//  coilMath.js — Motor de cálculo del Coil Designer
//  Excitación acústica por inducción sobre gong de bronce (núcleo en 'E').
//
//  PRINCIPIO RECTOR:
//  La FMM la limitan la POTENCIA disipable y el VOLUMEN DE COBRE, no el nº de
//  vueltas por sí solo:   FMM = √(P · V_cobre / ρ) / l_vuelta.
//  A volumen de cobre fijo (carrete lleno) R ∝ N², así que FMM ∝ √P y subir N
//  no aporta nada. El nº de vueltas solo fija la IMPEDANCIA a la que el
//  amplificador ve la carga; la resonancia serie cancela X_L y multiplica la
//  corriente por Q = X_L/R.
//
//  Todo el cálculo interno se hace en SI (m, Ω, H, F, A) y se convierte solo
//  para mostrar.
// ============================================================================

// ----- Constantes físicas -----
export const MU_0 = 4 * Math.PI * 1e-7;   // Permeabilidad del vacío [H/m]
export const RHO_CU = 1.724e-8;           // Resistividad del cobre @20°C [Ω·m]
export const ALPHA_CU = 0.00393;          // Coef. térmico del cobre [1/°C]
export const ENAMEL_FACTOR = 1.09;        // d_exterior ≈ d_cobre * 1.09 (esmalte)

// Densidad de corriente segura (continua, conservadora para bobinas con poca
// ventilación). Define la "corriente máxima" recomendada de cada calibre.
// Sube este valor para uso intermitente / música (la excitación del gong lo es).
export const J_SAFE = 4.0;                // [A_rms / mm²]

// ----- Tabla AWG (calibres 18–32) -----
// Diámetro del cobre desnudo por la fórmula estándar:
//     d_mm(n) = 0.127 * 92^((36 - n) / 39)
export function awgBareDiameterMm(n) {
  return 0.127 * Math.pow(92, (36 - n) / 39);
}
export function awgExtDiameterMm(n) {
  return awgBareDiameterMm(n) * ENAMEL_FACTOR;
}
export function awgCopperArea(n) {        // [m²]
  const d_m = awgBareDiameterMm(n) / 1000;
  return Math.PI * Math.pow(d_m / 2, 2);
}
export function awgOhmsPerMeter(n) {      // [Ω/m]
  return RHO_CU / awgCopperArea(n);
}
// Corriente máxima segura (rms) del calibre, según J_SAFE.
export function awgSafeCurrentRms(n) {    // [A_rms]
  return J_SAFE * awgCopperArea(n) * 1e6; // A_wire en mm²
}

export const AWG_LIST = Array.from({ length: 32 - 18 + 1 }, (_, i) => 18 + i);

export const AWG_TABLE = (() => {
  const t = {};
  for (const n of AWG_LIST) {
    t[n] = {
      d_cu: awgBareDiameterMm(n),
      d_ext: awgExtDiameterMm(n),
      area: awgCopperArea(n),
      ohm_m: awgOhmsPerMeter(n),
      i_safe: awgSafeCurrentRms(n),
    };
  }
  return t;
})();

const safeDiv = (a, b) => (b && isFinite(b) ? a / b : 0);
const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);

// ============================================================================
//  Transformador de adaptación T1
//  Convención:  a = V_secundario / V_primario  (a>1 = elevador).
//  Impedancia reflejada al primario = Z_secundario / a².
//  Modelo de pérdidas: R_pri (primario), R_sec (secundario) y un coeficiente de
//  acoplamiento k (0–1) que reduce la corriente útil del secundario; la parte no
//  transferida se contabiliza como pérdida de T1 -> el balance energético cierra
//  SIEMPRE:  P_amp = P_bobina + P_perdida_T1.
//  coil: { R, N, X }  con X = reactancia neta de la bobina a esa frecuencia
//  (X_L, o X_L − 1/ωC si la resonancia está activa).
// ============================================================================
export function transformerAt(p, coil, a) {
  const Vmax = p.Vmax;
  const R_pri = Math.max(p.R_pri || 0, 0);
  const R_sec = Math.max(p.R_sec || 0, 0);
  const k = clamp(p.acoplamiento_k == null ? 1 : p.acoplamiento_k, 0, 1);
  const aa = Math.max(a, 1e-9);

  const Rs = coil.R + R_sec;                      // resistencia del lazo secundario
  const Zsec_mag = Math.sqrt(Rs * Rs + coil.X * coil.X);
  const Z_refl_mag = Zsec_mag / (aa * aa);        // bobina reflejada al primario
  const Re = R_pri + Rs / (aa * aa);              // parte resistiva que ve el ampli
  const Im = coil.X / (aa * aa);
  const Zve = Math.sqrt(Re * Re + Im * Im);       // |Z_amp_ve|

  const I_amp = safeDiv(Vmax, Zve);               // corriente del primario (ampli)
  const I_bobina = safeDiv(k * I_amp, aa);        // corriente del secundario (bobina)
  const V_sec = I_bobina * Zsec_mag;              // tensión de pico en el secundario
  const FMM = coil.N * I_bobina;

  const P_bobina = I_bobina * I_bobina * coil.R;  // calor útil (genera FMM)
  const P_Rsec = I_bobina * I_bobina * R_sec;
  const P_Rpri = I_amp * I_amp * R_pri;
  const P_total = I_amp * I_amp * Re;             // potencia entregada por el ampli
  const P_coupling = Math.max(P_total - P_Rpri - P_bobina - P_Rsec, 0); // fuga/núcleo
  const P_loss = P_Rpri + P_Rsec + P_coupling;
  const eta = P_total > 0 ? (P_bobina / P_total) * 100 : 0;
  const balance_ok = Math.abs(P_total - (P_bobina + P_loss)) <= 1e-6 * Math.max(P_total, 1);

  return {
    a: aa, a_inv: safeDiv(1, aa), k,
    Zve, Z_refl_mag, Re, Im,
    I_amp, I_bobina, V_sec, FMM,
    P_bobina, P_Rpri, P_Rsec, P_coupling, P_loss, P_total, eta, balance_ok,
  };
}

// ============================================================================
//  Cálculo principal
// ============================================================================
export function calculateCoil(p) {
  const {
    Vmax, Rtarget, f, mu_eff, Ac, lc,
    awg, hw, dw, perim, Zamp,
    usar_resonancia, usar_transformador,
    modo_relacion, a_manual,
  } = p;

  // --- Conversión a SI ---
  const Ac_si = Math.max(Ac, 0) / 1e6;
  const lc_si = Math.max(lc, 1e-6) / 1e3;
  const lv_si = Math.max(perim, 1e-6) / 1e3;
  const fHz   = Math.max(f, 0.001);

  // --- 3.1 Sección y resistencia del alambre ---
  const d_cu_mm  = awgBareDiameterMm(awg);
  const d_ext_mm = awgExtDiameterMm(awg);
  const A_wire   = awgCopperArea(awg);
  const A_wire_mm2 = A_wire * 1e6;
  const ohm_m    = safeDiv(RHO_CU, A_wire);
  const i_safe_rms = J_SAFE * A_wire_mm2;            // corriente máx segura [A_rms]
  const i_safe_pk  = i_safe_rms * Math.SQRT2;        // en términos de pico

  // --- 3.2 Número de vueltas desde la resistencia objetivo ---
  const N_exact = safeDiv(Math.max(Rtarget, 0) * A_wire, RHO_CU * lv_si);
  const N = Math.max(Math.floor(N_exact), 0);
  const l_total = N * lv_si;
  const R_real = safeDiv(RHO_CU * l_total, A_wire);
  const R = Math.max(R_real, 1e-9);

  // --- 3.3 Inductancia ---
  const L = safeDiv(MU_0 * mu_eff * N * N * Ac_si, lc_si);

  // --- 3.4 Impedancia compleja en AC ---
  const omega = 2 * Math.PI * fHz;
  const XL = omega * L;
  const Z = Math.sqrt(R * R + XL * XL);
  const phi_deg = Math.atan2(XL, R) * (180 / Math.PI);

  // --- 3.5 Corriente de pico y FMM (SIN resonancia) ---
  const I_pico = safeDiv(Vmax, Z);
  const FMM = N * I_pico;

  // --- 3.5b Resonancia serie ---
  const C_res = L > 0 ? safeDiv(1, omega * omega * L) : 0;
  const I_res = safeDiv(Vmax, R);
  const FMM_res = N * I_res;
  const Q = safeDiv(XL, R);
  const mult = safeDiv(Z, R);

  // Reactancia NETA de la bobina en f_op: el capacitor cancela X_L si la
  // resonancia está activa (queda ≈ 0), si no, X = X_L.
  const X_op = usar_resonancia ? (XL - (C_res > 0 ? 1 / (omega * C_res) : 0)) : XL;
  const Zcoil_op = Math.sqrt(R * R + X_op * X_op); // = R con resonancia, = Z sin ella

  // --- 3.7 Transformador de adaptación T1 ---
  // Relación: auto = √(|Z_bobina(f_op)|/Zamp). Si hay resonancia, Z_bobina≈R en
  // f_op, así que a sale mucho menor (importante recalcular según los toggles).
  const a_auto = Zamp > 0 ? Math.sqrt(safeDiv(Zcoil_op, Zamp)) : 0;
  const a_used = usar_transformador
    ? (modo_relacion === 'manual' ? Math.max(a_manual || 1e-6, 1e-6) : a_auto)
    : a_auto;
  const tx = transformerAt(p, { R, N, X: X_op }, a_used);
  tx.a_auto = a_auto;
  tx.mode = modo_relacion === 'manual' ? 'manual' : 'auto';
  // Relación de vueltas aproximada primario:secundario (a = N_sec/N_pri).
  tx.turns_ratio = a_used >= 1 ? `1 : ${a_used.toFixed(2)}` : `${(1 / a_used).toFixed(2)} : 1`;
  // Saturación de T1 (cualitativa): B ∝ V_sec/(f). Aviso si V_sec alto y f baja.
  tx.flux_index = safeDiv(tx.V_sec, fHz);          // proxy V·s (∝ B·N·A)
  tx.sat_risk = usar_transformador && fHz < 200 && tx.V_sec > Vmax * 1.3;

  // --- Operación activa según la TOPOLOGÍA (toggles) ---
  const I_direct = usar_resonancia ? I_res : I_pico;     // drive directo a la bobina
  const I_op   = usar_transformador ? tx.I_bobina : I_direct;  // corriente EN la bobina
  const FMM_op = N * I_op;                                // FMM real (la da I_bobina)
  const Z_op   = usar_resonancia ? R : Z;                // carga de la bobina (sin T1)
  const Z_seen = usar_transformador ? tx.Zve : Z_op;     // lo que ve el amplificador
  const I_op_rms = I_op / Math.SQRT2;

  // --- Verificación térmica del alambre (usa la corriente REAL de la bobina) ---
  const current_ok = I_op_rms <= i_safe_rms;
  const current_use_pct = i_safe_rms > 0 ? (I_op_rms / i_safe_rms) * 100 : Infinity;

  // --- 3.6 Potencia disipada en la bobina (calor que genera la FMM) ---
  const P = I_op * I_op * R;                          // pico
  const P_avg = P / 2;                               // promedio sinusoidal

  // --- Volumen de cobre y FMM teórica máxima a esta potencia (educativo) ---
  const V_cu = A_wire * l_total;
  const FMM_limit = safeDiv(Math.sqrt(safeDiv(P * V_cu, RHO_CU)), lv_si);

  // --- Adaptación: la carga que ve el ampli (con o sin T1) frente a Zamp ---
  const Z_load = Z_op;
  const a_opt = a_auto;
  const Z_refl = tx.Z_refl_mag;
  const match = evaluateMatch(Z_seen, Zamp);

  // --- Motor de consejos (cubre las 4 combinaciones de toggles) ---
  const advice = buildAdvice(p, { R, Z, Zcoil_op, Zamp, Q, tx, a_auto, fHz, FMM_op });

  // --- 3.8 Factor de llenado por capas ---
  const turns_per_layer = d_ext_mm > 0 ? Math.floor(hw / d_ext_mm) : 0;
  const layers_max      = d_ext_mm > 0 ? Math.floor(dw / d_ext_mm) : 0;
  const num_layers      = turns_per_layer > 0 ? Math.ceil(N / turns_per_layer) : 0;
  const depth_used_mm   = num_layers * d_ext_mm;
  const N_max           = turns_per_layer * layers_max;
  const fill_percent    = dw > 0 ? safeDiv(depth_used_mm, dw) * 100 : Infinity;
  const fits            = N <= N_max && fill_percent <= 100;
  const overflow        = !fits;

  return {
    d_cu_mm, d_ext_mm, A_wire, A_wire_mm2, ohm_m, i_safe_rms, i_safe_pk,
    N_exact, N, l_total, R_real, R, V_cu,
    L, L_mH: L * 1000, omega, XL, X_op, Zcoil_op, Z, phi_deg,
    I_pico, FMM,
    C_res, C_res_uF: C_res * 1e6, C_res_nF: C_res * 1e9,
    I_res, FMM_res, Q, mult,
    I_direct, I_op, FMM_op, Z_op, Z_seen, I_op_rms, current_ok, current_use_pct, FMM_limit,
    P, P_avg,
    a_opt, Z_refl, Z_load, match, tx, advice,
    turns_per_layer, layers_max, num_layers, depth_used_mm, N_max,
    fill_percent, fits, overflow,
  };
}

// Motor de consejos: evalúa {transformador, resonancia} y la adaptación,
// devolviendo el número concreto que motiva cada recomendación.
function buildAdvice(p, c) {
  const T = p.usar_transformador, Rz = p.usar_resonancia;
  const { R, Z, Zamp, Q, tx, a_auto, fHz, FMM_op } = c;
  const f0 = Math.round(fHz);
  const N = (label, value) => ({ label, value });

  if (!T && !Rz) {
    const m = Zamp > 0 ? Z / Zamp : 0;
    if (m > 2 || m < 0.5) {
      return {
        status: 'bad', title: 'Drive directo · mala adaptación',
        detail: `A ${f0} Hz el ampli ve ${Z.toFixed(0)} Ω frente a ${Zamp} Ω (${m.toFixed(1)}×): entrega poca potencia. Activa la resonancia (cancela X_L), o el transformador, o acerca Rtarget a Zamp.`,
        numbers: [N('Z bobina', `${Z.toFixed(0)} Ω`), N('desadaptación', `${m.toFixed(1)}×`)],
      };
    }
    return {
      status: 'ok', title: 'Drive directo · adaptado',
      detail: `El ampli ve ${Z.toFixed(1)} Ω ≈ Zamp. Banda ancha, pero sin la ganancia de corriente de la resonancia.`,
      numbers: [N('Z bobina', `${Z.toFixed(1)} Ω`), N('Zamp', `${Zamp} Ω`)],
    };
  }

  if (Rz && !T) {
    const m = Zamp > 0 ? R / Zamp : 0;
    if (m >= 0.5 && m <= 2) {
      return {
        status: 'ok', title: 'Resonancia · bien adaptado (banda estrecha)',
        detail: `En ${f0} Hz la bobina cae a R = ${R.toFixed(1)} Ω ≈ Zamp. Ganancia de corriente Q = ${Q.toFixed(0)}. Fuera de esa frecuencia se desadapta.`,
        numbers: [N('R', `${R.toFixed(1)} Ω`), N('Q', Q.toFixed(0)), N('desadaptación', `${m.toFixed(2)}×`)],
      };
    }
    const aSug = Zamp > 0 ? Math.sqrt(R / Zamp) : 0;
    return {
      status: 'warn', title: 'Resonancia · módulo sin adaptar',
      detail: `X_L cancelada, pero el módulo R = ${R.toFixed(1)} Ω ≠ Zamp = ${Zamp} Ω. Combínala con un transformador de relación a ≈ √(R/Zamp) = ${aSug.toFixed(2)}.`,
      numbers: [N('R', `${R.toFixed(1)} Ω`), N('a sugerida', aSug.toFixed(2)), N('Q', Q.toFixed(0))],
    };
  }

  if (T && !Rz) {
    const reactive = R > 0 && Z / R > 2;
    if (reactive) {
      return {
        status: 'warn', title: 'Transformador sin resonancia · carga reactiva',
        detail: `A ${f0} Hz la bobina es casi pura reactancia (Z = ${Z.toFixed(0)} Ω vs R = ${R.toFixed(1)} Ω). El transformador iguala el módulo, pero solo el ${tx.eta.toFixed(0)}% de la potencia llega a la bobina: el resto vuelve como reactiva o se pierde en R_pri. Activa la resonancia para cancelar X_L.`,
        numbers: [N('η', `${tx.eta.toFixed(0)} %`), N('Z/R', `${(Z / R).toFixed(0)}×`), N('a', tx.a.toFixed(1))],
      };
    }
    if (tx.eta < 70) {
      return {
        status: 'warn', title: 'Transformador · eficiencia baja por R_pri',
        detail: `Solo el ${tx.eta.toFixed(0)}% de la potencia llega a la bobina; R_pri = ${p.R_pri} Ω se queda el resto. Reduce R_pri o usa una bobina de mayor R.`,
        numbers: [N('η', `${tx.eta.toFixed(0)} %`), N('a', tx.a.toFixed(2)), N('ve', `${tx.Zve.toFixed(1)} Ω`)],
      };
    }
    return {
      status: 'ok', title: 'Transformador · adaptación de banda ancha',
      detail: `η = ${tx.eta.toFixed(0)}%. La carga que ve el ampli es estable (${tx.Zve.toFixed(1)} Ω) en toda la banda — pero sin resonancia la corriente y la FMM caen con la frecuencia (la carga es plana, la FMM no).`,
      numbers: [N('η', `${tx.eta.toFixed(0)} %`), N('a', tx.a.toFixed(2)), N('ve', `${tx.Zve.toFixed(1)} Ω`)],
    };
  }

  // T && Rz
  const trivial = tx.a > 0.9 && tx.a < 1.1;
  const aOff = a_auto > 0 && Math.abs(tx.a - a_auto) / a_auto > 0.3;
  const sat = tx.sat_risk ? ` ⚠ V_sec = ${tx.V_sec.toFixed(1)} V a ${f0} Hz: vigila la saturación de T1.` : '';
  let detail;
  if (aOff) {
    detail = `Relación a = ${tx.a.toFixed(2)} lejos de la óptima √(R/Zamp) = ${a_auto.toFixed(2)}: el ampli ve ${tx.Zve.toFixed(1)} Ω. Ajústala para maximizar η (ahora ${tx.eta.toFixed(0)}%).`;
  } else if (trivial) {
    detail = `Rtarget ≈ Zamp (a ≈ 1): el transformador apenas ayuda y resta η por R_pri (${tx.eta.toFixed(0)}%). Desactívalo, o úsalo solo si subes Rtarget.`;
  } else {
    detail = `Sintonizado en ${f0} Hz con a = ${tx.a.toFixed(2)}, Q = ${Q.toFixed(0)}, η = ${tx.eta.toFixed(0)}%. Pico de FMM ${FMM_op.toFixed(0)} A·v.`;
  }
  return {
    status: tx.sat_risk || aOff ? 'warn' : 'ok',
    title: 'Transformador + resonancia · óptimo de banda estrecha',
    detail: detail + sat,
    numbers: [N('a', tx.a.toFixed(2)), N('Q', Q.toFixed(0)), N('η', `${tx.eta.toFixed(0)} %`), N('FMM', FMM_op.toFixed(0))],
  };
}

// Veredicto de adaptación de impedancia bobina ↔ amplificador.
export function evaluateMatch(Zload, Zamp) {
  if (!Zamp || !isFinite(Zload) || Zload <= 0) {
    return { status: 'na', ratio: 0, label: '—', advice: '' };
  }
  const ratio = Zload / Zamp;
  if (ratio < 0.5) {
    return {
      status: 'low', ratio,
      label: 'Impedancia muy baja',
      advice: 'Sobrecorriente: el amplificador puede recortar o protegerse. Sube Rtarget hacia Zamp o usa transformador.',
    };
  }
  if (ratio > 2) {
    return {
      status: 'high', ratio,
      label: 'Impedancia muy alta',
      advice: 'Poca potencia entregada. Baja Rtarget hacia Zamp o usa transformador reductor.',
    };
  }
  return {
    status: 'ok', ratio,
    label: 'Bien adaptada',
    advice: 'La carga que ve el amplificador está cerca de su impedancia nominal.',
  };
}

// ============================================================================
//  Recomendación de calibre
//  A Rtarget fijo, la corriente y la potencia son ~iguales para todo calibre
//  (R manda). Más cobre (calibre más grueso) => más FMM, pero llena el carrete
//  más rápido. Recomendación = el calibre MÁS GRUESO que aún quepa y aguante
//  la corriente => máxima FMM viable.
// ============================================================================
export function recommendAWG(params) {
  const rows = AWG_LIST.map((n) => {
    const c = calculateCoil({ ...params, awg: n });
    return { awg: n, fits: c.fits, current_ok: c.current_ok, FMM: c.FMM_op, fill: c.fill_percent };
  });
  const viable = rows.filter((r) => r.fits && r.current_ok);
  if (viable.length) {
    // el más grueso (menor nº AWG) viable => mayor FMM
    const best = viable.reduce((a, b) => (b.awg < a.awg ? b : a));
    return { awg: best.awg, ok: true, reason: 'Calibre más grueso que cabe y aguanta la corriente (máxima FMM).' };
  }
  // Sin opción ideal: prioriza que quepa, luego que aguante corriente.
  const fitting = rows.filter((r) => r.fits);
  if (fitting.length) {
    const best = fitting.reduce((a, b) => (b.awg < a.awg ? b : a));
    return { awg: best.awg, ok: false, reason: 'Ninguno cumple todo; este cabe pero revisa la corriente.' };
  }
  const thinnest = rows.reduce((a, b) => (b.awg > a.awg ? b : a));
  return { awg: thinnest.awg, ok: false, reason: 'Ni el más fino cabe: agranda el carrete o baja Rtarget.' };
}

// ============================================================================
//  OPTIMIZADOR — máxima FMM dirigida al gong, usando un amplificador
//
//  De la intersección de las ecuaciones, la FMM real se reduce a:
//      FMM = √(P_bobina · V_cobre / ρ) / l_vuelta
//  Solo importan: la potencia que llega a la bobina, el volumen de cobre y el
//  perímetro de vuelta. Criterios derivados:
//   1) Maximizar la potencia entregada -> adaptar la carga a Zamp (el ampli es
//      el techo: no puede ver menos de Zamp sin recortar).
//   2) Maximizar el cobre -> llenar el carrete (calibre grueso, más vueltas).
//   3) Objetivo: FMM_op de la topología activa.
//  Restricciones DURAS (una opción solo es válida si):
//   - cabe (fill ≤ 100%) · no sobrecalienta (I ≤ I_segura) ·
//   - no sobrecarga el ampli (Z_vista ≥ Zamp·0.9).
//  Se busca por fuerza bruta sobre las variables DESBLOQUEADAS.
// ============================================================================
export const OPTIM_CRITERIA = {
  objetivo: 'Máxima FMM (empuje magnético sobre el gong) en la frecuencia de trabajo.',
  ley: 'FMM = √(P_bobina · V_cobre / ρ) / l_vuelta — manda la potencia entregada y el cobre, no el nº de vueltas.',
  restricciones: [
    'Cabe en el carrete (llenado ≤ 100%).',
    'El alambre no se sobrecalienta (corriente ≤ máx segura del calibre).',
    'El amplificador no se sobrecarga (impedancia vista ≥ su valor nominal).',
  ],
};

const OPTIM_LABELS = {
  Vmax: 'Vmax', Rtarget: 'Rtarget', f: 'f', mu_eff: 'μ_eff', Ac: 'Ac', lc: 'lc',
  awg: 'AWG', hw: 'hw', dw: 'dw', perim: 'perím', Zamp: 'Zamp',
  usar_resonancia: 'resonancia', usar_transformador: 'transformador',
};

// Variables en orden de prioridad de búsqueda (alto impacto primero).
const OPTIM_VARS = ['awg', 'Rtarget', 'usar_resonancia', 'usar_transformador',
  'hw', 'dw', 'perim', 'Vmax', 'Zamp', 'mu_eff', 'Ac', 'lc', 'f'];

const uniqNum = (arr) => [...new Set(arr.filter((x) => x != null && isFinite(x)))];
const candidatesFor = (k, v) => {
  switch (k) {
    case 'Vmax': return uniqNum([v, 4.24, 8, 12, 24]);
    case 'Rtarget': return uniqNum([v, 4, 6, 8, 12, 16, 24, 32]);
    case 'f': return uniqNum([v, 250, 500, 1000, 2000]);
    case 'mu_eff': return uniqNum([v, 5, 10, 20, 40]);
    case 'Ac': return uniqNum([v, 500, 1000, 2000, 4000]);
    case 'lc': return uniqNum([v, 50, 100, 200]);
    case 'awg': return AWG_LIST;
    case 'hw': return uniqNum([v, 20, 30, 40, 60, 80]);
    case 'dw': return uniqNum([v, 10, 15, 20, 30]);
    case 'perim': return uniqNum([v, 50, 80, 100, 150]);
    case 'Zamp': return uniqNum([v, 4, 8]);
    case 'usar_resonancia': return [true, false];
    case 'usar_transformador': return [true, false];
    default: return [v];
  }
};

const optChanged = (a, b) => (typeof a === 'boolean' ? a !== b : Math.abs(a - b) > 1e-6);
const optFmt = (x) => (typeof x === 'boolean' ? (x ? 'ON' : 'OFF') : (Number.isInteger(x) ? `${x}` : x.toFixed(x < 10 ? 2 : 0)));

export function optimizeFMM(params, locks = {}) {
  const MAX_EVALS = 40000;
  // 1) Rejillas por variable, respetando bloqueos y un presupuesto de evaluaciones.
  const grids = {};
  let product = 1;
  for (const k of OPTIM_VARS) {
    if (locks[k]) { grids[k] = [params[k]]; continue; }
    let cand = candidatesFor(k, params[k]);
    if (product * cand.length > MAX_EVALS) {
      const allow = Math.max(1, Math.floor(MAX_EVALS / product));
      cand = cand.slice(0, allow);
      if (!cand.some((x) => !optChanged(x, params[k]))) cand[cand.length - 1] = params[k];
    }
    grids[k] = cand;
    product *= cand.length;
  }

  // 2) Producto cartesiano + evaluación + filtrado de viabilidad.
  const lens = OPTIM_VARS.map((k) => grids[k].length);
  const total = lens.reduce((a, b) => a * b, 1);
  const feasible = [];
  for (let n = 0; n < total; n++) {
    let rem = n;
    const cfg = { ...params };
    for (let i = 0; i < OPTIM_VARS.length; i++) {
      const L = lens[i];
      cfg[OPTIM_VARS[i]] = grids[OPTIM_VARS[i]][rem % L];
      rem = Math.floor(rem / L);
    }
    if (cfg.usar_transformador) cfg.modo_relacion = 'auto';
    const r = calculateCoil(cfg);
    if (!r.fits || !r.current_ok) continue;            // cabe y no se sobrecalienta
    if (r.Z_seen < cfg.Zamp * 0.9) continue;           // ampli no sobrecargado
    if (!(r.FMM_op > 0) || !isFinite(r.FMM_op)) continue;
    feasible.push({ cfg, fmm: r.FMM_op, r });
  }

  // 3) Orden por FMM desc (a igual FMM, preferir más margen térmico y de bobinado)
  //    + deduplicado por (calibre, topología, FMM): colapsa variantes de Rtarget/
  //    geometría que dan la MISMA FMM, dejando opciones realmente distintas.
  feasible.sort((a, b) =>
    (b.fmm - a.fmm) || (a.r.current_use_pct - b.r.current_use_pct) || (a.r.fill_percent - b.r.fill_percent));
  const seen = new Set();
  const top = [];
  for (const o of feasible) {
    const c = o.cfg;
    const sig = [c.awg, c.usar_resonancia ? 1 : 0, c.usar_transformador ? 1 : 0, Math.round(o.fmm)].join('|');
    if (seen.has(sig)) continue;
    seen.add(sig);
    top.push(o);
    if (top.length >= 10) break;
  }
  return { criteria: OPTIM_CRITERIA, options: top.map((o, i) => describeOption(o, i, params)) };
}

function describeOption(o, rank, orig) {
  const c = o.cfg, r = o.r;
  const res = c.usar_resonancia, tx = c.usar_transformador;
  const topo = res && tx ? 'Resonancia + Transformador' : res ? 'Resonancia' : tx ? 'Transformador' : 'Directo';
  const good = [], bad = [];

  if (res && tx) good.push(`sintonizada y adaptada al ampli (Q=${r.Q.toFixed(0)}, η=${r.tx.eta.toFixed(0)}%)`);
  else if (res) good.push(`máxima corriente en ${Math.round(c.f)} Hz (Q=${r.Q.toFixed(0)})`);
  else if (tx) good.push(`carga estable en toda la banda (η=${r.tx.eta.toFixed(0)}%)`);
  else good.push('montaje simple, sin capacitor ni transformador');
  if (r.fill_percent >= 75) good.push(`aprovecha el carrete (${r.fill_percent.toFixed(0)}% de cobre)`);
  if (r.current_use_pct < 50) good.push('amplio margen térmico');
  if (c.awg <= 22) good.push('alambre grueso y robusto');

  if (res) bad.push(`banda estrecha: solo cerca de ${Math.round(c.f)} Hz`);
  if (tx) bad.push(`pierde ${(100 - r.tx.eta).toFixed(0)}% en T1 y añade un transformador`);
  if (r.fill_percent > 92) bad.push('carrete casi lleno: bobinado difícil');
  if (r.current_use_pct > 80) bad.push(`corriente al ${r.current_use_pct.toFixed(0)}% del límite del alambre`);
  if (tx && r.tx.sat_risk) bad.push('riesgo de saturación de T1 a baja frecuencia');
  if (c.awg >= 30) bad.push('alambre muy fino y frágil');

  const changes = [];
  for (const k of OPTIM_VARS) {
    if (optChanged(c[k], orig[k])) changes.push(`${OPTIM_LABELS[k]} ${optFmt(orig[k])}→${optFmt(c[k])}`);
  }

  return {
    rank: rank + 1, cfg: c, fmm: o.fmm, topo, res, tx,
    awg: c.awg, Rtarget: c.Rtarget, eta: tx ? r.tx.eta : 100, Q: res ? r.Q : 0,
    fill: r.fill_percent, current_use: r.current_use_pct, N: r.N, l_total: r.l_total,
    good, bad, changes,
    description: `Buena para: ${good.join('; ')}. Sacrifica: ${bad.length ? bad.join('; ') : 'poco — opción equilibrada'}.`,
  };
}

// ============================================================================
//  Datasets para las visualizaciones
// ============================================================================
export const F_MIN = 20;
export const F_MAX = 5000;

// Barrido de frecuencias log-espaciado y DENSO que incluye SIEMPRE la frecuencia
// de operación f (con puntos agrupados a su alrededor) para dibujar con fidelidad
// el valle de resonancia, que es muy agudo. Sin esto, si f no cae en un punto del
// barrido, el mínimo real (= R) no se dibuja y el valle parece menos profundo.
function freqSweep(f) {
  const pts = new Set();
  const n = 70;
  const decades = Math.log10(F_MAX / F_MIN);
  for (let i = 0; i <= n; i++) {
    pts.add(F_MIN * Math.pow(10, (i / n) * decades));
  }
  if (f > 0) {
    // racimo alrededor de f para que el valle/pico quede bien definido
    [0.7, 0.85, 0.92, 0.96, 0.98, 0.99, 1, 1.01, 1.02, 1.04, 1.08, 1.15, 1.3].forEach((k) => {
      const v = f * k;
      if (v >= F_MIN && v <= F_MAX) pts.add(v);
    });
  }
  return Array.from(pts).sort((a, b) => a - b);
}

// Magnitudes dependientes de la frecuencia en un punto, para TODA topología.
// Cada gráfica toma de aquí solo las series pertinentes a los toggles activos.
function bandRow(base, params, freq) {
  const { L, R, C_res: C, N } = base;
  const Vmax = params.Vmax;
  const a = base.tx.a;
  const R_pri = Math.max(params.R_pri || 0, 0);
  const R_sec = Math.max(params.R_sec || 0, 0);
  const k = clamp(params.acoplamiento_k == null ? 1 : params.acoplamiento_k, 0, 1);

  const w = 2 * Math.PI * freq;
  const XL = w * L;
  const XC = C > 0 ? 1 / (w * C) : 0;
  const Xres = XL - XC;                                // con capacitor de resonancia
  const Z_coil = Math.sqrt(R * R + XL * XL);            // bobina sola
  const Z_cap = Math.sqrt(R * R + Xres * Xres);         // bobina + capacitor
  const Xeff = params.usar_resonancia ? Xres : XL;      // reactancia que refleja T1
  const Rs = R + R_sec;
  const Zsec = Math.sqrt(Rs * Rs + Xeff * Xeff);
  const Re = R_pri + Rs / (a * a);
  const Im = Xeff / (a * a);
  const Z_amp_ve = Math.sqrt(Re * Re + Im * Im);        // lo que ve el ampli con T1
  const I_amp = safeDiv(Vmax, Z_amp_ve);
  const I_bobina = safeDiv(k * I_amp, a);
  const I_direct = safeDiv(Vmax, Z_coil);
  const I_res = safeDiv(Vmax, Z_cap);
  const P_bobina = I_bobina * I_bobina * R;
  const P_total = I_amp * I_amp * Re;
  const eta = P_total > 0 ? (P_bobina / P_total) * 100 : 0;

  return {
    f: Math.round(freq),
    Z_coil: +Z_coil.toFixed(2), Z_cap: +Z_cap.toFixed(2), Z_tx: +Z_amp_ve.toFixed(2),
    I_direct: +I_direct.toFixed(4), I_res: +I_res.toFixed(4),
    I_bobina: +I_bobina.toFixed(4), I_amp: +I_amp.toFixed(4),
    FMM_sin: +(N * I_direct).toFixed(1), FMM_res: +(N * I_res).toFixed(1), FMM_tx: +(N * I_bobina).toFixed(1),
    V_sec: +(I_bobina * Zsec).toFixed(3), eta: +eta.toFixed(1),
  };
}

// 1) Impedancia vs frecuencia (un solo eje, Ω):
//    - Bobina sola (sube con f) · Con capacitor (cae a R en f0, si resonancia)
//    - Con transformador (lo que ve el ampli a través de T1, si está activo)
export function generateImpedanceCurve(params) {
  const base = calculateCoil(params);
  return freqSweep(params.f).map((freq) => {
    const r = bandRow(base, params, freq);
    return { f: r.f, Z_coil: r.Z_coil, Z_cap: r.Z_cap, Z_tx: r.Z_tx };
  });
}

// 2) Corriente vs frecuencia (un solo eje, A pico):
//    - I_direct (sin resonancia) · I_res (resonancia serie, pico) ·
//      I_bobina e I_amp (con transformador). Distingue corriente EN la bobina
//      (la que hace FMM) de la corriente del amplificador.
export function generateCurrentCurve(params) {
  const base = calculateCoil(params);
  return freqSweep(params.f).map((freq) => {
    const r = bandRow(base, params, freq);
    return { f: r.f, I_direct: r.I_direct, I_res: r.I_res, I_bobina: r.I_bobina, I_amp: r.I_amp };
  });
}

// 3) Selección de calibre (un solo eje, % de llenado del carrete):
//    Para cada AWG al Rtarget actual: cuánto llena el carrete y si la corriente
//    es segura. El color codifica la viabilidad. La recomendación = el más
//    grueso que cabe.
export function generateAWGComparison(params) {
  return AWG_LIST.map((n) => {
    const c = calculateCoil({ ...params, awg: n });
    let status = 'ok';
    if (!c.fits) status = 'overflow';
    else if (!c.current_ok) status = 'hot';
    return {
      AWG: n,
      fill: +Math.min(c.fill_percent, 200).toFixed(0),  // se recorta a 200 para la escala
      fill_real: +c.fill_percent.toFixed(0),
      FMM: +c.FMM_op.toFixed(0),
      i_safe: +c.i_safe_rms.toFixed(2),
      status,
    };
  });
}

// 4) Fuerza (FMM) vs Frecuencia (un solo eje, A·vuelta):
//    FMM_sin (directo, baseline), FMM_res (resonancia directa) y FMM_tx (con T1).
//    En el punto óptimo, T1 a igualdad de potencia NO da más FMM que el directo
//    bien adaptado: solo redistribuye y estabiliza la carga.
export function generateForceCurve(params) {
  const base = calculateCoil(params);
  return freqSweep(params.f).map((freq) => {
    const r = bandRow(base, params, freq);
    return { f: r.f, FMM_sin: r.FMM_sin, FMM_res: r.FMM_res, FMM_tx: r.FMM_tx };
  });
}

// 5) Detalle del transformador en toda la banda (para el panel T1):
//    Z_amp_ve, corrientes, V_sec, FMM y η. Sirve para min/max de la carga vista.
export function generateTransformerCurve(params) {
  const base = calculateCoil(params);
  return freqSweep(params.f).map((freq) => {
    const r = bandRow(base, params, freq);
    return { f: r.f, Z_amp_ve: r.Z_tx, I_amp: r.I_amp, I_bobina: r.I_bobina, V_sec: r.V_sec, FMM_tx: r.FMM_tx, eta: r.eta };
  });
}
