/**
 * Cooking terms, written from scratch in plain English.
 *
 * The test each one has to pass: would this make sense to someone who has
 * never read a cookbook, and does it say why the technique exists rather than
 * just what it is? "Deglaze: to add liquid to a pan" is useless. Knowing that
 * the brown stuck bits are the flavour is the point.
 */

export interface CookingTerm {
  id: string
  term: string
  short: string
  detail: string
  /** Offers a labelled timer where the technique has a typical duration. */
  timer?: { label: string; minutes: number }
}

export const COOKING_TERMS: CookingTerm[] = [
  {
    id: 'sear',
    term: 'Sear',
    short: 'Brown the outside fast, over a high heat.',
    detail:
      'Get the pan properly hot, then leave the meat alone so the surface dries out and browns. That browning is not just colour, it creates flavours that were not in the raw meat at all. It does not seal in juices, which is an old myth, but it does make the food taste far better. Pat the surface dry first, because wet meat steams instead of browning.',
  },
  {
    id: 'sweat',
    term: 'Sweat',
    short: 'Cook gently in fat until soft but not coloured.',
    detail:
      'Usually onions, celery or garlic at the start of a dish. Low heat, often with a pinch of salt to draw moisture out, and a lid if you want it softer still. The aim is sweetness and softness with no browning, which would take the flavour in a different direction.',
    timer: { label: 'Sweating onions', minutes: 8 },
  },
  {
    id: 'braise',
    term: 'Braise',
    short: 'Brown it, then cook it slowly in a little liquid, covered.',
    detail:
      'The method for tough, cheap cuts like shoulder, shin or cheek. Long slow heat breaks down the connective tissue into gelatine, which is what makes the meat go from chewy to falling apart. Rushing it does not work: the meat goes tough first and only becomes tender if you keep going.',
    timer: { label: 'Braise', minutes: 150 },
  },
  {
    id: 'blanch',
    term: 'Blanch',
    short: 'Boil briefly, then stop the cooking in cold water.',
    detail:
      'A quick dip in heavily boiling salted water, then straight into iced water. It sets the colour of green vegetables, takes the raw edge off, and loosens skins on tomatoes and peaches. The cold water step matters as much as the boiling: without it the food carries on cooking and goes drab.',
    timer: { label: 'Blanch', minutes: 2 },
  },
  {
    id: 'deglaze',
    term: 'Deglaze',
    short: 'Add liquid to a hot pan to lift the stuck brown bits.',
    detail:
      'After browning meat, the pan is left with dark sticky patches. That is concentrated flavour, not mess. Pour in wine, stock or even water while the pan is hot and scrape with a wooden spoon: it dissolves straight into the liquid and becomes the base of a sauce. Throwing that pan away is throwing away the best part.',
  },
  {
    id: 'rest',
    term: 'Rest',
    short: 'Let cooked meat sit before cutting it.',
    detail:
      'Two things happen. The heat at the surface keeps travelling inwards, so the middle carries on cooking for a few minutes. And the muscle fibres relax and reabsorb juice that would otherwise run out onto the board. Cutting too early costs you both. Bigger cuts need longer: minutes for a steak, twenty for a joint.',
    timer: { label: 'Resting', minutes: 10 },
  },
  {
    id: 'carryover',
    term: 'Carryover cooking',
    short: 'Food keeps cooking after it leaves the heat.',
    detail:
      'The outside of a joint is much hotter than the middle, and that heat keeps moving inwards while it rests. A steak typically climbs another 2 to 4°C, a large joint more. This is why you take meat off the heat below your target temperature rather than at it. Wait until the probe reads what you want and you have already overshot.',
  },
  {
    id: 'reduce',
    term: 'Reduce',
    short: 'Boil a liquid down to concentrate it.',
    detail:
      'Simmer or boil with the lid off so water evaporates. What is left behind is more intensely flavoured and thicker. Season at the end, not the start, because whatever salt is in there gets concentrated too and it is easy to end up with something inedible.',
  },
  {
    id: 'simmer',
    term: 'Simmer',
    short: 'Just below a boil, with lazy occasional bubbles.',
    detail:
      'A rolling boil is violent and will break delicate food apart and make meat tough. A simmer is gentle: small bubbles rising now and then rather than constantly. If it is bubbling hard across the whole surface, turn it down.',
  },
  {
    id: 'fold',
    term: 'Fold',
    short: 'Combine gently so you do not knock the air out.',
    detail:
      'Used when something has been whipped, like egg whites or cream. Cut down through the middle with a spatula, sweep along the bottom and lift over the top, turning the bowl as you go. Stirring briskly would collapse all the air you just spent effort putting in.',
  },
  {
    id: 'score',
    term: 'Score',
    short: 'Cut shallow lines into the surface.',
    detail:
      'Slashes in fish skin or fat help heat get in and stop the piece curling as it cooks. On duck or pork fat, scoring lets the fat render out and the skin crisp up. Cut into the fat or skin only, not down into the meat.',
  },
  {
    id: 'proof',
    term: 'Proof',
    short: 'Let dough rise before baking.',
    detail:
      'Yeast produces gas that inflates the dough and develops flavour. Warmth speeds it up, cold slows it down, and a slow cold rise generally tastes better. Judge it by how much the dough has grown and whether a poked dent springs back slowly, not by the clock, since room temperature changes everything.',
    timer: { label: 'Proving', minutes: 60 },
  },
  {
    id: 'season',
    term: 'Season',
    short: 'Salt and pepper, added in stages rather than at the end.',
    detail:
      'Salt added early works its way into the food. Salt added at the end sits on the surface and tastes sharper. Season lightly at each stage and taste as you go, because you can always add more and you cannot take it out.',
  },
  {
    id: 'render',
    term: 'Render',
    short: 'Melt solid fat out of meat slowly.',
    detail:
      'Start fatty skin in a cold, dry pan and bring the heat up gently. The fat melts and runs out, leaving the skin to crisp in it. Starting hot seizes the outside and traps the fat inside, which is how you get skin that is browned and flabby at once.',
  },
  {
    id: 'marinate',
    term: 'Marinate',
    short: 'Soak in a seasoned liquid before cooking.',
    detail:
      'Mostly a surface treatment: marinades rarely penetrate far into meat, whatever recipes claim. Salt and time help a little. Acid like lemon or vinegar will change the texture of the outside, and left too long it turns the surface unpleasantly mushy, especially on fish.',
    timer: { label: 'Marinating', minutes: 30 },
  },
]
