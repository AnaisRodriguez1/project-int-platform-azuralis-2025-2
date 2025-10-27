import { UserRole } from '../../shared/enums/user-role.enum';

export const PERMISSIONS_BY_ROLE = {
  [UserRole.DOCTOR]: {
    notes: { create: true, read: true, update: true, delete: true, scope: 'all' },
    documents: { create: true, read: true, update: true, delete: true, scope: 'all' },
  },
  [UserRole.NURSE]: {
    notes: { create: true, read: true, update: true, delete: false, scope: 'all' },
    documents: { create: true, read: true, update: true, delete: false, scope: 'all' },
  },
  [UserRole.GUARDIAN]: {
    notes: { create: true, read: true, update: true, delete: true, scope: 'own' },
    documents: { create: true, read: true, update: true, delete: true, scope: 'own' },
  },
  [UserRole.PATIENT]: {
    notes: { create: true, read: true, update: true, delete: true, scope: 'own' },
    documents: { create: true, read: true, update: true, delete: true, scope: 'own' },
  },
};
