// ============================================================================
//  coilMath.js — Motor de cálculo del Coil Designer
//  Excitación acústica por inducción sobre gong de bronce (núcleo en 'E').
//
//  PRINCIPIO RECTOR (dos leyes encadenadas):
//  1) FMM: la limitan la POTENCIA disipable y el VOLUMEN DE COBRE, no el nº de
//     vueltas:  FMM = √(P · V_cobre / ρ) / l_vuelta.  (a cobre fijo R ∝ N²,
//     así que FMM ∝ √P y subir N no aporta; N solo fija la impedancia).
//  2) FUERZA sobre el bronce (no magnético → Ley de Lenz / Foucault):
//         F(t) ≈ [B_gap(t)² · Ac / 2μ₀] · K(f)          (presión de Maxwell)
//     con  B_gap = μ₀·μ_eff·FMM/lc · e^(−π·gap/w)   (decaimiento en el aire)
//     y    K(f) = S²/(1+S²),  S = ω·μ₀·t_eff·w/(2π·ρ_bronce)
//     (apantallamiento de lámina delgada: el bronce acopla mejor a mayor f).
//     Con seno puro a f la fuerza tiene media + oscilación a 2f:
//     ⚠ EL GONG SE EXCITA A 2·f_eléctrica.
//
//  Todo el cálculo interno se hace en SI (m, Ω, H, F, A, T, N) y se convierte
//  solo para mostrar. Los modelos de acoplamiento son de primer orden:
//  calíbralos con el LCR y con el banco de pruebas.
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

// Convección natural para la estimación de ΔT de la bobina [W/(m²·K)]
export const H_CONV = 15;

// ----- Parámetros del acoplamiento al gong (valores por defecto editables) -----
//  gap    : entrehierro bobina→bronce [mm]
//  w_polo : paso polar del núcleo E (centro → pierna lateral) [mm]
//  rho_t  : resistividad del bronce [nΩ·m]  (campana Cu-Sn20 ≈ 190–260)
//  t_gong : espesor del bronce frente al polo [mm]
//  B_sat  : saturación del núcleo [T] (ferrita ≈ 0.35, acero laminado ≈ 1.5)
export const GONG_DEFAULTS = {
  gap: 3, w_polo: 30, rho_t: 220, t_gong: 3, B_sat: 0.35,
  R_lcr_0: 0, R_lcr_g: 0,
};

const gongParams = (p) => ({
  gap_si: Math.max(p.gap ?? GONG_DEFAULTS.gap, 0) / 1e3,
  w_si: Math.max(p.w_polo ?? GONG_DEFAULTS.w_polo, 1) / 1e3,
  rho_t_si: Math.max(p.rho_t ?? GONG_DEFAULTS.rho_t, 1) * 1e-9,
  t_si: Math.max(p.t_gong ?? GONG_DEFAULTS.t_gong, 0.1) / 1e3,
  B_sat: Math.max(p.B_sat ?? GONG_DEFAULTS.B_sat, 0.01),
});

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

// Calibre recomendado para una corriente dada: el MÁS FINO cuya corriente
// segura (J_SAFE) soporta I_rms. Si ni el AWG 18 alcanza, se indica la
// sección necesaria (usar hilos en paralelo o pletina).
export function awgForCurrent(I_rms) {
  for (let n = 32; n >= 18; n--) {
    const i_safe = awgSafeCurrentRms(n);
    if (i_safe >= I_rms) return { awg: n, ok: true, i_safe, mm2: awgCopperArea(n) * 1e6 };
  }
  return { awg: 18, ok: false, i_safe: awgSafeCurrentRms(18), mm2: I_rms / J_SAFE };
}

// ----- Límites de SEGURIDAD y FABRICABILIDAD del sistema -----
// Una solución solo se considera viable (optimizador) o sana (consejos) si
// respeta estos límites: transformadores construibles, tensiones manejables
// y temperaturas estables.
export const SAFETY_LIMITS = {
  A_MAX: 12,        // relación de vueltas máxima práctica para un T1 de audio
  V_SEC_MAX: 250,   // V pico máx en el secundario de T1 (aislamiento/seguridad)
  V_C_MAX: 630,     // V pico máx en el capacitor (rating film/MKP estándar)
  ETA_MIN: 50,      // % mínimo de la potencia que debe llegar a la bobina con T1
  DT_MAX: 60,       // °C de calentamiento máximo aceptable de la bobina
};

const safeDiv = (a, b) => (b && isFinite(b) ? a / b : 0);
const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);

// Formato legible de fuerzas (N → mN → µN)
export const fmtForce = (F) => {
  if (!isFinite(F)) return '—';
  const a = Math.abs(F);
  if (a >= 1) return `${F.toFixed(2)} N`;
  if (a >= 1e-3) return `${(F * 1000).toFixed(a >= 0.1 ? 0 : 1)} mN`;
  if (a >= 1e-6) return `${(F * 1e6).toFixed(0)} µN`;
  return a === 0 ? '0' : `${F.toExponential(1)} N`;
};

// ============================================================================
//  Efecto piel y proximidad
// ============================================================================

// Profundidad de piel δ = √(2ρ/(ω·μ₀)) [mm]
export function skinDepthMm(rho, fHz) {
  const w = 2 * Math.PI * Math.max(fHz, 0.001);
  return Math.sqrt((2 * rho) / (w * MU_0)) * 1000;
}

