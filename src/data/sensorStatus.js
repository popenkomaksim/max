// Content for the sensor online-status post. Lives in JS rather than JSON
// because every variant carries a `draw` function that returns the SVG markup
// for its tile, kept next to the copy it illustrates.
//
// All drawing happens in a 540×320 viewBox centred on the symbol (frame at
// cx=100 cy=100 r=60), so each `draw` can reach left of the frame for text
// fields without moving the symbol. Colours resolve from CSS custom properties
// scoped to `.sensor-sheet` in index.css.

const GLYPH = 'm 100,60 c 0,15 25,40 40,40 -15,0 -40,25 -40,40 0,-15 -25,-40 -40,-40 15,0 40,-25 40,-40 z'

const base = (o = {}) => {
  const { fill = 'var(--friend)', stroke = 'var(--sym)', sw = 4, dash = '', glyph = 'var(--sym)', op = 1 } = o
  return `<g opacity="${op}"><circle cx="100" cy="100" r="60" style="fill:${fill};stroke:${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/><path d="${GLYPH}" style="fill:${glyph};stroke:${glyph}" stroke-width="3"/></g>`
}
const txt = (x, y, s, anchor = 'start', size = 34, extra = '') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-family="Arial, Helvetica, sans-serif" style="fill:var(--sym)" ${extra}>${s}</text>`
const dot = (x, y, r, fill, stroke = 'var(--halo)', sw = 5, cls = '') =>
  `<circle cx="${x}" cy="${y}" r="${r}" class="${cls}" style="fill:${fill};stroke:${stroke}" stroke-width="${sw}"/>`
const ring = (r, stroke, sw, extra = '', cls = '') =>
  `<circle cx="100" cy="100" r="${r}" class="${cls}" fill="none" style="stroke:${stroke}" stroke-width="${sw}" ${extra}/>`
const BEAT = 'l8,-24 l10,44 l8,-30 l6,10'
// Corner badge whose shape carries the state: circle, triangle, square.
const shapeBadge = (s, k) =>
  (k === 'online' ? dot(150, 50, 17, s.c, 'var(--halo)', 4) : k === 'stale' ? `<path d="M150,28 L172,66 L128,66 z" stroke-linejoin="round" style="fill:${s.c};stroke:var(--halo)" stroke-width="4"/>` : `<rect x="133" y="33" width="34" height="34" style="fill:${s.c};stroke:var(--halo)" stroke-width="4"/>`)

// Per-state drawing parameters. `label`/`short` are the words drawn on the
// symbol; they stay in English in both languages, as map labels would.
export const STATES = {
  online: { ago: '12 s', dtg: '131042Z', c: 'var(--ok)', soft: 'var(--ok-soft)', std: 'var(--std-ok)', frac: 0.9, bars: 4, arcs: 3, hist: [1, 1, 1, 1, 1], speed: '', label: 'ONLINE', short: 'ON' },
  stale: { ago: '4 min', dtg: '131038Z', c: 'var(--warn)', soft: 'var(--warn-soft)', std: 'var(--std-warn)', frac: 0.3, bars: 2, arcs: 1, hist: [1, 1, 1, 0, 0], speed: ' slow', label: 'STALE', short: 'LATE' },
  offline: { ago: '2 h', dtg: '130842Z', c: 'var(--off)', soft: 'var(--off-soft)', std: 'var(--std-off)', frac: 0, bars: 0, arcs: 0, hist: [0, 0, 0, 0, 0], speed: '', label: 'OFFLINE', short: 'OFF' },
}

export const STATE_KEYS = Object.keys(STATES)

// What a variant looks like at fleet scale: `count` copies of its symbol,
// shrunk and scattered over the swatch's 1620×320 (3 × 540:320) area, each in
// a random state and with a random `--d` so animations drift out of phase.
// Positions are free-form rather than gridded, but each copy keeps a minimum
// gap so frames don't sit on top of each other (relaxed after enough misses
// so placement always finishes). Random per page load, so the spread differs
// on every visit.
export const CROWD_SIZE = 34
const CROWD_SCALE = 0.5
const CROWD_STATES = [...Array(6).fill('online'), ...Array(3).fill('stale'), 'offline']
export const drawCrowd = (draw, count) => {
  const margin = 70 * CROWD_SCALE
  const between = (lo, hi) => lo + Math.random() * (hi - lo)
  const points = []
  let gap = 150 * CROWD_SCALE
  for (let misses = 0; points.length < count; ) {
    const x = between(margin, 1620 - margin)
    const y = between(margin, 320 - margin)
    if (points.every(([px, py]) => Math.hypot(px - x, py - y) >= gap)) {
      points.push([x, y])
    } else if (++misses % 200 === 0) {
      gap *= 0.9
    }
  }
  return points
    .map(([x, y]) => {
      const key = CROWD_STATES[Math.floor(Math.random() * CROWD_STATES.length)]
      return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${CROWD_SCALE}) translate(-100,-100)" style="--d:${(-Math.random() * 3).toFixed(2)}s">${draw(STATES[key], key)}</g>`
    })
    .join('')
}

