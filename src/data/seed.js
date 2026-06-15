// Seed data for the Chautari prototype. Everything here is mock/local.
// Timestamps are computed relative to load time so the feed always looks fresh
// and "alive" on first launch (Build Brief v2): a mix of just-now, hours and days.

import { buildOfficialCircles, seedUserCircles, seedJoinedCircles } from './circles';

const MIN = 60 * 1000;
const H = 60 * MIN;
const D = 24 * H;
const now = Date.now();
const ago = (ms) => now - ms;

// ---- Users -------------------------------------------------------------
// id 'me' is reserved for the signed-in user (filled in at signup).
// Six verified experts spanning the high-demand categories, plus a handful of
// community answerers with lived experience.
export const seedUsers = [
  {
    id: 'u_sunita', name: 'Sunita Gurung', suburb: 'Point Cook', photo: null,
    bio: 'Registered Migration Agent (MARA 1899XXX). 8+ years helping students and skilled migrants across Victoria. Straight answers, no false hope.',
    profession: 'Migration Agent (MARA)', verified: true, verifiedCategory: 'migration',
    contact: 'mailto:sunita@example.com', followers: 412, createdAt: ago(120 * D), isFoundingMember: true,
  },
  {
    id: 'u_raj', name: 'Raj Shrestha', suburb: 'Box Hill', photo: null,
    bio: 'CPA accountant. Tax returns, ABN, super & small-business advice for the Nepali community. Tax time does not have to be scary.',
    profession: 'Accountant (CPA)', verified: true, verifiedCategory: 'tax_super',
    contact: 'mailto:raj@example.com', followers: 287, createdAt: ago(95 * D), isFoundingMember: true,
  },
  {
    id: 'u_anita', name: 'Dr. Anita Thapa', suburb: 'Clayton', photo: null,
    bio: 'General Practitioner (RACGP). Bulk-billing clinic near Monash. Happy to point you toward the right care and away from Dr. Google.',
    profession: 'GP (RACGP)', verified: true, verifiedCategory: 'health',
    contact: 'mailto:anita@example.com', followers: 521, createdAt: ago(150 * D), isFoundingMember: true,
  },
  {
    id: 'u_bishal', name: 'Bishal Karki', suburb: 'Tarneit', photo: null,
    bio: 'Mortgage broker. First-home buyers, temp-resident lending, refinancing. I work with 30+ lenders so you do not have to chase them.',
    profession: 'Mortgage Broker', verified: true, verifiedCategory: 'loans',
    contact: 'mailto:bishal@example.com', followers: 198, createdAt: ago(70 * D), isFoundingMember: true,
  },
  {
    id: 'u_anil', name: 'Anil Maharjan', suburb: 'Glen Waverley', photo: null,
    bio: 'Engineering manager in Melbourne, 12 yrs. I hire and mentor. Ask me about resumes, interviews and breaking into the local tech market.',
    profession: 'Engineering Manager', verified: true, verifiedCategory: 'it_careers',
    contact: 'mailto:anil@example.com', followers: 264, createdAt: ago(85 * D),
  },
  {
    id: 'u_sangita', name: 'Sangita Pradhan', suburb: 'Werribee', photo: null,
    bio: 'Licensed real estate agent (LREA) in the western suburbs. Renting, buying, auctions. No agent-speak, just how it actually works.',
    profession: 'Real Estate Agent (LREA)', verified: true, verifiedCategory: 'real_estate',
    contact: 'mailto:sangita@example.com', followers: 173, createdAt: ago(60 * D),
  },

  // Community answerers (lived experience, not verified).
  { id: 'u_bibek', name: 'Bibek K.C.', suburb: 'Tarneit', photo: null, bio: 'Been in Melbourne 11 years. Happy to share what I learned the hard way.', verified: false, followers: 64, createdAt: ago(80 * D), isFoundingMember: true },
  { id: 'u_pratima', name: 'Pratima Rai', suburb: 'Footscray', photo: null, bio: 'Nurse, mum of two, Footscray local.', verified: false, followers: 38, createdAt: ago(60 * D), isFoundingMember: true },
  { id: 'u_dipesh', name: 'Dipesh Adhikari', suburb: 'Clayton', photo: null, bio: 'Masters student at Monash. Visa nerd.', verified: false, followers: 22, createdAt: ago(40 * D) },
  { id: 'u_manish', name: 'Manish Lama', suburb: 'Sunshine', photo: null, bio: 'IT support by day, real estate hobbyist by night.', verified: false, followers: 51, createdAt: ago(70 * D) },
  { id: 'u_sabina', name: 'Sabina Tamang', suburb: 'St Albans', photo: null, bio: 'Aged-care worker. Moved here in 2019.', verified: false, followers: 29, createdAt: ago(50 * D) },
  { id: 'u_niraj', name: 'Niraj Karki', suburb: 'Craigieburn', photo: null, bio: 'Civil engineer, weekend futsal organiser.', verified: false, followers: 33, createdAt: ago(45 * D) },
];

export const seedCircles = [...buildOfficialCircles(), ...seedUserCircles];
export { seedJoinedCircles };