// Factor de proximidad de Dowell: R_ac = F_R · R_dc para un bobinado de m capas.
// Δ = (π/4)^¾ · (d/δ) · √(d/d_ext). Para Δ pequeño F_R→1; con alambre grueso y
// muchas capas a f alta puede valer 2–3× (¡castiga los calibres gruesos!).
export function dowellFactor(d_cu_mm, d_ext_mm, fHz, layers) {
  const delta = skinDepthMm(RHO_CU, fHz);
  if (!(delta > 0) || !(d_cu_mm > 0)) return 1;
  const eta = d_ext_mm > 0 ? d_cu_mm / d_ext_mm : 1;   // porosidad de capa
  const D = Math.pow(Math.PI / 4, 0.75) * (d_cu_mm / delta) * Math.sqrt(eta);
  if (D < 0.05) return 1;
  const m = Math.max(layers || 1, 1);
  const term1 = D * (Math.sinh(2 * D) + Math.sin(2 * D)) / (Math.cosh(2 * D) - Math.cos(2 * D));
  const term2 = D * (2 * (m * m - 1) / 3) * (Math.sinh(D) - Math.sin(D)) / (Math.cosh(D) + Math.cos(D));
  return Math.max(term1 + term2, 1);
}

// ============================================================================
//  Acoplamiento por corrientes de Foucault en el bronce (lámina delgada)
//  δ_t: piel en el bronce. t_eff = min(espesor, δ_t).
//  S = ω·μ₀·σ·t_eff·w/(2π): parámetro de apantallamiento con k = π/w.
//  K = S²/(1+S²): fracción del empuje ideal (K→1 cuando el bronce "refleja").
// ============================================================================
export function eddyCoupling(fHz, g) {
  const omega = 2 * Math.PI * Math.max(fHz, 0.001);
  const delta_si = Math.sqrt((2 * g.rho_t_si) / (omega * MU_0));
  const t_eff = Math.min(g.t_si, delta_si);
  const S = (omega * MU_0 * t_eff * g.w_si) / (2 * Math.PI * g.rho_t_si);
  const K = (S * S) / (1 + S * S);
  return { delta_t_mm: delta_si * 1000, t_eff_mm: t_eff * 1000, S, K };
}

// --- Capacitores comerciales serie E12 ---
const E12_BASES = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
export const COMMERCIAL_CAPACITORS = (() => {
  const vals = [];
  // Generar desde 0.001 uF hasta 10000 uF
  for (let e = -3; e <= 4; e++) {
    const mult = Math.pow(10, e);
    for (const base of E12_BASES) {
      vals.push(parseFloat((base * mult).toFixed(6)));
    }
  }
  return vals.sort((a, b) => a - b);
})();