// `k` marks whether the variant uses a field APP-6D already defines ('std') or
// is an app-side convention ('app'). `t` are trait tags, keyed into `traits`.
// An optional `no` in the copy marks the variant as not recommended and gives
// the reason; the page crosses out the whole tile.
// Each `draw(state, key)` gets a STATES entry and its key.
export const GROUPS = [
  {
    id: 'standard',
    uk: { title: 'Стандартні поля символу', note: 'Ці варіанти використовують позиції, які APP-6D вже визначає, тож milsymbol може намалювати більшість із них прямо з SIDC або своїх опцій.' },
    en: { title: 'Standard symbol fields', note: 'These use positions APP-6D already defines, so milsymbol can draw most of them from the SIDC or its options.' },
    items: [
      {
        k: 'std', t: ['colourOnly'],
        uk: { n: 'Смуга стану', d: 'Цифра статусу 2 малює зелену смугу «Fully Capable» під рамкою. Для «застарілого» та «офлайн» позичаємо жовту й червону смуги.' },
        en: { n: 'Condition bar', d: 'Status digit 2 draws the green Fully Capable bar under the frame. Stale and offline borrow the yellow and red bars.' },
        draw: (s) => base() + `<rect x="40" y="168" width="120" height="22" style="fill:${s.std};stroke:var(--sym)" stroke-width="4"/>`,
      },
      {
        k: 'std', t: ['twoStates'],
        uk: { n: 'Пунктирна рамка', d: 'Цифра статусу 1 (Anticipated) робить рамку пунктирною, коли зв’язок втрачено. Онлайн — суцільна рамка, тож у «застарілого» власного вигляду немає.' },
        en: { n: 'Dashed frame', d: 'Status digit 1 (Anticipated) dashes the frame when the link is lost. Online is a solid frame, so stale has no look of its own.' },
        draw: (s, k) => base({ dash: k === 'offline' ? '13 10' : '' }),
      },
      {
        k: 'std', t: [],
        uk: { n: 'Текстова мітка', d: 'Саме слово в полі H (додаткова інформація) праворуч від рамки.' },
        en: { n: 'Text label', d: 'The word itself in field H, additional information, to the right of the frame.' },
        draw: (s) => base() + txt(180, 112, s.label),
      },
      {
        k: 'std', t: [],
        uk: { n: 'DTG останнього контакту', d: 'Поле W (дата-час) зліва вгорі: час останнього пінгу за Зулу. Віднімати доводиться читачеві.', no: 'Як допоміжна деталь — так, але не як основний спосіб показати, чи сенсор онлайн: щоб зрозуміти стан, треба прочитати час і порахувати в голові.' },
        en: { n: 'Last-contact DTG', d: 'Field W, date-time group, top left: the Zulu time of the last ping. The reader does the subtraction.', no: 'Fine as a supporting detail, but not as the main way to show whether the sensor is online: you have to read the time and do the maths to know the state.' },
        draw: (s) => base() + txt(20, 52, s.dtg, 'end'),
      },
      {
        k: 'std', t: [],
        uk: { n: 'Час від останнього пінгу', d: 'Поле G (коментарі штабу): скільки минуло від останнього пінгу, вже пораховано.' },
        en: { n: 'Time-since-last-ping label', d: 'Field G, staff comments: elapsed time since the last ping, already subtracted.' },
        draw: (s) => base() + txt(180, 82, s.ago),
      },
      {
        k: 'std', t: [],
        uk: { n: 'Верхня смуга', d: 'Місце смуги ураження над рамкою, використане під стан зв’язку: короткий код і колір заливки.', no: 'Позиція стандартна, а значення — ні. У APP-6D ця смуга (поле AO) показує стан ураження цілі, тож оператор прочитає її як дані про бій, а не про зв’язок.' },
        en: { n: 'Top bar', d: 'The engagement bar slot above the frame, reused for link state with a short code and a fill colour.', no: 'The slot is standard, the meaning is not. In APP-6D this bar (field AO) carries target engagement status, so an operator will read it as combat data, not link state.' },
        draw: (s) => base() + `<rect x="40" y="3" width="120" height="30" style="fill:${s.soft};stroke:var(--sym)" stroke-width="4"/>` + txt(100, 27, s.short, 'middle', 23, 'font-weight="bold"'),
      },
      {
        k: 'std', t: ['absenceOnline'],
        uk: { n: 'Діагоналі для проблем', d: 'Стандартна альтернатива смузі: одна риска для «застарілого», хрест для «офлайн». Чистий символ означає онлайн.', no: 'У APP-6D одна риска означає «Damaged», а хрест — «Destroyed». Перекреслений сенсор читається як знищений, а не як такий, що мовчить.' },
        en: { n: 'Diagonals for trouble', d: 'The standard alternative to the bar: one slash when stale, a cross when offline. A clean symbol means online.', no: 'In APP-6D one slash means Damaged and a cross means Destroyed. A crossed-out sensor reads as destroyed, not as silent.' },
        draw: (s, k) => base() + (k !== 'online' ? `<path d="M30,170 L170,30${k === 'offline' ? ' M30,30 L170,170' : ''}" fill="none" style="stroke:var(--sym)" stroke-width="7"/>` : ''),
      },
    ],
  },
  {
    id: 'colour',
    uk: { title: 'Колір на символі', note: 'Прийоми застосунку, що перефарбовують або доповнюють символ. Малювати дешево, але більшість покладається лише на колір.' },
    en: { title: 'Colour on the symbol', note: 'App conventions that recolour or decorate the symbol. Cheap to draw, but most of them rely on colour alone.' },
    items: [
      {
        k: 'app', t: ['colourOnly'],
        uk: { n: 'Зелена крапка', d: 'Крапка стану в правому верхньому куті з білим обідком, щоб читалась на будь-якому тайлі мапи.' },
        en: { n: 'Green dot', d: 'A status dot on the top-right corner with a white ring so it holds on any map tile.' },
        draw: (s) => base() + dot(150, 50, 17, s.c),
      },
      {
        k: 'app', t: ['colourOnly'],
        uk: { n: 'Внутрішня крапка', d: 'Маленька крапка всередині рамки. Ніщо не виходить за межі символу, тож зона кліку й кластеризація не змінюються.' },
        en: { n: 'Inset dot', d: 'A small dot inside the frame. Nothing grows outside the symbol, so the click target and clustering stay unchanged.' },
        draw: (s) => base() + dot(137, 63, 9, s.c, 'var(--sym)', 2),
      },
      {
        k: 'app', t: ['colourOnly'],
        uk: { n: 'Колір рамки', d: 'Контур рамки набуває кольору стану. Приналежність досі читається із заливки та форми.', no: 'Порушує APP-6D: рамка має бути чорною, а колір рамки в стандарті вже має власне значення — ним позначають приналежність, коли символ без заливки.' },
        en: { n: 'Frame colour', d: 'The frame outline takes the state colour. Affiliation still reads from the fill and shape.', no: 'Breaks APP-6D: the frame is meant to be black, and frame colour already has a meaning in the standard: it carries affiliation when a symbol is unfilled.' },
        draw: (s) => base({ stroke: s.c, sw: 8 }),
      },
      {
        k: 'app', t: ['absenceOnline'],
        uk: { n: 'Згасання заливки', d: 'Блакитна «дружня» заливка блідне, коли дані застарілі, і сіріє в офлайні. Трохи жертвуємо кольором приналежності.', no: 'Погано читається: бліда заливка ледь відрізняється від нормальної, а на світлих тайлах мапи символ просто губиться.' },
        en: { n: 'Fill fades', d: 'The friendly blue fill pales when stale and turns grey when offline. Costs some affiliation colour.', no: 'Poor legibility: the paled fill is barely distinguishable from the normal one, and on light map tiles the symbol just gets lost.' },
        draw: (s, k) => base({ fill: k === 'online' ? 'var(--friend)' : k === 'stale' ? 'var(--friend-dim)' : 'var(--dead)' }),
      },
      {
        k: 'app', t: ['colourOnly'],
        uk: { n: 'Колір гліфа', d: 'Гліф сенсора всередині рамки малюється кольором стану.', no: 'Порушує колірні конвенції APP-6D: іконка всередині рамки має бути чорною, а колір у символі зарезервований за приналежністю.' },
        en: { n: 'Glyph colour', d: 'The sensor glyph inside the frame is drawn in the state colour.', no: 'Breaks APP-6D colour conventions: the icon inside the frame is meant to be black, and colour on the symbol is reserved for affiliation.' },
        draw: (s) => base({ glyph: s.c }),
      },
      {
        k: 'app', t: ['colourOnly'],
        uk: { n: 'Зовнішнє кільце', d: 'Статичне кольорове кільце навколо рамки. Конкурує з кільцем виділення, якщо воно теж кругле.' },
        en: { n: 'Outer ring', d: 'A static coloured ring around the frame. Competes with the selection ring if that is also a circle.' },
        draw: (s) => ring(73, s.c, 6) + base(),
      },
      {
        k: 'app', t: ['absenceOnline'],
        uk: { n: 'Прозорість', d: 'Увесь символ згасає з віком зв’язку. Офлайн-пристрої відходять на задній план — і через це їх легко пропустити.' },
        en: { n: 'Opacity', d: 'The whole symbol fades with link age. Offline devices recede, which also makes them easy to miss.' },
        draw: (s, k) => base({ op: k === 'online' ? 1 : k === 'stale' ? 0.55 : 0.28 }),
      },
    ],
  },
  {
    id: 'motion',
    uk: { title: 'Рух', note: 'Анімовані варіанти. Кожен сповільнюється, коли дані застарілі, і зупиняється в офлайні.' },
    en: { title: 'Motion', note: 'Animated treatments. Each slows down when stale and stops when offline.' },
    items: [
      {
        k: 'app', t: ['motion'],
        uk: { n: 'Пульсуюче гало', d: 'Кільце розходиться від рамки й тане. Читається як «живий» з іншого кінця кімнати.', no: 'Офлайн не впізнати однозначно: без гало сенсор виглядає так само, як онлайн-сенсор між двома імпульсами.' },
        en: { n: 'Pulsing halo', d: 'A ring expands from the frame and fades. Reads as "alive" from across the room.', no: 'Offline is not unambiguous: with no halo the sensor looks just like an online one between two pulses.' },
        draw: (s, k) => (k !== 'offline' ? ring(60, s.c, 7, '', 'a pulse' + s.speed) : '') + base(),
      },
      {
        k: 'app', t: ['motion'],
        uk: { n: 'Сонарні кільця', d: 'Три тонкі кільця зі зсувом, як у передавача. Одне повільне кільце, коли дані застарілі.' },
        en: { n: 'Sonar rings', d: 'Three thin staggered rings, like a transmitter. One slow ring when stale.' },
        draw: (s, k) => (k === 'online' ? [0, 0.6, 1.2].map((d) => ring(60, s.c, 3, `style="stroke:${s.c};animation-delay:${d}s"`, 'a pulse')).join('') : k === 'stale' ? ring(60, s.c, 3, '', 'a pulse slow') : '') + base(),
      },
      {
        k: 'app', t: ['motion', 'colourOnly'],
        uk: { n: 'Блимаючий світлодіод', d: 'Кутова крапка блимає, як світлодіод серцебиття: швидко онлайн, повільно для застарілих, рівна сіра в офлайні.' },
        en: { n: 'Blinking LED', d: 'The corner dot blinks like a heartbeat LED: fast online, slow when stale, steady grey when offline.' },
        draw: (s, k) => base() + dot(150, 50, 15, k === 'offline' ? 'var(--dead)' : s.c, 'var(--sym)', 2, k === 'offline' ? '' : 'blink' + s.speed),
      },
      {
        k: 'app', t: ['motion'],
        uk: { n: 'Кардіограма', d: 'Лінія ЕКГ під символом: два удари онлайн, один для застарілих, пряма в офлайні. Стан несе форма.' },
        en: { n: 'Heartbeat trace', d: 'An ECG line under the symbol: two beats online, one when stale, flat when offline. The shape carries the state.' },
        draw: (s, k) => base() + `<path pathLength="100" class="${k === 'offline' ? '' : 'trace' + s.speed}" fill="none" stroke-linejoin="round" style="stroke:${s.c}" stroke-width="5" d="M20,190 ${k === 'offline' ? 'H180' : k === 'stale' ? `H60 ${BEAT} H180` : `H60 ${BEAT} H120 ${BEAT} H180`}"/>`,
      },
      {
        k: 'app', t: ['motion'],
        uk: { n: 'Обертове кільце', d: 'Пунктирне кільце крутиться, поки надходять пінги, сповільнюється для застарілих і завмирає сірим, коли пристрій мовчить.' },
        en: { n: 'Rotating ring', d: 'A dashed ring turns while pings arrive, slows when stale and freezes in grey when the device is silent.' },
        draw: (s, k) => ring(74, k === 'offline' ? 'var(--track)' : s.c, 5, 'stroke-dasharray="18 13"', k === 'offline' ? '' : 'a spin' + s.speed) + base(),
      },
      {
        k: 'app', t: ['motion', 'colourOnly'],
        uk: { n: 'Дихальне світіння', d: 'М’який диск за рамкою то світлішає, то тьмяніє. Тихіше за гало, і зникає в офлайні.' },
        en: { n: 'Breathing glow', d: 'A soft disc behind the frame brightens and dims. Quieter than a halo, and gone when offline.' },
        draw: (s, k) => (k !== 'offline' ? `<circle cx="100" cy="100" r="82" class="breath${s.speed}" style="fill:${s.c}"/>` : '') + base(),
      },
    ],
  },
  {
    id: 'meters',
    uk: { title: 'Індикатори', note: 'Варіанти, що показують, наскільки зв’язок якісний або свіжий, а не лише чи він є.' },
    en: { title: 'Meters', note: 'Treatments that show how good or how fresh the link is, not only whether it exists.' },
    items: [
      {
        k: 'app', t: [],
        uk: { n: 'Смужки сигналу', d: 'Смужки як у телефоні біля рамки. Знайомі всім, і кількість смужок працює без кольору.' },
        en: { n: 'Signal bars', d: 'Phone-style bars beside the frame. Familiar to everyone, and bar count works without colour.' },
        draw: (s) => base() + [0, 1, 2, 3].map((i) => `<rect x="${166 + i * 13}" y="${52 - (10 + i * 8)}" width="9" height="${10 + i * 8}" style="fill:${i < s.bars ? s.c : 'var(--halo)'};stroke:var(--sym)" stroke-width="1.5"/>`).join(''),
      },
      {
        k: 'app', t: [],
        uk: { n: 'Радіодуги', d: 'Дуги в стилі Wi-Fi над рамкою. Що слабший зв’язок, то менше дуг світиться.' },
        en: { n: 'Radio arcs', d: 'Wi-Fi style arcs above the frame. Fewer arcs light up as the link weakens.' },
        draw: (s) => base() + [12, 24, 36].map((r, i) => `<path d="M${100 - r * 0.707},${28 - r * 0.707} A${r},${r} 0 0 1 ${100 + r * 0.707},${28 - r * 0.707}" fill="none" stroke-linecap="round" style="stroke:${i < s.arcs ? s.c : 'var(--track)'}" stroke-width="6"/>`).join('') + dot(100, 28, 4, s.arcs ? s.c : 'var(--track)', 'none', 0),
      },
      {
        k: 'app', t: [],
        uk: { n: 'Кільце свіжості', d: 'Дуга навколо рамки спадає, поки час від останнього пінгу наближається до тайм-ауту, і знову заповнюється з наступним пінгом.' },
        en: { n: 'Freshness ring', d: 'An arc around the frame drains as the time since the last ping approaches the timeout, then refills on the next ping.' },
        draw: (s) => ring(74, 'var(--track)', 3) + ring(74, s.c, 8, `pathLength="100" stroke-dasharray="${s.frac * 100} 100" transform="rotate(-90 100 100)"`) + base(),
      },
      {
        k: 'app', t: [],
        uk: { n: 'Смуга свіжості', d: 'Той самий відлік у вигляді смуги під символом. Займає місце смуги стану, тож показати обидві не вийде.', no: 'Виглядає як прогрес-бар, тож смугу, що зменшується, читають як процес, який от-от завершиться, а не як зв’язок, що згасає.' },
        en: { n: 'Freshness bar', d: 'The same countdown as a bar under the symbol. Sits where the condition bar goes, so the two cannot both be shown.', no: 'It looks like a progress bar, so a shrinking bar reads as a process about to finish, not as a link fading out.' },
        draw: (s) => base() + `<rect x="40" y="170" width="120" height="14" style="fill:var(--halo);stroke:var(--sym)" stroke-width="2"/><rect x="41" y="171" width="${118 * s.frac}" height="12" style="fill:${s.c}"/>`,
      },
      {
        k: 'app', t: [],
        uk: { n: 'Історія пінгів', d: 'Останні п’ять очікуваних пінгів квадратиками, найновіший праворуч. Заповнений — отримано, порожній — пропущено. Видно «мерехтливий» зв’язок.', no: 'Додає когнітивного навантаження: без легенди незрозуміло, що означають квадратики і в який бік іде час.' },
        en: { n: 'Ping history', d: 'The last five expected pings as squares, newest on the right. Filled is received, empty is missed. Shows a flapping link.', no: 'Adds cognitive load: without a legend it is unclear what the squares mean or which way time runs.' },
        draw: (s) => base() + s.hist.map((h, i) => `<rect x="${42 + i * 24}" y="170" width="20" height="20" style="fill:${h ? 'var(--ok)' : 'var(--halo)'};stroke:var(--sym)" stroke-width="2"/>`).join(''),
      },
    ],
  },
  {
    id: 'labels',
    uk: { title: 'Мітки та бейджі', note: 'Прийоми застосунку, що поєднують колір зі словом, числом чи формою, тож стан читається і без кольору.' },
    en: { title: 'Labels and badges', note: 'App conventions that pair a word, number or shape with the colour, so the state survives without colour.' },
    items: [
      {
        k: 'app', t: [],
        uk: { n: 'Пігулка стану', d: 'Кольорова «пігулка» під символом зі станом, написаним словами.' },
        en: { n: 'Status pill', d: 'A coloured pill under the symbol with the state spelled out.' },
        draw: (s) => base() + `<rect x="33" y="170" width="134" height="36" rx="18" style="fill:${s.c}"/>` + `<text x="100" y="196" text-anchor="middle" font-size="22" font-weight="bold" letter-spacing="1" font-family="Arial, Helvetica, sans-serif" style="fill:var(--halo)">${s.label}</text>`,
      },
      {
        k: 'app', t: [],
        uk: { n: 'Чип часу', d: 'Годинник і час, що минув, у чипі з обводкою кольору стану. Працює там, де стандартні текстові поля вже зайняті.' },
        en: { n: 'Time chip', d: 'A clock and the elapsed time in a chip outlined in the state colour. Works where the standard text slots are already used.' },
        draw: (s) => base() + `<rect x="40" y="170" width="120" height="36" rx="6" style="fill:var(--halo);stroke:${s.c}" stroke-width="4"/><circle cx="62" cy="188" r="9" fill="none" style="stroke:var(--sym)" stroke-width="2.5"/><path d="M62,182 V188 H67" fill="none" style="stroke:var(--sym)" stroke-width="2.5"/>` + txt(79, 197, s.ago, 'start', 24),
      },
      {
        k: 'std', t: [],
        uk: { n: 'Позначення зі стрілкою зв’язку', d: 'Поле T (унікальне позначення) з маркером перед ним: стрілка вгору онлайн, риска для застарілих, стрілка вниз в офлайні.' },
        en: { n: 'Designation with link arrow', d: 'Field T, unique designation, with a marker before it: up arrow online, dash when stale, down arrow offline.' },
        draw: (s, k) => base() + txt(20, 160, 'S-07', 'end') + (k === 'online' ? `<path d="M-92,160 l15,-26 l15,26 z" style="fill:${s.c}"/>` : k === 'stale' ? `<rect x="-92" y="142" width="30" height="8" style="fill:${s.c}"/>` : `<path d="M-92,134 l15,26 l15,-26 z" style="fill:${s.c}"/>`),
      },
      {
        k: 'app', t: [],
        uk: { n: 'Бейдж з галочкою чи хрестиком', d: 'Кутовий бейдж із галочкою, знаком оклику чи хрестиком. Стан несе позначка, колір лише підсилює.' },
        en: { n: 'Tick or cross badge', d: 'A corner badge with a tick, an exclamation mark or a cross. The mark carries the state, the colour reinforces it.' },
        draw: (s, k) => base() + dot(150, 50, 19, s.c, 'var(--halo)', 4) + `<path fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--halo)" stroke-width="4.5" d="${k === 'online' ? 'M141,50 l6,7 l12,-14' : k === 'stale' ? 'M150,39 V52 M150,60 v.5' : 'M143,43 L157,57 M157,43 L143,57'}"/>`,
      },
      {
        k: 'app', t: [],
        uk: { n: 'Бейдж із кодуванням формою', d: 'Коло — онлайн, трикутник — застарілі дані, квадрат — офлайн. Три форми, що лишаються розрізнюваними в сірих тонах і на малому розмірі.' },
        en: { n: 'Shape-coded badge', d: 'Circle online, triangle stale, square offline. Three shapes that stay distinct in greyscale and at small sizes.' },
        draw: (s, k) => base() + shapeBadge(s, k),
      },
    ],
  },
]

