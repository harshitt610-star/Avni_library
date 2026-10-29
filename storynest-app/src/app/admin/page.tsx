'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  LayoutDashboard,
  BookOpen,
  FileEdit,
  FolderOpen,
  Calendar,
  Users,
  Briefcase,
  Image as ImageIcon,
  Settings,
  Download,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  ExternalLink,
  RefreshCw,
  Copy,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  TrendingUp,
  Mail,
  Trophy,
  HelpCircle,
  Clock,
  Shield,
  MessageSquare,
  Headphones,
  Volume2,
  UploadCloud,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'books'
  | 'cms'
  | 'manuscripts'
  | 'workshops'
  | 'contests'
  | 'inquiries'
  | 'users'
  | 'publishing'
  | 'media'
  | 'settings';

export interface AdminAnalyticsData {
  books?: { total: number; published: number; drafts: number };
  users?: { total: number; readers: number; parents: number; authors: number };
  workshops?: { total: number; bookings: number };
  manuscripts?: { total: number; underReview: number; approved: number };
  engagement?: { totalMinutesRead?: number; readingSessions?: number; activeReaders?: number; totalHoursRead?: number };
  editorial?: { pendingReview?: number; approved?: number; pendingSubmissions?: number; approvedBooks?: number };
}

export interface AdminAuditLogItem {
  _id?: string;
  adminName: string;
  action: string;
  targetResource: string;
  details?: string;
  createdAt: string;
}

export interface AdminBookRecord {
  _id: string;
  title: string;
  titleHindi?: string;
  slug: string;
  authorName: string;
  authorBio?: string;
  synopsis: string;
  synopsisHindi?: string;
  coverUrl: string;
  genre: string;
  ageBracket: string;
  language: string;
  readingTimeMinutes: number;
  isPublished: boolean;
  isDraft?: boolean;
  featured?: boolean;
  audioPreviewUrl?: string;
  hasCompanionQuiz?: boolean;
  companionQuiz?: {
    _id?: string;
    title: string;
    rewardStars: number;
    questions: Array<{
      id: string;
      questionEn: string;
      questionHi?: string;
      optionsEn: string[];
      optionsHi?: string[];
      correctIndex: number;
      explanation?: string;
    }>;
  };
  chaptersCount?: number;
  chapters?: Array<{
    chapterNumber: number;
    title: string;
    titleHindi?: string;
    contentEn: string;
    contentHi?: string;
    illustrationUrl?: string;
  }>;
}

export interface AdminManuscriptRecord {
  _id: string;
  title: string;
  authorName: string;
  authorEmail: string;
  status: string;
  targetAge: string;
  genre: string;
  language: string;
  synopsis: string;
  coverUrl?: string;
  manuscriptFileUrl?: string;
  reviewerFeedback?: string;
  createdAt: string;
}

export interface AdminWorkshopRecord {
  _id: string;
  title: string;
  description: string;
  mentorName: string;
  mentorTitle?: string;
  scheduledAt: string;
  maxCapacity: number;
  bookedSeats?: number;
  status?: string;
  meetingUrl?: string;
}

export interface AdminUserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  isCoppaVerified?: boolean;
  isSuspended?: boolean;
  createdAt: string;
}

export interface AdminInquiryRecord {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  topic?: string;
  message: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export interface AdminContestRecord {
  _id: string;
  title: string;
  titleHindi?: string;
  edition: string;
  theme: string;
  themeHindi?: string;
  prompt: string;
  promptHindi?: string;
  description: string;
  deadline: string;
  prizePool: string;
  wordLimitMin: number;
  wordLimitMax: number;
  eligibility: string;
  isActive: boolean;
  laureates?: Array<{ name: string; age: number; storyTitle: string; badge: string }>;
}

export interface AdminMediaAssetRecord {
  _id: string;
  filename: string;
  url: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

export interface AdminPublishingRequestRecord {
  _id: string;
  authorName: string;
  email: string;
  authorEmail?: string;
  phone?: string;
  packageTier: string;
  genre?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface AdminCmsPageRecord {
  _id?: string;
  slug: string;
  title: string;
  heroBadge?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  seoTitle?: string;
  seoDescription?: string;
  bodyContent?: string;
  isPublished?: boolean;
}

export default function SuperAdminPlatform() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 1. Overview Analytics State
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);

