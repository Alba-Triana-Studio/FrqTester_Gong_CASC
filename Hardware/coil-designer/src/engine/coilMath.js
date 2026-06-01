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

// ============================================================================
//  Cálculo principal
// ============================================================================
export function calculateCoil(p) {
  const {
    Vmax, Rtarget, f, mu_eff, Ac, lc,
    awg, hw, dw, perim, Zamp,
    usar_resonancia,
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

  // Operación activa según el toggle
  const I_op   = usar_resonancia ? I_res   : I_pico;
  const FMM_op = usar_resonancia ? FMM_res : FMM;
  const Z_op   = usar_resonancia ? R       : Z; // carga que ve el amplificador
  const I_op_rms = I_op / Math.SQRT2;

  // --- Verificación térmica del alambre ---
  const current_ok = I_op_rms <= i_safe_rms;
  const current_use_pct = i_safe_rms > 0 ? (I_op_rms / i_safe_rms) * 100 : Infinity;

  // --- 3.6 Potencia disipada (calor) ---
  const P = I_op * I_op * R;                          // pico
  const P_avg = P / 2;                               // promedio sinusoidal

  // --- Volumen de cobre y FMM teórica máxima a esta potencia (educativo) ---
  const V_cu = A_wire * l_total;                     // [m³]
  // FMM = √(P · V_cu / ρ) / l_vuelta  (independiente de N a V_cu y P fijos)
  const FMM_limit = safeDiv(Math.sqrt(safeDiv(P * V_cu, RHO_CU)), lv_si);

  // --- 3.7 Adaptación de impedancia ---
  //  En resonancia el amplificador ve R; sin resonancia ve Z. Esa es la carga.
  const Z_load = Z_op;
  const a_opt = Zamp > 0 ? Math.sqrt(safeDiv(Z_load, Zamp)) : 0;
  const Z_refl = a_opt > 0 ? safeDiv(Z_load, a_opt * a_opt) : Z_load;
  const match = evaluateMatch(Z_load, Zamp);

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
    L, L_mH: L * 1000, omega, XL, Z, phi_deg,
    I_pico, FMM,
    C_res, C_res_uF: C_res * 1e6, C_res_nF: C_res * 1e9,
    I_res, FMM_res, Q, mult,
    I_op, FMM_op, Z_op, I_op_rms, current_ok, current_use_pct, FMM_limit,
    P, P_avg,
    a_opt, Z_refl, Z_load, match,
    turns_per_layer, layers_max, num_layers, depth_used_mm, N_max,
    fill_percent, fits, overflow,
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
//  Datasets para las visualizaciones
// ============================================================================
const FREQS = [20, 30, 50, 75, 100, 150, 200, 300, 500, 750,
               1000, 1500, 2000, 3000, 5000];

// 1) Impedancia vs frecuencia (un solo eje, Ω):
//    - Z de la bobina sola (sube con f).
//    - Z que ve el amplificador con el capacitor de resonancia (cae a R en f0).
export function generateImpedanceCurve(params) {
  const base = calculateCoil(params);
  const L = base.L, R = base.R, C = base.C_res;
  return FREQS.map((freq) => {
    const w = 2 * Math.PI * freq;
    const XL = w * L;
    const XC = C > 0 ? 1 / (w * C) : 0;
    const Z_coil = Math.sqrt(R * R + XL * XL);
    const Z_amp = Math.sqrt(R * R + (XL - XC) * (XL - XC)); // con capacitor serie
    return {
      f: freq,
      f_label: freq >= 1000 ? `${freq / 1000}k` : `${freq}`,
      Z_coil: +Z_coil.toFixed(2),
      Z_amp: +Z_amp.toFixed(2),
    };
  });
}

// 2) Corriente vs frecuencia (un solo eje, A pico):
//    - sin resonancia (cae con f) y con resonancia serie (pico agudo en f0).
export function generateCurrentCurve(params) {
  const base = calculateCoil(params);
  const L = base.L, R = base.R, C = base.C_res, Vmax = params.Vmax;
  return FREQS.map((freq) => {
    const w = 2 * Math.PI * freq;
    const c = calculateCoil({ ...params, f: freq });
    const XL = w * L;
    const XC = C > 0 ? 1 / (w * C) : 0;
    const Zser = Math.sqrt(R * R + (XL - XC) * (XL - XC));
    const I_res = Zser > 0 ? Vmax / Zser : 0;
    return {
      f: freq,
      f_label: freq >= 1000 ? `${freq / 1000}k` : `${freq}`,
      I_sin: +c.I_pico.toFixed(4),
      I_res: +I_res.toFixed(4),
    };
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
//    El "empuje" real sobre el gong. Sin resonancia (bajo) vs con resonancia
//    (pico). Es la gráfica que importa: dónde y cuánta fuerza consigues.
export function generateForceCurve(params) {
  const base = calculateCoil(params);
  const N = base.N, L = base.L, R = base.R, C = base.C_res, Vmax = params.Vmax;
  return FREQS.map((freq) => {
    const w = 2 * Math.PI * freq;
    const c = calculateCoil({ ...params, f: freq });
    const XL = w * L;
    const XC = C > 0 ? 1 / (w * C) : 0;
    const Zser = Math.sqrt(R * R + (XL - XC) * (XL - XC));
    const I_res = Zser > 0 ? Vmax / Zser : 0;
    return {
      f: freq,
      f_label: freq >= 1000 ? `${freq / 1000}k` : `${freq}`,
      FMM_sin: +c.FMM.toFixed(1),
      FMM_res: +(N * I_res).toFixed(1),
    };
  });
}
