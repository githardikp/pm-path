import { Link } from 'react-router-dom';
import { Target, BookOpen, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PHASES } from '../data/curriculum';
import { overallPct, currentWeekNumber, activeWeek, streak, nextDeliverable, upcomingCheckpoint, nextLesson, totalTopics, totalTopicsDone, weekPct, tasksForDay, isTaskDone } from '../lib/progress';
import { today, formatDate, weekdayOf } from '../lib/dates';
import { Card, CardTitle, ProgressBar, LinkButton, Button, Field, Input } from '../components/ui';
import { Sprite, HERO_A, COIN, FLAME, TROPHY } from '../components/pixel';
import { isEmpty } from '../lib/cloud/decide';
import { useState } from 'react';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const data = useStore();
  const t = today();
  const wkNum = currentWeekNumber(data.settings.startDate, t);
  const week = activeWeek(data, t);
  const phase = PHASES.find((p) => p.id === week.phase)!;
  const overall = overallPct(data);
  const s = streak(data, t);
  const deliv = nextDeliverable(data, t);
  const cp = upcomingCheckpoint(data);
  const next = nextLesson(data, t);
  const tasks = tasksForDay(data, week, weekdayOf(t));
  const tasksDone = tasks.filter((x) => isTaskDone(data, week, t, x)).length;
  const totalHours = Math.round(data.timeLogs.reduce((a, l) => a + l.minutes, 0) / 60);
  const delivDone = Object.values(data.deliverables).filter((d) => d?.status === 'done').length;
  const showSetup = !data.settings.onboarded && isEmpty(data);
  const weekLabel = week.n === 15 ? 'Week 15+' : `Week ${week.n}`;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {greeting()}, {data.settings.name || 'there'}.
        </h1>
        <p className="mt-1 text-muted">
          {wkNum === 0
            ? `Your plan starts on ${formatDate(data.settings.startDate, { weekday: 'long', day: 'numeric', month: 'long' })}. Have a look around until then.`
            : `${weekLabel}: ${week.title}.`}
        </p>
      </header>

      {showSetup && <NewGame onDone={() => data.updateSettings({ onboarded: true })} />}

      {!showSetup && (
        <section aria-label="Your progress" className="nb-card mb-8 grid gap-5 p-5 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="grid h-[88px] w-[88px] place-items-center bg-sky" style={{ boxShadow: '0 0 0 3px var(--c-line)' }}>
            <Sprite art={HERO_A} scale={5} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm text-muted">
              Phase {phase.id}: {phase.title}
            </p>
            <p className="font-display text-2xl font-bold">{wkNum === 0 ? 'Week 1 starts soon' : week.n === 15 ? 'Week 15+, job search' : `Week ${week.n} of 14`}</p>
            <div className="mt-2 flex items-center gap-3">
              <ProgressBar value={overall} color="butter" label={`Plan ${overall}% complete`} className="flex-1" />
              <span className="font-display text-sm font-semibold">{overall}%</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {totalTopicsDone(data)} of {totalTopics()} lessons done
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
      )}

      <div className={showSetup ? 'stagger grid gap-8' : 'stagger grid gap-8 lg:grid-cols-[1.4fr_1fr]'}>
        {/* The one thing to do next */}
        <Card color={phase.color} className="flex flex-col p-6">
          <CardTitle icon={<BookOpen size={18} aria-hidden />}>Up next</CardTitle>
          {next ? (
            <>
              <p className="mt-4 text-sm">Week {next.week} lesson</p>
              <p className="font-display text-3xl font-bold leading-tight">{next.title}</p>
              <div className="mt-auto flex flex-wrap items-center gap-5 pt-6">
                <LinkButton to={`/lesson/${next.id}`} variant="primary" className="bg-surface">
                  Start lesson <ArrowRight size={16} aria-hidden />
                </LinkButton>
                <Link to="/today" className="font-display underline underline-offset-4">
                  Today’s tasks ({tasksDone}/{tasks.length})
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-3">Every lesson is done. Keep running the Week 15+ routine until you have an offer.</p>
          )}
        </Card>

        {/* This week */}
        {!showSetup && (
          <Card className="flex flex-col p-6">
            <CardTitle icon={<Target size={18} aria-hidden />}>{weekLabel} goal</CardTitle>
            <p className="mt-3 text-sm text-muted">{week.goal}</p>
            <div className="mt-3">
              <ProgressBar value={weekPct(data, week)} color={phase.color} label={`${weekLabel} progress`} />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="font-display font-semibold">Build this week</dt>
                <dd>
                  {deliv ? (
                    <>
                      {deliv.week.deliverable.title} <span className="text-muted">· due {formatDate(deliv.due, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </>
                  ) : (
                    'All builds done.'
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-display font-semibold">Checkpoint</dt>
                <dd>{cp ? <>{formatDate(cp.due, { weekday: 'long', day: 'numeric', month: 'short' })}</> : 'All checkpoints passed.'}</dd>
              </div>
            </dl>
            <LinkButton to={`/week/${week.n}`} size="sm" className="mt-auto self-start">
              Open {weekLabel.toLowerCase()} <ArrowRight size={14} aria-hidden />
            </LinkButton>
          </Card>
        )}
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
