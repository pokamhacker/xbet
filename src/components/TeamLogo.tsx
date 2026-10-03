import React from 'react';
import { TeamLogo as CommonTeamLogo } from './common/TeamLogo';

interface TeamLogoProps {
  logoUrl?: string;
  name?: string;
  teamName?: string;
  shortCode?: string;
  size?: number;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logoUrl,
  name,
  teamName,
  size = 36,
}) => {
  return (
    <CommonTeamLogo
      teamName={teamName || name || ''}
      logoUrl={logoUrl}
      size={size}
    />
  );
};

export default TeamLogo;