export function snapToCommercial(val) {
  let closest = COMMERCIAL_CAPACITORS[0];
  let minDiff = Math.abs(val - closest);
  for (let i = 1; i < COMMERCIAL_CAPACITORS.length; i++) {
    const diff = Math.abs(val - COMMERCIAL_CAPACITORS[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = COMMERCIAL_CAPACITORS[i];
    }
  }
  return closest;
}

// Mapeo logarítmico para el slider de capacitancia manual (0.001 uF a 10000 uF)
const LOG_C_MIN = -3;
const LOG_C_MAX = 4;

export function cToSliderVal(cVal) {
  const c = Math.max(cVal || 0.001, 0.001);
  const logVal = Math.log10(c);
  const pct = (logVal - LOG_C_MIN) / (LOG_C_MAX - LOG_C_MIN);
  return Math.round(pct * 1000);
}

export function sliderValToC(sVal) {
  const pct = clamp(sVal, 0, 1000) / 1000;
  const logVal = LOG_C_MIN + pct * (LOG_C_MAX - LOG_C_MIN);
  return parseFloat(Math.pow(10, logVal).toFixed(3));
}

// ============================================================================
//  Transformador de adaptación T1
//  Convención:  a = V_secundario / V_primario  (a>1 = elevador).
//  Impedancia reflejada al primario = Z_secundario / a².
//  Modelo de pérdidas: R_pri (primario), R_sec (secundario) y un coeficiente de
//  acoplamiento k (0–1) que reduce la corriente útil del secundario; la parte no
//  transferida se contabiliza como pérdida de T1 -> el balance energético cierra
//  SIEMPRE:  P_amp = P_bobina + P_perdida_T1.
//  coil: { R, N, X }  con R = R_ac de la bobina y X = reactancia neta a esa
//  frecuencia (X_L, o X_L − 1/ωC si la resonancia está activa).
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
    modo_capacitor, C_manual_uF,
  } = p;
  const g = gongParams(p);

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

  // --- 3.8 Factor de llenado por capas (temprano: las capas afectan R_ac) ---
  const turns_per_layer = d_ext_mm > 0 ? Math.floor(hw / d_ext_mm) : 0;
  const layers_max      = d_ext_mm > 0 ? Math.floor(dw / d_ext_mm) : 0;
  const num_layers      = turns_per_layer > 0 ? Math.ceil(N / turns_per_layer) : 0;
  const depth_used_mm   = num_layers * d_ext_mm;
  const N_max           = turns_per_layer * layers_max;
  const fill_percent    = dw > 0 ? safeDiv(depth_used_mm, dw) * 100 : Infinity;
  const fits            = N <= N_max && fill_percent <= 100;
  const overflow        = !fits;

  // --- 3.2b Resistencia AC: efecto piel + proximidad (Dowell) ---
  const delta_cu_mm = skinDepthMm(RHO_CU, fHz);
  const F_R = dowellFactor(d_cu_mm, d_ext_mm, fHz, num_layers);
  const R_ac = R * F_R;

  // --- 3.3 Inductancia ---
  const L = safeDiv(MU_0 * mu_eff * N * N * Ac_si, lc_si);

  // --- 3.4 Impedancia compleja en AC (con R_ac) ---
  const omega = 2 * Math.PI * fHz;
  const XL = omega * L;
  const Z = Math.sqrt(R_ac * R_ac + XL * XL);
  const phi_deg = Math.atan2(XL, R_ac) * (180 / Math.PI);

  // --- 3.5 Corriente de pico y FMM (SIN resonancia) ---
  const I_pico = safeDiv(Vmax, Z);
  const FMM = N * I_pico;

  // --- 3.5b Resonancia serie ---
  const C_res_opt = L > 0 ? safeDiv(1, omega * omega * L) : 0;
  const C_used = (modo_capacitor === 'manual')
    ? (C_manual_uF ? C_manual_uF * 1e-6 : 0)
    : C_res_opt;
  const C_res = C_used;
  const X_res_op = XL - (C_used > 0 ? 1 / (omega * C_used) : 0);
  const Z_res_op = Math.sqrt(R_ac * R_ac + X_res_op * X_res_op);
  const I_res = safeDiv(Vmax, Z_res_op);
  const FMM_res = N * I_res;
  const Q = safeDiv(XL, R_ac);
  const mult = safeDiv(Z, Z_res_op);

  // Reactancia NETA de la bobina en f_op: el capacitor cancela X_L si la
  // resonancia está activa (queda ≈ 0), si no, X = X_L.
  const X_op = usar_resonancia ? X_res_op : XL;
  const Zcoil_op = Math.sqrt(R_ac * R_ac + X_op * X_op); // = Z_res_op con resonancia, = Z sin ella

  // --- 3.7 Transformador de adaptación T1 ---
  // Relación: auto = √(|Z_bobina(f_op)|/Zamp). Si hay resonancia, Z_bobina≈R_ac
  // en f_op, así que a sale mucho menor (importante recalcular según los toggles).
  // La relación auto se RECORTA a A_MAX: adaptar una carga muy reactiva pediría
  // relaciones absurdas (a>50, kV en el secundario) imposibles de construir.
  const a_auto_raw = Zamp > 0 ? Math.sqrt(safeDiv(Zcoil_op, Zamp)) : 0;
  const a_auto = Math.min(a_auto_raw, SAFETY_LIMITS.A_MAX);
  const a_used = usar_transformador
    ? (modo_relacion === 'manual' ? Math.max(a_manual || 1e-6, 1e-6) : a_auto)
    : a_auto;
  const tx = transformerAt(p, { R: R_ac, N, X: X_op }, a_used);
  tx.a_auto = a_auto;
  tx.a_auto_raw = a_auto_raw;
  tx.a_capped = a_auto_raw > SAFETY_LIMITS.A_MAX;
  tx.mode = modo_relacion === 'manual' ? 'manual' : 'auto';
  // Relación de vueltas aproximada primario:secundario (a = N_sec/N_pri).
  tx.turns_ratio = a_used >= 1 ? `1 : ${a_used.toFixed(2)}` : `${(1 / a_used).toFixed(2)} : 1`;
  // Saturación de T1 (cualitativa): B ∝ V_sec/(f). Aviso si V_sec alto y f baja.
  tx.flux_index = safeDiv(tx.V_sec, fHz);          // proxy V·s (∝ B·N·A)
  tx.sat_risk = usar_transformador && fHz < 200 && tx.V_sec > Vmax * 1.3;
  // Especificación de FABRICACIÓN de T1: calibres por corriente (J_SAFE),
  // potencia nominal con margen y tensión de aislamiento entre devanados.
  tx.I_amp_rms = tx.I_amp / Math.SQRT2;
  tx.I_bobina_rms = tx.I_bobina / Math.SQRT2;
  tx.awg_pri = awgForCurrent(tx.I_amp_rms);
  tx.awg_sec = awgForCurrent(tx.I_bobina_rms);
  tx.P_nom = Math.ceil(Math.max(tx.P_total, 5));
  tx.V_iso = Math.max(Math.ceil(tx.V_sec * 2 / 50) * 50, 100);

  // --- Operación activa según la TOPOLOGÍA (toggles) ---
  const I_direct = usar_resonancia ? I_res : I_pico;     // drive directo a la bobina
  const I_op   = usar_transformador ? tx.I_bobina : I_direct;  // corriente EN la bobina
  const FMM_op = N * I_op;                                // FMM real (la da I_bobina)
  const Z_op   = usar_resonancia ? R_ac : Z;             // carga de la bobina (sin T1)
  const Z_seen = usar_transformador ? tx.Zve : Z_op;     // lo que ve el amplificador
  const I_op_rms = I_op / Math.SQRT2;

  // --- Verificación térmica del alambre (usa la corriente REAL de la bobina) ---
  const current_ok = I_op_rms <= i_safe_rms;
  const current_use_pct = i_safe_rms > 0 ? (I_op_rms / i_safe_rms) * 100 : Infinity;

  // --- 3.6 Potencia disipada en la bobina (calor que genera la FMM) ---
  const P = I_op * I_op * R_ac;                       // pico
  const P_avg = P / 2;                                // promedio sinusoidal

  // --- Volumen de cobre y FMM teórica máxima a esta potencia (educativo) ---
  const V_cu = A_wire * l_total;
  const FMM_limit = safeDiv(Math.sqrt(safeDiv(P * V_cu, RHO_CU * F_R)), lv_si);

  // --- Tensiones de resonancia: el capacitor ve Q·V (¡cientos de voltios!) ---
  const X_C_op = C_used > 0 ? 1 / (omega * C_used) : 0;
  const V_C_pk = usar_resonancia ? I_op * X_C_op : 0;
  const V_L_pk = I_op * XL;

  // --- Estimación térmica de la bobina (convección natural, aire quieto) ---
  const A_surf = ((perim + Math.PI * dw) * hw) * 1e-6;   // superficie lateral [m²]
  const deltaT_est = A_surf > 0 ? P_avg / (H_CONV * A_surf) : Infinity;

  // --- ACOPLAMIENTO AL GONG: campo, saturación, Foucault y fuerza ---
  const ed = eddyCoupling(fHz, g);
  const B_core_pk = safeDiv(MU_0 * mu_eff * FMM_op, lc_si);   // B en el núcleo [T pico]
  const sat_pct = (B_core_pk / g.B_sat) * 100;
  const sat_ok = sat_pct <= 100;
  const decay_gap = Math.exp(-Math.PI * g.gap_si / g.w_si);   // decaimiento del campo
  const B_gap_pk = B_core_pk * decay_gap;                     // B en la cara del bronce
  const F0 = (B_gap_pk * B_gap_pk * Ac_si) / (4 * MU_0);      // presión de Maxwell media ideal
  const F_avg = F0 * ed.K;              // empuje medio [N]
  const F_ac = F0 * ed.K;               // amplitud de la oscilación a 2f [N]
  const F_pk = 2 * F0 * ed.K;           // fuerza pico [N]
  const F_avg_gf = F_avg * 1000 / 9.80665;   // en gramos-fuerza (intuición)
  const f_mech = 2 * fHz;               // ⚠ frecuencia MECÁNICA de excitación

  // --- Medición opcional con LCR: ΔR = potencia que absorbe el gong ---
  const R_lcr_0 = Math.max(p.R_lcr_0 || 0, 0);
  const R_lcr_g = Math.max(p.R_lcr_g || 0, 0);
  const lcr_active = R_lcr_0 > 0 && R_lcr_g > 0;
  const R_ref = lcr_active ? Math.max(R_lcr_g - R_lcr_0, 0) : 0;
  const P_gong = lcr_active ? I_op_rms * I_op_rms * R_ref : 0;
  const eta_gong = lcr_active && R_lcr_g > 0 ? (R_ref / R_lcr_g) * 100 : 0;

  // --- EVALUACIÓN DE SEGURIDAD Y ESTABILIDAD del sistema completo ---
  const sl = SAFETY_LIMITS;
  const safety_issues = [];
  if (!sat_ok) safety_issues.push({ level: 'bad', msg: `Núcleo saturado: B = ${(B_core_pk * 1000).toFixed(0)} mT > B_sat = ${(g.B_sat * 1000).toFixed(0)} mT` });
  if (!current_ok) safety_issues.push({ level: 'bad', msg: `Sobrecorriente en el alambre: ${I_op_rms.toFixed(2)} A rms > ${i_safe_rms.toFixed(2)} A (AWG ${awg})` });
  if (usar_resonancia && V_C_pk > sl.V_C_MAX) safety_issues.push({ level: 'bad', msg: `V_C = ${V_C_pk.toFixed(0)} V pico > ${sl.V_C_MAX} V (límite de film/MKP estándar)` });
  else if (usar_resonancia && V_C_pk > 300) safety_issues.push({ level: 'warn', msg: `V_C = ${V_C_pk.toFixed(0)} V pico: usa film ≥ ${(V_C_pk * 1.5).toFixed(0)} V y terminales aislados` });
  if (usar_transformador) {
    if (tx.a_capped || a_used > sl.A_MAX) safety_issues.push({ level: 'bad', msg: `T1 impracticable: la adaptación pediría a ≈ ${tx.a_auto_raw.toFixed(1)} (límite práctico ${sl.A_MAX})` });
    if (tx.V_sec > sl.V_SEC_MAX) safety_issues.push({ level: 'bad', msg: `V_sec = ${tx.V_sec.toFixed(0)} V pico > ${sl.V_SEC_MAX} V: tensión peligrosa en el secundario` });
    if (tx.eta < sl.ETA_MIN) safety_issues.push({ level: 'warn', msg: `Solo el ${tx.eta.toFixed(0)}% de la potencia llega a la bobina (mínimo sano ${sl.ETA_MIN}%)` });
  }
  if (isFinite(deltaT_est) && deltaT_est > sl.DT_MAX) safety_issues.push({ level: deltaT_est > 80 ? 'bad' : 'warn', msg: `ΔT ≈ ${deltaT_est.toFixed(0)} °C en aire quieto (máx. estable ${sl.DT_MAX} °C)` });
  const safety_ok = !safety_issues.some((i) => i.level === 'bad');

  // --- Adaptación: la carga que ve el ampli (con o sin T1) frente a Zamp ---
  const Z_load = Z_op;
  const a_opt = a_auto;
  const Z_refl = tx.Z_refl_mag;
  const match = evaluateMatch(Z_seen, Zamp);

  // --- Motor de consejos (saturación/térmica/V_C primero, luego topología) ---
  const advice = buildAdvice(p, {
    R: R_ac, Z, Zcoil_op, Zamp, Q, tx, a_auto, fHz, FMM_op,
    sat_ok, sat_pct, B_core_pk, B_sat: g.B_sat, V_C_pk, deltaT_est, F_ac, f_mech,
  });

  return {
    d_cu_mm, d_ext_mm, A_wire, A_wire_mm2, ohm_m, i_safe_rms, i_safe_pk,
    N_exact, N, l_total, R_real, R, V_cu,
    delta_cu_mm, F_R, R_ac,
    L, L_mH: L * 1000, omega, XL, X_op, Zcoil_op, Z, phi_deg,
    I_pico, FMM,
    C_res, C_res_uF: C_res * 1e6, C_res_nF: C_res * 1e9, C_res_opt_uF: C_res_opt * 1e6,
    I_res, FMM_res, Q, mult,
    I_direct, I_op, FMM_op, Z_op, Z_seen, I_op_rms, current_ok, current_use_pct, FMM_limit,
    P, P_avg,
    X_C_op, V_C_pk, V_L_pk,
    A_surf_cm2: A_surf * 1e4, deltaT_est,
    B_core_pk, sat_pct, sat_ok, decay_gap, B_gap_pk,
    delta_t_mm: ed.delta_t_mm, t_eff_mm: ed.t_eff_mm, S_shield: ed.S, K_eddy: ed.K,
    F0, F_avg, F_ac, F_pk, F_avg_gf, f_mech,
    lcr_active, R_ref, P_gong, eta_gong,
    safety_issues, safety_ok,
    a_opt, Z_refl, Z_load, match, tx, advice,
    turns_per_layer, layers_max, num_layers, depth_used_mm, N_max,
    fill_percent, fits, overflow,
  };
}

