import type { SourceId } from './sources'

/**
 * Meat temperatures.
 *
 * Two kinds of number live in here and they must never be confused:
 *
 * - `safe` temperatures come from a food safety body and exist to stop you
 *   being ill. They are not negotiable and they are always attributed.
 * - `preference` temperatures are about how you like it cooked. They only
 *   apply to cuts that are safe to eat pink in the first place.
 *
 * Oven temperatures and times are a different thing again: a rough starting
 * point, not guidance, because they depend on the size and shape of what you
 * are cooking. Arran has a Thermapen, so the probe decides. The UI says so
 * rather than letting the two kinds of number look equally authoritative.
 */

export type TemperatureKind = 'safe' | 'preference'

export interface Temperature {
  /** Always stored in Celsius. Converted for display. */
  celsius: number
  label: string
  kind: TemperatureKind
  source: SourceId
  note?: string
}

export type MeatGroup =
  | 'Poultry'
  | 'Pork'
  | 'Beef and lamb'
  | 'Mince and burgers'
  | 'Fish'
  | 'Reheating'

export interface MeatEntry {
  id: string
  name: string
  group: MeatGroup
  /** Why this meat is handled the way it is. Plain English, no jargon. */
  summary: string
  temperatures: Temperature[]
  /** Degrees C to pull early, because it keeps cooking while it rests. */
  pullEarlyC?: number
  restMinutes?: number
  /** Rough oven setting. A starting point, never a guarantee. */
  ovenC?: number
  timeGuide?: string
  /** Set where the time or oven figure is our own estimate, not sourced. */
  needsVerification?: boolean
  /** Prefills a labelled timer from the Guide. */
  timer?: { label: string; minutes: number }
}

/** The FSA's full ladder. Any of these combinations kill the same bacteria. */
export const FSA_TIME_TEMPERATURES = [
  { celsius: 60, hold: '45 minutes' },
  { celsius: 65, hold: '10 minutes' },
  { celsius: 70, hold: '2 minutes' },
  { celsius: 75, hold: '30 seconds' },
  { celsius: 80, hold: '6 seconds' },
]

const POULTRY_TEMPS: Temperature[] = [
  {
    celsius: 70,
    label: 'Safe, UK',
    kind: 'safe',
    source: 'fsa',
    note: 'Held for 2 minutes at the centre. 75°C for 30 seconds does the same job.',
  },
  {
    celsius: 73.9,
    label: 'Safe, US',
    kind: 'safe',
    source: 'usda',
    note: 'Quoted as 165°F, with no hold time required.',
  },
]

const MINCE_TEMPS: Temperature[] = [
  {
    celsius: 71.1,
    label: 'Safe, US',
    kind: 'safe',
    source: 'usda',
    note: 'Quoted as 160°F for all ground meats.',
  },
  {
    celsius: 70,
    label: 'Safe, UK',
    kind: 'safe',
    source: 'fsa',
    note: 'Held for 2 minutes. Mincing spreads surface bacteria right through, so it must be cooked all the way.',
  },
]

/** Thermapen's own chart, which is the thermometer Arran owns. */
const STEAK_DONENESS: Temperature[] = [
  {
    celsius: 52,
    label: 'Rare',
    kind: 'preference',
    source: 'thermapen',
    note: 'Take it off the heat at 48 to 50°C.',
  },
  {
    celsius: 56,
    label: 'Medium rare',
    kind: 'preference',
    source: 'thermapen',
    note: 'Take it off the heat at 52 to 54°C.',
  },
  {
    celsius: 60,
    label: 'Medium',
    kind: 'preference',
    source: 'thermapen',
    note: 'Take it off the heat at 56 to 58°C.',
  },
  {
    celsius: 65,
    label: 'Medium well',
    kind: 'preference',
    source: 'thermapen',
    note: 'Take it off the heat at 61 to 63°C.',
  },
  {
    celsius: 71,
    label: 'Well done',
    kind: 'preference',
    source: 'thermapen',
    note: 'Take it off the heat at 67 to 69°C.',
  },
]

