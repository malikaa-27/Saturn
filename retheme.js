const fs = require('fs');
const path = require('path');

const files = [
  'components/controls/BottomBar.tsx',
  'components/transcript/TranscriptPanel.tsx',
  'components/insights/InsightPanel.tsx',
  'components/insights/MeetingSummaryModal.tsx',
  'components/timeline/TopicTimeline.tsx',
];

const replacers = [
  [/bg-black\/40/g, 'bg-white/70'],
  [/border-white\/\[0\.06\]/g, 'border-slate-200'],
  [/bg-white\/10/g, 'bg-slate-200'],
  [/bg-white\/5/g, 'bg-slate-100'],
  [/text-amber-300/g, 'text-amber-700'],
  [/text-white\/40/g, 'text-slate-400'],
  [/text-white\/50/g, 'text-slate-500'],
  [/text-white\/60/g, 'text-slate-500'],
  [/text-white\/70/g, 'text-slate-600'],
  [/text-white\/80/g, 'text-slate-700'],
  [/text-white\/90/g, 'text-slate-800'],
  [/text-white/g, 'text-slate-900'],
  [/bg-zinc-900/g, 'bg-slate-50'],
  [/bg-zinc-800\/50/g, 'bg-white/60'],
  [/bg-zinc-800/g, 'bg-white'],
  [/bg-zinc-950\/50/g, 'bg-slate-50/50'],
  [/bg-zinc-950\/80/g, 'bg-slate-50/80'],
  [/from-zinc-950/g, 'from-slate-50'],
  [/to-zinc-950/g, 'to-slate-50'],
  [/border-white\/10/g, 'border-slate-200'],
  [/border-white\/\[0\.08\]/g, 'border-slate-200'],
  [/border-white\/\[0\.05\]/g, 'border-slate-200'],
  [/bg-white\/\[0\.04\]/g, 'bg-white'],
  [/bg-white\/\[0\.03\]/g, 'bg-white'],
  [/bg-white\/\[0\.02\]/g, 'bg-slate-50'],
  [/hover:bg-white\/10/g, 'hover:bg-slate-100'],
  [/hover:bg-white\/5/g, 'hover:bg-slate-50'],
  [/hover:bg-white\/\[0\.08\]/g, 'hover:bg-slate-100'],
  [/hover:text-white/g, 'hover:text-slate-900'],
  [/shadow-black\/50/g, 'shadow-slate-200/50'],
  [/shadow-black\/20/g, 'shadow-slate-200'],
  [/shadow-black/g, 'shadow-slate-200'],
  [/data-\[state=active\]:bg-white\/10/g, 'data-[state=active]:bg-slate-200'],
  [/data-\[state=active\]:text-white/g, 'data-[state=active]:text-slate-900'],
];

files.forEach(f => {
  const p = path.join(__dirname, f);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf-8');
  replacers.forEach(([re, rep]) => {
    content = content.replace(re, rep);
  });
  
  // Fixes for buttons that need actual white text back
  // Violet primary buttons
  content = content.replace(/bg-violet-600(.*?)text-slate-900/g, 'bg-violet-600$1text-white');
  // Red destructive buttons/badges
  content = content.replace(/bg-red-500(.*?)text-slate-900/g, 'bg-red-500$1text-white');
  // Emerald badges
  content = content.replace(/bg-emerald-500(.*?)text-slate-900/g, 'bg-emerald-500$1text-white');
  
  // Specific fallback for "text-slate-900" inside already dark things
  content = content.replace(/className="(.*?)text-slate-900/g, (match, prefix) => {
      if (prefix.includes('bg-violet') || prefix.includes('bg-slate-900')) {
          return match.replace('text-slate-900', 'text-white');
      }
      return match;
  });

  fs.writeFileSync(p, content);
  console.log(`Updated ${f}`);
});