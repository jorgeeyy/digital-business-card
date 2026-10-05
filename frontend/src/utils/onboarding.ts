export const ONBOARDING_STEPS = ['socials', 'details', 'theme'] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

function storageKey(userId: number): string {
  return `tap-onboarding-step:u:${userId}`;
}

export function readOnboardingStep(userId: number): OnboardingStep | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw && (ONBOARDING_STEPS as readonly string[]).includes(raw)
      ? (raw as OnboardingStep)
      : null;
  } catch {
    return null;
  }
}

export function writeOnboardingStep(userId: number, step: OnboardingStep): void {
  try {
    localStorage.setItem(storageKey(userId), step);
  } catch {
    /* quota exceeded or private mode */
  }
}

export function clearOnboardingStep(userId: number): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* ignore */
  }
}
