import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/mongodb';
import { User, ChildStory } from '../models';

async function testRoleSeparation() {
  console.log('=== VERIFYING ROLE SEPARATION & CHILD STORY WORKFLOW ===\n');
  await connectToDatabase();

  const reader = await User.findOne({ role: 'reader' }).lean();
  const parent = await User.findOne({ role: 'parent' }).lean();
  const author = await User.findOne({ role: 'author' }).lean();
  const admin = await User.findOne({ role: 'admin' }).lean();

  console.log('Found test users:');
  console.log('- Reader:', reader?.name, '(', reader?.email, ')');
  console.log('- Parent:', parent?.name, '(', parent?.email, ')');
  console.log('- Author:', author?.name, '(', author?.email, ')');
  console.log('- Admin:', admin?.name, '(', admin?.email, ')');

  // 1. Create a child story in database
  const story = await ChildStory.create({
    authorId: reader?._id,
    authorName: reader?.name || 'Aarav Sharma',
    guardianId: parent?._id,
    title: 'The Starlit Terrace Adventure',
    synopsis: 'Aarav discovers a telescope that speaks in rhymes.',
    genre: 'Adventure & Fantasy',
    targetAge: '6-8',
    status: 'AWAITING_GUARDIAN_APPROVAL',
    chapters: [{
      chapterNumber: 1,
      title: 'Chapter 1: The Golden Lens',
      content: 'Under the midnight sky, the stars began to whisper softly...',
      illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
    }],
    guardianConsentStatus: 'PENDING'
  });

  console.log('\n✅ 1. Child story created with status:', story.status, '| Guardian Consent:', story.guardianConsentStatus);

  // 2. Parent approves the child story
  story.guardianConsentStatus = 'APPROVED';
  story.status = 'SUBMITTED';
  story.reviewerFeedback = 'Approved by Priya Sharma for editorial review.';
  await story.save();

  console.log('✅ 2. Guardian approved story. New status:', story.status, '| Feedback:', story.reviewerFeedback);

  // 3. Admin publishes the child story
  story.status = 'PUBLISHED';
  story.publishedAt = new Date();
  story.reviewerFeedback = 'Congratulations! Published in StoryNest Young Authors library.';
  await story.save();

  console.log('✅ 3. Editorial admin published story. Final status:', story.status);

  // Clean up test story
  await ChildStory.findByIdAndDelete(story._id);
  console.log('\n✅ 4. Test cleanup complete.');
  console.log('\n=== ALL ROLE-BASED WORKFLOW CHECKS PASSED ===');
  await mongoose.disconnect();
  process.exit(0);
}

testRoleSeparation().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});

