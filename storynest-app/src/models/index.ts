import mongoose, { Schema, Document, Model } from 'mongoose';

// ---------------------------------------------------------------------------
// 1. USER MODEL
// ---------------------------------------------------------------------------
export type UserRole = 'reader' | 'parent' | 'author' | 'educator' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  languagePreference: 'en' | 'hi';
  isCoppaVerified?: boolean;
  isSuspended?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['reader', 'parent', 'author', 'educator', 'admin'],
      default: 'reader',
    },
    avatarUrl: { type: String },
    bio: { type: String },
    phone: { type: String },
    languagePreference: { type: String, enum: ['en', 'hi'], default: 'en' },
    isCoppaVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 2. CHILD PROFILE (Authorized under Parent)
// ---------------------------------------------------------------------------
export interface IChildProfile extends Document {
  parentId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  displayName: string;
  ageBracket: '3-5' | '6-8' | '9-12' | '13+';
  avatarEmoji: string;
  readingStreak: number;
  starsEarned: number;
  dailyTimeLimitMinutes: number;
  minutesReadToday: number;
  bedtimeCurfew?: string;
  curfewEnabled?: boolean;
  contentFilter?: 'strict' | 'standard' | 'guided';
  createdAt: Date;
}

const ChildProfileSchema = new Schema<IChildProfile>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    displayName: { type: String, required: true },
    ageBracket: { type: String, enum: ['3-5', '6-8', '9-12', '13+'], default: '9-12' },
    avatarEmoji: { type: String, default: '🌟' },
    readingStreak: { type: Number, default: 1 },
    starsEarned: { type: Number, default: 100 },
    dailyTimeLimitMinutes: { type: Number, default: 45 },
    minutesReadToday: { type: Number, default: 0 },
    bedtimeCurfew: { type: String, default: '20:30' },
    curfewEnabled: { type: Boolean, default: true },
    contentFilter: { type: String, enum: ['strict', 'standard', 'guided'], default: 'standard' },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 3. BOOK & CHAPTER
// ---------------------------------------------------------------------------
export interface IChapter {
  chapterNumber: number;
  title: string;
  titleHindi?: string;
  contentEn: string;
  contentHi?: string;
  illustrationUrl?: string;
  audioNarrationUrl?: string;
}

export interface IBook extends Document {
  title: string;
  titleHindi?: string;
  slug: string;
  authorName: string;
  authorBio?: string;
  authorId?: mongoose.Types.ObjectId;
  synopsis: string;
  synopsisHindi?: string;
  coverUrl: string;
  audioPreviewUrl?: string;
  pdfUrl?: string;
  isbn?: string;
  tags?: string[];
  ageBracket: '3-5' | '6-8' | '9-12' | 'All Ages';
  genre: string;
  language: 'en' | 'hi' | 'bilingual';
  readingTimeMinutes: number;
  chaptersCount: number;
  chapters: IChapter[];
  isPublished: boolean;
  isDraft: boolean;
  isArchived: boolean;
  publishedYear: number;
  rating: number;
  readersCount: number;
  featured: boolean;
  downloadable: boolean;
  hasCompanionQuiz?: boolean;
  autoNarrationEnabled?: boolean;
  narratorVoice?: string;
  narrationPace?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    titleHindi: { type: String },
    slug: { type: String, required: true, unique: true },
    authorName: { type: String, required: true },
    authorBio: { type: String },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    synopsis: { type: String, required: true },
    synopsisHindi: { type: String },
    coverUrl: { type: String, required: true },
    audioPreviewUrl: { type: String },
    autoNarrationEnabled: { type: Boolean, default: true },
    narratorVoice: { type: String, default: 'barnaby-warm' },
    narrationPace: { type: Number, default: 1.0 },
    pdfUrl: { type: String },
    isbn: { type: String },
    tags: [{ type: String }],
    ageBracket: { type: String, default: '6-8' },
    genre: { type: String, default: 'Astronomy & Adventure' },
    language: { type: String, enum: ['en', 'hi', 'bilingual'], default: 'bilingual' },
    readingTimeMinutes: { type: Number, default: 15 },
    chaptersCount: { type: Number, default: 3 },
    chapters: [
      {
        chapterNumber: { type: Number, required: true },
        title: { type: String, required: true },
        titleHindi: { type: String },
        contentEn: { type: String, required: true },
        contentHi: { type: String },
        illustrationUrl: { type: String },
        audioNarrationUrl: { type: String },
      },
    ],
    isPublished: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    publishedYear: { type: Number, default: 2026 },
    rating: { type: Number, default: 4.9 },
    readersCount: { type: Number, default: 1240 },
    featured: { type: Boolean, default: true },
    downloadable: { type: Boolean, default: false },
    hasCompanionQuiz: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 4. READING PROGRESS
// ---------------------------------------------------------------------------
export interface IReadingProgress extends Document {
  userId?: mongoose.Types.ObjectId;
  childProfileId?: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  currentChapter: number;
  percentCompleted: number;
  lastReadAt: Date;
  totalMinutesRead: number;
  bookmarks: number[];
}

const ReadingProgressSchema = new Schema<IReadingProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    childProfileId: { type: Schema.Types.ObjectId, ref: 'ChildProfile' },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    currentChapter: { type: Number, default: 1 },
    percentCompleted: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: Date.now },
    totalMinutesRead: { type: Number, default: 0 },
    bookmarks: [{ type: Number }],
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 5. MANUSCRIPT (Author Publishing Pipeline)
// ---------------------------------------------------------------------------
export type ManuscriptStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

