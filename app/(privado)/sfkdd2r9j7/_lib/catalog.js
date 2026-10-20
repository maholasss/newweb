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
  if (day.temp) out.push({ g: 'temp', t: `${(Math.round(day.temp * 100) / 100).toFixed(2).replace('.', ',')} °C` });
  if (day.weight) out.push({ g: 'weight', t: `${String(day.weight).replace('.', ',')} kg` });
  if (day.disturbed) out.push({ g: 'temp', t: 'Medición alterada' });
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

export const CHANCE = { high: 'Alta', medium: 'Media', low: 'Baja' };
export const OV_SOURCE = { lh: 'confirmada por test', sympto: 'confirmada por temperatura y flujo', bbt: 'por temperatura', mucus: 'por el flujo', calendar: 'estimada' };
export const FLAGS = {
  amenorrhea: ['Sin regla desde hace 90 días', 'Si no hay embarazo, tres meses sin regla es motivo de consulta.'],
  short3: ['Tres ciclos seguidos de menos de 21 días', 'Ciclos tan cortos repetidos conviene revisarlos.'],
  long3: ['Tres ciclos seguidos de más de 35 días', 'Ciclos tan largos repetidos conviene revisarlos.'],
  longbleed: ['Una regla de 8 días o más', 'Un sangrado de 8 días o más en los últimos 6 meses es motivo de consulta, sobre todo si fue abundante.'],
  postcoital: ['Sangrado tras relaciones', 'Has manchado después de tener relaciones en dos ocasiones fuera de la regla. Siempre se revisa.'],
  pregbleed: ['Sangrado con test de embarazo positivo', 'Un sangrado tras un test positivo hay que consultarlo pronto.'],
};
export const TREND = { longer: 'Tus ciclos se están alargando', shorter: 'Tus ciclos se están acortando', stable: 'Tus ciclos se mantienen estables' };
export const STATE = { ok: 'Normal', warn: 'Revisar', bad: 'Consultar' };

// Tres consejos por fase: cuerpo, comida y ánimo. Orientativos, no médicos.
export const TIPS = {
  period: ['Calor en el bajo vientre y movimiento suave (caminar, estirar) alivian el dolor mejor que quedarse quieta.', 'Hierro y vitamina C juntos: lentejas, espinacas o carne roja con cítricos. Si te mareas o estás muy cansada, puede faltarte hierro.', 'Es normal tener menos energía. Baja el ritmo de entrenos sin sentir que fallas.'],
  follicular: ['Los estrógenos suben: es la mejor semana para entrenos fuertes, aprender cosas nuevas y rodar contenido.', 'Comida ligera y fresca sienta bien ahora; el cuerpo tolera mejor los hidratos.', 'Suele ser la fase de mejor ánimo y piel. Aprovecha para lo que te cueste más el resto del mes.'],
  fertile: ['El flujo se vuelve claro y elástico: es la señal más fiable de que la ovulación se acerca.', 'Si no buscas embarazo, estos son los días de más cuidado. Si lo buscas, los dos días antes de ovular son los mejores.', 'Puedes notar más deseo, más energía y hasta la voz y la piel distintas.'],
  ovulation: ['Un pinchazo en un lado del bajo vientre o un manchado ligero hoy pueden ser la propia ovulación.', 'La temperatura basal subirá unas décimas a partir de mañana si mides cada día.', 'Si apuntas un test de ovulación positivo, la app ajusta la fecha de tu próxima regla.'],
  luteal: ['Manda la progesterona: más sueño, más calor y más hambre son normales. Prioriza dormir.', 'Magnesio y menos sal ayudan con la hinchazón y el pecho sensible: frutos secos, plátano, chocolate negro.', 'Si los últimos días el ánimo se hunde cada mes, apúntalo a diario: la app detecta el patrón de SPM.'],
  due: ['Ten a mano lo que uses. Si hoy no llega, no pasa nada: unos días de margen son normales.', 'Cansancio y antojos hoy suelen ser el aviso.', 'Si tienes retraso y relaciones sin protección, un test ya es fiable desde el día de la falta.'],
  late: ['Estrés, viajes, dormir poco o cambios de peso retrasan la regla con facilidad.', 'Un test de embarazo es fiable desde el primer día de retraso, mejor con la primera orina de la mañana.', 'Si pasan 90 días sin regla, conviene consultarlo aunque no haya embarazo.'],
  cycle: ['Con anticonceptivo hormonal el sangrado es por la pausa, no una regla real.', 'Apunta igualmente síntomas y ánimo: sirven para ver cómo te sienta el método.', 'Si manchas entre pausas varios meses, coméntalo: a veces se ajusta la dosis.'],
  none: ['Marca tu última regla para empezar. Con tres ciclos la app ya predice con tus datos.', 'Si mides la temperatura al despertar y apuntas el flujo, la app confirma cuándo ovulas.', 'Todo queda cifrado en tu móvil; nadie más puede leerlo.'],
};

