// First 30 Days in Australia — arrival checklist items + linked community threads.

export const CHECKLIST_ITEMS = [
  {
    id: 'tfn',
    title: 'Get a TFN',
    explainer: 'A Tax File Number lets employers pay you legally and is needed for tax returns. Apply free online via the ATO once you have a valid visa.',
    questionId: 'q_chk_tfn',
  },
  {
    id: 'bank',
    title: 'Open a bank account',
    explainer: 'You will need ID (passport + visa) and a local address. Most big banks let you start online before you land; finish in-branch with your documents.',
    questionId: 'q_chk_bank',
  },
  {
    id: 'sim',
    title: 'Get a local SIM',
    explainer: 'A prepaid SIM on a major network is the easiest start. You can port your number later — avoid long lock-ins until you know where you will live.',
    questionId: 'q17',
  },
  {
    id: 'myki',
    title: 'Set up Myki',
    explainer: 'Melbourne public transport runs on Myki. Get a card at stations or convenience stores, register it online, and always tap on and off.',
    questionId: 'q_chk_myki',
  },
  {
    id: 'health',
    title: 'Sort health cover (Medicare or OSHC)',
    explainer: 'Students and many visa holders need Overseas Student Health Cover. Permanent residents can enrol in Medicare — do not skip this step.',
    questionId: 'q_chk_health',
  },
  {
    id: 'gp',
    title: 'Find a GP',
    explainer: 'A regular GP is your entry point to referrals, mental-health plans, and scripts. Bulk-billing clinics exist — ask when you book.',
    questionId: 'q3',
  },
  {
    id: 'renting',
    title: 'Understand renting & bond basics',
    explainer: 'Bond is usually four weeks rent, held by the Residential Tenancies Bond Authority (RTBA), not the landlord. Know your rights before you sign.',
    questionId: 'q_chk_rent',
  },
  {
    id: 'licence',
    title: 'Convert/validate your driver licence',
    explainer: 'Rules depend on your home country and visa status. You may drive on an overseas licence for a limited time, then convert or test in Victoria.',
    questionId: 'q14',
  },
  {
    id: 'job',
    title: 'Start the job hunt (resume AU-style)',
    explainer: 'Australian employers skim fast — lead with outcomes, not duties. Tailor each application and show local references where you can.',
    questionId: 'q21',
  },
  {
    id: 'emergency',
    title: 'Save emergency numbers (000)',
    explainer: '000 is police, fire and ambulance. Save it, plus Lifeline (13 11 14) and your embassy — share locations with someone you trust.',
    questionId: 'q_chk_emergency',
  },
];

export const CHECKLIST_TOTAL = CHECKLIST_ITEMS.length;
