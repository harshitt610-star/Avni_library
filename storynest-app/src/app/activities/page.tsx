'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

interface ActiveContestInfo {
  _id?: string;
  title?: string;
  titleHindi?: string;
  description?: string;
  theme?: string;
  themeHindi?: string;
  prompt?: string;
  promptHindi?: string;
  deadline?: string;
  prizePool?: string;
  wordLimitMin?: number;
  wordLimitMax?: number;
}

interface DynamicQuizOption {
  en: string;
  hi?: string;
}

interface DynamicQuizQuestion {
  id: string;
  questionEn: string;
  questionHi?: string;
  options: DynamicQuizOption[];
  correctIndex: number;
  explanationEn?: string;
}

interface DynamicQuizRecord {
  _id: string;
  title: string;
  bookTitle?: string;
  description?: string;
  rewardStars?: number;
  bookId?: {
    _id?: string;
    title?: string;
    titleHindi?: string;
    authorName?: string;
    coverUrl?: string;
    genre?: string;
    ageBracket?: string;
    slug?: string;
    readingTimeMinutes?: number;
  };
  questions?: Array<{
    id: string;
    questionEn: string;
    questionHi?: string;
    optionsEn?: string[];
    optionsHi?: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}

export default function YouthArenaPage() {
  const { user, requireAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'cup' | 'quiz'>('cup');
  const [editorLang, setEditorLang] = useState<'en' | 'hi'>('en');

  // Manuscript Editor State
  const [manuscriptTitle, setManuscriptTitle] = useState('The Night the Banyan Spoke to the Stars');
  const [storyBody, setStoryBody] = useState(
    `Under the ancient Banyan tree in the quiet courtyard, Tara set up her brass telescope. The leaves whispered in the gentle desert wind, sounding almost like syllables of a language lost hundreds of years ago.\n\n"Dadi said trees remember the dreams of everyone who slept beneath them," she murmured, adjusting the brass focus wheel.\n\nAbove her, the constellations blinked into brilliance: Rohini, Krittika, and the Great Bear. As her eye met the cool glass lens, an amber flash danced across the sky. But it was not a shooting star. It paused, tilted gently, and drifted down toward the highest branch of the Banyan, humming a warm celestial tune...`
  );
  const [autoSavedTime, setAutoSavedTime] = useState('Auto-saved just now');
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingEntry, setSubmittingEntry] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [draftToast, setDraftToast] = useState(false);

  // Companion Quiz State
  const [quizzesList, setQuizzesList] = useState<DynamicQuizRecord[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<DynamicQuizRecord | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0); // Starts at Question 1
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [xpScore, setXpScore] = useState(100);
  const [studentName, setStudentName] = useState('Aarav Sharma');
  const [isEditingCertName, setIsEditingCertName] = useState(false);
  const [allowCertificateGeneration, setAllowCertificateGeneration] = useState(false);
  const [lastAttemptId, setLastAttemptId] = useState('');
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [activeContest, setActiveContest] = useState<ActiveContestInfo | null>(null);

  useEffect(() => {
    // 1. Fetch active contest
    fetch('/api/admin/contests?active=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.contest) {
          setActiveContest(data.contest);
        }
      })
      .catch(() => { });

    // 2. Fetch global settings for Admin Certificate Permission
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.allowCertificateGeneration !== undefined) {
          setAllowCertificateGeneration(data.allowCertificateGeneration);
        }
      })
      .catch(() => { });

    // 3. Fetch dynamic quizzes from database
    fetch('/api/quizzes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.quizzes) && data.quizzes.length > 0) {
          setQuizzesList(data.quizzes);
          setSelectedQuiz(data.quizzes[0]);
        }
      })
      .catch(() => { });

    // 4. Fetch child profile name if authenticated
    fetch('/api/parent/children')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.children && data.children.length > 0) {
          setStudentName(data.children[0].displayName || 'Aarav Sharma');
        }
      })
      .catch(() => { });
  }, []);

  const wordCount = storyBody.trim() ? storyBody.trim().split(/\s+/).length : 0;

  // Handle Save Draft
  const handleSaveDraft = () => {
    setSavingDraft(true);
    localStorage.setItem(
      'storynest_contest_draft',
      JSON.stringify({ title: manuscriptTitle, body: storyBody, time: new Date().toLocaleTimeString() })
    );
    setTimeout(() => {
      setSavingDraft(false);
      setAutoSavedTime('Auto-saved just now • Safe drafts stored locally');
      setDraftToast(true);
      setTimeout(() => setDraftToast(false), 3000);
    }, 400);
  };

  // Handle Submit Entry
  const handleSubmitEntry = async () => {
    if (!user) {
      requireAuth('/activities', 'Sign in as a young reader to submit your story to the National Young Writers Cup!');
      return;
    }
    if (!manuscriptTitle.trim() || !storyBody.trim()) {
      alert('Please provide a story title and text before submitting.');
      return;
    }
    setSubmittingEntry(true);
    try {
      const res = await fetch('/api/contests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: manuscriptTitle,
          authorName: 'Aarav Sharma',
          age: 10,
          parentEmail: 'parent@storynest.com',
          storyContent: storyBody,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
        });
      } else {
        alert(data.error || 'Submission failed. Please try again.');
      }
    } catch {
      alert('Connection error submitting your entry.');
    } finally {
      setSubmittingEntry(false);
    }
  };

  // Download PDF / Guide
  const handleDownloadContestGuide = () => {
    const guideMarkdown = `# National Young Storyteller Cup 2025
## Official Contest Guide & Rules (राष्ट्रीय बाल लेखक प्रतियोगिता २०२५)

**Eligibility**: Ages 6–14 (Juniors: 6–9 yrs | Seniors: 10–14 yrs)  
**Deadline**: March 31, 2025 (11:59 PM IST)  
**Word Limit**: 500 – 1,200 words  
**Language**: English, Hindi (हिन्दी), or Dual Bilingual  

### 2025 Official Themes
1. **Whispers of the Banyan Tree (बरगद की फुसफुसाहट)**: Explore ancestral memory, biodiversity, and generational lore.
2. **The Girl Who Mapped the Monsoon (मानसून का नक्शा)**: Climate discovery and traditional water conservation.
3. **The Celestial Telescope (नक्षत्र दूरबीन)**: Astronomy, mythology, and scientific wonder.

### Grand Prizes
- **Gold Quill**: Hardbound physical book publication on StoryNest, ₹25,000 scholarship, New Delhi World Book Fair delegate pass.
- **Silver Owl**: ₹15,000 literary grant, featured StoryNest library listing, school trophy.
- **Folkloric Voice**: ₹10,000 grant and animated audio adaptation.

StoryNest Child-Safe Verified (COPPA & GDPR-K compliant).`;

    const blob = new Blob([guideMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'National_Young_Storyteller_Cup_2025_Guide.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const defaultQuestions: DynamicQuizQuestion[] = [
    {
      id: 'q1',
      questionEn: 'What celestial object inspires Tara on the courtyard rooftop?',
      questionHi: 'आंगन की छत पर तारा को कौन सा खगोलीय पिंड प्रेरित करता है?',
      options: [
        { en: 'A speeding meteor shower', hi: 'एक तेज उल्कापात' },
        { en: 'The ancient Rohini constellation alignment', hi: 'प्राचीन रोहिणी नक्षत्र का संरेखण' },
        { en: 'A passenger airplane flying south', hi: 'दक्षिण की ओर उड़ता हुआ यात्री विमान' },
        { en: 'A flickering streetlight in the market', hi: 'बाजार में टिमटिमाती स्ट्रीटलाइट' },
      ],
      correctIndex: 1,
      explanationEn: 'Tara watches the Rohini constellation align as noted in her Dadi’s heirloom sky diary.',
    },
    {
      id: 'q2',
      questionEn: 'Why does Tara take her brass telescope to the rooftop at midnight?',
      questionHi: 'तारा आधी रात को अपने पीतल के दूरबीन को छत पर क्यों ले जाती है?',
      options: [
        { en: 'She was looking for her escaped pet parrot Mithoo.', hi: 'वह अपने खोए हुए तोते मिट्ठू को ढूँढ रही थी।' },
        {
          en: 'To verify the ancient constellation map her Dadi drew in the diary.',
          hi: 'दादी द्वारा डायरी में बनाए गए प्राचीन नक्षत्र मानचित्र की पुष्टि करने के लिए।',
        },
        { en: 'She wanted to see the city festival fireworks from above.', hi: 'वह शहर के उत्सव की आतिशबाजी देखना चाहती थी।' },
        { en: 'Because school homework required recording the sunrise.', hi: 'क्योंकि स्कूल के गृहकार्य में सूर्योदय का रिकॉर्ड बनाना था।' },
      ],
      correctIndex: 1,
      explanationEn:
        'Page 14 explains that Dadi hand-wove the brass telescope’s leather sleeve and noted how Rohini constellation aligns each spring equinox.',
    },
    {
      id: 'q3',
      questionEn: 'What is the significance of the word "Nakshatra" in the story?',
      questionHi: 'कहानी में "नक्षत्र" शब्द का क्या महत्व है?',
      options: [
        { en: 'It is a special Rajasthani recipe for winter tea.', hi: 'यह सर्दियों की चाय की एक खास राजस्थानी रेसिपी है।' },
        {
          en: 'A lunar mansion or constellation in traditional Indian astronomy.',
          hi: 'पारंपरिक भारतीय खगोल विज्ञान में एक चंद्र नक्षत्र या तारा मंडल।',
        },
        { en: 'A type of brass telescope lens imported from Jaipur.', hi: 'जयपुर से आयातित एक प्रकार का पीतल का दूरबीन लेंस।' },
        { en: 'A secret childhood nickname used by Tara’s Dadi.', hi: 'तारा की दादी द्वारा इस्तेमाल किया जाने वाला एक गुप्त उपनाम।' },
      ],
      correctIndex: 1,
      explanationEn: 'Tara maps 27 Nakshatras through her grandmother’s sky diary across the Rajasthan night sky.',
    },
    {
      id: 'q4',
      questionEn: 'How does Tara bridge traditional folklore with modern science?',
      questionHi: 'तारा पारंपरिक लोककथाओं को आधुनिक विज्ञान के साथ कैसे जोड़ती है?',
      options: [
        { en: 'By discarding old stories and buying only modern charts.', hi: 'पुरानी कहानियों को त्यागकर केवल आधुनिक चार्ट खरीदकर।' },
        {
          en: 'By mapping constellation folklore using her precision telescope lenses.',
          hi: 'अपने सटीक दूरबीन लेंस का उपयोग करके पारंपरिक नक्षत्रों का वैज्ञानिक मानचित्र बनाकर।',
        },
        { en: 'By ignoring astronomy completely to focus on painting.', hi: 'चित्रकला पर ध्यान केंद्रित करने के लिए खगोल विज्ञान को नजरअंदाज करके।' },
        { en: 'By only reading stories during daylight hours.', hi: 'केवल दिन के समय कहानियां पढ़कर।' },
      ],
      correctIndex: 1,
      explanationEn: 'Tara honors her grandmother’s indigenous celestial wisdom while recording empirical observational data.',
    },
  ];

  const quizQuestions: DynamicQuizQuestion[] =
    selectedQuiz && selectedQuiz.questions && selectedQuiz.questions.length > 0
      ? selectedQuiz.questions.map((q) => ({
        id: q.id,
        questionEn: q.questionEn,
        questionHi: q.questionHi,
        options: (q.optionsEn || []).map((enOpt, idx) => ({
          en: enOpt,
          hi: q.optionsHi?.[idx] || '',
        })),
        correctIndex: q.correctIndex,
        explanationEn: q.explanation || 'Curiosity and careful reading guide the way!',
      }))
      : defaultQuestions;

  const currentQ = quizQuestions[currentQIndex] || defaultQuestions[0];

  const handleSelectQuizOption = (idx: number) => {
    if (!user) {
      requireAuth('/activities', 'Sign in as a young reader to take quizzes and earn Spark Stars!');
      return;
    }
    setSelectedOptionIdx(idx);
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
    setFeedbackVisible(true);
    if (idx === currentQ.correctIndex) {
      setXpScore((prev) => prev + 50);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleNextQuiz = () => {
    if (currentQIndex < quizQuestions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = quizQuestions[nextIdx];
      const existing = userAnswers[nextQ?.id];
      setSelectedOptionIdx(existing !== undefined ? existing : null);
      setFeedbackVisible(existing !== undefined);
    } else {
      const finalAnswers = { ...userAnswers, [currentQ.id]: selectedOptionIdx ?? 0 };
      setCertificateModalOpen(true);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });

      fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: selectedQuiz?._id || 'tara-whispering-stars',
          answers: finalAnswers,
          userName: studentName || 'Aarav Sharma',
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.attemptId) {
            setLastAttemptId(resData.attemptId);
          }
        })
        .catch(() => { });
    }
  };

  const handlePrevQuiz = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      const prevQ = quizQuestions[prevIdx];
      const existing = userAnswers[prevQ?.id];
      setSelectedOptionIdx(existing !== undefined ? existing : null);
      setFeedbackVisible(existing !== undefined);
    }
  };

  const dynamicCertUrl = `/certificate?name=${encodeURIComponent(studentName)}&book=${encodeURIComponent(
    selectedQuiz?.bookTitle || selectedQuiz?.bookId?.title || 'Tara and the Whispering Stars'
  )}&quiz=${encodeURIComponent(selectedQuiz?.title || 'Junior Astronomer & Bilingual Laureate')}&author=${encodeURIComponent(
    selectedQuiz?.bookId?.authorName || 'Dr. Meera Sharma'
  )}&stars=${selectedQuiz?.rewardStars || 30}&id=${lastAttemptId || ''}`;

  return (
    <div className="bg-[#f4faff] font-sans-ui text-[#111d23] antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="w-full pt-20 bg-[#f4faff] flex-1">
        <div className="flex flex-col w-full">
        {/* Dynamic Atmospheric Header Layer */}
        <section className="relative w-full bg-[#e9f6fd] px-4 sm:px-8 lg:px-10 py-10 overflow-hidden border-b border-[#ddeaf2]">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#b1f0d6]/30 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full bg-[#ffdea7]/20 blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto flex flex-col gap-6">
            {/* Breadcrumb & Mode Tag */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs text-[#44474d]">
                <Link href="/" className="hover:text-[#091b31]">Home</Link>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <Link href="/reader" className="hover:text-[#091b31]">Youth Arena</Link>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="text-[#091b31] font-semibold">Arena &amp; Educational Hub</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-xs border border-[#ddeaf2]">
                <span className="material-symbols-outlined text-[#2d6955] text-[18px]">verified</span>
                <span className="text-[11px] text-[#2d6955] font-bold">Child-Safe Verified Space (COPPA &amp; GDPR-K)</span>
              </div>
            </div>

            {/* Hero Header & High Impact Tab Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl flex flex-col gap-1.5">
                <div className="inline-flex items-center gap-2 text-[#2d6955] text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                  <span>Literary Arena &amp; Learning Hub</span>
                </div>
                <h1 className="font-serif-story text-3xl sm:text-4xl lg:text-5xl font-bold text-[#091b31] tracking-tight">
                  Ignite the Pen, Spark the Mind
                </h1>
                <p className="text-sm sm:text-base text-[#44474d] max-w-2xl mt-1 leading-relaxed">
                  Where young Indian storytellers compete on national stages and young readers journey deep into bilingual literature through interactive challenges.
                </p>
              </div>

              {/* High-Tactile Switcher */}
              <div className="inline-flex p-1.5 bg-[#ddeaf2] rounded-xl shadow-inner gap-1 self-start lg:self-auto border border-[#cfdce4]">
                <button
                  onClick={() => setActiveTab('cup')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${activeTab === 'cup'
                      ? 'bg-[#203047] text-white shadow-sm'
                      : 'text-[#44474d] hover:text-[#091b31]'
                    }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                  <span>National Storyteller Cup</span>
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${activeTab === 'quiz'
                      ? 'bg-[#203047] text-white shadow-sm'
                      : 'text-[#44474d] hover:text-[#091b31]'
                    }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                  <span>Companion Quiz &amp; Habits</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: National Young Storyteller Cup 2025 */}
        {activeTab === 'cup' && (
          <section className="w-full px-4 sm:px-8 lg:px-10 py-10 flex flex-col gap-10">
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-10">
              {/* Headline & Bilingual Banner Card */}
              <div className="relative rounded-2xl bg-[#203047] text-white p-6 sm:p-10 lg:p-12 overflow-hidden shadow-tactile-xl">
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[280px]">draw</span>
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="flex flex-col gap-3 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2d6955] text-white text-xs font-bold w-fit">
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                      <span>2025 Annual Bilingual Invitational • Ages 6–14</span>
                    </div>
                    <h2 className="font-serif-story text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                      {activeContest?.title || 'National Young Storyteller Cup 2025'}
                      <span className="block text-[#b1f0d6] text-xl sm:text-2xl mt-1 font-normal">
                        {activeContest?.titleHindi || 'राष्ट्रीय बाल लेखक प्रतियोगिता २०२५'}
                      </span>
                    </h2>
                    <p className="text-sm sm:text-base text-[#ddeaf2] text-opacity-95 leading-relaxed">
                      {activeContest?.description ||
                        'Bilingual creative writing championship for young dreamers across India. Celebrate folklore, science, original narratives, and indigenous heritage in English or Hindi.'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
                    <a
                      href="#manuscript-editor"
                      className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2d6955] text-white hover:bg-[#b1f0d6] hover:text-[#002117] transition-all text-xs sm:text-sm font-bold shadow-md text-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit_note</span>
                      <span>Draft Your Entry</span>
                    </a>
                    <button
                      onClick={handleDownloadContestGuide}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs font-semibold text-center border border-white/20"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      <span>Download Contest Guide (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Contest Essential Metrics Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Theme Card */}
                <div className="p-6 rounded-2xl bg-white shadow-tactile-sm border border-[#ddeaf2] flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#b1f0d6] flex items-center justify-center text-[#002117]">
                      <span className="material-symbols-outlined text-[26px]">nature_people</span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ddeaf2] text-[#44474d] font-semibold">
                      Prompt 01
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#2d6955] font-bold">Official Theme</span>
                    <h3 className="font-serif-story text-lg font-bold text-[#091b31] mt-1">
                      {activeContest?.theme || 'Whispers of the Banyan Tree'}
                    </h3>
                    <p className="text-sm font-serif-story text-[#44474d] mt-0.5">
                      {activeContest?.themeHindi || 'बरगद की फुसफुसाहट'}
                    </p>
                    <p className="text-xs text-[#44474d] mt-2 leading-relaxed">
                      {activeContest?.prompt ||
                        'Write about roots, ancient memory, or future creatures discovering their home beneath the wide canopy.'}
                    </p>
                  </div>
                </div>

                {/* Deadline Card */}
                <div className="p-6 rounded-2xl bg-white shadow-tactile-sm border border-[#ddeaf2] flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#e3f0f8] flex items-center justify-center text-[#091b31]">
                      <span className="material-symbols-outlined text-[26px]">event</span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-bold">
                      38 Days Left
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#44474d] font-bold">Submission Closes</span>
                    <h3 className="font-serif-story text-lg font-bold text-[#091b31] mt-1">March 31, 2025</h3>
                    <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                      11:59 PM IST (Digital Portal). Early bird critiques shared bi-weekly.
                    </p>
                  </div>
                </div>

                {/* Word Count Limits */}
                <div className="p-6 rounded-2xl bg-white shadow-tactile-sm border border-[#ddeaf2] flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#ffdea7] flex items-center justify-center text-[#261800]">
                      <span className="material-symbols-outlined text-[26px]">notes</span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e3f0f8] text-[#111d23] font-semibold">
                      Tier Rules
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#402c00] font-bold">Word Limit</span>
                    <h3 className="font-serif-story text-lg font-bold text-[#091b31] mt-1">500 – 1,200 Words</h3>
                    <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                      Juniors (6–9 yrs): 500w min.<br />Seniors (10–14 yrs): up to 1,200w.
                    </p>
                  </div>
                </div>

                {/* Jury Panel */}
                <div className="p-6 rounded-2xl bg-white shadow-tactile-sm border border-[#ddeaf2] flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#96d3bb] flex items-center justify-center text-[#002117]">
                      <span className="material-symbols-outlined text-[26px]">gavel</span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ddeaf2] text-[#44474d] font-semibold">
                      Blind Review
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#2d6955] font-bold">Distinguished Jury</span>
                    <h3 className="font-serif-story text-lg font-bold text-[#091b31] mt-1">Sahitya Academicians</h3>
                    <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                      5 acclaimed children's literature authors, bilingual linguists, and school principals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Layout: Editor & Safe Pseudonym System */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="manuscript-editor">
                {/* Interactive Safe Editor Preview (8 Cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-tactile-md border border-[#ddeaf2] flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ddeaf2]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e3f0f8] flex items-center justify-center text-[#091b31] font-bold">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </div>
                      <div>
                        <h3 className="font-serif-story text-lg font-bold text-[#091b31]">
                          Child-Safe Manuscript Desk
                        </h3>
                        <p className="text-xs text-[#44474d]">Clean distraction-free studio with privacy sandbox</p>
                      </div>
                    </div>
                    {/* Language Pill Switcher inside Editor */}
                    <div className="flex items-center bg-[#e9f6fd] rounded-xl p-1 border border-[#ddeaf2]">
                      <button
                        onClick={() => setEditorLang('en')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${editorLang === 'en'
                            ? 'bg-[#203047] text-white shadow-xs'
                            : 'text-[#44474d] hover:text-[#091b31]'
                          }`}
                        type="button"
                      >
                        English
                      </button>
                      <button
                        onClick={() => setEditorLang('hi')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${editorLang === 'hi'
                            ? 'bg-[#203047] text-white shadow-xs'
                            : 'text-[#44474d] hover:text-[#091b31]'
                          }`}
                        type="button"
                      >
                        हिन्दी
                      </button>
                    </div>
                  </div>

                  {/* Child Anonymous Pen Name & Guardian Protection Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#e9f6fd] rounded-xl border border-[#ddeaf2]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#2d6955] text-[20px]">shield_person</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#44474d]">Anonymous Pen-Name:</span>
                        <span className="text-sm font-bold text-[#091b31]">Aarav_StarWeaver #812</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <span className="material-symbols-outlined text-[#c08f2a] text-[20px]">family_restroom</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#44474d]">Guardian Co-Signature:</span>
                        <span className="text-xs text-[#2d6955] font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#2d6955]" /> Verified by Parent
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notification Messages */}
                  {draftToast && (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-[#203047] text-xs rounded-xl font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Draft saved successfully to local sandbox storage!</span>
                    </div>
                  )}
                  {submitSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 text-[#002117] text-xs sm:text-sm rounded-xl font-bold flex items-center gap-3">
                      <span className="material-symbols-outlined text-[22px] text-[#2d6955]">workspace_premium</span>
                      <span>Your story has been officially recorded in the National Young Storyteller Cup 2025 editorial queue!</span>
                    </div>
                  )}

                  {/* Title Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#44474d]" htmlFor="manuscript-title">
                      Story Title / शीर्षक
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-[#e9f6fd] text-[#111d23] font-serif-story text-base sm:text-lg focus:outline-none focus:bg-[#e3f0f8] border border-[#ddeaf2]"
                      id="manuscript-title"
                      value={manuscriptTitle}
                      onChange={(e) => setManuscriptTitle(e.target.value)}
                      placeholder="The Night the Banyan Spoke to the Stars..."
                    />
                  </div>

                  {/* Story Canvas Area */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#44474d]" htmlFor="story-body">
                        Manuscript Draft / पांडुलिपि
                      </label>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${wordCount >= 500 && wordCount <= 1200
                            ? 'bg-[#b1f0d6] text-[#002117]'
                            : 'bg-[#ffdea7] text-[#261800]'
                          }`}
                        id="word-badge"
                      >
                        {wordCount} / 1,200 words
                      </span>
                    </div>
                    <textarea
                      className="w-full p-4 rounded-xl bg-[#e9f6fd] text-[#111d23] font-serif-story text-sm sm:text-base leading-relaxed focus:outline-none focus:bg-[#e3f0f8] resize-y border border-[#ddeaf2]"
                      id="story-body"
                      value={storyBody}
                      onChange={(e) => setStoryBody(e.target.value)}
                      rows={10}
                      placeholder="Once upon a midnight in Rajasthan, near the edge of the blue hills..."
                    />
                  </div>

                  {/* Safe Co-Signature & Action Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#2d6955] text-[22px]">check_circle</span>
                      <span className="text-xs text-[#44474d]">{autoSavedTime}</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#e3f0f8] text-[#111d23] hover:bg-[#ddeaf2] transition-colors text-xs sm:text-sm font-semibold border border-[#cfdce4]"
                        type="button"
                      >
                        {savingDraft ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={handleSubmitEntry}
                        disabled={submittingEntry}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#203047] text-white hover:bg-[#091b31] transition-colors text-xs sm:text-sm font-semibold shadow-md disabled:opacity-50"
                        type="button"
                      >
                        {submittingEntry ? 'Submitting...' : 'Submit Entry'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar: Guidelines & Jury Highlights (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Submission Tracker Checklist */}
                  <div className="bg-white rounded-2xl p-6 shadow-tactile-sm border border-[#ddeaf2] flex flex-col gap-3">
                    <h4 className="font-serif-story text-base font-bold text-[#091b31] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#2d6955] text-[22px]">fact_check</span>
                      <span>Entry Checklist</span>
                    </h4>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#2d6955] text-[18px] mt-0.5">check_box</span>
                        <span className="text-xs text-[#111d23]">Original, unpublished story written solely by participant</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#2d6955] text-[18px] mt-0.5">check_box</span>
                        <span className="text-xs text-[#111d23]">Connects clearly with theme 'Whispers of the Banyan Tree'</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#2d6955] text-[18px] mt-0.5">check_box</span>
                        <span className="text-xs text-[#111d23]">Parent/Guardian verified account email linked</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#c5c6cd] text-[18px] mt-0.5">check_box_outline_blank</span>
                        <span className="text-xs text-[#44474d]">Illustrations attached (Optional +5 Creative Bonus)</span>
                      </div>
                    </div>
                  </div>

                  {/* Distinguished Jury Spotlight */}
                  <div className="bg-white rounded-2xl p-6 shadow-tactile-sm border border-[#ddeaf2] flex flex-col gap-3">
                    <h4 className="font-serif-story text-base font-bold text-[#091b31] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#f4be55] text-[22px]">stars</span>
                      <span>Honored Jury</span>
                    </h4>
                    <div className="flex flex-col gap-4 pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#e3f0f8] overflow-hidden shrink-0 border border-[#ddeaf2] flex items-center justify-center font-bold text-xs text-[#203047]">
                          SV
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#091b31]">Dr. Suniti Verma</span>
                          <span className="text-[11px] text-[#44474d]">Bilingual Author &amp; Bal Sahitya Puraskar Honoree</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#e3f0f8] overflow-hidden shrink-0 border border-[#ddeaf2] flex items-center justify-center font-bold text-xs text-[#203047]">
                          RI
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#091b31]">Raghavan Iyer</span>
                          <span className="text-[11px] text-[#44474d]">Editor, Whispering Pines Children's Press</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Awards Banner */}
                  <div className="bg-[#b1f0d6]/40 rounded-2xl p-6 flex flex-col gap-2 border border-[#b1f0d6]">
                    <div className="flex items-center gap-2 text-[#2d6955] font-bold text-xs sm:text-sm">
                      <span className="material-symbols-outlined text-[20px]">military_tech</span>
                      <span>Grand National Prize</span>
                    </div>
                    <p className="text-xs text-[#111d23] leading-relaxed">
                      Top 3 stories receive physical hardbound publication on StoryNest, ₹25,000 literary scholarship, and an invitation to the New Delhi World Book Fair.
                    </p>
                  </div>
                </div>
              </div>

              {/* Past Winning Stories Showcase */}
              <div className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#2d6955] font-bold">
                      Hall of Young Laureates
                    </span>
                    <h3 className="font-serif-story text-2xl font-bold text-[#091b31] mt-1">
                      Past Cup Champions (2024)
                    </h3>
                  </div>
                  <Link
                    href="/library"
                    className="text-xs sm:text-sm text-[#2d6955] hover:text-[#002117] flex items-center gap-1 font-semibold"
                  >
                    <span>Browse Full Archive</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Winner Card 1: Gold Quill */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-tactile-sm border border-[#ddeaf2] hover:shadow-tactile-md transition-shadow flex flex-col">
                    <div className="relative h-48 bg-gradient-to-br from-[#203047] to-[#2F6B57] flex items-center justify-center p-6 text-center text-white">
                      <div className="text-4xl mb-2">🏺✨</div>
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#203047] text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-[#ffdea7] text-[16px]">workspace_premium</span>
                        <span>Gold Quill Award</span>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-white/90 text-[11px] text-[#091b31] font-bold">
                        Ages 8-10
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#2d6955] font-bold uppercase tracking-wider">
                          English • 850 Words
                        </span>
                        <h4 className="font-serif-story text-lg font-bold text-[#091b31]">The Clay Birds of Kutch</h4>
                        <p className="text-xs text-[#44474d] line-clamp-2 leading-relaxed">
                          When the Rann dried into silver salt crystals, an apprentice potter discovered how to bake songs inside miniature clay sparrows.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#ddeaf2]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#b1f0d6] flex items-center justify-center font-bold text-xs text-[#002117]">
                            M
                          </div>
                          <span className="text-xs text-[#111d23] font-semibold">Maya S. (Pune)</span>
                        </div>
                        <Link href="/library" className="text-[#2d6955] hover:text-[#091b31]">
                          <span className="material-symbols-outlined text-[20px]">menu_book</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Winner Card 2: Silver Owl */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-tactile-sm border border-[#ddeaf2] hover:shadow-tactile-md transition-shadow flex flex-col">
                    <div className="relative h-48 bg-gradient-to-br from-[#2F6B57] to-[#E9B44C] flex items-center justify-center p-6 text-center text-white">
                      <div className="text-4xl mb-2">🛶🌊</div>
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#203047] text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-[#d7e4ec] text-[16px]">military_tech</span>
                        <span>Silver Owl Award</span>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-white/90 text-[11px] text-[#091b31] font-bold">
                        Ages 11-13
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#2d6955] font-bold uppercase tracking-wider">
                          हिन्दी • ९२० शब्द
                        </span>
                        <h4 className="font-serif-story text-lg font-bold text-[#091b31]">ब्रह्मपुत्र की सुनहरी नाव</h4>
                        <p className="text-xs text-[#44474d] line-clamp-2 leading-relaxed">
                          नदी के किनारे मिली एक पुरानी लकड़ी की नाव जिसने सातवीं कक्षा के रोहन को बादलों के पार ले जाकर वर्षा का रहस्य बताया।
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#ddeaf2]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#b1f0d6] flex items-center justify-center font-bold text-xs text-[#002117]">
                            R
                          </div>
                          <span className="text-xs text-[#111d23] font-semibold">Rohan P. (Guwahati)</span>
                        </div>
                        <Link href="/library" className="text-[#2d6955] hover:text-[#091b31]">
                          <span className="material-symbols-outlined text-[20px]">menu_book</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Winner Card 3: Folkloric Voice */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-tactile-sm border border-[#ddeaf2] hover:shadow-tactile-md transition-shadow flex flex-col">
                    <div className="relative h-48 bg-gradient-to-br from-[#203047] to-[#402c00] flex items-center justify-center p-6 text-center text-white">
                      <div className="text-4xl mb-2">🐆🏔️</div>
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#203047] text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-[#ffdea7] text-[16px]">flare</span>
                        <span>Folkloric Voice Prize</span>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-white/90 text-[11px] text-[#091b31] font-bold">
                        Ages 7-9
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#2d6955] font-bold uppercase tracking-wider">
                          Bilingual • 610 Words
                        </span>
                        <h4 className="font-serif-story text-lg font-bold text-[#091b31]">The Snow Leopard's Lantern</h4>
                        <p className="text-xs text-[#44474d] line-clamp-2 leading-relaxed">
                          High in the cold pass of Ladakh, a young girl discovers how frozen moonlight protects forgotten highland travelers.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#ddeaf2]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#b1f0d6] flex items-center justify-center font-bold text-xs text-[#002117]">
                            D
                          </div>
                          <span className="text-xs text-[#111d23] font-semibold">Dolma T. (Leh)</span>
                        </div>
                        <Link href="/library" className="text-[#2d6955] hover:text-[#091b31]">
                          <span className="material-symbols-outlined text-[20px]">menu_book</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: Companion Interactive Quiz & Spark Habit Tracker */}
        {activeTab === 'quiz' && (
          <section className="w-full px-4 sm:px-8 lg:px-10 py-10 flex flex-col gap-10">
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-10">
              {/* Top Habit Tracker & Streak Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 7-Day Spark Habit Streak Hub (8 Cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 shadow-tactile-sm border border-[#ddeaf2] flex flex-col justify-between gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#ffdea7] flex items-center justify-center text-[#402c00] shadow-sm">
                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          local_fire_department
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif-story text-xl font-bold text-[#091b31]">7-Day Spark Habit</h3>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#b1f0d6] text-[#002117] font-bold">
                            5 Days Active
                          </span>
                        </div>
                        <p className="text-xs text-[#44474d] mt-0.5">
                          Daily literary comprehension and active reading streak
                        </p>
                      </div>
                    </div>
                    {/* Total minutes readout */}
                    <div className="flex items-center gap-3 bg-[#e9f6fd] px-4 py-2 rounded-xl border border-[#ddeaf2]">
                      <span className="material-symbols-outlined text-[#2d6955] text-[22px]">timer</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#44474d]">This Week</span>
                        <span className="text-sm font-bold text-[#091b31]">85 Mins Read</span>
                      </div>
                    </div>
                  </div>

                  {/* Week Days Visual Indicator */}
                  <div className="grid grid-cols-7 gap-2 pt-2">
                    {/* Mon */}
                    <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#b1f0d6]/40 border border-[#b1f0d6]">
                      <span className="text-[11px] text-[#2d6955] font-bold">Mon</span>
                      <div className="w-7 h-7 rounded-full bg-[#2d6955] text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                      <span className="text-[11px] text-[#44474d]">20m</span>
                    </div>
                    {/* Tue */}
                    <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#b1f0d6]/40 border border-[#b1f0d6]">
                      <span className="text-[11px] text-[#2d6955] font-bold">Tue</span>
                      <div className="w-7 h-7 rounded-full bg-[#2d6955] text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                      <span className="text-[11px] text-[#44474d]">15m</span>
                    </div>
                    {/* Wed */}
                    <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#b1f0d6]/40 border border-[#b1f0d6]">
                      <span className="text-[11px] text-[#2d6955] font-bold">Wed</span>
                      <div className="w-7 h-7 rounded-full bg-[#2d6955] text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                      <span className="text-[11px] text-[#44474d]">25m</span>
                    </div>
                    {/* Thu */}
                    <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#b1f0d6]/40 border border-[#b1f0d6]">
                      <span className="text-[11px] text-[#2d6955] font-bold">Thu</span>
                      <div className="w-7 h-7 rounded-full bg-[#2d6955] text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                      <span className="text-[11px] text-[#44474d]">10m</span>
                    </div>
                    {/* Fri (Today) */}
                    <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#203047] text-white shadow-sm">
                      <span className="text-[11px] font-bold text-[#ffdea7]">Fri</span>
                      <div className="w-7 h-7 rounded-full bg-[#ffdea7] text-[#261800] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                      <span className="text-[11px] text-gray-200 font-bold">15m</span>
                    </div>
                    {/* Sat */}
                    <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#e9f6fd] opacity-70 border border-[#ddeaf2]">
                      <span className="text-[11px] text-[#44474d]">Sat</span>
                      <div className="w-7 h-7 rounded-full bg-[#e3f0f8] flex items-center justify-center text-[#75777e]">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                      </div>
                      <span className="text-[11px] text-[#44474d]">--</span>
                    </div>
                    {/* Sun */}
                    <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#e9f6fd] opacity-70 border border-[#ddeaf2]">
                      <span className="text-[11px] text-[#44474d]">Sun</span>
                      <div className="w-7 h-7 rounded-full bg-[#e3f0f8] flex items-center justify-center text-[#75777e]">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                      </div>
                      <span className="text-[11px] text-[#44474d]">--</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Progress Ring Chart SVG (4 Cols) */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 shadow-tactile-sm border border-[#ddeaf2] flex items-center justify-between gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#2d6955] font-bold">Weekly Goal</span>
                    <h4 className="font-serif-story text-xl font-bold text-[#091b31]">71% Reached</h4>
                    <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                      Only 2 days remaining to earn this week's Golden Comet Badge!
                    </p>
                  </div>
                  {/* Compact SVG Ring Chart */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#ddeaf2] stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-[#2d6955] stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray="71, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="font-serif-story text-base font-bold text-[#091b31]">5/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Companion Book Quiz Section: 'Tara and the Whispering Stars' */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Book Identity & Metadata Card (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-tactile-sm border border-[#ddeaf2] flex flex-col gap-6">
                    {/* Book Artwork Preview Frame */}
                    <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-[#203047] via-[#2F6B57] to-[#091b31] p-6 flex flex-col justify-between text-white shadow-md">
                      <div className="text-4xl">✨🔭🌌</div>
                      <div className="p-3 rounded-xl bg-[#203047]/90 backdrop-blur-md text-white border border-white/20">
                        <span className="text-[10px] text-[#b1f0d6] font-bold block uppercase tracking-wider">
                          Official Companion Study Module
                        </span>
                        <span className="font-serif-story text-sm font-bold mt-0.5 block">
                          Tara and the Whispering Stars
                        </span>
                      </div>
                    </div>

                    {/* Story Info Details */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs text-[#44474d]">
                        <span>Author</span>
                        <span className="font-bold text-[#091b31]">Dr. Meera Sharma</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-[#44474d]">
                        <span>Difficulty</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#b1f0d6] text-[#002117] text-[11px] font-bold">
                          Reader Level 2
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-[#44474d]">
                        <span>Quiz Time</span>
                        <span className="font-bold text-[#091b31]">~6 Minutes</span>
                      </div>
                    </div>

                    {/* Vocabulary Flashcard Box */}
                    <div className="bg-[#e9f6fd] rounded-xl p-4 flex flex-col gap-2 border border-[#ddeaf2]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold text-[#2d6955]">
                          Featured Vocabulary
                        </span>
                        <span className="material-symbols-outlined text-[18px] text-[#2d6955]">spellcheck</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif-story text-lg font-bold text-[#091b31]">
                          Nakshatra • नक्षत्र
                        </span>
                        <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                          <em>Noun:</em> A lunar mansion or constellation in Indian astronomy. Tara maps 27 of them through her grandmother's sky diary.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Bilingual Quiz Card (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-tactile-md border border-[#ddeaf2] flex flex-col justify-between gap-6">
                  {/* Quiz Header */}
                  <div className="flex flex-col gap-2 pb-4 border-b border-[#ddeaf2]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-[#2d6955] font-bold">
                        Question {currentQIndex + 1} of {quizQuestions.length} • Comprehension &amp; Folklore
                      </span>
                      <span className="text-xs font-bold text-[#091b31] bg-[#e3f0f8] px-3 py-1 rounded-full">
                        Score: {xpScore} XP
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#e3f0f8] overflow-hidden">
                      <div
                        className="h-full bg-[#2d6955] rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQIndex + 1) / quizQuestions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-serif-story text-xl sm:text-2xl font-bold text-[#091b31] leading-snug">
                        {currentQ.questionEn}
                      </h3>
                      <p className="font-serif-story text-base sm:text-lg text-[#2d6955] font-normal">
                        {currentQ.questionHi}
                      </p>
                    </div>

                    {/* Interactive Options */}
                    <div className="flex flex-col gap-3">
                      {currentQ.options.map((opt, idx) => {
                        const isChosen = selectedOptionIdx === idx;
                        const isCorrect = idx === currentQ.correctIndex;
                        let btnStyle = 'bg-[#e9f6fd] hover:bg-[#e3f0f8] border border-[#ddeaf2] text-[#111d23]';
                        if (feedbackVisible) {
                          if (isCorrect) {
                            btnStyle = 'bg-[#b1f0d6] text-[#002117] font-bold border border-[#2d6955]';
                          } else if (isChosen && !isCorrect) {
                            btnStyle = 'bg-[#ffdad6] text-[#93000a] font-bold border border-[#ba1a1a]';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizOption(idx)}
                            className={`quiz-option w-full p-4 rounded-xl text-left flex items-start gap-4 transition-all ${btnStyle}`}
                            type="button"
                          >
                            <span className="w-7 h-7 rounded-full bg-white text-[#091b31] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-xs sm:text-sm font-semibold">{opt.en}</span>
                              <span className="text-xs text-[#44474d] mt-0.5">{opt.hi}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Notice */}
                    {feedbackVisible && (
                      <div
                        className={`p-4 rounded-xl flex items-start gap-3 ${selectedOptionIdx === currentQ.correctIndex
                            ? 'bg-[#b1f0d6]/70 text-[#002117]'
                            : 'bg-[#ffdad6]/70 text-[#93000a]'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[#2d6955] text-[24px]">verified</span>
                        <div>
                          <span className="text-xs sm:text-sm font-bold block">
                            {selectedOptionIdx === currentQ.correctIndex
                              ? 'Shabash! Correct Comprehension (शाबाश!)'
                              : 'Insightful Attempt (प्रयास अच्छा था)'}
                          </span>
                          <p className="text-xs mt-1 leading-relaxed">
                            {currentQ.explanationEn}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action & Certificate Unlock Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#ddeaf2]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#f4be55] text-[22px]">workspace_premium</span>
                      <span className="text-xs text-[#44474d] font-semibold">
                        Finish {quizQuestions.length} questions to unlock Printable Certificate
                      </span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={handlePrevQuiz}
                        disabled={currentQIndex === 0}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#e3f0f8] text-[#111d23] hover:bg-[#ddeaf2] transition-colors text-xs font-semibold disabled:opacity-40"
                        type="button"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextQuiz}
                        disabled={selectedOptionIdx === null}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#203047] text-white hover:bg-[#091b31] transition-colors text-xs font-semibold shadow-md disabled:opacity-40"
                        type="button"
                      >
                        {currentQIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Printable Certificate Unlock Modal Banner */}
              <div className="rounded-2xl bg-[#e9f6fd] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#ddeaf2]">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#ffdea7] flex items-center justify-center text-[#261800] shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[36px]">military_tech</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-serif-story text-xl font-bold text-[#091b31]">
                      Junior Astronomer &amp; Reader Diploma
                    </h4>
                    <p className="text-xs text-[#44474d] max-w-xl mt-1 leading-relaxed">
                      Parents &amp; teachers can print this bilingual honor certificate signed by Author Dr. Meera Sharma upon 100% quiz completion.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCertificateModalOpen(true)}
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#2d6955] text-white hover:bg-[#b1f0d6] hover:text-[#002117] transition-all text-xs sm:text-sm font-bold shrink-0 flex items-center justify-center gap-2 shadow-md"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">print</span>
                  <span>Print Certificate (प्रमाण पत्र)</span>
                </button>
              </div>
            </div>
          </section>
        )}
          </div>
        </main>

        {/* Certificate Modal - Only Generated with Admin Permission */}
        {certificateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-[#FAF7F0] border-8 border-[#203047] rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-center relative shadow-2xl">
          <button
            onClick={() => setCertificateModalOpen(false)}
            className="absolute top-4 right-4 text-xl text-[#203047] hover:text-black font-bold"
          >
            ✕
          </button>

          {!allowCertificateGeneration ? (
            /* Admin Permission Locked State */
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-sm">
                🔒
              </div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-amber-800">
                ADMIN PERMISSION REQUIRED
              </span>
              <h3 className="font-serif-story text-2xl font-bold text-[#091b31]">
                Certificate Generation Pending Admin Permission
              </h3>
              <p className="text-xs text-[#44474d] max-w-md mx-auto leading-relaxed">
                Official StoryNest diplomas are generated under strict supervision and require permission from the <strong>StoryNest Admin Panel</strong>. Once an administrator enables Certificate Generation in Platform Settings, you can immediately preview and print your official bilingual diploma.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-[#e9f6fd] border border-[#ddeaf2] text-xs text-[#203047] max-w-md">
                💡 <strong>Administrator note:</strong> Log in as Admin, navigate to <strong>Platform Settings</strong>, and switch on <em>&ldquo;Allow Certificate Generation &amp; Printing&rdquo;</em> to unlock generation.
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setCertificateModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31]"
                >
                  Understood (समझ गया)
                </button>
              </div>
            </div>
          ) : (
            /* Admin Permission Granted - Full Dynamic Certificate */
            <div>
              <div className="text-4xl mb-2">⭐ 📜 ⭐</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold mb-2">
                <span>✓</span>
                <span>Admin Permission Verified &bull; Official Guild Diploma</span>
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#2d6955] block">
                STORYNEST LITERARY GUILD DIPLOMA
              </span>
              <h2 className="font-serif-story text-2xl sm:text-3xl font-bold text-[#091b31] mt-2">
                {selectedQuiz?.title || 'Junior Astronomer & Bilingual Laureate'}
              </h2>
              <p className="text-sm text-[#44474d] mt-2 italic">This certificate is proudly awarded to</p>

              {/* Recipient Name with Edit Option */}
              <div className="my-3 flex items-center justify-center gap-2">
                {isEditingCertName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="font-serif-story text-2xl font-bold text-[#203047] text-center border-b-2 border-[#2d6955] bg-transparent focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingCertName(false)}
                      className="px-2.5 py-1 rounded-lg bg-[#2d6955] text-white text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-serif-story text-2xl sm:text-3xl font-bold text-[#203047] underline decoration-[#E9B44C] decoration-2 underline-offset-4">
                      {studentName}
                    </h3>
                    <button
                      onClick={() => setIsEditingCertName(true)}
                      className="text-xs text-gray-400 hover:text-gray-700"
                      title="Click to edit name"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>

              <p className="text-xs text-[#44474d] max-w-lg mx-auto leading-relaxed">
                For demonstrating extraordinary comprehension, celestial curiosity, and stellar literary focus while completing the companion study for{' '}
                <strong>&ldquo;{selectedQuiz?.bookTitle || selectedQuiz?.bookId?.title || 'Tara and the Whispering Stars'}&rdquo;</strong>.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#ddeaf2] text-xs">
                <div>
                  <span className="block font-bold text-[#203047]">
                    {selectedQuiz?.bookId?.authorName || 'Dr. Meera Sharma'}
                  </span>
                  <span className="text-[10px] text-gray-500">Author &amp; Astrobiologist</span>
                </div>
                <div>
                  <span className="block font-bold text-[#203047]">StoryNest Editorial Board</span>
                  <span className="text-[10px] text-gray-500">COPPA Certified Youth Guild</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={dynamicCertUrl}
                  target="_blank"
                  className="px-5 py-2.5 rounded-xl bg-[#2d6955] text-white text-xs font-bold hover:bg-[#205141] shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Open Dynamic Certificate Page ↗</span>
                </Link>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setCertificateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 text-[#203047] text-xs font-bold hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    <Footer />
  </div>
  );
}
