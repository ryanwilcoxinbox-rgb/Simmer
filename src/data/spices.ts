/**
 * Spices, pairings and blends.
 *
 * Written from general culinary knowledge. Nothing here is taken, reworded or
 * restructured from any book, including The Science of Spice, which Arran
 * mentioned. The grouping below is our own and deliberately practical rather
 * than botanical or chemical: it answers "what does this taste like and what
 * else can I put it with", which is the question you have with a jar in your
 * hand.
 *
 * Every spice carries a personal notes field in the app, stored on the phone,
 * so Arran can record his own findings and keep using the book alongside this.
 */

export type FlavourGroup =
  | 'Warm and sweet'
  | 'Earthy'
  | 'Pungent'
  | 'Bright and citrus'
  | 'Heat'
  | 'Smoky'
  | 'Bitter and toasty'
  | 'Floral'

export interface Spice {
  id: string
  name: string
  group: FlavourGroup
  /** What it actually tastes like, in plain words. */
  description: string
  /** Other spice ids that work alongside it. */
  pairsWith: string[]
  /** Foods and dishes it belongs in. */
  goesWith: string[]
  tip?: string
}

/**
 * One spice in a blend, and how much of it relative to the others.
 *
 * Parts by volume rather than grams, because that is how these are actually
 * mixed: spoon against spoon, scaled up or down to whatever jar you have.
 */
export interface BlendComponent {
  id: string
  parts: number
}

export interface Blend {
  id: string
  name: string
  origin: string
  /**
   * What typically goes in, and in what proportion.
   *
   * These are a workable starting point, not the recipe. Every one of these
   * blends varies enormously by region and by household, and several have as
   * many versions as there are cooks. Treat the ratios as ours, adjust to
   * taste, and write what you changed in the notes.
   */
  components: BlendComponent[]
  description: string
  note?: string
}

export const FLAVOUR_GROUPS: FlavourGroup[] = [
  'Warm and sweet',
  'Earthy',
  'Pungent',
  'Bright and citrus',
  'Heat',
  'Smoky',
  'Bitter and toasty',
  'Floral',
]