// Motor de consejos: primero los límites físicos duros (saturación, térmica,
// tensión del capacitor), después la topología {transformador, resonancia}.
function buildAdvice(p, c) {
  const T = p.usar_transformador, Rz = p.usar_resonancia;
  const {
    R, Z, Zcoil_op, Zamp, Q, tx, a_auto, fHz, FMM_op,
    sat_ok, sat_pct, B_core_pk, B_sat, V_C_pk, deltaT_est,
  } = c;
  const f0 = Math.round(fHz);
  const N = (label, value) => ({ label, value });

  if (!sat_ok) {
    return {
      status: 'bad', title: 'Núcleo SATURADO — el modelo deja de valer',
      detail: `B_núcleo = ${(B_core_pk * 1000).toFixed(0)} mT supera B_sat = ${(B_sat * 1000).toFixed(0)} mT (${sat_pct.toFixed(0)}%). Saturado: μ_eff colapsa, L cae, la resonancia se desafina y aparecen los armónicos duros que ya viste en el laboratorio. Opciones: baja la corriente/FMM, usa material con B_sat mayor (acero laminado ≈ 1.5 T), o gana fuerza con más área Ac en vez de más B.`,
      numbers: [N('B núcleo', `${(B_core_pk * 1000).toFixed(0)} mT`), N('B_sat', `${(B_sat * 1000).toFixed(0)} mT`), N('uso', `${sat_pct.toFixed(0)}%`)],
    };
  }

  if (T && (tx.a_capped || tx.a > SAFETY_LIMITS.A_MAX || tx.V_sec > SAFETY_LIMITS.V_SEC_MAX)) {
    const aSugRes = Zamp > 0 ? Math.sqrt(Math.max(R, 1e-9) / Zamp) : 0;
    return {
      status: 'bad', title: 'T1 impracticable o peligroso — NO fabricar así',
      detail: `Adaptar |Z_bobina| = ${Zcoil_op.toFixed(0)} Ω a ${f0} Hz pediría a ≈ ${tx.a_auto_raw.toFixed(1)}${tx.a_capped ? ` (recortada a ${SAFETY_LIMITS.A_MAX})` : ''} y V_sec ≈ ${tx.V_sec.toFixed(0)} V: un transformador así no es construible con seguridad (límites: a ≤ ${SAFETY_LIMITS.A_MAX}, V_sec ≤ ${SAFETY_LIMITS.V_SEC_MAX} V). La causa es adaptar una carga casi puramente REACTIVA: activa la resonancia serie (el ampli pasa a ver R_ac = ${R.toFixed(1)} Ω) y la relación sana baja a a ≈ ${aSugRes.toFixed(2)}.`,
      numbers: [N('a pedida', tx.a_auto_raw.toFixed(1)), N('V_sec', `${tx.V_sec.toFixed(0)} V`), N('η', `${tx.eta.toFixed(0)} %`), N('a con resonancia', aSugRes.toFixed(2))],
    };
  }

  if (isFinite(deltaT_est) && deltaT_est > 80) {
    return {
      status: 'bad', title: 'Sobrecalentamiento probable de la bobina',
      detail: `ΔT estimada ≈ ${deltaT_est.toFixed(0)} °C en aire quieto (además del chequeo por densidad de corriente). Baja la potencia, usa alambre más grueso / carrete mayor, o añade ventilación y disipación al núcleo.`,
      numbers: [N('ΔT est.', `${deltaT_est.toFixed(0)} °C`)],
    };
  }

  if (Rz && V_C_pk > 600) {
    return {
      status: 'warn', title: 'Resonancia · tensión MUY alta en el capacitor',
      detail: `El capacitor ve V_C ≈ ${V_C_pk.toFixed(0)} V pico (≈ Q·V). Necesitas film/MKP no polarizado con rating ≥ ${(V_C_pk * 1.5).toFixed(0)} V y cuidado con el aislamiento: esto ya es tensión peligrosa al tacto.`,
      numbers: [N('V_C', `${V_C_pk.toFixed(0)} V pico`), N('Q', Q.toFixed(0))],
    };
  }

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
    const m = Zamp > 0 ? Zcoil_op / Zamp : 0;
    if (m >= 0.5 && m <= 2) {
      return {
        status: 'ok', title: 'Resonancia · bien adaptado (banda estrecha)',
        detail: `En ${f0} Hz la bobina tiene Z_res = ${Zcoil_op.toFixed(1)} Ω ≈ Zamp. Ganancia de corriente Q = ${Q.toFixed(0)}. Fuera de esa frecuencia se desadapta. El capacitor ve ${V_C_pk.toFixed(0)} V pico: usa film ≥ ${(V_C_pk * 1.5).toFixed(0)} V.`,
        numbers: [N('Z_res', `${Zcoil_op.toFixed(1)} Ω`), N('Q', Q.toFixed(0)), N('V_C', `${V_C_pk.toFixed(0)} V`)],
      };
    }
    const aSug = Zamp > 0 ? Math.sqrt(Zcoil_op / Zamp) : 0;
    return {
      status: 'warn', title: 'Resonancia · módulo sin adaptar',
      detail: `X_L cancelada parcialmente, Z_res = ${Zcoil_op.toFixed(1)} Ω ≠ Zamp = ${Zamp} Ω. Combínala con un transformador de relación a ≈ √(Z_res/Zamp) = ${aSug.toFixed(2)}.`,
      numbers: [N('Z_res', `${Zcoil_op.toFixed(1)} Ω`), N('a sugerida', aSug.toFixed(2)), N('Q', Q.toFixed(0))],
    };
  }

  if (T && !Rz) {
    const reactive = R > 0 && Z / R > 2;
    if (reactive) {
      return {
        status: 'warn', title: 'Transformador sin resonancia · carga reactiva',
        detail: `A ${f0} Hz la bobina es casi pura reactancia (Z = ${Z.toFixed(0)} Ω vs R_ac = ${R.toFixed(1)} Ω). El transformador iguala el módulo, pero solo el ${tx.eta.toFixed(0)}% de la potencia llega a la bobina: el resto vuelve como reactiva o se pierde en R_pri. Activa la resonancia para cancelar X_L.`,
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
//  A Rtarget fijo, la corriente es ~igual para todo calibre (R manda), pero el
//  calibre cambia el cobre total (FMM) y el efecto proximidad (R_ac a f).
//  Recomendación = el calibre viable (cabe, no se quema, no satura) con MAYOR
//  FMM real en la topología activa.
// ============================================================================
export function recommendAWG(params) {
  const rows = AWG_LIST.map((n) => {
    const c = calculateCoil({ ...params, awg: n });
    return { awg: n, fits: c.fits, current_ok: c.current_ok, sat_ok: c.sat_ok, FMM: c.FMM_op, fill: c.fill_percent };
  });
  const viable = rows.filter((r) => r.fits && r.current_ok && r.sat_ok);
  if (viable.length) {
    // máxima FMM real (con proximidad incluida); a igualdad, el más grueso
    const best = viable.reduce((a, b) => (b.FMM > a.FMM || (b.FMM === a.FMM && b.awg < a.awg) ? b : a));
    return { awg: best.awg, ok: true, reason: 'Calibre viable (cabe, no se quema, no satura) con máxima FMM real.' };
  }
  // Sin opción ideal: prioriza que quepa, luego que aguante corriente.
  const fitting = rows.filter((r) => r.fits);
  if (fitting.length) {
    const best = fitting.reduce((a, b) => (b.awg < a.awg ? b : a));
    return { awg: best.awg, ok: false, reason: 'Ninguno cumple todo; este cabe pero revisa corriente/saturación.' };
  }
  const thinnest = rows.reduce((a, b) => (b.awg > a.awg ? b : a));
  return { awg: thinnest.awg, ok: false, reason: 'Ni el más fino cabe: agranda el carrete o baja Rtarget.' };
}

// ============================================================================
//  OPTIMIZADOR — máxima FUERZA sobre el gong, usando un amplificador
//
//  Objetivo físico real (no la FMM a secas):
//      F ≈ (B_gap² · Ac / 4μ₀) · K(f)
//      B_gap = μ₀·μ_eff·FMM/lc · e^(−π·gap/w)   y   FMM = √(P·V_cu/ρ)/l_vuelta
//  Por eso importan (y se exploran): potencia entregada, cobre, calibre,
//  núcleo (μ_eff, Ac, lc, w), entrehierro y topología.
//  Restricciones DURAS (una opción solo es válida si):
//   - cabe (fill ≤ 100%) · no sobrecalienta (I ≤ I_segura) ·
//   - no sobrecarga el ampli (Z_vista ≥ Zamp·0.9) · no satura (B ≤ B_sat).
//  Búsqueda: descenso por coordenadas desde 4 semillas (las combinaciones de
//  resonancia/transformador), acumulando TODO lo evaluado y devolviendo las
//  10 mejores opciones viables distintas.
// ============================================================================
export const OPTIM_CRITERIA = {
  objetivo: 'Máxima fuerza de repulsión (Lenz / Foucault) sobre el gong, con un sistema ESTABLE, SEGURO y FABRICABLE.',
  ley: 'F ≈ (B_gap²·Ac/4μ₀)·K(f), con B_gap ∝ μ_eff·FMM/lc·e^(−π·gap/w) y FMM = √(P·V_cu/ρ)/l_vuelta. El gong vibra a 2·f.',
  restricciones: [
    'Cabe en el carrete (llenado ≤ 100%).',
    'El alambre no se sobrecalienta (corriente ≤ máx segura y ΔT ≤ 60 °C).',
    'El amplificador no se sobrecarga (impedancia vista ≥ su valor nominal).',
    'El núcleo no se satura (B_núcleo ≤ B_sat).',
    `T1 construible y seguro (a ≤ ${SAFETY_LIMITS.A_MAX}, V_sec ≤ ${SAFETY_LIMITS.V_SEC_MAX} V, η ≥ ${SAFETY_LIMITS.ETA_MIN}%).`,
    `Capacitor dentro de rating práctico (V_C ≤ ${SAFETY_LIMITS.V_C_MAX} V pico).`,
  ],
};

const OPTIM_LABELS = {
  Vmax: 'Vmax', Rtarget: 'Rtarget', f: 'f', mu_eff: 'μ_eff', Ac: 'Ac', lc: 'lc',
  awg: 'AWG', hw: 'hw', dw: 'dw', perim: 'perím', Zamp: 'Zamp',
  gap: 'gap', w_polo: 'w_polo',
  usar_resonancia: 'resonancia', usar_transformador: 'transformador',
};

// Variables que explora el optimizador (las gong/material —ρ_t, t, B_sat— son
// datos del problema, no variables de diseño).
const OPTIM_VARS = ['awg', 'Rtarget', 'usar_resonancia', 'usar_transformador',
  'gap', 'Ac', 'mu_eff', 'lc', 'w_polo', 'hw', 'dw', 'perim', 'Vmax', 'Zamp', 'f'];

const uniqNum = (arr) => [...new Set(arr.filter((x) => x != null && isFinite(x)))];
const candidatesFor = (k, v) => {
  switch (k) {
    case 'Vmax': return uniqNum([v, 4.24, 8, 12, 24]);
    case 'Rtarget': return uniqNum([v, 4, 6, 8, 12, 16, 24, 32]);
    case 'f': return uniqNum([v, 150, 250, 500, 1000, 2000]);
    case 'mu_eff': return uniqNum([v, 5, 10, 20, 40]);
    case 'Ac': return uniqNum([v, 500, 1000, 2000, 4000]);
    case 'lc': return uniqNum([v, 50, 100, 200]);
    case 'awg': return AWG_LIST;
    case 'hw': return uniqNum([v, 20, 30, 40, 60, 80]);
    case 'dw': return uniqNum([v, 10, 15, 20, 30]);
    case 'perim': return uniqNum([v, 50, 80, 100, 150]);
    case 'Zamp': return uniqNum([v, 4, 8]);
    case 'gap': return uniqNum([v, 2, 3, 5, 8]);
    case 'w_polo': return uniqNum([v, 20, 30, 45, 60]);
    case 'usar_resonancia': return [true, false];
    case 'usar_transformador': return [true, false];
    default: return [v];
  }
};

const optChanged = (a, b) => (typeof a === 'boolean' ? a !== b : Math.abs(a - b) > 1e-6);
const optFmt = (x) => (typeof x === 'boolean' ? (x ? 'ON' : 'OFF') : (Number.isInteger(x) ? `${x}` : x.toFixed(x < 10 ? 2 : 0)));

export function optimizeForce(params, locks = {}) {
  const resOpts = locks.usar_resonancia ? [!!params.usar_resonancia] : [true, false];
  const txOpts = locks.usar_transformador ? [!!params.usar_transformador] : [true, false];

  const pool = new Map();   // firma de cfg -> evaluación (dedupe de trabajo)
  const evalCfg = (cfg) => {
    const key = OPTIM_VARS.map((k) => cfg[k]).join('|');
    const hit = pool.get(key);
    if (hit) return hit;
    const r = calculateCoil(cfg);
    const sl = SAFETY_LIMITS;
    const txSafe = !cfg.usar_transformador ||
      (!r.tx.a_capped && r.tx.a <= sl.A_MAX && r.tx.V_sec <= sl.V_SEC_MAX && r.tx.eta >= sl.ETA_MIN);
    const violations =
      (r.fits ? 0 : 1) + (r.current_ok ? 0 : 1) + (r.sat_ok ? 0 : 1) +
      (r.Z_seen >= cfg.Zamp * 0.9 ? 0 : 1) +
      (txSafe ? 0 : 1) +
      (!cfg.usar_resonancia || r.V_C_pk <= sl.V_C_MAX ? 0 : 1) +
      (isFinite(r.deltaT_est) && r.deltaT_est <= sl.DT_MAX ? 0 : 1);
    const feasible = violations === 0 && isFinite(r.F_ac) && r.F_ac > 0;
    const o = { cfg, r, feasible, violations, force: r.F_ac };
    pool.set(key, o);
    return o;
  };
  // ¿a es mejor que b? Viable primero; entre inviables, el que menos viola
  // (permite salir de un punto de partida inviable); luego mayor fuerza.
  const better = (a, b) => {
    if (a.feasible !== b.feasible) return a.feasible;
    if (!a.feasible && a.violations !== b.violations) return a.violations < b.violations;
    return a.force > b.force;
  };

  for (const rz of resOpts) {
    for (const t of txOpts) {
      let cur = evalCfg({
        ...params,
        usar_resonancia: rz, usar_transformador: t,
        modo_relacion: 'auto', modo_capacitor: 'auto',
      });
      for (let pass = 0; pass < 3; pass++) {
        let moved = false;
        for (const k of OPTIM_VARS) {
          if (k === 'usar_resonancia' || k === 'usar_transformador') continue;
          if (locks[k]) continue;
          for (const v of candidatesFor(k, cur.cfg[k])) {
            if (!optChanged(v, cur.cfg[k])) continue;
            const cand = evalCfg({ ...cur.cfg, [k]: v });
            if (better(cand, cur)) { cur = cand; moved = true; }
          }
        }
        if (!moved) break;
      }
    }
  }

  // Ranking global de TODO lo evaluado viable + dedupe de opciones gemelas.
  const feasible = [...pool.values()].filter((o) => o.feasible);
  feasible.sort((a, b) =>
    (b.force - a.force) || (a.r.current_use_pct - b.r.current_use_pct) || (a.r.fill_percent - b.r.fill_percent));
  const seen = new Set();
  const top = [];
  for (const o of feasible) {
    const c = o.cfg;
    const sig = [c.awg, c.usar_resonancia ? 1 : 0, c.usar_transformador ? 1 : 0, o.force.toPrecision(2)].join('|');
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
  if (r.sat_pct < 60) good.push(`núcleo lejos de saturar (B al ${r.sat_pct.toFixed(0)}%)`);
  if (r.K_eddy > 0.3) good.push(`buen acoplamiento Foucault (K=${(r.K_eddy * 100).toFixed(0)}%)`);
  if (c.awg <= 22) good.push('alambre grueso y robusto');

  if (r.safety_ok && r.deltaT_est <= 40 && (!res || r.V_C_pk <= 300)) good.push('sistema estable y seguro (dentro de todos los límites)');
  if (res) bad.push(`banda estrecha: solo cerca de ${Math.round(c.f)} Hz`);
  if (tx) bad.push(`pierde ${(100 - r.tx.eta).toFixed(0)}% en T1 y añade un transformador`);
  if (isFinite(r.deltaT_est) && r.deltaT_est > 40) bad.push(`ΔT ≈ ${r.deltaT_est.toFixed(0)} °C: vigila la temperatura en sesiones largas`);
  if (r.fill_percent > 92) bad.push('carrete casi lleno: bobinado difícil');
  if (r.current_use_pct > 80) bad.push(`corriente al ${r.current_use_pct.toFixed(0)}% del límite del alambre`);
  if (r.sat_pct > 85) bad.push(`B al ${r.sat_pct.toFixed(0)}% de la saturación`);
  if (r.K_eddy < 0.05) bad.push(`acoplamiento Foucault débil a ${Math.round(c.f)} Hz (K=${(r.K_eddy * 100).toFixed(1)}%)`);
  if (res && r.V_C_pk > 300) bad.push(`capacitor a ${r.V_C_pk.toFixed(0)} V pico (film de alto voltaje)`);
  if (r.F_R > 1.5) bad.push(`proximidad: R_ac = ${r.F_R.toFixed(1)}×R a esta f`);
  if (tx && r.tx.sat_risk) bad.push('riesgo de saturación de T1 a baja frecuencia');
  if (c.awg >= 30) bad.push('alambre muy fino y frágil');

  const changes = [];
  for (const k of OPTIM_VARS) {
    if (optChanged(c[k], orig[k])) changes.push(`${OPTIM_LABELS[k]} ${optFmt(orig[k])}→${optFmt(c[k])}`);
  }

  return {
    rank: rank + 1, cfg: c, force: o.force, fmm: r.FMM_op, topo, res, tx,
    awg: c.awg, Rtarget: c.Rtarget, eta: tx ? r.tx.eta : 100, Q: res ? r.Q : 0,
    fill: r.fill_percent, current_use: r.current_use_pct, N: r.N, l_total: r.l_total,
    sat_pct: r.sat_pct, K_eddy: r.K_eddy,
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
// Incluye R_ac(f) (Dowell), K(f) (Foucault) y la FUERZA por topología.
// Cada gráfica toma de aquí solo las series pertinentes a los toggles activos.
function bandRow(base, params, freq) {
  const { L, R, C_res: C, N, d_cu_mm, d_ext_mm, num_layers } = base;
  const Vmax = params.Vmax;
  const a = base.tx.a;
  const R_pri = Math.max(params.R_pri || 0, 0);
  const R_sec = Math.max(params.R_sec || 0, 0);
  const k = clamp(params.acoplamiento_k == null ? 1 : params.acoplamiento_k, 0, 1);

  const w = 2 * Math.PI * freq;
  const Rw = R * dowellFactor(d_cu_mm, d_ext_mm, freq, num_layers); // R_ac(f)
  const XL = w * L;
  const XC = C > 0 ? 1 / (w * C) : 0;
  const Xres = XL - XC;                                 // con capacitor de resonancia
  const Z_coil = Math.sqrt(Rw * Rw + XL * XL);          // bobina sola
  const Z_cap = Math.sqrt(Rw * Rw + Xres * Xres);       // bobina + capacitor
  const Xeff = params.usar_resonancia ? Xres : XL;      // reactancia que refleja T1
  const Rs = Rw + R_sec;
  const Zsec = Math.sqrt(Rs * Rs + Xeff * Xeff);
  const Re = R_pri + Rs / (a * a);
  const Im = Xeff / (a * a);
  const Z_amp_ve = Math.sqrt(Re * Re + Im * Im);        // lo que ve el ampli con T1
  const I_amp = safeDiv(Vmax, Z_amp_ve);
  const I_bobina = safeDiv(k * I_amp, a);
  const I_direct = safeDiv(Vmax, Z_coil);
  const I_res = safeDiv(Vmax, Z_cap);
  const P_bobina = I_bobina * I_bobina * Rw;
  const P_total = I_amp * I_amp * Re;
  const eta = P_total > 0 ? (P_bobina / P_total) * 100 : 0;

  // Fuerza sobre el gong por topología: F = c_F · FMM² · K(f)
  const g = gongParams(params);
  const { K } = eddyCoupling(freq, g);
  const Ac_si = Math.max(params.Ac, 0) / 1e6;
  const lc_si = Math.max(params.lc, 1e-6) / 1e3;
  const decay = Math.exp(-Math.PI * g.gap_si / g.w_si);
  const cF = (MU_0 * params.mu_eff * params.mu_eff * decay * decay * Ac_si) / (4 * lc_si * lc_si);
  const FMM_sin_raw = N * I_direct;
  const FMM_res_raw = N * I_res;
  const FMM_tx_raw = N * I_bobina;

  return {
    f: Math.round(freq),
    Z_coil: +Z_coil.toFixed(2), Z_cap: +Z_cap.toFixed(2), Z_tx: +Z_amp_ve.toFixed(2),
    I_direct: +I_direct.toFixed(4), I_res: +I_res.toFixed(4),
    I_bobina: +I_bobina.toFixed(4), I_amp: +I_amp.toFixed(4),
    FMM_sin: +FMM_sin_raw.toFixed(1), FMM_res: +FMM_res_raw.toFixed(1), FMM_tx: +FMM_tx_raw.toFixed(1),
    F_sin: cF * FMM_sin_raw * FMM_sin_raw * K,
    F_res: cF * FMM_res_raw * FMM_res_raw * K,
    F_tx: cF * FMM_tx_raw * FMM_tx_raw * K,
    K_eddy: K,
    V_sec: +(I_bobina * Zsec).toFixed(3), eta: +eta.toFixed(1),
  };
}

// 1) Impedancia vs frecuencia (un solo eje, Ω):
//    - Bobina sola (sube con f) · Con capacitor (cae a R_ac en f0, si resonancia)
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
//    es segura. El color codifica la viabilidad. La recomendación = máxima FMM.
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

// 4) FUERZA sobre el gong vs frecuencia (un solo eje, N):
//    F_sin (directo), F_res (resonancia directa) y F_tx (con T1).
//    F ∝ FMM²·K(f): combina el pico de resonancia con el acoplamiento Foucault.
//    Recuerda: la fuerza empuja al gong a 2·f (el eje x es la f eléctrica).
export function generateForceCurve(params) {
  const base = calculateCoil(params);
  return freqSweep(params.f).map((freq) => {
    const r = bandRow(base, params, freq);
    return { f: r.f, F_sin: r.F_sin, F_res: r.F_res, F_tx: r.F_tx, K_eddy: r.K_eddy };
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
