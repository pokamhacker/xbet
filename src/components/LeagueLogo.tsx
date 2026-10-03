import React from 'react';
import { LeagueLogo as CommonLeagueLogo } from './common/LeagueLogo';

interface LeagueLogoProps {
  logoUrl?: string;
  name?: string;
  leagueName?: string;
  size?: number;
}

export const LeagueLogo: React.FC<LeagueLogoProps> = ({
  logoUrl,
  name,
  leagueName,
  size = 28,
}) => {
  return (
    <CommonLeagueLogo
      leagueName={leagueName || name || ''}
      logoUrl={logoUrl}
      size={size}
    />
  );
};

export default LeagueLogo;
