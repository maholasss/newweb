// Marcas y vídeos UGC. Los vídeos viven en /public/ugc/<slug>-<n>.mp4 (+ .webp de portada).
// cat: skincare | makeup | fragrance | hair | fashion | lifestyle
// Todas las marcas tienen página propia: /marcas/<slug> y /en/brands/<slug>
//
// PARA MAHOLA: rellena estos tres datos de cada marca y aparecen solos en su página.
//   campaigns: 3            -> número de campañas hechas con la marca
//   since: '2024'           -> año de la primera colaboración
//   fav: { es: '...', en: '...' }  -> la campaña favorita, en una frase
// Lo que dejes sin rellenar simplemente no se muestra.

export const CATS = {
  skincare: { es: 'Skincare', en: 'Skincare' },
  makeup: { es: 'Maquillaje y uñas', en: 'Makeup & nails' },
  fragrance: { es: 'Perfume', en: 'Fragrance' },
  hair: { es: 'Cabello', en: 'Haircare' },
  fashion: { es: 'Moda', en: 'Fashion' },
  lifestyle: { es: 'Lifestyle', en: 'Lifestyle' },
};

// d = duración en segundos de cada vídeo, en orden
export const BRANDS = [
  {
    slug: 'huda-beauty', name: 'Huda Beauty', cat: 'makeup', page: true, d: [4.9], videoCredit: true,
    es: { t: 'Huda Beauty, contado como a una amiga', p: 'Vídeo a cámara y sin decorado: la marca explicada en primera persona, con la cara y la voz haciendo todo el trabajo. El formato que mejor funciona cuando el producto ya se conoce.' },
    en: { t: 'Huda Beauty, told like you’d tell a friend', p: 'A to-camera video with no set dressing: the brand explained first-hand, face and voice doing all the work. The format that works best when the product is already known.' },
  },
  {
    slug: 'cerave', name: 'CeraVe', cat: 'skincare', page: true, d: [34.4, 30.1],
    es: { t: 'Rutina de skincare para piel normal o seca', p: 'Una rutina de mañana contada en primera persona: qué me pongo, en qué orden y cómo se nota en la piel apagada de primera hora.' },
    en: { t: 'A skincare routine for normal to dry skin', p: 'A morning routine told first-hand: what I use, in what order and how it shows on dull early-morning skin.' },
  },
  {
    slug: 'loreal-paris', name: "L'Oréal Paris", cat: 'makeup', page: true, d: [6.9, 21.0, 19.2],
    es: { t: 'GRWM, sérum y protector solar', p: 'Un get ready with me completo, el sérum Le Duo en exterior y el protector solar en plano detalle. Tres formatos para tres momentos del embudo.' },
    en: { t: 'GRWM, serum and sunscreen', p: 'A full get ready with me, the Le Duo serum shot outdoors and the sunscreen in close-up. Three formats for three stages of the funnel.' },
  },
  {
    slug: 'shein', name: 'SHEIN', cat: 'fashion', page: true, d: [21.1, 12.0], photos: ['shein-1', 'shein-2', 'shein-3'], photoCredit: true, campaigns: 20, since: '2026', tipo: { es: 'Influencer de la marca', en: 'Brand influencer' },
    es: { t: 'Outfit check y bikinis', p: 'Try-on con ritmo: cambio de look al compás, prenda a prenda, para que se vea cómo queda la ropa en movimiento y no solo en percha.' },
    en: { t: 'Outfit check and swimwear', p: 'A try-on with rhythm: one look after another on the beat, so you see how the clothes move and not just how they hang.' },
  },
  {
    slug: 'mugler', name: 'Mugler', cat: 'fragrance', page: true, d: [11.8, 9.2], campaigns: 2, since: '2025', tipo: { es: 'Embajadora', en: 'Brand ambassador' },
    es: { t: 'Angel y Alien, dos perfumes en un plano', p: 'Perfume en vídeo corto: luz cuidada, el frasco como protagonista y una expresión que cuenta lo que no se puede oler.' },
    en: { t: 'Angel and Alien in a single frame', p: 'Fragrance in short-form: careful lighting, the bottle as the hero and an expression that says what you cannot smell.' },
  },
  {
    slug: 'vichy', name: 'Vichy', cat: 'skincare', page: true, d: [17.3],
    es: { t: 'La crema que va al neceser', p: 'Producto en mano, textura en la piel y una frase clara de por qué lo uso. Directo, cercano y en menos de veinte segundos.' },
    en: { t: 'The cream that makes it into the bag', p: 'Product in hand, texture on skin and one clear line on why I use it. Direct, warm and under twenty seconds.' },
  },
  {
    slug: 'garnier', name: 'Garnier', cat: 'skincare', page: true, d: [11.6, 11.5, 16.7],
    es: { t: 'Vitamina C, de la ducha a la playa', p: 'Tres piezas para Garnier: textura en primer plano, un bodegón de producto con color y una escena de verano en la playa.' },
    en: { t: 'Vitamin C, from the shower to the beach', p: 'Three pieces for Garnier: texture in close-up, a colourful product still life and a summer scene at the beach.' },
  },
  {
    slug: 'la-roche-posay', name: 'La Roche-Posay', cat: 'skincare', page: true, d: [24.1],
    es: { t: 'Effaclar para piel con granitos', p: 'Reseña a cámara con los productos a la vista: el problema, lo que he probado y lo que me ha funcionado.' },
    en: { t: 'Effaclar for breakout-prone skin', p: 'A to-camera review with the products in shot: the problem, what I tried and what actually worked.' },
  },
  {
    slug: 'maybelline', name: 'Maybelline', cat: 'makeup', page: true, d: [24.4, 13.2],
    es: { t: 'Labios que aguantan unas Fallas', p: 'Maquillaje puesto a prueba en la vida real: si aguanta un día entero de Fallas, aguanta lo que le eches.' },
    en: { t: 'Lips that last a whole Fallas day', p: 'Makeup put to the test in real life: if it survives a full day of Fallas in Valencia, it survives anything.' },
  },
  {
    slug: 'kiehls', name: "Kiehl's", cat: 'skincare', page: true, d: [25.2],
    es: { t: 'Reseña de crema a cámara', p: 'Una reseña honesta, con el producto en mano y la textura explicada.' },
    en: { t: 'A to-camera cream review', p: 'An honest review with the product in hand and the texture explained.' },
  },
  {
    slug: 'cosrx', name: 'COSRX', cat: 'skincare', page: true, d: [22.8, 10.0], campaigns: 2, since: '2025', tipo: { es: 'Canje', en: 'Gifted' },
    es: { t: 'Skincare con humor y en compañía', p: 'Mascarillas y planes de día libre: skincare coreano contado como un meme.' },
    en: { t: 'Skincare with humour and company', p: 'Sheet masks and day-off plans: Korean skincare told like a meme.' },
  },
  {
    slug: 'lancome', name: 'Lancôme', cat: 'makeup', page: true, d: [14.2], campaigns: 4, since: '2024', tipo: { es: 'Embajadora', en: 'Brand ambassador' },
    es: { t: 'Reacción a un lanzamiento', p: 'El hook de la sorpresa para presentar una novedad.' },
    en: { t: 'Reacting to a launch', p: 'The surprise hook to introduce something new.' },
  },
  {
    slug: 'nyx', name: 'NYX', cat: 'makeup', page: true, d: [18.6], since: '2026',
    es: { t: 'El mejor combo de labios', p: 'Perfilador y gloss, paso a paso y con pregunta a la comunidad.' },
    en: { t: 'The best lip combo', p: 'Liner and gloss step by step, with a question for the community.' },
  },
  {
    slug: 'essie', name: 'Essie', cat: 'makeup', page: true, d: [13.1],
    es: { t: 'Si se te rompe una uña', p: 'Un problema real resuelto en trece segundos.' },
    en: { t: 'When a nail breaks', p: 'A real problem solved in thirteen seconds.' },
  },
  {
    slug: 'azzaro', name: 'Azzaro', cat: 'fragrance', page: true, d: [29.6],
    es: { t: 'Un perfume como regalo', p: 'Storytelling de pareja para una fragancia masculina.' },
    en: { t: 'A fragrance as a gift', p: 'Couple storytelling for a men’s fragrance.' },
  },
  {
    slug: 'cacharel', name: 'Cacharel', cat: 'fragrance', page: true, d: [14.1], campaigns: 1, since: '2025', tipo: { es: 'Embajadora', en: 'Brand ambassador' },
    es: { t: 'Yummy Flower Mist, bruma de vainilla', p: 'Embajadora de Cacharel. Perfume en formato corto y dulce: el gesto de perfumarse, el frasco en primer plano y una expresión que cuenta lo que no se puede oler.' },
    en: { t: 'Yummy Flower Mist, a vanilla body mist', p: 'Cacharel ambassador. Fragrance in short-form: the gesture of spraying it, the bottle in close-up and an expression that says what you cannot smell.' },
  },
  {
    slug: 'pantene', name: 'Pantene', cat: 'hair', page: true, d: [21.2],
    es: { t: 'Pelo sin vida, pelo con brillo', p: 'Antes y después con el sérum en mano.' },
    en: { t: 'From dull to shiny hair', p: 'Before and after, serum in hand.' },
  },
  {
    slug: 'tresemme', name: 'TRESemmé', cat: 'hair', page: true, d: [9.0],
    es: { t: 'Peinado de diario', p: 'Producto de styling en una rutina rápida.' },
    en: { t: 'Everyday styling', p: 'A styling product in a quick routine.' },
  },
  {
    slug: 'nyk1', name: 'NYK1', cat: 'hair', page: true, d: [10.4],
    es: { t: 'Unboxing de haircare', p: 'Champú y acondicionador del paquete al lavabo.' },
    en: { t: 'Haircare unboxing', p: 'Shampoo and conditioner from box to basin.' },
  },
  {
    slug: 'esgir', name: 'Esgir', cat: 'lifestyle', page: true, d: [26.4],
    es: { t: 'Reseña a cámara con micro', p: 'Formato entrevista, directo y creíble.' },
    en: { t: 'Mic-in-hand review', p: 'Interview format, direct and believable.' },
  },
  {
    slug: 'glocolens', name: 'Glocolens', cat: 'makeup', page: true, d: [18.4],
    es: { t: 'Lentillas de color, el PR', p: 'Unboxing y prueba de cuatro pares.' },
    en: { t: 'Coloured lenses PR', p: 'Unboxing and trying four pairs.' },
  },
  {
    slug: 'rena-chris', name: 'Rena Chris', cat: 'skincare', page: true, d: [15.6],
    es: { t: 'Gua sha de acupresión', p: 'Self-care en plano detalle.' },
    en: { t: 'Acupressure gua sha', p: 'Self-care in close-up.' },
  },
  {
    slug: 'yesstyle', name: 'YesStyle', cat: 'skincare', page: true, d: [12.8],
    es: { t: 'K-beauty en el baño', p: 'Producto coreano presentado en rutina.' },
    en: { t: 'K-beauty in the bathroom', p: 'A Korean product shown in a routine.' },
  },
  {
    slug: 'cossy-island', name: 'Cossy Island', cat: 'fashion', page: true, d: [10.3],
    es: { t: 'Bolso y tacones por la ciudad', p: 'Moda en la calle, con ritmo de paseo.' },
    en: { t: 'Bag and heels around town', p: 'Street fashion with a walking rhythm.' },
  },
  {
    slug: 'mooslover', name: 'Moonslover', cat: 'fashion', page: true, d: [12.0, 15.6],
    es: { t: 'Conjunto cómodo, del paquete al parque', p: 'Unboxing y paseo con la prenda puesta.' },
    en: { t: 'Loungewear, from parcel to park', p: 'Unboxing and a walk wearing it.' },
  },
  {
    slug: 'prozis', name: 'Prozis', cat: 'fashion', page: true, d: [56.3],
    es: { t: 'Ropa deportiva, try-on', p: 'Conjuntos probados en casa, con movimiento.' },
    en: { t: 'Activewear try-on', p: 'Sets tried on at home, in motion.' },
  },
  {
    slug: 'temu', name: 'Temu', cat: 'lifestyle', page: true, d: [27.4, 45.9, 36.8],
    es: { t: 'Hauls y rutina de noche', p: 'Haul de casa, maquillaje probado y night routine.' },
    en: { t: 'Hauls and a night routine', p: 'A home haul, makeup tested and a night routine.' },
  },
  {
    slug: 'meoki', name: 'Meoki', cat: 'lifestyle', page: true, d: [13.9, 39.2],
    es: { t: 'El vaso que va a todas partes', p: 'Producto integrado en el día a día, sin forzar.' },
    en: { t: 'The tumbler that goes everywhere', p: 'A product woven into everyday life, never forced.' },
  },
];

// Las seis del zig-zag de la home, en orden
export const FEATURED = ['huda-beauty', 'cerave', 'loreal-paris', 'shein', 'mugler', 'cacharel'];

export const bySlug = (s) => BRANDS.find((b) => b.slug === s);
export const videos = (b) => b.d.map((_, i) => `/ugc/${b.slug}-${i + 1}`);
export const isoDuration = (s) => `PT${Math.round(s)}S`;
