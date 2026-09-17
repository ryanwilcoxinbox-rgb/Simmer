/**
 * Working out how to cook a steak of a given thickness to a given doneness.
 *
 * A warning that the UI repeats to the user: the times in here are estimates,
 * and weaker ones than anywhere else in the app. Grill temperature, how cold
 * the meat started, wind, lid up or down and the fat content of the cut all
 * move them about. A 4cm chuleton and a 2cm entrecote are barely the same
 * activity.
 *
 * So the temperatures lead and the clock follows. The times exist to tell you
 * roughly when to start paying attention and to give a timer something to
 * count, not to tell you when the steak is done. The probe tells you that.
 */

export type Approach = 'direct' | 'reverse-sear'

export interface GrillPlan {
  approach: Approach
  /** Minutes per side over direct heat. Zero for the indirect phase. */
  perSideMinutes: number
  /** Rough total cooking time, excluding the rest. */
  totalMinutes: number
  /** How often to turn it, in seconds. */
  flipSeconds: number
  /** Minutes to rest afterwards. */
  restMinutes: number
  /** Why this approach, in one line. */
  reason: string
}

/**
 * Above this, a steak cannot be cooked through over direct heat without
 * burning the outside first, so it wants the reverse sear treatment.
 */
export const REVERSE_SEAR_FROM_CM = 3.5

/** Minutes of direct heat per centimetre of thickness, per side. */
const MINUTES_PER_CM: Record<string, number> = {
  rare: 1,
  'medium-rare': 1.25,
  medium: 1.5,
  'medium-well': 1.9,
  'well-done': 2.4,
}

/** Turning often cooks more evenly than leaving it alone, per Thermapen. */
const FLIP_SECONDS = 45
/** The final browning once a thick steak is up to temperature. */
const SEAR_MINUTES_PER_SIDE = 1.5

export function donenessFactor(donenessId: string): number {
  return MINUTES_PER_CM[donenessId] ?? MINUTES_PER_CM['medium-rare']
}

/** Rest longer for a thicker steak: more heat to even out. */
export function restMinutesFor(thicknessCm: number): number {
  return Math.max(5, Math.min(20, Math.round(thicknessCm * 3)))
}

export function grillPlan(thicknessCm: number, donenessId: string): GrillPlan {
  const thickness = Math.max(0.5, thicknessCm)
  const restMinutes = restMinutesFor(thickness)

  if (thickness >= REVERSE_SEAR_FROM_CM) {
    // Indirect until it is nearly there, then a hard sear at the end. The
    // indirect phase is the one that varies most, so it is a wide guess.
    const indirect = Math.round(thickness * donenessFactor(donenessId) * 6)
    return {
      approach: 'reverse-sear',
      perSideMinutes: SEAR_MINUTES_PER_SIDE,
      totalMinutes: indirect + Math.round(SEAR_MINUTES_PER_SIDE * 2),
      flipSeconds: FLIP_SECONDS,
      restMinutes,
      reason:
        'Too thick for direct heat alone: the outside would burn long before the middle came up. Cook it away from the coals first, then sear it at the end.',
    }
  }

  const perSide = Math.round(thickness * donenessFactor(donenessId) * 2) / 2
  return {
    approach: 'direct',
    perSideMinutes: perSide,
    totalMinutes: Math.max(1, Math.round(perSide * 2)),
    flipSeconds: FLIP_SECONDS,
    restMinutes,
    reason:
      'Thin enough to cook straight over the coals. Turn it often rather than once: it browns just as well and cooks far more evenly.',
  }
}
