import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BotBet } from '../types';

interface CrashBotsTableProps {
  bots: BotBet[];
  totalBetsCount: number;
  totalBetsAmount: number;
  totalGainsAmount: number;
}

export const CrashBotsTable: React.FC<CrashBotsTableProps> = ({
  bots,
  totalBetsCount,
  totalBetsAmount,
  totalGainsAmount,
}) => {
  const formatXAF = (val: number) => {
    return val.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' XAF';
  };

  return (
    <View style={styles.container}>
      {/* 1. En-tête statistique rouge-orangé (#E05A2B) à 3 colonnes comme sur les captures */}
      <View style={styles.summaryBar}>
        {/* Col 1 : Nombre de paris */}
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Nombre de paris</Text>
          <View style={styles.summaryValueRow}>
            <MaterialCommunityIcons name="account" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.summaryValue}>{totalBetsCount}</Text>
          </View>
        </View>

        {/* Col 2 : Total des paris */}
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Total des paris</Text>
          <View style={styles.summaryValueRow}>
            <FontAwesome5 name="coins" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.summaryValue} numberOfLines={1}>
              {formatXAF(totalBetsAmount)}
            </Text>
          </View>
        </View>

        {/* Col 3 : Gains totaux */}
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Gains totaux</Text>
          <View style={styles.summaryValueRow}>
            <FontAwesome5 name="money-bill-wave" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.summaryValue} numberOfLines={1}>
              {formatXAF(totalGainsAmount)}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Tableau des paris en direct */}
      <View style={styles.tableCard}>
        {/* En-tête des colonnes sur fond #0D1826 */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.colHeader, styles.colUser]}>NOM D'UTILISA...</Text>
          <Text style={[styles.colHeader, styles.colOdds]}>COTE</Text>
          <Text style={[styles.colHeader, styles.colBet]}>PARI</Text>
          <Text style={[styles.colHeader, styles.colGain]}>GAIN</Text>
        </View>

        {/* Lignes visibles de bots */}
        {bots.map((bot) => {
          const isWon = bot.isCashedOut;
          const oddsDisplay = isWon ? `x${bot.targetMultiplier.toFixed(2)}` : 'x0';
          const gainDisplay = isWon ? formatXAF(bot.gain) : '0 XAF';

          return (
            <View key={bot.id} style={styles.tableRow}>
              {/* Nom d'utilisateur (*******91) */}
              <Text style={[styles.cellText, styles.colUser]}>{bot.name}</Text>

              {/* Cote : vert #00E676 si retiré, blanc si en attente */}
              <Text
                style={[
                  styles.cellText,
                  styles.colOdds,
                  isWon ? styles.textGreen : styles.textWhite,
                ]}
              >
                {oddsDisplay}
              </Text>

              {/* Pari XAF : toujours blanc */}
              <Text style={[styles.cellText, styles.colBet, styles.textWhite]}>
                {formatXAF(bot.bet)}
              </Text>

              {/* Gain XAF : vert #00E676 si gagné, blanc si 0 */}
              <Text
                style={[
                  styles.cellText,
                  styles.colGain,
                  isWon ? styles.textGreen : styles.textWhite,
                ]}
              >
                {gainDisplay}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 24,
  },
  summaryBar: {
    backgroundColor: '#E05A2B',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 2,
    textAlign: 'center',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  tableCard: {
    backgroundColor: '#0E1724',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0A121D',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A9BA8',
    letterSpacing: 0.3,
  },
  colUser: {
    width: '30%',
  },
  colOdds: {
    width: '18%',
  },
  colBet: {
    width: '26%',
  },
  colGain: {
    width: '26%',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.025)',
  },
  cellText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textGreen: {
    color: '#00E676',
    fontWeight: '800',
  },
});
