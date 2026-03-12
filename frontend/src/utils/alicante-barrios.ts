/**
 * alicante-barrios.ts — Coordenadas centrales aproximadas de los barrios de Alicante.
 * 
 * Basado en datos de OpenStreetMap y el CSV de AMAEM.
 */

export interface BarrioCoords {
  lat: number
  lng: number
  nombre: string
}

export const BARRIOS_COORDS: Record<string, BarrioCoords> = {
  '01-CENTRO': { lat: 38.3453, lng: -0.4831, nombre: 'Centro' },
  '02-ENSANCHE-DIPUTACION': { lat: 38.3472, lng: -0.4898, nombre: 'Ensanche-Diputación' },
  '03-PLAZA DE TOROS-MERCADO': { lat: 38.3495, lng: -0.4870, nombre: 'Plaza de Toros' },
  '04-ALFONSO EL SABIO-SAN BLAS': { lat: 38.3510, lng: -0.4812, nombre: 'Alfonso el Sabio' },
  '05-BENALUA': { lat: 38.3430, lng: -0.4930, nombre: 'Benalúa' },
  '5-CAMPOAMOR': { lat: 38.3400, lng: -0.5010, nombre: 'Campoamor' },
  '06-LOS ANGELES': { lat: 38.3480, lng: -0.5080, nombre: 'Los Ángeles' },
  '6-LOS ANGELES': { lat: 38.3480, lng: -0.5080, nombre: 'Los Ángeles' },
  '07-TOMBAS-SAN NICOLAS': { lat: 38.3460, lng: -0.4780, nombre: 'Tombas-San Nicolás' },
  '08-RAVAL ROIG-VIRGEN DEL SOCORRO': { lat: 38.3490, lng: -0.4740, nombre: 'Raval Roig' },
  '09-SAN ANTON': { lat: 38.3560, lng: -0.4830, nombre: 'San Antón' },
  '10-FLORIDA BAJA': { lat: 38.3380, lng: -0.4780, nombre: 'Florida Baja' },
  '11-CIUDAD DE ASIS': { lat: 38.3530, lng: -0.4970, nombre: 'Ciudad de Asís' },
  '12-POLIGONO BABEL': { lat: 38.3370, lng: -0.5020, nombre: 'Polígono Babel' },
  '13-ALIPARK': { lat: 38.3540, lng: -0.4910, nombre: 'Alipark' },
  '14-ALTOZANO-CONDE LUMIARES': { lat: 38.3580, lng: -0.4850, nombre: 'Altozano' },
  '15-CAROLINAS ALTAS': { lat: 38.3570, lng: -0.4930, nombre: 'Carolinas Altas' },
  '16-CAROLINAS BAJAS': { lat: 38.3540, lng: -0.4960, nombre: 'Carolinas Bajas' },
  '17-CAMPOAMOR': { lat: 38.3400, lng: -0.5010, nombre: 'Campoamor' },
  '18-SAN BLAS': { lat: 38.3520, lng: -0.4760, nombre: 'San Blas' },
  '19-FLORIDA ALTA': { lat: 38.3410, lng: -0.4820, nombre: 'Florida Alta' },
  '20-SAN GABRIEL': { lat: 38.3310, lng: -0.4860, nombre: 'San Gabriel' },
  '21-BENALUA SUR': { lat: 38.3390, lng: -0.4960, nombre: 'Benalúa Sur' },
  '22-PLAYA DE SAN JUAN': { lat: 38.3620, lng: -0.4320, nombre: 'Playa San Juan' },
  '23-VISTAHERMOSA': { lat: 38.3680, lng: -0.4510, nombre: 'Vistahermosa' },
  '24-JUAN XXIII': { lat: 38.3650, lng: -0.5030, nombre: 'Juan XXIII' },
  '25-VILLAFRANQUEZA': { lat: 38.3680, lng: -0.4660, nombre: 'Villafranqueza' },
  '26-LO MORANT': { lat: 38.3750, lng: -0.4950, nombre: 'Lo Morant' },
  '27-COLONIA AMANECER': { lat: 38.3720, lng: -0.4890, nombre: 'Colonia Amanecer' },
  '28-EL PALMERAL': { lat: 38.3650, lng: -0.4750, nombre: 'El Palmeral' },
  '29-VIRGEN DEL REMEDIO': { lat: 38.3710, lng: -0.5010, nombre: 'Virgen del Remedio' },
  '30-PAU': { lat: 38.3600, lng: -0.5100, nombre: 'PAU' },
  '31-DISPERSO NORTE': { lat: 38.3900, lng: -0.4800, nombre: 'Disperso Norte' },
  '32-ALBUFERETA': { lat: 38.3580, lng: -0.4480, nombre: 'Albufereta' },
  '33-CABO HUERTAS': { lat: 38.3550, lng: -0.4250, nombre: 'Cabo Huertas' },
  '34-GOLF': { lat: 38.3620, lng: -0.4180, nombre: 'Golf' },
  '35-CABO HUERTAS': { lat: 38.3530, lng: -0.4200, nombre: 'Cabo Huertas' },
  '36-GRAN VIA': { lat: 38.3560, lng: -0.5050, nombre: 'Gran Vía' },
  '37-REBOLLEDO': { lat: 38.4000, lng: -0.5100, nombre: 'Rebolledo' },
  '38-DISPERSO': { lat: 38.3800, lng: -0.5200, nombre: 'Disperso' },
  'BACAROT': { lat: 38.3200, lng: -0.5300, nombre: 'Bacarot' },
  'TORRELLANO': { lat: 38.3100, lng: -0.5700, nombre: 'Torrellano' },
  'EL MORALET': { lat: 38.4100, lng: -0.4950, nombre: 'El Moralet' },
  'AGUA AMARGA': { lat: 38.3330, lng: -0.4600, nombre: 'Agua Amarga' },
  'TABARCA': { lat: 38.1650, lng: -0.4820, nombre: 'Tabarca' },
}

/** Devuelve coordenadas para un barrio, buscando por nombre parcial si no hay coincidencia exacta */
export function getBarrioCoords(barrio: string): BarrioCoords | null {
  // Exact match
  if (BARRIOS_COORDS[barrio]) return BARRIOS_COORDS[barrio]

  // Partial match on key
  const upper = barrio.toUpperCase()
  for (const [key, val] of Object.entries(BARRIOS_COORDS)) {
    if (key.toUpperCase().includes(upper) || upper.includes(key.toUpperCase())) {
      return val
    }
  }

  return null
}

/** Centro de Alicante */
export const ALICANTE_CENTER: [number, number] = [38.3452, -0.4810]
export const ALICANTE_ZOOM = 14
