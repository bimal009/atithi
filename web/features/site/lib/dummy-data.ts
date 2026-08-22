export type DummyHotel = {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  heroImage: string;
  aboutImage: string;
  mapUrl: string;
};

export type DummyRoom = {
  id: string;
  name: string;
  images: string[];
  capacity: number;
  basePrice: number;
  pricingLabel: string;
  description: string;
  amenities: string[];
  isTopPick?: boolean;
};

export type DummyCabin = {
  id: string;
  name: string;
  images: string[];
  capacity: number;
  basePrice: number;
  description: string;
  amenities: string[];
  isTopPick?: boolean;
};

export type DummyMenuItem = {
  id: string;
  name: string;
  imageUrl: string;
  categoryName: string;
  foodType: "veg" | "non-veg" | "vegan" | "egg";
  price: number;
  description: string;
  isTopPick: boolean;
};

export const currency = "USD";

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const dummyHotel: DummyHotel = {
  name: "Atithi Stay",
  tagline: "A quiet place to arrive, and a hard place to leave.",
  description:
    "Set among terraced gardens above the valley, Atithi Stay pairs considered rooms and cabins with a kitchen that cooks what's in season. Every detail — from the linen to the light — is built for slowing down.",
  address: "14 Ridgeline Road, Pokhara, Nepal",
  phoneNumber: "+9779800000000",
  email: "hello@atithistay.com",
  heroImage: "https://picsum.photos/seed/atithi-hero/1800/1100",
  aboutImage: "https://picsum.photos/seed/atithi-about/900/1100",
  mapUrl: "https://maps.google.com/maps?q=28.2096,83.9856&z=14&output=embed",
};

export const dummyRooms: DummyRoom[] = [
  {
    id: "deluxe-valley-view",
    name: "Deluxe Valley View",
    images: [
      "https://picsum.photos/seed/room-deluxe-1/1000/750",
      "https://picsum.photos/seed/room-deluxe-2/1000/750",
      "https://picsum.photos/seed/room-deluxe-3/1000/750",
    ],
    capacity: 2,
    basePrice: 120,
    pricingLabel: "1 king bed",
    description:
      "A sun-filled corner room with a private balcony that opens onto the valley. Dressed in linen and warm oak, with a soaking tub by the window.",
    amenities: ["Free Wi-Fi", "Private balcony", "Soaking tub", "Air conditioning", "Minibar", "Rain shower"],
    isTopPick: true,
  },
  {
    id: "garden-suite",
    name: "Garden Suite",
    images: [
      "https://picsum.photos/seed/room-garden-1/1000/750",
      "https://picsum.photos/seed/room-garden-2/1000/750",
    ],
    capacity: 3,
    basePrice: 165,
    pricingLabel: "1 king bed + daybed",
    description:
      "A generous suite opening directly onto the herb garden, with a separate sitting area and a fireplace for cooler evenings.",
    amenities: ["Free Wi-Fi", "Garden access", "Fireplace", "Sitting area", "Air conditioning", "Minibar"],
    isTopPick: true,
  },
  {
    id: "classic-twin",
    name: "Classic Twin",
    images: [
      "https://picsum.photos/seed/room-twin-1/1000/750",
      "https://picsum.photos/seed/room-twin-2/1000/750",
    ],
    capacity: 2,
    basePrice: 90,
    pricingLabel: "2 twin beds",
    description:
      "Simple, quiet, and well-lit — a favourite with friends travelling together. Steps from the courtyard breakfast room.",
    amenities: ["Free Wi-Fi", "Air conditioning", "Work desk", "Rain shower"],
  },
  {
    id: "loft-room",
    name: "Loft Room",
    images: [
      "https://picsum.photos/seed/room-loft-1/1000/750",
      "https://picsum.photos/seed/room-loft-2/1000/750",
    ],
    capacity: 2,
    basePrice: 105,
    pricingLabel: "1 queen bed",
    description:
      "Tucked under the eaves with exposed timber beams and a skylight above the bed. Compact, cosy, and quietly stylish.",
    amenities: ["Free Wi-Fi", "Skylight", "Air conditioning", "Minibar"],
  },
  {
    id: "family-room",
    name: "Family Room",
    images: [
      "https://picsum.photos/seed/room-family-1/1000/750",
      "https://picsum.photos/seed/room-family-2/1000/750",
    ],
    capacity: 4,
    basePrice: 190,
    pricingLabel: "1 king bed + bunks",
    description:
      "Two connected sleeping areas built for families — a king room for parents and a bunk nook the kids will fight over.",
    amenities: ["Free Wi-Fi", "Bunk beds", "Air conditioning", "Minibar", "Extra storage"],
  },
  {
    id: "courtyard-single",
    name: "Courtyard Single",
    images: ["https://picsum.photos/seed/room-single-1/1000/750"],
    capacity: 1,
    basePrice: 65,
    pricingLabel: "1 single bed",
    description: "A neat, well-appointed room for the solo traveller, facing the quiet inner courtyard.",
    amenities: ["Free Wi-Fi", "Work desk", "Air conditioning"],
  },
];