export interface IManuscript extends Document {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  title: string;
  titleHindi?: string;
  synopsis: string;
  targetAge: string;
  genre: string;
  wordCount: number;
  status: ManuscriptStatus;
  manuscriptFileUrl: string;
  coverFileUrl?: string;
  reviewerNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

const ManuscriptSchema = new Schema<IManuscript>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    title: { type: String, required: true },
    titleHindi: { type: String },
    synopsis: { type: String, required: true },
    targetAge: { type: String, default: '6-8' },
    genre: { type: String, default: 'Adventure' },
    wordCount: { type: Number, default: 1200 },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'CHANGES_REQUESTED',
        'APPROVED',
        'PUBLISHED',
        'REJECTED',
      ],
      default: 'SUBMITTED',
    },
    manuscriptFileUrl: { type: String, required: true },
    coverFileUrl: { type: String },
    reviewerNotes: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 5B. CHILD CREATIVE STORIES ("My Stories" - COPPA Child-First Publishing)
// ---------------------------------------------------------------------------
export type ChildStoryStatus =
  | 'DRAFT'
  | 'AWAITING_GUARDIAN_APPROVAL'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

export interface IChildStory extends Document {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  guardianId?: mongoose.Types.ObjectId;
  title: string;
  synopsis?: string;
  genre: string;
  targetAge: string;
  status: ChildStoryStatus;
  chapters: Array<{
    chapterNumber: number;
    title: string;
    content: string;
    illustrationUrl?: string;
  }>;
  coverUrl?: string;
  guardianConsentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
  reviewerFeedback?: string;
  submittedAt?: Date;
  publishedAt?: Date;
}

const ChildStorySchema = new Schema<IChildStory>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    guardianId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    synopsis: { type: String, default: '' },
    genre: { type: String, default: 'Adventure & Fantasy' },
    targetAge: { type: String, default: '6-8' },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'AWAITING_GUARDIAN_APPROVAL',
        'SUBMITTED',
        'UNDER_REVIEW',
        'CHANGES_REQUESTED',
        'APPROVED',
        'PUBLISHED',
        'REJECTED',
      ],
      default: 'DRAFT',
    },
    chapters: [
      {
        chapterNumber: { type: Number, required: true, default: 1 },
        title: { type: String, required: true },
        content: { type: String, required: true },
        illustrationUrl: { type: String },
      },
    ],
    coverUrl: { type: String },
    guardianConsentStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED'],
      default: 'PENDING',
    },
    reviewerFeedback: { type: String },
    submittedAt: { type: Date },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 5C. CONTENT MODERATION & SAFETY REPORTS
// ---------------------------------------------------------------------------
export interface IContentReport extends Document {
  reporterId?: mongoose.Types.ObjectId;
  reporterRole?: string;
  contentType: 'book' | 'story' | 'comment' | 'workshop';
  contentId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  resolvedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

const ContentReportSchema = new Schema<IContentReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User' },
    reporterRole: { type: String, default: 'reader' },
    contentType: {
      type: String,
      enum: ['book', 'story', 'comment', 'workshop'],
      required: true,
    },
    contentId: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
    },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 6. WORKSHOPS & BOOKINGS