export const SPICES: Spice[] = [
  {
    id: 'cinnamon',
    name: 'Cinnamon',
    group: 'Warm and sweet',
    description:
      'Sweet and woody with a faint bite. Reads as dessert to most British palates, but it does just as much work in savoury braises and rice, where it sits in the background and rounds everything off.',
    pairsWith: ['clove', 'nutmeg', 'cardamom', 'star-anise', 'ginger', 'cumin'],
    goesWith: ['Lamb', 'Beef stews', 'Rice', 'Apples', 'Chocolate'],
    tip: 'Sticks are for anything with liquid and time. Ground is for batters and rubs, and it fades fast, so buy small amounts.',
  },
  {
    id: 'nutmeg',
    name: 'Nutmeg',
    group: 'Warm and sweet',
    description:
      'Sweet, slightly resinous, faintly medicinal. Powerful out of proportion to how mild it seems, and easy to overdo.',
    pairsWith: ['cinnamon', 'clove', 'black-pepper', 'mace'],
    goesWith: ['White sauce', 'Spinach', 'Potato', 'Custard', 'Sausage meat'],
    tip: 'Grate it fresh. Pre-ground nutmeg loses most of what makes it interesting within weeks.',
  },
  {
    id: 'mace',
    name: 'Mace',
    group: 'Warm and sweet',
    description:
      'The lacy covering around the nutmeg seed. Same family of flavour but lighter and more peppery, and it stays cleaner in pale dishes.',
    pairsWith: ['nutmeg', 'white-pepper', 'cinnamon'],
    goesWith: ['Potted meats', 'Fish sauces', 'Pale soups'],
  },
  {
    id: 'clove',
    name: 'Clove',
    group: 'Warm and sweet',
    description:
      'Intense, sweet and numbing, with an almost antiseptic edge. One of the most dominating spices there is.',
    pairsWith: ['cinnamon', 'allspice', 'star-anise', 'black-pepper'],
    goesWith: ['Ham', 'Braised red cabbage', 'Mulled drinks', 'Rice'],
    tip: 'Count them in so you can count them out. Biting into a whole clove is nobody idea of a good time.',
  },
  {
    id: 'allspice',
    name: 'Allspice',
    group: 'Warm and sweet',
    description:
      'Tastes like several spices at once, which is where the name comes from: clove, cinnamon and nutmeg in a single berry, with a peppery finish.',
    pairsWith: ['clove', 'cinnamon', 'thyme-note', 'scotch-bonnet'],
    goesWith: ['Jerk seasoning', 'Pickles', 'Beef', 'Fruit cake'],
  },
  {
    id: 'star-anise',
    name: 'Star anise',
    group: 'Warm and sweet',
    description:
      'Strong liquorice and aniseed, sweet and slightly cooling. Very assertive: one star will flavour a whole pot.',
    pairsWith: ['cinnamon', 'clove', 'fennel', 'szechuan-pepper', 'ginger'],
    goesWith: ['Pork belly', 'Beef broth', 'Duck', 'Poaching syrups'],
  },
  {
    id: 'cardamom',
    name: 'Cardamom',
    group: 'Warm and sweet',
    description:
      'Green cardamom is floral, camphorous and cool, almost like eucalyptus. Black cardamom is a different thing entirely: smoky and tarry, from being dried over fire.',
    pairsWith: ['cinnamon', 'clove', 'saffron', 'ginger', 'coriander-seed'],
    goesWith: ['Rice', 'Curries', 'Coffee', 'Custards', 'Lamb'],
    tip: 'Crush the pod and use the seeds. The husk has very little flavour in it.',
  },
  {
    id: 'fennel',
    name: 'Fennel seed',
    group: 'Warm and sweet',
    description:
      'Sweet aniseed, softer and grassier than star anise. Turns nutty and much rounder once toasted.',
    pairsWith: ['star-anise', 'cumin', 'coriander-seed', 'chilli', 'black-pepper'],
    goesWith: ['Pork', 'Oily fish', 'Sausages', 'Tomato sauces', 'Bread'],
  },
  {
    id: 'cumin',
    name: 'Cumin',
    group: 'Earthy',
    description:
      'Warm, earthy and slightly sweaty in a way that is entirely the point. One of the most recognisable savoury spices there is.',
    pairsWith: ['coriander-seed', 'turmeric', 'paprika', 'chilli', 'garlic'],
    goesWith: ['Lamb', 'Beans', 'Roast vegetables', 'Curries', 'Flatbreads'],
    tip: 'Toast whole seeds in a dry pan until they smell nutty, then grind. The difference is not subtle.',
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    group: 'Earthy',
    description:
      'Musty, faintly bitter, a bit medicinal. Used as much for its aggressive yellow as its taste, and it rarely leads a dish on its own.',
    pairsWith: ['cumin', 'coriander-seed', 'ginger', 'black-pepper', 'mustard-seed'],
    goesWith: ['Rice', 'Lentils', 'Cauliflower', 'Pickles'],
    tip: 'It stains everything it touches, permanently, including wooden spoons and worktops.',
  },
  {
    id: 'paprika',
    name: 'Paprika',
    group: 'Earthy',
    description:
      'Dried sweet red pepper. Mild, fruity and faintly sweet, bringing colour and body rather than heat.',
    pairsWith: ['cumin', 'garlic', 'oregano-note', 'smoked-paprika', 'chilli'],
    goesWith: ['Chicken', 'Potatoes', 'Stews', 'Rubs', 'Eggs'],
    tip: 'Burns quickly and turns bitter. Add it off the heat or into liquid, not into a smoking hot dry pan.',
  },
  {
    id: 'caraway',
    name: 'Caraway',
    group: 'Earthy',
    description:
      'Earthy and sharp with a distinct aniseed note. Strongly associated with rye bread and cabbage, and divisive.',
    pairsWith: ['cumin', 'coriander-seed', 'juniper', 'mustard-seed'],
    goesWith: ['Cabbage', 'Pork', 'Rye bread', 'Cheese'],
  },
  {
    id: 'juniper',
    name: 'Juniper',
    group: 'Earthy',
    description:
      'Piney, resinous and slightly bitter. Tastes like gin, for the obvious reason.',
    pairsWith: ['black-pepper', 'caraway', 'clove', 'thyme-note'],
    goesWith: ['Game', 'Pork', 'Cabbage', 'Cured fish'],
    tip: 'Crush the berries lightly before use to open them up.',
  },
  {
    id: 'black-pepper',
    name: 'Black pepper',
    group: 'Pungent',
    description:
      'Woody, floral and sharply hot in a way that hits the front of the mouth and fades quickly. Far more interesting than its ubiquity suggests.',
    pairsWith: ['cumin', 'coriander-seed', 'nutmeg', 'clove', 'turmeric'],
    goesWith: ['Almost everything', 'Steak', 'Cheese', 'Strawberries'],
    tip: 'Grind it fresh and add some at the end. Long cooking flattens it out completely.',
  },
  {
    id: 'white-pepper',
    name: 'White pepper',
    group: 'Pungent',
    description:
      'The same berry with the skin removed. Less aromatic, more directly hot, with a slightly fermented barnyard edge that some people love and others cannot get past.',
    pairsWith: ['mace', 'ginger', 'star-anise'],
    goesWith: ['White sauces', 'Chinese soups', 'Mashed potato'],
  },
  {
    id: 'mustard-seed',
    name: 'Mustard seed',
    group: 'Pungent',
    description:
      'Nutty and mild whole, fiercely hot once crushed and mixed with cold liquid. The heat is created by the mixing, not present in the seed.',
    pairsWith: ['turmeric', 'cumin', 'caraway', 'fenugreek', 'chilli'],
    goesWith: ['Pickles', 'Indian tempering', 'Dressings', 'Cheese sauces'],
    tip: 'Hot liquid kills the heat, cold liquid develops it. Which you want depends entirely on the dish.',
  },
  {
    id: 'ginger',
    name: 'Ginger',
    group: 'Pungent',
    description:
      'Fresh ginger is juicy, hot and citrusy. Dried ground ginger is a different spice: warmer, sweeter, dustier, and not a substitute for the fresh in savoury food.',
    pairsWith: ['garlic', 'chilli', 'star-anise', 'turmeric', 'cinnamon'],
    goesWith: ['Stir fries', 'Curries', 'Biscuits', 'Fish', 'Tea'],
  },
  {
    id: 'garlic',
    name: 'Garlic',
    group: 'Pungent',
    description:
      'Harsh and sulphurous raw, sweet and mellow when cooked slowly. How you cut it changes the strength: the finer the chop, the fiercer the result.',
    pairsWith: ['chilli', 'cumin', 'paprika', 'ginger', 'black-pepper'],
    goesWith: ['Nearly all savoury cooking'],
    tip: 'Burnt garlic is acrid and cannot be rescued. Add it after the onions, not with them.',
  },
  {
    id: 'coriander-seed',
    name: 'Coriander seed',
    group: 'Bright and citrus',
    description:
      'Lemony, floral and mildly sweet, with none of the soapiness some people find in the fresh leaf. A natural partner to cumin and a good bridge between earthy and bright spices.',
    pairsWith: ['cumin', 'cardamom', 'turmeric', 'chilli', 'fennel'],
    goesWith: ['Curries', 'Roast vegetables', 'Fish', 'Chicken', 'Pickles'],
    tip: 'Crushes easily and toasts fast. It goes from fragrant to burnt in seconds.',
  },
  {
    id: 'sumac',
    name: 'Sumac',
    group: 'Bright and citrus',
    description:
      'Sharp, fruity and genuinely sour, with a deep red colour. Does the job lemon juice would without adding any liquid.',
    pairsWith: ['sesame-note', 'black-pepper', 'chilli', 'cumin'],
    goesWith: ['Grilled meat', 'Salads', 'Flatbread', 'Onions', 'Hummus'],
    tip: 'Scatter it at the end. Heat dulls the sourness that you wanted it for.',
  },
  {
    id: 'chilli',
    name: 'Chilli',
    group: 'Heat',
    description:
      'Heat plus fruit. The heat is not a taste at all, it is a pain response, which is why it builds and lingers rather than fading like pepper. Varieties differ enormously in both heat and flavour.',
    pairsWith: ['cumin', 'garlic', 'paprika', 'coriander-seed', 'ginger'],
    goesWith: ['Almost any savoury dish', 'Chocolate', 'Mango'],
    tip: 'The heat is concentrated in the white pith, not the seeds. Remove the pith to keep the flavour and lose the burn.',
  },
  {
    id: 'cayenne',
    name: 'Cayenne',
    group: 'Heat',
    description:
      'Ground dried hot chilli, sold for heat rather than character. Clean and sharp with little fruitiness behind it.',
    pairsWith: ['paprika', 'garlic', 'black-pepper', 'cumin'],
    goesWith: ['Rubs', 'Sauces', 'Cheese dishes', 'Seafood'],
  },
  {
    id: 'szechuan-pepper',
    name: 'Szechuan pepper',
    group: 'Heat',
    description:
      'Not hot and not a pepper. It produces a tingling, buzzing numbness on the lips and tongue, with a citrus-peel aroma. Unlike anything else on the shelf.',
    pairsWith: ['chilli', 'star-anise', 'fennel', 'ginger'],
    goesWith: ['Chicken', 'Tofu', 'Noodles', 'Aubergine'],
    tip: 'Pick out the black seeds, which are gritty. The husks hold the flavour.',
  },
  {
    id: 'smoked-paprika',
    name: 'Smoked paprika',
    group: 'Smoky',
    description:
      'Paprika dried over oak smoke. Deeply savoury and unmistakably barbecue-like, capable of making an oven-cooked dish taste as though it met fire.',
    pairsWith: ['garlic', 'cumin', 'chilli', 'oregano-note'],
    goesWith: ['Chorizo dishes', 'Beans', 'Chicken', 'Roast potatoes', 'Rice'],
    tip: 'Very easy to overuse. It takes over a dish faster than you expect.',
  },
  {
    id: 'fenugreek',
    name: 'Fenugreek',
    group: 'Bitter and toasty',
    description:
      'Smells strongly of curry powder and maple syrup at once. Distinctly bitter, and that bitterness is a feature when balanced against sweet and sour elements.',
    pairsWith: ['cumin', 'turmeric', 'mustard-seed', 'coriander-seed'],
    goesWith: ['Curries', 'Pickles', 'Lentils', 'Potato dishes'],
    tip: 'Toast it barely at all. Push it too far and the bitterness becomes the only thing you can taste.',
  },
  {
    id: 'ajwain',
    name: 'Ajwain',
    group: 'Bitter and toasty',
    description:
      'Tiny seeds tasting powerfully of thyme with a bitter, almost medicinal edge. Small quantities go a very long way.',
    pairsWith: ['cumin', 'chilli', 'turmeric', 'fenugreek'],
    goesWith: ['Fried snacks', 'Flatbreads', 'Lentils', 'Root vegetables'],
  },
  {
    id: 'celery-seed',
    name: 'Celery seed',
    group: 'Bitter and toasty',
    description:
      'Concentrated celery with a bitter finish. Savoury and slightly salty in character even without salt.',
    pairsWith: ['mustard-seed', 'black-pepper', 'paprika'],
    goesWith: ['Coleslaw', 'Pickles', 'Tomato juice', 'Stocks'],
  },
  {
    id: 'saffron',
    name: 'Saffron',
    group: 'Floral',
    description:
      'Honeyed, hay-like and faintly metallic, with a colour out of all proportion to the quantity used. Expensive for good reason: it is hand-picked stigmas.',
    pairsWith: ['cardamom', 'cinnamon', 'garlic', 'paprika'],
    goesWith: ['Rice', 'Fish stews', 'Chicken', 'Custards'],
    tip: 'Steep the threads in a little warm liquid first, then add liquid and all. Dropping them in dry wastes most of it.',
  },
]

