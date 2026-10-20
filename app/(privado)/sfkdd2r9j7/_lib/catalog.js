// Todo lo que se puede apuntar en un día. Lo mismo que registran Clue, Flo y Salud de Apple.

export const FLOW = [
  ['spot', 'Manchado'],
  ['light', 'Ligero'],
  ['medium', 'Medio'],
  ['heavy', 'Abundante'],
];

export const GROUPS = [
  {
    id: 'sym', title: 'Síntomas', multi: true,
    items: [
      ['cramps', 'Dolor menstrual'], ['headache', 'Dolor de cabeza'], ['migraine', 'Migraña'], ['back', 'Dolor lumbar'],
      ['breasts', 'Pecho sensible'], ['ovpain', 'Dolor ovulatorio'], ['bloating', 'Hinchazón'], ['nausea', 'Náuseas'],
      ['constipation', 'Estreñimiento'], ['diarrhea', 'Diarrea'], ['acne', 'Granos'], ['oily', 'Piel grasa'],
      ['cravings', 'Antojos'], ['hunger', 'Más hambre'], ['fatigue', 'Cansancio'], ['insomnia', 'Insomnio'],
      ['dizzy', 'Mareo'], ['hot', 'Sofocos'], ['muscle', 'Dolor muscular'],
    ],
  },
  {
    id: 'mood', title: 'Ánimo', multi: true,
    items: [
      ['calm', 'Tranquila'], ['happy', 'Feliz'], ['energetic', 'Con energía'], ['confident', 'Segura de mí'],
      ['sensitive', 'Sensible'], ['irritable', 'Irritable'], ['anxious', 'Ansiosa'], ['sad', 'Triste'],
      ['swings', 'Cambios de humor'], ['stressed', 'Estresada'], ['unmotivated', 'Sin ganas'],
    ],
  },
  { id: 'energy', title: 'Energía', items: [['low', 'Baja'], ['ok', 'Normal'], ['high', 'Alta']] },
  { id: 'sleep', title: 'Sueño', items: [['bad', 'Mal'], ['ok', 'Regular'], ['good', 'Bien']] },
  {
    id: 'mucus', title: 'Flujo vaginal',
    items: [['dry', 'Seco'], ['sticky', 'Pegajoso'], ['creamy', 'Cremoso'], ['eggwhite', 'Clara de huevo'], ['watery', 'Acuoso'], ['unusual', 'Raro']],
  },
  {
    id: 'sex', title: 'Relaciones y deseo', multi: true,
    items: [['protected', 'Con protección'], ['unprotected', 'Sin protección'], ['solo', 'En solitario'], ['high', 'Mucho deseo'], ['low', 'Poco deseo']],
  },
  { id: 'lh', title: 'Test de ovulación', items: [['neg', 'Negativo'], ['pos', 'Positivo']] },
  { id: 'preg', title: 'Test de embarazo', items: [['neg', 'Negativo'], ['pos', 'Positivo']] },
  {
    id: 'meds', title: 'Medicación', multi: true,
    items: [['pill', 'Anticonceptivo'], ['painkiller', 'Analgésico'], ['ibuprofen', 'Ibuprofeno'], ['iron', 'Hierro'], ['vitamins', 'Vitaminas'], ['other', 'Otra']],
  },
  {
    id: 'product', title: 'Producto', multi: true,
    items: [['pad', 'Compresa'], ['tampon', 'Tampón'], ['cup', 'Copa'], ['underwear', 'Braga menstrual'], ['liner', 'Salvaslip']],
  },
  {
    id: 'sport', title: 'Ejercicio', multi: true,
    items: [['dance', 'Baile'], ['walk', 'Caminar'], ['gym', 'Gimnasio'], ['yoga', 'Yoga o pilates'], ['run', 'Correr'], ['swim', 'Nadar']],
  },
];

const LABELS = Object.fromEntries(GROUPS.map((g) => [g.id, Object.fromEntries(g.items)]));
LABELS.flow = Object.fromEntries(FLOW);
export const label = (group, id) => LABELS[group]?.[id] || id;

// Resumen corto de un día, para chips y el informe.
export function chipsOf(day) {
  if (!day) return [];
  const out = [];
  if (day.flow && day.flow !== 'none') out.push({ g: 'flow', t: day.flow === 'spot' ? 'Manchado' : `Regla · ${label('flow', day.flow).toLowerCase()}` });
  for (const g of GROUPS) {
    const v = day[g.id];
    if (Array.isArray(v)) v.forEach((id) => out.push({ g: g.id, t: label(g.id, id) }));
    else if (v) out.push({ g: g.id, t: `${g.title}: ${label(g.id, v).toLowerCase()}` });
  }
  if (day.temp) out.push({ g: 'temp', t: `${String(day.temp).replace('.', ',')} °C` });
  if (day.weight) out.push({ g: 'weight', t: `${String(day.weight).replace('.', ',')} kg` });
  if (day.note) out.push({ g: 'note', t: 'Nota' });
  return out;
}

export const PHASES = {
  none: { name: 'Empieza aquí', text: 'Marca tu última regla y la app calcula tu ciclo, la próxima regla y tus días fértiles. Cuantos más ciclos apuntes, más acierta.' },
  period: { name: 'Regla', text: 'El útero suelta su capa interna. Es normal notar cansancio o dolor: el calor, moverse suave y beber agua suelen ayudar.' },
  follicular: { name: 'Fase folicular', text: 'Suben los estrógenos: muchas personas notan más energía, mejor ánimo y la piel más bonita.' },
  fertile: { name: 'Ventana fértil', text: 'Días con más probabilidad de embarazo. El flujo suele volverse más claro y elástico, como clara de huevo.' },
  ovulation: { name: 'Ovulación', text: 'Se libera el óvulo. Hay quien nota un pinchazo en un lado del bajo vientre o más deseo.' },
  luteal: { name: 'Fase lútea', text: 'Manda la progesterona. En los últimos días pueden aparecer hinchazón, pecho sensible, antojos o cambios de humor.' },
  due: { name: 'Toca regla', text: 'Hoy es el día previsto. Si llega, márcala con el botón de arriba.' },
  late: { name: 'Retraso', text: 'Unos días de retraso son frecuentes: estrés, viajes, sueño o cambios de peso. Si has tenido relaciones sin protección, un test de embarazo ya es fiable desde el día de la falta.' },
  cycle: { name: 'Ciclo', text: 'Con anticonceptivo hormonal no hay ovulación que predecir: la app solo sigue tus sangrados y síntomas.' },
};

export const DEVIATIONS = {
  irregular: ['Ciclos irregulares', 'Entre tu ciclo más corto y el más largo de los últimos 6 meses hay 17 días o más.'],
  infrequent: ['Reglas poco frecuentes', 'Solo una o dos reglas en los últimos 6 meses.'],
  prolonged: ['Reglas largas', 'Dos o más reglas de 10 días o más en los últimos 6 meses.'],
  spotting: ['Manchado entre reglas', 'Manchado fuera de la regla en dos o más ciclos de los últimos 6 meses.'],
};
