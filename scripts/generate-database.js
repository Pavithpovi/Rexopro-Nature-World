import fs from 'fs';
import path from 'path';

// Predefined lists of land, marine, and bird species to pad the database up to 101 entries per sector.
const landPadding = [
  ["African Lion", "Panthera leo", "Savannah", "Carnivore", "10-14 years", "1.2m", "190kg", "80 km/h", "A majestic social predator known for its impressive mane and powerful pride structure."],
  ["Bengal Tiger", "Panthera tigris", "Rainforest", "Carnivore", "10-15 years", "1.1m", "220kg", "65 km/h", "The largest of all wild cats, recognized by its dark vertical stripes on reddish-orange fur."],
  ["African Elephant", "Loxodonta africana", "Savannah/Forest", "Herbivore", "60-70 years", "3.3m", "6000kg", "40 km/h", "The largest terrestrial mammal, boasting large ears, a long trunk, and prominent tusks."],
  ["Grizzly Bear", "Ursus arctos horribilis", "Temperate Forest", "Omnivore", "20-25 years", "1.5m (shoulder)", "360kg", "56 km/h", "A powerful subspecies of brown bear with a distinctive shoulder hump and long claws."],
  ["Red Kangaroo", "Osphranter rufus", "Arid Grassland", "Herbivore", "15-20 years", "1.6m", "90kg", "56 km/h", "The largest marsupial, native to Australia, famous for its powerful hind legs and hopping locomotion."],
  ["Gray Wolf", "Canis lupus", "Tundra/Forest", "Carnivore", "6-8 years", "0.8m", "40kg", "60 km/h", "A highly social pack predator with an essential role in maintaining ecological balance."],
  ["Giant Panda", "Ailuropoda melanoleuca", "Bamboo Forest", "Herbivore", "15-20 years", "0.9m", "110kg", "32 km/h", "A beloved black-and-white bear that feeds almost exclusively on bamboo shoots and leaves."],
  ["Koala", "Phascolarctos cinereus", "Eucalyptus Forest", "Herbivore", "13-18 years", "0.8m", "12kg", "10 km/h", "An arboreal marsupial that spends its life sleeping and eating eucalyptus leaves."],
  ["Reticulated Giraffe", "Giraffa camelopardalis reticulata", "Savannah", "Herbivore", "20-25 years", "5.5m", "1200kg", "60 km/h", "The tallest living land animal, instantly recognizable by its long neck and patched coat."],
  ["Cheetah", "Acinonyx jubatus", "Grassland", "Carnivore", "10-12 years", "0.9m", "50kg", "120 km/h", "The fastest land animal on Earth, built for short, high-speed sprints with a slender body."],
  ["Hippopotamus", "Hippopotamus amphibius", "Rivers/Swamps", "Herbivore", "40-50 years", "1.5m", "1500kg", "30 km/h", "A massive semi-aquatic mammal, known for its territorial behavior and large canine tusks."],
  ["White Rhinoceros", "Ceratotherium simum", "Grassland", "Herbivore", "40-50 years", "1.8m", "2300kg", "50 km/h", "A giant herbivore with a wide mouth and two prominent horns made of keratin."],
  ["Mountain Gorilla", "Gorilla beringei beringei", "Cloud Forest", "Herbivore", "35-40 years", "1.7m", "160kg", "40 km/h", "A critically endangered ape that lives in close-knit family groups led by a silverback."],
  ["Chimpanzee", "Pan Paniscus", "Tropical Forest", "Omnivore", "30-40 years", "1.2m", "50kg", "40 km/h", "One of humanity's closest living relatives, renowned for tool use and complex social behaviors."],
  ["Red Fox", "Vulpes vulpes", "Forest/Urban", "Omnivore", "3-5 years", "0.4m", "7kg", "50 km/h", "An adaptable, clever predator found globally, featuring a bushy white-tipped tail."],
  ["Platypus", "Ornithorhynchus anatinus", "Freshwater Rivers", "Carnivore", "10-15 years", "0.5m", "1.5kg", "8 km/h", "A unique egg-laying mammal with a duck-like bill, beaver-like tail, and otter-like webbed feet."],
  ["Fennec Fox", "Vulpes zerda", "Desert", "Omnivore", "10-14 years", "0.2m", "1.5kg", "32 km/h", "A small desert fox with oversized ears that help dissipate heat and locate prey underground."],
  ["Sloth", "Bradypus tridactylus", "Rainforest Canopy", "Herbivore", "20-30 years", "0.6m", "4.5kg", "0.25 km/h", "A famously slow-moving mammal that hosts green algae in its fur for camouflage."],
  ["Honey Badger", "Mellivora capensis", "Dry Savannah", "Omnivore", "7-8 years", "0.3m", "12kg", "30 km/h", "A fearless, thick-skinned creature known to fend off leopards, lions, and venomous snakes."],
  ["Capybara", "Hydrochoerus hydrochaeris", "Wetlands", "Herbivore", "8-10 years", "0.6m", "50kg", "35 km/h", "The world's largest rodent, exceptionally social and excellent at swimming in rivers."],
  ...Array.from({ length: 81 }, (_, i) => {
    const names = [
      ["Red Panda", "Ailurus fulgens", "Himalayan Forest", "Herbivore", "8-10 years", "0.3m", "5kg", "24 km/h", "A small, rust-colored forest dweller with a long, ringed tail and cat-like features."],
      ["Wolverine", "Gulo gulo", "Boreal Forest", "Carnivore", "8-10 years", "0.45m", "15kg", "48 km/h", "A solitary and muscular carnivore known for its incredible strength relative to its size."],
      ["Meerkat", "Suricata suricatta", "Desert/Grassland", "Omnivore", "10-14 years", "0.25m", "0.8kg", "32 km/h", "A small sentinel mongoose that stands on its hind legs to watch for sky predators."],
      ["Spotted Hyena", "Crocuta crocuta", "Savannah", "Carnivore", "12-15 years", "0.85m", "65kg", "60 km/h", "A highly social carnivore with a laugh-like vocalization and extremely powerful jaws."],
      ["Plains Zebra", "Equus quagga", "Savannah", "Herbivore", "20-25 years", "1.3m", "300kg", "65 km/h", "A wild horse relative famous for its unique black-and-white striped camouflage pattern."],
      ["Snow Leopard", "Panthera uncia", "Mountain Peaks", "Carnivore", "15-18 years", "0.6m", "45kg", "64 km/h", "A ghost-like mountain cat with a long, thick tail used for balance and warmth."]
    ];
    const template = names[i % names.length];
    return [
      `${template[0]} Extra-${i + 1}`,
      `${template[1]} exp-${i}`,
      template[2],
      template[3],
      template[4],
      template[5],
      `${parseFloat(template[6]) + i}kg`,
      template[7],
      `${template[8]} Specimen padding entry #${i+1}.`
    ];
  })
];

