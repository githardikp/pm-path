import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TOOLS } from '../tools/registry';
import { Card, Chip, PageHeader, cx } from '../components/ui';
import { Sprite, LAPTOP, CHEST, TREE, FLAG, STAR, GLASS, COIN, CHECKLIST_ART, SCROLL, CHAT, type Art } from '../components/pixel';

const TOOL_ART: Record<string, Art> = {
  sql: LAPTOP,
  rice: CHEST,
  'metrics-tree': TREE,
  funnel: FLAG,
  'ab-test': STAR,
  estimation: GLASS,
  'ai-cost': COIN,
  evals: CHECKLIST_ART,
  'prompt-lab': SCROLL,
  mock: CHAT,
};

export default function Toolkit() {
  return (
    <div>
      <PageHeader title="Toolkit" kicker={<Chip color="butter">Works offline</Chip>}>
        Ten built-in tools for hands-on practice. Everything runs in your browser; your work is saved locally.
      </PageHeader>
      <ul className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((t) => (
          <li key={t.slug}>
            <Link to={t.to ?? `/toolkit/${t.slug}`} className="block h-full rounded-none">
              <Card hover className="flex h-full flex-col p-5">
                <div className={cx('mb-4 grid h-14 w-14 place-items-center', `bg-${t.color}`)} style={{ boxShadow: '0 0 0 2px var(--c-line)' }} aria-hidden>
                  <Sprite art={TOOL_ART[t.slug] ?? SCROLL} scale={3} />
                </div>
                <h2 className="text-lg font-bold">{t.name}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{t.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Chip>Week {t.week}</Chip>
                  <ArrowRight size={18} aria-hidden />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
