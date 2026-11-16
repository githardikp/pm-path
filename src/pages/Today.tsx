import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Square, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PHASES } from '../data/curriculum';
import { activeWeek, tasksForDay, isTaskDone, minutesOn, currentWeekNumber } from '../lib/progress';
import { today, weekdayOf, formatDate } from '../lib/dates';
import { Button, Card, CardTitle, Chip, Field, Input, PageHeader, ProgressBar, Textarea, cx } from '../components/ui';
import { toast } from '../components/Toast';

/** All study time goes into one bucket now that there is no fixed timetable. */
const STUDY_KEY = 'study';

function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
function fmtClock(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function Today() {
  const data = useStore();
  const navigate = useNavigate();
  const t = today();
  const dow = weekdayOf(t);
  const week = activeWeek(data, t);
  const phase = PHASES.find((p) => p.id === week.phase)!;
  const tasks = tasksForDay(data, week, dow);
  const doneCount = tasks.filter((x) => isTaskDone(data, week, t, x)).length;
  const [tick, setTick] = useState(Date.now());
  const [manual, setManual] = useState(30);
  const timer = data.activeTimer;
  const running = !!timer && timer.date === t;

  useEffect(() => {
    if (!timer) return;
    const i = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(i);
  }, [timer]);

  const loggedToday = minutesOn(data, t) + (running ? (tick - timer!.startedAt) / 60000 : 0);
  const targetToday = dow === 0 ? 60 : data.settings.dailyHours * 60;
  const reflection = data.reflections[t] ?? { shipped: '', hard: '', tomorrow: '' };
  const todayLogs = data.timeLogs.filter((l) => l.date === t);
  const notStarted = currentWeekNumber(data.settings.startDate, t) === 0;

  const toggleTask = (task: (typeof tasks)[number]) => {
    if (task.kind === 'topic' && task.ref) data.toggleTopic(task.ref);
    else if (task.kind === 'deliverable' && task.ref) data.toggleDeliverableItem(week.n, Number(task.ref));
    else if (task.kind === 'checkpoint') navigate(`/week/${week.n}#checkpoint`);
    else data.toggleTodayCheck(t, task.id);
  };

  return (
    <div>
      <PageHeader title="Today" kicker={<Chip color={phase.color}>{week.n === 15 ? 'Week 15+' : `Week ${week.n}`}</Chip>}>
        {notStarted
          ? `Your plan starts ${formatDate(data.settings.startDate, { weekday: 'long', day: 'numeric', month: 'long' })}. This preview shows week 1.`
          : `${formatDate(t, { weekday: 'long', day: 'numeric', month: 'long' })}. ${dow === 0 ? 'Sunday is for a one-hour weekly review, then rest.' : 'Work through the list in any order that suits you.'}`}
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card as="section" color="butter" className="p-6" aria-labelledby="tasks-h">
          <div className="mb-4 flex items-center justify-between gap-3">
            <CardTitle>
              <span id="tasks-h">Today’s tasks</span>
            </CardTitle>
            <span className="nb-chip">
              {doneCount}/{tasks.length} done
            </span>
          </div>
          {dow === 0 ? (
            <p>
              Take an hour to look back on the week.{' '}
              <Link className="underline underline-offset-4" to="/review">
                Start the weekly review
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => {
                const done = isTaskDone(data, week, t, task);
                return (
                  <li key={task.id} className="flex items-start gap-3">
                    <input type="checkbox" className="nb-check mt-0.5" checked={done} onChange={() => toggleTask(task)} aria-label={task.label} id={`task-${task.id}`} />
                    <label htmlFor={`task-${task.id}`} className={cx('flex-1 cursor-pointer leading-snug', done && 'line-through opacity-70')}>
                      {task.label}
                    </label>
                    {task.href && (
                      <Link to={task.href} className="nb-btn nb-btn-sm bg-surface" aria-label={`Open: ${task.label}`}>
                        <ArrowRight size={14} aria-hidden />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-8">
          <Card as="section" className="p-6" aria-labelledby="timer-h">
            <CardTitle>
              <span id="timer-h">Study timer</span>
            </CardTitle>
            <p className="mt-3 font-display text-3xl font-bold">
              {running ? fmtClock(tick - timer!.startedAt) : fmtDuration(loggedToday)}
              {!running && <span className="text-base font-semibold text-muted"> of {fmtDuration(targetToday)} today</span>}
            </p>
            <ProgressBar className="mt-3" value={(loggedToday / targetToday) * 100} color="mint" label="Study time today" />
            <div className="mt-5">
              {running ? (
                <Button
                  color="pink"
                  onClick={() => {
                    data.stopTimer();
                    toast('Study time saved');
                  }}
                >
                  <Square size={16} aria-hidden /> Stop
                </Button>
              ) : (
                <Button variant="primary" onClick={() => data.startTimer(STUDY_KEY)}>
                  <Play size={16} aria-hidden /> Start studying
                </Button>
              )}
            </div>
            <details className="mt-5">
              <summary className="cursor-pointer font-display text-sm">Forgot the timer? Add time yourself</summary>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <Field label="Minutes">{(id) => <Input id={id} type="number" min={5} max={600} step={5} value={manual} onChange={(e) => setManual(Number(e.target.value))} className="w-28" />}</Field>
                <Button
                  onClick={() => {
                    if (manual > 0) {
                      data.addManualTime(t, STUDY_KEY, manual);
                      toast(`${fmtDuration(manual)} added`);
                    }
                  }}
                >
                  <Plus size={16} aria-hidden /> Add
                </Button>
              </div>
              {todayLogs.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {todayLogs.map((l) => (
                    <li key={l.id} className="flex items-center gap-2">
                      <span className="flex-1">{fmtDuration(l.minutes)}</span>
                      <button className="nb-btn nb-btn-sm nb-btn-ghost" onClick={() => data.removeTimeLog(l.id)} aria-label={`Delete ${fmtDuration(l.minutes)} entry`}>
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </Card>

          <Card as="section" className="p-6">
            <details open={!!(reflection.shipped || reflection.hard || reflection.tomorrow)}>
              <summary className="cursor-pointer font-display text-lg font-semibold">End-of-day reflection</summary>
              <div className="mt-4 space-y-4">
                <Field label="What I finished today">{(id) => <Textarea id={id} rows={3} value={reflection.shipped} onChange={(e) => data.setReflection(t, { shipped: e.target.value })} />}</Field>
                <Field label="What was hard">{(id) => <Textarea id={id} rows={3} value={reflection.hard} onChange={(e) => data.setReflection(t, { hard: e.target.value })} />}</Field>
                <Field label="Tomorrow’s first task">{(id) => <Input id={id} value={reflection.tomorrow} onChange={(e) => data.setReflection(t, { tomorrow: e.target.value })} />}</Field>
                <p className="text-xs text-muted">Saved as you type.</p>
              </div>
            </details>
            <YesterdayFirstTask />
          </Card>
        </div>
      </div>
    </div>
  );
}

function YesterdayFirstTask() {
  const reflections = useStore((s) => s.reflections);
  const t = today();
  const prev = Object.keys(reflections)
    .filter((d) => d < t && reflections[d].tomorrow)
    .sort()
    .pop();
  if (!prev) return null;
  return (
    <div className="nb-card mt-5 bg-sky p-3 text-sm">
      <span className="font-display font-semibold">Your first task, from {formatDate(prev, { weekday: 'short' })}: </span>
      {reflections[prev].tomorrow}
    </div>
  );
}
