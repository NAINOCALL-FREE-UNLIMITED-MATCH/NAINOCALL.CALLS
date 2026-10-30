export interface GroundedPlace {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  city: string;
  address: string;
  rating: number;
  reviewsCount: string;
  priceLevel: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  openStatus: string;
  isOpenNow: boolean;
  closingTime?: string;
  distanceKm: number;
  vibe: string;
  highlights: string[];
  dateTip: string;
  recommendedTime: string;
  googleMapsUrl: string;
  directionsUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  imageUrl?: string;
}

export const VERIFIED_MUMBAI_DATE_SPOTS: GroundedPlace[] = [
  // Bandra West (near Aarohi & Zoya)
  {
    id: 'subko-bandra',
    name: 'Subko Coffee Roasters & Craft Bakehouse',
    category: 'Artisanal Coffee & Bakery',
    neighborhood: 'Bandra West',
    city: 'Mumbai',
    address: 'Ground Floor, Chapel Rd, Ranwar Village, Bandra West, Mumbai 400050',
    rating: 4.6,
    reviewsCount: '3,840+ reviews',
    priceLevel: '₹₹',
    openStatus: 'Open Now · Closes 10:30 PM',
    isOpenNow: true,
    closingTime: '10:30 PM',
    distanceKm: 0.8,
    vibe: 'Cozy heritage cottage with romantic fairy-lit courtyard',
    highlights: ['Specialty Pour-over Coffee', 'Sourdough Croissants', 'Intimate Seating'],
    dateTip: 'Sit in the outdoor courtyard under the rustic canopy for effortless, relaxed conversation.',
    recommendedTime: '4:30 PM – 7:30 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Subko+Coffee+Roasters+Ranwar+Bandra+West+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Subko+Coffee+Roasters+Ranwar+Bandra+West+Mumbai',
    coordinates: { lat: 19.0528, lng: 72.8282 },
    phone: '+91 90047 00654',
  },
  {
    id: 'veronicas-bandra',
    name: "Veronica's Bakery & Sandwich Bar",
    category: 'Gourmet Deli & Wine/Coffee Bar',
    neighborhood: 'Bandra West',
    city: 'Mumbai',
    address: '3R3G+22W, Waroda Rd, Ranwar, Bandra West, Mumbai 400050',
    rating: 4.5,
    reviewsCount: '2,150+ reviews',
    priceLevel: '₹₹',
    openStatus: 'Open Now · Closes 11:00 PM',
    isOpenNow: true,
    closingTime: '11:00 PM',
    distanceKm: 0.9,
    vibe: 'Vibrant pastel diner aesthetic with playful retro energy',
    highlights: ['Artisanal Hot Pastrami', 'Craft Kombuchas & Coffees', 'Fun Casual Atmosphere'],
    dateTip: 'Great for breaking the ice without high-pressure formality; colorful photogenic backdrops.',
    recommendedTime: '12:00 PM – 4:00 PM or Evening',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Veronicas+Ranwar+Bandra+West+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Veronicas+Ranwar+Bandra+West+Mumbai',
    coordinates: { lat: 19.0535, lng: 72.8291 },
    phone: '+91 93729 81697',
  },
  {
    id: 'olive-bar-kitchen',
    name: 'Olive Bar & Kitchen',
    category: 'Fine Dining & Mediterranean Courtyard',
    neighborhood: 'Pali Hill, Bandra West',
    city: 'Mumbai',
    address: '14, Nargis Dutt Rd, Union Park, Khar West / Pali Hill, Mumbai 400052',
    rating: 4.6,
    reviewsCount: '4,520+ reviews',
    priceLevel: '₹₹₹₹',
    openStatus: 'Open Now · Closes 1:00 AM',
    isOpenNow: true,
    closingTime: '1:00 AM',
    distanceKm: 1.4,
    vibe: 'Iconic white-washed Mediterranean villa with candlelit tables',
    highlights: ['Signature Cocktails', 'Woodfired Pizzas', 'Romantic Ambience'],
    dateTip: 'Book ahead for a courtyard table under the frangipani tree. Ultra-romantic date spot.',
    recommendedTime: '7:30 PM onwards',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Olive+Bar+and+Kitchen+Pali+Hill+Bandra+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Olive+Bar+and+Kitchen+Pali+Hill+Bandra+Mumbai',
    coordinates: { lat: 19.0682, lng: 72.8251 },
    phone: '+91 22 4340 0400',
  },
  {
    id: 'carter-road-promenade',
    name: 'Carter Road Seaside Promenade & Amphitheatre',
    category: 'Scenic Coastal Walk & Sunset View',
    neighborhood: 'Bandra West',
    city: 'Mumbai',
    address: 'Sangeet Samrat Naushad Ali Marg, Bandra West, Mumbai 400050',
    rating: 4.7,
    reviewsCount: '15,200+ reviews',
    priceLevel: '₹',
    openStatus: 'Open 24 Hours · Best at Sunset',
    isOpenNow: true,
    distanceKm: 1.1,
    vibe: 'Sea breeze, Arabian ocean waves, and street music',
    highlights: ['Golden hour sunset', 'Boutique juice bars', 'Dogs & lively walkers'],
    dateTip: 'Grab a waffle or gelato from the promenade stalls and walk by the sea while watching the sun sink into the Arabian Sea.',
    recommendedTime: '5:30 PM – 7:30 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Carter+Road+Promenade+Bandra+West+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Carter+Road+Promenade+Bandra+West+Mumbai',
    coordinates: { lat: 19.0628, lng: 72.8229 },
  },

  // Juhu Beach (near Sneha)
  {
    id: 'prithvi-cafe-juhu',
    name: 'Prithvi Cafe (Prithvi Theatre)',
    category: 'Bohemian Cultural Cafe & Irish Coffee',
    neighborhood: 'Juhu Beach',
    city: 'Mumbai',
    address: '20, Janki Kutir, Juhu Church Rd, Juhu, Mumbai 400049',
    rating: 4.6,
    reviewsCount: '12,900+ reviews',
    priceLevel: '₹₹',
    openStatus: 'Open Now · Closes 11:30 PM',
    isOpenNow: true,
    closingTime: '11:30 PM',
    distanceKm: 1.8,
    vibe: 'Arts, theater posters, hanging paper lanterns, and lively banter',
    highlights: ['Famous Irish Coffee', 'Stuffed Parathas & Hummus', 'Theater buzz'],
    dateTip: 'Arrive around 6 PM to beat the theater queue and enjoy warm cutting chai under lit trees.',
    recommendedTime: '5:00 PM – 9:00 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Prithvi+Cafe+Juhu+Church+Road+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Prithvi+Cafe+Juhu+Church+Road+Mumbai',
    coordinates: { lat: 19.1064, lng: 72.8258 },
    phone: '+91 22 2614 9546',
  },
  {
    id: 'estella-juhu',
    name: 'Estella - Beachfront Dining & Sunset Lounge',
    category: 'Oceanfront Modern Australian & Cocktails',
    neighborhood: 'Juhu',
    city: 'Mumbai',
    address: 'Nichani Kutir, Juhu Tara Rd, Chandrabai Nagar, Juhu, Mumbai 400049',
    rating: 4.5,
    reviewsCount: '3,200+ reviews',
    priceLevel: '₹₹₹₹',
    openStatus: 'Open Now · Closes 1:30 AM',
    isOpenNow: true,
    closingTime: '1:30 AM',
    distanceKm: 2.1,
    vibe: 'Open-air wooden deck directly touching Juhu beach sands',
    highlights: ['Ocean View Sunset Deck', 'Signature Cocktails', 'Truffle Risotto'],
    dateTip: 'Request an outdoor ocean-deck seat for sunset. The view of dusk waves with cocktails is unmatched in Mumbai.',
    recommendedTime: '6:00 PM – 9:30 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Estella+Juhu+Tara+Road+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Estella+Juhu+Tara+Road+Mumbai',
    coordinates: { lat: 19.0975, lng: 72.8267 },
    phone: '+91 79999 98232',
  },

  // Colaba & South Mumbai (near Tanvi & Riddhi)
  {
    id: 'bayview-cafe-colaba',
    name: 'Bayview Cafe (Hotel Harbour View)',
    category: 'Rooftop Ocean View Cafe & Beers',
    neighborhood: 'Colaba',
    city: 'Mumbai',
    address: 'Hotel Harbour View Rooftop, Kerawalla Chamber, 25, PJ Ramchandani Marg, Apollo Bandar, Colaba, Mumbai 400001',
    rating: 4.4,
    reviewsCount: '6,100+ reviews',
    priceLevel: '₹₹',
    openStatus: 'Open Now · Closes 12:30 AM',
    isOpenNow: true,
    closingTime: '12:30 AM',
    distanceKm: 2.3,
    vibe: 'Rooftop breeze overlooking Mumbai Harbour, sailboats, and Gateway of India',
    highlights: ['Harbour View', 'Chilled Beer & Starters', 'Sunset Panorama'],
    dateTip: 'Watch passenger ferries glide by as evening falls; romantic breeze without pretension.',
    recommendedTime: '5:00 PM – 8:30 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bayview+Cafe+Apollo+Bandar+Colaba+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Bayview+Cafe+Apollo+Bandar+Colaba+Mumbai',
    coordinates: { lat: 18.9218, lng: 72.8335 },
    phone: '+91 22 6119 2222',
  },
  {
    id: 'kala-ghoda-cafe',
    name: 'Kala Ghoda Cafe & Wine Bar',
    category: 'Heritage Arts Cafe & European Bistro',
    neighborhood: 'Kala Ghoda / Fort',
    city: 'Mumbai',
    address: '10, Rope Walk Ln, Kala Ghoda, Fort, Mumbai 400001',
    rating: 4.5,
    reviewsCount: '4,100+ reviews',
    priceLevel: '₹₹',
    openStatus: 'Open Now · Closes 11:30 PM',
    isOpenNow: true,
    closingTime: '11:30 PM',
    distanceKm: 2.6,
    vibe: 'Historic cobblestone lane, warm wooden interior, jazz background',
    highlights: ['Organic Single-Estate Coffee', 'Waffles & Carrot Cake', 'Artisan Wines'],
    dateTip: 'Stroll around the Kala Ghoda art galleries before sitting down here for a quiet glass of wine.',
    recommendedTime: '3:00 PM – 7:00 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kala+Ghoda+Cafe+Fort+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Kala+Ghoda+Cafe+Fort+Mumbai',
    coordinates: { lat: 18.9298, lng: 72.8324 },
    phone: '+91 98338 03418',
  },

  // Worli & Marine Drive (near Ishita & Riddhi)
  {
    id: 'dome-marine-drive',
    name: 'Dome Rooftop Skybar (InterContinental)',
    category: 'Luxury Rooftop Lounge & Champagne Bar',
    neighborhood: 'Marine Drive / Churchgate',
    city: 'Mumbai',
    address: 'InterContinental Marine Drive, 135 Marine Dr, Churchgate, Mumbai 400020',
    rating: 4.6,
    reviewsCount: '3,900+ reviews',
    priceLevel: '₹₹₹₹',
    openStatus: 'Open Now · Closes 1:30 AM',
    isOpenNow: true,
    closingTime: '1:30 AM',
    distanceKm: 2.8,
    vibe: 'White lounger cabanas with unobstructed panoramic views of Queen’s Necklace',
    highlights: ['Queens Necklace Night Lights', 'Sunset Cocktails', 'Poolside Lounge'],
    dateTip: 'The ultimate luxury romantic date in Mumbai. Sunset view of the curved coastline will take their breath away.',
    recommendedTime: '6:00 PM onwards',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dome+InterContinental+Marine+Drive+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Dome+InterContinental+Marine+Drive+Mumbai',
    coordinates: { lat: 18.9322, lng: 72.8228 },
    phone: '+91 22 3987 9999',
  },
  {
    id: 'worli-seaface-walk',
    name: 'Worli Sea Face Promenade & Bandra-Worli Sealink View',
    category: 'Scenic Ocean Promenade & Sea Link Viewpoint',
    neighborhood: 'Worli',
    city: 'Mumbai',
    address: 'Worli Sea Face, Worli, Mumbai 400030',
    rating: 4.7,
    reviewsCount: '18,500+ reviews',
    priceLevel: '₹',
    openStatus: 'Open 24 Hours · Sea Breeze Active',
    isOpenNow: true,
    distanceKm: 2.2,
    vibe: 'Crashing sea waves against the rocks with illuminated Sea Link cables',
    highlights: ['Bandra-Worli Sea Link illumination', 'Cool Arabian sea wind', 'Quiet romantic benches'],
    dateTip: 'Pick a quiet bench facing the lit cable-stayed bridge around 8:30 PM for deep talks.',
    recommendedTime: '7:00 PM – 10:30 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Worli+Sea+Face+Promenade+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Worli+Sea+Face+Promenade+Mumbai',
    coordinates: { lat: 19.0135, lng: 72.8152 },
  },

  // Andheri West & Versova (near Meera & Kiara)
  {
    id: 'versova-social',
    name: 'Versova Social',
    category: 'Victorian Greenhouse Bar & Cafe',
    neighborhood: 'Versova Beach',
    city: 'Mumbai',
    address: 'B-80, Ground & 1st Floor, Juhu Versova Link Rd, Seven Bungalows, Andheri West, Mumbai 400061',
    rating: 4.4,
    reviewsCount: '5,800+ reviews',
    priceLevel: '₹₹',
    openStatus: 'Open Now · Closes 1:00 AM',
    isOpenNow: true,
    closingTime: '1:00 AM',
    distanceKm: 3.1,
    vibe: 'Lush botanical garden aesthetic with vintage tiles and cozy nooks',
    highlights: ['Craft Beer & Cocktails', 'Fusion Bar Bites', 'Indie Music & Casual Vibe'],
    dateTip: 'Ask for the upstairs terrace greenhouse seating for a garden date vibe in the middle of Mumbai.',
    recommendedTime: '4:00 PM – 9:00 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Versova+Social+Andheri+West+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Versova+Social+Andheri+West+Mumbai',
    coordinates: { lat: 19.1351, lng: 72.8197 },
    phone: '+91 86574 58631',
  },

  // Powai Lake (near Pooja)
  {
    id: 'mirchi-mime-powai',
    name: 'Breeze Lounge & Rooftop Powai',
    category: 'Lakeview Sky Lounge & Mediterranean',
    neighborhood: 'Powai',
    city: 'Mumbai',
    address: '8th Floor, A Wing, Supreme Business Park, Hiranandani Gardens, Powai, Mumbai 400076',
    rating: 4.5,
    reviewsCount: '4,200+ reviews',
    priceLevel: '₹₹₹',
    openStatus: 'Open Now · Closes 1:30 AM',
    isOpenNow: true,
    closingTime: '1:30 AM',
    distanceKm: 3.9,
    vibe: 'Hilltop view over Powai Lake and Hiranandani European skylines',
    highlights: ['Powai Lake View', 'Wood-fired Pizza', 'Open Terrace Sky Bar'],
    dateTip: 'Sunset overlooking Powai lake with the twilight sky reflecting in the water.',
    recommendedTime: '6:30 PM – 10:00 PM',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Breeze+Lounge+Powai+Lake+Mumbai',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Breeze+Lounge+Powai+Lake+Mumbai',
    coordinates: { lat: 19.1197, lng: 72.9051 },
    phone: '+91 22 6608 8777',
  },
];

export function getCuratedSpots(
  locationFilter?: string,
  categoryFilter?: string,
  searchQuery?: string
): GroundedPlace[] {
  let list = [...VERIFIED_MUMBAI_DATE_SPOTS];

  if (locationFilter && locationFilter !== 'all') {
    const locLower = locationFilter.toLowerCase();
    list = list.filter(
      (p) =>
        p.neighborhood.toLowerCase().includes(locLower) ||
        p.address.toLowerCase().includes(locLower) ||
        locLower.includes(p.neighborhood.toLowerCase())
    );
    // If empty after strict filter, show all sorted by closest
    if (list.length === 0) {
      list = [...VERIFIED_MUMBAI_DATE_SPOTS];
    }
  }

  if (categoryFilter && categoryFilter !== 'all') {
    const catLower = categoryFilter.toLowerCase();
    list = list.filter(
      (p) =>
        p.category.toLowerCase().includes(catLower) ||
        p.vibe.toLowerCase().includes(catLower) ||
        p.highlights.some((h) => h.toLowerCase().includes(catLower))
    );
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.vibe.toLowerCase().includes(q) ||
        p.highlights.some((h) => h.toLowerCase().includes(q))
    );
  }

  return list;
}
