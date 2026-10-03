import React from 'react';
import { BetSlip } from '../types/bet';
import {
  BetHistoryCard as HistoryCard,
  BetHistoryCardProps as BaseProps,
} from './history/BetHistoryCard';
import { formatBetDate } from '../utils/dateFormatter';

export * from './history/BetHistoryCard';

export interface BetHistoryCardProps extends Partial<BaseProps> {
  coupon?: BetSlip;
  onPress?: () => void;
  onOptionsPress?: (e?: any) => void;
  onNotificationPress?: () => void;
}

export const BetHistoryCard: React.FC<BetHistoryCardProps> = ({
  coupon,
  ...props
}) => {
  if (coupon) {
    const isPaye =
      coupon.status === 'Payé' ||
      coupon.status === 'Gagné' ||
      coupon.status === 'Gain';
    const isLost = coupon.status === 'Perdu';
    const payoutAmount =
      isPaye
        ? (coupon.actualPayout || coupon.potentialPayout || (coupon.stake * (coupon.totalOdds || 1)))
        : isLost
        ? 0
        : coupon.potentialPayout;

    const firstEvent = coupon.events?.[0];
    const sportCategory =
      props.sportCategory ??
      (coupon as any).gameCategory ??
      (firstEvent as any)?.gameCategory ??
      (firstEvent as any)?.sport ??
      (firstEvent as any)?.sportCategory;

    return (
      <HistoryCard
        ticketNumber={props.ticketNumber ?? coupon.id}
        date={formatBetDate(props.date ?? coupon.createdAt)}
        type={props.type ?? coupon.type}
        eventsCount={
          props.eventsCount ?? coupon.eventsCount ?? coupon.events?.length ?? 1
        }
        sportCategory={sportCategory}
        odds={props.odds ?? coupon.totalOdds}
        stake={props.stake ?? coupon.stake}
        potentialGain={props.potentialGain ?? payoutAmount}
        status={props.status ?? (isPaye ? 'Payé' : coupon.status)}
        onPress={props.onPress}
        onOptionsPress={props.onOptionsPress}
        onBellPress={props.onBellPress ?? props.onNotificationPress}
        {...props}
      />
    );
  }

  return <HistoryCard {...props} />;
};

export const TicketCardHeader = () => null;
export type TicketHeaderProps = any;
export const TicketStatusBadge = () => null;
export type HistoryBetCardProps = BetHistoryCardProps;
export const HistoryBetCard = BetHistoryCard;
export const BetTicketCard = BetHistoryCard;
export type BetTicketCardProps = BetHistoryCardProps;
export default BetHistoryCard;
