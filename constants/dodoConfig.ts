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

export const DODO_PRODUCTS: Record<'topup_10' | 'topup_50' | 'pro_monthly', DodoProductConfig> = {
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
  topup_50: {
    id: 'topup_50',
    name: 'Anvitam Studio — 50 Credits Agency Pack',
    taxCategory: 'Digital Goods / SaaS Software',
    pricingType: 'one_time',
    productId: 'pdt_0NlZ5UEJiErzLixmkxbda_50',
    checkoutUrl: 'https://checkout.dodopayments.com/buy/pdt_0NlZ5UEJiErzLixmkxbda?quantity=5',
    creditsGrant: 50,
    creditExpiryDays: 90,
    priceINR: '₹699',
    priceUSD: '$9.99',
    popularBadge: 'HIGH VOLUME',
    description: '50 Studio Credits one-time pack for active design agencies and freelancers.',
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Anvitam Studio — Pro Monthly Pass',
    taxCategory: 'SaaS Subscription',
    pricingType: 'monthly_subscription',
    productId: 'pdt_0NlZ5wDhqx68MxeHE06JE',
    checkoutUrl: 'https://checkout.dodopayments.com/buy/pdt_0NlZ5wDhqx68MxeHE06JE?quantity=1',
    creditsGrant: 120,
    creditExpiryDays: 30,
    priceINR: '₹799',
    priceUSD: '$10.00',
    popularBadge: 'BEST VALUE',
    description: '120 Studio Credits per month automatically refilled for active architects, planners & design studios.',
  },
};

/**
 * Returns the checkout link for a given plan & customer email.
 */
export function getDodoCheckoutUrl(
  planId: 'topup_10' | 'topup_50' | 'pro_monthly' | string,
  userEmail?: string
): string {
  const prod = DODO_PRODUCTS[planId as 'topup_10' | 'topup_50' | 'pro_monthly'] || DODO_PRODUCTS.pro_monthly;
  const baseUrl = prod.checkoutUrl;
  
  if (!userEmail) return baseUrl;

  const delimiter = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${delimiter}email=${encodeURIComponent(userEmail)}`;
}
