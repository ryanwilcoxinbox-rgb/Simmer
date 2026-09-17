import {
  FISH_TEMPS,
  MINCE_TEMPS,
  PORK_TEMPS,
  POULTRY_TEMPS,
  type Temperature,
} from './meats'

/**
 * Things to cook on a barbecue.
 *
 * Two genuinely different kinds of item live here, and the difference is the
 * whole reason this file is shaped the way it is:
 *
 * - **Preference cuts.** Whole cuts of beef and lamb, which only carry
 *   bacteria on the outside and so can be eaten pink. You choose how you want
 *   them. Timing is computed from thickness, because for a flat cut thickness
 *   is what decides everything.
 *
 * - **Cooked-through items.** Pork, chicken, skewers, sausages and fish, which
 *   have a safe temperature rather than a choice. Timing is tabulated per size,
 *   because a whole chicken has no meaningful "thickness" and a drumstick is
 *   not a flat cut.
 *
 * The brief is explicit that these two must never be presented alike, and
 * skewers are the nastiest trap: running a skewer through a whole cut drags
 * surface bacteria into the middle, so pinchos are cooked through even when
 * made from beef that would have been fine pink as a steak.
 */

export type BbqCategory = 'Beef' | 'Lamb' | 'Pork' | 'Chicken' | 'Fish' | 'Other'

/** How the fire is arranged. */
export type BbqMethod = 'direct' | 'two-zone' | 'indirect'

export const METHOD_NAMES: Record<BbqMethod, string> = {
  direct: 'Straight over the coals',
  'two-zone': 'Two zones, hot and cool',
  indirect: 'Away from the coals, lid down',
}

export interface BbqSize {
  label: string
  /** Our estimate of minutes over the heat. */
  minutes: number
  restMinutes: number
}

interface Common {
  id: string
  name: string
  alsoKnownAs?: string
  category: BbqCategory
  description: string
  advice: string
  /** Seconds between turns, where turning matters. */
  turnEverySeconds?: number
}

/** A flat cut of beef or lamb: you choose the doneness, thickness sets the time. */
export interface PreferenceItem extends Common {
  kind: 'preference'
  /** Thicknesses to offer, in centimetres. First is the default. */
  thicknessesCm: number[]
  /** Doneness id from STEAK_DONENESS that suits this cut. */
  suits: string
}

/** Anything that must be cooked through. No doneness choice, ever. */
export interface CookedThroughItem extends Common {
  kind: 'cooked-through'
  temperatures: Temperature[]
  method: BbqMethod
  sizes: BbqSize[]
  /** Why this one has no doneness choice. Shown to the user. */
  whyThrough: string
}

export type BbqItem = PreferenceItem | CookedThroughItem