export const dummyCabins: DummyCabin[] = [
  {
    id: "riverside-cabin",
    name: "Riverside Cabin",
    images: [
      "https://picsum.photos/seed/cabin-river-1/1000/750",
      "https://picsum.photos/seed/cabin-river-2/1000/750",
    ],
    capacity: 4,
    basePrice: 210,
    description:
      "A timber cabin raised above the riverbank, with a wraparound deck and an outdoor firepit for evenings under the stars.",
    amenities: ["Private deck", "Firepit", "Kitchenette", "Free Wi-Fi", "Hot water"],
    isTopPick: true,
  },
  {
    id: "pine-hollow-cabin",
    name: "Pine Hollow Cabin",
    images: [
      "https://picsum.photos/seed/cabin-pine-1/1000/750",
      "https://picsum.photos/seed/cabin-pine-2/1000/750",
    ],
    capacity: 2,
    basePrice: 150,
    description:
      "Set back in the pines for total quiet. A wood stove, a soaking tub on the porch, and nothing else you need.",
    amenities: ["Wood stove", "Outdoor tub", "Kitchenette", "Free Wi-Fi"],
  },
  {
    id: "meadow-cabin",
    name: "Meadow Cabin",
    images: [
      "https://picsum.photos/seed/cabin-meadow-1/1000/750",
      "https://picsum.photos/seed/cabin-meadow-2/1000/750",
    ],
    capacity: 6,
    basePrice: 260,
    description:
      "The largest of our cabins, built for groups — an open living area, a full kitchen, and a long table for shared dinners.",
    amenities: ["Full kitchen", "Dining for 6", "Firepit", "Free Wi-Fi", "Two bathrooms"],
  },
];

