import { Status, Priority, Shift, Task, Handover, Office, User } from './types';

export const INITIAL_USER: User = {
  name: 'Ahmed Essmat',
  role: 'Regional Operations',
  office: 'Cairo HQ',
  country: 'EG',
};

export const TEAMS = [
  'Influencer Ops',
  'Coverage',
  'Coordination',
  'Activation',
  'Onboarding',
  'Client Success',
  'Data',
  'AI',
];

export const OFFICES: Office[] = [
  { id: '1', name: 'Riyadh Office', country: 'KSA', lead: 'Mona KSA', shift: Shift.MORNING },
  { id: '2', name: 'Dubai Office', country: 'UAE', lead: 'Nour UAE', shift: Shift.MORNING },
  { id: '3', name: 'Kuwait Office', country: 'KW', lead: 'Fahad KW', shift: Shift.NIGHT },
  { id: '4', name: 'Cairo HQ', country: 'EG', lead: 'Ahmed Essmat', shift: Shift.MID },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Audit Tashas missing coverage links',
    country: 'KSA',
    office: 'Riyadh Office',
    team: 'Coverage',
    owner: 'Mona KSA',
    shift: Shift.MORNING,
    priority: Priority.HIGH,
    status: Status.BLOCKED,
    due: new Date().toISOString(),
    details: 'Waiting for influencer proof links from agents.',
    carry: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't2',
    title: 'Daily client snapshot UAE Restaurants',
    country: 'UAE',
    office: 'Dubai Office',
    team: 'Client Success',
    owner: 'Nour UAE',
    shift: Shift.MORNING,
    priority: Priority.MEDIUM,
    status: Status.IN_PROGRESS,
    due: new Date().toISOString(),
    carry: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_HANDOVERS: Handover[] = [
  {
    id: 'h1',
    date: new Date().toISOString().split('T')[0],
    fromShift: Shift.MORNING,
    toShift: Shift.MID,
    fromOffice: 'Riyadh Office',
    toOffice: 'Cairo HQ',
    outgoing: 'Mona KSA',
    incoming: 'Ahmed Essmat',
    status: 'Pending',
    watchouts: 'Please prioritize the Tashas audit as the client is chasing.',
    taskIds: ['t1'],
    createdAt: new Date().toISOString(),
  },
];