const marinePadding = [
  ["Blue Whale", "Balaenoptera musculus", "Deep Ocean", "Carnivore", "80-90 years", "30m", "170000kg", "30 km/h", "The largest creature ever known to have lived on Earth, feeding primarily on tiny krill."],
  ["Humpback Whale", "Megaptera novaeangliae", "Coastal Oceans", "Carnivore", "45-50 years", "16m", "36000kg", "25 km/h", "Renowned for its spectacular breaching displays and complex, haunting vocal songs."],
  ["Orca (Killer Whale)", "Orcinus orca", "Global Oceans", "Carnivore", "50-80 years", "8m", "6000kg", "56 km/h", "An apex predator and largest dolphin relative, hunting in highly organized family pods."],
  ["Bottlenose Dolphin", "Tursiops truncatus", "Warm Oceans", "Carnivore", "40-50 years", "2.5m", "300kg", "35 km/h", "Highly intelligent marine mammals known for their playful behavior and echolocation."],
  ["Sperm Whale", "Physeter macrocephalus", "Abyssal Zone", "Carnivore", "60-70 years", "16m", "40000kg", "30 km/h", "A deep-diving leviathan that hunts giant squid in the pitch-black ocean depths."],
  ["Beluga Whale", "Delphinapterus leucas", "Arctic Seas", "Carnivore", "35-50 years", "4.5m", "14000kg", "22 km/h", "A social white whale with a bulbous, flexible forehead used for communication."],
  ["Narwhal", "Monodon monoceros", "Arctic Ocean", "Carnivore", "40-50 years", "4.7m", "1600kg", "20 km/h", "The 'unicorn of the sea,' featuring a long spiral tusk which is actually an elongated tooth."],
  ["Manta Ray", "Mobula birostris", "Tropical Oceans", "Herbivore", "40-50 years", "7m (wingspan)", "1300kg", "24 km/h", "A gentle giant ray that glides gracefully through water, filtering plankton with its mouth."],
  ["Whale Shark", "Rhincodon typus", "Warm Oceans", "Carnivore", "70-100 years", "12m", "19000kg", "5 km/h", "The largest fish in the sea, decorated with a unique pattern of white spots and stripes."],
  ["Great White Shark", "Carcharodon carcharias", "Temperate Seas", "Carnivore", "70 years", "4.5m", "1100kg", "40 km/h", "A formidable predator equipped with rows of serrated teeth and acute sensory organs."],
  // ...add more padding array
  ...Array.from({ length: 91 }, (_, i) => {
    const names = [
      ["Tiger Shark", "Galeocerdo cuvier", "Tropical Waters", "Carnivore", "12-15 years", "3.5m", "600kg", "32 km/h", "A large predator known for taking almost any prey, carrying dark tiger stripes."],
      ["Dugong", "Dugong dugon", "Seagrass Meadows", "Herbivore", "70 years", "2.7m", "400kg", "10 km/h", "A cousin of the manatee with a fluked whale-like tail, living in coastal zones."],
      ["Walrus", "Odobenus rosmarus", "Arctic Shallows", "Carnivore", "30-40 years", "3.2m", "1000kg", "35 km/h", "A colossal pinniped characterized by long ivory tusks and bristly whiskers."],
      ["California Sea Lion", "Zalophus californianus", "Rocky Coast", "Carnivore", "15-20 years", "2.1m", "250kg", "40 km/h", "An extremely vocal, agile, and playful marine mammal seen resting on piers."],
      ["Electric Eel", "Electrophorus electricus", "Amazon Basin", "Carnivore", "15-22 years", "2m", "20kg", "8 km/h", "A freshwater predator capable of producing strong bio-electric shocks up to 860 volts."]
    ];
    const template = names[i % names.length];
    return [
      `${template[0]} Extra-${i + 1}`,
      `${template[1]} exp-${i}`,
      template[2],
      template[3],
      template[4],
      template[5],
      `${parseFloat(template[6]) + i}kg`,
      template[7],
      `${template[8]} Specimen padding entry #${i+1}.`
    ];
  })
];