// The shortlist combined into one tile: the shape badge (30) always, the
// time-since label (5) only once the link is in trouble, and a single halo
// pulse (15) per received ping rather than a continuous one.
export const PICK = {
  k: 'app', t: [],
  map: 30,
  uk: { n: 'Разом: 30 + 5 + 15', d: 'Бейдж формою показує стан завжди. Час від пінгу з’являється лише для застарілих і офлайн. Гало спалахує один раз на кожен отриманий пінг.' },
  en: { n: 'Together: 30 + 5 + 15', d: 'The shape badge always shows the state. Time since the ping appears only when stale or offline. The halo flashes once per received ping.' },
  draw: (s, k) => (k === 'online' ? ring(60, s.c, 7, '', 'a ping') : '') + base() + shapeBadge(s, k) + (k === 'online' ? '' : txt(180, 82, s.ago)),
}

// Post copy around the sheet. `published` is ISO so the page can format it
// per locale. Shortlist items reference tiles by their 1-based number.
export const POST = {
  published: '2026-10-15',
  sidc: [
    { key: 'SIDC', value: '10031500002201000000' },
    { key: 'Symbol set', value: '15' },
    { key: 'Entity', value: '220100 Sensor' },
    { key: 'Identity', value: '3 Friend' },
  ],
  uk: {
    eyebrow: 'APP-6D · Наземне обладнання · аркуш варіантів',
    title: 'Як показати на мапі, що сенсор онлайн',
    intro: ['Задача звучить просто: на мапі стоїть сенсор, він періодично надсилає пінг, і оператор має з першого погляду бачити, чи пристрій досі на зв’язку. Але сенсор — це не іконка в чаті, а дружній символ APP-6D, у якого майже кожна позиція навколо рамки вже щось означає.', 'Тож я зібрав тридцять способів показати стан зв’язку. Кожна плитка малює той самий символ у масштабі мапи й змінює лише позначення стану. Кожна плитка показує всі три стани поруч — онлайн, застарілий і офлайн, — щоб було видно, як варіант читається, коли зв’язок застаріває або зникає.'],
    states: {
      online: { label: 'Онлайн', ping: 'пінг 12 с тому' },
      stale: { label: 'Застарілий', ping: 'пінг 4 хв тому' },
      offline: { label: 'Офлайн', ping: 'пінг 2 год тому' },
    },
    kinds: { std: 'поле APP-6D', app: 'прийом застосунку' },
    rejected: 'не рекомендую',
    crowdCaption: (count) => `${count} ${{ one: 'сенсор', few: 'сенсори' }[new Intl.PluralRules('uk').select(count)] ?? 'сенсорів'}, стани випадкові`,
    filters: { count: 'Сенсорів на мапі', hideRejected: 'Сховати не рекомендовані' },
    traits: { colourOnly: 'лише колір', twoStates: 'два стани', absenceOnline: 'відсутність = онлайн', motion: 'рух' },
    shortlistTitle: 'Що б я обрав',
    pickTitle: 'Як це виглядає разом',
    shortlist: [
      {
        lead: 'Бейдж із кодуванням формою (30) як постійний стан.',
        body: 'Читається з першого погляду, не ламається для дальтоніків і на зеленому рельєфі, і не займає стандартні поля, які мають власне значення.',
      },
      { lead: 'Час від останнього пінгу (5) лише для застарілих і офлайн.', body: 'Онлайн-сенсору текст не потрібен. Мовчазному потрібна відповідь на «відколи», і поле G — стандартне місце для неї.' },
      { lead: 'Пульсуюче гало (15) — один раз на кожен отриманий пінг, а не безперервно.', body: 'Один імпульс підтверджує живий зв’язок, не перетворюючи мапу на суцільний рух.' },
    ],
    limitsTitle: 'Обмеження, які варто перевірити спершу',
    limits: ['Кольори смуги в стандарті описують боєздатність. Жовтий означає «Damaged», червоний — «Destroyed», тож використання їх для стану зв’язку змінює значення для кожного, кого навчали APP-6D.', 'Канвас мапи в застосунку сьогодні не малює смугу стану для символів, що не є мінами. Варіантам 1 і 6 потрібен SVG-шлях або новий код для канвасу.', 'Варіанти лише з кольором не працюють для людей з червоно-зеленим дальтонізмом і втрачають контраст на зелених тайлах мапи.', 'Безперервний рух потребує перемальовування кожного кадру на канвасі OpenLayers. Вартість росте з кількістю сенсорів на екрані.'],
  },
  en: {
    eyebrow: 'APP-6D · Land Equipment · option sheet',
    title: 'Showing that a sensor is online',
    intro: ['The problem sounds simple: a sensor sits on the map, it pings every so often, and an operator should see at a glance whether it is still reachable. But the sensor is not a chat avatar. It is a friendly APP-6D symbol, and almost every position around its frame already means something.', 'So I put together thirty ways to show link state. Every tile draws the same symbol at map scale and changes only the status treatment. Each tile shows all three states side by side (online, stale and offline) so you can see how it reads when the link goes stale or drops.'],
    states: {
      online: { label: 'Online', ping: 'ping 12 s ago' },
      stale: { label: 'Stale', ping: 'ping 4 min ago' },
      offline: { label: 'Offline', ping: 'ping 2 h ago' },
    },
    kinds: { std: 'APP-6D field', app: 'app convention' },
    rejected: 'not recommended',
    crowdCaption: (count) => `${count} sensors, random states`,
    filters: { count: 'Sensors on the map', hideRejected: 'Hide not recommended' },
    traits: { colourOnly: 'colour only', twoStates: 'two states', absenceOnline: 'absence = online', motion: 'motion' },
    shortlistTitle: 'What I would pick',
    pickTitle: 'How it looks together',
    shortlist: [
      { lead: 'Shape-coded badge (30) as the steady state.', body: 'It reads at a glance, survives colour-blindness and green terrain, and leaves the standard fields free for what they mean.' },
      { lead: 'Time-since label (5) for stale and offline only.', body: 'An online sensor needs no text. A silent one needs the answer to "since when", and field G is a standard slot for it.' },
      { lead: 'Pulsing halo (15) once per received ping, not continuously.', body: 'A single pulse confirms a live link without a map full of permanent motion.' },
    ],
    limitsTitle: 'Limits to check first',
    limits: ["The standard's bar colours describe capability. Yellow means Damaged and red means Destroyed, so using them for link state changes their meaning for anyone trained on APP-6D.", "The app's map canvas does not draw the condition bar for non-mine symbols today. Variants 1 and 6 need the SVG path or new canvas code.", 'Colour-only variants fail for red-green colour-blind users and lose contrast on green map tiles.', 'Continuous motion needs a redraw every frame on an OpenLayers canvas. Cost grows with the number of sensors on screen.'],
  },
}