// ---- Questions ---------------------------------------------------------
// answers[] are inline; replies are one level deep under an answer.
// circleId maps to official circle ids or user-created circle ids.
export const seedQuestions = [
  {
    id: 'q_new_arrival',
    authorId: 'u_sabina',
    anonymous: false,
    category: 'others',
    title: 'Just landed — where do I pick up a Myki at Tullamarine?',
    body: 'Landing tonight. Is there a Myki machine airside or do I need to find one in the city? First time in Melbourne.',
    photos: [], createdAt: ago(3 * MIN), upvotes: 0, views: 4,
    answers: [],
  },
  {
    id: 'q_hot_evergreen',
    authorId: 'u_bibek',
    anonymous: false,
    category: 'migration',
    title: '485 vs 189 — the thread I wish existed when I started',
    body: 'Saving this here for newcomers: the most common pathways people compare after study. Always map the visa to your long-term plan before you lodge anything.',
    photos: [], createdAt: ago(8 * D), upvotes: 94, views: 2280,
    answers: [
      {
        id: 'a_hot_e1', authorId: 'u_sunita', anonymous: false,
        body: '485 is your graduate work-rights bridge; 189 is points-tested PR — different goals, different clocks. Get advice before you commit to either path.',
        createdAt: ago(7.9 * D), upvotes: 52, replies: [],
      },
    ],
  },
  {
    id: 'q1b', authorId: 'u_raj', anonymous: false, category: 'tax_super', postedAsExpert: true,
    title: 'Tax time PSA: lodge even if you earned under the threshold',
    body: 'Every June I see the same confusion. If your employer withheld tax (check the PAYG line on your payslip), you almost certainly want to lodge a return to get it back — even below $18,200. Non-lodgement advice is only when no tax was withheld. Happy to clarify in the comments.',
    photos: [], createdAt: ago(8 * MIN), upvotes: 15, views: 142,
    answers: [
      { id: 'a_raj_psa', authorId: 'u_bibek', anonymous: false, body: 'Wish someone had told me this last year. Got a nice refund after assuming I did not need to lodge.', createdAt: ago(5 * MIN), upvotes: 6, replies: [] },
    ],
  },
  {
    id: 'q1', authorId: 'u_dipesh', anonymous: false, category: 'migration',
    title: 'Can I apply for the 485 visa if my course finishes in December?',
    body: 'My Masters at Monash finishes this December. I want to apply for the Temporary Graduate (subclass 485) visa. Do I need to wait for my official completion letter, or can I apply as soon as results are out? Also, how long is processing right now?',
    photos: [], createdAt: ago(18 * MIN), upvotes: 9, views: 84,
    answers: [
      { id: 'a1', authorId: 'u_sunita', anonymous: false, body: 'You apply once you have your completion letter (or the official "course completed" status), not just results. You have 6 months from course completion to lodge. Make sure your OSHC and English test are valid on the lodgement date. Current 485 processing is roughly 4–6 months but it varies.', createdAt: ago(11 * MIN), upvotes: 14, replies: [
        { id: 'r1', authorId: 'u_dipesh', anonymous: false, body: 'Thank you! Does the 6 months start from the completion date or the date printed on the letter?', createdAt: ago(7 * MIN), upvotes: 2 },
        { id: 'r2', authorId: 'u_sunita', anonymous: false, postedAsExpert: true, body: 'From the date you completed the course requirements — usually stated on the completion letter itself.', createdAt: ago(4 * MIN), upvotes: 4 },
      ] },
    ],
  },
  {
    id: 'q2', authorId: 'me_seed_anon', anonymous: true, category: 'tax_super',
    title: 'Do I need to lodge a tax return if I only worked 3 months?',
    body: 'I arrived in March and only started working in April. I earned under $18,200 for the financial year. Do I still need to lodge a tax return, or can I just submit a non-lodgement advice? I have a TFN and tax was taken out of my payslips.',
    photos: [], createdAt: ago(52 * MIN), upvotes: 7, views: 121,
    answers: [
      { id: 'a3', authorId: 'u_raj', anonymous: false, body: 'If tax was withheld from your pay (check the PAYG line on your payslips), you should lodge a return to get that money refunded — even under the tax-free threshold. Non-lodgement advice is only when no tax was withheld and you had no reportable income. Lodging is free via myGov.', createdAt: ago(34 * MIN), upvotes: 11, replies: [] },
    ],
  },
  {
    id: 'q3', authorId: 'u_pratima', anonymous: false, category: 'health',
    title: 'Bulk-billing GP near Footscray who speaks Nepali or Hindi?',
    body: 'Looking for a bulk-billing GP around Footscray/Sunshine. Ideally someone who speaks Nepali or Hindi for my parents who are visiting on a 600 visa. Any recommendations?',
    photos: [], createdAt: ago(2 * H), upvotes: 16, views: 240,
    answers: [
      { id: 'a4', authorId: 'u_anita', anonymous: false, body: 'Important: visitors on a 600 visa are not Medicare-eligible, so most clinics will charge privately even if they bulk-bill residents. Make sure your parents have OVHC travel insurance. Several Sunshine clinics have Hindi-speaking GPs — call ahead and ask for an interpreter-friendly booking (it is free via TIS National).', createdAt: ago(80 * MIN), upvotes: 21, replies: [
        { id: 'r3', authorId: 'u_pratima', anonymous: false, body: 'I had no idea the interpreter line was free. Thank you Dr. Thapa.', createdAt: ago(70 * MIN), upvotes: 3 },
      ] },
      { id: 'a5', authorId: 'u_bibek', anonymous: false, body: 'There is a clinic on Barkly St that has been good for my family. Get there early, it gets busy.', createdAt: ago(60 * MIN), upvotes: 5, replies: [] },
    ],
  },
  {
    id: 'q4', authorId: 'u_manish', anonymous: false, category: 'real_estate',
    title: 'Worth buying in Tarneit vs renting in the inner west?',
    body: 'We are a couple on PR, combined income about 130k. Renting in Footscray is eating us alive. Smarter to buy in Tarneit/Wyndham Vale and commute, or keep renting closer to the city? Worried about the commute and resale.',
    photos: [], createdAt: ago(4 * H), upvotes: 23, views: 388,
    answers: [
      { id: 'a6', authorId: 'u_sangita', anonymous: false, body: 'Run the numbers on total cost, not just mortgage vs rent: factor stamp duty, council rates, owners-corp (if townhouse), and ~$300+/mo in extra transport. Tarneit has had strong rental demand which helps resale, but buy for at least 5–7 years to ride out entry costs. Happy to share recent comparable sales if useful.', createdAt: ago(3.4 * H), upvotes: 19, replies: [] },
      { id: 'a7', authorId: 'u_bibek', anonymous: false, body: 'We bought in Tarneit 3 years ago. The commute is real (45–60 min to the city by train) but building equity beats paying off someone else’s mortgage. Just budget time for the drive to good schools.', createdAt: ago(3 * H), upvotes: 11, replies: [] },
    ],
  },
  {
    id: 'q5', authorId: 'u_dipesh', anonymous: false, category: 'loans',
    title: 'First home buyer — can I use the FHSS scheme on a temp visa?',
    body: 'I have been salary sacrificing into super hoping to use the First Home Super Saver scheme, but I am on a 482 visa, not PR yet. Am I eligible to withdraw under FHSS, and does my visa status matter for the First Home Owner Grant?',
    photos: [], createdAt: ago(7 * H), upvotes: 12, views: 203,
    answers: [
      { id: 'a8', authorId: 'u_bishal', anonymous: false, body: 'FHSS itself does not require PR — it is about whether you have owned property before and meet the contribution rules. BUT the First Home Owner Grant and most Victorian stamp-duty concessions require permanent residency or citizenship at settlement. So you can save via FHSS but likely will not get the state grant on a 482. Get advice before you commit to a contract.', createdAt: ago(6.2 * H), upvotes: 17, replies: [
        { id: 'r4', authorId: 'u_dipesh', anonymous: false, body: 'That distinction is exactly what I was missing. Thanks Bishal.', createdAt: ago(6 * H), upvotes: 2 },
      ] },
      { id: 'a9', authorId: 'u_raj', anonymous: false, body: 'Adding to Bishal: keep evidence of every voluntary contribution and request an FHSS determination from the ATO before you release funds. Concessional contributions are taxed differently on withdrawal.', createdAt: ago(5.5 * H), upvotes: 8, replies: [] },
    ],
  },
  {
    id: 'q6', authorId: 'u_sabina', anonymous: false, category: 'it_careers',
    title: 'How do I get my first IT job with no experience?',
    body: 'I have 4 years of software experience from Nepal but every job here wants Australian experience. I have applied to 80+ roles, barely any callbacks. What actually works — internships, certifications, networking? Feeling stuck.',
    photos: [], createdAt: ago(11 * H), upvotes: 49, views: 1042,
    answers: [
      { id: 'a10', authorId: 'u_anil', anonymous: false, body: 'As someone who hires: "Australian experience" is usually code for "can you communicate clearly and work in our team". Three things move the needle most — (1) one local reference, even from volunteering, (2) a resume tailored to each role with metrics, not duties, and (3) showing up at meetups. I have hired two people I first met at a Python meetup. Your overseas experience counts; package it for an Australian reader.', createdAt: ago(10 * H), upvotes: 38, replies: [
        { id: 'r5', authorId: 'u_sabina', anonymous: false, body: 'This is so encouraging, thank you. Which meetups would you suggest for backend devs?', createdAt: ago(9.4 * H), upvotes: 5 },
        { id: 'r6', authorId: 'u_anil', anonymous: false, postedAsExpert: true, body: 'MelbJS, Melbourne Python, and the AWS user group are all welcoming. Go three times before you decide it is not working.', createdAt: ago(9 * H), upvotes: 9 },
      ] },
      { id: 'a11', authorId: 'u_dipesh', anonymous: true, body: 'Honestly a lot of it is referrals. Get your LinkedIn active and message alumni from your uni. Posting anonymously because my current employer follows me here.', createdAt: ago(8.5 * H), upvotes: 12, replies: [] },
    ],
  },
  {
    id: 'q7', authorId: 'u_bibek', anonymous: false, category: 'general',
    title: 'Best way to send money to Nepal right now?',
    body: 'What is everyone using to remit money home these days? Looking for good exchange rates and low fees. Banks are terrible. Are the usual remittance apps safe, and which gives the best NPR rate?',
    photos: [], createdAt: ago(14 * H), upvotes: 18, views: 506,
    answers: [
      { id: 'a12', authorId: 'u_manish', anonymous: false, body: 'Compare a couple of licensed providers on the day you send — rates move daily. Always check they are AUSTRAC-registered. Avoid informal "hundi" channels; they are illegal and unprotected if something goes wrong.', createdAt: ago(13 * H), upvotes: 14, replies: [] },
      { id: 'a13', authorId: 'u_raj', anonymous: false, body: 'From a tax angle: sending your own after-tax money home is fine, but if you are moving large sums regularly keep records — banks report large transfers and you do not want questions later.', createdAt: ago(12 * H), upvotes: 7, replies: [] },
    ],
  },
  {
    id: 'q8', authorId: 'me_seed_anon', anonymous: true, category: 'migration',
    title: 'Partner visa (820) — how long are we really waiting?',
    body: 'Applied onshore partner visa (820/801) 14 months ago, still nothing. Friends say it can be 2 years now. Is there anything we can do to speed it up, and can my partner travel overseas while it is pending?',
    photos: [], createdAt: ago(20 * H), upvotes: 14, views: 351,
    answers: [
      { id: 'a14', authorId: 'u_sunita', anonymous: false, body: 'Onshore 820 processing is long right now (often 18–24 months). You generally cannot expedite without exceptional circumstances. If your partner holds a Bridging Visa A, they need a Bridging Visa B (BVB) to travel and return — apply for that before leaving, with a clear reason for travel, and allow a couple of weeks.', createdAt: ago(18.5 * H), upvotes: 22, replies: [] },
    ],
  },
  {
    id: 'q9', authorId: 'u_pratima', anonymous: false, category: 'health',
    title: 'Affordable mental-health support for students?',
    body: 'A friend is struggling and cannot afford a psychologist. Are there bulk-billed mental-health options or student services? I want to help them get support without a huge bill.',
    photos: [], createdAt: ago(1 * D), upvotes: 31, views: 540,
    answers: [
      { id: 'a15', authorId: 'u_anita', anonymous: false, body: 'See a GP first and ask for a Mental Health Treatment Plan — it gives Medicare-subsidised psychology sessions for Medicare-eligible people. Universities have free counselling for enrolled students. There are also free 24/7 helplines (Lifeline 13 11 14, Beyond Blue). Please encourage them to reach out — they are not alone.', createdAt: ago(23 * H), upvotes: 34, replies: [] },
      { id: 'a16', authorId: 'u_sabina', anonymous: false, body: 'Some community health centres also offer low-cost counselling on a sliding scale. Worth a phone call.', createdAt: ago(21 * H), upvotes: 6, replies: [] },
    ],
  },
  {
    id: 'q10', authorId: 'u_niraj', anonymous: false, category: 'real_estate',
    title: 'Rental application keeps getting rejected — tips?',
    body: 'We have applied for 12 rentals and keep missing out. Stable income, no pets, references. Is it because we are new with no Australian rental history? How do we stand out at inspections?',
    photos: [], createdAt: ago(1.3 * D), upvotes: 19, views: 421,
    answers: [
      { id: 'a17', authorId: 'u_sangita', anonymous: false, body: 'From the agent side: a complete application wins over a slightly higher offer that is missing documents. Submit ID, last 3 payslips, bank statement, and reference letters (employer or overseas landlord both count) the same day as the inspection. A short cover note — who you are, why this place — genuinely helps. You do not need to overpay; you need to be the easy "yes".', createdAt: ago(1.25 * D), upvotes: 24, replies: [
        { id: 'r7', authorId: 'u_niraj', anonymous: false, body: 'We have been applying a day or two late every time. That might be the whole problem. Thank you!', createdAt: ago(1.2 * D), upvotes: 4 },
      ] },
      { id: 'a18', authorId: 'u_bibek', anonymous: false, body: 'Build a "renter resume" PDF so you can apply in 5 minutes. Speed matters more than people think.', createdAt: ago(1.15 * D), upvotes: 9, replies: [] },
    ],
  },
  {
    id: 'q11', authorId: 'u_dipesh', anonymous: false, category: 'tax_super',
    title: 'Can I claim my laptop and internet as a part-time student working in IT?',
    body: 'I work part-time in IT support and study. Can I claim a portion of my laptop, internet and home office on my tax return? How do I work out the work-related percentage?',
    photos: [], createdAt: ago(1.6 * D), upvotes: 11, views: 268,
    answers: [
      { id: 'a19', authorId: 'u_raj', anonymous: false, body: 'You can claim the work-related portion only. Keep a 4-week diary of work vs personal use to justify the percentage. Laptops over $300 are depreciated over their effective life, not claimed all at once. Keep every receipt — no receipt, no claim if audited.', createdAt: ago(1.5 * D), upvotes: 16, replies: [] },
    ],
  },
  {
    id: 'q12', authorId: 'u_bibek', anonymous: false, category: 'general',
    title: 'Where to celebrate Dashain in Melbourne this year?',
    body: 'New to Melbourne and missing home during the festival season. Are there community Dashain/Tihar events around Melbourne where families are welcome?',
    photos: [], createdAt: ago(1.9 * D), upvotes: 26, views: 712,
    answers: [
      { id: 'a20', authorId: 'u_pratima', anonymous: false, body: 'Several Nepali associations host Dashain programs in the western and southeastern suburbs. Watch the community Facebook groups closer to the date — tickets fill fast. The big cultural one in the west usually sells out a week ahead.', createdAt: ago(1.85 * D), upvotes: 13, replies: [] },
      { id: 'a21', authorId: 'u_niraj', anonymous: false, body: 'Our futsal group does a Tihar get-together too, all welcome. I will post details here when locked in.', createdAt: ago(1.8 * D), upvotes: 7, replies: [] },
    ],
  },
  {
    id: 'q13', authorId: 'u_sabina', anonymous: false, category: 'it_careers',
    title: 'Is a Cert IV or diploma worth it to move into aged care?',
    body: 'Thinking of moving into aged care / disability support work. Is the Cert III/IV actually needed to get hired, and are there fee-free TAFE places? Roughly what pay should I expect starting out?',
    photos: [], createdAt: ago(2.2 * D), upvotes: 13, views: 322,
    answers: [
      { id: 'a22', authorId: 'u_sabina', anonymous: false, body: 'Answering my own context for others: most providers want at least a Cert III in Individual Support plus a police check, NDIS Worker Screening, and first aid. Fee-free TAFE covers several of these if you are eligible. Pay starts modest but is steady with shift loadings.', createdAt: ago(2.1 * D), upvotes: 10, replies: [] },
      { id: 'a23', authorId: 'u_pratima', anonymous: false, body: 'As a nurse I work alongside support workers daily — get the Cert III, say yes to a placement, and treat it seriously. Good ones get offered permanent roles quickly.', createdAt: ago(2.05 * D), upvotes: 12, replies: [] },
    ],
  },
  {
    id: 'q14', authorId: 'u_dipesh', anonymous: false, category: 'others',
    title: 'Converting a Nepali driver licence to a Victorian one?',
    body: 'I have a full Nepali driving licence. Can I convert it, or do I have to start from scratch with Ls and Ps in Victoria? Does an international permit help at all?',
    photos: [], createdAt: ago(2.6 * D), upvotes: 16, views: 372,
    answers: [
      { id: 'a24', authorId: 'u_manish', anonymous: false, body: 'Nepal is not on the recognised-country list for direct conversion, so you go through the VicRoads testing process (knowledge test, hazard perception test, drive test). Temporary visa holders can drive on an overseas licence with an English translation for a period, but permanent residents must convert within 6 months of becoming a PR.', createdAt: ago(2.5 * D), upvotes: 14, replies: [] },
    ],
  },
  {
    id: 'q15', authorId: 'me_seed_anon', anonymous: true, category: 'general',
    title: 'Feeling isolated after moving — how did you build a friend circle?',
    body: 'Moved to Melbourne 6 months ago for work. I am okay financially but I feel really isolated. How did people here build friendships as an adult migrant? Posting anonymously because it is a bit vulnerable.',
    photos: [], createdAt: ago(3 * D), upvotes: 98, views: 1480,
    answers: [
      { id: 'a25', authorId: 'u_pratima', anonymous: false, body: 'You are not alone in feeling this — most of us hit that wall around the 6-month mark. Joining a sports team (futsal is big here), volunteering, and saying yes to every invite for the first year helped me. It gets better; keep showing up even when you do not feel like it.', createdAt: ago(2.9 * D), upvotes: 41, replies: [
        { id: 'r8', authorId: 'u_niraj', anonymous: false, body: 'Seconding futsal — DM me and come along this Sunday, no pressure.', createdAt: ago(2.8 * D), upvotes: 11 },
      ] },
      { id: 'a26', authorId: 'u_anita', anonymous: false, body: 'As a GP I see this often — social isolation is real and affects physical health too. Regular, repeating contact is the key: a weekly class, a faith or cultural group, a team. If low mood lingers more than two weeks, please book a GP. There is no shame in it.', createdAt: ago(2.7 * D), upvotes: 27, replies: [] },
    ],
  },
  {
    id: 'q16', authorId: 'u_bishal', anonymous: false, category: 'loans', postedAsExpert: true,
    title: 'PSA: how much deposit do you really need as a temp resident?',
    body: 'I get this question daily so posting it here. Short version: many lenders cap temp residents at 80% (so ~20% deposit), some go higher with LMI, and FIRB approval may be required for certain properties. Ask me anything below.',
    photos: [], createdAt: ago(34 * MIN), upvotes: 22, views: 415,
    answers: [
      { id: 'a27', authorId: 'u_dipesh', anonymous: false, body: 'Does the FIRB fee apply if I am buying an established home to live in on a 482?', createdAt: ago(3.3 * D), upvotes: 4, replies: [
        { id: 'r9', authorId: 'u_bishal', anonymous: false, postedAsExpert: true, body: 'Generally temp residents can buy one established dwelling to live in, but you must apply for FIRB approval and pay the fee first. Budget for it early — it is not small.', createdAt: ago(3.2 * D), upvotes: 8 },
      ] },
    ],
  },
  {
    id: 'q17', authorId: 'u_manish', anonymous: false, category: 'others',
    title: 'Cheapest reliable phone + internet plan for a new arrival?',
    body: 'Just landed, need a SIM and home internet without a 24-month lock-in. What are people using that is cheap but actually reliable? Coverage in the western suburbs matters.',
    photos: [], createdAt: ago(3.8 * D), upvotes: 15, views: 360,
    answers: [
      { id: 'a28', authorId: 'u_bibek', anonymous: false, body: 'Prepaid SIM on one of the big networks for the first month while you settle, then switch to a cheaper reseller on the same network once you know coverage is fine where you live. Month-to-month NBN exists — avoid the 24-month deals until you know you are staying put.', createdAt: ago(3.7 * D), upvotes: 11, replies: [] },
    ],
  },
  {
    id: 'q18', authorId: 'u_sunita', anonymous: false, category: 'migration', postedAsExpert: true,
    title: 'Reminder: keep certified copies of EVERYTHING you submit',
    body: 'A pattern I see constantly: people lodge a visa, then cannot find what they submitted months later when asked for more info. Keep a dated folder (digital + a backup) of every form, payslip and letter. It will save you weeks. What else trips people up?',
    photos: [], createdAt: ago(50 * MIN), upvotes: 37, views: 690,
    answers: [
      { id: 'a29', authorId: 'u_bibek', anonymous: false, body: 'Underrated: keep your old passports. Travel history questions come up years later for citizenship.', createdAt: ago(4.2 * D), upvotes: 15, replies: [] },
      { id: 'a30', authorId: 'u_dipesh', anonymous: false, body: 'And screenshot your visa grant + conditions (VEVO) — do not rely on email alone.', createdAt: ago(4.1 * D), upvotes: 9, replies: [] },
    ],
  },
  {
    id: 'q19', authorId: 'u_niraj', anonymous: false, category: 'health',
    title: 'Dentist costs are brutal — any way to make them manageable?',
    body: 'No dental cover and a filling quote made my eyes water. Are there public dental options, payment plans, or student clinics that are any good? Western suburbs ideally.',
    photos: [], createdAt: ago(4.8 * D), upvotes: 20, views: 398,
    answers: [
      { id: 'a31', authorId: 'u_anita', anonymous: false, body: 'Public dental exists for concession-card holders (waitlists can be long for non-urgent work). Dental schools run supervised student clinics at reduced cost — quality is fine and well supervised, just slower. For private, ask about payment plans; many clinics offer them. Do not skip a painful tooth — it gets more expensive, not less.', createdAt: ago(4.7 * D), upvotes: 18, replies: [] },
    ],
  },
  {
    id: 'q20', authorId: 'u_pratima', anonymous: false, category: 'tax_super',
    title: 'Found two super accounts — should I consolidate them?',
    body: 'I changed jobs and ended up with two super funds, both charging fees. Should I roll them into one, and how do I pick which to keep? Worried about losing insurance inside super.',
    photos: [], createdAt: ago(5.4 * D), upvotes: 17, views: 333,
    answers: [
      { id: 'a32', authorId: 'u_raj', anonymous: false, body: 'Consolidating usually saves on duplicate fees and is easy via myGov → ATO → super. BUT check the insurance inside each fund first — rolling out can cancel cover you might not get back if your health has changed. Compare fees AND insurance, then keep the better one and transfer the other in.', createdAt: ago(5.3 * D), upvotes: 19, replies: [
        { id: 'r10', authorId: 'u_pratima', anonymous: false, body: 'The insurance point is exactly what I would have missed. Thank you Raj.', createdAt: ago(5.2 * D), upvotes: 3 },
      ] },
    ],
  },
  {
    id: 'q21', authorId: 'u_anil', anonymous: false, category: 'it_careers', postedAsExpert: true,
    title: 'Resume tip that doubled my callbacks (and might help you)',
    body: 'Reviewing community resumes, the #1 fix: replace duty lists with outcomes. "Responsible for backend APIs" → "Built and shipped 6 REST APIs serving 40k daily users, cut latency 30%". Same job, completely different read. Share yours and I will give quick feedback.',
    photos: [], createdAt: ago(66 * MIN), upvotes: 44, views: 905,
    answers: [
      { id: 'a33', authorId: 'u_dipesh', anonymous: false, body: 'This reframed how I think about my whole CV. Posting mine — any feedback appreciated.', createdAt: ago(5.9 * D), upvotes: 8, replies: [
        { id: 'r11', authorId: 'u_anil', anonymous: false, postedAsExpert: true, body: 'Good start — quantify the impact of your final-year project and move it above your part-time retail job. Recruiters scan the top third.', createdAt: ago(5.8 * D), upvotes: 12 },
      ] },
      { id: 'a34', authorId: 'u_sabina', anonymous: false, body: 'Did this for my aged-care resume too — outcomes work even outside tech. More callbacks already.', createdAt: ago(5.7 * D), upvotes: 9, replies: [] },
    ],
  },
  {
    id: 'q22', authorId: 'u_sangita', anonymous: false, category: 'real_estate', postedAsExpert: true,
    title: 'Breaking a lease in Victoria — what does it actually cost?',
    body: 'Tenants ask me this constantly. You are generally liable for reasonable re-letting costs and rent until a new tenant is found, not an arbitrary "X weeks penalty". Landlords must try to re-let promptly. Know your rights before you sign anything. Questions welcome.',
    photos: [], createdAt: ago(82 * MIN), upvotes: 21, views: 377,
    answers: [
      { id: 'a35', authorId: 'u_manish', anonymous: false, body: 'Wish I had known this last year — an agent tried to charge me a flat 6 weeks. Is that allowed?', createdAt: ago(6.5 * D), upvotes: 5, replies: [
        { id: 'r12', authorId: 'u_sangita', anonymous: false, postedAsExpert: true, body: 'A fixed penalty like that is generally not enforceable for leases under the current rules — costs must be reasonable and itemised. Ask for the breakdown in writing and contact Consumer Affairs Victoria if they refuse.', createdAt: ago(6.4 * D), upvotes: 14 },
      ] },
    ],
  },
  {
    id: 'q_chk_tfn', authorId: 'u_dipesh', anonymous: false, category: 'tax_super',
    title: 'How do I apply for a TFN as a new arrival?',
    body: 'Landed two weeks ago on a student visa. Everyone says I need a Tax File Number before I can start my casual job. Where do I actually apply, what documents do I need, and how long does it take?',
    photos: [], createdAt: ago(5 * D), upvotes: 24, views: 510,
    answers: [
      { id: 'a_chk_tfn1', authorId: 'u_raj', anonymous: false, body: 'Apply free at the ATO via myGov once you have landed and have your passport + visa details. It is usually online — you do not need to visit an office. Your employer can withhold tax at the highest rate until your TFN is active, so apply in your first week if you can.', createdAt: ago(4.9 * D), upvotes: 19, replies: [] },
      { id: 'a_chk_tfn2', authorId: 'u_bibek', anonymous: false, body: 'Took me about 10 days to get the letter. Started the casual job anyway — they used a TFN declaration and fixed it once the number came through.', createdAt: ago(4.8 * D), upvotes: 8, replies: [] },
    ],
  },
  {
    id: 'q_chk_bank', authorId: 'u_sabina', anonymous: false, category: 'general',
    title: 'Best bank account for someone who just landed?',
    body: 'Need a everyday account with a debit card. Which banks are newcomer-friendly and do not charge monthly fees if my balance is low the first few months?',
    photos: [], createdAt: ago(4.5 * D), upvotes: 18, views: 445,
    answers: [
      { id: 'a_chk_bank1', authorId: 'u_raj', anonymous: false, body: 'Most of the big four have student or basic accounts with no monthly fee if you deposit your salary each month. Bring passport, visa grant, and proof of address (even a letter from your landlord or hostel). You can often start online and finish in-branch.', createdAt: ago(4.4 * D), upvotes: 14, replies: [] },
      { id: 'a_chk_bank2', authorId: 'u_manish', anonymous: false, body: 'Compare the international transfer fees too if you will send money home — the account fee is only half the story.', createdAt: ago(4.3 * D), upvotes: 6, replies: [] },
    ],
  },
  {
    id: 'q_chk_myki', authorId: 'u_niraj', anonymous: false, category: 'general',
    title: 'Myki 101 — where to buy, how to top up, and common mistakes',
    body: 'First week in Melbourne and already confused by Myki. Where do I get a card, do I need to register it, and what happens if I forget to tap off?',
    photos: [], createdAt: ago(4 * D), upvotes: 21, views: 388,
    answers: [
      { id: 'a_chk_myki1', authorId: 'u_bibek', anonymous: false, body: 'Buy at any station machine or 7-Eleven. Register online so you can block it if lost. Always tap ON and OFF — on trains and trams. Forgetting to tap off on a train can charge you the default fare. Load money via the PTV app or at machines.', createdAt: ago(3.9 * D), upvotes: 16, replies: [] },
      { id: 'a_chk_myki2', authorId: 'u_pratima', anonymous: false, body: 'If you are studying full-time, check whether you qualify for a concession card — saves a lot over a semester.', createdAt: ago(3.8 * D), upvotes: 9, replies: [] },
    ],
  },
  {
    id: 'q_chk_health', authorId: 'u_dipesh', anonymous: false, category: 'health',
    title: 'Medicare vs OSHC — what do I actually need on a student visa?',
    body: 'My uni enrolled me in OSHC but people keep mentioning Medicare. Am I covered for GP visits, hospital, and scripts? What is the difference and what do I show at the clinic?',
    photos: [], createdAt: ago(3.5 * D), upvotes: 27, views: 620,
    answers: [
      { id: 'a_chk_h1', authorId: 'u_anita', anonymous: false, body: 'On a student visa you generally need OSHC (or equivalent) — not Medicare. OSHC covers GP, hospital and some scripts per your policy; always bring your insurer card and check if the clinic direct-bills. Medicare is for citizens and permanent residents (and some other eligible visas). Do not let OSHC lapse — it is a visa condition.', createdAt: ago(3.4 * D), upvotes: 31, replies: [] },
      { id: 'a_chk_h2', authorId: 'u_sabina', anonymous: false, body: 'Download your insurer app and save the emergency number on day one. Makes hospital visits much less stressful.', createdAt: ago(3.3 * D), upvotes: 7, replies: [] },
    ],
  },
  {
    id: 'q_chk_rent', authorId: 'u_manish', anonymous: false, category: 'real_estate',
    title: 'Rental bond and RTBA — how does it actually work?',
    body: 'About to sign my first lease in Footscray. Agent wants four weeks bond upfront. Is that normal, where does the money go, and how do I get it back when I leave?',
    photos: [], createdAt: ago(3.2 * D), upvotes: 22, views: 480,
    answers: [
      { id: 'a_chk_r1', authorId: 'u_sangita', anonymous: false, body: 'Four weeks bond is standard in Victoria. It must be lodged with the Residential Tenancies Bond Authority (RTBA) — not kept in the agent\'s pocket. You will get an RTBA receipt. At the end of the tenancy, claim it back via RTBA if you and the landlord agree; disputes go to VCAT. Never pay bond cash with no receipt.', createdAt: ago(3.1 * D), upvotes: 25, replies: [] },
      { id: 'a_chk_r2', authorId: 'u_bibek', anonymous: false, body: 'Take date-stamped photos on move-in day. Saved me when the agent tried to claim carpet damage that was already there.', createdAt: ago(3 * D), upvotes: 11, replies: [] },
    ],
  },
  {
    id: 'q_chk_emergency', authorId: 'u_pratima', anonymous: false, category: 'general',
    title: 'Emergency numbers every newcomer should save',
    body: 'Compiling a list for my cousin arriving next month. Besides 000, what else should be on the lock screen — mental health, poison, embassy, anything I am missing?',
    photos: [], createdAt: ago(2.8 * D), upvotes: 35, views: 890,
    answers: [
      { id: 'a_chk_e1', authorId: 'u_anita', anonymous: false, body: '000 for life-threatening emergencies (police, fire, ambulance). 13 11 14 Lifeline for crisis support. 13 11 26 Poisons Information. 1800 RESPECT for family violence. Save your embassy consulate number and your insurer\'s 24h line. Share your live location with someone you trust when travelling late.', createdAt: ago(2.7 * D), upvotes: 28, replies: [] },
      { id: 'a_chk_e2', authorId: 'u_niraj', anonymous: false, body: 'State Emergency Service (SES) 132 500 for floods/storms. Not 000 unless someone is hurt.', createdAt: ago(2.6 * D), upvotes: 9, replies: [] },
    ],
  },
  {
    id: 'q_fhb_pin', authorId: 'u_bishal', anonymous: false, circleId: 'c_fhb',
    title: 'PSA: stamp duty concessions for first home buyers in Victoria',
    body: 'If you are buying your first home under $750k in Victoria, you may qualify for a full or partial stamp duty exemption — but the rules differ for off-the-plan vs established, and PR/citizenship matters for FHOG. Pinning this so newcomers see it first.',
    photos: [], createdAt: ago(3 * H), upvotes: 19, views: 312,
    answers: [
      { id: 'a_fhb1', authorId: 'u_sangita', anonymous: false, body: 'Off-the-plan can be tricky — duty is often assessed on the contract price at settlement, and concessions phase in by price bracket. Always get your conveyancer to model the numbers before you sign.', createdAt: ago(2.5 * H), upvotes: 11, replies: [] },
      { id: 'a_fhb2', authorId: 'u_raj', anonymous: false, body: 'From a tax angle: the FHOG is not taxable income, but keep your settlement statement — you will need it for capital gains later if this is not your forever home.', createdAt: ago(2 * H), upvotes: 7, replies: [] },
    ],
  },
  {
    id: 'q_fhb_1', authorId: 'u_manish', anonymous: false, circleId: 'c_fhb',
    title: 'How much should we save before even looking at open homes?',
    body: 'Partner and I on combined ~$115k, renting in Footscray. Everyone says 20% deposit but that feels years away. Is 10% + LMI realistic for a townhouse in Wyndham, or are we kidding ourselves?',
    photos: [], createdAt: ago(9 * H), upvotes: 14, views: 198,
    answers: [
      { id: 'a_fhb3', authorId: 'u_bishal', anonymous: false, body: '10% + LMI is doable with several lenders if your employment is stable and debts are low. Run a borrowing-capacity check first — sometimes the deposit is not the bottleneck, serviceability is. Also budget ~5% for stamp duty, legal, and moving.', createdAt: ago(8 * H), upvotes: 16, replies: [] },
    ],
  },
  {
    id: 'q_fhb_2', authorId: 'u_dipesh', anonymous: false, circleId: 'c_fhb',
    title: 'Pre-approval expired — do I need to reapply from scratch?',
    body: 'Got pre-approval in January, found a place, but settlement got delayed and the letter expired last week. Same lender — is it a quick refresh or a whole new application?',
    photos: [], createdAt: ago(22 * H), upvotes: 6, views: 87,
    answers: [
      { id: 'a_fhb4', authorId: 'u_bishal', anonymous: false, body: 'Usually a refresh if your circumstances have not changed — updated payslips and bank statements, sometimes a new credit check. Do not wait until auction day; start the refresh now.', createdAt: ago(20 * H), upvotes: 9, replies: [] },
    ],
  },
  {
    id: 'q_tiny', authorId: 'u_sabina', anonymous: false, circleId: 'c_tiny',
    title: 'How long should gundruk ferment before drying?',
    body: 'Trying my first batch at home in a Melbourne winter. How many days in the jar before I sun-dry, and does indoor drying work if it is cloudy all week?',
    photos: [], createdAt: ago(2 * H), upvotes: 3, views: 28,
    answers: [],
  },
  {
    id: 'q_disc_cricket_1', authorId: 'u_niraj', anonymous: false, circleId: 'c_cricket',
    title: 'Looking for a casual cricket side in the north-west',
    body: 'Moved to Craigieburn and miss weekend games. Any social sides that welcome newcomers who are rusty but keen?',
    photos: [], createdAt: ago(40 * MIN), upvotes: 31, views: 410,
    answers: [
      { id: 'a_disc_c1', authorId: 'u_manish', anonymous: false, body: 'Our Footscray group sometimes needs an extra for Sunday friendlies — DM me and I will add you to the group chat.', createdAt: ago(25 * MIN), upvotes: 12, replies: [] },
    ],
  },
  {
    id: 'q_disc_cricket_2', authorId: 'u_manish', anonymous: false, circleId: 'c_cricket',
    title: 'Best shops for affordable cricket gear in Melbourne?',
    body: 'Need pads and gloves without paying pro-shop prices. Where does everyone buy gear?',
    photos: [], createdAt: ago(5 * H), upvotes: 22, views: 290,
    answers: [
      { id: 'a_disc_c2', authorId: 'u_bibek', anonymous: false, body: 'Sports Traders and the big-box stores run end-of-season sales. Second-hand from Facebook marketplace is fine for casual grade.', createdAt: ago(4 * H), upvotes: 9, replies: [] },
    ],
  },
  {
    id: 'q_disc_cricket_3', authorId: 'u_niraj', anonymous: false, circleId: 'c_cricket',
    title: 'Indoor nets in winter — groups taking newcomers?',
    body: 'Want to keep batting through winter. Any indoor centres or groups around the north that let casuals book a net spot?',
    photos: [], createdAt: ago(2.5 * D), upvotes: 38, views: 520,
    answers: [
      { id: 'a_disc_c3', authorId: 'u_niraj', anonymous: false, body: 'Updating: found a Sunday slot at a Craigieburn indoor centre — happy to share if others want in.', createdAt: ago(2.3 * D), upvotes: 14, replies: [] },
      { id: 'a_disc_c4', authorId: 'u_manish', anonymous: false, body: 'Several clubs hire indoor lanes by the hour in the off-season — call ahead, some have beginner-friendly blocks.', createdAt: ago(2.2 * D), upvotes: 8, replies: [] },
    ],
  },
  {
    id: 'q23', authorId: 'u_bibek', anonymous: false, category: 'general',
    title: 'Best value grocery runs for Nepali staples in the west?',
    body: 'Where is everyone buying rice, lentils, spices and the occasional gundruk without paying tourist prices? Western suburbs preferred but happy to drive for a good shop.',
    photos: [], createdAt: ago(8 * D), upvotes: 29, views: 820,
    answers: [
      { id: 'a36', authorId: 'u_niraj', anonymous: false, body: 'Buy rice and lentils in bulk from the big subcontinental grocers — way cheaper per kg. Spices from the same shops beat supermarket jars easily. For gundruk and specialty items the Nepali stores in the west are the move.', createdAt: ago(7.9 * D), upvotes: 16, replies: [] },
      { id: 'a37', authorId: 'u_sabina', anonymous: false, body: 'Split a bulk order with a friend or two — 10kg bags are unbeatable value if you can store them.', createdAt: ago(7.8 * D), upvotes: 8, replies: [] },
    ],
  },
];

