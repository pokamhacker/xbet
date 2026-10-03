import React from 'react';
import { TicketDivider, TicketDividerProps } from './TicketDivider';

export interface TicketPerforationProps extends TicketDividerProps {
  ticketColor?: string;
  dashedColor?: string;
}

export const TicketPerforation: React.FC<TicketPerforationProps> = ({
  dashedColor,
  dotColor,
  backgroundColor,
  notchSize = 12,
  ...props
}) => {
  return (
    <TicketDivider
      backgroundColor={backgroundColor}
      dotColor={dotColor || dashedColor}
      notchSize={notchSize}
      {...props}
    />
  );
};

export default TicketPerforation;

