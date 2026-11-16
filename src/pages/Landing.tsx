import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Moon, Sun, GitBranch } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../lib/theme';
import { isEmpty } from '../lib/cloud/decide';
import { cloudEnabled } from '../lib/cloud/config';
import { useSync } from '../lib/cloud/sync';
import { currentWeekNumber } from '../lib/progress';
import { WorldMap, WORLDS } from '../components/illustrations';
import { Sprite, LOGO, SCROLL, CHAT, CHEST, CALENDAR, TROPHY, FLAG, type Art } from '../components/pixel';
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
  'Practice tools': CHEST,
  Templates: CALENDAR,
  'Interview questions': CHAT,
};
const SHOWN_STATS = LANDING_STATS.filter((x) => x.label in STAT_ART);

const PHASE_INFO: { title: string; weeks: string; learn: string; finish: string; color: Pastel }[] = [
  { title: 'PM foundations', weeks: 'Weeks 1–4', learn: 'Discovery, strategy, prioritisation and PRDs.', finish: 'a full product case', color: 'lavender' },
  { title: 'Data, tech and UX', weeks: 'Weeks 5–8', learn: 'Metrics, SQL, A/B tests, APIs and usability tests.', finish: 'an analytics case and a technical teardown', color: 'sky' },
  { title: 'AI product management', weeks: 'Weeks 9–11', learn: 'LLMs, prompting, RAG, agents, evals, cost and safety.', finish: 'a live AI product with real users', color: 'mint' },
  { title: 'Getting hired', weeks: 'Weeks 12–14, then 15+', learn: 'Portfolio, resume, referrals and interview practice.', finish: 'applications, mock interviews and offers', color: 'peach' },
];

const STEPS: { t: string; d: string; art: Art }[] = [
  { t: 'Set your start date', d: 'Every week is pinned to your calendar, so you always know where you are.', art: FLAG },
  { t: 'Do today’s tasks', d: 'A short list of lessons and practice. Tick them off at your own pace.', art: CALENDAR },
  { t: 'Ship the week’s build', d: 'Templates with filled examples help you finish, then a quick checkpoint unlocks the next week.', art: CHEST },
];

const FAQ: { q: string; a: ReactNode }[] = [
  { q: 'Is it really free?', a: 'Yes. No subscription, no trial, no paywall. Every tool it recommends has a free tier.' },
  { q: 'Do I need an account?', a: 'No. Progress is saved in your browser and works offline. Sign in only if you want the same progress on your phone and laptop.' },
  { q: 'How much time does it take?', a: 'The plan is built around full-time study, about 9 hours a day. With less time, take longer over each week. The order and the projects stay the same.' },
  { q: 'Who is it for?', a: 'Anyone moving into product, with or without a technical background. Technical topics start from zero, in plain English.' },
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
            <a href="#how" className="hover:underline hover:decoration-[3px] hover:underline-offset-4">
              How it works
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
        <section className="px-5 pt-12 sm:px-8 sm:pt-20" aria-labelledby="hero-h">
          <div className="mx-auto max-w-[1160px]">
            <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
              <h1 id="hero-h" className="text-[2.6rem] font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
                From career switcher to product manager in 14 weeks.
              </h1>
              <div>
                <p className="text-lg text-muted">A free, day-by-day plan for APM, PM and AI PM roles. Learn each skill, practise it, and build a portfolio as you go.</p>
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <Link to={startTo} className="nb-btn nb-btn-primary px-6 py-3.5 text-lg">
                    {startLabel}
                  </Link>
                  <a href="#plan" className="font-display text-lg underline decoration-[3px] underline-offset-4 hover:decoration-[5px]">
                    See the plan
                  </a>
                </div>
                <p className="mt-5 text-sm text-muted">Free. No sign-up. Works offline.</p>
              </div>
            </div>

            <div className="nb-card mt-14 p-3 sm:p-5">
              <WorldMap
                loop={!returning}
                heroWeek={returning ? week : 15}
                className="block w-full"
                title={returning ? `The PM Path map. You and your pet are on week ${week}.` : 'The PM Path map: an adventurer and their pet walk four phases, collecting coins, to the Offer castle.'}
              />
            </div>
            <ol className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 font-display text-sm sm:hidden" aria-label="The four phases">
              {WORLDS.map((w) => (
                <li key={w.n} className="flex items-center gap-2">
                  <span className={cx('inline-block h-3 w-3', `bg-${PHASE_INFO[w.n - 1].color}`)} style={{ boxShadow: '0 0 0 2px var(--c-line)' }} aria-hidden />
                  {w.n}. {w.name}
                </li>
              ))}
            </ol>

            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4" aria-label="What’s included">
              {SHOWN_STATS.map((x) => (
                <div key={x.label} className="group relative flex min-h-12 flex-col-reverse justify-center pl-16">
                  <dt className="mt-1 text-sm text-muted">{x.label}</dt>
                  <dd className="font-display text-3xl font-bold leading-none">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2">
                      <Sprite art={STAT_ART[x.label]} scale={3} className="hover-hop block" />
                    </span>
                    {x.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Section id="plan" title="Four phases. One offer." intro="Each phase ends with a portfolio project you can show in interviews.">
          <ol className="nb-card grid md:grid-cols-2 lg:grid-cols-4">
            {PHASE_INFO.map((ph, i) => (
              <li key={ph.title} className="phase-col group p-6" style={{ boxShadow: i ? 'inset 3px 0 0 var(--c-line)' : undefined }}>
                <span className={cx('phase-bar mb-5 block h-3', `bg-${ph.color}`)} style={{ boxShadow: '0 0 0 2px var(--c-line)' }} aria-hidden />
                <p className="font-display text-sm text-muted">{ph.weeks}</p>
                <h3 className="mt-1 text-xl font-bold">{ph.title}</h3>
                <p className="mt-2 text-sm">{ph.learn}</p>
                <p className="mt-3 text-sm text-muted">You finish with {ph.finish}.</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="how" title="How it works">
          <ol className="grid gap-10 md:grid-cols-3">
            {STEPS.map((x, i) => (
              <li key={x.t} className="group">
                <div className="flex items-end gap-3">
                  <Sprite art={x.art} scale={4} className="hover-hop" />
                  <span className="font-display text-5xl font-bold leading-none text-muted/50" aria-hidden>
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold">{x.t}</h3>
                <p className="mt-1 text-muted">{x.d}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="faq" title="Questions">
          <div className="max-w-[760px] space-y-5">
            {FAQ.map((f) => (
              <details key={f.q} className="nb-card faq group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg font-semibold">
                  {f.q}
                  <ChevronDown size={20} aria-hidden className="flex-none transition-transform duration-150 group-open:rotate-180" />
                </summary>
                <div className="faq-body px-5 pb-5 text-muted">{f.a}</div>
              </details>
            ))}
          </div>
        </Section>

        <section className="px-5 pb-24 pt-4 sm:px-8" aria-labelledby="cta-h">
          <div className="group nb-card mx-auto flex max-w-[1160px] flex-col items-start gap-6 bg-butter p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <div className="flex items-center gap-5">
              <Sprite art={TROPHY} scale={5} className="hover-hop hidden flex-none sm:block" />
              <h2 id="cta-h" className="text-3xl font-bold sm:text-4xl">
                Week 1 starts when you do.
              </h2>
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
