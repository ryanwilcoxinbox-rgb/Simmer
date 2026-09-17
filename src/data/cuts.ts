/**
 * Steak cuts for the barbecue.
 *
 * Named the way they are sold in Spain, where Ryan buys them, with the British
 * equivalent alongside so a recipe written either side of the border makes
 * sense. Thickness matters more than weight here, because thickness is what
 * decides whether a steak can go straight over the coals at all.
 *
 * No temperatures live in this file. Doneness comes from the Thermapen chart
 * in meats.ts, so there is one source for those numbers rather than two that
 * can drift apart.
 */

export interface SteakCut {
  id: string
  name: string
  alsoKnownAs: string
  description: string
  /** Thicknesses to offer, in centimetres. First is the default. */
  thicknessesCm: number[]
  /** The doneness id from meats.ts that suits this cut best. */
  suits: string
  /** Why that doneness, and anything particular about cooking it. */
  advice: string
}

export const STEAK_CUTS: SteakCut[] = [
  {
    id: 'picana',
    name: 'Picaña',
    alsoKnownAs: 'Picanha, rump cap, culotte',
    description:
      'Rump cap with the fat still on top. The fat is the whole point: it bastes the meat as it renders, so it is never trimmed off.',
    thicknessesCm: [3, 2, 4, 5],
    suits: 'medium-rare',
    advice:
      'Start it fat side down over a gentler part of the grill to render the cap before it ever meets fierce heat. Fat that has not rendered will flare and char while the meat underneath is still raw.',
  },
  {
    id: 'entrecote',
    name: 'Entrecot',
    alsoKnownAs: 'Ribeye, entrecôte',
    description:
      'Well marbled with fat running through the muscle rather than sitting on top. That fat needs heat to render, which is why a rare ribeye can feel greasy.',
    thicknessesCm: [2, 2.5, 3, 4],
    suits: 'medium-rare',
    advice:
      'Take it a shade further than you would a leaner cut, to medium rare or even medium. The marbling turns from waxy to buttery somewhere around 56 to 60°C.',
  },
  {
    id: 'chuleton',
    name: 'Chuletón',
    alsoKnownAs: 'Large bone-in ribeye, cote de boeuf',
    description:
      'A very thick bone-in ribeye, usually shared between two or more. Thick enough that it is a different job from a normal steak.',
    thicknessesCm: [4, 3.5, 5, 6],
    suits: 'medium-rare',
    advice:
      'Almost always wants a reverse sear. Probe away from the bone, which conducts heat and will read higher than the meat beside it. Rest it properly: a piece this size carries over a long way.',
  },
  {
    id: 'solomillo',
    name: 'Solomillo',
    alsoKnownAs: 'Fillet, tenderloin, filet mignon',
    description:
      'The leanest and most tender cut, and the least forgiving. Almost no fat, so there is nothing to protect it once it goes past your target.',
    thicknessesCm: [3, 2, 4],
    suits: 'rare',
    advice:
      'Pull it early and watch it closely. Cooked past medium it goes dry and loses the texture you paid for.',
  },
  {
    id: 'lomo',
    name: 'Lomo alto',
    alsoKnownAs: 'Sirloin, striploin',
    description:
      'Leaner than ribeye but with a fat cap along one edge. A good middle ground: enough fat for flavour, enough structure to hold a crust.',
    thicknessesCm: [2, 2.5, 3],
    suits: 'medium-rare',
    advice:
      'Stand it on the fat edge for a minute first to render and crisp it, then lay it flat.',
  },
  {
    id: 'falda',
    name: 'Falda',
    alsoKnownAs: 'Flank, skirt, bavette',
    description:
      'Thin, coarse grained and full of flavour. A different animal from the thick cuts: it is over in minutes.',
    thicknessesCm: [1.5, 1, 2],
    suits: 'medium-rare',
    advice:
      'Fierce heat and fast, then slice it across the grain. Cut it the wrong way and even a perfectly cooked piece chews like rope.',
  },
]
