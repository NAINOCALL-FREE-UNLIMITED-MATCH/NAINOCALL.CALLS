export interface DatingProfile {
  id: string;
  name: string;
  age: number;
  distance: string;
  location: string;
  occupation: string;
  bio: string;
  passions: string[];
  imagePath?: string;
  spritePosition?: string;
  isOnline: boolean;
  statusText?: string;
  isLiked?: boolean;
}

export const INITIAL_PROFILES: DatingProfile[] = [
  {
    id: 'aarohi',
    name: 'Aarohi',
    age: 22,
    distance: '1.2 km away',
    location: 'Bandra West, Mumbai',
    occupation: 'Creative Director & Model',
    bio: 'Big on sunset coffees, lo-fi playlists, and candid conversations. Here to meet genuine people. Jump on a video call and say hi! ✨',
    passions: ['Music', 'Photography', 'Art', 'Coffee'],
    imagePath: '/assets/aistudio/download__8__a3618482.jpg',
    isOnline: true,
    statusText: 'Online now · Ready to chat',
  },
  {
    id: 'sneha',
    name: 'Sneha',
    age: 23,
    distance: '2.0 km away',
    location: 'Juhu Beach, Mumbai',
    occupation: 'Fashion Stylist & Creator',
    bio: 'Moody lighting, cozy oversized hoodies, and deep midnight conversations. Hit video call if you have good music taste! 🎧',
    passions: ['Fashion', 'Aesthetics', 'Travel', 'Indie Pop'],
    imagePath: '/assets/aistudio/download__7__991bcb39.jpg',
    isOnline: true,
    statusText: 'Online now · In studio',
  },
  {
    id: 'tanvi',
    name: 'Tanvi',
    age: 24,
    distance: '1.8 km away',
    location: 'Colaba, Mumbai',
    occupation: 'Classical Dancer & Literature Grad',
    bio: 'Graceful traditions meet modern dreams. Always up for talking about Indian classical arts, poetry, and good filter coffee. 🪔',
    passions: ['Dance', 'Poetry', 'Books', 'Traditional'],
    imagePath: '/assets/aistudio/download__6__bb858baf.jpg',
    isOnline: true,
    statusText: 'Online now · Free to talk',
  },
  {
    id: 'meera',
    name: 'Meera',
    age: 21,
    distance: '3.5 km away',
    location: 'Andheri West, Mumbai',
    occupation: 'UI/UX Designer & Cat Mom',
    bio: 'Obsessed with aesthetic interfaces, cute cafes, and cozy winter sweaters. Let’s connect on a friendly 1-on-1 video call! ☕',
    passions: ['Design', 'Cats', 'Cafes', 'Baking'],
    imagePath: '/assets/aistudio/download__5__06d5aee3.jpg',
    isOnline: true,
    statusText: 'Online now · Active',
  },
  {
    id: 'ishita',
    name: 'Ishita',
    age: 25,
    distance: '2.4 km away',
    location: 'Worli Sea Face, Mumbai',
    occupation: 'Architect & Urban Planner',
    bio: 'Passionate about heritage architecture and evening strolls by the sea. Looking for spontaneous, fun conversations. 🌆',
    passions: ['Architecture', 'Urban Living', 'Fitness', 'Cinema'],
    imagePath: '/assets/aistudio/download__4__97b1135a.jpg',
    isOnline: true,
    statusText: 'Online now · Available',
  },
  {
    id: 'pooja',
    name: 'Pooja',
    age: 23,
    distance: '4.0 km away',
    location: 'Powai Lake, Mumbai',
    occupation: 'Software Engineer & Foodie',
    bio: 'Writing clean code by day, hunting Mumbai street food gems by dusk. Super cheerful and down for a chill video chat! 🍜',
    passions: ['Tech', 'Street Food', 'Gaming', 'Anime'],
    imagePath: '/assets/aistudio/download__3__01f34ba0.jpg',
    isOnline: true,
    statusText: 'Online now · Just logged in',
  },
  {
    id: 'zoya',
    name: 'Zoya',
    age: 22,
    distance: '1.5 km away',
    location: 'Marine Lines, Mumbai',
    occupation: 'Psychology Student & Yoga Enthusiast',
    bio: 'Mindfulness, seaside breeze, and genuine smiles. Tell me your favorite travel memory or deep question over video call! 🧘‍♀️',
    passions: ['Yoga', 'Psychology', 'Nature', 'Podcasts'],
    imagePath: '/assets/aistudio/download__2__8411f185.jpg',
    isOnline: true,
    statusText: 'Online now · Loving the vibe',
  },
  {
    id: 'diya',
    name: 'Diya',
    age: 24,
    distance: '2.1 km away',
    location: 'Khar West, Mumbai',
    occupation: 'Content Strategist & Filmmaker',
    bio: 'Documenting everyday stories and heartfelt cinema moments. Shy at first, but super chatty once we click! 🎬',
    passions: ['Film', 'Storytelling', 'Vintage', 'Music'],
    imagePath: '/assets/aistudio/download__1__4caf53a3.jpg',
    isOnline: true,
    statusText: 'Online now · Video ready',
  },
  {
    id: 'roshni',
    name: 'Roshni',
    age: 22,
    distance: '2.8 km away',
    location: 'Lokhandwala, Mumbai',
    occupation: 'Jewellery Designer & Traditional Stylist',
    bio: 'Ethnic wear enthusiast, golden hour lover, and festive spirit. Let’s do a quick live video call and see if our energies match! ✨',
    passions: ['Jewellery', 'Festivals', 'Styling', 'Dance'],
    imagePath: '/assets/aistudio/download_b752deee.jpg',
    isOnline: true,
    statusText: 'Online now · Ready to call',
  },
];