const birdPadding = [
  ["Bald Eagle", "Haliaeetus leucocephalus", "Forest/Lakes", "Carnivore", "20-30 years", "0.9m", "4.5kg", "160 km/h", "The national symbol of the USA, boasting a pure white head and a sharp yellow beak."],
  ["Golden Eagle", "Aquila chrysaetos", "Mountain Valleys", "Carnivore", "20-25 years", "1m", "5kg", "240 km/h", "One of the largest, fastest, and most nimble birds of prey, capable of hunting young deer."],
  ["Peregrine Falcon", "Falco peregrinus", "Open Country/Cliffs", "Carnivore", "12-15 years", "0.45m", "1kg", "389 km/h", "The fastest creature in the animal kingdom, diving at extreme speeds to catch prey mid-air."],
  ["Barn Owl", "Tyto alba", "Grassland/Farms", "Carnivore", "4-10 years", "0.35m", "0.5kg", "30 km/h", "A nocturnal hunter with a heart-shaped facial disc that funnels sound to its sensitive ears."],
  ["Snowy Owl", "Bubo scandiacus", "Tundra", "Carnivore", "9-15 years", "0.65m", "2kg", "80 km/h", "A striking, white owl of the cold north, which hunts by day and night using sharp eyesight."],
  ...Array.from({ length: 96 }, (_, i) => {
    const names = [
      ["Swan", "Cygnus olor", "Lakes", "Herbivore", "15-20 years", "1.4m", "11kg", "45 km/h", "Elegant waterfowl forming long breeding pairs, with white feathers and curved necks."],
      ["Woodpecker", "Picidae", "Woodlands", "Insectivore", "6-11 years", "0.25m", "0.15kg", "25 km/h", "Taps tree trunks with its beak to find grubs and communicate via drumming."],
      ["Falcon", "Falco peregrinus", "Cliffs", "Carnivore", "12-15 years", "0.4m", "1.1kg", "320 km/h", "A small, rapid raptor that dives to capture smaller birds mid-flight."],
      ["Hummingbird", "Trochilidae", "Gardens", "Herbivore", "3-5 years", "0.08m", "0.004kg", "48 km/h", "Lively tiny bird feeding on sweet flower nectar while hovering in place."],
      ["Parrot", "Psittaciformes", "Rainforest", "Omnivore", "30-50 years", "0.35m", "0.6kg", "35 km/h", "Colorful tropical bird with a curved bill and high intelligence."]
    ];
    const template = names[i % names.length];
    return [
      `${template[0]} Extra-${i + 1}`,
      `${template[1]} exp-${i}`,
      template[2],
      template[3],
      template[4],
      template[5],
      `${parseFloat(template[6]) + (i * 0.1)}kg`,
      template[7],
      `${template[8]} Specimen padding entry #${i+1}.`
    ];
  })
];

// Helper to generate unique LoremFlickr images using search tags and seed values
const resolvedTagsCache = {};

async function resolveWorkingTag(name, sector) {
  let cleanName = name.split(' Extra-')[0].toLowerCase();
  // Strip parentheses and anything inside them
  cleanName = cleanName.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  
  if (resolvedTagsCache[cleanName]) {
    return resolvedTagsCache[cleanName];
  }

  const words = cleanName.split(' ');
  const lastWord = words[words.length - 1];

  // Candidates in order of preference (completely avoiding raw "animal" and other loose tags that contain cars/humans)
  const candidates = [
    cleanName.replace(/ /g, '-'),                             // "grizzly-bear"
    lastWord,                                                 // "bear"
    `wildlife,${lastWord}`,                                   // "wildlife,bear"
    `fauna,${lastWord}`                                       // "fauna,bear"
  ];

  // Category specific fallbacks
  const sectorFallbacks = {
    land: ["mammal", "wildlife", "fauna"],
    marine: ["marine-life", "fauna"],
    birds: ["bird", "wildlife", "fauna"]
  };

  const fallbacks = sectorFallbacks[sector] || ["wildlife", "fauna"];
  candidates.push(...fallbacks);

  for (const tag of candidates) {
    const url = `https://loremflickr.com/800/600/${tag}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 200) {
        console.log(`Resolved working tag for "${cleanName}" (${sector}) -> "${tag}"`);
        resolvedTagsCache[cleanName] = tag;
        return tag;
      }
    } catch (e) {
      // ignore
    }
  }

  resolvedTagsCache[cleanName] = fallbacks[0];
  return fallbacks[0];
}

function getUniqueFlickrImagesWithTag(tag, animalIndex) {
  const result = [];
  for (let idx = 0; idx < 8; idx++) {
    const width = idx % 2 === 0 ? 3840 : 2160;
    const height = idx % 2 === 0 ? 2160 : 3840;
    const seed = (animalIndex * 8) + idx + 5000;
    result.push(`https://loremflickr.com/${width}/${height}/${tag}?lock=${seed}`);
  }
  return result;
}

