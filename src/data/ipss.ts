/** IPSS + QoL question bank (Barry et al. 1992, PMID 1279218). */

const FREQ = [
  '0 — Not at all',
  '1 — Less than 1 in 5 times',
  '2 — Less than half the time',
  '3 — About half the time',
  '4 — More than half the time',
  '5 — Almost always',
];

export interface IpssQuestion {
  label: string;
  options: string[];
}

/** The 7 symptom questions (scored 0–5 each → total 0–35). */
export const IPSS_QUESTIONS: IpssQuestion[] = [
  { label: '1 · Incomplete emptying — sensation of not emptying the bladder', options: FREQ },
  { label: '2 · Frequency — urinating again within 2 hours', options: FREQ },
  { label: '3 · Intermittency — stream stopped and started', options: FREQ },
  { label: '4 · Urgency — difficult to postpone urination', options: FREQ },
  { label: '5 · Weak stream', options: FREQ },
  { label: '6 · Straining to begin urination', options: FREQ },
  {
    label: '7 · Nocturia — times getting up at night',
    options: ['0 — None', '1 — Once', '2 — Twice', '3 — Three times', '4 — Four times', '5 — Five or more'],
  },
];

/** The single quality-of-life question (0–6, not added to the symptom total). */
export const IPSS_QOL: IpssQuestion = {
  label: 'QoL · If your urinary condition stayed like this for life, how would you feel?',
  options: [
    '0 — Delighted',
    '1 — Pleased',
    '2 — Mostly satisfied',
    '3 — Mixed',
    '4 — Mostly dissatisfied',
    '5 — Unhappy',
    '6 — Terrible',
  ],
};