export const BBQ_ITEMS: BbqItem[] = [
  /* ---- Beef ---- */
  {
    kind: 'preference',
    id: 'picana',
    name: 'Picaña',
    alsoKnownAs: 'Picanha, rump cap, culotte',
    category: 'Beef',
    description:
      'Rump cap with the fat still on top. The fat is the whole point: it bastes the meat as it renders, so it is never trimmed off.',
    thicknessesCm: [3, 2, 4, 5],
    suits: 'medium-rare',
    turnEverySeconds: 45,
    advice:
      'Start it fat side down over a gentler part of the grill to render the cap before it ever meets fierce heat. Fat that has not rendered will flare and char while the meat underneath is still raw.',
  },
  {
    kind: 'preference',
    id: 'entrecote',
    name: 'Entrecot',
    alsoKnownAs: 'Ribeye, entrecôte',
    category: 'Beef',
    description:
      'Well marbled with fat running through the muscle rather than sitting on top. That fat needs heat to render, which is why a rare ribeye can feel greasy.',
    thicknessesCm: [2, 2.5, 3, 4],
    suits: 'medium-rare',
    turnEverySeconds: 45,
    advice:
      'Take it a shade further than you would a leaner cut, to medium rare or even medium. The marbling turns from waxy to buttery somewhere around 56 to 60°C.',
  },
  {
    kind: 'preference',
    id: 'chuleton',
    name: 'Chuletón',
    alsoKnownAs: 'Large bone-in ribeye, cote de boeuf',
    category: 'Beef',
    description:
      'A very thick bone-in ribeye, usually shared between two or more. Thick enough that it is a different job from a normal steak.',
    thicknessesCm: [4, 3.5, 5, 6],
    suits: 'medium-rare',
    turnEverySeconds: 45,
    advice:
      'Almost always wants a reverse sear. Probe away from the bone, which conducts heat and will read higher than the meat beside it. Rest it properly: a piece this size carries over a long way.',
  },
  {
    kind: 'preference',
    id: 'solomillo',
    name: 'Solomillo de ternera',
    alsoKnownAs: 'Beef fillet, tenderloin',
    category: 'Beef',
    description:
      'The leanest and most tender cut, and the least forgiving. Almost no fat, so there is nothing to protect it once it goes past your target.',
    thicknessesCm: [3, 2, 4],
    suits: 'rare',
    turnEverySeconds: 45,
    advice:
      'Pull it early and watch it closely. Cooked past medium it goes dry and loses the texture you paid for.',
  },
  {
    kind: 'preference',
    id: 'lomo-alto',
    name: 'Lomo alto',
    alsoKnownAs: 'Sirloin, striploin',
    category: 'Beef',
    description:
      'Leaner than ribeye but with a fat cap along one edge. A good middle ground: enough fat for flavour, enough structure to hold a crust.',
    thicknessesCm: [2, 2.5, 3],
    suits: 'medium-rare',
    turnEverySeconds: 45,
    advice:
      'Stand it on the fat edge for a minute first to render and crisp it, then lay it flat.',
  },
  {
    kind: 'preference',
    id: 'falda',
    name: 'Falda',
    alsoKnownAs: 'Flank, skirt, bavette',
    category: 'Beef',
    description:
      'Thin, coarse grained and full of flavour. A different animal from the thick cuts: it is over in minutes.',
    thicknessesCm: [1.5, 1, 2],
    suits: 'medium-rare',
    turnEverySeconds: 30,
    advice:
      'Fierce heat and fast, then slice it across the grain. Cut it the wrong way and even a perfectly cooked piece chews like rope.',
  },

  /* ---- Lamb ---- */
  {
    kind: 'preference',
    id: 'chuletas-cordero',
    name: 'Chuletas de cordero',
    alsoKnownAs: 'Lamb chops, cutlets',
    category: 'Lamb',
    description:
      'A whole cut like beef, so pink in the middle is fine once the outside is seared. Small, fatty and quick.',
    thicknessesCm: [2, 1.5, 3],
    suits: 'medium-rare',
    turnEverySeconds: 45,
    advice:
      'Render the fat edge first. Lamb fat that has not rendered tastes waxy, and the dripping fat is what causes most flare-ups.',
  },

  /* ---- Pork: cooked through ---- */
  {
    kind: 'cooked-through',
    id: 'solomillo-cerdo',
    name: 'Solomillo de cerdo',
    alsoKnownAs: 'Pork tenderloin, fillet',
    category: 'Pork',
    description:
      'Lean, quick and very easy to overcook. It has almost no fat, so a couple of minutes too long is the difference between juicy and dry.',
    temperatures: PORK_TEMPS,
    method: 'two-zone',
    sizes: [
      { label: 'Whole, about 400g', minutes: 20, restMinutes: 5 },
      { label: 'Whole, about 600g', minutes: 26, restMinutes: 6 },
      { label: 'Cut in medallions', minutes: 10, restMinutes: 3 },
    ],
    turnEverySeconds: 60,
    whyThrough:
      'Pork is not a pink-in-the-middle cut in UK guidance. The FSA groups it with poultry, while the USDA allows 62.8°C plus a rest, which leaves it faintly pink. Both figures are shown so you can choose knowingly.',
    advice:
      'Sear it all over on the hot side, then finish on the cool side. This is the cut where the probe earns its money, because the window between done and dry is only a few degrees wide.',
  },
  {
    kind: 'cooked-through',
    id: 'secreto',
    name: 'Secreto',
    alsoKnownAs: 'Pork skirt, secreto ibérico',
    category: 'Pork',
    description:
      'A thin, heavily marbled cut from behind the shoulder. The fat is laced right through it, which makes it far more forgiving than most pork.',
    temperatures: PORK_TEMPS,
    method: 'direct',
    sizes: [
      { label: 'One piece', minutes: 8, restMinutes: 4 },
      { label: 'Thick piece', minutes: 12, restMinutes: 5 },
    ],
    turnEverySeconds: 45,
    whyThrough:
      'Still pork, so still cooked through, even though the marbling makes it behave like a steak on the grill.',
    advice:
      'Hot and fast, and expect flare-ups as the fat renders: keep a cool corner to move it to. Slice across the grain.',
  },
  {
    kind: 'cooked-through',
    id: 'chuletas-cerdo',
    name: 'Chuletas de cerdo',
    alsoKnownAs: 'Pork chops',
    category: 'Pork',
    description:
      'Bone-in pork chops. The bone slows the heat down on one side, so the meat next to it finishes last.',
    temperatures: PORK_TEMPS,
    method: 'two-zone',
    sizes: [
      { label: 'About 2cm', minutes: 12, restMinutes: 4 },
      { label: 'About 3cm', minutes: 18, restMinutes: 5 },
      { label: 'About 4cm', minutes: 26, restMinutes: 7 },
    ],
    turnEverySeconds: 60,
    whyThrough:
      'Pork, so cooked through. UK and US guidance differ on how far, and both numbers are shown.',
    advice:
      'Probe the thickest part and keep clear of the bone, which reads hotter than the meat around it and will tell you it is done before it is.',
  },

  /* ---- Chicken: cooked through ---- */
  {
    kind: 'cooked-through',
    id: 'pollo-entero',
    name: 'Whole chicken',
    alsoKnownAs: 'Pollo entero, spatchcocked',
    category: 'Chicken',
    description:
      'The longest job on the barbecue. Spatchcocking it, meaning cutting out the backbone and flattening it, roughly halves the time and makes it cook far more evenly.',
    temperatures: POULTRY_TEMPS,
    method: 'indirect',
    sizes: [
      { label: 'Spatchcocked, 1.5kg', minutes: 50, restMinutes: 10 },
      { label: 'Spatchcocked, 2kg', minutes: 65, restMinutes: 12 },
      { label: 'Whole, 1.5kg', minutes: 80, restMinutes: 15 },
      { label: 'Whole, 2kg', minutes: 100, restMinutes: 15 },
    ],
    whyThrough:
      'Chicken carries bacteria all the way through, not just on the surface. There is no version of this that is safe pink.',
    advice:
      'Lid down, coals to the sides, bird in the middle. Probe the thickest part of the thigh between drumstick and breast, away from the bone. The breast will be done well before the thigh, which is exactly why you probe the thigh.',
  },
  {
    kind: 'cooked-through',
    id: 'alitas',
    name: 'Wings',
    alsoKnownAs: 'Alitas',
    category: 'Chicken',
    description:
      'Mostly skin, fat and connective tissue, which means they want longer and hotter than their size suggests. Taken well past the safe minimum they get better, not worse.',
    temperatures: POULTRY_TEMPS,
    method: 'two-zone',
    sizes: [
      { label: 'A tray', minutes: 28, restMinutes: 3 },
      { label: 'A big pile', minutes: 35, restMinutes: 3 },
    ],
    turnEverySeconds: 180,
    whyThrough: 'Chicken. Cooked through, always.',
    advice:
      'Start them on the cool side to render the fat, then finish over the coals to crisp the skin. Doing it the other way round burns the skin before the fat has gone anywhere.',
  },
  {
    kind: 'cooked-through',
    id: 'jamoncitos',
    name: 'Drumsticks',
    alsoKnownAs: 'Jamoncitos, muslos',
    category: 'Chicken',
    description:
      'Dark meat on the bone. Forgiving, because the fat and connective tissue keep them moist well beyond the point a breast would have dried out.',
    temperatures: POULTRY_TEMPS,
    method: 'two-zone',
    sizes: [
      { label: 'A few', minutes: 32, restMinutes: 5 },
      { label: 'A full grill', minutes: 40, restMinutes: 5 },
    ],
    turnEverySeconds: 240,
    whyThrough: 'Chicken. Cooked through, always.',
    advice:
      'Most cooks take these to 75°C or beyond on purpose: the texture improves. Probe the thickest part without touching the bone.',
  },

  /* ---- Skewers and sausages ---- */
  {
    kind: 'cooked-through',
    id: 'pinchos',
    name: 'Pinchos',
    alsoKnownAs: 'Skewers, brochetas, pinchos morunos',
    category: 'Other',
    description:
      'Cubes of meat on a skewer, usually marinated. Quick, and easy to dry out because the pieces are small.',
    temperatures: POULTRY_TEMPS,
    method: 'direct',
    sizes: [
      { label: '2cm cubes', minutes: 12, restMinutes: 3 },
      { label: '3cm cubes', minutes: 16, restMinutes: 3 },
    ],
    turnEverySeconds: 90,
    whyThrough:
      'This is the one that catches people out. Pushing a skewer through a whole cut drags bacteria from the surface into the middle, so skewers are cooked through even when made from beef that would have been perfectly safe pink as a steak. The FSA is explicit about it.',
    advice:
      'Leave a small gap between the pieces so the heat gets round them. Packed tight, the sides that touch steam instead of browning. Soak wooden skewers first or they burn through.',
  },
  {
    kind: 'cooked-through',
    id: 'salchichas',
    name: 'Sausages',
    alsoKnownAs: 'Salchichas, chorizo, butifarra',
    category: 'Other',
    description:
      'Minced meat in a skin. The most commonly burnt thing on any barbecue, because the fat renders out and feeds the flames.',
    temperatures: MINCE_TEMPS,
    method: 'two-zone',
    sizes: [
      { label: 'Standard', minutes: 20, restMinutes: 3 },
      { label: 'Thick', minutes: 26, restMinutes: 3 },
    ],
    turnEverySeconds: 120,
    whyThrough:
      'Mincing spreads surface bacteria right through the meat, so sausages are cooked through and never pink in the middle.',
    advice:
      'Cool side first, over the coals at the end for colour. Do not prick them: that lets the fat out, which dries the sausage and starts the flare-ups you were trying to avoid.',
  },

  /* ---- Fish ---- */
  {
    kind: 'cooked-through',
    id: 'pescado-entero',
    name: 'Whole fish',
    alsoKnownAs: 'Pescado entero, dorada, lubina',
    category: 'Fish',
    description:
      'Skin on and bones in, which is what holds it together over the fire. Far less likely to fall apart than a fillet.',
    temperatures: FISH_TEMPS,
    method: 'direct',
    sizes: [
      { label: 'About 400g', minutes: 14, restMinutes: 3 },
      { label: 'About 800g', minutes: 22, restMinutes: 4 },
    ],
    turnEverySeconds: 300,
    whyThrough:
      'The FSA goes by the flesh turning opaque and flaking apart easily rather than a number. The USDA figure is here if you would rather probe it.',
    advice:
      'Oil the fish rather than the grill, and leave it alone until it releases by itself. If it sticks when you try to turn it, it is not ready to be turned. A fish cage saves a lot of grief.',
  },
  {
    kind: 'cooked-through',
    id: 'pescado-filete',
    name: 'Fish fillets and steaks',
    alsoKnownAs: 'Tuna, salmon, swordfish',
    category: 'Fish',
    description:
      'Quick, and unforgiving. A fillet goes from underdone to dry in about a minute.',
    temperatures: FISH_TEMPS,
    method: 'direct',
    sizes: [
      { label: 'Thin fillet', minutes: 6, restMinutes: 2 },
      { label: 'About 2cm', minutes: 9, restMinutes: 3 },
      { label: 'Thick steak, 3cm', minutes: 13, restMinutes: 3 },
    ],
    turnEverySeconds: 180,
    whyThrough:
      'Opaque and flaking is the test. Tuna is the usual exception people make, deliberately, the same way they would with a rare steak.',
    advice:
      'Skin side down first and most of the way through. The skin protects the flesh and crisps while it does.',
  },
]

export const BBQ_CATEGORIES: BbqCategory[] = [
  'Beef',
  'Lamb',
  'Pork',
  'Chicken',
  'Fish',
  'Other',
]