// ---------------------------------------------------------------------------
export interface IWorkshop extends Document {
  title: string;
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  date: string;
  time: string;
  durationMinutes: number;
  ageBracket: string;
  category: string;
  maxSeats: number;
  bookedSeats: number;
  description: string;
  learningOutcomes: string[];
  meetLinkPlaceholder: string;
  isPublished: boolean;
}

const WorkshopSchema = new Schema<IWorkshop>(
  {
    title: { type: String, required: true },
    instructorName: { type: String, required: true },
    instructorRole: { type: String, required: true },
    instructorAvatar: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    ageBracket: { type: String, default: '7-12 yrs' },
    category: { type: String, default: 'Creative Writing' },
    maxSeats: { type: Number, default: 25 },
    bookedSeats: { type: Number, default: 18 },
    description: { type: String, required: true },
    learningOutcomes: [{ type: String }],
    meetLinkPlaceholder: { type: String, default: 'https://meet.storynest.internal/room-live-42' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface IWorkshopBooking extends Document {
  workshopId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  attendeeName: string;
  attendeeAge: number;
  parentEmail: string;
  status: 'CONFIRMED' | 'ATTENDED' | 'CANCELLED';
  registeredAt: Date;
}

const WorkshopBookingSchema = new Schema<IWorkshopBooking>(
  {
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attendeeName: { type: String, required: true },
    attendeeAge: { type: Number, required: true },
    parentEmail: { type: String, required: true },
    status: { type: String, enum: ['CONFIRMED', 'ATTENDED', 'CANCELLED'], default: 'CONFIRMED' },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 7. QUIZZES & ATTEMPTS
// ---------------------------------------------------------------------------
export interface IQuizQuestion {
  id: string;
  questionEn: string;
  questionHi?: string;
  optionsEn: string[];
  optionsHi?: string[];
  correctIndex: number;
  explanation: string;
}

export interface IQuiz extends Document {
  bookId?: mongoose.Types.ObjectId;
  bookSlug?: string;
  bookTitle: string;
  title: string;
  description: string;
  questions: IQuizQuestion[];
  rewardStars: number;
  isPublished: boolean;
}

const QuizSchema = new Schema<IQuiz>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book' },
    bookSlug: { type: String },
    bookTitle: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [
      {
        id: { type: String, required: true },
        questionEn: { type: String, required: true },
        questionHi: { type: String },
        optionsEn: [{ type: String }],
        optionsHi: [{ type: String }],
        correctIndex: { type: Number, required: true },
        explanation: { type: String },
      },
    ],
    rewardStars: { type: Number, default: 25 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  childProfileId?: mongoose.Types.ObjectId;
  userName: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  starsAwarded: number;
  createdAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    childProfileId: { type: Schema.Types.ObjectId, ref: 'ChildProfile' },
    userName: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    starsAwarded: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 8. NOTIFICATIONS
// ---------------------------------------------------------------------------
export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;
  targetRole?: UserRole;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  type: 'info' | 'success' | 'alert' | 'review';
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    targetRole: { type: String, enum: ['reader', 'parent', 'author', 'educator', 'admin'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['info', 'success', 'alert', 'review'], default: 'info' },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 9. PUBLISHING PACKAGE SERVICE REQUEST
// ---------------------------------------------------------------------------
export interface IPublishingRequest extends Document {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  packageTier: 'Starter Sprout' | 'Illustrator Gold' | 'Master Guild';
  notes?: string;
  status: 'PENDING' | 'IN_DISCUSSION' | 'APPROVED' | 'COMPLETED';
  createdAt: Date;
}

const PublishingRequestSchema = new Schema<IPublishingRequest>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    packageTier: {
      type: String,
      enum: ['Starter Sprout', 'Illustrator Gold', 'Master Guild'],
      required: true,
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'IN_DISCUSSION', 'APPROVED', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 10. CMS DYNAMIC PAGES
// ---------------------------------------------------------------------------
export interface ICmsPage extends Document {
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroBadge?: string;
  bodyContent?: string;
  isPublished: boolean;
  updatedAt: Date;
}

const CmsPageSchema = new Schema<ICmsPage>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    heroHeadline: { type: String },
    heroSubheadline: { type: String },
    heroBadge: { type: String },
    bodyContent: { type: String },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 11. GLOBAL WEBSITE & SEO SETTINGS
// ---------------------------------------------------------------------------
export interface IWebsiteSetting extends Document {
  key: string; // e.g. 'global'
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone?: string;
  announcementBarText?: string;
  announcementBarActive: boolean;
  socialTwitter?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  footerCopyrightText: string;
  maintenanceMode: boolean;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  welcomeStarsAmount: number;
  defaultBedtimeCurfew: string;
  coppaCharterBadgeText: string;
  enablePublishingPortal?: boolean;
  allowCertificateGeneration?: boolean;
}

const WebsiteSettingSchema = new Schema<IWebsiteSetting>(
  {
    key: { type: String, default: 'global', unique: true },
    siteName: { type: String, default: 'StoryNest' },
    tagline: { type: String, default: 'Where Young Minds Read, Create & Grow' },
    contactEmail: { type: String, default: 'editorial@storynest.com' },
    contactPhone: { type: String, default: '+91 (0141) 278-9000' },
    announcementBarText: { type: String, default: '🌟 Young Authors November Arena: Submissions now open!' },
    announcementBarActive: { type: Boolean, default: true },
    socialTwitter: { type: String, default: 'https://twitter.com/storynest' },
    socialInstagram: { type: String, default: 'https://instagram.com/storynest' },
    socialYoutube: { type: String, default: 'https://youtube.com/storynest' },
    footerCopyrightText: { type: String, default: '© 2026 StoryNest Literary Publishing Platform. All rights reserved.' },
    maintenanceMode: { type: Boolean, default: false },
    defaultSeoTitle: { type: String, default: 'StoryNest — Bilingual Children’s Books & Literary Haven' },
    defaultSeoDescription: { type: String, default: 'A safe, COPPA-compliant sanctuary with bilingual Hindi-English illustrated books, author masterclasses, and creative publishing.' },
    welcomeStarsAmount: { type: Number, default: 100 },
    defaultBedtimeCurfew: { type: String, default: '21:00' },
    coppaCharterBadgeText: { type: String, default: 'COPPA & DPDPA Child Charter Protected' },
    enablePublishingPortal: { type: Boolean, default: true },
    allowCertificateGeneration: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 12. CONTESTS & ARENA CHALLENGES
// ---------------------------------------------------------------------------
export interface IContestLaureate {
  name: string;
  age: number;
  storyTitle: string;
  badge: string;
}

export interface IContest extends Document {
  title: string;
  titleHindi?: string;
  edition: string;
  theme: string;
  themeHindi?: string;
  prompt: string;
  promptHindi?: string;
  description: string;
  descriptionHindi?: string;
  wordLimitMin: number;
  wordLimitMax: number;
  deadline: Date;
  prizePool: string;
  perks: string[];
  eligibility: string;
  isActive: boolean;
  laureates: IContestLaureate[];
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true },
    titleHindi: { type: String },
    edition: { type: String, default: '2025' },
    theme: { type: String, required: true },
    themeHindi: { type: String },
    prompt: { type: String, required: true },
    promptHindi: { type: String },
    description: { type: String, required: true },
    descriptionHindi: { type: String },
    wordLimitMin: { type: Number, default: 300 },
    wordLimitMax: { type: Number, default: 1200 },
    deadline: { type: Date, required: true },
    prizePool: { type: String, default: '₹25,000 Book Grants + Anthology Publication' },
    perks: [{ type: String }],
    eligibility: { type: String, default: 'Open to Young Writers aged 6–16' },
    isActive: { type: Boolean, default: true },
    laureates: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        storyTitle: { type: String, required: true },
        badge: { type: String, default: 'Golden Quill 2024' },
      },
    ],
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 13. CONTACT INQUIRIES & HELPDESK
// ---------------------------------------------------------------------------
export interface IContactInquiry extends Document {
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'new' | 'in_progress' | 'replied' | 'resolved';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactInquirySchema = new Schema<IContactInquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    topic: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'replied', 'resolved'],
      default: 'new',
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 12. MEDIA ASSETS
// ---------------------------------------------------------------------------
export interface IMediaAsset extends Document {
  filename: string;
  url: string;
  fileType: string;
  fileSize: number;
  uploadedBy?: string;
  createdAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    fileType: { type: String, default: 'image' },
    fileSize: { type: Number, default: 0 },
    uploadedBy: { type: String, default: 'Super Admin' },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// 13. AUDIT LOGS
// ---------------------------------------------------------------------------
export interface IAuditLog extends Document {
  adminName: string;
  adminEmail: string;
  action: string;
  targetResource: string;
  targetId?: string;
  details?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    targetResource: { type: String, required: true },
    targetId: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// PRODUCTION PERFORMANCE & INTEGRITY INDEXES
// ---------------------------------------------------------------------------
UserSchema.index({ role: 1 });
ChildProfileSchema.index({ parentId: 1 });
ChildProfileSchema.index({ userId: 1 });
BookSchema.index({ isPublished: 1, ageBracket: 1, genre: 1 });
BookSchema.index({ featured: 1, isPublished: 1 });
ReadingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });
ReadingProgressSchema.index({ childProfileId: 1, bookId: 1 });
ChildStorySchema.index({ authorId: 1, status: 1 });
ChildStorySchema.index({ guardianId: 1 });
ChildStorySchema.index({ status: 1, createdAt: -1 });
ManuscriptSchema.index({ authorId: 1, status: 1 });
QuizSchema.index({ bookSlug: 1 });
QuizSchema.index({ isPublished: 1 });
QuizAttemptSchema.index({ userId: 1, quizId: 1 });
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ targetRole: 1, createdAt: -1 });
WorkshopBookingSchema.index({ workshopId: 1, userId: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ adminEmail: 1, createdAt: -1 });
ContentReportSchema.index({ status: 1, createdAt: -1 });

// ---------------------------------------------------------------------------
// MONGOOSE CACHED MODEL EXPORTS
// ---------------------------------------------------------------------------
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export const ChildProfile: Model<IChildProfile> =
  mongoose.models.ChildProfile || mongoose.model<IChildProfile>('ChildProfile', ChildProfileSchema);

export const Book: Model<IBook> =
  mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export const ReadingProgress: Model<IReadingProgress> =
  mongoose.models.ReadingProgress ||
  mongoose.model<IReadingProgress>('ReadingProgress', ReadingProgressSchema);

export const Manuscript: Model<IManuscript> =
  mongoose.models.Manuscript || mongoose.model<IManuscript>('Manuscript', ManuscriptSchema);

export const Workshop: Model<IWorkshop> =
  mongoose.models.Workshop || mongoose.model<IWorkshop>('Workshop', WorkshopSchema);

export const WorkshopBooking: Model<IWorkshopBooking> =
  mongoose.models.WorkshopBooking ||
  mongoose.model<IWorkshopBooking>('WorkshopBooking', WorkshopBookingSchema);

export const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

export const QuizAttempt: Model<IQuizAttempt> =
  mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export const PublishingRequest: Model<IPublishingRequest> =
  mongoose.models.PublishingRequest ||
  mongoose.model<IPublishingRequest>('PublishingRequest', PublishingRequestSchema);

export const CmsPage: Model<ICmsPage> =
  mongoose.models.CmsPage || mongoose.model<ICmsPage>('CmsPage', CmsPageSchema);

export const WebsiteSetting: Model<IWebsiteSetting> =
  mongoose.models.WebsiteSetting ||
  mongoose.model<IWebsiteSetting>('WebsiteSetting', WebsiteSettingSchema);

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset || mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export const Contest: Model<IContest> =
  mongoose.models.Contest || mongoose.model<IContest>('Contest', ContestSchema);

export const ContactInquiry: Model<IContactInquiry> =
  mongoose.models.ContactInquiry ||
  mongoose.model<IContactInquiry>('ContactInquiry', ContactInquirySchema);

export const ChildStory: Model<IChildStory> =
  mongoose.models.ChildStory || mongoose.model<IChildStory>('ChildStory', ChildStorySchema);

export const ContentReport: Model<IContentReport> =
  mongoose.models.ContentReport || mongoose.model<IContentReport>('ContentReport', ContentReportSchema);