export const MEATS: MeatEntry[] = [
  {
    id: 'chicken-breast',
    name: 'Chicken breast',
    group: 'Poultry',
    summary:
      'Chicken carries bacteria all the way through, not just on the surface, so it always has to be cooked right through. Never pink.',
    temperatures: POULTRY_TEMPS,
    restMinutes: 5,
    ovenC: 200,
    timeGuide:
      'Roughly 20 to 25 minutes for an average breast. Always confirm with the probe.',
    needsVerification: true,
    timer: { label: 'Chicken', minutes: 22 },
  },
  {
    id: 'chicken-thighs',
    name: 'Chicken thighs',
    group: 'Poultry',
    summary:
      'Same safety rule as breast, but thighs are far more forgiving. More fat and connective tissue means taking them past the minimum improves them rather than drying them out.',
    temperatures: POULTRY_TEMPS,
    restMinutes: 5,
    ovenC: 200,
    timeGuide:
      'Roughly 30 to 40 minutes bone-in. Many cooks deliberately take thighs to 75°C or beyond, for texture.',
    needsVerification: true,
    timer: { label: 'Chicken thighs', minutes: 35 },
  },
  {
    id: 'whole-chicken',
    name: 'Whole chicken',
    group: 'Poultry',
    summary:
      'Probe the thickest part of the thigh, between drumstick and breast, and keep clear of the bone. Bone conducts heat and reads high, telling you it is done when it is not.',
    temperatures: POULTRY_TEMPS,
    pullEarlyC: 3,
    restMinutes: 15,
    ovenC: 200,
    timeGuide:
      'Very roughly 45 minutes per kg plus 20 minutes. Birds vary too much to trust this on its own.',
    needsVerification: true,
    timer: { label: 'Roast chicken', minutes: 90 },
  },
  {
    id: 'turkey',
    name: 'Turkey',
    group: 'Poultry',
    summary:
      'Treated exactly like chicken for safety. The difficulty is size: the breast is done long before the thigh, so probe the thigh and expect a long rest.',
    temperatures: POULTRY_TEMPS,
    pullEarlyC: 4,
    restMinutes: 30,
    ovenC: 180,
    timeGuide:
      'Depends enormously on weight and whether it is stuffed. Follow the bird, not the clock.',
    needsVerification: true,
    timer: { label: 'Turkey', minutes: 120 },
  },
  {
    id: 'pork-chops',
    name: 'Pork chops and loin',
    group: 'Pork',
    summary:
      'The one where UK and US guidance genuinely disagree. The USDA allows pork at 62.8°C with a rest, leaving it faintly pink and much juicier. The FSA groups pork with poultry and says cook it right through. Read both before choosing.',
    temperatures: [
      {
        celsius: 62.8,
        label: 'Safe, US',
        kind: 'safe',
        source: 'usda',
        note: 'Quoted as 145°F, then rest at least 3 minutes. The rest is part of the safety step, not just for juiciness.',
      },
      {
        celsius: 70,
        label: 'Safe, UK',
        kind: 'safe',
        source: 'fsa',
        note: 'Held for 2 minutes. The FSA says bacteria can be present throughout pork, as with poultry.',
      },
    ],
    pullEarlyC: 3,
    restMinutes: 3,
    ovenC: 200,
    timeGuide:
      'Roughly 18 to 25 minutes for a thick chop. Thickness matters far more than weight.',
    needsVerification: true,
    timer: { label: 'Pork', minutes: 20 },
  },
  {
    id: 'steak',
    name: 'Steak',
    group: 'Beef and lamb',
    summary:
      'A whole cut of beef only carries bacteria on its outside surface, which is why it can be served pink once the outside is properly seared. That makes doneness a matter of taste rather than safety. These figures are Thermapen’s, which is the thermometer you already own.',
    temperatures: STEAK_DONENESS,
    pullEarlyC: 4,
    restMinutes: 10,
    timeGuide:
      'Too dependent on thickness and heat to give a time. Flip every 30 to 45 seconds and go by temperature.',
    timer: { label: 'Steak rest', minutes: 10 },
  },
  {
    id: 'beef-joint',
    name: 'Beef roasting joint',
    group: 'Beef and lamb',
    summary:
      'Same rule as steak: pink is fine in the middle once the outside is sealed. A big joint carries over far more than a steak, so take it out earlier than feels right.',
    temperatures: STEAK_DONENESS,
    pullEarlyC: 5,
    restMinutes: 20,
    ovenC: 180,
    timeGuide:
      'Roughly 20 minutes per 500g for medium rare, after an initial blast at high heat.',
    needsVerification: true,
    timer: { label: 'Beef joint', minutes: 60 },
  },
  {
    id: 'lamb',
    name: 'Lamb leg and chops',
    group: 'Beef and lamb',
    summary:
      'A whole cut like beef, so pink is safe once the outside is seared. Lamb is usually taken a little further than beef because the fat needs heat to render properly.',
    temperatures: STEAK_DONENESS,
    pullEarlyC: 4,
    restMinutes: 15,
    ovenC: 180,
    timeGuide:
      'Roughly 25 minutes per 500g for medium. Shoulder is a different job: it wants hours, not minutes.',
    needsVerification: true,
    timer: { label: 'Lamb', minutes: 60 },
  },
  {
    id: 'burgers',
    name: 'Burgers and mince',
    group: 'Mince and burgers',
    summary:
      'Mincing takes the bacteria that were safely on the outside of the meat and mixes them right through it. That is the whole reason a rare steak is fine and a rare burger is not. The FSA says burgers should not be served pink at home.',
    temperatures: MINCE_TEMPS,
    restMinutes: 3,
    timeGuide:
      'Roughly 4 to 5 minutes a side for a 2cm patty, but probe the middle.',
    needsVerification: true,
    timer: { label: 'Burgers', minutes: 10 },
  },
  {
    id: 'sausages',
    name: 'Sausages',
    group: 'Mince and burgers',
    summary:
      'Minced meat in a skin, so the same rule applies: cooked all the way through, never pink in the middle.',
    temperatures: MINCE_TEMPS,
    ovenC: 200,
    timeGuide: 'Roughly 20 to 25 minutes in the oven, turning once.',
    needsVerification: true,
    timer: { label: 'Sausages', minutes: 22 },
  },
  {
    id: 'fish',
    name: 'Fish fillets',
    group: 'Fish',
    summary:
      'The FSA leans on visual cues for fish: the flesh turns opaque rather than translucent, and flakes apart easily with a fork. The USDA gives a number if you would rather probe it.',
    temperatures: [
      {
        celsius: 62.8,
        label: 'Safe, US',
        kind: 'safe',
        source: 'usda',
        note: 'Quoted as 145°F for fish and shellfish.',
      },
    ],
    pullEarlyC: 2,
    restMinutes: 3,
    ovenC: 180,
    timeGuide:
      'Roughly 12 to 15 minutes for an average fillet. Thin fillets go much faster.',
    needsVerification: true,
    timer: { label: 'Fish', minutes: 13 },
  },
  {
    id: 'leftovers',
    name: 'Leftovers and reheating',
    group: 'Reheating',
    summary:
      'Reheated food needs to get properly hot all the way through, not just warm on the outside. Steaming hot in the middle is the test if you are not probing it.',
    temperatures: [
      {
        celsius: 73.9,
        label: 'Safe, US',
        kind: 'safe',
        source: 'usda',
        note: 'Quoted as 165°F for leftovers and casseroles.',
      },
      {
        celsius: 70,
        label: 'Safe, UK',
        kind: 'safe',
        source: 'fsa',
        note: 'Held for 2 minutes, the same standard as cooking it the first time.',
      },
    ],
    timer: { label: 'Reheat', minutes: 15 },
  },
]

export const MEAT_GROUPS: MeatGroup[] = [
  'Poultry',
  'Pork',
  'Beef and lamb',
  'Mince and burgers',
  'Fish',
  'Reheating',
]