// Local Dictionary Map
const animalDictionary = {
  "antelope": ["Antelope", "Antilocapra americana", "land", "Grasslands", "Herbivore", "10-15 years", "1.0m", "50kg", "88 km/h", "An extremely swift mammal found in open grasslands, featuring beautiful curved horns."],
  "badger": ["Badger", "Meles meles", "land", "Forest/Grassland", "Omnivore", "10-12 years", "0.75m", "11kg", "30 km/h", "A stout, burrowing carnivore recognized by its striking black and white striped head."],
  "bat": ["Bat", "Microchiroptera", "land", "Caves/Forests", "Insectivore", "10-20 years", "0.15m", "0.1kg", "40 km/h", "The only mammal capable of true sustained flight, navigating using advanced echolocation."],
  "bear": ["Bear", "Ursus", "land", "Forest/Tundra", "Omnivore", "20-25 years", "1.2m (height)", "250kg", "48 km/h", "A large, powerful omnivore with a thick coat of fur and heavy claws used for digging."],
  "bee": ["Bee", "Apis", "land", "Gardens/Meadows", "Herbivore", "5-6 weeks", "0.015m", "0.0001kg", "20 km/h", "A crucial pollinator that lives in complex social colonies, producing sweet honey."],
  "beetle": ["Beetle", "Coleoptera", "land", "Leaf Litter/Soil", "Omnivore", "1-2 years", "0.03m", "0.005kg", "5 km/h", "An incredibly diverse insect with a hardened pair of front wings acting as a protective shell."],
  "bison": ["Bison", "Bison bison", "land", "Grasslands/Plains", "Herbivore", "15-20 years", "1.8m", "900kg", "56 km/h", "A massive hump-shouldered wild ox that once roamed North American plains in giant herds."],
  "boar": ["Boar", "Sus scrofa", "land", "Boreal Forest", "Omnivore", "10-14 years", "0.9m", "80kg", "40 km/h", "A wild ancestor of the domestic pig, equipped with sharp canine tusks and a tough bristly coat."],
  "butterfly": ["Butterfly", "Lepidoptera", "land", "Meadows/Gardens", "Herbivore", "2-4 weeks", "0.05m", "0.001kg", "12 km/h", "A beautiful insect with colorful, scale-covered wings that undergoes complete metamorphosis."],
  "cat": ["Cat", "Felis catus", "land", "Domestic/Urban", "Carnivore", "12-15 years", "0.25m", "4.5kg", "48 km/h", "A small, agile domesticated carnivore prized by humans for companionship and pest control."],
  "caterpillar": ["Caterpillar", "Lepidoptera larva", "land", "Vegetation", "Herbivore", "2-4 weeks", "0.04m", "0.002kg", "0.1 km/h", "The worm-like larval stage of butterflies and moths, possessing an insatiable appetite for leaves."],
  "chimpanzee": ["Chimpanzee", "Pan troglodytes", "land", "Rainforest", "Omnivore", "35-40 years", "1.2m", "45kg", "40 km/h", "One of humanity's closest genetic relatives, highly intelligent and skilled in tool usage."],
  "cockroach": ["Cockroach", "Blattodea", "land", "Crevices/Dark places", "Omnivore", "1-2 years", "0.04m", "0.003kg", "5 km/h", "An incredibly resilient insect capable of surviving extreme conditions and environments."],
  "cow": ["Cow", "Bos taurus", "land", "Pasture/Farms", "Herbivore", "15-20 years", "1.4m", "700kg", "25 km/h", "A common domesticated herbivore raised globally for milk, meat, and agricultural labor."],
  "coyote": ["Coyote", "Canis latrans", "land", "Grassland/Desert", "Carnivore", "10-14 years", "0.6m", "15kg", "65 km/h", "An adaptable North American canine known for its distinctive midnight howling and clever hunting."],
  "crab": ["Crab", "Brachyura", "marine", "Coastal Shallows", "Omnivore", "3-5 years", "0.3m", "1.2kg", "6 km/h", "A decapod crustacean equipped with a thick exoskeleton and a pair of powerful pinching claws."],
  "crow": ["Crow", "Corvus", "birds", "Woodlands/Urban", "Omnivore", "7-8 years", "0.45m", "0.5kg", "45 km/h", "An exceptionally intelligent bird known for problem-solving, memory, and complex communication."],
  "deer": ["Deer", "Cervidae", "land", "Forest/Meadow", "Herbivore", "10-12 years", "0.9m", "80kg", "50 km/h", "A graceful hoofed herbivore, the males of which grow and shed branched antlers annually."],
  "dog": ["Dog", "Canis lupus familiaris", "land", "Domestic/Urban", "Omnivore", "10-13 years", "0.5m", "25kg", "48 km/h", "The first domesticated animal, bred into hundreds of unique shapes and sizes for work and companionship."],
  "dolphin": ["Dolphin", "Delphinidae", "marine", "Coastal Waters", "Carnivore", "40-50 years", "2.5m", "200kg", "35 km/h", "A highly intelligent semi-aquatic mammal known for its playful social behavior and echolocation."],
  "donkey": ["Donkey", "Equus asinus", "land", "Arid/Farms", "Herbivore", "25-30 years", "1.1m", "200kg", "24 km/h", "A sturdy, patient pack animal related to horses, known for its long ears and distinct bray."],
  "dragonfly": ["Dragonfly", "Anisoptera", "land", "Wetlands/Ponds", "Carnivore", "6 months", "0.08m", "0.001kg", "54 km/h", "An ancient aerial predator with large multifaceted eyes and four powerful wings that hover with agility."],
  "duck": ["Duck", "Anatidae", "birds", "Wetlands/Lakes", "Omnivore", "5-10 years", "0.5m", "1.2kg", "80 km/h", "A semi-aquatic waterfowl featuring webbed feet, a flat bill, and waterproof feathers."],
  "eagle": ["Eagle", "Accipitridae", "birds", "Mountain Peaks", "Carnivore", "20-25 years", "0.9m", "4.5kg", "160 km/h", "A powerful bird of prey possessing keen eyesight, sharp talons, and a hooked beak."],
  "elephant": ["Elephant", "Loxodonta africana", "land", "Savannah", "Herbivore", "60-70 years", "3.3m", "5500kg", "40 km/h", "The largest living land animal, characterized by its long trunk, large ears, and ivory tusks."],
  "flamingo": ["Flamingo", "Phoenicopteridae", "birds", "Salt Lakes", "Omnivore", "30-40 years", "1.2m", "3kg", "50 km/h", "A tall, slender wading bird with pink feathers derived from carotenoid pigments in its diet."],
  "fly": ["Fly", "Diptera", "land", "Global", "Omnivore", "2-4 weeks", "0.008m", "0.0001kg", "8 km/h", "A common insect with a single pair of flight wings and specialized sponge-like mouthparts."],
  "fox": ["Fox", "Vulpes vulpes", "land", "Woodlands/Urban", "Omnivore", "3-5 years", "0.4m", "6kg", "50 km/h", "An adaptable, clever carnivore with a bushy white-tipped tail and a sharp snout."],
  "goat": ["Goat", "Capra hircus", "land", "Mountain Slopes", "Herbivore", "10-15 years", "0.7m", "50kg", "15 km/h", "A hardy, sure-footed domesticated ruminant capable of climbing steep mountain faces."],
  "goldfish": ["Goldfish", "Carassius auratus", "marine", "Freshwater", "Omnivore", "5-10 years", "0.15m", "0.1kg", "4 km/h", "A small, colorful domestic carp that has been selectively bred for aquariums for centuries."],
  "goose": ["Goose", "Anserinae", "birds", "Lakes/Fields", "Herbivore", "10-15 years", "0.8m", "4.5kg", "60 km/h", "A large migratory waterfowl known for its protective nesting habits and loud honking."],
  "gorilla": ["Gorilla", "Gorilla", "land", "Cloud Forest", "Herbivore", "35-40 years", "1.6m", "150kg", "40 km/h", "A massive, powerful ape that lives in closely bonded family groups led by a silverback."],
  "grasshopper": ["Grasshopper", "Caelifera", "land", "Grasslands/Fields", "Herbivore", "1 year", "0.05m", "0.002kg", "8 km/h", "A plant-eating insect equipped with powerful hind legs for jumping long distances."],
  "hamster": ["Hamster", "Cricetinae", "land", "Grasslands/Domestic", "Omnivore", "2-3 years", "0.12m", "0.12kg", "5 km/h", "A small, nocturnal rodent featuring expandable cheek pouches used to carry food to its burrow."],
  "hare": ["Hare", "Lepus", "land", "Open Meadows", "Herbivore", "4-8 years", "0.55m", "4kg", "72 km/h", "A swift, long-eared mammal related to rabbits, living in simple nests rather than burrows."],
  "hedgehog": ["Hedgehog", "Erinaceinae", "land", "Woodlands/Gardens", "Omnivore", "3-6 years", "0.22m", "0.6kg", "6 km/h", "A small spiny mammal that rolls into a tight protective ball when threatened."],
  "hippopotamus": ["Hippopotamus", "Hippopotamus amphibius", "land", "Rivers/Swamps", "Herbivore", "40-50 years", "1.5m", "1500kg", "30 km/h", "A massive semi-aquatic mammal, known for its territorial behavior and large canine tusks."],
  "hornbill": ["Hornbill", "Bucerotidae", "birds", "Tropical Forest", "Omnivore", "20-30 years", "0.8m", "3kg", "30 km/h", "A tropical bird characterized by a long, down-curved bill which often displays a decorative casque."],
  "horse": ["Horse", "Equus caballus", "land", "Grasslands/Farms", "Herbivore", "25-30 years", "1.6m", "500kg", "70 km/h", "An elegant, powerful herd mammal domesticated by humans for transport and agriculture."],
  "hummingbird": ["Hummingbird", "Trochilidae", "birds", "Forest Margins", "Herbivore", "3-5 years", "0.08m", "0.004kg", "48 km/h", "A tiny nectar feeder capable of hovering mid-air and flying backwards by beating wings rapidly."],
  "hyena": ["Hyena", "Hyaenidae", "land", "Savannah", "Carnivore", "12-15 years", "0.85m", "60kg", "60 km/h", "A scavenger-predator with extremely strong jaws and a distinctive cackling laugh vocalization."],
  "jellyfish": ["Jellyfish", "Medusozoa", "marine", "Open Ocean", "Carnivore", "1 year", "0.4m", "2kg", "2 km/h", "A gelatinous drift animal with stinging tentacles used to capture small fish and plankton."],
  "kangaroo": ["Kangaroo", "Macropodidae", "land", "Australian Outback", "Herbivore", "15-20 years", "1.5m", "80kg", "56 km/h", "A large hopping marsupial that raises its young in a front belly pouch."],
  "koala": ["Koala", "Phascolarctos cinereus", "land", "Eucalyptus Forest", "Herbivore", "13-18 years", "0.8m", "10kg", "10 km/h", "An arboreal Australian marsupial that feeds almost exclusively on eucalyptus leaves."],
  "ladybugs": ["Ladybug", "Coccinellidae", "land", "Gardens/Fields", "Carnivore", "1 year", "0.008m", "0.0001kg", "5 km/h", "A small dome-shaped beetle, red with black spots, prized by gardeners for eating pests."],
  "leopard": ["Leopard", "Panthera pardus", "land", "Forests/Savannah", "Carnivore", "12-17 years", "0.7m", "60kg", "58 km/h", "A solitary, athletic wild cat that drags its heavy prey high up into tree branches."],
  "lion": ["Lion", "Panthera leo", "land", "Savannah", "Carnivore", "10-14 years", "1.2m", "190kg", "80 km/h", "A majestic social cat known for the male's dark mane and coordinated pride hunting."],
  "lizard": ["Lizard", "Lacertilia", "land", "Forests/Deserts", "Omnivore", "5-10 years", "0.25m", "0.3kg", "15 km/h", "A diverse reptile with a scaly skin, four legs, and the ability to shed its tail to escape predators."],
  "lobster": ["Lobster", "Nephropidae", "marine", "Rocky Seabed", "Carnivore", "30-50 years", "0.4m", "4kg", "4 km/h", "A bottom-dwelling marine crustacean with large, unequal claws used for capturing food."],
  "mosquito": ["Mosquito", "Culicidae", "land", "Swamps/Global", "Omnivore", "2-4 weeks", "0.006m", "0.000002kg", "2 km/h", "A small fly whose females pierce skin to feed on blood to develop their eggs."],
  "moth": ["Moth", "Lepidoptera", "land", "Woodlands/Global", "Herbivore", "1-2 months", "0.03m", "0.001kg", "10 km/h", "A nocturnal cousin of the butterfly, featuring feathered antennae and muted wing camouflages."],
  "mouse": ["Mouse", "Mus musculus", "land", "Fields/Urban", "Omnivore", "1-2 years", "0.08m", "0.02kg", "12 km/h", "A small, adaptable rodent with large rounded ears and a long hairless tail."],
  "octopus": ["Octopus", "Octopoda", "marine", "Coral Reefs", "Carnivore", "1-3 years", "1.2m", "15kg", "40 km/h", "A highly intelligent, eight-armed cephalopod capable of advanced camouflage and problem solving."],
  "okapi": ["Okapi", "Okapia johnstoni", "land", "Rainforest", "Herbivore", "20-30 years", "1.5m", "250kg", "60 km/h", "A solitary forest animal related to giraffes, featuring zebra-like stripes on its legs."],
  "orangutan": ["Orangutan", "Pongo", "land", "Rainforest Canopy", "Herbivore", "35-45 years", "1.3m", "75kg", "5 km/h", "A red-haired arboreal ape known for its long arms and intelligent nest-building habits."],
  "otter": ["Otter", "Lutrinae", "marine", "Rivers/Coasts", "Carnivore", "10-15 years", "1.1m", "12kg", "9 km/h", "A playful semi-aquatic mammal with dense waterproof fur and webbed feet."],
  "owl": ["Owl", "Strigiformes", "birds", "Woodlands", "Carnivore", "10-15 years", "0.4m", "1.5kg", "60 km/h", "A nocturnal bird of prey with large forward-facing eyes and silent flight feathers."],
  "ox": ["Ox", "Bos taurus", "land", "Farms/Fields", "Herbivore", "15-20 years", "1.6m", "900kg", "10 km/h", "A powerful, castrated domestic bull trained as a draft animal for pulling plows."],
  "oyster": ["Oyster", "Ostreidae", "marine", "Estuary Beds", "Filter Feeder", "10-20 years", "0.1m", "0.2kg", "0 km/h", "A bivalve mollusk that filters organic particles from water and can secrete pearls."],
  "panda": ["Panda", "Ailuropoda melanoleuca", "land", "Bamboo Forest", "Herbivore", "15-20 years", "0.9m", "110kg", "32 km/h", "A beloved black-and-white bear that feeds almost exclusively on bamboo stalks."],
  "parrot": ["Parrot", "Psittaciformes", "birds", "Tropical Forest", "Omnivore", "40-60 years", "0.4m", "0.8kg", "40 km/h", "A colorful, vocal bird known for its curved bill, intelligence, and mimicry of speech."],
  "pelecaniformes": ["Pelican", "Pelecaniformes", "birds", "Coasts/Lakes", "Carnivore", "15-25 years", "1.2m", "6kg", "56 km/h", "A family of large waterbirds including pelicans, featuring throat pouches for scooping fish."],
  "penguin": ["Penguin", "Spheniscidae", "birds", "Antarctic Coasts", "Carnivore", "15-20 years", "0.8m", "15kg", "8 km/h (swim)", "A flightless, tuxedoed marine bird that glides through sub-zero waters to catch fish."],
  "pig": ["Pig", "Sus domesticus", "land", "Farms/Fields", "Omnivore", "15-20 years", "0.9m", "150kg", "18 km/h", "An extremely intelligent domesticated mammal with an excellent sense of smell."],
  "pigeon": ["Pigeon", "Columbidae", "birds", "Cities/Forests", "Herbivore", "3-5 years", "0.3m", "0.35kg", "80 km/h", "A stout-bodied bird with a cooing voice, highly adapted to urban environments globally."],
  "porcupine": ["Porcupine", "Erethizontidae", "land", "Forests/Deserts", "Herbivore", "15-18 years", "0.75m", "12kg", "6 km/h", "A slow-moving rodent covered in thousands of sharp, defensive barbed quills."],
  "possum": ["Possum", "Phalangeriformes", "land", "Woodlands", "Omnivore", "4-8 years", "0.45m", "4kg", "15 km/h", "A nocturnal marsupial native to Australia, featuring a long prehensile tail."],
  "raccoon": ["Raccoon", "Procyon lotor", "land", "Forests/Suburbs", "Omnivore", "3-5 years", "0.5m", "8kg", "24 km/h", "A clever mammal with a black mask around its eyes and a ringed tail, famous for washing food."],
  "rat": ["Rat", "Rattus", "land", "Fields/Cities", "Omnivore", "2-3 years", "0.2m", "0.3kg", "12 km/h", "An extremely adaptable, successful rodent with a long hairless tail and high intelligence."],
  "reindeer": ["Reindeer", "Rangifer tarandus", "land", "Tundra/Taiga", "Herbivore", "15-18 years", "1.1m", "150kg", "60 km/h", "An arctic deer species, where both males and females grow antlers, adapted to freezing cold."],
  "rhinoceros": ["Rhinoceros", "Rhinocerotidae", "land", "Savannah/Forest", "Herbivore", "35-45 years", "1.6m", "1800kg", "50 km/h", "A thick-skinned giant herbivore with one or two horns composed of compacted keratin."],
  "sandpiper": ["Sandpiper", "Scolopacidae", "birds", "Shorelines", "Carnivore", "5-10 years", "0.22m", "0.1kg", "45 km/h", "A small wading bird that runs along sandy beaches to peck at tiny shoreline invertebrates."],
  "seahorse": ["Seahorse", "Hippocampus", "marine", "Seagrass Beds", "Carnivore", "1-5 years", "0.12m", "0.05kg", "1.5 km/h", "A small, unique marine fish with an upright posture, horse-like head, and prehensile tail."],
  "seal": ["Seal", "Pinnipedia", "marine", "Rocky Coasts", "Carnivore", "25-30 years", "1.6m", "120kg", "25 km/h", "A sleek semi-aquatic marine mammal with webbed flippers that swims with speed."],
  "shark": ["Shark", "Selachimorpha", "marine", "Oceans", "Carnivore", "30-70 years", "3.5m", "500kg", "40 km/h", "An ancient cartilaginous predator equipped with multiple rows of replaceable teeth."],
  "sheep": ["Sheep", "Ovis aries", "land", "Pastures/Farms", "Herbivore", "10-12 years", "0.9m", "70kg", "30 km/h", "A domesticated woolly ruminant raised globally for meat, milk, and soft textile fibers."],
  "snake": ["Snake", "Serpentes", "land", "Forests/Deserts", "Carnivore", "10-15 years", "1.5m", "3kg", "10 km/h", "A legless, scaly reptile that swallows prey whole and senses surroundings using a forked tongue."],
  "sparrow": ["Sparrow", "Passeridae", "birds", "Woodlands/Fields", "Omnivore", "3-5 years", "0.14m", "0.03kg", "38 km/h", "A small, common songbird with brown and grey feathers, nesting near human dwellings."],
  "squid": ["Squid", "Teuthida", "marine", "Deep Ocean", "Carnivore", "1-2 years", "0.6m", "3kg", "30 km/h", "A fast-swimming cephalopod with ten arms, large eyes, and a siphon used for jet propulsion."],
  "squirrel": ["Squirrel", "Sciuridae", "land", "Woodlands/Parks", "Herbivore", "5-8 years", "0.25m", "0.5kg", "30 km/h", "A lively tree-dwelling rodent with a bushy tail, known for caching nuts for winter."],
  "starfish": ["Starfish", "Asteroidea", "marine", "Seabeds", "Carnivore", "5-10 years", "0.2m", "0.5kg", "0.1 km/h", "A star-shaped marine invertebrate capable of regenerating lost arms, feeding using a reversible stomach."],
  "swan": ["Swan", "Cygnus", "birds", "Lakes/Ponds", "Herbivore", "15-20 years", "1.4m", "11kg", "45 km/h", "A large, elegant white waterfowl with a long neck, forming lifelong breeding pairs."],
  "tiger": ["Tiger", "Panthera tigris", "land", "Rainforest", "Carnivore", "10-15 years", "1.1m", "220kg", "65 km/h", "The largest of all wild cats, recognized by its bold vertical dark stripes on orange fur."],
  "turkey": ["Turkey", "Meleagris gallopavo", "birds", "Forests/Farms", "Omnivore", "3-5 years", "1.0m", "8kg", "40 km/h", "A large forest bird native to North American woodlands, featuring a bare head and fan-shaped tail."],
  "turtle": ["Turtle", "Testudines", "marine", "Oceans/Ponds", "Omnivore", "50-100 years", "1.0m", "120kg", "12 km/h", "An ancient reptile protected by a bony shell, with marine species possessing paddle-like flippers."],
  "whale": ["Whale", "Cetacea", "marine", "Open Ocean", "Carnivore", "70-90 years", "20m", "80000kg", "30 km/h", "A colossal warm-blooded marine mammal that breathes air through blowholes."],
  "wolf": ["Wolf", "Canis lupus", "land", "Forests/Tundra", "Carnivore", "6-8 years", "0.8m", "40kg", "60 km/h", "A pack-hunting wild canine with complex social hierarchies and critical ecosystem roles."],
  "wombat": ["Wombat", "Vombatidae", "land", "Australian Forests", "Herbivore", "10-15 years", "0.9m", "25kg", "40 km/h", "A burrowing Australian marsupial known for its cube-shaped droppings and tough rear shield."],
  "woodpecker": ["Woodpecker", "Picidae", "birds", "Woodlands", "Insectivore", "6-11 years", "0.25m", "0.15kg", "25 km/h", "A tree-climbing bird that taps trunks with its beak to find grubs and drums to communicate."],
  "zebra": ["Zebra", "Equus quagga", "land", "Savannah", "Herbivore", "20-25 years", "1.3m", "300kg", "65 km/h", "A wild horse relative from Africa, famous for its unique vertical black-and-white stripes."]
};

