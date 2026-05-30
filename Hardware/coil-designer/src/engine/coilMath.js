export const MU_0 = 4 * Math.PI * 1e-7; // Permeabilidad del vacío

export const DEFAULT_CONSTANTS = {
  mu_eff: 1.5,
  A_c: 0.001, // 10cm^2 = 0.001 m^2
  l_c: 0.1,   // 10cm de camino magnético
};

// AWG resistance in Ohms per meter and insulated diameter in mm
export const AWG_TABLE = {
  18: { res: 0.02095, diam: 1.09 },
  19: { res: 0.02641, diam: 0.98 },
  20: { res: 0.03330, diam: 0.88 },
  21: { res: 0.04200, diam: 0.79 },
  22: { res: 0.05300, diam: 0.70 },
  23: { res: 0.06680, diam: 0.63 },
  24: { res: 0.08420, diam: 0.56 },
  25: { res: 0.10600, diam: 0.50 },
  26: { res: 0.13400, diam: 0.45 },
  27: { res: 0.16900, diam: 0.40 },
  28: { res: 0.21300, diam: 0.36 },
  29: { res: 0.26800, diam: 0.32 },
  30: { res: 0.33900, diam: 0.29 },
  31: { res: 0.42700, diam: 0.26 },
  32: { res: 0.53800, diam: 0.23 },
};

export function calculateCoil({ V_max, AWG, R_target, l_vuelta, f, mu_eff, A_c, l_c, h_w, d_w }) {
  const awgData = AWG_TABLE[AWG] || AWG_TABLE[24];
  const R_metro = awgData.res;
  const diam_mm = awgData.diam;
  
  // 1. Longitud total
  const l_total = R_target / R_metro;
  
  // 2. Número de vueltas
  const N = l_total / l_vuelta;
  
  // 3. Inductancia Estimada (L)
  const L = (Math.pow(N, 2) * MU_0 * mu_eff * A_c) / l_c;
  
  // 4. Impedancia en AC (Z)
  const XL = 2 * Math.PI * f * L; // Reactancia inductiva
  const Z = Math.sqrt(Math.pow(R_target, 2) + Math.pow(XL, 2));
  
  // 5. Corriente Dinámica (I)
  const I = V_max / Z;
  
  // 6. Fuerza Magnetomotriz (FMM)
  const FMM = N * I;

  // 7. Cálculo de espacio físico en el carrete (Fill factor)
  // Utilizamos el empaquetado asumiendo capas. 
  // Vueltas por capa = altura de la ventana / diametro del alambre
  const turns_per_layer = Math.floor(h_w / diam_mm);
  // Numero de capas = profundidad de la ventana / diametro del alambre
  const num_layers = Math.floor(d_w / diam_mm);
  // Capacidad Maxima de Vueltas (N_max)
  const N_max = turns_per_layer * num_layers;
  
  // Porcentaje de llenado
  const fill_percent = N_max > 0 ? (N / N_max) * 100 : Infinity;
  
  return {
    R_metro, diam_mm, l_total, N, L, XL, Z, I, FMM,
    turns_per_layer, num_layers, N_max, fill_percent
  };
}

export function generateImpedanceCurve(params) {
  const data = [];
  const freqs = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  for (let f of freqs) {
    const calc = calculateCoil({ ...params, f });
    data.push({
      f: f.toString() + 'Hz',
      f_val: f,
      Z: parseFloat(calc.Z.toFixed(2)),
      R_target: params.R_target,
    });
  }
  return data;
}

export function generateAWGComparison(params) {
  const data = [];
  for (const awg of Object.keys(AWG_TABLE)) {
    const calc = calculateCoil({ ...params, AWG: parseInt(awg) });
    data.push({
      AWG: awg,
      FMM: parseFloat(calc.FMM.toFixed(2)),
      N: parseFloat(calc.N.toFixed(0))
    });
  }
  return data;
}

export function generateACComparison(params) {
  const data = [];
  // Generar variaciones del área A_c desde 0.0001 m² hasta 0.01 m²
  const ac_values = [0.0001, 0.0005, 0.001, 0.002, 0.004, 0.006, 0.008, 0.01];
  for (const a of ac_values) {
    const calc = calculateCoil({ ...params, A_c: a });
    data.push({
      A_c: a,
      A_c_cm2: (a * 10000).toFixed(0) + ' cm²', // para visualización
      FMM: parseFloat(calc.FMM.toFixed(2))
    });
  }
  return data;
}
