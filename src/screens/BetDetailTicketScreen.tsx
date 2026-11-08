import TicketDetailsScreen, {
  BetDetailEvent,
  Props as BetDetailTicketScreenProps,
} from './TicketDetailsScreen';
import { TicketDivider } from '../components/TicketDivider';
import { BetDetailsCard } from '../components/BetDetailsCard';

export const BetDetailTicketScreen = TicketDetailsScreen;
export { TicketDivider, BetDetailsCard };
export type { BetDetailEvent, BetDetailTicketScreenProps };

export default TicketDetailsScreen;