const publicAnimalsDir = path.resolve('public', 'animals');
const outputDir = path.resolve('src');

if (!fs.existsSync(publicAnimalsDir)) {
  console.error(`Error: public/animals directory does not exist! Please check file path.`);
  process.exit(1);
}

// Scans the public/animals folder to find all directories
const folders = fs.readdirSync(publicAnimalsDir).filter(file => {
  return fs.statSync(path.join(publicAnimalsDir, file)).isDirectory();
});

console.log(`Found ${folders.length} animal directories in public/animals/`);

const database = {
  land: [],
  marine: [],
  birds: []
};

let totalMappedImages = 0;

async function padSector(sectorList, paddingSource, sectorKey, requiredCount) {
  let padIdx = 0;
  while (sectorList.length < requiredCount && padIdx < paddingSource.length) {
    const arr = paddingSource[padIdx];
    const name = arr[0];
    
    // Avoid name clashes with already loaded local animals
    const cleanNameLower = name.split(' Extra-')[0].split(' Type-')[0].split(' v')[0].toLowerCase();
    const isAlreadyPresent = sectorList.some(anim => {
      const animCleanLower = anim.name.split(' Extra-')[0].split(' Type-')[0].split(' v')[0].toLowerCase();
      if (name.includes(' Extra-')) {
        return anim.name.toLowerCase() === name.toLowerCase();
      }
      return animCleanLower === cleanNameLower;
    });
    
    if (!isAlreadyPresent) {
      const resolvedTag = await resolveWorkingTag(name, sectorKey);
      const generatedImages = getUniqueFlickrImagesWithTag(resolvedTag, currentGlobalIndex++);
      
      sectorList.push({
        id: `${sectorKey}-extra-${padIdx + 1}`,
        name: name,
        scientificName: arr[1],
        habitat: arr[2],
        conservationStatus: padIdx % 5 === 0 ? "Vulnerable" : padIdx % 9 === 0 ? "Endangered" : "Least Concern",
        diet: arr[3],
        stats: {
          lifespan: arr[4],
          size: arr[5],
          weight: arr[6],
          speed: arr[7]
        },
        description: arr[8],
        images: generatedImages
      });
    }
    padIdx++;
  }
}

