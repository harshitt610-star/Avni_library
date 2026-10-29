import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../lib/mongodb';
import {
  User,
  ChildProfile,
  Book,
  Manuscript,
  Workshop,
  Quiz,
  Notification,
  CmsPage,
  WebsiteSetting,
  AuditLog,
} from '../models/index';

async function seed() {
  console.log('Connecting to MongoDB via connectToDatabase()...');
  const conn = await connectToDatabase();
  console.log('Connected to database:', conn.connection.name);
  console.log('Clearing existing collections in storynest database...');

  await Promise.all([
    User.deleteMany({}),
    ChildProfile.deleteMany({}),
    Book.deleteMany({}),
    Manuscript.deleteMany({}),
    Workshop.deleteMany({}),
    Quiz.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating demo users across all roles...');
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('admin123', salt);
  const authorPass = await bcrypt.hash('author123', salt);
  const parentPass = await bcrypt.hash('parent123', salt);
  const readerPass = await bcrypt.hash('reader123', salt);
  const educatorPass = await bcrypt.hash('educator123', salt);

  const admin = await User.create({
    name: 'Editorial Director Dev',
    email: 'admin@storynest.com',
    passwordHash: adminPass,
    role: 'admin',
    languagePreference: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Chief Content Officer & COPPA Compliance Director at StoryNest.',
  });

  const author = await User.create({
    name: 'Dr. Meera Sharma',
    email: 'author@storynest.com',
    passwordHash: authorPass,
    role: 'author',
    languagePreference: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    bio: 'Astrophysicist & Sahitya Akademi Children’s Literature awardee. Author of the Tara Cosmos series.',
  });

  const parent = await User.create({
    name: 'Priya Sharma',
    email: 'parent@storynest.com',
    passwordHash: parentPass,
    role: 'parent',
    languagePreference: 'en',
    isCoppaVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Mother of two curious story lovers.',
  });

  const reader = await User.create({
    name: 'Aarav Sharma',
    email: 'reader@storynest.com',
    passwordHash: readerPass,
    role: 'reader',
    languagePreference: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  });

  const educator = await User.create({
    name: 'Sunita Rao',
    email: 'educator@storynest.com',
    passwordHash: educatorPass,
    role: 'educator',
    languagePreference: 'hi',
    avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=200&q=80',
    bio: 'Elementary Literacy Specialist & Bilingual Storyteller.',
  });

  console.log('Creating child profiles for Parent Sanctuary...');
  const child1 = await ChildProfile.create({
    parentId: parent._id,
    userId: reader._id,
    displayName: 'Aarav (Grade 3)',
    ageBracket: '6-8',
    avatarEmoji: '🚀',
    readingStreak: 5,
    starsEarned: 145,
    dailyTimeLimitMinutes: 45,
    minutesReadToday: 22,
    bedtimeCurfew: '20:30',
    curfewEnabled: true,
    contentFilter: 'standard',
  });

  const child2 = await ChildProfile.create({
    parentId: parent._id,
    displayName: 'Ananya (Kindergarten)',
    ageBracket: '3-5',
    avatarEmoji: '🦄',
    readingStreak: 2,
    starsEarned: 60,
    dailyTimeLimitMinutes: 30,
    minutesReadToday: 10,
    bedtimeCurfew: '20:00',
    curfewEnabled: true,
    contentFilter: 'strict',
  });

  console.log('Seeding rich illustrated books...');
  const taraBook = await Book.create({
    title: 'Tara and the Whispering Stars',
    titleHindi: 'तारा और फुसफुसाते सितारे',
    slug: 'tara-and-the-whispering-stars',
    authorName: 'Dr. Meera Sharma',
    authorBio: 'Astrophysicist & author of celebrated children’s STEM fiction.',
    authorId: author._id,
    synopsis: 'Join 9-year-old Tara on her rooftop observatory as she decodes glowing constellation riddles over Jaipur and uncovers the ancient secret of the Seven Sages.',
    synopsisHindi: '९ वर्षीय तारा के साथ उसकी छत की वेधशाला में शामिल हों, जब वह जयपुर के आकाश में चमकते नक्षत्रों की पहेलियों को सुलझाती है।',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlDiKmHXbb0fGXE7i2FKQmighTJdmDqYJ711xUjj_XMJOINVzWND_6jJ0p-zN8SKJUSyLkqO79odD-uFSXPiBL4kyqVGMdm-OjKl1MR_8Mc-qJZ5qYV1eugXRq_yaFeYhE_Rh3FIYske4BC2sPOXyRoGo0jD3qKv3WznSCkl1TNSC1ktyY5IBJHzOx37hUztUXG7LOmwE-8KDj8yjRVasZzZXvKWaREabBTSc3oMo',
    ageBracket: '6-8',
    genre: 'Astronomy & Adventure',
    language: 'bilingual',
    readingTimeMinutes: 18,
    chaptersCount: 3,
    featured: true,
    rating: 4.9,
    readersCount: 2380,
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Brass Telescope on the Terrace',
        titleHindi: 'छत पर पीतल की दूरबीन',
        contentEn: `Under the warm Jaipur evening sky, amber lanterns swayed gently on Tara’s rooftop. Her grandfather’s antique brass telescope gleamed like polished honey. Tara adjusted the ocular dial with two careful clicks. Through the crystal lens, the indigo sky blossomed into thousands of glittering diamonds. Suddenly, near the curved handle of the Great Bear constellation, a gentle pulse of lavender light blinked three times: dot, dash, dot. Tara gasped—stars do not blink in rhythms!`,
        contentHi: `जयपुर की शाम के गर्म आकाश के नीचे, तारा की छत पर अम्बर रंग की लालटेनें हवा में धीरे-धीरे झूल रही थीं। उनके दादाजी की पुरानी पीतल की दूरबीन शहद की तरह चमक रही थी। तारा ने ध्यान से दो क्लिक के साथ लेंस घुमाया। नीले आकाश में हजारों तारे हीरों की तरह चमक उठे। अचानक सप्तर्षि तारामंडल के पास से बैंगनी रोशनी तीन बार चमकी। तारा चौंक गई—तारे ताल में नहीं चमकते!`,
        illustrationUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlDiKmHXbb0fGXE7i2FKQmighTJdmDqYJ711xUjj_XMJOINVzWND_6jJ0p-zN8SKJUSyLkqO79odD-uFSXPiBL4kyqVGMdm-OjKl1MR_8Mc-qJZ5qYV1eugXRq_yaFeYhE_Rh3FIYske4BC2sPOXyRoGo0jD3qKv3WznSCkl1TNSC1ktyY5IBJHzOx37hUztUXG7LOmwE-8KDj8yjRVasZzZXvKWaREabBTSc3oMo',
      },
      {
        chapterNumber: 2,
        title: 'The Riddle of the Seven Sages',
        titleHindi: 'सप्तर्षियों की पहेली',
        contentEn: `Tara scrambled to open her worn notebook of celestial maps. "Saptarshi," she whispered, tracing each glowing beacon. The lavender sparkle came directly from Vashistha, the twin star. When she listened closely through her audio synthesizer, a soft, chime-like frequency filled her headphones—the star was whispering a celestial riddle of cosmic wind and orbital harmony.`,
        contentHi: `तारा ने तुरंत अपनी पुरानी खगोलीय मानचित्रों की डायरी खोली। "सप्तर्षि," उसने फुसफुसाते हुए प्रत्येक चमकते बिंदु को छुआ। वह बैंगनी चमक वशिष्ठ तारे से आ रही थी। जब उसने ध्यान से अपने हेडफोन में सुना, तो एक मधुर घंटी जैसी धुन सुनाई दी।`,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      },
      {
        chapterNumber: 3,
        title: 'Dawn Across the Amber Sky',
        titleHindi: 'अम्बर आकाश पर सवेरा',
        contentEn: `As dawn painted the horizon in shades of rose and saffron, Tara smiled. She had decoded the message: "Keep looking up; wonder belongs to those who ask questions." Packing her telescope carefully into its velvet case, she knew tonight was merely the first chapter in a lifetime of starlit discoveries.`,
        contentHi: `जैसे ही क्षितिज पर गुलाब और केसरिया रंग छा गया, तारा मुस्कुराई। उसने संदेश समझ लिया था: "ऊपर देखते रहो; कौतूहल उन्हीं का है जो प्रश्न पूछते हैं।"`,
        illustrationUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      },
    ],
  });

  const banyanBook = await Book.create({
    title: "The Banyan's Secret Whisper",
    titleHindi: 'बरगद के उपवन का रहस्य',
    slug: 'the-banyans-secret-whisper',
    authorName: 'Anand Varma',
    authorBio: 'Wildlife photographer and eco-storyteller for young naturalists.',
    synopsis: 'A brother and sister discover that a three-hundred-year-old banyan tree in Kerala communicates with forest creatures through root vibrations.',
    synopsisHindi: 'केरल के एक शांत गाँव में भाई-बहन ने खोजा कि तीन सौ साल पुराना बरगद का पेड़ अपनी जड़ों से जंगल के सभी जीवों से बात करता है।',
    coverUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80',
    ageBracket: '6-8',
    genre: 'Folklore & Nature',
    language: 'bilingual',
    readingTimeMinutes: 14,
    chaptersCount: 2,
    featured: true,
    rating: 4.8,
    readersCount: 1890,
    chapters: [
      {
        chapterNumber: 1,
        title: 'Roots of Whispers',
        titleHindi: 'फुसफुसाती जड़ें',
        contentEn: 'Deep in the heart of the village grove stood the Great Banyan. Its aerial roots fell like wooden curtains.',
        contentHi: 'गाँव के उपवन के बीचों-बीच वह विशाल बरगद खड़ा था जिसकी शाखाएँ हवा में झूलती थीं।',
      },
    ],
  });

  const monsoonBook = await Book.create({
    title: "Pip's Monsoon Paper Boat",
    titleHindi: 'पिप की मानसूनी नाव',
    slug: 'pips-monsoon-paper-boat',
    authorName: 'Kavita Menon',
    authorBio: 'Early childhood educator and watercolor artist.',
    synopsis: 'A courageous little squirrel crafts a buoyant leaf-and-bark boat to rescue a lost butterfly during the first rain of June.',
    synopsisHindi: 'एक साहसी नन्ही गिलहरी जून की पहली बारिश में खोई हुई तितली को बचाने के लिए पत्तों की नाव बनाती है।',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    ageBracket: '3-5',
    genre: 'Animals & Seasons',
    language: 'bilingual',
    readingTimeMinutes: 8,
    chaptersCount: 1,
    featured: true,
    rating: 4.95,
    readersCount: 3100,
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Rainy Day River',
        titleHindi: 'बारिश की नन्ही नदी',
        contentEn: 'Pitter-patter went the rain on the mango leaves! Pip twitched his bushy tail with excitement.',
        contentHi: 'टिप-टिप बरसा पानी आम के पत्तों पर! पिप गिलहरी ने खुशी से अपनी पूंछ हिलाई।',
      },
    ],
  });

  console.log('Seeding interactive educational quizzes...');
  await Quiz.create({
    bookId: taraBook._id,
    bookTitle: taraBook.title,
    title: 'Tara & The Whispering Stars Comprehension Quiz',
    description: 'Test your astronomical observations and help Tara earn 25 Explorer Stars!',
    rewardStars: 25,
    questions: [
      {
        id: 'q1',
        questionEn: 'Which optical instrument did Tara use on her terrace to look at the night sky?',
        questionHi: 'तारा ने रात के आकाश को देखने के लिए अपनी छत पर किस उपकरण का उपयोग किया?',
        optionsEn: ['A brass telescope', 'A digital magnifying glass', 'A pocket prism', 'A periscope'],
        optionsHi: ['पीतल की दूरबीन', 'डिजिटल आवर्धक लेंस', 'प्रिज्म', 'पेरिस्कोप'],
        correctIndex: 0,
        explanation: 'Tara looked through her grandfather’s antique brass telescope.',
      },
      {
        id: 'q2',
        questionEn: 'Near which famous constellation did the lavender star pulse in rhythmic flashes?',
        questionHi: 'किस प्रसिद्ध तारामंडल के पास बैंगनी तारा एक लयबद्ध चमक के साथ धड़क रहा था?',
        optionsEn: ['Orion the Hunter', 'The Great Bear / Saptarshi', 'Cassiopeia', 'Cygnus the Swan'],
        optionsHi: ['ओरियन', 'सप्तर्षि (ग्रेट बियर)', 'कैसिओपिया', 'हंस'],
        correctIndex: 1,
        explanation: 'The lavender flash came from near the handle of the Saptarshi (Ursa Major).',
      },
      {
        id: 'q3',
        questionEn: 'What was the secret message Tara decoded from the starlight frequency?',
        questionHi: 'तारा ने तारों की रोशनी से क्या गुप्त संदेश सुलझाया?',
        optionsEn: ['Go to sleep quickly', 'Wonder belongs to those who ask questions', 'Rain is coming tomorrow', 'Pack your telescope away'],
        optionsHi: ['जल्दी सो जाओ', 'कौतूहल उन्हीं का है जो प्रश्न पूछते हैं', 'कल बारिश होगी', 'दूरबीन बंद कर दो'],
        correctIndex: 1,
        explanation: 'The stars reminded Tara that asking questions is the key to cosmic discoveries!',
      },
    ],
  });

  console.log('Seeding creative workshops...');
  await Workshop.create([
    {
      title: 'Building Alien Worlds & Cosmic Lore',
      instructorName: 'Dr. Meera Sharma',
      instructorRole: 'Author & Astrophysicist',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      date: 'Saturday, Nov 14, 2026',
      time: '11:00 AM - 12:30 PM IST',
      durationMinutes: 90,
      ageBracket: '8-14 yrs',
      category: 'Science Fiction Writing',
      maxSeats: 30,
      bookedSeats: 22,
      description: 'Learn how real science ignites fantasy! Participants will sketch their own custom planetary ecosystem with gravity quirks, weather systems, and hero creatures.',
      learningOutcomes: [
        'How to turn astronomical facts into plot engines',
        'Creating relatable sci-fi characters',
        'Drafting a 300-word opening hook',
      ],
      meetLinkPlaceholder: 'https://meet.storynest.internal/room-astro-42',
    },
    {
      title: 'Painting Whimsical Jungle Creatures in Watercolor',
      instructorName: 'Ananya Sen',
      instructorRole: 'Award-Winning Illustrator',
      instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      date: 'Sunday, Nov 22, 2026',
      time: '4:00 PM - 5:15 PM IST',
      durationMinutes: 75,
      ageBracket: '6-11 yrs',
      category: 'Illustration & Art',
      maxSeats: 25,
      bookedSeats: 19,
      description: 'Bring vibrant forest friends to life using basic brushes and wet-on-wet technique. Step-by-step guidance from thumbnail sketch to finished book page.',
      learningOutcomes: [
        'Mixing warm vs cool tones for storybook moods',
        'Drawing animal emotions and eye expressions',
      ],
      meetLinkPlaceholder: 'https://meet.storynest.internal/room-art-10',
    },
  ]);

  console.log('Seeding author manuscripts...');
  await Manuscript.create([
    {
      authorId: author._id,
      authorName: author.name,
      authorEmail: author.email,
      title: 'Tara and the Whispering Stars',
      titleHindi: 'तारा और फुसफुसाते सितारे',
      synopsis: 'A young girl uncovers celestial signals over Jaipur.',
      targetAge: '6-8',
      genre: 'Astronomy & Adventure',
      wordCount: 1450,
      status: 'PUBLISHED',
      manuscriptFileUrl: '/uploads/manuscripts/tara_and_the_whispering_stars.pdf',
      reviewerNotes: 'Exemplary manuscript. High educational and narrative value.',
    },
    {
      authorId: author._id,
      authorName: author.name,
      authorEmail: author.email,
      title: 'Secrets of the Comet Riders',
      titleHindi: 'धूमकेतु के सवार',
      synopsis: 'A team of children build a sail to ride solar winds near Mars.',
      targetAge: '9-12',
      genre: 'Sci-Fi',
      wordCount: 3200,
      status: 'UNDER_REVIEW',
      manuscriptFileUrl: '/uploads/manuscripts/comet_riders_draft.pdf',
      reviewerNotes: 'Strong opening. Editorial review in progress regarding Chapter 4 pacing.',
    },
    {
      authorId: author._id,
      authorName: author.name,
      authorEmail: author.email,
      title: 'The Moon-Dust Pocket',
      synopsis: 'A bedtime tale about collecting gentle dreams in silver jars.',
      targetAge: '3-5',
      genre: 'Bedtime',
      wordCount: 450,
      status: 'SUBMITTED',
      manuscriptFileUrl: '/uploads/manuscripts/moon_dust_pocket.pdf',
    },
  ]);

  console.log('Seeding welcome notifications...');
  await Notification.create([
    {
      userId: parent._id,
      targetRole: 'parent',
      title: 'Reading Streak Alert! 🌟',
      message: 'Aarav has maintained a 5-day reading streak! He completed Chapter 1 of Tara and the Whispering Stars.',
      link: '/parent',
      type: 'success',
    },
    {
      userId: author._id,
      targetRole: 'author',
      title: 'Manuscript Status Update 📝',
      message: 'Your submission "Secrets of the Comet Riders" is currently under editorial review.',
      link: '/author',
      type: 'review',
    },
    {
      targetRole: 'admin',
      title: 'New Manuscript Awaiting Review 📬',
      message: '"The Moon-Dust Pocket" submitted by Dr. Meera Sharma is awaiting review.',
      link: '/admin',
      type: 'alert',
    },
  ]);

  console.log('Seeding global website settings...');
  await WebsiteSetting.findOneAndUpdate(
    { key: 'global' },
    {
      siteName: 'StoryNest',
      tagline: 'Where Young Minds Read, Create & Grow',
      contactEmail: 'editorial@storynest.com',
      contactPhone: '+91 (0141) 278-9000',
      announcementBarText: '🌟 Young Authors November Arena: Submissions now open!',
      announcementBarActive: true,
      socialTwitter: 'https://twitter.com/storynest',
      socialInstagram: 'https://instagram.com/storynest',
      socialYoutube: 'https://youtube.com/storynest',
      footerCopyrightText: '© 2026 StoryNest Literary Publishing Platform. All rights reserved.',
      maintenanceMode: false,
      defaultSeoTitle: 'StoryNest — Bilingual Children’s Books & Literary Haven',
      defaultSeoDescription: 'A safe, COPPA-compliant sanctuary with bilingual Hindi-English illustrated books, author masterclasses, and creative publishing.',
    },
    { upsert: true, new: true }
  );

  console.log('Seeding CMS dynamic page templates...');
  await CmsPage.deleteMany({});
  await CmsPage.create([
    {
      slug: 'home',
      title: 'Home Landing Page',
      heroHeadline: 'Every Great Story Begins with a Little Imagination.',
      heroSubheadline: 'Discover wonderful books, build creative skills, join inspiring workshops, and bring your own stories to life in a safe, nurturing digital haven.',
      heroBadge: 'For Young Readers & Independent Creators',
      isPublished: true,
    },
    {
      slug: 'about',
      title: 'About StoryNest',
      heroHeadline: 'Where Young Minds Read, Create & Grow',
      heroSubheadline: 'StoryNest was founded on the belief that children’s literature should be vibrant, bilingual, tactile, and unconditionally safe.',
      isPublished: true,
    },
    {
      slug: 'safety',
      title: 'Child Safety & COPPA Policy',
      heroHeadline: 'COPPA & Family Privacy Standards',
      heroSubheadline: 'We recognize that young minds deserve an online sanctuary devoid of surveillance, behavioral advertising, and algorithmic coercion.',
      isPublished: true,
    },
  ]);

  console.log('Seeding audit logs...');
  await AuditLog.deleteMany({});
  await AuditLog.create([
    {
      adminName: 'Editorial Director Dev',
      adminEmail: 'admin@storynest.com',
      action: 'SYSTEM_INITIALIZATION',
      targetResource: 'MongoDB storynest cluster',
      details: 'Super Admin initialized platform schemas, default books, and COPPA safety guards.',
    },
    {
      adminName: 'Editorial Director Dev',
      adminEmail: 'admin@storynest.com',
      action: 'PUBLISHED_BOOK',
      targetResource: 'Book: Tara and the Whispering Stars',
      details: 'Approved and published Dr. Meera Sharma’s bilingual astronomy story.',
    },
  ]);

  console.log('\n======================================================');
  console.log('SUCCESS! MongoDB "storynest" database populated.');
  console.log('You can open MongoDB Compass and connect to:');
  console.log('mongodb://localhost:27017 -> database: storynest');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Error seeding MongoDB:', err);
  process.exit(1);
});
