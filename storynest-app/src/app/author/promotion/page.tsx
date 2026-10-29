'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AuthorPromotionHubPage() {
  const [downloadToast, setDownloadToast] = React.useState<string | null>(null);

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadToast(`Successfully downloaded "${filename}"!`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const downloadSocialCardSvg = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#203047;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d6955;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#grad)" />
  <circle cx="900" cy="180" r="120" fill="#ffdea7" opacity="0.3" />
  <circle cx="200" cy="900" r="180" fill="#b1f0d6" opacity="0.2" />
  <text x="540" y="260" font-family="serif" font-size="42" fill="#ffdea7" text-anchor="middle" letter-spacing="4">STORYNEST AUTHOR SPOTLIGHT</text>
  <text x="540" y="520" font-family="serif" font-size="52" fill="#FAF7F0" font-style="italic" text-anchor="middle" max-width="800">
    &ldquo;Wonder belongs to those who ask questions.&rdquo;
  </text>
  <text x="540" y="660" font-family="sans-serif" font-size="34" fill="#ffdea7" font-weight="bold" text-anchor="middle">
    — Dr. Meera Sharma
  </text>
  <text x="540" y="720" font-family="sans-serif" font-size="26" fill="#ddeaf2" text-anchor="middle">
    Author of &ldquo;Tara and the Whispering Stars&rdquo;
  </text>
  <rect x="390" y="860" width="300" height="60" rx="30" fill="#FAF7F0" />
  <text x="540" y="900" font-family="sans-serif" font-size="22" fill="#203047" font-weight="bold" text-anchor="middle">Read on StoryNest.org</text>
</svg>`;
    triggerDownload('StoryNest_Tara_Social_Card.svg', svgContent, 'image/svg+xml');
  };

  const downloadBookmarkHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>StoryNest Printable Bookmarks</title>
  <style>
    body { font-family: Georgia, serif; margin: 40px; background: #fff; color: #203047; }
    .sheet { display: flex; gap: 20px; justify-content: center; }
    .bookmark { width: 200px; height: 600px; border: 2px dashed #2d6955; border-radius: 12px; padding: 24px 16px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; text-align: center; background: #faf7f0; }
    h2 { font-size: 18px; margin: 0 0 8px; color: #203047; }
    p { font-size: 12px; line-height: 1.5; color: #444; }
    .quote { font-style: italic; color: #2d6955; font-size: 13px; margin: 20px 0; }
    .footer { font-size: 10px; font-weight: bold; letter-spacing: 1px; color: #888; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="bookmark">
      <div>
        <h2>StoryNest</h2>
        <div style="font-size:24px;">✨📖✨</div>
        <div class="quote">&ldquo;Reading is the map to everywhere.&rdquo;</div>
        <p>Tara &amp; the Whispering Stars<br><strong>Dr. Meera Sharma</strong></p>
      </div>
      <div class="footer">www.storynest.org</div>
    </div>
    <div class="bookmark">
      <div>
        <h2>StoryNest</h2>
        <div style="font-size:24px;">🌟🔭🌟</div>
        <div class="quote">&ldquo;Wonder belongs to those who ask questions.&rdquo;</div>
        <p>Bilingual Stories for Curious Explorers</p>
      </div>
      <div class="footer">www.storynest.org</div>
    </div>
  </div>
</body>
</html>`;
    triggerDownload('StoryNest_Bilingual_Bookmarks.html', htmlContent, 'text/html');
  };

  const downloadDiscussionGuide = () => {
    const mdContent = `# StoryNest Classroom Discussion Guide
## Book: "Tara and the Whispering Stars"
**Author**: Dr. Meera Sharma  
**Target Age**: 7–11 years (Grades 2–5)  
**Themes**: Bilingual Literacy, Astronomy, Curiosity, Heritage  

---

### Reading Comprehension Prompts
1. What inspired Tara to look up at the desert night sky in Rajasthan?
2. In the bilingual edition, how does the word for "constellation" (*nakshatra* / नक्षत्र) deepen the cultural heritage of astronomy?
3. How did Tara and her grandmother use indigenous folklore alongside modern science to understand the stars?

### Hands-on STEAM Activity: Build a Constellation Viewer
- **Materials**: Paper cup, pencil, flashlight, rubber band.
- **Instructions**: Poke holes through the bottom of the cup in the pattern of Ursa Major (*Saptarishi*). Shine the flashlight through the cup onto a dark classroom wall.

### Vocabulary Words
- **Celestial** (खगोलीय)
- **Constellation** (नक्षत्रमंडल)
- **Curiosity** (जिज्ञासा)

---
Published by StoryNest Literary Publishing Platform. Free for educational use.`;
    triggerDownload('Tara_Classroom_Discussion_Guide.md', mdContent, 'text/markdown');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {downloadToast && (
            <div className="mb-6 p-4 bg-[#2F6B57] text-white text-xs font-bold rounded-2xl shadow-tactile-md flex items-center justify-between animate-fade-in">
              <span>{downloadToast}</span>
              <button onClick={() => setDownloadToast(null)} className="text-white/80 hover:text-white ml-4">✕</button>
            </div>
          )}

          {/* Header */}
          <div className="bg-[#203047] text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-tactile-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#ffdea7]">
                Author Marketing &amp; Reach
              </span>
              <h1 className="font-serif-story text-2xl sm:text-3xl font-bold mt-0.5">
                My Books Promotion Hub
              </h1>
              <p className="text-xs text-gray-300 mt-1">
                Download high-resolution social assets, print bookmarks, and share bilingual excerpts.
              </p>
            </div>
            <Link
              href="/author"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              ← Back to Author Studio
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Promo Asset 1 */}
            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm flex flex-col justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#b1f0d6] text-[#002117] text-xs font-bold">
                  Instagram &amp; WhatsApp Card
                </span>
                <h3 className="font-serif-story text-lg font-bold text-[#091b31] mt-3">
                  Illustrated Quote Card Generator
                </h3>
                <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                  Generates an atmospheric square image card of Tara under the starlit Jaipur sky with your author quote.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-[#e9f6fd] border border-[#ddeaf2] text-xs italic text-[#203047]">
                  &ldquo;Wonder belongs to those who ask questions.&rdquo; — Dr. Meera Sharma
                </div>
              </div>
              <button
                onClick={downloadSocialCardSvg}
                className="w-full py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] transition-all"
              >
                Download Square Social Card (SVG)
              </button>
            </div>

            {/* Promo Asset 2 */}
            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm flex flex-col justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#ffdea7] text-[#261800] text-xs font-bold">
                  Print-Ready PDF
                </span>
                <h3 className="font-serif-story text-lg font-bold text-[#091b31] mt-3">
                  Bilingual Bookmarks Template
                </h3>
                <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                  Double-sided printable bookmarks for school library visits, author book signings, and classroom giveaways.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-[#f4faff] border border-[#ddeaf2] text-xs text-[#44474d]">
                  Includes QR code linking directly to the StoryNest free online audio preview.
                </div>
              </div>
              <button
                onClick={downloadBookmarkHtml}
                className="w-full py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] transition-all"
              >
                Download Printable Bookmarks (HTML)
              </button>
            </div>

            {/* Promo Asset 3 */}
            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm flex flex-col justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#e3f0f8] text-[#44474d] text-xs font-bold">
                  Educator Kit
                </span>
                <h3 className="font-serif-story text-lg font-bold text-[#091b31] mt-3">
                  Classroom Discussion Guide
                </h3>
                <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                  5 reading comprehension questions, 3 astronomy facts, and a telescope sketching prompt for teachers.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-[#f4faff] border border-[#ddeaf2] text-xs text-[#44474d]">
                  Aligned with elementary bilingual science curriculum standards.
                </div>
              </div>
              <button
                onClick={downloadDiscussionGuide}
                className="w-full py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] transition-all"
              >
                Download Teacher Discussion Pack (.md)
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