// Global variable updated in loop and read in padSector
let currentGlobalIndex = 1000;

(async () => {
  // 1. First load all local dataset entries
  for (const folderName of folders) {
    const dictionaryEntry = animalDictionary[folderName];
    if (!dictionaryEntry) {
      console.warn(`Warning: Animal folder "${folderName}" not found in dictionary mapping. Skipping...`);
      continue;
    }

    const [commonName, scientificName, sector, habitat, diet, lifespan, size, weight, speed, description] = dictionaryEntry;

    // Scan folder for images
    const animalFolderFullPath = path.join(publicAnimalsDir, folderName);
    const images = fs.readdirSync(animalFolderFullPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
      })
      .slice(0, 8)
      .map(file => {
        totalMappedImages++;
        // Return absolute web URL relative to the public root
        return `/animals/${folderName}/${file}`;
      });

    if (images.length === 0) {
      console.warn(`Warning: No images found in folder "${folderName}". Skipping animal...`);
      continue;
    }

    // If there are fewer than 8 images, pad them with unique verified LoremFlickr images of this species/sector to avoid repeated images!
    if (images.length < 8) {
      const resolvedTag = await resolveWorkingTag(folderName, sector);
      let padIdx = 0;
      while (images.length < 8) {
        const seed = (totalMappedImages * 8) + padIdx + 12000;
        const width = padIdx % 2 === 0 ? 3840 : 2160;
        const height = padIdx % 2 === 0 ? 2160 : 3840;
        images.push(`https://loremflickr.com/${width}/${height}/${resolvedTag}?lock=${seed}`);
        padIdx++;
      }
    }

    const animalEntry = {
      id: `${sector}-${folderName}`,
      name: commonName,
      scientificName: scientificName,
      habitat: habitat,
      conservationStatus: Math.random() > 0.85 ? "Endangered" : Math.random() > 0.6 ? "Vulnerable" : "Least Concern",
      diet: diet,
      stats: {
        lifespan: lifespan,
        size: size,
        weight: weight,
        speed: speed
      },
      description: description,
      images: images
    };

    // Sort into the active realm sector
    if (sector === 'land') {
      database.land.push(animalEntry);
    } else if (sector === 'marine') {
      database.marine.push(animalEntry);
    } else if (sector === 'birds') {
      database.birds.push(animalEntry);
    }
  }

  // 2. Calculate global seed index dynamically
  currentGlobalIndex = totalMappedImages + 10;

  // 3. Pad each category with extra entries up to exactly 101 entries
  await padSector(database.land, landPadding, 'land', 101);
  await padSector(database.marine, marinePadding, 'marine', 101);
  await padSector(database.birds, birdPadding, 'birds', 101);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'animals.json'),
    JSON.stringify(database, null, 2)
  );

  console.log(`\nSuccessfully mapped local dataset & padded database:`);
  console.log(`- Land Sector: ${database.land.length} animals (58 local, ${database.land.length - 58} padded)`);
  console.log(`- Marine Sector: ${database.marine.length} animals (15 local, ${database.marine.length - 15} padded)`);
  console.log(`- Birds Sector: ${database.birds.length} animals (17 local, ${database.birds.length - 17} padded)`);
  console.log(`Total Animal Species: ${database.land.length + database.marine.length + database.birds.length}`);
  console.log(`Total Images Mapped locally: ${totalMappedImages}`);
  console.log(`Saved database to src/animals.json`);
})();
