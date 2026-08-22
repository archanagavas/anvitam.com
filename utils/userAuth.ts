// utils/userAuth.ts — Global Real-time Session & Metered Credit Sync Manager

export interface ToolUser {
  id?: string;
  email: string;
  name?: string;
  country?: string;
  credits_remaining: number;
  credits_used?: number;
  is_subscribed: boolean;
  is_guest?: boolean;
  subscription_plan?: 'topup_10' | 'pro_monthly' | 'yearly_pass' | string | null;
  subscription_end?: string | null;
  credit_expiry?: string | null;
  trial_days_remaining: number;
  has_access: boolean;
}

const USER_KEY = 'anvitam_tool_user';
const TOKEN_KEY = 'anvitam_tool_token';
const LOGOUT_KEY = 'anvitam_logged_out';

let inMemoryUser: ToolUser | null = null;

export function getToolUser(): ToolUser | null {
  try {
    if (typeof window === 'undefined') return inMemoryUser;
    
    // Check if explicitly logged out in this session
    const isLoggedOut = sessionStorage.getItem(LOGOUT_KEY) === 'true';
    if (isLoggedOut) return null;

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return inMemoryUser;
    return JSON.parse(raw) as ToolUser;
  } catch (err) {
    console.warn('[userAuth] Storage read warning:', err);
    return inMemoryUser;
  }
}

export function getOrCreateDefaultToolUser(): ToolUser {
  let user = getToolUser();
  if (!user) {
    user = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: 'guest@anvitam.com',
      name: 'Guest Designer',
      credits_remaining: 5,
      credits_used: 0,
      is_subscribed: false,
      is_guest: true,
      trial_days_remaining: 15,
      has_access: true,
    };
    inMemoryUser = user;
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(LOGOUT_KEY);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (err) {
      console.warn('[userAuth] Storage write warning:', err);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: user }));
    }
  }
  return user;
}

export function updateToolUser(updates: Partial<ToolUser>): ToolUser | null {
  const current = getToolUser() || getOrCreateDefaultToolUser();
  if (!current) return null;
  const updated = { ...current, ...updates };
  inMemoryUser = updated;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: updated }));
    }
  } catch (err) {
    console.warn('[userAuth] Storage update warning:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: updated }));
    }
  }
  return updated;
}

export function setToolUser(user: ToolUser, token?: string): ToolUser {
  const authenticatedUser: ToolUser = {
    ...user,
    is_guest: false
  };
  inMemoryUser = authenticatedUser;
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(LOGOUT_KEY);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      if (token) localStorage.setItem(TOKEN_KEY, token);
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: authenticatedUser }));
    }
  } catch (err) {
    console.warn('[userAuth] Storage set warning:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: authenticatedUser }));
    }
  }
  return authenticatedUser;
}

export function deductUserCredit(cost: number = 1): { success: boolean; user: ToolUser | null } {
  const current = getToolUser() || getOrCreateDefaultToolUser();
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
  inMemoryUser = null;
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(LOGOUT_KEY, 'true');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: null }));
    }
  } catch (err) {
    console.warn('[userAuth] Storage logout warning:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: null }));
    }
  }
}
