export interface Photo {
  src: string
  caption?: string
  date?: string
  location?: string
  orientation: 'portrait' | 'landscape' | 'square'
  polaroid?: boolean
  rotate?: number
  note?: string
  col?: number
  row?: number
  colSpan?: number
  rowSpan?: number
}

export interface TimelineEntry {
  year: string
  photo: Photo
  text: string
}

export interface FavoriteThing {
  icon: string
  label: string
  detail: string
}

export interface WallNote {
  text: string
  top: string
  left: string
  rotate: number
}

const photo = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export const heroName = 'SANTOSHI'
export const heroTagline = 'another year of being wonderfully you'
export const heroKicker = 'In full bloom'
export const scrollHint = 'scroll gently'
export const loadingLabel = 'opening'

export const introHeading = 'Today is about you.'
export const introBody =
  'Not the noise around the day, and not a list of things to become. Just you — the way you arrive, the way you stay, the way a room softens when you are in it.'

export const introPhoto: Photo = {
  src: photo('santoshi-portrait-morning', 900, 1200),
  caption: 'Morning light, and you already laughing at something small',
  date: 'March',
  location: 'the kitchen window',
  orientation: 'portrait',
}

export const galleryHeading = 'A little collection of us'
export const galleryLede = 'Not every picture. Only the ones I keep coming back to.'

export const galleryPhotos: Photo[] = [
  {
    src: photo('santoshi-porch', 900, 1200),
    caption: 'The porch, before anyone else was awake',
    date: 'April 2023',
    location: 'home',
    orientation: 'portrait',
    polaroid: true,
    rotate: -2.5,
    col: 1,
    row: 1,
    colSpan: 5,
    rowSpan: 5,
  },
  {
    src: photo('santoshi-train', 1400, 900),
    caption: 'Your reflection in the train window, halfway to somewhere',
    date: 'June 2022',
    location: 'between stations',
    orientation: 'landscape',
    rotate: 1,
    col: 6,
    row: 1,
    colSpan: 7,
    rowSpan: 3,
  },
  {
    src: photo('santoshi-kitchen', 1000, 1000),
    caption: 'Flour on the counter and no plan to clean it yet',
    date: 'November',
    location: 'the small kitchen',
    orientation: 'square',
    rotate: 2.5,
    col: 6,
    row: 4,
    colSpan: 4,
    rowSpan: 2,
  },
  {
    src: photo('santoshi-rain', 900, 1200),
    caption: 'You, under a borrowed raincoat, refusing to hurry',
    date: 'August 2024',
    location: 'the old market',
    orientation: 'portrait',
    rotate: -1,
    col: 10,
    row: 4,
    colSpan: 3,
    rowSpan: 2,
  },
  {
    src: photo('santoshi-river', 1400, 900),
    caption: 'The long way along the river, because the short way was dull',
    date: 'January 2025',
    location: 'the river path',
    orientation: 'landscape',
    rotate: 0.6,
    col: 1,
    row: 6,
    colSpan: 7,
    rowSpan: 3,
  },
  {
    src: photo('santoshi-evening', 900, 1200),
    caption: 'Evening, and the string lights just coming on',
    date: 'October 2021',
    location: 'the courtyard',
    orientation: 'portrait',
    polaroid: true,
    rotate: 2,
    col: 8,
    row: 6,
    colSpan: 5,
    rowSpan: 6,
  },
  {
    src: photo('santoshi-tea', 1000, 1000),
    caption: 'Two cups, and the conversation that outlasted them',
    date: 'February',
    location: 'the corner table',
    orientation: 'square',
    rotate: -3,
    col: 1,
    row: 9,
    colSpan: 4,
    rowSpan: 3,
  },
  {
    src: photo('santoshi-books', 1000, 1000),
    caption: 'You reading the last page first, as usual',
    date: 'May 2020',
    location: 'the bookshop',
    orientation: 'square',
    rotate: 1.5,
    col: 5,
    row: 9,
    colSpan: 3,
    rowSpan: 3,
  },
  {
    src: photo('santoshi-winter', 1400, 900),
    caption: 'A cold street, and your scarf doing most of the talking',
    date: 'December 2023',
    location: 'downtown',
    orientation: 'landscape',
    rotate: -1,
    col: 1,
    row: 12,
    colSpan: 7,
    rowSpan: 3,
  },
  {
    src: photo('santoshi-lily-table', 900, 1200),
    caption: 'The lily you kept in a glass until it finally opened',
    date: 'this spring',
    location: 'the windowsill',
    orientation: 'portrait',
    polaroid: true,
    rotate: -2,
    col: 8,
    row: 12,
    colSpan: 5,
    rowSpan: 4,
  },
]

