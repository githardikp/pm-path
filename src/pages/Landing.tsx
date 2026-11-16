import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ChevronDown,
  Cloud,
  Database,
  FileText,
  Flag,
  GitBranch,
  Layers,
  MessagesSquare,
  Moon,
  Sparkles,
  Sun,
  Target,
  Timer,
  WifiOff,
  Wrench,
  Lock,
  Gift,
  Shapes,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../lib/theme';
import { isEmpty } from '../lib/cloud/decide';
import { cloudEnabled } from '../lib/cloud/config';
import { useSync } from '../lib/cloud/sync';
import { HeroIllustration, PhasePathIllustration, SyncIllustration } from '../components/illustrations';
import { cx } from '../components/ui';
import type { Pastel } from '../data/types';
import { LANDING_STATS } from './landingStats';

const REPO = 'https://github.com/githardikp/pm-path';

/** Adds `is-visible` to `.reveal` elements as they scroll into view. */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return ref;
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);
  useEffect(() => {
    const el = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduced || !('IntersectionObserver' in window)) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / 1100);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref}>{n}</span>;
}

function Section({ id, kicker, title, children, className }: { id?: string; kicker?: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cx('scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24', className)} aria-labelledby={id ? `${id}-h` : undefined}>
      <div className="mx-auto max-w-[1160px]">
        <div className="reveal mb-10 max-w-[720px]">
          {kicker && <p className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-muted">{kicker}</p>}
          <h2 id={id ? `${id}-h` : undefined} className="text-3xl font-bold sm:text-4xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

const TOPICS = [
  'User interviews',
  'Jobs to be done',
  'RICE',
  'North Star metrics',
  'SQL',
  'Funnels',
  'A/B tests',
  'PRDs',
  'APIs',
  'Usability tests',
  'Prompting',
  'RAG',
  'AI agents',
  'LLM evals',
  'AI cost',
  'Responsible AI',
  'Product sense',
  'Estimation',
  'STAR stories',
  'Referrals',
];

const PROBLEMS: {
  problem: string;
  fix: string;
  icon: ReactNode;
  color: Pastel;
}[] = [
  {
    problem: 'Twenty tabs of courses, no order',
    fix: '101 original lessons in the order you need them, with Indian examples, exercises and quizzes.',
    icon: <Layers size={22} aria-hidden />,
    color: 'lavender',
  },
  {
    problem: '“What do I do today?”',
    fix: 'A Today page that turns each day into timed blocks with a checklist, mapped to real dates.',
    icon: <CalendarCheck size={22} aria-hidden />,
    color: 'butter',
  },
  {
    problem: 'Learning with nothing to show',
    fix: 'Every week ends in a portfolio deliverable. You finish with four projects, one a live AI product.',
    icon: <FileText size={22} aria-hidden />,
    color: 'mint',
  },
  {
    problem: 'Paid tools and courses',
    fix: '42 guides for free tools plus 10 practice tools built right into the site. Nothing to buy.',
    icon: <Gift size={22} aria-hidden />,
    color: 'sky',
  },
  {
    problem: 'Interview prep left too late',
    fix: 'Interview practice every day from week 1: 207 questions, a timed mock mode and a story bank.',
    icon: <MessagesSquare size={22} aria-hidden />,
    color: 'pink',
  },
  {
    problem: 'Losing momentum',
    fix: 'Streaks, study-hour tracking, weekly checkpoints and a guided Sunday review keep you honest.',
    icon: <Target size={22} aria-hidden />,
    color: 'peach',
  },
];

const STEPS = [
  {
    t: 'Pick your start date',
    d: 'Every week is pinned to the calendar. Set how many hours a day you can give it.',
    icon: <Flag size={22} aria-hidden />,
    c: 'lavender' as Pastel,
  },
  {
    t: 'Open Today each morning',
    d: 'Learn, practise with tools, build your portfolio, rehearse interviews, then post and apply.',
    icon: <Sun size={22} aria-hidden />,
    c: 'butter' as Pastel,
  },
  {
    t: 'Ship the weekly deliverable',
    d: 'Use the templates and filled examples, then pass the checkpoint before moving on.',
    icon: <Sparkles size={22} aria-hidden />,
    c: 'mint' as Pastel,
  },
  {
    t: 'Review every Sunday',
    d: 'Seven guided questions with your stats filled in automatically. Adjust and go again.',
    icon: <CalendarCheck size={22} aria-hidden />,
    c: 'pink' as Pastel,
  },
];

const PHASES: {
  n: number;
  title: string;
  weeks: string;
  learn: string;
  finish: string;
  color: Pastel;
}[] = [
  {
    n: 1,
    title: 'PM foundations',
    weeks: 'Weeks 1–4',
    learn: 'What PMs do, discovery, strategy, prioritisation, PRDs and launches.',
    finish: 'P1: a full product case, from teardown to PRD and backlog.',
    color: 'lavender',
  },
  {
    n: 2,
    title: 'Data, tech and UX',
    weeks: 'Weeks 5–8',
    learn: 'Metrics, SQL, funnels, A/B tests, APIs and system basics, prototyping and usability tests.',
    finish: 'P2 analytics case, P3 technical teardown, published P1 case study.',
    color: 'sky',
  },
  {
    n: 3,
    title: 'AI product management',
    weeks: 'Weeks 9–11',
    learn: 'How LLMs work, prompting, AI UX, RAG, agents, evals, cost and safety.',
    finish: 'P4: a live AI product used by 20+ real people.',
    color: 'mint',
  },
  {
    n: 4,
    title: 'Getting hired',
    weeks: 'Weeks 12–14+',
    learn: 'Portfolio, resume, LinkedIn, referrals and every interview question type.',
    finish: 'Applications flowing, 10 mocks done, a story for every question.',
    color: 'peach',
  },
];

const DAY = [
  {
    t: 'Learn',
    h: 2.5,
    c: 'lavender' as Pastel,
    d: 'Lessons, exercises, quizzes',
  },
  {
    t: 'Hands-on tools',
    h: 2.25,
    c: 'sky' as Pastel,
    d: 'SQL, RICE, A/B tests, AI tools',
  },
  { t: 'Portfolio', h: 2.5, c: 'mint' as Pastel, d: 'This week’s deliverable' },
  {
    t: 'Interview practice',
    h: 1,
    c: 'pink' as Pastel,
    d: 'Questions or a timed mock',
  },
  {
    t: 'Write-up & apply',
    h: 0.75,
    c: 'butter' as Pastel,
    d: 'Post, outreach, applications',
  },
];

const FEATURES: { t: string; d: string; icon: ReactNode; c: Pastel }[] = [
  {
    t: 'SQL Playground',
    d: 'Real SQLite in your browser, a 7,203-row food-delivery dataset and 40 graded problems.',
    icon: <Database size={22} aria-hidden />,
    c: 'sky',
  },
  {
    t: '10 practice tools',
    d: 'RICE, metrics trees, funnels and retention, A/B tests, estimation, AI cost, eval labeler, prompt lab.',
    icon: <Wrench size={22} aria-hidden />,
    c: 'lavender',
  },
  {
    t: '21 templates',
    d: 'PRD, teardown, AI feature spec, eval sheet, resume, referral message… each with a filled example.',
    icon: <FileText size={22} aria-hidden />,
    c: 'butter',
  },
  {
    t: '51 frameworks',
    d: 'What, when, when not, steps, a worked example and common mistakes for each.',
    icon: <Shapes size={22} aria-hidden />,
    c: 'mint',
  },
  {
    t: 'Interview prep',
    d: '207 questions in 9 categories, a 45-minute timed mock with a rubric, and a STAR story bank.',
    icon: <MessagesSquare size={22} aria-hidden />,
    c: 'pink',
  },
  {
    t: 'Job search board',
    d: 'Track applications, daily outreach and callback rates with and without referrals.',
    icon: <Briefcase size={22} aria-hidden />,
    c: 'peach',
  },
  {
    t: 'Timers and streaks',
    d: 'Time every block, see your hours by day, keep your streak alive.',
    icon: <Timer size={22} aria-hidden />,
    c: 'lavender',
  },
  {
    t: 'Glossary and search',
    d: '277 plain-English terms. Search everything with Ctrl/Cmd + K.',
    icon: <BookOpen size={22} aria-hidden />,
    c: 'sky',
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Is it really free?',
    a: 'Yes. No subscription, no trial, no paywall. Every tool it recommends has a free tier, and the site itself runs on free hosting.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Open it and start. Your progress is saved in your browser. Sign in only if you want the same progress on your phone and laptop.',
  },
  {
    q: 'What if I can’t study 9 hours a day?',
    a: 'Set your daily hours in Settings. The plan is designed around 9 hours, so with fewer hours each week simply takes longer. The order and the deliverables stay the same.',
  },
  {
    q: 'I have no technical background. Is that OK?',
    a: 'Yes. Technical topics (SQL, APIs, how LLMs work) start from zero, in plain English, with worked examples and practice.',
  },
  {
    q: 'Is it only for India?',
    a: 'The lessons use Indian products and examples, and the job-search guide focuses on Bengaluru, but the PM skills, tools and interview prep apply anywhere.',
  },
  {
    q: 'Does it work offline?',
    a: 'Yes. After your first visit everything is cached, including the SQL engine. On a phone, use “Add to Home screen” to install it like an app.',
  },
];

export default function Landing() {
  useTheme();
  const ref = useReveal();
  const data = useStore();
  const returning = !isEmpty(data);
  const theme = useStore((s) => s.settings.theme);
  const updateSettings = useStore((s) => s.updateSettings);
  const user = useSync((s) => s.user);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'PM Path · A free 14-week plan to become a PM or AI PM';
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.title = 'PM Path';
    };
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const primary = returning ? 'Continue where you left off' : 'Start the plan, free';
  const total = DAY.reduce((a, b) => a + b.h, 0);

  return (
    <div ref={ref} className="min-h-screen overflow-x-clip">
      <a href="#main" className="sr-only-focusable nb-btn fixed left-2 top-2 z-50 bg-butter">
        Skip to content
      </a>

      {/* Top bar */}
      <header className={cx('sticky top-0 z-40 border-b-2 transition-colors', scrolled ? 'border-line bg-bg/95 backdrop-blur' : 'border-transparent')}>
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="PM Path home">
            <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden className="transition-transform duration-300 hover:-rotate-6">
              <rect x="4" y="4" width="56" height="56" rx="12" fill="#D9CCF5" stroke="#1E1E24" strokeWidth="4" />
              <path d="M20 44V20h14a8 8 0 0 1 0 16H20" fill="none" stroke="#1E1E24" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display text-lg font-bold">PM Path</span>
          </Link>
          <nav aria-label="Page sections" className="hidden items-center gap-6 font-display text-sm font-semibold md:flex">
            <a href="#how" className="hover:underline hover:decoration-2 hover:underline-offset-4">
              How it works
            </a>
            <a href="#plan" className="hover:underline hover:decoration-2 hover:underline-offset-4">
              The plan
            </a>
            <a href="#features" className="hover:underline hover:decoration-2 hover:underline-offset-4">
              Features
            </a>
            <a href="#faq" className="hover:underline hover:decoration-2 hover:underline-offset-4">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="nb-btn nb-btn-sm" onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
            </button>
            {cloudEnabled && !user && (
              <Link to="/account" className="nb-btn nb-btn-sm hidden sm:inline-flex">
                Sign in
              </Link>
            )}
            <Link to="/dashboard" className="nb-btn nb-btn-sm nb-btn-primary">
              {returning ? 'Open app' : 'Start free'}
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="px-5 pb-10 pt-10 sm:px-8 sm:pt-16" aria-labelledby="hero-h">
          <div className="mx-auto grid max-w-[1160px] items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <div className="pop-in mb-5 flex flex-wrap gap-2">
                <span className="nb-chip bg-mint">
                  <Gift size={13} aria-hidden /> 100% free
                </span>
                <span className="nb-chip bg-butter">
                  <Lock size={13} aria-hidden /> No sign-up needed
                </span>
                <span className="nb-chip bg-sky">
                  <WifiOff size={13} aria-hidden /> Works offline
                </span>
              </div>
              <h1 id="hero-h" className="page-in text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
                Your 14-week path from career switcher to{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">product manager</span>
                  <svg className="absolute -bottom-2 left-0 z-0 h-4 w-full" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden>
                    <path className="ill-draw" d="M4 10 C 60 2, 120 14, 180 7 S 270 4, 296 9" fill="none" stroke="var(--c-pink)" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </span>
                .
              </h1>
              <p className="page-in mt-6 max-w-[56ch] text-lg text-muted" style={{ animationDelay: '80ms' }}>
                PM Path tells you what to do each day, teaches it, gives you the tools to practise it, and tracks your progress until you have a portfolio, a resume and interview practice behind you.
                For APM, PM and AI PM roles.
              </p>
              <div className="page-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: '160ms' }}>
                <Link to={returning ? '/today' : '/dashboard'} className="nb-btn nb-btn-primary group px-5 py-3 text-base">
                  {primary}
                  <ArrowRight size={18} aria-hidden className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <a href="#how" className="nb-btn px-5 py-3 text-base">
                  See how it works
                </a>
              </div>
              {returning && (
                <p className="mt-4 text-sm text-muted">
                  Welcome back. Your progress is saved on this device
                  {user ? ' and synced to your account' : ''}.
                </p>
              )}
            </div>
            <div className="page-in relative" style={{ animationDelay: '120ms' }}>
              <HeroIllustration
                className="mx-auto w-full max-w-[560px]"
                title="The PM Path Today page: a day split into learning, tools, portfolio, interview and outreach blocks, on a path towards an offer"
              />
            </div>
          </div>
        </section>

        {/* Topic marquee */}
        <div className="overflow-hidden border-y-2 border-line bg-butter py-3 text-onpastel" aria-label="Topics covered">
          <div className="marquee flex w-max gap-3">
            {[...TOPICS, ...TOPICS].map((t, i) => (
              <span key={i} className="nb-chip bg-surface text-sm" aria-hidden={i >= TOPICS.length ? true : undefined}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <section className="px-5 py-14 sm:px-8" aria-label="What’s inside, in numbers">
          <dl className="mx-auto grid max-w-[1160px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {LANDING_STATS.map((s, i) => (
              <div key={s.label} className={cx('reveal nb-card lift p-4 text-center', `bg-${s.color}`, i % 3 === 1 && 'reveal-delay-1', i % 3 === 2 && 'reveal-delay-2')}>
                <dt className="font-display text-sm font-semibold">{s.label}</dt>
                <dd className="font-display text-4xl font-bold">
                  <CountUp to={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Problems */}
        <Section id="why" kicker="Why PM Path" title="Built for the walls every career switcher hits">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map((p, i) => (
              <article key={p.problem} className={cx('reveal nb-card lift flex flex-col gap-3 p-6', `reveal-delay-${i % 3}`)}>
                <span className={cx('grid h-11 w-11 place-items-center rounded-[10px] border-2 border-line', `bg-${p.color}`)}>{p.icon}</span>
                <h3 className="text-lg font-bold">
                  <span className="text-muted line-through decoration-2">{p.problem}</span>
                </h3>
                <p>{p.fix}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* How it works */}
        <Section id="how" kicker="How it works" title="Four habits, repeated for 14 weeks" className="bg-surface">
          <ol className="relative grid gap-5 md:grid-cols-4">
            <svg className="absolute left-0 right-0 top-[38px] hidden h-4 w-full md:block" viewBox="0 0 1000 16" preserveAspectRatio="none" aria-hidden>
              <path className="ill-dash" d="M60 8 H940" stroke="var(--c-line)" strokeWidth="3" strokeDasharray="10 10" fill="none" />
            </svg>
            {STEPS.map((s, i) => (
              <li key={s.t} className={cx('reveal relative', `reveal-delay-${i}`)}>
                <div
                  className={cx(
                    'relative z-10 mb-4 grid h-[76px] w-[76px] place-items-center rounded-full border-2 border-line shadow-[3px_3px_0_var(--c-line)] transition-transform duration-300 hover:-rotate-6 hover:scale-105',
                    `bg-${s.c}`,
                  )}
                >
                  {s.icon}
                  <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full border-2 border-line bg-surface font-display text-sm font-bold text-ink">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold">{s.t}</h3>
                <p className="mt-1 text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* The plan */}
        <Section id="plan" kicker="The plan" title="Four phases. Four portfolio projects. One offer.">
          <div className="reveal mb-8">
            <PhasePathIllustration className="mx-auto w-full max-w-[760px]" />
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PHASES.map((p, i) => (
              <article key={p.n} className={cx('reveal nb-card lift flex flex-col gap-3 p-5', `bg-${p.color}`, `reveal-delay-${i}`)}>
                <div className="flex items-center justify-between">
                  <span className="nb-chip bg-surface">Phase {p.n}</span>
                  <span className="font-display text-sm font-semibold">{p.weeks}</span>
                </div>
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="text-sm">{p.learn}</p>
                <p className="mt-auto rounded-[8px] border-2 border-line bg-surface p-3 text-sm">
                  <strong>You finish with:</strong> {p.finish}
                </p>
              </article>
            ))}
          </div>
        </Section>

        {/* A day */}
        <Section id="day" kicker="A day in PM Path" title="Every day has a shape" className="bg-surface">
          <div className="reveal nb-card p-5 sm:p-8">
            <div className="flex h-14 overflow-hidden rounded-[10px] border-2 border-line" aria-hidden>
              {DAY.map((b, i) => (
                <div
                  key={b.t}
                  className={cx('day-bar grid place-items-center border-r-2 border-line font-display text-xs font-bold last:border-r-0 sm:text-sm', `bg-${b.c}`)}
                  style={{
                    width: `${(b.h / total) * 100}%`,
                    animationDelay: `${i * 120}ms`,
                  }}
                >
                  <span className="hidden truncate px-1 sm:block">{b.t}</span>
                </div>
              ))}
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {DAY.map((b) => (
                <li key={b.t} className="flex gap-3">
                  <span className={cx('mt-1 h-4 w-4 flex-none rounded-[4px] border-2 border-line', `bg-${b.c}`)} aria-hidden />
                  <div>
                    <p className="font-display font-bold">
                      {b.t} <span className="font-normal text-muted">· {b.h} h</span>
                    </p>
                    <p className="text-sm text-muted">{b.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              Each block has a timer and a checklist. Your hours feed the Dashboard chart, and the day ends with a three-question reflection. Sunday is a one-hour review.
            </p>
          </div>
        </Section>

        {/* Features */}
        <Section id="features" kicker="What’s inside" title="Practise, don’t just read">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <article key={f.t} className={cx('reveal nb-card lift group p-5', `reveal-delay-${i % 4}`)}>
                <span
                  className={cx(
                    'mb-3 grid h-11 w-11 place-items-center rounded-[10px] border-2 border-line transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110',
                    `bg-${f.c}`,
                  )}
                >
                  {f.icon}
                </span>
                <h3 className="text-lg font-bold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted">{f.d}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* Sync and privacy */}
        <Section id="sync" kicker="Your data" title="Your progress, on every device. Private by default." className="bg-surface">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="reveal">
              <SyncIllustration className="mx-auto w-full max-w-[460px]" />
            </div>
            <ul className="space-y-5">
              {[
                {
                  i: <Lock size={20} aria-hidden />,
                  t: 'No account needed',
                  d: 'Progress is saved in your browser from the first click. Nothing to sign up for.',
                  c: 'butter' as Pastel,
                },
                {
                  i: <Cloud size={20} aria-hidden />,
                  t: 'Optional sign-in to sync',
                  d: cloudEnabled
                    ? 'Sign in with Google or an email link to keep your laptop and phone in step. Only you can read your data.'
                    : 'Move progress between devices with a one-click JSON export and import.',
                  c: 'sky' as Pastel,
                },
                {
                  i: <WifiOff size={20} aria-hidden />,
                  t: 'Works offline',
                  d: 'Everything is cached after your first visit, including the SQL engine. Changes sync when you’re back online.',
                  c: 'mint' as Pastel,
                },
              ].map((x, i) => (
                <li key={x.t} className={cx('reveal flex gap-4', `reveal-delay-${i + 1}`)}>
                  <span className={cx('grid h-11 w-11 flex-none place-items-center rounded-[10px] border-2 border-line', `bg-${x.c}`)}>{x.i}</span>
                  <div>
                    <h3 className="text-lg font-bold">{x.t}</h3>
                    <p className="text-muted">{x.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" kicker="FAQ" title="Questions people ask">
          <div className="mx-auto max-w-[820px] space-y-3">
            {FAQ.map((f, i) => (
              <details key={f.q} className={cx('reveal nb-card faq group p-0', `reveal-delay-${i % 3}`)}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg font-bold">
                  {f.q}
                  <ChevronDown size={20} aria-hidden className="flex-none transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="faq-body px-5 pb-5 text-muted">{f.a}</div>
              </details>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <section className="px-5 pb-20 sm:px-8" aria-labelledby="cta-h">
          <div className="reveal nb-card relative mx-auto max-w-[1160px] overflow-hidden bg-lavender p-8 text-center sm:p-14">
            <svg className="ill-float pointer-events-none absolute -left-6 -top-6 h-28 w-28 opacity-70" viewBox="0 0 100 100" aria-hidden>
              <circle cx="50" cy="50" r="40" fill="var(--c-butter)" stroke="#1e1e24" strokeWidth="3" />
            </svg>
            <svg className="ill-bob pointer-events-none absolute -bottom-8 -right-4 h-32 w-32 opacity-70" viewBox="0 0 100 100" aria-hidden>
              <rect x="14" y="14" width="72" height="72" rx="14" fill="var(--c-pink)" stroke="#1e1e24" strokeWidth="3" transform="rotate(14 50 50)" />
            </svg>
            <h2 id="cta-h" className="relative text-3xl font-bold sm:text-5xl">
              Week 1 starts whenever you do.
            </h2>
            <p className="relative mx-auto mt-4 max-w-[52ch] text-lg">Open the plan, set your start date, and do today’s first block. It takes two minutes to begin.</p>
            <Link to={returning ? '/today' : '/dashboard'} className="nb-btn nb-btn-primary group relative mt-8 bg-surface px-6 py-3 text-base">
              {primary}
              <ArrowRight size={18} aria-hidden className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-line px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <p>PM Path · free and open source · progress stays yours.</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-5 font-display font-semibold">
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/roadmap" className="hover:underline">
              Roadmap
            </Link>
            <Link to="/toolkit" className="hover:underline">
              Toolkit
            </Link>
            {cloudEnabled && (
              <Link to="/account" className="hover:underline">
                Account
              </Link>
            )}
            <a href={REPO} className="inline-flex items-center gap-1 hover:underline" rel="noopener">
              <GitBranch size={15} aria-hidden /> Source
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
