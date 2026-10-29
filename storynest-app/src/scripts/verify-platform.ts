import { connectDB } from '../lib/mongodb';
import {
  Workshop,
  WorkshopBooking,
  Book,
} from '../models';

const BASE_URL = 'http://localhost:3000';

async function runTestSuite() {
  console.log('=== STARTING STORYNEST END-TO-END VERIFICATION SUITE ===\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
      failedCount++;
    }
  }

  try {
    await connectDB();
    console.log('Connected to MongoDB database successfully.\n');

    // 1. AUTHENTICATION & SESSION TOKENS
    console.log('--- 1. Testing Authentication & Session Cookie Generation ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@storynest.com', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    const rawAdminCookie = adminLoginRes.headers.get('set-cookie') || '';
    const adminCookies = rawAdminCookie.split(';')[0];
    assert(adminLoginRes.status === 200 && (adminLoginData.user?.role === 'admin' || adminLoginData.user?.role === 'super_admin'), 'Admin Login & Role Check');

    const readerLoginRes = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reader@storynest.com', password: 'reader123' })
    });
    const readerLoginData = await readerLoginRes.json();
    const rawReaderCookie = readerLoginRes.headers.get('set-cookie') || '';
    const readerCookies = rawReaderCookie.split(';')[0];
    assert(readerLoginRes.status === 200 && (readerLoginData.user?.role === 'reader' || readerLoginData.user?.role === 'student'), 'Reader Login & Role Check');

    const parentLoginRes = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'parent@storynest.com', password: 'parent123' })
    });
    const parentLoginData = await parentLoginRes.json();
    const rawParentCookie = parentLoginRes.headers.get('set-cookie') || '';
    const parentCookies = rawParentCookie.split(';')[0];
    assert(parentLoginRes.status === 200 && parentLoginData.user?.role === 'parent', 'Parent Login & Role Check');

    // 2. RBAC & SECURITY PROTECTION
    console.log('\n--- 2. Testing RBAC & Route Guards ---');
    // Unauthenticated request to admin endpoint
    const unauthRes = await fetch(`${BASE_URL}/api/admin/books`);
    assert(unauthRes.status === 401, 'Unauthenticated request to /api/admin/books rejected with 401');

    // Unauthorized role (student) accessing admin books
    const forbiddenRes = await fetch(`${BASE_URL}/api/admin/books`, {
      headers: { Cookie: readerCookies }
    });
    assert(forbiddenRes.status === 403, 'Student access to /api/admin/books rejected with 403 Forbidden');

    // Authorized super admin accessing admin books
    const adminAccessRes = await fetch(`${BASE_URL}/api/admin/books`, {
      headers: { Cookie: adminCookies }
    });
    const adminAccessData = await adminAccessRes.json();
    assert(adminAccessRes.status === 200 && Array.isArray(adminAccessData.books), 'Super admin successfully authorized for /api/admin/books');

    // 3. CHILD PROFILE PRIVACY & ISOLATION (COPPA)
    console.log('\n--- 3. Testing COPPA Child Profile Isolation ---');
    // Parent getting children
    const parentChildrenRes = await fetch(`${BASE_URL}/api/parent/children`, {
      headers: { Cookie: parentCookies }
    });
    const parentChildrenData = await parentChildrenRes.json();
    assert(parentChildrenRes.status === 200 && Array.isArray(parentChildrenData.children), 'Parent retrieves their isolated child profiles');
    const allChildIdsBelongToParent = parentChildrenData.children?.every(
      (c: { parentId?: string }) => c.parentId === parentLoginData.user.id
    );
    assert(allChildIdsBelongToParent, 'Zero data leakage: All retrieved child profiles match authenticated parent ID');

    // Unauthenticated request to child profiles
    const unauthChildRes = await fetch(`${BASE_URL}/api/parent/children`);
    assert(unauthChildRes.status === 401, 'Unauthenticated request to /api/parent/children rejected with 401');

    // 4. WORKSHOP CAPACITY & REGISTRATION INTEGRITY
    console.log('\n--- 4. Testing Workshop Booking Capacity & Concurrency ---');
    // Find or create test workshop
    let workshop = await Workshop.findOne({ isPublished: true });
    if (!workshop) {
      workshop = await Workshop.create({
        title: 'E2E Test Workshop',
        category: 'Storytelling',
        ageBracket: '7-12',
        instructorName: 'Test Mentor',
        instructorRole: 'Author',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '10:00 AM',
        durationMinutes: 60,
        maxSeats: 1,
        bookedSeats: 0,
        isPublished: true
      });
    }

    // Clean up test bookings for this workshop
    await WorkshopBooking.deleteMany({ workshopId: workshop._id, parentEmail: 'test.e2e@example.com' });
    await Workshop.findByIdAndUpdate(workshop._id, { bookedSeats: 0, maxSeats: 1 });

    // First booking should succeed
    const book1Res = await fetch(`${BASE_URL}/api/workshops/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workshopId: workshop._id.toString(),
        attendeeName: 'E2E Attendee 1',
        parentEmail: 'test.e2e@example.com',
        attendeeAge: 9,
      })
    });
    assert(book1Res.status === 200, 'First workshop booking succeeds under maxSeats capacity');

    // Duplicate booking for same attendee and email should be rejected
    const bookDuplicateRes = await fetch(`${BASE_URL}/api/workshops/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workshopId: workshop._id.toString(),
        attendeeName: 'E2E Attendee 1',
        parentEmail: 'test.e2e@example.com',
        attendeeAge: 9,
      })
    });
    assert(bookDuplicateRes.status === 400, 'Duplicate workshop booking rejected with 400 Bad Request');

    // Booking when full should be rejected with 400 (Workshop is fully booked)
    const bookFullRes = await fetch(`${BASE_URL}/api/workshops/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workshopId: workshop._id.toString(),
        attendeeName: 'E2E Attendee 2',
        parentEmail: 'another.e2e@example.com',
        attendeeAge: 10,
      })
    });
    assert(bookFullRes.status === 400, 'Booking beyond capacity rejected with 400 Full Capacity');

    // 5. REGEX SANITIZATION & SEARCH SAFETY
    console.log('\n--- 5. Testing Regex Query Sanitization ---');
    const maliciousRegexQueries = ['?q=(*', '?q=+++', '?q=[[[[', '?q=\\\\'];
    let regexAllPassed = true;
    for (const q of maliciousRegexQueries) {
      const res = await fetch(`${BASE_URL}/api/books${q}`);
      if (res.status !== 200) {
        regexAllPassed = false;
        console.error(`Regex query failed: ${q} returned status ${res.status}`);
      }
    }
    assert(regexAllPassed, 'Special character regex queries (?q=(*, +++, [[[[) handled safely without 500 error');

    // 6. READING PROGRESS & BOOKMARK RESUMPTION
    console.log('\n--- 6. Testing Reading Progress Persistence ---');
    const book = await Book.findOne({ isPublished: true });
    if (book) {
      const saveProgressRes = await fetch(`${BASE_URL}/api/reading/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: readerCookies },
        body: JSON.stringify({
          bookSlug: book.slug,
          chapterNumber: 2,
          percentCompleted: 60,
          minutesRead: 15
        })
      });
      assert(saveProgressRes.status === 200, 'Student reading progress successfully saved');

      const getProgressRes = await fetch(`${BASE_URL}/api/reading/progress?bookSlug=${book.slug}`, {
        headers: { Cookie: readerCookies }
      });
      const progressData = await getProgressRes.json();
      assert(
        getProgressRes.status === 200 && progressData.progress?.currentChapter === 2,
        'Reading progress bookmark verified on retrieval'
      );
    }

    // 7. CONTEST SUBMISSION & MANUSCRIPT PIPELINE
    console.log('\n--- 7. Testing Young Authors Arena Contest Submission ---');
    const contestRes = await fetch(`${BASE_URL}/api/contests/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: readerCookies },
      body: JSON.stringify({
        storyTitle: 'The Brave Firefly',
        authorName: 'Aarav Sharma',
        age: 10,
        parentEmail: 'parent@storynest.com',
        storyContent: 'Once upon a time in a misty rainforest, a tiny firefly named Pip lit up the canopy...'
      })
    });
    const contestData = await contestRes.json();
    assert(contestRes.status === 200 && contestData.success === true, 'Contest story saved into Manuscript pipeline');

    // 8. CONTACT FORM SUBMISSION
    console.log('\n--- 8. Testing Contact Inquiry Submission ---');
    const contactRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rohan Verma',
        email: 'rohan@example.com',
        topic: 'School & Classroom Subscription',
        message: 'We are interested in bringing StoryNest bilingual library to our primary grades in Jaipur.'
      })
    });
    const contactData = await contactRes.json();
    assert(contactRes.status === 200 && contactData.success === true, 'Contact inquiry submitted and recorded');

    // 9. PUBLISHING PACKAGE CONSULTATION
    console.log('\n--- 9. Testing Publishing Package Consultation Request ---');
    const publishRes = await fetch(`${BASE_URL}/api/publish/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorName: 'Sunil Mehta',
        authorEmail: 'sunil@example.com',
        packageTier: 'Illustrator Gold',
        notes: 'I have a 1,200 word manuscript about Himalayan mountain wildlife.'
      })
    });
    const publishData = await publishRes.json();
    assert(publishRes.status === 200 && publishData.success === true, 'Author publishing consultation request submitted');

    // 10. QUIZ SUBMISSION & STAR CREDITING
    console.log('\n--- 10. Testing Quiz Submission & Star Crediting ---');
    const { Quiz } = await import('../models');
    const quiz = await Quiz.findOne();
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      const answers: Record<string, number> = {};
      quiz.questions.forEach((q: { id: string; correctIndex: number }) => {
        answers[q.id] = q.correctIndex;
      });

      const quizRes = await fetch(`${BASE_URL}/api/quizzes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: readerCookies },
        body: JSON.stringify({
          quizId: quiz._id.toString(),
          answers,
          userName: 'Aarav Sharma'
        })
      });
      const quizData = await quizRes.json();
      assert(
        quizRes.status === 200 && quizData.passed === true && quizData.starsAwarded > 0,
        'Quiz attempt submitted, passed 100%, and awarded Explorer Stars'
      );
    }

    // 11. DYNAMIC CONTESTS & YOUTH ARENA
    console.log('\n--- 11. Testing Dynamic Contests & Arena Management ---');
    const activeContestRes = await fetch(`${BASE_URL}/api/admin/contests?active=true`);
    const activeContestData = await activeContestRes.json();
    assert(
      activeContestRes.status === 200 && activeContestData.success && activeContestData.contest?.title,
      'Active contest retrieved with dynamic theme and writing prompt'
    );

    const adminContestsRes = await fetch(`${BASE_URL}/api/admin/contests`, {
      headers: { Cookie: adminCookies }
    });
    assert(adminContestsRes.status === 200, 'Admin authorized to fetch and manage all StoryNest contests');

    // 12. CONTACT INQUIRIES & HELPDESK
    console.log('\n--- 12. Testing Support Inquiries & Helpdesk ---');
    const adminInquiriesRes = await fetch(`${BASE_URL}/api/admin/inquiries`, {
      headers: { Cookie: adminCookies }
    });
    const adminInquiriesData = await adminInquiriesRes.json();
    assert(
      adminInquiriesRes.status === 200 && Array.isArray(adminInquiriesData.inquiries),
      'Admin successfully retrieves contact inquiries for customer support desk'
    );

    // 13. LIVE WEBSITE SETTINGS & ANNOUNCEMENT BANNER
    console.log('\n--- 13. Testing Live Website Settings & Announcement Bar ---');
    const settingsRes = await fetch(`${BASE_URL}/api/settings`);
    const settingsData = await settingsRes.json();
    assert(
      settingsRes.status === 200 && settingsData.success && typeof settingsData.announcementBarActive === 'boolean',
      'Public settings endpoint supplies dynamic announcement bar and COPPA charter'
    );

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('======================================================\n');

    process.exit(failedCount === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTestSuite();
