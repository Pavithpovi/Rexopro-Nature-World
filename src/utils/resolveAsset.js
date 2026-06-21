/**
 * Resolves an asset path to a correct URL, supporting base URLs in Vite (e.g. for GitHub Pages).
 */
export function getImageUrl(path) {
  if (!path) return '';
  
  // If it's already an external URL or data URI, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Remove leading slash if present to avoid double-slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Resolve with Vite's BASE_URL (defaults to '/' in dev)
  const base = import.meta.env.BASE_URL || '/';
  const baseSlash = base.endsWith('/') ? base : `${base}/`;

  return `${baseSlash}${cleanPath}`;
}

const safeAnimalTags = {
  // Insects / Bugs (preventing cars, machinery)
  'beetle': 'insect,beetle',
  'caterpillar': 'insect,caterpillar',
  'fly': 'insect,fly',
  'bee': 'honeybee',
  'cockroach': 'cockroach,insect',
  'mosquito': 'mosquito,insect',
  'ladybugs': 'ladybug',
  'grasshopper': 'grasshopper,insect',
  'butterfly': 'butterfly,insect',
  'moth': 'moth,insect',
  'dragonfly': 'dragonfly,insect',
  
  // Marine (preventing non-aquatic things)
  'crab': 'crab,crustacean',
  'lobster': 'lobster,crustacean',
  'oyster': 'oyster,shellfish',
  'seahorse': 'seahorse,ocean',
  'starfish': 'starfish,ocean',
  'jellyfish': 'jellyfish,ocean',
  'squid': 'squid,ocean',
  'octopus': 'octopus,ocean',
  'whale': 'whale,ocean',
  'shark': 'shark,ocean',
  'dolphin': 'dolphin,ocean',
  'seal': 'seal,ocean',
  
  // Birds (preventing planes, human things)
  'crow': 'crow,bird',
  'duck': 'duck,bird',
  'eagle': 'eagle,bird',
  'flamingo': 'flamingo,bird',
  'goose': 'goose,bird',
  'hornbill': 'hornbill,bird',
  'hummingbird': 'hummingbird,bird',
  'owl': 'owl,bird',
  'parrot': 'parrot,bird',
  'pelecaniformes': 'pelican,bird',
  'penguin': 'penguin,bird',
  'pigeon': 'pigeon,bird',
  'sandpiper': 'sandpiper,bird',
  'sparrow': 'sparrow,bird',
  'swan': 'swan,bird',
  'turkey': 'turkey,bird',
  'woodpecker': 'woodpecker,bird',
  
  // Land Mammals (preventing cars, humans, mascots)
  'fox': 'wildlife,fox',
  'wolf': 'wildlife,wolf',
  'bear': 'wildlife,bear',
  'badger': 'wildlife,badger',
  'bat': 'bat,mammal',
  'coyote': 'coyote,wildlife',
  'deer': 'deer,wildlife',
  'hare': 'hare,wildlife',
  'hedgehog': 'hedgehog,wildlife',
  'hyena': 'hyena,wildlife',
  'kangaroo': 'kangaroo,wildlife',
  'koala': 'koala,wildlife',
  'leopard': 'leopard,wildlife',
  'lion': 'lion,wildlife',
  'okapi': 'okapi,wildlife',
  'panda': 'panda,wildlife',
  'raccoon': 'raccoon,wildlife',
  'rhinoceros': 'rhinoceros,wildlife',
  'tiger': 'tiger,wildlife',
  'wombat': 'wombat,wildlife',
  'zebra': 'zebra,wildlife',
  'bison': 'bison,wildlife',
  'boar': 'boar,wildlife'
};

/**
 * Returns a highly-refined online tag to search Flickr/LoremFlickr for actual animal photos.
 */
export function getSafeAnimalTag(name, sector) {
  if (!name) return 'wildlife';
  
  let cleanName = name.split(' Extra-')[0].split(' Type-')[0].split(' v')[0].toLowerCase();
  cleanName = cleanName.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  
  if (safeAnimalTags[cleanName]) {
    return safeAnimalTags[cleanName];
  }
  
  // Fallback modifiers based on sector/realm to prevent cars/planes
  if (sector === 'marine') {
    return `${cleanName},marine-life`;
  }
  if (sector === 'birds') {
    return `${cleanName},bird`;
  }
  return `${cleanName},wildlife`;
}
