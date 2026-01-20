export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export type SubscriptionPlanType = 'monthly' | 'yearly';

const monthlyMembershipPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_1SpuRzElNJegsmPmDjI2JnYv';
const yearlyMembershipPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || '';

// Zaryo token price IDs
const zaryo100PriceId = process.env.NEXT_PUBLIC_STRIPE_100_ZARYO_PRICE_ID || '';
const zaryo500PriceId = process.env.NEXT_PUBLIC_STRIPE_500_ZARYO_PRICE_ID || '';
const zaryo1000PriceId = process.env.NEXT_PUBLIC_STRIPE_1000_ZARYO_PRICE_ID || '';
const zaryo5000PriceId = process.env.NEXT_PUBLIC_STRIPE_5000_ZARYO_PRICE_ID || '';

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanType, { priceId: string }> = {
  monthly: {
    priceId: monthlyMembershipPriceId,
  },
  yearly: {
    priceId: yearlyMembershipPriceId,
  },
};

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TnVSr2jzOZAzHi',
    priceId: monthlyMembershipPriceId,
    name: 'Zariel & Co Monthly Membership',
    description: 'Monthly membership for Zariel & Co influencer App',
    price: 9.99,
    currency: 'USD',
    mode: 'subscription',
  },
  {
    id: 'zaryo_100',
    priceId: zaryo100PriceId,
    name: '100 Zaryo',
    description: 'Purchase 100 Zaryo tokens',
    price: 1.00,
    currency: 'USD',
    mode: 'payment',
  },
  {
    id: 'zaryo_500',
    priceId: zaryo500PriceId,
    name: '500 Zaryo',
    description: 'Purchase 500 Zaryo tokens',
    price: 5.00,
    currency: 'USD',
    mode: 'payment',
  },
  {
    id: 'zaryo_1000',
    priceId: zaryo1000PriceId,
    name: '1000 Zaryo',
    description: 'Purchase 1000 Zaryo tokens',
    price: 10.00,
    currency: 'USD',
    mode: 'payment',
  },
  {
    id: 'zaryo_5000',
    priceId: zaryo5000PriceId,
    name: '5000 Zaryo',
    description: 'Purchase 5000 Zaryo tokens',
    price: 50.00,
    currency: 'USD',
    mode: 'payment',
  },
];
