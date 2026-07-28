/** Single source of truth for bank-demo credentials / display names. */

export type PersonaId = 'apex_user' | 'apex_2fa' | 'apex_locked' | 'apex_glitch';

export type Persona = {
  password: string;
  displayName: string;
};

export const PERSONAS: Record<PersonaId, Persona> = {
  apex_user: { password: 'Password123!', displayName: 'Apex User' },
  apex_2fa: { password: 'Password2FA!', displayName: 'Apex 2FA' },
  apex_locked: { password: 'Password123!', displayName: 'Apex Locked' },
  apex_glitch: { password: 'Password123!', displayName: 'Apex Glitch' },
};