// Following: 'me' follows a couple of experts by default so the Following tab
// isn't empty (Build Brief v2).
export const seedFollowing = ['u_sunita', 'u_anita'];

// Notifications addressed to the signed-in user. The expert-answer entry is the
// visually elevated type in the Activity screen.
export const seedNotifications = [
  { id: 'n0', type: 'digest', text: 'Your circles today: 5 new questions in Visa & Migration, 2 expert answers in Tax & Super.', createdAt: ago(6 * H), read: false },
  { id: 'n0b', type: 'expert_karma', actorId: 'u_sunita', questionId: 'q1', text: 'Sunita found your answer helpful (+25 karma)', createdAt: ago(9 * H), read: false },
  { id: 'n1', type: 'expert_answer', actorId: 'u_sunita', questionId: 'q1', text: 'Sunita Gurung, a verified Migration Agent, answered a question you’re following', createdAt: ago(11 * MIN), read: false },
  { id: 'n2', type: 'answer', actorId: 'u_anita', questionId: 'q3', text: 'Dr. Anita Thapa answered “Bulk-billing GP near Footscray…”', createdAt: ago(80 * MIN), read: false },
  { id: 'n3', type: 'milestone', questionId: 'q15', milestone: 50, text: 'A question you upvoted passed 50 upvotes 🎉', createdAt: ago(20 * H), read: false },
  { id: 'n4', type: 'follow', actorId: 'u_bibek', text: 'Bibek K.C. started following you', createdAt: ago(2 * D), read: true },
  { id: 'n5', type: 'expert', text: 'Namaste — welcome to Chautari! Follow a few experts to make your feed yours.', createdAt: ago(4 * D), read: true },
];
