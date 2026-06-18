'use client';

import { redeemPremiumWithPoints } from '@/lib/community/actions';

type Props = {
  label: string;
  userPoints: number;
  cost: number;
};

export function RedeemPremiumButton({ label, userPoints, cost }: Props) {
  if (userPoints < cost) return null;

  return (
    <form action={redeemPremiumWithPoints}>
      <button type="submit" className="btn btn--ghost">{label}</button>
    </form>
  );
}