export const cinematicPhoto: Photo = {
  src: photo('santoshi-forever', 1800, 1200),
  caption: 'A quiet afternoon we did not know we would want back',
  date: 'September',
  location: 'the garden steps',
  orientation: 'landscape',
}

export const cinematicLine = 'Some moments deserve to stay forever.'

export const lilyHeading = 'Why lilies?'
export const lilyBody =
  'A lily does not announce itself. It returns when the year turns, stays closed until it is ready, and opens without hurry. That is the birthday I want for you: not a spectacle, a returning. Quiet beauty, kept, and allowed to open slowly.'

export const horizontalHeading = 'Hold these a moment longer'
export const horizontalLede = 'nothing urgent, just stay'

export const horizontalMemories: Photo[] = [
  {
    src: photo('santoshi-h-dawn', 900, 1100),
    caption: 'You tying your hair with the day still blue',
    date: '12 April',
    location: 'the terrace',
    orientation: 'portrait',
    note: 'I still think of this light',
  },
  {
    src: photo('santoshi-h-road', 1200, 900),
    caption: 'The detour you insisted on, correctly',
    date: '3 July 2022',
    location: 'coast road',
    orientation: 'landscape',
    note: 'worth every extra mile',
  },
  {
    src: photo('santoshi-h-table', 1000, 1000),
    caption: 'Dinner that became a map of future plans',
    date: '19 November',
    location: 'the little place',
    orientation: 'square',
    note: 'we ordered too much',
  },
  {
    src: photo('santoshi-h-rain', 900, 1100),
    caption: 'Sharing one umbrella and neither of us dry',
    date: '28 August',
    location: 'after the film',
    orientation: 'portrait',
    note: 'you laughed the whole way',
  },
  {
    src: photo('santoshi-h-letter', 1000, 1000),
    caption: 'A note you left where I would find it late',
    date: '2 January 2024',
    location: 'the desk',
    orientation: 'square',
    note: 'I kept the paper',
  },
  {
    src: photo('santoshi-h-field', 1200, 900),
    caption: 'Sitting in the grass until the light left',
    date: '16 May',
    location: 'the open field',
    orientation: 'landscape',
    note: 'stay a little longer',
  },
]

export const timelineHeading = 'Years I don’t want to lose'
export const timelineLede = 'Not a whole life. Just the turns I can still feel.'

export const timeline: TimelineEntry[] = [
  {
    year: '2018',
    photo: {
      src: photo('santoshi-y-2018', 900, 1100),
      caption: 'The first afternoon that ran too long',
      date: '2018',
      orientation: 'portrait',
    },
    text: 'We were supposed to stay an hour. The light moved across the table, and neither of us stood up. I think that was the start — not a decision, just a reluctance to leave.',
  },
  {
    year: '2020',
    photo: {
      src: photo('santoshi-y-2020', 1100, 800),
      caption: 'A call that turned into the whole evening',
      date: '2020',
      orientation: 'landscape',
    },
    text: 'The year went quiet, and you did not. You sent songs, small reports from your window, and the kind of messages that made a closed-in day feel visited.',
  },
  {
    year: '2022',
    photo: {
      src: photo('santoshi-y-2022', 900, 1100),
      caption: 'A trip with no itinerary worth the name',
      date: '2022',
      location: 'out of town',
      orientation: 'portrait',
    },
    text: 'We missed a train and gained a morning. You treated the delay like a gift. I have been trying to learn that from you ever since.',
  },
  {
    year: '2024',
    photo: {
      src: photo('santoshi-y-2024', 1000, 1000),
      caption: 'The plant you swore you would not name',
      date: '2024',
      orientation: 'square',
    },
    text: 'You named it anyway. You keep things alive without making a performance of care. I notice, even when you pretend it is nothing.',
  },
  {
    year: '2026',
    photo: {
      src: photo('santoshi-y-2026', 900, 1100),
      caption: 'This year, still unfolding',
      date: '2026',
      orientation: 'portrait',
      polaroid: true,
      rotate: -1.5,
    },
    text: 'Another turn of the year, and you are still the person I want to tell the ordinary things. That feels like the rare part. Happy birthday.',
  },
]