export const BLENDS: Blend[] = [
  {
    id: 'garam-masala',
    name: 'Garam masala',
    origin: 'North India',
    components: [
      { id: 'cumin', parts: 4 },
      { id: 'coriander-seed', parts: 4 },
      { id: 'cardamom', parts: 2 },
      { id: 'black-pepper', parts: 2 },
      { id: 'cinnamon', parts: 1 },
      { id: 'clove', parts: 1 },
    ],
    description:
      'A warming finishing blend rather than a base. Every family and region makes it differently, and heat is not really the point despite the name.',
    note: 'Toast the whole seeds before grinding, and add it near the end of cooking so the aromatics are not boiled away.',
  },
  {
    id: 'five-spice',
    name: 'Chinese five spice',
    origin: 'China',
    components: [
      { id: 'star-anise', parts: 2 },
      { id: 'fennel', parts: 2 },
      { id: 'cinnamon', parts: 1 },
      { id: 'clove', parts: 1 },
      { id: 'szechuan-pepper', parts: 1 },
    ],
    description:
      'Dominated by star anise and built to cut through fat, which is why it belongs with pork and duck.',
    note: 'Assertive. A teaspoon will season a whole joint, and more is not better.',
  },
  {
    id: 'ras-el-hanout',
    name: 'Ras el hanout',
    origin: 'North Africa',
    components: [
      { id: 'cumin', parts: 3 },
      { id: 'coriander-seed', parts: 3 },
      { id: 'ginger', parts: 2 },
      { id: 'cinnamon', parts: 2 },
      { id: 'turmeric', parts: 2 },
      { id: 'cardamom', parts: 1 },
      { id: 'clove', parts: 1 },
    ],
    description:
      'The name means something like "top of the shop", and traditionally it is the seller showing off. Composition varies wildly, often running to a dozen or more spices.',
    note: 'The one most worth treating as a sketch. No two shops sell the same thing, so adjust hard and write down what you did.',
  },
  {
    id: 'baharat',
    name: 'Baharat',
    origin: 'Middle East',
    components: [
      { id: 'black-pepper', parts: 3 },
      { id: 'cumin', parts: 3 },
      { id: 'coriander-seed', parts: 2 },
      { id: 'paprika', parts: 2 },
      { id: 'cinnamon', parts: 1 },
      { id: 'clove', parts: 1 },
    ],
    description:
      'An all-purpose warm savoury blend, peppery and slightly sweet. Good on lamb, mince and roast vegetables.',
    note: 'Pepper-led, so it works as a rub straight onto meat without anything else.',
  },
  {
    id: 'panch-phoron',
    name: 'Panch phoron',
    origin: 'Bengal',
    components: [
      { id: 'fennel', parts: 1 },
      { id: 'mustard-seed', parts: 1 },
      { id: 'fenugreek', parts: 1 },
      { id: 'cumin', parts: 1 },
      { id: 'caraway', parts: 1 },
    ],
    description:
      'Five whole seeds in equal measure, used whole rather than ground. Fried in hot oil at the start to flavour the fat itself.',
    note: 'The one blend where equal parts really is the rule. Fenugreek is what to watch: let it go too dark and the whole pan turns bitter.',
  },
  {
    id: 'berbere',
    name: 'Berbere',
    origin: 'Ethiopia and Eritrea',
    components: [
      { id: 'chilli', parts: 6 },
      { id: 'coriander-seed', parts: 2 },
      { id: 'ginger', parts: 1 },
      { id: 'fenugreek', parts: 1 },
      { id: 'cardamom', parts: 1 },
      { id: 'allspice', parts: 1 },
    ],
    description:
      'Hot and complex, with chilli leading and a distinct bitter-sweet backbone underneath from the fenugreek and warm spices.',
    note: 'The chilli is most of it, so the heat of yours decides the heat of the blend. Start with a mild one.',
  },
  {
    id: 'jerk',
    name: 'Jerk seasoning',
    origin: 'Jamaica',
    components: [
      { id: 'allspice', parts: 4 },
      { id: 'black-pepper', parts: 2 },
      { id: 'chilli', parts: 2 },
      { id: 'garlic', parts: 2 },
      { id: 'cinnamon', parts: 1 },
      { id: 'nutmeg', parts: 1 },
    ],
    description:
      'Built around allspice and fierce chilli heat, usually with thyme and spring onion in the wet version. Traditionally smoked as well as spiced.',
    note: 'This is the dry rub. For the wet marinade, blend it with spring onion, thyme, soy and lime.',
  },
]

/** Some pairings reference flavours we do not stock as spices in their own right. */
export const NON_SPICE_NOTES: Record<string, string> = {
  'thyme-note': 'Thyme',
  'oregano-note': 'Oregano',
  'sesame-note': 'Sesame',
  'scotch-bonnet': 'Scotch bonnet chilli',
}
