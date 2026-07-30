export type SetupDraft = {
  quitReason: string;
  vapesPerWeek: string;
  vapingHistory: string;
  daysPerVape: string;
  costPerVape: string;
  quitGoal: string;
};

type Option = {
  title: string;
  value: string;
  description?: string;
};

export type SetupStep = {
  key: keyof SetupDraft;
  title: string;
  description: string;
  kind: 'options' | 'number';
  inputLabel?: string;
  inputPlaceholder?: string;
  options?: Option[];
};

export const EMPTY_DRAFT: SetupDraft = {
  quitReason: '',
  vapesPerWeek: '',
  vapingHistory: '',
  daysPerVape: '',
  costPerVape: '1',
  quitGoal: '',
};

export const SETUP_STEPS: SetupStep[] = [
  {
    key: 'quitReason',
    title: 'Why Do You Want to Quit?',
    description: "What's your biggest reason for quitting?",
    kind: 'options',
    options: [
      { title: 'Improve my health', value: 'health' },
      { title: 'Save money', value: 'money' },
      { title: 'My family & loved ones', value: 'family' },
      { title: 'Feel more in control', value: 'control' },
      { title: 'Breathe easier', value: 'breathing' },
      { title: 'Other', value: 'other' },
    ],
  },
  {
    key: 'vapesPerWeek',
    title: 'How Often Do You Vape?',
    description: 'Help us understand your current habit so we can tailor your quit plan.',
    kind: 'options',
    options: [
      { title: 'A few times a week', value: '1' },
      { title: '1-3 times a day', value: '3' },
      { title: '4-10 times a day', value: '7' },
      { title: 'More than 10 times a day', value: '12' },
      { title: 'Almost constantly', value: '20' },
      { title: 'Not sure', value: '5' },
    ],
  },
  {
    key: 'vapingHistory',
    title: 'How Long Have You Been Vaping?',
    description: 'Knowing your history helps us build a quit plan that fits your journey.',
    kind: 'options',
    options: [
      { title: 'Less than 1 month', value: 'under_1_month' },
      { title: '1-6 months', value: '1_to_6_months' },
      { title: '6 months - 1 year', value: '6_to_12_months' },
      { title: '1-2 years', value: '1_to_2_years' },
      { title: 'More than 2 years', value: 'over_2_years' },
    ],
  },
  {
    key: 'daysPerVape',
    title: 'How long does one vape usually last?',
    description: "This helps us estimate how many vapes you've avoided.",
    kind: 'options',
    options: [
      { title: 'Less than 1 day', value: '0.5' },
      { title: '1 day', value: '1' },
      { title: '2-3 days', value: '3' },
      { title: '4-7 days', value: '6' },
      { title: 'More than a week', value: '8' },
    ],
  },
  {
    key: 'quitGoal',
    title: 'Choose Your Quit Goal',
    description: 'Pick the goal that motivates you most. You can always change it later.',
    kind: 'options',
    options: [
      { title: 'Quit for good', value: 'quit_good', description: 'I want to completely quit vaping forever.' },
      { title: 'Cut down first', value: 'cut_down', description: 'I want to reduce how much I vape over time.' },
      { title: 'Quit by a specific date', value: 'specific_date', description: 'I want to quit vaping by a certain day.' },
      { title: 'Improve my health', value: 'health', description: 'I want to feel better, breathe easier, and live healthier.' },
      { title: 'Not sure yet', value: 'not_sure', description: "I'm still figuring it out." },
    ],
  },
];
