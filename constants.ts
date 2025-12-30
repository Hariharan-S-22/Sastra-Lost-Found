
export const CATEGORIES = [
  'Electronics',
  'Books',
  'IDs',
  'Keys',
  'Bags',
  'Watches',
  'Wallets',
  'Others'
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

export const AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Luna',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Willow',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Toby',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Jack',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Bear',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver'
];

export const BRANCHES = [
  'B.Tech. Aerospace Engineering',
  'B.Tech. Bioengineering',
  'B.Tech. Bioinformatics',
  'B.Tech. Biotechnology',
  'B.Tech. Chemical Engineering',
  'B.Tech. Civil Engineering',
  'B.Tech. Computer Science & Engineering',
  'B.Tech. Computer Science & Engineering (AI & DS)',
  'B.Tech. Computer Science & Engineering (CS & BCT)',
  'B.Tech. Computer Science & Engineering (IoT & Automation)',
  'B.Tech. Computer Science & Engineering (Networks)',
  'B.Tech. Electrical and Electronics Engineering',
  'B.Tech. Electronics & Communication Engineering',
  'B.Tech. Electronics & Instrumentation Engineering',
  'B.Tech. Information and Communication Technology',
  'B.Tech. Information Technology',
  'B.Tech. Mechanical Engineering',
  'B.Tech. Mechatronics',
  'B.Tech. Robotics & Artificial Intelligence',
  'M.Tech. Digital Manufacturing',
  'M.Tech. Cyber Security',
  'M.Sc. Data Science',
  'Integrated M.Sc. Physics',
  'Integrated M.Sc. Mathematics',
  'BA LLB',
  'BBA LLB',
  'B.Com LLB'
];

export const MOCK_ITEMS = [
  {
    id: '1',
    title: 'Black Samsung Smartphone',
    category: 'Electronics',
    type: 'FOUND',
    description: 'Found on a ASK 2. The screen is black and it seems to be switched off.',
    location: 'ASK 2',
    imagePaths: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMPHI_FIqI6khMzlsSTDIqNSvqxkF6vts4Mw&s'],
    reporterId: 'user123',
    reporterName: 'Vishnu',
    date: '10-02-2025',
    status: 'NEW',
    messages: []
  },
  {
    id: '2',
    title: 'IPHONE',
    category: 'Electronics',
    type: 'FOUND',
    description: 'Spotted this phone in the cricket ground. Still appears to be functional.',
    location: 'SASTRA Cricket Ground',
    imagePaths: ['https://www.shutterstock.com/image-photo/mobile-phone-dropped-lost-sand-260nw-2456370675.jpg'],
    reporterId: 'user789',
    reporterName: 'Suresh Kumar',
    date: '11-02-2025',
    status: 'NEW',
    messages: []
  },
  {
    id: '3',
    title: 'Bunch of Keys',
    category: 'Keys',
    type: 'FOUND',
    description: 'Found a bunch of keys near the hand washing area',
    location: 'Krishna Canteen',
    imagePaths: ['https://www.alloffice.co.za/wp-content/uploads/find-lost-keys.jpg'],
    reporterId: 'user456',
    reporterName: 'Varun',
    date: '12-02-2025',
    status: 'NEW',
    messages: []
  },
  {
    id: '4',
    title: 'Brown Leather Wallet',
    category: 'Wallets',
    type: 'LOST',
    description: 'Lost my Brown bi-fold leather wallet. It was last seen when I was sitting on the grass near the VV lawn. Contains some cash and a Pan card.',
    location: 'VV Lawn',
    imagePaths: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlzYvO84IRseTH3QeWOgSkP5-hljwxUrgAVw&s'],
    reporterId: 'user202',
    reporterName: 'Arun V.',
    date: '13-02-2025',
    status: 'NEW',
    messages: []
  },
  {
    id: '5',
    title: 'Military Style Watch',
    category: 'Watches',
    type: 'FOUND',
    description: 'Found a watch with a black nylon strap on a wooden desk in the Mechanical Engineering workshop. It has a distinct black dial with white numbers.',
    location: 'Forging Lab - VKJ',
    imagePaths: ['https://media.istockphoto.com/id/173015527/photo/a-single-red-book-on-a-white-surface.jpg?s=612x612&w=0&k=20&c=AeKmdZvg2_bRY2Yct7odWhZXav8CgDtLMc_5_pjSItY='],
    reporterId: 'user303',
    reporterName: 'Priya Dharshini',
    date: '14-02-2025',
    status: 'NEW',
    messages: []
  },
  {
    id: '6',
    title: 'Grey Backpack',
    category: 'Bags',
    type: 'LOST',
    description: 'Grey backpack with blue accents and Strabo branding Contains lab records and a laptop charger.',
    location: 'Library',
    imagePaths: ['https://safaribags.com/cdn/shop/files/2_3d6acc65-50a9-4d45-b83c-31bb315d7b05_1024x.jpg?v=1707731912'],
    reporterId: 'user404',
    reporterName: 'Vignesh R.',
    date: '15-02-2025',
    status: 'NEW',
    messages: []
  },
  {
    id: '7',
    title: 'Dairy',
    category: 'Books',
    type: 'LOST',
    description: 'Red Color Diary, with my name written in the front page',
    location: 'VK Auditorium',
    imagePaths: ['https://media.istockphoto.com/id/173015527/photo/a-single-red-book-on-a-white-surface.jpg?s=612x612&w=0&k=20&c=AeKmdZvg2_bRY2Yct7odWhZXav8CgDtLMc_5_pjSItY='],
    reporterId: 'user456',
    reporterName: 'Badri S',
    date: '11-02-2025',
    status: 'NEW',
    messages: []
  }
];
