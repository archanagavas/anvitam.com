// constants/dodoConfig.ts — Central Configuration for Dodo Payments & Metered Studio Credit Wallet

export interface DodoProductConfig {
  id: string;
  name: string;
  taxCategory: 'Digital Goods / SaaS Software' | 'SaaS Subscription';
  pricingType: 'one_time' | 'monthly_subscription';
  productId: string;
  checkoutUrl: string;
  creditsGrant: number; // Credits added/refilled per cycle
  creditExpiryDays: number;
  priceINR: string;
  priceUSD: string;
  popularBadge?: string;
  description: string;
}

export const DODO_METERED_CREDIT_CONFIG = {
  creditName: 'Studio Credits',
  unitName: 'Studio Credit',
  precision: 0,
  defaultExpiryDays: 30,
};

export const DODO_PRODUCTS: Record<'topup_10' | 'pro_monthly', DodoProductConfig> = {
  topup_10: {
    id: 'topup_10',
    name: 'Anvitam Studio — 10 Credits Top-Up',
    taxCategory: 'Digital Goods / SaaS Software',
    pricingType: 'one_time',
    productId: 'pdt_0NlZ5UEJiErzLixmkxbda',
    checkoutUrl: 'https://checkout.dodopayments.com/buy/pdt_0NlZ5UEJiErzLixmkxbda?quantity=1',
    creditsGrant: 10,
    creditExpiryDays: 90,
    priceINR: '₹149',
    priceUSD: '$2.50',
    description: '10 Studio Credits top-up pack for single projects & pay-as-you-go architects.',
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Anvitam Studio — Pro Monthly',
    taxCategory: 'SaaS Subscription',
    pricingType: 'monthly_subscription',
    productId: 'pdt_0NlZ5wDhqx68MxeHE06JE',
    checkoutUrl: 'https://checkout.dodopayments.com/buy/pdt_0NlZ5wDhqx68MxeHE06JE?quantity=1',
    creditsGrant: 250,
    creditExpiryDays: 30,
    priceINR: '₹299',
    priceUSD: '$5.00',
    popularBadge: 'MOST POPULAR',
    description: '250 Studio Credits per month automatically refilled for active studios & solar designers.',
  },
};

/**
 * Returns the checkout link for a given plan & customer email.
 */
export function getDodoCheckoutUrl(
  planId: 'topup_10' | 'pro_monthly' | string,
  userEmail?: string
): string {
  const prod = DODO_PRODUCTS[planId as 'topup_10' | 'pro_monthly'] || DODO_PRODUCTS.pro_monthly;
  const baseUrl = prod.checkoutUrl;
  
  if (!userEmail) return baseUrl;

  const delimiter = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${delimiter}email=${encodeURIComponent(userEmail)}`;
}
