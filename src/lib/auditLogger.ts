import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export enum ActionType {
  TASK_CREATE = 'TASK_CREATE',
  TASK_UPDATE = 'TASK_UPDATE',
  TASK_DELETE = 'TASK_DELETE',
  HANDOVER_INITIATE = 'HANDOVER_INITIATE',
  HANDOVER_ACKNOWLEDGE = 'HANDOVER_ACKNOWLEDGE',
  OFFICE_REGISTER = 'OFFICE_REGISTER',
  OFFICE_UPDATE = 'OFFICE_UPDATE',
  OFFICE_DELETE = 'OFFICE_DELETE',
  SYSTEM_RESET = 'SYSTEM_RESET',
  AI_INTERACTION = 'AI_INTERACTION'
}

export async function logAction(action: ActionType, details: any) {
  if (!auth.currentUser) return;

  try {
    await addDoc(collection(db, 'audit_logs'), {
      action,
      details,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Audit Logging Failed:', error);
  }
}
