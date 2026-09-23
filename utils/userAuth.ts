// utils/userAuth.ts — Global Real-time Session & Metered Credit Sync Manager

export interface ToolUser {
  id?: string;
  email: string;
  name?: string;
  country?: string;
  credits_remaining: number;
  credits_used?: number;
  is_subscribed: boolean;
  is_admin?: boolean;
  role?: string;
  is_guest?: boolean;
  subscription_plan?: 'topup_10' | 'pro_monthly' | 'yearly_pass' | string | null;
  subscription_end?: string | null;
  credit_expiry?: string | null;
  trial_days_remaining: number;
  has_access: boolean;
}

const USER_KEY = 'anvitam_tool_user';
const TOKEN_KEY = 'anvitam_tool_token';
const ADMIN_TOKEN_KEY = 'anvitam_admin_token';
const LOGOUT_KEY = 'anvitam_logged_out';

let inMemoryUser: ToolUser | null = null;

export function isUserAdmin(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
    if (adminToken) return true;
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.is_admin || parsed.role === 'admin' || (parsed.email && parsed.email.toLowerCase() === 'ar.archanagavas@gmail.com')) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function getToolUser(): ToolUser | null {
  try {
    if (typeof window === 'undefined') return inMemoryUser;
    
    // Check if explicitly logged out in this session
    const isLoggedOut = sessionStorage.getItem(LOGOUT_KEY) === 'true';
    if (isLoggedOut) return null;

    // Check if Admin session exists
    const adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    let user: ToolUser | null = raw ? (JSON.parse(raw) as ToolUser) : inMemoryUser;

    if (adminToken || (user && (user.is_admin || user.role === 'admin' || user.email?.toLowerCase() === 'ar.archanagavas@gmail.com'))) {
      const adminUser: ToolUser = {
        id: user?.id || 'admin_studio_lead',
        email: user?.email || 'ar.archanagavas@gmail.com',
        name: user?.name || 'Studio Admin',
        country: user?.country || 'IN',
        credits_remaining: 999999,
        credits_used: user?.credits_used || 0,
        is_subscribed: true,
        is_admin: true,
        role: 'admin',
        is_guest: false,
        trial_days_remaining: 365,
        has_access: true,
        subscription_plan: 'pro_monthly'
      };
      return adminUser;
    }

    if (!raw) return inMemoryUser;
    return user;
  } catch (err) {
    console.warn('[userAuth] Storage read warning:', err);
    return inMemoryUser;
  }
}

export const DEFAULT_TRIAL_CREDITS = 3;

export function getOrCreateDefaultToolUser(): ToolUser {
  let user = getToolUser();
  if (!user) {
    user = {
      id: `guest_${Date.now()}__${Math.random().toString(36).substring(2, 6)}`,
      email: 'guest@anvitam.com',
      name: 'Guest Designer',
      credits_remaining: DEFAULT_TRIAL_CREDITS,
      credits_used: 0,
      is_subscribed: false,
      is_admin: false,
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
  const isAdmin = isUserAdmin() || user.is_admin || user.role === 'admin' || user.email?.toLowerCase() === 'ar.archanagavas@gmail.com';
  const authenticatedUser: ToolUser = {
    ...user,
    is_guest: false,
    is_admin: isAdmin,
    credits_remaining: isAdmin ? 999999 : user.credits_remaining,
    is_subscribed: isAdmin ? true : user.is_subscribed,
    has_access: true
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

export function deductUserCredit(cost: number = 1, modelTier: string = 'fast'): { success: boolean; user: ToolUser | null } {
  const current = getToolUser() || getOrCreateDefaultToolUser();
  if (!current) return { success: false, user: null };

  // Admin bypass: Admins have unlimited access with ZERO credit deduction
  if (current.is_admin || current.role === 'admin' || isUserAdmin()) {
    return { success: true, user: { ...current, is_admin: true, credits_remaining: 999999, is_subscribed: true } };
  }

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

  // Background sync with API if logged in
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch('/api/tools/consume-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modelTier })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && typeof data.credits_remaining === 'number') {
          updateToolUser({ credits_remaining: data.credits_remaining, credits_used: data.credits_used });
        }
      })
      .catch(err => console.warn('[userAuth] Server credit sync warning:', err));
    }
  }

  return { success: true, user: updated };
}

export async function backgroundSyncCredits() {
  if (typeof window === 'undefined') return;
  if (isUserAdmin()) return; // No sync needed for admin
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  try {
    const res = await fetch('/api/tools/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      updateToolUser({
        credits_remaining: data.is_admin ? 999999 : data.credits_remaining,
        credits_used: data.credits_used,
        is_subscribed: data.is_subscribed,
        is_admin: data.is_admin,
        subscription_end: data.subscription_end,
        subscription_plan: data.subscription_plan
      });
    }
  } catch (err) {
    console.warn('[userAuth] background sync failed:', err);
  }
}

export function logoutToolUser() {
  inMemoryUser = null;
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(LOGOUT_KEY, 'true');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('anvitam_design_chats');
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: null }));
    }
  } catch (err) {
    console.warn('[userAuth] Storage logout warning:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: null }));
    }
  }
}
