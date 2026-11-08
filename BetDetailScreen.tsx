import TicketDetailsScreen, {
  BetDetailEvent,
  Props as BetDetailScreenProps,
} from './src/screens/TicketDetailsScreen';

export const BetDetailScreen = TicketDetailsScreen;
export type BetEventSelection = any;
export type BetTicket = any;
export const mapBetSlipToBetTicket = (slip: any) => slip;
export type { BetDetailEvent, BetDetailScreenProps };

export default TicketDetailsScreen;
