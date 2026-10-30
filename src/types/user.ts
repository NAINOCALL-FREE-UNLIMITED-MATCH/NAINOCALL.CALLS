export interface UserProfile {
  id: string;
  name: string;
  age: number;
  birthDate: string; // YYYY-MM-DD
  gender: 'female' | 'male' | 'non-binary';
  lookingFor: 'everyone' | 'women' | 'men';
  bio: string;
  city: string;
  country: string;
  avatarUrl?: string;
  interests: string[];
  is18PlusVerified: boolean;
  agreedTo18PlusPolicy: boolean;
  policyAgreedAt?: number;
  registeredAt: number;
}
