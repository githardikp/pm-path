import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Moon, Sun, GitBranch } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../lib/theme';
import { isEmpty } from '../lib/cloud/decide';
import { cloudEnabled } from '../lib/cloud/config';
import { useSync } from '../lib/cloud/sync';
import { currentWeekNumber } from '../lib/progress';
import { WorldMap, WORLDS, SyncIllustration } from '../components/illustrations';
import { Sprite, LOGO, SCROLL, CHAT, CHEST, CALENDAR, GLASS, COIN, HEART, FLAME, TROPHY, FLAG, LAPTOP, type Art } from '../components/pixel';
import { cx } from '../components/ui';
import type { Pastel } from '../data/types';
import { LANDING_STATS } from './landingStats';

const REPO = 'https://github.com/githardikp/pm-path';

function Section({ id, title, intro, children, className }: { id: string; title: ReactNode; intro?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cx('scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24', className)} aria-labelledby={`${id}-h`}>
      <div className="mx-auto max-w-[1160px]">
        <div className="mb-10 max-w-[680px]">
          <h2 id={`${id}-h`} className="text-3xl sm:text-4xl">
            {title}
          </h2>
          {intro && <p className="mt-3 text-lg text-muted">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

const STAT_ART: Record<string, Art> = {
  Lessons: SCROLL,
  'Tool guides': LAPTOP,
  'Practice tools': CHEST,
  Templates: CALENDAR,
  Frameworks: GLASS,
  'Interview questions': CHAT,
};

const DAY = [
  { t: 'Learn', h: 2.5, c: 'lavender' as Pastel, d: 'Lessons, exercises, quizzes' },
  { t: 'Practise', h: 2.25, c: 'sky' as Pastel, d: 'SQL, RICE, A/B tests, AI tools' },
  { t: 'Build', h: 2.5, c: 'mint' as Pastel, d: 'This week’s portfolio piece' },
  { t: 'Interview', h: 1, c: 'pink' as Pastel, d: 'Questions or a timed mock' },
  { t: 'Apply', h: 0.75, c: 'butter' as Pastel, d: 'Post, outreach, applications' },
];

const WORLD_TITLES = ['PM foundations', 'Data, tech and UX', 'AI product management', 'Getting hired'];
const WORLD_INFO = [
  { learn: 'What PMs do, discovery, strategy, prioritisation, PRDs and launches.', finish: 'A full product case, from teardown to PRD and backlog.' },
  { learn: 'Metrics, SQL, funnels, A/B tests, APIs and system basics, prototypes and usability tests.', finish: 'An analytics case, a technical teardown and a published case study.' },
  { learn: 'How LLMs work, prompting, AI UX, RAG, agents, evals, cost and safety.', finish: 'A live AI product used by 20+ real people.' },
  { learn: 'Portfolio, resume, LinkedIn, referrals and every interview question type.', finish: 'Applications going out, 10 mock interviews, a story for every question.' },
];
const WORLD_COLOR: Pastel[] = ['lavender', 'sky', 'mint', 'peach'];

const STEPS: { t: string; d: string; art: Art }[] = [
  { t: 'Set your start date', d: 'Every week is pinned to the calendar. Tell it how many hours a day you have.', art: FLAG },
  { t: 'Open Today each morning', d: 'Your day is split into blocks with a timer and a checklist. Do them in order.', art: CALENDAR },
  { t: 'Finish the week’s build', d: 'Use the templates and filled examples, then pass the checkpoint before the next week.', art: CHEST },
  { t: 'Review on Sunday', d: 'Seven questions, with your stats filled in for you. Adjust, then start the next week.', art: TROPHY },
];

const PROBLEMS: { problem: string; fix: string; art: Art }[] = [
  { problem: 'Twenty tabs of courses and no order', fix: '101 original lessons in the order you need them, with Indian examples, exercises and quizzes.', art: SCROLL },
  { problem: '“What do I do today?”', fix: 'The Today page turns every day into timed blocks, mapped to real dates.', art: CALENDAR },
  { problem: 'Studying with nothing to show', fix: 'Every week ends with a portfolio piece. You finish with four projects, one of them a live AI product.', art: CHEST },
  { problem: 'Paid courses and tools', fix: '42 guides for free tools and 10 practice tools built into the site. Nothing to buy.', art: COIN },
  { problem: 'Interview prep left too late', fix: 'Interview practice every day from week 1: 207 questions, timed mocks and a story bank.', art: CHAT },
  { problem: 'Losing momentum', fix: 'A streak, hours studied, weekly checkpoints and a Sunday review keep you honest.', art: FLAME },
];

const FAQ: { q: string; a: ReactNode }[] = [
  { q: 'Is it really free?', a: 'Yes. No subscription, no trial, no paywall. Every tool it recommends has a free tier, and the site itself runs on free hosting.' },
  { q: 'Do I need an account?', a: 'No. Open it and start: progress is saved in your browser. Sign in only if you want the same progress on your phone and laptop.' },
  { q: 'What if I can’t study 9 hours a day?', a: 'Set your daily hours in Settings. The plan is built around 9 hours, so with fewer hours each week takes longer. The order and the portfolio pieces stay the same.' },
  { q: 'I don’t have a technical background. Is that OK?', a: 'Yes. SQL, APIs and how LLMs work all start from zero, in plain English, with worked examples and practice.' },
  { q: 'Which backgrounds is it for?', a: 'Anyone moving into product: engineers, analysts, designers, support and customer success, consultants, marketers and recent graduates. The career lessons show how to turn your background into a strength.' },
  { q: 'Is it only for India?', a: 'The examples use Indian products and the job-search guide covers Bengaluru, but the skills, tools and interview prep apply anywhere.' },
  { q: 'Does it work offline?', a: 'Yes. After your first visit everything is cached, including the SQL engine. On a phone, use “Add to Home screen” to install it like an app.' },
];

export default function Landing() {
  useTheme();
  const data = useStore();
  const returning = !isEmpty(data);
  const theme = useStore((s) => s.settings.theme);
  const updateSettings = useStore((s) => s.updateSettings);
  const user = useSync((s) => s.user);
  const [scrolled, setScrolled] = useState(false);
  const week = Math.max(1, currentWeekNumber(data.settings.startDate));

  useEffect(() => {
    document.title = 'PM Path · A free 14-week plan to become a PM or AI PM';
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.title = 'PM Path';
    };
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const startTo = returning ? '/today' : '/dashboard';
  const startLabel = returning ? `Continue week ${week >= 15 ? '15+' : week}` : 'Start week 1';
  const total = DAY.reduce((a, b) => a + b.h, 0);

  return (
    <div className="min-h-screen overflow-x-clip">
      <a href="#main" className="sr-only-focusable nb-btn fixed left-2 top-2 z-50 bg-butter">
        Skip to content
      </a>

      <header className={cx('sticky top-0 z-40', scrolled && 'bg-bg/95 shadow-[0_3px_0_var(--c-line)] backdrop-blur')}>
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="PM Path home">
            <Sprite art={LOGO} scale={3} />
            <span className="font-display text-xl font-bold">PM Path</span>
          </Link>
          <nav aria-label="Page sections" className="hidden items-center gap-6 font-display text-base md:flex">
            <a href="#plan" className="hover:underline hover:decoration-[3px] hover:underline-offset-4">
              The plan
            </a>
            <a href="#day" className="hover:underline hover:decoration-[3px] hover:underline-offset-4">
              A day
            </a>
            <a href="#inside" className="hover:underline hover:decoration-[3px] hover:underline-offset-4">
              Why it works
            </a>
            <a href="#faq" className="hover:underline hover:decoration-[3px] hover:underline-offset-4">
              Questions
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="nb-btn nb-btn-sm" onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
            </button>
            {cloudEnabled && !user && (
              <Link to="/account" className="nb-btn nb-btn-sm hidden sm:inline-flex">
                Sign in
              </Link>
            )}
            <Link to={startTo} className="nb-btn nb-btn-sm nb-btn-primary">
              {returning ? 'Open app' : 'Start free'}
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="px-5 pt-10 sm:px-8 sm:pt-16" aria-labelledby="hero-h">
          <div className="mx-auto max-w-[1160px]">
            <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
              <h1 id="hero-h" className="text-[2.6rem] font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
                From career switcher to product manager in 14 weeks.
              </h1>
              <div>
                <p className="text-lg text-muted">A free, day-by-day plan for APM, PM and AI PM roles. It teaches each skill, gives you tools to practise it, and tracks you until you have a portfolio and an offer.</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to={startTo} className="nb-btn nb-btn-primary px-6 py-3.5 text-lg">
                    {startLabel}
                  </Link>
                  <a href="#plan" className="nb-btn px-6 py-3.5 text-lg">
                    See the plan
                  </a>
                </div>
                <ul className="mt-7 flex flex-wrap gap-3 text-sm" aria-label="Highlights">
                  <li className="nb-chip bg-mint">
                    <Sprite art={COIN} scale={2} /> Free
                  </li>
                  <li className="nb-chip bg-sky">
                    <Sprite art={HEART} scale={2} /> No sign-up needed
                  </li>
                  <li className="nb-chip bg-lavender">
                    <Sprite art={FLAME} scale={2} /> Works offline
                  </li>
                </ul>
              </div>
            </div>

            <div className="nb-card mt-12 p-3 sm:p-5">
              <WorldMap
                heroWeek={returning ? week : 15}
                className="block w-full"
                title={returning ? `The PM Path map: four phases from week 1 to an offer. You are on week ${week}.` : 'The PM Path map: four phases on a path from week 1 to an offer.'}
              />
            </div>
            <ol className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 font-display text-sm sm:hidden" aria-label="The four phases">
              {WORLDS.map((w) => (
                <li key={w.n} className="flex items-center gap-2">
                  <span className={cx('inline-block h-3 w-3', `bg-${WORLD_COLOR[w.n - 1]}`)} style={{ boxShadow: '0 0 0 2px var(--c-line)' }} aria-hidden />
                  {w.n}. {w.name}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 pb-6 pt-16 sm:px-8" aria-labelledby="inv-h">
          <div className="mx-auto max-w-[1160px]">
            <h2 id="inv-h" className="sr-only">
              What’s included
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {LANDING_STATS.map((s) => (
                <div key={s.label} className="relative flex min-h-12 flex-col-reverse justify-center pl-16">
                  <dt className="mt-1 text-sm text-muted">{s.label}</dt>
                  <dd className="font-display text-3xl font-bold leading-none">
                    <Sprite art={STAT_ART[s.label]} scale={3} className="absolute left-0 top-1/2 -translate-y-1/2" />
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Section id="plan" title="Four phases. Fourteen weeks. One offer." intro="Each week ends with a checkpoint. Each phase ends with a portfolio project you can show in interviews.">
          <ol className="grid gap-8 md:grid-cols-2">
            {WORLDS.map((w, i) => (
              <li key={w.n} className={cx('nb-card p-6', `bg-${WORLD_COLOR[i]}`)}>
                <p className="font-display text-sm">
                  Phase {w.n}, weeks {w.n === 4 ? '12–14, then 15+' : `${w.weeks[0]}–${w.weeks[1]}`}
                </p>
                <h3 className="mt-1 text-2xl font-bold">{WORLD_TITLES[i]}</h3>
                <p className="mt-3">{WORLD_INFO[i].learn}</p>
                <p className="mt-4 bg-surface p-3 text-sm text-ink" style={{ boxShadow: '0 0 0 2px var(--c-line)' }}>
                  <strong className="font-display font-semibold">You finish with:</strong> {WORLD_INFO[i].finish}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="day" title="Every day has the same shape" intro="Five blocks, each with a timer and a checklist. Your hours feed your stats. Sunday is a one-hour review." className="bg-surface/70">
          <div className="nb-card p-5 sm:p-8">
            <div className="flex h-16" style={{ boxShadow: '0 0 0 3px var(--c-line)' }} aria-hidden>
              {DAY.map((b) => (
                <div key={b.t} className={cx('day-bar grid place-items-center font-display text-sm font-semibold text-onpastel', `bg-${b.c}`)} style={{ width: `${(b.h / total) * 100}%`, boxShadow: 'inset -3px 0 0 var(--c-line)' }}>
                  <span className="hidden px-1 sm:block">{b.t}</span>
                </div>
              ))}
            </div>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {DAY.map((b) => (
                <li key={b.t} className="flex gap-3">
                  <span className={cx('mt-1.5 h-4 w-4 flex-none', `bg-${b.c}`)} style={{ boxShadow: '0 0 0 2px var(--c-line)' }} aria-hidden />
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {b.t} <span className="text-base font-normal text-muted">{b.h} h</span>
                    </p>
                    <p className="text-sm text-muted">{b.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="how" title="How it works">
          <ol className="grid gap-10 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.t}>
                <div className="flex items-end gap-3">
                  <Sprite art={s.art} scale={4} />
                  <span className="font-display text-5xl font-bold leading-none text-muted/60" aria-hidden>
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold">{s.t}</h3>
                <p className="mt-1 text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="inside" title="Built for the walls every career switcher hits" className="bg-surface/70">
          <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            {PROBLEMS.map((p) => (
              <li key={p.problem} className="flex gap-5">
                <Sprite art={p.art} scale={4} className="flex-none" />
                <div>
                  <h3 className="text-xl font-bold">{p.problem}</h3>
                  <p className="mt-1 text-muted">{p.fix}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="sync" title="Your progress, on every device" intro="No account needed: progress is saved in your browser from the first click.">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="nb-card bg-lavender p-6">
              <SyncIllustration className="mx-auto block w-full max-w-[440px]" />
            </div>
            <ul className="space-y-6 text-lg">
              <li>
                <h3 className="text-xl font-bold">Sign in only if you want to</h3>
                <p className="text-muted">{cloudEnabled ? 'Use Google or an email link to keep your laptop and phone in step. Only you can read your progress.' : 'Move progress between devices with a one-click export and import.'}</p>
              </li>
              <li>
                <h3 className="text-xl font-bold">Works offline</h3>
                <p className="text-muted">Everything is cached after your first visit, including the SQL engine. Changes sync when you’re back online.</p>
              </li>
              <li>
                <h3 className="text-xl font-bold">No ads, no tracking</h3>
                <p className="text-muted">There are no analytics scripts. Your API key for the optional Prompt Lab never leaves your device.</p>
              </li>
            </ul>
          </div>
        </Section>

        <Section id="faq" title="Questions" className="bg-surface/70">
          <div className="max-w-[820px] space-y-5">
            {FAQ.map((f) => (
              <details key={f.q} className="nb-card faq group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg font-semibold">
                  {f.q}
                  <ChevronDown size={20} aria-hidden className="flex-none group-open:rotate-180" />
                </summary>
                <div className="faq-body px-5 pb-5 text-muted">{f.a}</div>
              </details>
            ))}
          </div>
        </Section>

        <section className="px-5 py-20 sm:px-8" aria-labelledby="cta-h">
          <div className="nb-card mx-auto flex max-w-[1160px] flex-col items-start gap-6 bg-butter p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <div className="flex items-center gap-5">
              <Sprite art={TROPHY} scale={5} className="hidden flex-none sm:block" />
              <div>
                <h2 id="cta-h" className="text-3xl font-bold sm:text-4xl">
                  Week 1 starts when you do.
                </h2>
                <p className="mt-2 text-lg">Set your start date and do today’s first block. It takes two minutes.</p>
              </div>
            </div>
            <Link to={startTo} className="nb-btn bg-surface px-6 py-3.5 text-lg">
              {startLabel}
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-5 py-8 sm:px-8" style={{ boxShadow: '0 -3px 0 var(--c-line)' }}>
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <p className="flex items-center gap-2">
            <Sprite art={LOGO} scale={2} /> PM Path is free and open source. Your progress stays yours.
          </p>
          <nav aria-label="Footer" className="flex flex-wrap gap-5 font-display">
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