export const LEARN = [
  ['¿Qué es un ciclo normal?', 'Según la FIGO, de 24 a 38 días, con una variación de hasta 9 días entre el más corto y el más largo, y una regla de 2 a 8 días. Fuera de eso no siempre es un problema, pero conviene comentarlo.'],
  ['¿Cómo se mide la temperatura basal?', 'Nada más despertar, antes de levantarte, hablar o beber, siempre a la misma hora y con el mismo termómetro (mejor de dos decimales). Tras ovular sube 0,2 a 0,5 °C y se queda alta hasta la regla. Marca como alterada la medición si tuviste fiebre, alcohol, mal sueño o te la tomaste a otra hora.'],
  ['¿Cómo funciona el test de ovulación?', 'Detecta la hormona LH en la orina. Positivo quiere decir que ovularás en las 24 a 36 horas siguientes. Hazlo por la tarde, sin beber mucho antes, desde unos 4 días antes de la ovulación prevista.'],
  ['¿Qué dice el flujo?', 'Tras la regla suele estar seco o pegajoso; se vuelve cremoso; y cerca de la ovulación, transparente y elástico como clara de huevo. El último día así es el pico, y la ovulación ocurre ese día o el siguiente.'],
  ['¿Cuándo puedo quedarme embarazada?', 'El óvulo vive un día y los espermatozoides hasta cinco. Por eso la ventana fértil son los 5 días antes de ovular y el día de la ovulación, con la máxima probabilidad los dos días previos. La app pinta la ventana más ancha para no quedarse corta.'],
  ['¿Qué es el SPM y el TDPM?', 'Síndrome premenstrual: síntomas físicos y de ánimo la semana antes de la regla que desaparecen al llegar. Si son cinco o más, con cambios de ánimo intensos, y pasan cada ciclo, se llama trastorno disfórico premenstrual (TDPM) y tiene tratamiento. Para diagnosticarlo hace falta apuntar a diario al menos dos ciclos: justo lo que hace esta app.'],
  ['¿Qué es un sangrado abundante?', 'Cambiar de compresa o tampón cada hora varias horas seguidas, coágulos grandes, o reglas de más de 8 días. Puede bajar el hierro y provocar cansancio y mareos.'],
  ['¿Cuándo debo consultar?', 'Sin regla 90 días, ciclos de menos de 21 o más de 35 días repetidos, sangrado de 8 días o más, manchado después de relaciones, dolor que no te deja hacer vida normal, o sangrado con un test de embarazo positivo. La app te avisa si detecta alguno.'],
  ['¿Cuánto acierta la app?', 'Depende de tu regularidad. Con ciclos regulares acierta la regla con 1 o 2 días de margen; con irregulares el margen crece y la app lo muestra. Un test de ovulación o la temperatura afinan mucho más que el calendario.'],
];

export const DEVIATIONS = {
  irregular: ['Ciclos irregulares', 'Entre tu ciclo más corto y el más largo de los últimos 6 meses hay 17 días o más.'],
  infrequent: ['Reglas poco frecuentes', 'Solo una o dos reglas en los últimos 6 meses.'],
  prolonged: ['Reglas largas', 'Dos o más reglas de 10 días o más en los últimos 6 meses.'],
  spotting: ['Manchado entre reglas', 'Manchado fuera de la regla en dos o más ciclos de los últimos 6 meses.'],
};
