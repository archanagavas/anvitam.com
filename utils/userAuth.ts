// utils/userAuth.ts — Global Real-time Session & Metered Credit Sync Manager

export interface ToolUser {
  id?: string;
  email: string;
  name?: string;
  country?: string;
  credits_remaining: number;
  credits_used?: number;
  is_subscribed: boolean;
  subscription_plan?: 'topup_10' | 'pro_monthly' | 'yearly_pass' | string | null;
  subscription_end?: string | null;
  credit_expiry?: string | null;
  trial_days_remaining: number;
  has_access: boolean;
}

const USER_KEY = 'anvitam_tool_user';
const TOKEN_KEY = 'anvitam_tool_token';

export function getToolUser(): ToolUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ToolUser;
  } catch {
    return null;
  }
}

export function updateToolUser(updates: Partial<ToolUser>): ToolUser | null {
  const current = getToolUser();
  if (!current) return null;
  const updated = { ...current, ...updates };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: updated }));
  return updated;
}

export function deductUserCredit(cost: number = 1): { success: boolean; user: ToolUser | null } {
  const current = getToolUser();
  if (!current) return { success: false, user: null };

  // Check credit expiry if set
  if (current.credit_expiry) {
    const expiryDate = new Date(current.credit_expiry);
    if (expiryDate.getTime() < Date.now() && !current.is_subscribed) {
      return { success: false, user: current };
    }
  }

  // Deduct credits per tool run if available
  if (current.credits_remaining < cost && !current.is_subscribed) {
    return { success: false, user: current };
  }

  const newCredits = current.is_subscribed ? current.credits_remaining : Math.max(0, current.credits_remaining - cost);
  const newUsed = (current.credits_used ?? 0) + cost;
  const updated = updateToolUser({
    credits_remaining: newCredits,
    credits_used: newUsed
  });
  return { success: true, user: updated };
}

export function logoutToolUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: null }));
}