export const favoritesHeading = 'Things I associate with you'
export const favoritesLede = 'Not a list of facts. More like objects that enter the room when you do.'

export const favoriteThings: FavoriteThing[] = [
  {
    icon: 'lily',
    label: 'Lilies',
    detail: 'You notice a flower before anyone else, and you let it open on its own time.',
  },
  {
    icon: 'music',
    label: 'Quiet songs',
    detail: 'The ones you play a little too softly, as if they are meant for the room and not the street.',
  },
  {
    icon: 'bowl',
    label: 'Late bowls',
    detail: 'Dinner that was only going to be simple, until the talking made it a second sitting.',
  },
  {
    icon: 'palette',
    label: 'Color on your hands',
    detail: 'A little unfinished, always. You leave a trace of whatever you were making.',
  },
  {
    icon: 'film',
    label: 'Light, remembered',
    detail: 'You talk about afternoons the way other people talk about plots. The light is the point.',
  },
  {
    icon: 'cup',
    label: 'Morning tea',
    detail: 'Unhurried, even on days that are not. The cup is an argument for staying put.',
  },
  {
    icon: 'plush',
    label: 'The soft thing',
    detail: 'It lives on your chair and has never once been called childish in your house.',
  },
  {
    icon: 'laugh',
    label: 'That laugh',
    detail: 'It arrives a second late, like you tried to be composed, and then it stays.',
  },
]

export const wallHeading = 'Pinned up, the way memory does'
export const wallLede = 'A little crooked. Held with tape. Kept anyway.'

export const wallPhotos: Photo[] = [
  {
    src: photo('santoshi-w-1', 800, 1000),
    caption: 'Sun on the floorboards',
    orientation: 'portrait',
    rotate: -4,
  },
  {
    src: photo('santoshi-w-2', 1100, 800),
    caption: 'The road we walked twice',
    orientation: 'landscape',
    rotate: 3,
  },
  {
    src: photo('santoshi-w-3', 900, 900),
    caption: 'Your handwriting on a receipt',
    orientation: 'square',
    rotate: -2,
  },
  {
    src: photo('santoshi-w-4', 800, 1040),
    caption: 'A coat on the back of a chair',
    orientation: 'portrait',
    rotate: 5,
  },
  {
    src: photo('santoshi-w-5', 1100, 780),
    caption: 'Rain on the cafe glass',
    orientation: 'landscape',
    rotate: -5,
  },
  {
    src: photo('santoshi-w-6', 860, 860),
    caption: 'The plant, still living',
    orientation: 'square',
    rotate: 2.5,
  },
  {
    src: photo('santoshi-w-7', 800, 1060),
    caption: 'You, mid-sentence',
    orientation: 'portrait',
    rotate: -3.5,
  },
  {
    src: photo('santoshi-w-8', 1000, 760),
    caption: 'The last of the evening',
    orientation: 'landscape',
    rotate: 4,
  },
]

export const wallNotes: WallNote[] = [
  { text: 'still laughing', top: '8%', left: '46%', rotate: -8 },
  { text: 'don’t tidy this', top: '38%', left: '6%', rotate: 6 },
  { text: 'keep the light', top: '62%', left: '58%', rotate: -4 },
  { text: 'for later', top: '18%', left: '78%', rotate: 7 },
]

export const letterText = `Dear Santoshi,

I hope this year meets you gently. Not in a rush, and not asking you to be anyone other than the person you already are when the room gets quiet.

You have a way of making ordinary days feel kept — a walk that runs long, a joke told twice, a lily left in a glass until it opens. I notice it every time.

Thank you for the patience, the warmth, and the particular light you bring into a day. I am glad to be here for another turn around the sun with you.

With love`

export const finalMessage = {
  line1: 'Here’s to another year of you.',
  line2: 'Happy Birthday, Santoshi ♡',
  line3: 'Thank you for being one of my favourite parts of life.',
}

export function allImageSrcs(): string[] {
  const srcs = [
    introPhoto.src,
    cinematicPhoto.src,
    ...galleryPhotos.map((item) => item.src),
    ...horizontalMemories.map((item) => item.src),
    ...timeline.map((item) => item.photo.src),
    ...wallPhotos.map((item) => item.src),
  ]
  return [...new Set(srcs)]
}
