import { Link } from 'react-router-dom';
import { Clock, Target, Flag, BookOpen, ArrowRight, CalendarDays, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PHASES, WEEKLY_RHYTHM, WEEKLY_TARGET_HOURS } from '../data/curriculum';
import {
  overallPct,
  phasePct,
  currentWeekNumber,
  activeWeek,
  streak,
  hoursThisWeek,
  dailyHoursSeries,
  nextDeliverable,
  upcomingCheckpoint,
  nextLesson,
  scheduleFor,
  totalTopics,
  totalTopicsDone,
  weekPct,
  tasksForDay,
  isTaskDone,
} from '../lib/progress';
import { today, formatDate, weekdayOf } from '../lib/dates';
import { Card, CardTitle, Chip, ProgressBar, LinkButton, StatusChip, Button, Field, Input } from '../components/ui';
import { Sprite, HERO_A, COIN, FLAME, TROPHY } from '../components/pixel';
import { isEmpty } from '../lib/cloud/decide';
import { useState } from 'react';
import { deliverableStatus } from '../lib/progress';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

export default function Dashboard() {
  const data = useStore();
  const t = today();
  const wkNum = currentWeekNumber(data.settings.startDate, t);
  const week = activeWeek(data, t);
  const phase = PHASES.find((p) => p.id === week.phase)!;
  const overall = overallPct(data);
  const s = streak(data, t);
  const hrs = hoursThisWeek(data, t);
  const target = data.settings.dailyHours * 6 || WEEKLY_TARGET_HOURS;
  const series = dailyHoursSeries(data, t);
  const maxH = Math.max(data.settings.dailyHours, ...series.map((x) => x.hours));
  const deliv = nextDeliverable(data, t);
  const cp = upcomingCheckpoint(data);
  const next = nextLesson(data, t);
  const schedule = scheduleFor(week);
  const now = nowMinutes();
  const dow = weekdayOf(t);
  const tasks = tasksForDay(data, week, dow);
  const tasksDone = tasks.filter((x) => isTaskDone(data, week, t, x)).length;
  const totalHours = Math.round(data.timeLogs.reduce((a, l) => a + l.minutes, 0) / 60);
  const delivDone = Object.values(data.deliverables).filter((d) => d?.status === 'done').length;
  const showSetup = !data.settings.onboarded && isEmpty(data);
  const currentBlock = dow !== 0 ? schedule.find((b) => toMin(b.start) <= now && now < toMin(b.end)) ?? schedule.find((b) => toMin(b.start) > now) : undefined;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Chip color="butter">
              <CalendarDays size={13} aria-hidden /> {formatDate(t, { weekday: 'long', day: 'numeric', month: 'long' })}
            </Chip>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {greeting()}, {data.settings.name || 'there'}.
          </h1>
          <p className="mt-1 text-muted">
            {wkNum === 0 ? `Your roadmap starts on ${formatDate(data.settings.startDate, { weekday: 'long', day: 'numeric', month: 'long' })}. Have a look around until then.` : `${week.n === 15 ? 'Week 15+' : `Week ${week.n} of 14`}: ${week.title}. ${WEEKLY_RHYTHM[dow]}`}
          </p>
        </div>
        <LinkButton to="/today" variant="primary">
          <Sun size={16} aria-hidden /> Open today
        </LinkButton>
      </header>

      {showSetup && <NewGame onDone={() => data.updateSettings({ onboarded: true })} />}

      <section aria-label="Your progress" className="nb-card mb-8 grid gap-5 p-5 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="grid h-[88px] w-[88px] place-items-center bg-sky" style={{ boxShadow: '0 0 0 3px var(--c-line)' }}>
          <Sprite art={HERO_A} scale={5} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm text-muted">Phase {phase.id}: {phase.title}</p>
          <p className="font-display text-2xl font-bold">{wkNum === 0 ? 'Week 1 starts soon' : week.n === 15 ? 'Week 15+, job search' : `Week ${week.n} of 14`}</p>
          <div className="mt-2 flex items-center gap-3">
            <ProgressBar value={overall} color="butter" label={`Roadmap ${overall}% complete`} className="flex-1" />
            <span className="font-display text-sm font-semibold">{overall}%</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {totalTopicsDone(data)} of {totalTopics()} lessons done. The bar also counts deliverables and checkpoints.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 sm:col-span-2 lg:col-span-1 lg:flex lg:gap-6">
          <div className="relative flex flex-col-reverse justify-center pl-11">
            <dt className="text-xs text-muted">day streak</dt>
            <dd className="font-display text-2xl font-bold leading-none">
              <Sprite art={FLAME} scale={3} className="absolute left-0 top-1/2 -translate-y-1/2" />
              {s}
            </dd>
          </div>
          <div className="relative flex flex-col-reverse justify-center pl-11">
            <dt className="text-xs text-muted">hours studied</dt>
            <dd className="font-display text-2xl font-bold leading-none">
              <Sprite art={COIN} scale={3} className="absolute left-0 top-1/2 -translate-y-1/2" />
              {totalHours}
            </dd>
          </div>
          <div className="relative flex flex-col-reverse justify-center pl-11">
            <dt className="text-xs text-muted">weeks shipped</dt>
            <dd className="font-display text-2xl font-bold leading-none">
              <Sprite art={TROPHY} scale={2.5} className="absolute left-0 top-1/2 -translate-y-1/2" />
              {delivDone}
            </dd>
          </div>
        </dl>
      </section>

      <div className="stagger grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
        {/* Phases */}
        <Card className="p-5 md:col-span-3 xl:col-span-7">
          <CardTitle className="mb-4">Progress by phase</CardTitle>
          <ul className="space-y-4">
            {PHASES.map((p) => {
              const v = phasePct(data, p.id);
              return (
                <li key={p.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-display font-semibold">
                      {p.id}. {p.title}
                    </span>
                    <span className="font-display font-semibold">{v}%</span>
                  </div>
                  <ProgressBar value={v} color={p.color} label={`Phase ${p.id} ${v}%`} />
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Hours */}
        <Card className="p-5 md:col-span-3 xl:col-span-5">
          <CardTitle icon={<Clock size={18} aria-hidden />}>Hours this week</CardTitle>
          <div className="mt-1 font-display text-3xl font-bold">
            {hrs.toFixed(1)}
            <span className="text-base font-semibold text-muted"> / {target} h</span>
          </div>
          <div className="mt-3 flex h-20 items-end gap-1.5" role="img" aria-label={`Hours by day: ${series.map((x) => `${x.day} ${x.hours}`).join(', ')}`}>
            {series.map((x) => (
              <div key={x.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div className={`w-full rounded-t-[4px] border-2 border-line ${x.date === t ? 'bg-butter' : 'bg-sky'}`} style={{ height: `${Math.max(4, (x.hours / maxH) * 100)}%`, opacity: x.hours ? 1 : 0.35 }} />
                </div>
                <span className="text-xs font-semibold">{x.day[0]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Today */}
        <Card color="butter" className="p-5 md:col-span-6 xl:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <CardTitle icon={<Sun size={18} aria-hidden />}>Today’s plan</CardTitle>
            <span className="nb-chip">
              {tasksDone}/{tasks.length} tasks
            </span>
          </div>
          {dow === 0 ? (
            <p>Sunday: one hour for your weekly review, then rest. <Link className="underline" to="/review">Start the review →</Link></p>
          ) : (
            <ul className="space-y-1.5">
              {schedule.map((b) => {
                const active = currentBlock?.key === b.key;
                return (
                  <li key={b.key} className={`flex items-center gap-3 rounded-none px-2 py-1 text-sm ${active ? 'border-2 border-line bg-surface text-ink' : ''}`}>
                    <span className="w-24 shrink-0 font-mono text-xs">
                      {b.start}–{b.end}
                    </span>
                    <span className="font-medium">{b.label}</span>
                    {active && <span className="nb-chip ml-auto bg-pink">Now</span>}
                  </li>
                );
              })}
            </ul>
          )}
          <LinkButton to="/today" size="sm" className="mt-4">
            Timers and checklist <ArrowRight size={14} aria-hidden />
          </LinkButton>
        </Card>

        {/* Up next */}
        <Card color={phase.color} className="flex flex-col p-5 md:col-span-6 xl:col-span-7">
          <CardTitle icon={<BookOpen size={18} aria-hidden />}>Up next</CardTitle>
          {next ? (
            <>
              <p className="mt-3 text-sm">Week {next.week} lesson</p>
              <p className="font-display text-2xl font-bold leading-tight">{next.title}</p>
              <div className="mt-auto flex flex-wrap gap-3 pt-4">
                <LinkButton to={`/lesson/${next.id}`} variant="primary" className="bg-surface">
                  Start lesson <ArrowRight size={16} aria-hidden />
                </LinkButton>
                <LinkButton to={`/week/${next.week}`}>Week {next.week} overview</LinkButton>
              </div>
            </>
          ) : (
            <p className="mt-3">Every lesson is done. Keep running the Week 15+ system until you have an offer.</p>
          )}
        </Card>

        {/* Deliverable */}
        <Card className="p-5 md:col-span-3 xl:col-span-4">
          <CardTitle icon={<Target size={18} aria-hidden />}>Next deliverable</CardTitle>
          {deliv ? (
            <>
              <p className="mt-2 font-display font-bold leading-snug">{deliv.week.deliverable.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip>Week {deliv.week.n}</Chip>
                <Chip color="butter">Due {formatDate(deliv.due, { weekday: 'short', day: 'numeric', month: 'short' })}</Chip>
                <StatusChip status={deliverableStatus(data, deliv.week)} />
              </div>
              <LinkButton to={`/week/${deliv.week.n}#deliverable`} size="sm" className="mt-4">
                Open checklist
              </LinkButton>
            </>
          ) : (
            <p className="mt-2 text-sm">All deliverables done.</p>
          )}
        </Card>

        {/* Checkpoint */}
        <Card className="p-5 md:col-span-3 xl:col-span-4">
          <CardTitle icon={<Flag size={18} aria-hidden />}>Upcoming checkpoint</CardTitle>
          {cp ? (
            <>
              <p className="mt-2 text-sm leading-snug">{cp.week.checkpoint.summary}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip>Week {cp.week.n}</Chip>
                <Chip color="butter">{formatDate(cp.due, { weekday: 'short', day: 'numeric', month: 'short' })}</Chip>
              </div>
              <LinkButton to={`/week/${cp.week.n}#checkpoint`} size="sm" className="mt-4">
                Self-assess
              </LinkButton>
            </>
          ) : (
            <p className="mt-2 text-sm">All checkpoints passed.</p>
          )}
        </Card>

        {/* Current week */}
        <Card className="p-5 md:col-span-6 xl:col-span-4">
          <CardTitle>Week {week.n === 15 ? '15+' : week.n} at a glance</CardTitle>
          <p className="mt-2 text-sm text-muted">{week.goal}</p>
          <div className="mt-3">
            <ProgressBar value={weekPct(data, week)} color={phase.color} label={`Week ${week.n} progress`} />
          </div>
          <LinkButton to={`/week/${week.n}`} size="sm" className="mt-4">
            Open week <ArrowRight size={14} aria-hidden />
          </LinkButton>
        </Card>
      </div>
    </div>
  );
}

/** First-run setup: name, start date and daily hours, then straight into week 1. */
function NewGame({ onDone }: { onDone: () => void }) {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [name, setName] = useState(settings.name);
  const [start, setStart] = useState(settings.startDate);
  const [hours, setHours] = useState(settings.dailyHours);
  return (
    <section aria-labelledby="newgame-h" className="nb-card bounce-in mb-8 bg-butter p-6">
      <div className="flex flex-wrap items-start gap-5">
        <Sprite art={HERO_A} scale={5} className="hidden sm:block" />
        <div className="min-w-0 flex-1">
          <h2 id="newgame-h" className="text-2xl font-bold">
            Set up your plan
          </h2>
          <p className="mt-1 max-w-[60ch]">Three answers and you’re ready. You can change any of them later in Settings.</p>
          <form
            className="mt-5 grid gap-4 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              updateSettings({ name: name.trim(), startDate: start, dailyHours: hours, onboarded: true });
              onDone();
            }}
          >
            <Field label="Your first name (optional)">{(id) => <Input id={id} value={name} autoComplete="given-name" onChange={(e) => setName(e.target.value)} />}</Field>
            <Field label="Start date" hint="A Monday works best.">
              {(id) => <Input id={id} type="date" required value={start} onChange={(e) => setStart(e.target.value)} />}
            </Field>
            <Field label="Study hours a day (Mon–Sat)" hint="The plan is built around 9.">
              {(id) => <Input id={id} type="number" min={1} max={14} step={0.5} value={hours} onChange={(e) => setHours(Math.max(1, Math.min(14, Number(e.target.value) || 9)))} />}
            </Field>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
              <Button type="submit" variant="primary" className="bg-surface">
                Save and start
              </Button>
              <button type="button" className="font-display text-sm underline underline-offset-4" onClick={() => updateSettings({ onboarded: true })}>
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
