import React from 'react';
import { TeamLogo as CommonTeamLogo } from './common/TeamLogo';

interface TeamLogoProps {
  logoUrl?: string;
  name?: string;
  teamName?: string;
  shortCode?: string;
  size?: number;
  leagueName?: string;
  isNationalTeam?: boolean;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logoUrl,
  name,
  teamName,
  size = 36,
  leagueName,
  isNationalTeam,
}) => {
  return (
    <CommonTeamLogo
      teamName={teamName || name || ''}
      logoUrl={logoUrl}
      size={size}
      leagueName={leagueName}
      isNationalTeam={isNationalTeam}
    />
  );
};

export default TeamLogo;
