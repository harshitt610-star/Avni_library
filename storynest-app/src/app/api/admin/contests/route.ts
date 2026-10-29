import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contest, AuditLog } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

// GET: Fetch all contests or public active contest
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      let activeContest = await Contest.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
      
      // If none in DB, create initial seed contest matching Stitch specifications
      if (!activeContest) {
        activeContest = await Contest.create({
          title: 'National Young Storyteller Cup',
          titleHindi: 'राष्ट्रीय बाल लेखक प्रतियोगिता',
          edition: '2025',
          theme: 'Nature, Technology, and Magic',
          themeHindi: 'प्रकृति, तकनीक और जादू',
          prompt: 'Write an imaginative story about a hidden clockwork forest where ancient trees tell stories and mechanical creatures guard forgotten secrets.',
          promptHindi: 'एक ऐसी जादुई घड़ी के जंगल की कहानी लिखें जहाँ प्राचीन पेड़ कहानियाँ सुनाते हैं और रहस्यमयी यांत्रिक जीव पुराने राज़ों की रक्षा करते हैं।',
          description: 'StoryNest invites budding young wordsmiths and curious creators to submit original illustrated tales.',
          descriptionHindi: 'स्टोरीनेस्ट सभी नन्हे लेखकों और युवा रचनाकारों को अपनी मौलिक सचित्र कहानियाँ साझा करने के लिए आमंत्रित करता है।',
          wordLimitMin: 300,
          wordLimitMax: 1200,
          deadline: new Date('2025-11-15T23:59:59Z'),
          prizePool: '₹25,000 Book Grants + Anthology Publication',
          perks: [
            'National Young Author Certificate',
            'Full Digital Illustrated Publication',
            '₹25,000 in School Library Grants',
            '1-on-1 Mentorship with Children’s Laureates',
          ],
          eligibility: 'Open to Young Writers aged 6–16 (All India & Global)',
          isActive: true,
          laureates: [
            {
              name: 'Ananya Sharma',
              age: 11,
              storyTitle: 'The Clockwork Sparrow',
              badge: 'Golden Quill 2024 Winner',
            },
            {
              name: 'Kabir Mehta',
              age: 10,
              storyTitle: 'The Secret of the Silver Oak',
              badge: 'Young Innovator Prize',
            },
            {
              name: 'Priya Nair',
              age: 12,
              storyTitle: 'Wings Over the Whispering Woods',
              badge: 'Bilingual Story Laureate',
            },
          ],
        });
      }
      return NextResponse.json({ success: true, contest: activeContest });
    }

    // Admin full list
    await requireAdmin();
    const contests = await Contest.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: contests.length, contests });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Contests GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}

// POST: Create a new contest
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();

    const {
      title,
      titleHindi,
      edition,
      theme,
      themeHindi,
      prompt,
      promptHindi,
      description,
      descriptionHindi,
      wordLimitMin,
      wordLimitMax,
      deadline,
      prizePool,
      perks,
      eligibility,
      isActive,
      laureates,
    } = body;

    if (!title || !theme || !prompt || !deadline) {
      return NextResponse.json(
        { success: false, error: 'Title, theme, prompt, and deadline are required' },
        { status: 400 }
      );
    }

    // If activating this contest, deactivate others
    if (isActive) {
      await Contest.updateMany({}, { $set: { isActive: false } });
    }

    const contest = await Contest.create({
      title,
      titleHindi,
      edition: edition || '2025',
      theme,
      themeHindi,
      prompt,
      promptHindi,
      description: description || 'Creative writing arena for young authors.',
      descriptionHindi,
      wordLimitMin: Number(wordLimitMin) || 300,
      wordLimitMax: Number(wordLimitMax) || 1200,
      deadline: new Date(deadline),
      prizePool: prizePool || '₹25,000 Book Grants',
      perks: perks || [],
      eligibility: eligibility || 'Open to readers aged 6-16',
      isActive: isActive !== undefined ? isActive : true,
      laureates: laureates || [],
    });

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CONTEST_CREATED',
      targetResource: 'Contest',
      targetId: contest._id.toString(),
      details: `Created contest: ${title} (${edition || '2025'})`,
    });

    return NextResponse.json({ success: true, contest });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Contest POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create contest' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing contest
export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Contest ID is required' }, { status: 400 });
    }

    if (updateData.isActive) {
      await Contest.updateMany({ _id: { $ne: _id } }, { $set: { isActive: false } });
    }

    const updated = await Contest.findByIdAndUpdate(_id, { $set: updateData }, { returnDocument: 'after' });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CONTEST_UPDATED',
      targetResource: 'Contest',
      targetId: _id,
      details: `Updated contest: ${updated.title}`,
    });

    return NextResponse.json({ success: true, contest: updated });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Contest PUT Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update contest' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a contest
export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Contest ID required' }, { status: 400 });
    }

    await Contest.findByIdAndDelete(id);

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CONTEST_DELETED',
      targetResource: 'Contest',
      targetId: id,
    });

    return NextResponse.json({ success: true, message: 'Contest deleted' });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Contest DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete contest' },
      { status: 500 }
    );
  }
}
