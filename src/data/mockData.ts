import { User, Profile, Rating, Roast, ReferralStats } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'cooluser123',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150&h=150&fit=crop',
    firstName: 'Alex',
    lastName: 'Johnson',
    joinDate: new Date('2024-01-15'),
    starsBalance: 25,
    referralCode: 'ALEX123',
    referredBy: undefined,
  },
  {
    id: '2',
    username: 'stargazer',
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?w=150&h=150&fit=crop',
    firstName: 'Emma',
    lastName: 'Davis',
    joinDate: new Date('2024-01-20'),
    starsBalance: 42,
    referralCode: 'EMMA456',
    referredBy: '1',
  },
  {
    id: '3',
    username: 'nightowl',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?w=150&h=150&fit=crop',
    firstName: 'Marcus',
    lastName: 'Wilson',
    joinDate: new Date('2024-01-10'),
    starsBalance: 18,
    referralCode: 'MARCUS789',
    referredBy: '2',
  },
  {
    id: '4',
    username: 'sunshine',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=150&h=150&fit=crop',
    firstName: 'Sophia',
    lastName: 'Martinez',
    joinDate: new Date('2024-01-25'),
    starsBalance: 67,
    referralCode: 'SOPHIA321',
    referredBy: '1',
  },
  {
    id: '5',
    username: 'thunderbolt',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150&h=150&fit=crop',
    firstName: 'Jake',
    lastName: 'Thompson',
    joinDate: new Date('2024-01-30'),
    starsBalance: 33,
    referralCode: 'JAKE654',
    referredBy: '3',
  },
];

export const mockProfiles: Profile[] = mockUsers.map((user, index) => ({
  userId: user.id,
  user,
  bio: [
    '🎮 Gamer by day, dreamer by night',
    '☕ Coffee addict & code enthusiast',
    '🌟 Living life one meme at a time',
    '🎨 Creating beautiful chaos daily',
    '⚡ Speed of light, depth of ocean',
  ][index],
  averageRating: [8.7, 9.2, 7.8, 8.9, 8.1][index],
  totalRatings: [42, 67, 31, 89, 28][index],
  roastCount: [12, 23, 8, 31, 15][index],
  boostedUntil: index === 1 ? new Date(Date.now() + 30 * 60 * 1000) : undefined,
  isOnline: [true, false, true, true, false][index],
}));

export const mockRatings: Rating[] = [
  { id: '1', profileId: '1', raterId: '2', score: 9, timestamp: new Date('2024-01-31T10:30:00') },
  { id: '2', profileId: '1', raterId: '3', score: 8, timestamp: new Date('2024-01-31T11:15:00') },
  { id: '3', profileId: '2', raterId: '1', score: 10, timestamp: new Date('2024-01-31T12:00:00') },
  { id: '4', profileId: '2', raterId: '4', score: 9, timestamp: new Date('2024-01-31T13:20:00') },
  { id: '5', profileId: '3', raterId: '5', score: 7, timestamp: new Date('2024-01-31T14:45:00') },
];

export const mockRoasts: Roast[] = [
  {
    id: '1',
    profileId: '1',
    content: 'Your gaming skills are as legendary as your ability to lose at Rock Paper Scissors to a rock',
    timestamp: new Date('2024-01-31T10:30:00'),
    type: 'user',
    isVisible: false,
  },
  {
    id: '2',
    profileId: '1',
    content: 'You code so much, even your dreams have syntax errors',
    timestamp: new Date('2024-01-31T11:00:00'),
    type: 'ai',
    theme: 'programmer',
    isVisible: false,
  },
  {
    id: '3',
    profileId: '2',
    content: 'Your coffee addiction is so strong, caffeine molecules orbit around you',
    timestamp: new Date('2024-01-31T12:15:00'),
    type: 'user',
    isVisible: false,
  },
  {
    id: '4',
    profileId: '2',
    content: 'Thou dost consume more coffee than a pirate drinks rum, yet thy energy remains that of a slumbering whale',
    timestamp: new Date('2024-01-31T13:30:00'),
    type: 'ai',
    theme: 'shakespearean',
    isVisible: false,
  },
];

export const mockReferralStats: ReferralStats[] = [
  { userId: '1', user: mockUsers[0], referralCount: 15, totalEarned: 75 },
  { userId: '2', user: mockUsers[1], referralCount: 12, totalEarned: 60 },
  { userId: '4', user: mockUsers[3], referralCount: 8, totalEarned: 40 },
  { userId: '3', user: mockUsers[2], referralCount: 5, totalEarned: 25 },
  { userId: '5', user: mockUsers[4], referralCount: 3, totalEarned: 15 },
];