  // 2. Books State
  const [books, setBooks] = useState<AdminBookRecord[]>([]);
  const [bookSearch, setBookSearch] = useState('');
  const [bookAgeFilter, setBookAgeFilter] = useState('all');
  const [bookStatusFilter, setBookStatusFilter] = useState('all');
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<AdminBookRecord | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [adminSpeechPlaying, setAdminSpeechPlaying] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    titleHindi: '',
    slug: '',
    authorName: 'StoryNest Author',
    authorBio: '',
    synopsis: '',
    synopsisHindi: '',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    genre: 'Astronomy & Adventure',
    ageBracket: '6-8',
    language: 'bilingual',
    readingTimeMinutes: 15,
    isPublished: true,
    isDraft: false,
    featured: true,
    audioPreviewUrl: '',
    hasCompanionQuiz: false,
    companionQuiz: {
      title: '',
      rewardStars: 25,
      questions: [
        {
          id: 'q-1',
          questionEn: '',
          questionHi: '',
          optionsEn: ['', '', '', ''],
          optionsHi: ['', '', '', ''],
          correctIndex: 0,
          explanation: '',
        },
      ],
    },
    chapters: [
      {
        chapterNumber: 1,
        title: 'Chapter 1: The Adventure Begins',
        titleHindi: 'अध्याय 1: नई शुरुआत',
        contentEn: 'Once upon a time in a world woven of starlight and paper...',
        contentHi: 'एक समय की बात है, तारों और कागज़ की एक जादुई दुनिया में...',
        illustrationUrl: '',
      },
    ],
  });

  // 3. CMS Dynamic Pages State
  const [cmsPages, setCmsPages] = useState<AdminCmsPageRecord[]>([]);
  const [selectedCmsSlug, setSelectedCmsSlug] = useState('home');
  const [cmsPageForm, setCmsPageForm] = useState({
    title: '',
    heroBadge: '',
    heroHeadline: '',
    heroSubheadline: '',
    seoTitle: '',
    seoDescription: '',
    bodyContent: '',
    isPublished: true,
  });

  // 4. Manuscripts State
  const [manuscripts, setManuscripts] = useState<AdminManuscriptRecord[]>([]);
  const [selectedManuscript, setSelectedManuscript] = useState<AdminManuscriptRecord | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [decisionAction, setDecisionAction] = useState<'approve' | 'request_changes' | 'reject'>('approve');
  const [processingDecision, setProcessingDecision] = useState(false);

  // 5. Workshops & Quizzes State
  const [workshops, setWorkshops] = useState<AdminWorkshopRecord[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    mentorName: '',
    mentorTitle: 'Author & Illustrator',
    scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    durationMinutes: 60,
    meetingUrl: 'https://meet.google.com/nest-art-room',
    maxCapacity: 30,
    price: 0,
    description: '',
  });

  // 5b. Quizzes Management State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    rewardStars: 30,
    ageBracket: '9-12',
    questions: [
      {
        questionText: '',
        questionTextHindi: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
      },
    ],
  });

  // 6. Users & RBAC State
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // 7. Publishing CRM State
  const [publishingRequests, setPublishingRequests] = useState<AdminPublishingRequestRecord[]>([]);

  // 8. Media Library State
  const [mediaAssets, setMediaAssets] = useState<AdminMediaAssetRecord[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // 9. Contests & Youth Arena State
  const [contests, setContests] = useState<AdminContestRecord[]>([]);
  const [showContestModal, setShowContestModal] = useState(false);
  const [editingContest, setEditingContest] = useState<AdminContestRecord | null>(null);
  const [contestForm, setContestForm] = useState({
    title: '',
    titleHindi: '',
    edition: '2025',
    theme: '',
    themeHindi: '',
    prompt: '',
    promptHindi: '',
    description: '',
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    prizePool: '₹25,000 Book Grants + Anthology Publication',
    wordLimitMin: 300,
    wordLimitMax: 1200,
    eligibility: 'Ages 6–16 (All India & Global)',
    isActive: true,
    laureates: [
      { name: '', age: 10, storyTitle: '', badge: 'Golden Quill' },
    ],
  });

  // 10. Support & Inquiries State
  const [inquiries, setInquiries] = useState<AdminInquiryRecord[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiryRecord | null>(null);
  const [inquiryTopicFilter, setInquiryTopicFilter] = useState('all');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [inquiryAdminNotes, setInquiryAdminNotes] = useState('');

  // 11. Global Website Settings State
  const [siteSettings, setSiteSettings] = useState<any>({
    siteName: 'StoryNest',
    tagline: 'Where Young Minds Read, Create & Grow',
    announcementBarText: '🌟 Young Authors November Arena: Submissions now open!',
    announcementBarActive: true,
    maintenanceMode: false,
    contactEmail: 'editorial@storynest.com',
    contactPhone: '+91 (0141) 278-9000',
    welcomeStarsAmount: 100,
    defaultBedtimeCurfew: '21:00',
    coppaCharterBadgeText: 'COPPA & DPDPA Child Charter Protected',
    socialTwitter: 'https://twitter.com/storynest',
    socialInstagram: 'https://instagram.com/storynest',
    footerCopyrightText: '© 2026 StoryNest Literary Publishing Platform. All rights reserved.',
  });

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Main data loader
  const loadAllData = async () => {
    setRefreshing(true);
    try {
      // 1. Verify Super Admin authorization
      const authRes = await fetch('/api/auth').then((r) => r.json()).catch(() => null);
      if (!authRes?.authenticated || authRes?.user?.role !== 'admin') {
        setIsAuthorized(false);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setIsAuthorized(true);

      const [
        analyticsRes,
        booksRes,
        pagesRes,
        manuscriptsRes,
        workshopsRes,
        quizzesRes,
        usersRes,
        pubRes,
        mediaRes,
        settingsRes,
        contestsRes,
        inquiriesRes,
      ] = await Promise.all([
        fetch('/api/admin/analytics').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/books').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/pages').then((r) => r.json()).catch(() => null),
        fetch('/api/author/manuscripts').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/workshops').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/quizzes').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/users').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/publishing-requests').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/media').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/settings').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/contests').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/inquiries').then((r) => r.json()).catch(() => null),
      ]);

      if (analyticsRes?.success) {
        setAnalytics(analyticsRes.stats);
        setAuditLogs(analyticsRes.recentAuditLogs || []);
      }
      if (booksRes?.success) setBooks(booksRes.books || []);
      if (pagesRes?.success) {
        setCmsPages(pagesRes.pages || []);
        const homeP = pagesRes.pages?.find((p: any) => p.slug === 'home');
        if (homeP) setCmsPageForm(homeP);
      }
      if (manuscriptsRes?.manuscripts) setManuscripts(manuscriptsRes.manuscripts);
      if (workshopsRes?.success) setWorkshops(workshopsRes.workshops || []);
      if (quizzesRes?.success) setQuizzes(quizzesRes.quizzes || []);
      if (usersRes?.success) setUsers(usersRes.users || []);
      if (pubRes?.success) setPublishingRequests(pubRes.requests || []);
      if (mediaRes?.success) setMediaAssets(mediaRes.assets || []);
      if (settingsRes?.success) setSiteSettings(settingsRes.settings);
      if (contestsRes?.success) setContests(contestsRes.contests || []);
      if (inquiriesRes?.success) setInquiries(inquiriesRes.inquiries || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Could not load all admin data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handler: Change CMS Page to edit
  const handleSelectCmsPage = (slug: string) => {
    setSelectedCmsSlug(slug);
    const p = cmsPages.find((item) => item.slug === slug);
    if (p) {
      setCmsPageForm({
        title: p.title || slug.charAt(0).toUpperCase() + slug.slice(1),
        heroBadge: p.heroBadge || '',
        heroHeadline: p.heroHeadline || '',
        heroSubheadline: p.heroSubheadline || '',
        seoTitle: p.seoTitle || '',
        seoDescription: p.seoDescription || '',
        bodyContent: p.bodyContent || '',
        isPublished: p.isPublished ?? true,
      });
    } else {
      setCmsPageForm({
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        heroBadge: '',
        heroHeadline: '',
        heroSubheadline: '',
        seoTitle: '',
        seoDescription: '',
        bodyContent: '',
        isPublished: true,
      });
    }
  };

  // Handler: Save CMS Page
  const handleSaveCmsPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selectedCmsSlug, ...cmsPageForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`CMS page "/${selectedCmsSlug}" saved directly to MongoDB!`);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to save page', 'error');
      }
    } catch {
      showToast('Failed to save page', 'error');
    }
  };

  // Handler: Save Global Website Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Global settings updated and live across StoryNest!');
        loadAllData();
      } else {
        showToast(data.error || 'Failed to update settings', 'error');
      }
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  // Unsplash Curated Literary Presets
  const UNSPLASH_PRESETS = [
    { name: '🌌 Space Odyssey', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop' },
    { name: '🌳 Enchanted Woods', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop' },
    { name: '🌊 Ocean Mystery', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=800&auto=format&fit=crop' },
    { name: '🦊 Clever Animals', url: 'https://images.unsplash.com/photo-1474511320723-9a56873ee008?q=80&w=800&auto=format&fit=crop' },
    { name: '🏰 Magic Kingdom', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop' },
    { name: '📖 Vintage Folktale', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop' },
  ];

  // Handler: Upload Cover Image File directly to /uploads/ and convert to Link
  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.asset?.url) {
        setBookFormData((prev) => ({ ...prev, coverUrl: data.asset.url }));
        showToast(`Cover image stored! Link generated: ${data.asset.url}`);
      } else {
        showToast(data.error || 'Failed to upload cover image', 'error');
      }
    } catch {
      showToast('Network error during cover image upload', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  // Handler: Upload Audio Narration File (.mp3 / .m4a) to /uploads/ and convert to Link
  const handleUploadAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.asset?.url) {
        setBookFormData((prev) => ({ ...prev, audioPreviewUrl: data.asset.url }));
        showToast(`Audio narration track stored! Link generated: ${data.asset.url}`);
      } else {
        showToast(data.error || 'Failed to upload audio file', 'error');
      }
    } catch {
      showToast('Network error during audio file upload', 'error');
    } finally {
      setUploadingAudio(false);
    }
  };

  // Handler: Test Browser Text-To-Speech (TTS) Narration
  const handleTestAdminSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Browser Speech Synthesis is not supported', 'error');
      return;
    }
    if (adminSpeechPlaying) {
      window.speechSynthesis.cancel();
      setAdminSpeechPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak =
        bookFormData.chapters[0]?.contentEn ||
        bookFormData.synopsis ||
        `Welcome to ${bookFormData.title || 'StoryNest'}. A wonderful tale of discovery and adventure.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
      utterance.onend = () => setAdminSpeechPlaying(false);
      utterance.onerror = () => setAdminSpeechPlaying(false);
      window.speechSynthesis.speak(utterance);
      setAdminSpeechPlaying(true);
      showToast('Narration voice preview playing...');
    }
  };


  // Handler: Open Create Book Modal
  const handleOpenCreateBook = () => {
    setEditingBook(null);
    setBookFormData({
      title: '',
      titleHindi: '',
      slug: '',
      authorName: 'StoryNest Author',
      authorBio: '',
      synopsis: '',
      synopsisHindi: '',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      genre: 'Astronomy & Adventure',
      ageBracket: '6-8',
      language: 'bilingual',
      readingTimeMinutes: 15,
      isPublished: true,
      isDraft: false,
      featured: true,
      audioPreviewUrl: '',
      hasCompanionQuiz: false,
      companionQuiz: {
        title: '',
        rewardStars: 25,
        questions: [
          {
            id: `q-1-${Date.now()}`,
            questionEn: 'What is the main discovery in this story?',
            questionHi: 'इस कहानी में मुख्य खोज क्या है?',
            optionsEn: ['A hidden constellation of stars', 'An empty box', 'A lost key', 'A cloudy day'],
            optionsHi: ['तारों का एक जादुई समूह', 'एक खाली बक्सा', 'एक खोई हुई चाबी', 'एक बादलों भरा दिन'],
            correctIndex: 0,
            explanation: 'Curiosity unlocks hidden celestial beauty.',
          },
        ],
      },
      chapters: [
        {
          chapterNumber: 1,
          title: 'Chapter 1: The Adventure Begins',
          titleHindi: 'अध्याय 1: नई शुरुआत',
          contentEn: 'Once upon a time in a world woven of starlight and paper...',
          contentHi: 'एक समय की बात है, तारों और कागज़ की एक जादुई दुनिया में...',
          illustrationUrl: '',
        },
      ],
    });
    setShowBookModal(true);
  };

  // Handler: Open Edit Book Modal
  const handleOpenEditBook = (book: any) => {
    setEditingBook(book);
    const existingQuiz = book.companionQuiz;
    setBookFormData({
      title: book.title || '',
      titleHindi: book.titleHindi || '',
      slug: book.slug || '',
      authorName: book.authorName || '',
      authorBio: book.authorBio || '',
      synopsis: book.synopsis || '',
      synopsisHindi: book.synopsisHindi || '',
      coverUrl: book.coverUrl || '',
      audioPreviewUrl: book.audioPreviewUrl || '',
      genre: book.genre || 'Astronomy & Adventure',
      ageBracket: book.ageBracket || '6-8',
      language: book.language || 'bilingual',
      readingTimeMinutes: book.readingTimeMinutes || 15,
      isPublished: book.isPublished ?? true,
      isDraft: book.isDraft ?? false,
      featured: book.featured ?? false,
      hasCompanionQuiz: !!(book.hasCompanionQuiz || existingQuiz),
      companionQuiz: existingQuiz
        ? {
            title: existingQuiz.title || `${book.title} Companion Reading Quiz`,
            rewardStars: existingQuiz.rewardStars || 25,
            questions: existingQuiz.questions?.length
              ? existingQuiz.questions
              : [
                  {
                    id: `q-1-${Date.now()}`,
                    questionEn: `What is the main theme of ${book.title}?`,
                    questionHi: '',
                    optionsEn: ['Courage and curiosity', 'Giving up', 'Fear of unknown', 'Staying home'],
                    optionsHi: ['', '', '', ''],
                    correctIndex: 0,
                    explanation: 'The story emphasizes exploration and curiosity.',
                  },
                ],
          }
        : {
            title: `${book.title} Companion Reading Quiz`,
            rewardStars: 25,
            questions: [
              {
                id: `q-1-${Date.now()}`,
                questionEn: `What is the main theme of ${book.title}?`,
                questionHi: '',
                optionsEn: ['Courage and curiosity', 'Giving up', 'Fear of unknown', 'Staying home'],
                optionsHi: ['', '', '', ''],
                correctIndex: 0,
                explanation: 'The story emphasizes exploration and curiosity.',
              },
            ],
          },
      chapters: book.chapters?.length
        ? book.chapters
        : [
            {
              chapterNumber: 1,
              title: 'Chapter 1: The Adventure Begins',
              titleHindi: 'अध्याय 1: नई शुरुआत',
              contentEn: 'Once upon a time in a world woven of starlight and paper...',
              contentHi: 'एक समय की बात है, तारों और कागज़ की एक जादुई दुनिया में...',
              illustrationUrl: '',
            },
          ],
    });
    setShowBookModal(true);
  };

  // Handler: Create or Edit Book
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/books';
      const method = editingBook ? 'PUT' : 'POST';
      const payload = editingBook
        ? { _id: editingBook._id, ...bookFormData }
        : bookFormData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingBook ? 'Book & Companion Quiz updated in MongoDB!' : 'New Book & Companion Quiz published to Live Library!');
        setShowBookModal(false);
        setEditingBook(null);
        loadAllData();
      } else {
        showToast(data.error || 'Book save failed', 'error');
      }
    } catch {
      showToast('Error saving book', 'error');
    }
  };

  // Handler: Delete Book
  const handleDeleteBook = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/books?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Book "${title}" deleted from MongoDB.`);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to delete book', 'error');
      }
    } catch {
      showToast('Error deleting book', 'error');
    }
  };

  // Handler: Toggle Book Featured
  const handleToggleFeatured = async (book: any) => {
    try {
      const res = await fetch('/api/admin/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: book._id, featured: !book.featured }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Book "${book.title}" featured status updated!`);
        loadAllData();
      }
    } catch {
      showToast('Error toggling featured status', 'error');
    }
  };

  // Handler: Manuscript Decision
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManuscript) return;
    setProcessingDecision(true);
    try {
      const res = await fetch('/api/admin/manuscripts/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId: selectedManuscript._id,
          action: decisionAction,
          reviewerNotes: decisionNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          decisionAction === 'approve'
            ? `Manuscript approved & published as live Book "${selectedManuscript.title}" in MongoDB!`
            : `Manuscript decision recorded: ${decisionAction}`
        );
        setSelectedManuscript(null);
        setDecisionNotes('');
        loadAllData();
      } else {
        showToast(data.error || 'Failed to update manuscript decision', 'error');
      }
    } catch {
      showToast('Error updating decision', 'error');
    } finally {
      setProcessingDecision(false);
    }
  };

  // Handler: Save Workshop
  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workshopForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('New workshop created & published to live events calendar!');
        setShowWorkshopModal(false);
        setWorkshopForm({
          title: '',
          mentorName: '',
          mentorTitle: 'Author & Illustrator',
          scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
          durationMinutes: 60,
          meetingUrl: 'https://meet.google.com/nest-art-room',
          maxCapacity: 30,
          price: 0,
          description: '',
        });
        loadAllData();
      } else {
        showToast(data.error || 'Failed to create workshop', 'error');
      }
    } catch {
      showToast('Error creating workshop', 'error');
    }
  };

  // Handler: Toggle User Status
  const handleToggleUserSuspension = async (user: any) => {
    const nextStatus = !user.isSuspended;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: user._id, isSuspended: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User ${user.name} is now ${nextStatus ? 'Suspended' : 'Active'}.`);
        loadAllData();
      }
    } catch {
      showToast('Failed to update user', 'error');
    }
  };

  // Handler: Toggle COPPA Verified
  const handleToggleCoppa = async (user: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: user._id, isCoppaVerified: !user.isCoppaVerified }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`COPPA verification status updated for ${user.name}.`);
        loadAllData();
      }
    } catch {
      showToast('Failed to update COPPA status', 'error');
    }
  };

  // Handler: Update Publishing Request Status
  const handleUpdatePublishingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/publishing-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Publishing request status updated in MongoDB.');
        loadAllData();
      }
    } catch {
      showToast('Failed to update publishing request', 'error');
    }
  };

  // Handler: Upload Media Asset
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast(`File "${file.name}" uploaded successfully!`);
        loadAllData();
      } else {
        showToast(data.error || 'Media upload failed', 'error');
      }
    } catch {
      showToast('Error uploading file', 'error');
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  // Handler: Delete Media Asset
  const handleDeleteMedia = async (id: string, name: string) => {
    if (!confirm(`Delete media asset "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Media asset removed.');
        loadAllData();
      }
    } catch {
      showToast('Error deleting media', 'error');
    }
  };

  // Handler: Save Quiz (Create or Update)
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/quizzes';
      const method = editingQuiz ? 'PUT' : 'POST';
      const payload = editingQuiz ? { _id: editingQuiz._id, ...quizForm } : quizForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingQuiz ? 'Quiz updated in MongoDB!' : 'New Quiz published to Youth Arena!');
        setShowQuizModal(false);
        setEditingQuiz(null);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to save quiz', 'error');
      }
    } catch {
      showToast('Error saving quiz', 'error');
    }
  };

  // Handler: Delete Quiz
  const handleDeleteQuiz = async (id: string, title: string) => {
    if (!confirm(`Permanently delete quiz "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/quizzes?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Quiz "${title}" deleted.`);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to delete quiz', 'error');
      }
    } catch {
      showToast('Error deleting quiz', 'error');
    }
  };

  // Handler: Save Contest (Create or Update)
  const handleSaveContest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/contests';
      const method = editingContest ? 'PUT' : 'POST';
      const payload = editingContest ? { _id: editingContest._id, ...contestForm } : contestForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingContest ? 'Contest updated in MongoDB!' : 'New Contest launched live on Youth Arena!');
        setShowContestModal(false);
        setEditingContest(null);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to save contest', 'error');
      }
    } catch {
      showToast('Error saving contest', 'error');
    }
  };

  // Handler: Delete Contest
  const handleDeleteContest = async (id: string, title: string) => {
    if (!confirm(`Delete contest "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/contests?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Contest "${title}" removed.`);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to delete contest', 'error');
      }
    } catch {
      showToast('Error deleting contest', 'error');
    }
  };

  // Handler: Update Inquiry Status & Notes
  const handleUpdateInquiryStatus = async (id: string, status: string, notes?: string) => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, status, adminNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Inquiry marked as ${status}.`);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to update inquiry', 'error');
      }
    } catch {
      showToast('Error updating inquiry status', 'error');
    }
  };

  // Handler: Delete Inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Remove this inquiry message?')) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Inquiry removed.');
        if (selectedInquiry?._id === id) setSelectedInquiry(null);
        loadAllData();
      }
    } catch {
      showToast('Error deleting inquiry', 'error');
    }
  };

  if (isAuthorized === false) {
    return (
      <div className="flex flex-col min-h-screen bg-[#faf7f0]">
        <Navbar />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center px-4">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#203047]/10 shadow-tactile-xl max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              Restricted Area
            </span>
            <h2 className="font-serif-story text-2xl font-bold text-[#203047] mt-3">
              Super Admin Access Required
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              You are currently not signed in as a platform Super Administrator. Please authenticate with administrator credentials to manage library catalogs, CMS pages, and user RBAC.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={async () => {
                  setRefreshing(true);
                  await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'demo_switch', role: 'admin' }),
                  });
                  loadAllData();
                }}
                className="w-full py-3 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#142030] shadow-tactile transition"
              >
                ⚡ Sign in as Editorial Director Dev (Admin)
              </button>
              <Link
                href="/login?role=admin&redirect=/admin"
                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition"
              >
                Go to Standard Login Screen
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f0] text-[#1c2938]">
      <Navbar />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-tactile-lg text-sm font-semibold transition-all duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-[#2F6B57] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#ffdea7]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Super Admin Banner */}
          <div className="bg-gradient-to-r from-[#203047] via-[#1a283c] to-[#0d1622] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-tactile-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#E9B44C] text-[#203047] text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                  Super Admin CMS
                </span>
                <span className="text-xs text-[#ffdea7] flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  MongoDB: storynest (Connected)
                </span>
              </div>
              <h1 className="font-serif-story text-2xl sm:text-3xl lg:text-4xl font-bold">
                Centralized Platform &amp; Content Management System
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
                Real-time governance of bilingual books, live CMS pages, manuscript pipeline, child safety COPPA controls, workshops, and global SEO.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadAllData}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition text-white"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Sync MongoDB'}</span>
              </button>
              <a
                href="/api/admin/analytics?export=csv"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E9B44C] hover:bg-[#d8a339] text-[#203047] text-xs font-black transition shadow-tactile"
              >
                <Download className="w-4 h-4" />
                <span>Export Platform CSV</span>
              </a>
            </div>
          </div>

          {/* Mobile Tab Quick-Jump Dropdown */}
          <div className="block lg:hidden mb-4">
            <label htmlFor="admin-mobile-tab-select" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Admin Section
            </label>
            <div className="relative">
              <select
                id="admin-mobile-tab-select"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as AdminTab)}
                className="w-full bg-white text-[#203047] font-bold text-sm px-4 py-3 rounded-2xl border border-[#203047]/15 shadow-tactile focus:outline-none focus:ring-2 focus:ring-[#203047] appearance-none"
              >
                <option value="overview">📊 Overview &amp; Analytics</option>
                <option value="books">📚 Books &amp; Chapters CMS</option>
                <option value="cms">✏️ Dynamic Page Builder</option>
                <option value="manuscripts">📁 Manuscript Review Suite</option>
                <option value="workshops">📅 Workshops &amp; Masterclasses</option>
                <option value="contests">🏆 Youth Arena &amp; Contests</option>
                <option value="inquiries">✉️ Support &amp; Inquiries ({inquiries.filter((i) => i.status === 'new').length} new)</option>
                <option value="users">👥 Users &amp; RBAC Controls</option>
                <option value="publishing">💼 Publishing CRM Leads</option>
                <option value="media">🖼️ Media Library</option>
                <option value="settings">⚙️ Website &amp; SEO Settings</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#203047]">
                ▼
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="bg-white rounded-2xl p-2 shadow-tactile border border-[#203047]/10 mb-8 overflow-x-auto scrollbar-none [touch-action:pan-x]">
            <nav className="flex space-x-1 min-w-max">
              {[
                { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
                { id: 'books', label: 'Books & Chapters CMS', icon: BookOpen },
                { id: 'cms', label: 'Dynamic Page Builder', icon: FileEdit },
                { id: 'manuscripts', label: 'Manuscript Review Suite', icon: FolderOpen },
                { id: 'workshops', label: 'Workshops & Quizzes', icon: Calendar },
                { id: 'contests', label: 'Youth Arena & Contests', icon: Trophy },
                { id: 'inquiries', label: `Support & Inquiries (${inquiries.filter((i) => i.status === 'new').length})`, icon: Mail },
                { id: 'users', label: 'Users & RBAC Controls', icon: Users },
                { id: 'publishing', label: 'Publishing CRM Leads', icon: Briefcase },
                { id: 'media', label: 'Media Library', icon: ImageIcon },
                { id: 'settings', label: 'Website & SEO Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#203047] text-white shadow-tactile'
                        : 'text-[#203047]/70 hover:bg-[#faf7f0] hover:text-[#203047]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl p-5 border border-[#203047]/10 shadow-tactile">
                  <div className="flex items-center justify-between text-[#203047]/60 text-xs font-bold uppercase mb-2">
                    <span>Total Library Books</span>
                    <BookOpen className="w-4 h-4 text-[#2F6B57]" />
                  </div>
                  <div className="text-3xl font-serif-story font-bold text-[#203047]">
                    {analytics?.books?.total ?? '...'}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#2F6B57] font-semibold mt-2">
                    <span>{analytics?.books?.published ?? 0} Published</span>
                    <span>•</span>
                    <span className="text-amber-600">{analytics?.books?.drafts ?? 0} Drafts</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#203047]/10 shadow-tactile">
                  <div className="flex items-center justify-between text-[#203047]/60 text-xs font-bold uppercase mb-2">
                    <span>Registered Accounts</span>
                    <Users className="w-4 h-4 text-[#203047]" />
                  </div>
                  <div className="text-3xl font-serif-story font-bold text-[#203047]">
                    {analytics?.users?.total ?? '...'}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-2 truncate">
                    {analytics?.users?.readers ?? 0} Readers | {analytics?.users?.parents ?? 0} Parents | {analytics?.users?.authors ?? 0} Authors
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#203047]/10 shadow-tactile">
                  <div className="flex items-center justify-between text-[#203047]/60 text-xs font-bold uppercase mb-2">
                    <span>Minutes Read by Kids</span>
                    <TrendingUp className="w-4 h-4 text-[#E9B44C]" />
                  </div>
                  <div className="text-3xl font-serif-story font-bold text-[#203047]">
                    {analytics?.engagement?.totalMinutesRead ?? 0}
                    <span className="text-sm font-sans font-normal text-gray-500 ml-1">mins</span>
                  </div>
                  <div className="text-[11px] text-[#2F6B57] mt-2 font-semibold">
                    Across {analytics?.engagement?.readingSessions ?? 0} active sessions
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#203047]/10 shadow-tactile">
                  <div className="flex items-center justify-between text-[#203047]/60 text-xs font-bold uppercase mb-2">
                    <span>Editorial Review Queue</span>
                    <FolderOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-3xl font-serif-story font-bold text-purple-900">
                    {analytics?.editorial?.pendingReview ?? 0}
                  </div>
                  <div className="text-[11px] text-purple-700 mt-2 font-semibold">
                    {analytics?.editorial?.approved ?? 0} approved &amp; live in catalog
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="bg-white rounded-2xl p-6 border border-[#203047]/10 shadow-tactile">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#203047]/70 mb-4">
                  Quick Action CMS Shortcuts
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      handleOpenCreateBook();
                      setActiveTab('books');
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#203047]/15 hover:border-[#2F6B57] hover:bg-[#2F6B57]/5 transition text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#2F6B57]/10 flex items-center justify-center text-[#2F6B57] group-hover:scale-110 transition">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#203047]">Create Book</div>
                      <div className="text-[10px] text-gray-500">Add to MongoDB</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('cms')}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#203047]/15 hover:border-[#203047] hover:bg-[#203047]/5 transition text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#203047]/10 flex items-center justify-center text-[#203047] group-hover:scale-110 transition">
                      <FileEdit className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#203047]">Edit Home Hero</div>
                      <div className="text-[10px] text-gray-500">Live Website Text</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowWorkshopModal(true);
                      setActiveTab('workshops');
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#203047]/15 hover:border-[#E9B44C] hover:bg-[#E9B44C]/10 transition text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E9B44C]/20 flex items-center justify-center text-[#203047] group-hover:scale-110 transition">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#203047]">New Workshop</div>
                      <div className="text-[10px] text-gray-500">Schedule event</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('manuscripts')}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[#203047]/15 hover:border-purple-600 hover:bg-purple-50 transition text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 group-hover:scale-110 transition">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#203047]">Review Submissions</div>
                      <div className="text-[10px] text-gray-500">{manuscripts.length} in queue</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Real-time Audit Logs & MongoDB Activity */}
              <div className="bg-white rounded-2xl p-6 border border-[#203047]/10 shadow-tactile">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif-story font-bold text-lg text-[#203047]">
                      Real-Time Platform Audit &amp; Activity Log
                    </h3>
                    <p className="text-xs text-gray-500">
                      Immutable trail of all administrative and editorial actions stored in MongoDB collection `auditlogs`.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2F6B57] bg-[#2F6B57]/10 px-3 py-1 rounded-full">
                    {auditLogs.length} events logged
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Administrator</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Target Resource</th>
                        <th className="py-2.5 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLogs.slice(0, 10).map((log, idx) => (
                        <tr key={log._id || idx} className="hover:bg-[#faf7f0]/60 transition">
                          <td className="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#203047]">
                            {log.adminName}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-[#203047]/10 text-[#203047] font-mono px-2 py-0.5 rounded text-[10px] font-bold">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-600">
                            {log.targetResource}
                          </td>
                          <td className="py-3 px-3 text-gray-700 max-w-xs truncate">
                            {log.details || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKS & CHAPTERS CMS */}
          {activeTab === 'books' && (
            <div className="space-y-6">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#203047]/10 shadow-tactile">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search title, author, genre..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                    />
                  </div>

                  <select
                    value={bookAgeFilter}
                    onChange={(e) => setBookAgeFilter(e.target.value)}
                    className="text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none"
                  >
                    <option value="all">All Ages</option>
                    <option value="3-5">Ages 3-5</option>
                    <option value="6-8">Ages 6-8</option>
                    <option value="9-12">Ages 9-12</option>
                  </select>

                  <select
                    value={bookStatusFilter}
                    onChange={(e) => setBookStatusFilter(e.target.value)}
                    className="text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>

                <button
                  onClick={handleOpenCreateBook}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F6B57] hover:bg-[#255646] text-white text-xs font-bold transition shadow-tactile whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Book</span>
                </button>
              </div>

              {/* Books Table */}
              <div className="bg-white rounded-2xl border border-[#203047]/10 shadow-tactile overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[760px]">
                  <thead>
                    <tr className="bg-[#faf7f0] border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Cover</th>
                      <th className="py-3.5 px-4">Title &amp; Story Details</th>
                      <th className="py-3.5 px-4">Author</th>
                      <th className="py-3.5 px-4">Age / Genre</th>
                      <th className="py-3.5 px-4">Chapters</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {books
                      .filter((b) => {
                        const matchSearch =
                          bookSearch === '' ||
                          b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
                          b.authorName.toLowerCase().includes(bookSearch.toLowerCase());
                        const matchAge = bookAgeFilter === 'all' || b.ageBracket === bookAgeFilter;
                        const matchStatus =
                          bookStatusFilter === 'all' ||
                          (bookStatusFilter === 'published' && b.isPublished) ||
                          (bookStatusFilter === 'draft' && b.isDraft);
                        return matchSearch && matchAge && matchStatus;
                      })
                      .map((book) => (
                        <tr key={book._id} className="hover:bg-[#faf7f0]/60 transition">
                          <td className="py-3 px-4">
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded-md shadow-sm border border-gray-200"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#203047] text-sm">{book.title}</div>
                            {book.titleHindi && (
                              <div className="text-gray-500 font-serif text-[11px]">
                                {book.titleHindi}
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-gray-400 font-mono">
                                /{book.slug}
                              </span>
                              {book.companionQuiz || book.hasCompanionQuiz ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#002117] bg-[#b1f0d6] px-1.5 py-0.5 rounded-full">
                                  <Trophy className="w-2.5 h-2.5 text-[#2d6955]" />
                                  <span>Quiz Ready ({book.companionQuiz?.questions?.length || 3} Qs)</span>
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                  No Quiz
                                </span>
                              )}
                              {book.audioPreviewUrl ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                                  <Headphones className="w-2.5 h-2.5" />
                                  <span>Audio Track</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                  <Volume2 className="w-2.5 h-2.5" />
                                  <span>Smart TTS</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-700">{book.authorName}</td>
                          <td className="py-3 px-4">
                            <span className="bg-[#203047]/10 text-[#203047] px-2 py-0.5 rounded font-bold text-[10px] mr-1.5">
                              {book.ageBracket}
                            </span>
                            <span className="text-gray-500">{book.genre}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-700">
                            {book.chapters?.length || book.chaptersCount || 1} chs
                          </td>
                          <td className="py-3 px-4">
                            {book.isPublished ? (
                              <span className="inline-flex items-center gap-1 text-[#2F6B57] bg-[#2F6B57]/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                <CheckCircle className="w-3 h-3" /> Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleFeatured(book)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                                book.featured
                                  ? 'bg-[#E9B44C]/20 text-[#203047]'
                                  : 'text-gray-300 hover:text-gray-600'
                              }`}
                              title="Toggle Home Page Featured Showcase"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/book/${book.slug}`}
                                target="_blank"
                                className="p-1.5 text-gray-500 hover:text-[#203047] hover:bg-gray-100 rounded-lg"
                                title="View Public Book Page"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleOpenEditBook(book)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit Book, Audio & Companion Quiz"
                              >
                                <FileEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book._id, book.title)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                title="Delete from MongoDB"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC PAGE BUILDER / CMS */}
          {activeTab === 'cms' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Pages Selector Sidebar */}
              <div className="bg-white rounded-2xl p-4 border border-[#203047]/10 shadow-tactile space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                  Public Website Pages
                </div>
                {[
                  { slug: 'home', label: 'Home Page' },
                  { slug: 'about', label: 'About Us' },
                  { slug: 'safety', label: 'Safety & Parents' },
                  { slug: 'contact', label: 'Contact Us' },
                  { slug: 'faq', label: 'FAQ Page' },
                  { slug: 'privacy', label: 'Privacy Policy' },
                  { slug: 'terms', label: 'Terms of Service' },
                ].map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => handleSelectCmsPage(item.slug)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                      selectedCmsSlug === item.slug
                        ? 'bg-[#203047] text-white shadow-tactile'
                        : 'text-gray-700 hover:bg-[#faf7f0]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] opacity-70 font-mono">/{item.slug}</span>
                  </button>
                ))}
              </div>

              {/* Page Editor Form */}
              <div className="md:col-span-3 bg-white rounded-2xl p-6 sm:p-8 border border-[#203047]/10 shadow-tactile">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                  <div>
                    <h2 className="font-serif-story font-bold text-xl text-[#203047]">
                      Editing CMS Page: <span className="text-[#2F6B57]">/{selectedCmsSlug}</span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      Changes update live across the public StoryNest website and persist in MongoDB.
                    </p>
                  </div>
                  <Link
                    href={selectedCmsSlug === 'home' ? '/' : `/${selectedCmsSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-[#203047] font-bold px-3 py-1.5 bg-[#faf7f0] rounded-xl hover:bg-gray-100 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Live Page</span>
                  </Link>
                </div>

                <form onSubmit={handleSaveCmsPage} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={cmsPageForm.title || ''}
                        onChange={(e) => setCmsPageForm({ ...cmsPageForm, title: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        Hero Top Badge
                      </label>
                      <input
                        type="text"
                        value={cmsPageForm.heroBadge || ''}
                        onChange={(e) => setCmsPageForm({ ...cmsPageForm, heroBadge: e.target.value })}
                        placeholder="e.g. 🌟 Bilingual Literary Sanctuary"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Hero Primary Headline
                    </label>
                    <input
                      type="text"
                      value={cmsPageForm.heroHeadline || ''}
                      onChange={(e) => setCmsPageForm({ ...cmsPageForm, heroHeadline: e.target.value })}
                      placeholder="e.g. Where Young Minds Read, Create & Grow"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Hero Subheadline / Narrative
                    </label>
                    <textarea
                      rows={3}
                      value={cmsPageForm.heroSubheadline || ''}
                      onChange={(e) => setCmsPageForm({ ...cmsPageForm, heroSubheadline: e.target.value })}
                      placeholder="Introductory paragraph displayed prominently on the page..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Body Content / Markdown / FAQs
                    </label>
                    <textarea
                      rows={6}
                      value={cmsPageForm.bodyContent || ''}
                      onChange={(e) => setCmsPageForm({ ...cmsPageForm, bodyContent: e.target.value })}
                      placeholder="Detailed content, institutional copy, or guidelines..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047] font-mono text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={cmsPageForm.seoTitle || ''}
                        onChange={(e) => setCmsPageForm({ ...cmsPageForm, seoTitle: e.target.value })}
                        placeholder="StoryNest — Page Title"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        SEO Meta Description
                      </label>
                      <input
                        type="text"
                        value={cmsPageForm.seoDescription || ''}
                        onChange={(e) => setCmsPageForm({ ...cmsPageForm, seoDescription: e.target.value })}
                        placeholder="Concise Google search description..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#203047] hover:bg-[#142030] text-white text-xs font-bold transition shadow-tactile"
                    >
                      Save &amp; Publish Page to MongoDB
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: MANUSCRIPT REVIEW SUITE */}
          {activeTab === 'manuscripts' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-[#203047]/10 shadow-tactile flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-story font-bold text-xl text-[#203047]">
                    Author Manuscript Editorial Pipeline
                  </h2>
                  <p className="text-xs text-gray-500">
                    Review author submissions, inspect manuscripts and artwork, request revisions, or one-click publish directly into the StoryNest library.
                  </p>
                </div>
                <span className="text-xs font-bold bg-[#E9B44C]/20 text-[#203047] px-3 py-1.5 rounded-xl">
                  {manuscripts.length} Submissions in Database
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submissions List */}
                <div className="lg:col-span-1 space-y-3">
                  {manuscripts.length === 0 ? (
                    <div className="bg-white p-6 rounded-2xl text-center text-xs text-gray-400">
                      No manuscripts submitted yet.
                    </div>
                  ) : (
                    manuscripts.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => {
                          setSelectedManuscript(item);
                          setDecisionNotes(item.reviewerFeedback || '');
                        }}
                        className={`p-4 rounded-2xl border transition cursor-pointer ${
                          selectedManuscript?._id === item._id
                            ? 'bg-white border-[#203047] shadow-tactile-lg ring-2 ring-[#203047]/10'
                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-[#203047]">{item.title}</h4>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'UNDER_REVIEW'
                                ? 'bg-purple-100 text-purple-800'
                                : item.status === 'CHANGES_REQUESTED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          By <span className="font-semibold text-gray-700">{item.authorName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2 font-mono">
                          <span>Age: {item.targetAge}</span>
                          <span>•</span>
                          <span>{item.genre}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Detailed Manuscript Inspector */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-[#203047]/10 shadow-tactile">
                  {selectedManuscript ? (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6B57]">
                            Manuscript Inspector
                          </span>
                          <h3 className="font-serif-story text-2xl font-bold text-[#203047]">
                            {selectedManuscript.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Author: <strong className="text-gray-800">{selectedManuscript.authorName}</strong> ({selectedManuscript.authorEmail})
                          </p>
                        </div>

                        {selectedManuscript.coverUrl && (
                          <img
                            src={selectedManuscript.coverUrl}
                            alt="Cover preview"
                            className="w-16 h-22 object-cover rounded-xl shadow-md border"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf7f0] p-4 rounded-xl text-xs">
                        <div>
                          <div className="text-gray-400 text-[10px] uppercase font-bold">Target Age</div>
                          <div className="font-bold text-[#203047]">{selectedManuscript.targetAge}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[10px] uppercase font-bold">Genre</div>
                          <div className="font-bold text-[#203047]">{selectedManuscript.genre}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[10px] uppercase font-bold">Language</div>
                          <div className="font-bold text-[#203047] uppercase">{selectedManuscript.language}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[10px] uppercase font-bold">Submitted</div>
                          <div className="font-bold text-[#203047]">
                            {new Date(selectedManuscript.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                          Synopsis &amp; Pitch
                        </h4>
                        <p className="text-xs text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200/60 leading-relaxed">
                          {selectedManuscript.synopsis}
                        </p>
                      </div>

                      {selectedManuscript.manuscriptFileUrl && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Uploaded Document File
                          </h4>
                          <a
                            href={selectedManuscript.manuscriptFileUrl}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#142030] transition shadow-tactile"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Manuscript File ({selectedManuscript.manuscriptFileUrl})</span>
                          </a>
                        </div>
                      )}

                      {/* Editorial Decision Form */}
                      <form onSubmit={handleDecisionSubmit} className="pt-4 border-t border-gray-100 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#203047]">
                          Editorial Board Action
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label
                            className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                              decisionAction === 'approve'
                                ? 'bg-[#2F6B57]/10 border-[#2F6B57] text-[#2F6B57] font-bold'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="decision"
                              value="approve"
                              checked={decisionAction === 'approve'}
                              onChange={() => setDecisionAction('approve')}
                              className="sr-only"
                            />
                            <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-xs">Approve &amp; Publish</span>
                          </label>

                          <label
                            className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                              decisionAction === 'request_changes'
                                ? 'bg-amber-100 border-amber-600 text-amber-900 font-bold'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="decision"
                              value="request_changes"
                              checked={decisionAction === 'request_changes'}
                              onChange={() => setDecisionAction('request_changes')}
                              className="sr-only"
                            />
                            <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-xs">Request Revisions</span>
                          </label>

                          <label
                            className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                              decisionAction === 'reject'
                                ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="decision"
                              value="reject"
                              checked={decisionAction === 'reject'}
                              onChange={() => setDecisionAction('reject')}
                              className="sr-only"
                            />
                            <XCircle className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-xs">Reject</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Reviewer Feedback Notes to Author
                          </label>
                          <textarea
                            rows={3}
                            value={decisionNotes}
                            onChange={(e) => setDecisionNotes(e.target.value)}
                            placeholder="Detailed feedback sent to the author's dashboard..."
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={processingDecision}
                          className="w-full py-3 rounded-xl bg-[#203047] hover:bg-[#152335] text-white text-xs font-bold transition shadow-tactile"
                        >
                          {processingDecision
                            ? 'Processing Editorial Decision...'
                            : decisionAction === 'approve'
                            ? '✨ Confirm Approval & Auto-Publish Live Book in MongoDB'
                            : 'Save Editorial Decision'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <FolderOpen className="w-12 h-12 text-gray-300 mb-3" />
                      <h4 className="font-bold text-sm text-gray-700">Select a manuscript</h4>
                      <p className="text-xs text-gray-400 max-w-sm mt-1">
                        Click any submission from the queue on the left to inspect text, cover art, and take editorial action.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WORKSHOPS & QUIZZES */}
          {activeTab === 'workshops' && (
            <div className="space-y-8">
              {/* Workshops Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#203047]/10 shadow-tactile">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
                  <div>
                    <h2 className="font-serif-story font-bold text-xl text-[#203047]">
                      Live Creative Workshops &amp; Masterclasses
                    </h2>
                    <p className="text-xs text-gray-500">
                      Manage virtual writing and illustration events, seat capacity, private meeting links, and attendee rosters.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWorkshopModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F6B57] text-white text-xs font-bold hover:bg-[#235343] transition shadow-tactile"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule New Workshop</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workshops.map((ws) => (
                    <div
                      key={ws._id}
                      className="p-5 rounded-2xl border border-gray-200 bg-[#faf7f0]/40 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-serif-story font-bold text-base text-[#203047]">
                            {ws.title}
                          </h4>
                          <span className="text-[10px] font-black uppercase bg-[#E9B44C]/30 text-[#203047] px-2 py-0.5 rounded-full">
                            {ws.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{ws.description}</p>
                        <div className="text-xs text-gray-500 space-y-1 mb-4">
                          <div>
                            Mentor: <strong>{ws.mentorName}</strong> ({ws.mentorTitle})
                          </div>
                          <div>
                            Date: <strong>{new Date(ws.scheduledAt).toLocaleString()}</strong>
                          </div>
                          <div>
                            Seats: <strong>{ws.bookedSeats || 0} / {ws.maxCapacity} booked</strong>
                          </div>
                          <div className="truncate text-blue-600 font-mono text-[11px]">
                            Meet Link: {ws.meetingUrl}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 text-xs">
                        <Link
                          href={`/workshops/${ws._id}/room`}
                          target="_blank"
                          className="font-bold text-[#203047] hover:underline flex items-center gap-1"
                        >
                          <span>Open Workshop Room</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete workshop "${ws.title}"?`)) return;
                            await fetch(`/api/admin/workshops?id=${ws._id}`, { method: 'DELETE' });
                            showToast('Workshop deleted');
                            loadAllData();
                          }}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quizzes & Star Badges Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#203047]/10 shadow-tactile">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                  <div>
                    <h2 className="font-serif-story font-bold text-xl text-[#203047]">
                      Interactive Quizzes &amp; Star Badges
                    </h2>
                    <p className="text-xs text-gray-500">
                      Reading comprehension activities with bilingual options that award stars to young readers.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#2F6B57] bg-[#2F6B57]/10 px-3 py-1.5 rounded-xl">
                      {quizzes.length} Quizzes Active
                    </span>
                    <button
                      onClick={() => {
                        setEditingQuiz(null);
                        setQuizForm({
                          title: '',
                          description: '',
                          rewardStars: 30,
                          ageBracket: '9-12',
                          questions: [
                            {
                              questionText: '',
                              questionTextHindi: '',
                              options: ['', '', '', ''],
                              correctAnswerIndex: 0,
                              explanation: '',
                            },
                          ],
                        });
                        setShowQuizModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#142030] transition shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Quiz</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="p-4 rounded-xl border border-gray-200 bg-[#faf7f0]/40 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-[#203047]">{quiz.title}</h4>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            +{quiz.rewardStars || quiz.starReward || 30} Stars
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{quiz.description}</p>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {quiz.questions?.length || 0} questions • Age {quiz.ageBracket || '6-12'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200/60">
                        <button
                          onClick={() => {
                            setEditingQuiz(quiz);
                            setQuizForm({
                              title: quiz.title,
                              description: quiz.description || '',
                              rewardStars: quiz.rewardStars || quiz.starReward || 30,
                              ageBracket: quiz.ageBracket || '9-12',
                              questions: quiz.questions || [],
                            });
                            setShowQuizModal(true);
                          }}
                          className="text-xs text-[#203047] font-bold hover:underline flex items-center gap-1"
                        >
                          <FileEdit className="w-3.5 h-3.5" /> Edit Quiz
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: YOUTH ARENA & CONTESTS */}
          {activeTab === 'contests' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#203047]/10 shadow-tactile">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
                  <div>
                    <h2 className="font-serif-story font-bold text-xl text-[#203047]">
                      National Youth Arena &amp; Storyteller Cups
                    </h2>
                    <p className="text-xs text-gray-500">
                      Manage official writing championships, prompts, themes, submission deadlines, prizes, and past laureates.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingContest(null);
                      setContestForm({
                        title: 'National Young Storyteller Cup',
                        titleHindi: 'राष्ट्रीय बाल लेखक प्रतियोगिता',
                        edition: '2025',
                        theme: 'Whispers of the Banyan Tree',
                        themeHindi: 'बरगद की फुसफुसाहट',
                        prompt: 'Write an imaginative story about a hidden clockwork forest where ancient trees tell stories.',
                        promptHindi: 'एक ऐसी जादुई घड़ी के जंगल की कहानी लिखें जहाँ प्राचीन पेड़ कहानियाँ सुनाते हैं।',
                        description: 'StoryNest invites budding young wordsmiths to submit original illustrated tales.',
                        deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                        prizePool: '₹25,000 Book Grants + Anthology Publication',
                        wordLimitMin: 300,
                        wordLimitMax: 1200,
                        eligibility: 'Ages 6–16 (All India & Global)',
                        isActive: true,
                        laureates: [
                          { name: 'Ananya Sharma', age: 11, storyTitle: 'The Clockwork Sparrow', badge: 'Golden Quill 2024' },
                        ],
                      });
                      setShowContestModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F6B57] text-white text-xs font-bold hover:bg-[#235343] transition shadow-tactile"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Launch New Contest</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {contests.map((c) => (
                    <div
                      key={c._id}
                      className="p-6 rounded-2xl border border-gray-200 bg-[#faf7f0]/40 flex flex-col justify-between gap-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase bg-[#2F6B57] text-white px-2.5 py-0.5 rounded-full">
                              Edition {c.edition}
                            </span>
                            {c.isActive && (
                              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                Live Active on Arena
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif-story font-bold text-xl text-[#203047]">
                            {c.title}
                          </h3>
                          {c.titleHindi && (
                            <p className="text-sm font-serif-story text-[#2d6955]">{c.titleHindi}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href="/activities"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-[#203047] text-xs font-semibold hover:bg-gray-50"
                          >
                            <span>Preview Live Arena</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => {
                              setEditingContest(c);
                              setContestForm({
                                title: c.title || '',
                                titleHindi: c.titleHindi || '',
                                edition: c.edition || '2025',
                                theme: c.theme || '',
                                themeHindi: c.themeHindi || '',
                                prompt: c.prompt || '',
                                promptHindi: c.promptHindi || '',
                                description: c.description || '',
                                deadline: c.deadline ? new Date(c.deadline).toISOString().slice(0, 10) : '',
                                prizePool: c.prizePool || '',
                                wordLimitMin: c.wordLimitMin || 300,
                                wordLimitMax: c.wordLimitMax || 1200,
                                eligibility: c.eligibility || 'Ages 6–16 (All India & Global)',
                                isActive: c.isActive ?? true,
                                laureates: c.laureates || [
                                  { name: '', age: 10, storyTitle: '', badge: 'Golden Quill' },
                                ],
                              });
                              setShowContestModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#142030] shadow-xs"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Edit Contest</span>
                          </button>
                          <button
                            onClick={() => handleDeleteContest(c._id, c.title)}
                            className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200/80 text-xs">
                        <div>
                          <div className="text-gray-400 text-[10px] uppercase font-bold">Theme</div>
                          <div className="font-bold text-[#203047]">{c.theme}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[10px] uppercase font-bold">Deadline</div>
                          <div className="font-bold text-[#203047]">{new Date(c.deadline).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[10px] uppercase font-bold">Word Limit</div>
                          <div className="font-bold text-[#203047]">{c.wordLimitMin} - {c.wordLimitMax} words</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[10px] uppercase font-bold">Prize Pool</div>
                          <div className="font-bold text-[#2F6B57] truncate">{c.prizePool}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Official Writing Prompt</div>
                        <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200/70">
                          {c.prompt}
                        </p>
                      </div>

                      {c.laureates && c.laureates.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase font-bold text-gray-500 mb-2">Featured Laureates Hall of Fame</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {c.laureates.map((l: any, idx: number) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-xs text-[#203047]">{l.name} (Age {l.age})</div>
                                  <div className="text-[11px] text-gray-500 italic truncate">&ldquo;{l.storyTitle}&rdquo;</div>
                                </div>
                                <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                  {l.badge}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUPPORT & CONTACT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#203047]/10 shadow-tactile">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
                  <div>
                    <h2 className="font-serif-story font-bold text-xl text-[#203047]">
                      Editorial Helpdesk &amp; Contact Inquiries
                    </h2>
                    <p className="text-xs text-gray-500">
                      Inquiries from parents, readers, educators, and authors submitted via the public contact portal.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                      {inquiries.filter((i) => i.status === 'new').length} New Unread Messages
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Inquiries List Column */}
                  <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {inquiries.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-xs">
                        No contact inquiries found.
                      </div>
                    ) : (
                      inquiries.map((inq) => {
                        const isSelected = selectedInquiry?._id === inq._id;
                        return (
                          <div
                            key={inq._id}
                            onClick={() => {
                              setSelectedInquiry(inq);
                              setInquiryAdminNotes(inq.adminNotes || '');
                            }}
                            className={`p-4 rounded-xl border transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#203047]/5 border-[#203047] shadow-sm'
                                : 'bg-[#faf7f0]/40 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs text-[#203047]">{inq.name}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  inq.status === 'new'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : inq.status === 'replied'
                                    ? 'bg-blue-100 text-blue-800'
                                    : inq.status === 'resolved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {inq.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium truncate mb-1">
                              {inq.topic} • {inq.email}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {inq.message}
                            </p>
                            <div className="mt-2 text-[10px] text-gray-400">
                              {new Date(inq.createdAt).toLocaleString()}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Inquiry Detail View Column */}
                  <div className="lg:col-span-7 bg-[#faf7f0]/40 rounded-2xl p-6 border border-gray-200">
                    {selectedInquiry ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between pb-3 border-b border-gray-200">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                              Topic: {selectedInquiry.topic}
                            </span>
                            <h3 className="font-serif-story font-bold text-lg text-[#203047] mt-0.5">
                              From: {selectedInquiry.name}
                            </h3>
                            <div className="text-xs text-gray-500">
                              Email:{' '}
                              <a
                                href={`mailto:${selectedInquiry.email}`}
                                className="text-blue-600 font-medium hover:underline"
                              >
                                {selectedInquiry.email}
                              </a>{' '}
                              • Received: {new Date(selectedInquiry.createdAt).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={selectedInquiry.status}
                              onChange={(e) => {
                                handleUpdateInquiryStatus(selectedInquiry._id, e.target.value, inquiryAdminNotes);
                                setSelectedInquiry({ ...selectedInquiry, status: e.target.value });
                              }}
                              className="text-xs font-bold py-1.5 px-3 rounded-xl border border-gray-300 bg-white"
                            >
                              <option value="new">Mark: New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="replied">Replied</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <button
                              onClick={() => handleDeleteInquiry(selectedInquiry._id)}
                              className="text-red-500 hover:text-red-700 p-1.5"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold uppercase text-gray-500 mb-1">Inquiry Message</div>
                          <div className="p-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {selectedInquiry.message}
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                            Internal Admin Resolution Notes
                          </label>
                          <textarea
                            rows={3}
                            value={inquiryAdminNotes}
                            onChange={(e) => setInquiryAdminNotes(e.target.value)}
                            placeholder="Add internal resolution comments, action taken, or response summary..."
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateInquiryStatus(selectedInquiry._id, selectedInquiry.status, inquiryAdminNotes)
                            }
                            className="mt-2 px-4 py-2 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#142030]"
                          >
                            Save Resolution Notes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
                        <Mail className="w-12 h-12 text-gray-300 mb-3" />
                        <h4 className="font-bold text-sm text-gray-600">Select an Inquiry Message</h4>
                        <p className="text-xs text-gray-400 max-w-sm mt-1">
                          Click any visitor message from the left list to review contents and update resolution status.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USERS & RBAC GOVERNANCE */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#203047]/10 shadow-tactile">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                    />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="reader">Young Readers</option>
                    <option value="parent">Parents</option>
                    <option value="author">Authors</option>
                    <option value="educator">Educators</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>

                <div className="text-xs text-gray-500 font-semibold">
                  Showing {users.length} accounts in MongoDB
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-[#203047]/10 shadow-tactile overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[680px]">
                  <thead>
                    <tr className="bg-[#faf7f0] border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">COPPA Status</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users
                      .filter((u) => {
                        const matchSearch =
                          userSearch === '' ||
                          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
                        const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                        return matchSearch && matchRole;
                      })
                      .map((user) => (
                        <tr key={user._id} className="hover:bg-[#faf7f0]/60 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#203047]">{user.name}</div>
                            <div className="text-gray-400 font-mono text-[11px]">{user.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                user.role === 'admin'
                                  ? 'bg-[#203047] text-white'
                                  : user.role === 'author'
                                  ? 'bg-purple-100 text-purple-800'
                                  : user.role === 'parent'
                                  ? 'bg-blue-100 text-blue-800'
                                  : user.role === 'educator'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.isCoppaVerified ? (
                              <button
                                onClick={() => handleToggleCoppa(user)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2F6B57] bg-[#2F6B57]/10 px-2 py-0.5 rounded hover:bg-[#2F6B57]/20"
                                title="Click to toggle COPPA consent"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleCoppa(user)}
                                className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200"
                                title="Click to verify COPPA consent"
                              >
                                Unverified
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {user.isSuspended ? (
                              <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">
                                Suspended
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleUserSuspension(user)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                                  user.isSuspended
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                }`}
                              >
                                {user.isSuspended ? 'Activate' : 'Suspend'}
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Permanently remove ${user.name} from MongoDB?`)) return;
                                  await fetch(`/api/admin/users?id=${user._id}`, { method: 'DELETE' });
                                  showToast(`User ${user.name} deleted`);
                                  loadAllData();
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLISHING CRM LEADS */}
          {activeTab === 'publishing' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#203047]/10 shadow-tactile">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                  <div>
                    <h2 className="font-serif-story font-bold text-xl text-[#203047]">
                      Author Publishing Package Consultation CRM
                    </h2>
                    <p className="text-xs text-gray-500">
                      Manage incoming author inquiries for Starter Sprout, Illustrator Gold, and Master Guild publishing services.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-[#E9B44C]/30 text-[#203047] px-3 py-1.5 rounded-xl">
                    {publishingRequests.length} Inquiries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#faf7f0] border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Author</th>
                        <th className="py-3 px-4">Tier</th>
                        <th className="py-3 px-4">Notes</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {publishingRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400">
                            No publishing requests received yet.
                          </td>
                        </tr>
                      ) : (
                        publishingRequests.map((req) => (
                          <tr key={req._id} className="hover:bg-[#faf7f0]/60 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#203047]">{req.authorName}</div>
                              <div className="text-gray-400 font-mono text-[11px]">{req.authorEmail}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-[#203047] bg-[#E9B44C]/20 px-2.5 py-1 rounded-full text-[11px]">
                                {req.packageTier}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                              {req.notes || 'No special requests'}
                            </td>
                            <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  req.status === 'COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : req.status === 'IN_DISCUSSION'
                                    ? 'bg-blue-100 text-blue-800'
                                    : req.status === 'APPROVED'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <select
                                value={req.status}
                                onChange={(e) => handleUpdatePublishingStatus(req._id, e.target.value)}
                                className="text-xs py-1 px-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_DISCUSSION">In Discussion</option>
                                <option value="APPROVED">Approved</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: MEDIA ASSET LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#203047]/10 shadow-tactile flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-story font-bold text-xl text-[#203047]">
                    Centralized Media Library
                  </h2>
                  <p className="text-xs text-gray-500">
                    Upload and manage book covers, illustrations, avatars, and audio clips stored in `public/uploads/`.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#142030] transition shadow-tactile cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>{uploadingMedia ? 'Uploading...' : 'Upload Media File'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaAssets.map((asset) => (
                  <div
                    key={asset._id}
                    className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm flex flex-col justify-between group"
                  >
                    <div className="relative aspect-square rounded-xl bg-gray-100 overflow-hidden mb-2">
                      {asset.fileType === 'pdf' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-red-500">
                          <FolderOpen className="w-8 h-8" />
                          <span className="text-[10px] font-bold uppercase mt-1">PDF File</span>
                        </div>
                      ) : (
                        <img
                          src={asset.url}
                          alt={asset.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#203047] truncate" title={asset.filename}>
                        {asset.filename}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {(asset.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(asset.url);
                          showToast('Asset URL copied to clipboard!');
                        }}
                        className="text-[11px] text-[#203047] font-semibold hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(asset._id, asset.filename)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: GLOBAL WEBSITE & SEO SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#203047]/10 shadow-tactile max-w-4xl mx-auto">
              <div className="pb-6 mb-6 border-b border-gray-100">
                <h2 className="font-serif-story font-bold text-2xl text-[#203047]">
                  Global Website &amp; SEO Configuration
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Configure brand identity, global announcement bar, maintenance mode, and SEO defaults stored in MongoDB.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Maintenance Mode Toggle */}
                <div className="bg-[#faf7f0] p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#203047]">
                      Platform Maintenance Mode
                    </h4>
                    <p className="text-xs text-gray-500">
                      Temporarily redirects all non-admin visitors to a maintenance notice.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.maintenanceMode}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, maintenanceMode: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#203047]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Brand Site Name
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteName || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Platform Tagline
                    </label>
                    <input
                      type="text"
                      value={siteSettings.tagline || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                      required
                    />
                  </div>
                </div>

                {/* Announcement Bar */}
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase text-amber-900">
                      Global Announcement Banner
                    </h4>
                    <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteSettings.announcementBarActive}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            announcementBarActive: e.target.checked,
                          })
                        }
                      />
                      <span>Active on Website</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={siteSettings.announcementBarText || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, announcementBarText: e.target.value })
                    }
                    placeholder="e.g. 🌟 Young Authors November Arena: Submissions now open!"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none text-[#203047]"
                  />
                </div>

                {/* Child Safety, COPPA & Registration Governance */}
                <div className="p-5 rounded-2xl border border-[#b1f0d6] bg-[#e9f6fd]/60 space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#2d6955]" />
                    <h4 className="text-xs font-bold uppercase text-[#091b31] tracking-wider">
                      Child Safety, COPPA Charter &amp; Registration Governance
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        Welcome Stars for New Readers
                      </label>
                      <input
                        type="number"
                        value={siteSettings.welcomeStarsAmount ?? 100}
                        onChange={(e) =>
                          setSiteSettings({ ...siteSettings, welcomeStarsAmount: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        Default Bedtime Curfew
                      </label>
                      <input
                        type="time"
                        value={siteSettings.defaultBedtimeCurfew || '21:00'}
                        onChange={(e) =>
                          setSiteSettings({ ...siteSettings, defaultBedtimeCurfew: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        Child Charter Protected Badge
                      </label>
                      <input
                        type="text"
                        value={siteSettings.coppaCharterBadgeText || 'COPPA & DPDPA Child Charter Protected'}
                        onChange={(e) =>
                          setSiteSettings({ ...siteSettings, coppaCharterBadgeText: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Permission & Public Feature Controls */}
                <div className="bg-[#FAF7F0] p-5 rounded-2xl border-2 border-[#203047]/20 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2d6955] text-[20px]">admin_panel_settings</span>
                    <h4 className="font-serif-story font-bold text-sm text-[#203047]">
                      Admin Permission &amp; Public Feature Controls
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Control 1: Certificate Generation Permission */}
                    <div className="p-4 rounded-xl bg-white border border-[#203047]/15 flex flex-col justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#091b31] flex items-center gap-1.5">
                            <span>📜</span>
                            <span>Certificate Generation Permission</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              siteSettings.allowCertificateGeneration ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {siteSettings.allowCertificateGeneration ? 'Permission Granted' : 'Locked by Admin'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                          Only generate and print reader diplomas when approved by Admin. When locked, young readers see certificate issuance pending admin review.
                        </p>
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-gray-100 select-none">
                        <input
                          type="checkbox"
                          checked={siteSettings.allowCertificateGeneration ?? false}
                          onChange={(e) =>
                            setSiteSettings({ ...siteSettings, allowCertificateGeneration: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#2d6955] accent-[#2d6955] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#203047]">
                          Allow Certificate Generation &amp; Printing
                        </span>
                      </label>
                    </div>

                    {/* Control 2: Author Publishing Portal Control */}
                    <div className="p-4 rounded-xl bg-white border border-[#203047]/15 flex flex-col justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#091b31] flex items-center gap-1.5">
                            <span>✍️</span>
                            <span>Author Publishing Option</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              siteSettings.enablePublishingPortal ?? true ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {siteSettings.enablePublishingPortal ?? true ? 'Active in Navbar' : 'Hidden by Admin'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                          Controls the &ldquo;Publish&rdquo; link in top navigation and author package inquiry portal. Turn off to pause incoming publishing requests.
                        </p>
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-gray-100 select-none">
                        <input
                          type="checkbox"
                          checked={siteSettings.enablePublishingPortal ?? true}
                          onChange={(e) =>
                            setSiteSettings({ ...siteSettings, enablePublishingPortal: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#203047] accent-[#203047] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#203047]">
                          Enable Publishing Option &amp; Portal
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Contact & Socials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Editorial Contact Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, contactEmail: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={siteSettings.contactPhone || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, contactPhone: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Twitter / X URL
                    </label>
                    <input
                      type="url"
                      value={siteSettings.socialTwitter || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, socialTwitter: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={siteSettings.socialInstagram || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, socialInstagram: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Footer Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={siteSettings.footerCopyrightText || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, footerCopyrightText: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#203047] hover:bg-[#142030] text-white text-xs font-bold transition shadow-tactile"
                  >
                    Save Platform Settings to MongoDB
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: CREATE / EDIT BOOK */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-3xl w-full my-auto sm:my-8 shadow-tactile-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
              <h3 className="font-serif-story font-bold text-xl text-[#203047]">
                {editingBook ? `Edit Book: ${editingBook.title}` : 'Create New Illustrated Book'}
              </h3>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Book Title (English) *
                  </label>
                  <input
                    type="text"
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Book Title (Hindi / हिंदी)
                  </label>
                  <input
                    type="text"
                    value={bookFormData.titleHindi}
                    onChange={(e) => setBookFormData({ ...bookFormData, titleHindi: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#203047]"
                  />
                </div>
              </div>

              {/* Author & Cover Image Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    value={bookFormData.authorName}
                    onChange={(e) => setBookFormData({ ...bookFormData, authorName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Reading Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={bookFormData.readingTimeMinutes}
                    onChange={(e) =>
                      setBookFormData({ ...bookFormData, readingTimeMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              {/* Cover Image Upload & Storage Link Conversion */}
              <div className="p-4 rounded-2xl bg-[#faf7f0] border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#203047]">
                      Cover Image (File Upload &rarr; Storage Link)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Upload an image file from your device (converts to storage link in `/uploads/media/`) or select from curated literary presets.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#142030] transition shadow-xs cursor-pointer shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{uploadingCover ? 'Storing File...' : 'Upload Cover File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleUploadCoverFile}
                      disabled={uploadingCover}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {bookFormData.coverUrl && (
                    <img
                      src={bookFormData.coverUrl}
                      alt="Cover Preview"
                      className="w-14 h-18 object-cover rounded-xl border border-gray-300 shadow-sm shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="https://... or /uploads/media/..."
                      value={bookFormData.coverUrl}
                      onChange={(e) => setBookFormData({ ...bookFormData, coverUrl: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white font-mono"
                    />
                    <div className="flex items-center gap-2 text-[10px]">
                      {bookFormData.coverUrl.startsWith('/uploads/') ? (
                        <span className="text-[#2d6955] font-bold bg-[#b1f0d6]/60 px-2 py-0.5 rounded-full">
                          ✓ Stored in Persistent Storage Link
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          External CDN / Unsplash URL Link
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Unsplash Curated Cover Presets */}
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                    Or Pick Curated Literary Cover:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {UNSPLASH_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBookFormData({ ...bookFormData, coverUrl: preset.url });
                          showToast(`Applied preset cover: ${preset.name}`);
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition font-medium ${
                          bookFormData.coverUrl === preset.url
                            ? 'bg-[#203047] text-white border-[#203047]'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Automated Text-to-Speech Narration Engine (Zero Upload Needed) */}
              <div className="p-4 rounded-2xl bg-[#eef7ff] border border-[#cbe4fa] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        ⚡
                      </span>
                      <label className="text-xs font-bold uppercase text-[#091b31] flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Automated AI Text-to-Audio Engine (Zero Upload Required)</span>
                      </label>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      All written chapter text and blurbs are <strong className="text-indigo-900">automatically converted into natural spoken audio</strong> in real-time. You do not need to record or upload any audio files!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestAdminSpeech}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs shrink-0 ${
                      adminSpeechPlaying
                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{adminSpeechPlaying ? 'Stop Speaking' : '🔊 Test Auto-Narration Aloud'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-100">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                      Narrator Voice Persona
                    </label>
                    <select
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                      defaultValue="barnaby-warm"
                    >
                      <option value="barnaby-warm">🦉 Professor Barnaby (Warm Bedtime Storyteller)</option>
                      <option value="luna-calm">🌙 Luna the Owl (Calm &amp; Soothing Voice)</option>
                      <option value="leo-energetic">🚀 Leo the Explorer (Adventurous &amp; Lively)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                      Automatic Narration Pace
                    </label>
                    <select
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                      defaultValue="1.0"
                    >
                      <option value="0.85">0.85x — Bedtime Serene &amp; Calm</option>
                      <option value="1.0">1.0x — Natural Balanced Storytelling</option>
                      <option value="1.15">1.15x — Energetic Adventure Quest</option>
                    </select>
                  </div>
                </div>

                {/* Optional Studio Track Link (Collapsed/Advanced) */}
                <details className="text-[11px] text-gray-500 pt-1 cursor-pointer">
                  <summary className="font-semibold text-gray-600 hover:text-[#203047]">
                    Optional: Have a pre-recorded studio audio file? Click to link/upload
                  </summary>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Optional pre-recorded audio link (e.g. /uploads/media/story.mp3)"
                      value={bookFormData.audioPreviewUrl || ''}
                      onChange={(e) =>
                        setBookFormData({ ...bookFormData, audioPreviewUrl: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-300 transition cursor-pointer shrink-0">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{uploadingAudio ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="sr-only"
                        onChange={handleUploadAudioFile}
                        disabled={uploadingAudio}
                      />
                    </label>
                  </div>
                </details>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Synopsis / Blurb *
                </label>
                <textarea
                  rows={3}
                  value={bookFormData.synopsis}
                  onChange={(e) => setBookFormData({ ...bookFormData, synopsis: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Age Tier</label>
                  <select
                    value={bookFormData.ageBracket}
                    onChange={(e) => setBookFormData({ ...bookFormData, ageBracket: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="3-5">Ages 3-5 (Early Learners)</option>
                    <option value="6-8">Ages 6-8 (Emerging Explorers)</option>
                    <option value="9-12">Ages 9-12 (Independent Adventurers)</option>
                    <option value="13+">Ages 13+ (Young Adults)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Language Format</label>
                  <select
                    value={bookFormData.language}
                    onChange={(e) => setBookFormData({ ...bookFormData, language: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="bilingual">Bilingual (English + हिंदी side-by-side)</option>
                    <option value="en">English Exclusive</option>
                    <option value="hi">Hindi Exclusive (हिंदी)</option>
                  </select>
                </div>
              </div>

              {/* COMPANION READING QUIZ CREATION (CHECKBOX & BUILDER) */}
              <div className="p-4 rounded-2xl bg-[#f0fbf6] border border-[#b1f0d6] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookFormData.hasCompanionQuiz}
                      onChange={(e) =>
                        setBookFormData({
                          ...bookFormData,
                          hasCompanionQuiz: e.target.checked,
                          companionQuiz: {
                            ...bookFormData.companionQuiz,
                            title:
                              bookFormData.companionQuiz.title ||
                              `${bookFormData.title || 'Book'} Companion Reading Quiz`,
                          },
                        })
                      }
                      className="w-4 h-4 text-[#2d6955] rounded mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#002117] flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-[#2d6955]" />
                        <span>Include Companion Reading Quiz for this Book</span>
                      </span>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        When enabled, young readers can take a fun comprehension quiz after finishing the chapters to earn spark stars and reading badges.
                      </p>
                    </div>
                  </label>

                </div>

                {bookFormData.hasCompanionQuiz && (
                  <div className="space-y-4 pt-3 border-t border-[#b1f0d6]/60">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                          Quiz Title
                        </label>
                        <input
                          type="text"
                          value={bookFormData.companionQuiz.title}
                          onChange={(e) =>
                            setBookFormData({
                              ...bookFormData,
                              companionQuiz: { ...bookFormData.companionQuiz, title: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                          Reward Stars
                        </label>
                        <input
                          type="number"
                          value={bookFormData.companionQuiz.rewardStars}
                          onChange={(e) =>
                            setBookFormData({
                              ...bookFormData,
                              companionQuiz: {
                                ...bookFormData.companionQuiz,
                                rewardStars: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Question Builder */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-[#002117]">
                          Questions ({bookFormData.companionQuiz.questions.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = {
                              id: `q-${Date.now()}`,
                              questionEn: '',
                              questionHi: '',
                              optionsEn: ['', '', '', ''],
                              optionsHi: ['', '', '', ''],
                              correctIndex: 0,
                              explanation: '',
                            };
                            setBookFormData({
                              ...bookFormData,
                              companionQuiz: {
                                ...bookFormData.companionQuiz,
                                questions: [...bookFormData.companionQuiz.questions, newQ],
                              },
                            });
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6955] hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Question</span>
                        </button>
                      </div>

                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {bookFormData.companionQuiz.questions.map((q, qIdx) => (
                          <div
                            key={q.id || qIdx}
                            className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2.5 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#203047]">
                                Question {qIdx + 1}
                              </span>
                              {bookFormData.companionQuiz.questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = bookFormData.companionQuiz.questions.filter(
                                      (_, i) => i !== qIdx
                                    );
                                    setBookFormData({
                                      ...bookFormData,
                                      companionQuiz: {
                                        ...bookFormData.companionQuiz,
                                        questions: updated,
                                      },
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Question in English *"
                                value={q.questionEn}
                                onChange={(e) => {
                                  const updated = [...bookFormData.companionQuiz.questions];
                                  updated[qIdx].questionEn = e.target.value;
                                  setBookFormData({
                                    ...bookFormData,
                                    companionQuiz: {
                                      ...bookFormData.companionQuiz,
                                      questions: updated,
                                    },
                                  });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200"
                              />
                              <input
                                type="text"
                                placeholder="Question in Hindi (वैकल्पिक)"
                                value={q.questionHi || ''}
                                onChange={(e) => {
                                  const updated = [...bookFormData.companionQuiz.questions];
                                  updated[qIdx].questionHi = e.target.value;
                                  setBookFormData({
                                    ...bookFormData,
                                    companionQuiz: {
                                      ...bookFormData.companionQuiz,
                                      questions: updated,
                                    },
                                  });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200"
                              />
                            </div>

                            {/* 4 Options Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[0, 1, 2, 3].map((optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${qIdx}`}
                                    checked={q.correctIndex === optIdx}
                                    onChange={() => {
                                      const updated = [...bookFormData.companionQuiz.questions];
                                      updated[qIdx].correctIndex = optIdx;
                                      setBookFormData({
                                        ...bookFormData,
                                        companionQuiz: {
                                          ...bookFormData.companionQuiz,
                                          questions: updated,
                                        },
                                      });
                                    }}
                                    title={`Mark option ${String.fromCharCode(65 + optIdx)} as correct answer`}
                                    className="w-3.5 h-3.5 text-[#2d6955]"
                                  />
                                  <input
                                    type="text"
                                    placeholder={`Option ${String.fromCharCode(65 + optIdx)} (English)`}
                                    value={q.optionsEn[optIdx] || ''}
                                    onChange={(e) => {
                                      const updated = [...bookFormData.companionQuiz.questions];
                                      if (!updated[qIdx].optionsEn) updated[qIdx].optionsEn = ['', '', '', ''];
                                      updated[qIdx].optionsEn[optIdx] = e.target.value;
                                      setBookFormData({
                                        ...bookFormData,
                                        companionQuiz: {
                                          ...bookFormData.companionQuiz,
                                          questions: updated,
                                        },
                                      });
                                    }}
                                    className={`w-full px-2.5 py-1 text-xs rounded-lg border ${
                                      q.correctIndex === optIdx
                                        ? 'border-[#2d6955] bg-[#f0fbf6]'
                                        : 'border-gray-200'
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>

                            <input
                              type="text"
                              placeholder="Explanation shown after answering (Optional)"
                              value={q.explanation || ''}
                              onChange={(e) => {
                                const updated = [...bookFormData.companionQuiz.questions];
                                updated[qIdx].explanation = e.target.value;
                                setBookFormData({
                                  ...bookFormData,
                                  companionQuiz: {
                                    ...bookFormData.companionQuiz,
                                    questions: updated,
                                  },
                                });
                              }}
                              className="w-full px-3 py-1 text-[11px] rounded-lg border border-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Chapter Writer */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#203047]">
                      Chapters &amp; Bilingual Content ({bookFormData.chapters.length})
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Write chapters with side-by-side English and Hindi narrative text.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextNum = bookFormData.chapters.length + 1;
                      setBookFormData({
                        ...bookFormData,
                        chapters: [
                          ...bookFormData.chapters,
                          {
                            chapterNumber: nextNum,
                            title: `Chapter ${nextNum}`,
                            titleHindi: `अध्याय ${nextNum}`,
                            contentEn: '',
                            contentHi: '',
                            illustrationUrl: '',
                          },
                        ],
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#203047] text-white text-[11px] font-bold hover:bg-[#142030] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Chapter</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {bookFormData.chapters.map((chap, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#faf7f0] border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#203047]">
                          Chapter {idx + 1}
                        </span>
                        {bookFormData.chapters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = bookFormData.chapters.filter((_, i) => i !== idx);
                              setBookFormData({ ...bookFormData, chapters: updated });
                            }}
                            className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                            Chapter Title (English)
                          </label>
                          <input
                            type="text"
                            value={chap.title}
                            onChange={(e) => {
                              const updated = [...bookFormData.chapters];
                              updated[idx].title = e.target.value;
                              setBookFormData({ ...bookFormData, chapters: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                            Chapter Title (Hindi / हिंदी)
                          </label>
                          <input
                            type="text"
                            value={chap.titleHindi || ''}
                            onChange={(e) => {
                              const updated = [...bookFormData.chapters];
                              updated[idx].titleHindi = e.target.value;
                              setBookFormData({ ...bookFormData, chapters: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                          English Narrative Text
                        </label>
                        <textarea
                          rows={3}
                          value={chap.contentEn}
                          onChange={(e) => {
                            const updated = [...bookFormData.chapters];
                            updated[idx].contentEn = e.target.value;
                            setBookFormData({ ...bookFormData, chapters: updated });
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                          Hindi Translation (हिंदी अनुवाद)
                        </label>
                        <textarea
                          rows={3}
                          value={chap.contentHi || ''}
                          onChange={(e) => {
                            const updated = [...bookFormData.chapters];
                            updated[idx].contentHi = e.target.value;
                            setBookFormData({ ...bookFormData, chapters: updated });
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2 text-xs font-bold text-[#203047] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookFormData.featured}
                    onChange={(e) => setBookFormData({ ...bookFormData, featured: e.target.checked })}
                  />
                  <span>Feature on Home Page Carousel</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2F6B57] text-white text-xs font-bold hover:bg-[#214f3f] transition shadow-tactile"
                  >
                    Save Book to MongoDB
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE WORKSHOP */}
      {showWorkshopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full my-auto sm:my-8 shadow-tactile-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-serif-story font-bold text-lg text-[#203047]">
                Schedule Live Masterclass
              </h3>
              <button
                onClick={() => setShowWorkshopModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWorkshop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Workshop Title *
                </label>
                <input
                  type="text"
                  value={workshopForm.title}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Mentor Name *
                  </label>
                  <input
                    type="text"
                    value={workshopForm.mentorName}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, mentorName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    value={workshopForm.maxCapacity}
                    onChange={(e) =>
                      setWorkshopForm({ ...workshopForm, maxCapacity: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Scheduled Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={workshopForm.scheduledAt}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, scheduledAt: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Meeting Link (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  value={workshopForm.meetingUrl}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, meetingUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWorkshopModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2F6B57] text-white text-xs font-bold hover:bg-[#235343] transition shadow-tactile"
                >
                  Publish Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT QUIZ */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-2xl w-full my-auto sm:my-8 shadow-tactile-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-serif-story font-bold text-xl text-[#203047]">
                {editingQuiz ? `Edit Quiz: ${editingQuiz.title}` : 'Create New Interactive Quiz'}
              </h3>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    required
                    placeholder="e.g. Tara's Monsoon Compass Quiz"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Reward Stars
                    </label>
                    <input
                      type="number"
                      value={quizForm.rewardStars}
                      onChange={(e) => setQuizForm({ ...quizForm, rewardStars: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Age Bracket
                    </label>
                    <select
                      value={quizForm.ageBracket || '9-12'}
                      onChange={(e) => setQuizForm({ ...quizForm, ageBracket: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                    >
                      <option value="6-8">6-8 yrs</option>
                      <option value="9-12">9-12 yrs</option>
                      <option value="13+">13+ yrs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Quiz Description
                </label>
                <textarea
                  rows={2}
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  placeholder="Comprehension focus or story background..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-[#203047]">
                    Quiz Questions ({quizForm.questions?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setQuizForm({
                        ...quizForm,
                        questions: [
                          ...quizForm.questions,
                          {
                            questionText: '',
                            questionTextHindi: '',
                            options: ['', '', '', ''],
                            correctAnswerIndex: 0,
                            explanation: '',
                          },
                        ],
                      })
                    }
                    className="text-xs text-[#2F6B57] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {quizForm.questions?.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#203047]">Question {qIdx + 1}</span>
                      {quizForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = quizForm.questions.filter((_: any, i: number) => i !== qIdx);
                            setQuizForm({ ...quizForm, questions: updated });
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Question text (English) *"
                      value={q.questionText}
                      onChange={(e) => {
                        const updated = [...quizForm.questions];
                        updated[qIdx].questionText = e.target.value;
                        setQuizForm({ ...quizForm, questions: updated });
                      }}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />

                    <input
                      type="text"
                      placeholder="Question text (Hindi / हिंदी)"
                      value={q.questionTextHindi || ''}
                      onChange={(e) => {
                        const updated = [...quizForm.questions];
                        updated[qIdx].questionTextHindi = e.target.value;
                        setQuizForm({ ...quizForm, questions: updated });
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />

                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                        Options (select radio for correct answer):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-gray-200">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correctAnswerIndex === optIdx}
                              onChange={() => {
                                const updated = [...quizForm.questions];
                                updated[qIdx].correctAnswerIndex = optIdx;
                                setQuizForm({ ...quizForm, questions: updated });
                              }}
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              value={opt}
                              placeholder={`Option ${optIdx + 1}`}
                              onChange={(e) => {
                                const updated = [...quizForm.questions];
                                updated[qIdx].options[optIdx] = e.target.value;
                                setQuizForm({ ...quizForm, questions: updated });
                              }}
                              className="w-full text-xs border-0 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2F6B57] text-white text-xs font-bold hover:bg-[#235343] transition shadow-tactile"
                >
                  Save Quiz to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT CONTEST */}
      {showContestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-3xl w-full my-auto sm:my-8 shadow-tactile-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-serif-story font-bold text-xl text-[#203047]">
                {editingContest ? `Edit Championship: ${editingContest.title}` : 'Launch New Storyteller Cup'}
              </h3>
              <button
                onClick={() => setShowContestModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Contest Title (English) *
                  </label>
                  <input
                    type="text"
                    value={contestForm.title}
                    onChange={(e) => setContestForm({ ...contestForm, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Edition
                  </label>
                  <input
                    type="text"
                    value={contestForm.edition}
                    onChange={(e) => setContestForm({ ...contestForm, edition: e.target.value })}
                    placeholder="2025"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Contest Title (Hindi / हिन्दी)
                </label>
                <input
                  type="text"
                  value={contestForm.titleHindi || ''}
                  onChange={(e) => setContestForm({ ...contestForm, titleHindi: e.target.value })}
                  placeholder="राष्ट्रीय बाल लेखक प्रतियोगिता"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Official Theme *
                  </label>
                  <input
                    type="text"
                    value={contestForm.theme}
                    onChange={(e) => setContestForm({ ...contestForm, theme: e.target.value })}
                    required
                    placeholder="Whispers of the Banyan Tree"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Submission Deadline *
                  </label>
                  <input
                    type="date"
                    value={contestForm.deadline}
                    onChange={(e) => setContestForm({ ...contestForm, deadline: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Creative Writing Prompt *
                </label>
                <textarea
                  rows={2}
                  value={contestForm.prompt}
                  onChange={(e) => setContestForm({ ...contestForm, prompt: e.target.value })}
                  required
                  placeholder="Detailed inspirational prompt for young writers..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    value={contestForm.prizePool}
                    onChange={(e) => setContestForm({ ...contestForm, prizePool: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Min Word Count
                  </label>
                  <input
                    type="number"
                    value={contestForm.wordLimitMin}
                    onChange={(e) => setContestForm({ ...contestForm, wordLimitMin: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Max Word Count
                  </label>
                  <input
                    type="number"
                    value={contestForm.wordLimitMax}
                    onChange={(e) => setContestForm({ ...contestForm, wordLimitMax: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="contest_active"
                  checked={contestForm.isActive}
                  onChange={(e) => setContestForm({ ...contestForm, isActive: e.target.checked })}
                  className="rounded text-[#2F6B57]"
                />
                <label htmlFor="contest_active" className="text-xs font-bold text-[#203047] cursor-pointer">
                  Set as Active Live Contest on Youth Arena &amp; Activities Pages
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowContestModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2F6B57] text-white text-xs font-bold hover:bg-[#235343] transition shadow-tactile"
                >
                  Publish Championship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