export const dummyMenuItems: DummyMenuItem[] = [
  {
    id: "starter-momo",
    name: "Steamed Vegetable Momo",
    imageUrl: "https://picsum.photos/seed/food-momo/700/500",
    categoryName: "Starters",
    foodType: "veg",
    price: 9,
    description: "Hand-folded dumplings, garden vegetables, sesame-chilli dip.",
    isTopPick: true,
  },
  {
    id: "starter-soup",
    name: "Roasted Tomato Soup",
    imageUrl: "https://picsum.photos/seed/food-soup/700/500",
    categoryName: "Starters",
    foodType: "vegan",
    price: 7,
    description: "Slow-roasted tomatoes, basil oil, toasted sourdough.",
    isTopPick: false,
  },
  {
    id: "starter-kebab",
    name: "Chicken Seekh Kebab",
    imageUrl: "https://picsum.photos/seed/food-kebab/700/500",
    categoryName: "Starters",
    foodType: "non-veg",
    price: 11,
    description: "Charcoal-grilled, mint chutney, pickled onion.",
    isTopPick: false,
  },
  {
    id: "main-thali",
    name: "Valley Thali",
    imageUrl: "https://picsum.photos/seed/food-thali/700/500",
    categoryName: "Mains",
    foodType: "veg",
    price: 16,
    description: "Seasonal curry, dal, rice, greens, house pickle, roti.",
    isTopPick: true,
  },
  {
    id: "main-fish",
    name: "Pan-Seared River Trout",
    imageUrl: "https://picsum.photos/seed/food-trout/700/500",
    categoryName: "Mains",
    foodType: "non-veg",
    price: 22,
    description: "Brown butter, capers, roasted new potatoes.",
    isTopPick: true,
  },
  {
    id: "main-curry",
    name: "Slow-Cooked Mutton Curry",
    imageUrl: "https://picsum.photos/seed/food-mutton/700/500",
    categoryName: "Mains",
    foodType: "non-veg",
    price: 19,
    description: "Bone-in mutton, whole spices, steamed rice.",
    isTopPick: false,
  },
  {
    id: "main-pasta",
    name: "Wild Mushroom Pasta",
    imageUrl: "https://picsum.photos/seed/food-pasta/700/500",
    categoryName: "Mains",
    foodType: "veg",
    price: 15,
    description: "Fresh tagliatelle, foraged mushrooms, parmesan.",
    isTopPick: false,
  },
  {
    id: "dessert-cake",
    name: "Dark Chocolate Cake",
    imageUrl: "https://picsum.photos/seed/food-cake/700/500",
    categoryName: "Desserts",
    foodType: "egg",
    price: 8,
    description: "Warm, gooey centre, served with clotted cream.",
    isTopPick: true,
  },
  {
    id: "dessert-kheer",
    name: "Saffron Rice Kheer",
    imageUrl: "https://picsum.photos/seed/food-kheer/700/500",
    categoryName: "Desserts",
    foodType: "veg",
    price: 6,
    description: "Slow-simmered rice pudding, saffron, pistachio.",
    isTopPick: false,
  },
  {
    id: "drink-lassi",
    name: "Rose Lassi",
    imageUrl: "https://picsum.photos/seed/food-lassi/700/500",
    categoryName: "Drinks",
    foodType: "veg",
    price: 5,
    description: "Yoghurt, rosewater, crushed pistachio.",
    isTopPick: false,
  },
  {
    id: "drink-coffee",
    name: "Himalayan Pour-Over",
    imageUrl: "https://picsum.photos/seed/food-coffee/700/500",
    categoryName: "Drinks",
    foodType: "vegan",
    price: 4,
    description: "Single-origin beans, roasted in-house.",
    isTopPick: false,
  },
];

export const dummyGallery: { url: string; label: string }[] = [
  { url: "https://picsum.photos/seed/gallery-1/1200/900", label: "The courtyard at dusk" },
  { url: "https://picsum.photos/seed/gallery-2/1200/900", label: "Breakfast on the terrace" },
  { url: "https://picsum.photos/seed/gallery-3/1200/900", label: "Deluxe Valley View" },
  { url: "https://picsum.photos/seed/gallery-4/1200/900", label: "The kitchen garden" },
  { url: "https://picsum.photos/seed/gallery-5/1200/900", label: "Riverside Cabin deck" },
  { url: "https://picsum.photos/seed/gallery-6/1200/900", label: "Evening firepit" },
  { url: "https://picsum.photos/seed/gallery-7/1200/900", label: "The dining room" },
  { url: "https://picsum.photos/seed/gallery-8/1200/900", label: "Valley view at sunrise" },
];

export const dummyTestimonials = [
  {
    quote:
      "Every detail felt considered — the room, the quiet, the way breakfast just appeared when we wanted it.",
    name: "Priya S.",
    stay: "Weekend getaway",
  },
  {
    quote:
      "We came for one night and stayed for three. The staff anticipated things before we thought to ask.",
    name: "Anish R.",
    stay: "Family trip",
  },
  {
    quote: "Simple, calm, and genuinely well run. Exactly what a good stay should feel like.",
    name: "Meera T.",
    stay: "Solo travel",
  },
];
