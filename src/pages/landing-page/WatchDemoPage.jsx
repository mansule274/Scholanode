import { ArrowLeft, ArrowRight, CheckCircle2, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const demoVideos = [
  {
    title: 'A calmer school dashboard',
    description: 'See how administrators get a clean view of setup progress, people and daily work.',
    category: 'Overview',
    duration: '03:42',
    videoId: 'ysz5S6PUM-U',
  },
  {
    title: 'Set up your academic structure',
    description: 'Walk through sessions, terms, classes, arms and subjects in one guided workspace.',
    category: 'Academic setup',
    duration: '04:18',
    videoId: 'aqz-KE-bpKQ',
  },
  {
    title: 'School profiles that feel like yours',
    description: 'Learn how to shape your school identity, portal messaging and support contacts.',
    category: 'School profile',
    duration: '02:56',
    videoId: 'ScMz IvxBSi4'.replace(' ', ''),
  },
  {
    title: 'A better experience for every user',
    description: 'Explore the simple path from school discovery to secure student and staff access.',
    category: 'Access and support',
    duration: '03:27',
    videoId: 'M7lc1UVf-VE',
  },
];

export default function WatchDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#071A52] text-white">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-40 border-cyan-300/10" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-white"><ArrowLeft size={17} /> Back home</Link>
          <div className="mt-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200"><Play size={14} fill="currentColor" /> Product tour</div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">See ScholaNode in motion.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">A short collection of walkthroughs for the people who keep a school moving. These are preview videos for now and can be replaced with your final YouTube links later.</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm font-semibold text-blue-100"><span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-cyan-300" /> Four focused walkthroughs</span><span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-cyan-300" /> Built for school teams</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Watch the tour</p><h2 className="mt-1 text-2xl font-extrabold text-[#071A52] sm:text-3xl">Start with what matters to you</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">Each walkthrough is intentionally short, so teams can find the answer they need without sitting through a long presentation.</p></div>
        <div className="grid gap-6 md:grid-cols-2">
          {demoVideos.map((video) => <article key={video.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="relative aspect-video bg-[#071A52]"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${video.videoId}`} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><span className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-black/75 px-2 py-1 text-xs font-bold text-white">{video.duration}</span></div><div className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#071A52]">{video.category}</span><Play size={17} className="text-cyan-600" /></div><h3 className="mt-4 text-xl font-extrabold text-[#071A52]">{video.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{video.description}</p></div></article>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8"><div className="flex flex-col gap-5 rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><Sparkles size={23} /></div><div><h2 className="text-xl font-extrabold text-[#071A52]">Ready to see your school in it?</h2><p className="mt-1 text-sm leading-6 text-slate-500">Create a workspace and start with the essentials.</p></div></div><Link to="/get-started" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463]">Start free trial <ArrowRight size={17} /></Link></div></section>
    </main>
  );
}
