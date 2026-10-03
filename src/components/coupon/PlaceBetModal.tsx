import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { useCouponStore } from '../../store/couponStore';
import { useBetStore } from '../../store/useBetStore';
import { useAuthStore } from '../../store/authStore';

export interface PlaceBetModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (stake: number) => void;
  ticketType?: string;
  totalOdds?: number;
  eventsCount?: number;
  stake?: number;
  onStakeChange?: (stake: number) => void;
  balance?: number;
}

export const PlaceBetModal: React.FC<PlaceBetModalProps> = ({
  visible,
  onClose,
  onConfirm,
  ticketType: propTicketType,
  totalOdds: propTotalOdds,
  eventsCount: propEventsCount,
  stake: propStake,
  onStakeChange,
  balance: propBalance,
}) => {
  const { currentTheme } = useThemeStore();
  const { balance: storeBalance } = useBetStore();
  const { currentUser } = useAuthStore();
  const couponStore = useCouponStore();

  // Dynamic values (props or fallback to store)
  const ticketType = propTicketType || couponStore.ticketType || 'Simple';
  const totalOdds = propTotalOdds ?? couponStore.getTotalOdds();
  const eventsCount = propEventsCount ?? couponStore.activeEvents.length;
  const currentStake = propStake ?? couponStore.stake;
  const userBalance = propBalance ?? currentUser?.balance ?? storeBalance;

  // Tabs: 'Mise' | 'Code promo' | 'Cote de référence'
  const [activeTab, setActiveTab] = useState<'Mise' | 'Code promo' | 'Cote de référence'>('Mise');
  const [promoCode, setPromoCode] = useState('');
  const [oddsPolicy, setOddsPolicy] = useState<'up' | 'any' | 'ask'>('up');

  const totalOddsDisplay = Number.isInteger(totalOdds) ? totalOdds.toString() : totalOdds.toFixed(2);
  const potentialPayout = Math.round(currentStake * (totalOdds || 1));

  const handleSetStake = (val: number) => {
    if (onStakeChange) {
      onStakeChange(val);
    } else {
      couponStore.setStake(val);
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'Code promo') {
      if (!promoCode.trim()) {
        Alert.alert('Code promo requis', 'Veuillez saisir un code promo valide.');
        return;
      }
    }

    if (onConfirm) {
      onConfirm(currentStake);
    } else {
      const result = couponStore.placeBet();
      if (result.success) {
        onClose();
        Alert.alert('Pari Enregistré !', result.message);
      } else {
        Alert.alert('Impossible de placer le pari', result.message);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.sheetBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.modalContainer,
            {
              backgroundColor: currentTheme.colors.cardBackground, // #212830 pour Melbet
              borderTopColor: currentTheme.colors.cardBorder,
            },
          ]}
        >
          {/* Poignée de glissement */}
          <View style={[styles.sheetHandle, { backgroundColor: currentTheme.isDark ? '#4B5563' : '#CBD5E1' }]} />

          {/* En-tête du Bottom Sheet */}
          <View style={styles.sheetHeaderRow}>
            <View>
              <Text
                style={[
                  styles.sheetHeaderTitle,
                  { color: currentTheme.colors.textPrimary },
                ]}
              >
                {ticketType === 'Simple' ? 'Pari simple' : ticketType}
              </Text>
              <Text style={[styles.sheetSubmeta, { color: currentTheme.colors.textSecondary }]}>
                {eventsCount} événement{eventsCount > 1 ? 's' : ''} · Cote :{' '}
                <Text style={{ color: currentTheme.colors.primary, fontWeight: '800' }}>
                  {totalOddsDisplay}
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Fermer"
            >
              <Ionicons name="close" size={24} color={currentTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Barre des 3 onglets */}
          <View
            style={[
              styles.betTabsBar,
              { backgroundColor: currentTheme.colors.background },
            ]}
          >
            {(['Mise', 'Code promo', 'Cote de référence'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.betTabItem,
                    isActive && {
                      backgroundColor: currentTheme.isDark ? '#2D3742' : '#FFFFFF',
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    },
                  ]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.betTabText,
                      { color: currentTheme.colors.textSecondary },
                      isActive && {
                        color: currentTheme.colors.textPrimary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Onglet 1 : Mise */}
          {activeTab === 'Mise' && (
            <View style={styles.tabContentWrap}>
              {/* Solde utilisateur */}
              <View style={styles.balanceLineRow}>
                <Text style={[styles.balanceLineLabel, { color: currentTheme.colors.textSecondary }]}>
                  Solde disponible :
                </Text>
                <Text style={[styles.balanceLineValue, { color: currentTheme.colors.accentGreen }]}>
                  {userBalance.toLocaleString('fr-FR')} ₣
                </Text>
              </View>

              {/* Boutons de mise rapide */}
              <View style={styles.quickStakePillRow}>
                {[90, 1000, 2500, 5000].map((amt) => {
                  const isSelected = currentStake === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.quickStakePill,
                        {
                          borderColor: isSelected
                            ? currentTheme.colors.primary
                            : currentTheme.colors.cardBorder,
                          backgroundColor: isSelected
                            ? currentTheme.isDark ? '#3A2E14' : '#FEF3C7'
                            : currentTheme.isDark ? '#2B343F' : '#F1F5F9',
                        },
                      ]}
                      onPress={() => handleSetStake(amt)}
                    >
                      <Text
                        style={[
                          styles.quickStakePillText,
                          { color: currentTheme.colors.textSecondary },
                          isSelected && { color: currentTheme.colors.primary, fontWeight: '800' },
                        ]}
                      >
                        {amt} ₣
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Champ de saisie du montant de la mise */}
              <View
                style={[
                  styles.stakeInputContainer,
                  {
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.cardBorder,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.stakeInput,
                    { color: currentTheme.colors.textPrimary },
                  ]}
                  placeholder="Montant de la mise"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                  value={currentStake ? currentStake.toString() : ''}
                  onChangeText={(txt) => {
                    const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
                    handleSetStake(isNaN(num) ? 0 : num);
                  }}
                  keyboardType="numeric"
                />
                <Text style={[styles.currencySuffix, { color: currentTheme.colors.textSecondary }]}>₣</Text>
              </View>

              {/* Calcul instantané des gains potentiels */}
              <View style={styles.payoutSummaryBox}>
                <Text style={[styles.payoutSummaryLabel, { color: currentTheme.colors.textSecondary }]}>
                  Gains potentiels :
                </Text>
                <Text style={[styles.payoutSummaryValue, { color: currentTheme.colors.accentGreen }]}>
                  {potentialPayout.toLocaleString('fr-FR')} ₣
                </Text>
              </View>

              {/* Bouton Principal Placer le pari */}
              <TouchableOpacity
                style={[
                  styles.placeBetBtn,
                  { backgroundColor: currentTheme.colors.primary },
                ]}
                activeOpacity={0.88}
                onPress={handleConfirm}
              >
                <Text style={[styles.placeBetBtnText, { color: currentTheme.colors.primaryText }]}>
                  Placer le pari ({currentStake.toLocaleString('fr-FR')} ₣)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Onglet 2 : Code promo */}
          {activeTab === 'Code promo' && (
            <View style={styles.tabContentWrap}>
              <Text style={[styles.tabSectionHint, { color: currentTheme.colors.textSecondary }]}>
                Saisissez votre code promotionnel pour parier gratuitement :
              </Text>
              <TextInput
                style={[
                  styles.stakeInputContainer,
                  styles.promoTextInput,
                  {
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.cardBorder,
                    color: currentTheme.colors.textPrimary,
                  },
                ]}
                placeholder="Ex : PROMO2026"
                placeholderTextColor={currentTheme.colors.textSecondary}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={[
                  styles.placeBetBtn,
                  { backgroundColor: currentTheme.colors.primary },
                ]}
                activeOpacity={0.88}
                onPress={handleConfirm}
              >
                <Text style={[styles.placeBetBtnText, { color: currentTheme.colors.primaryText }]}>
                  Appliquer & Parier
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Onglet 3 : Cote de référence */}
          {activeTab === 'Cote de référence' && (
            <View style={styles.tabContentWrap}>
              <Text style={[styles.tabSectionHint, { color: currentTheme.colors.textSecondary }]}>
                Comportement lors des variations de cotes :
              </Text>

              {[
                { id: 'up', label: 'Accepter si la cote augmente', desc: 'Recommandé' },
                { id: 'any', label: 'Accepter tout changement de cote', desc: 'Sans confirmation' },
                { id: 'ask', label: 'Toujours demander confirmation', desc: 'Sécurisé' },
              ].map((item) => {
                const isChecked = oddsPolicy === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.policyOptionRow,
                      {
                        backgroundColor: isChecked
                          ? currentTheme.isDark ? '#2D3742' : '#EFF6FF'
                          : 'transparent',
                        borderColor: isChecked
                          ? currentTheme.colors.primary
                          : currentTheme.colors.cardBorder,
                      },
                    ]}
                    onPress={() => setOddsPolicy(item.id as any)}
                  >
                    <Ionicons
                      name={isChecked ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isChecked ? currentTheme.colors.primary : currentTheme.colors.textSecondary}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.policyOptionTitle, { color: currentTheme.colors.textPrimary }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.policyOptionDesc, { color: currentTheme.colors.textSecondary }]}>
                        {item.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export const BetConfirmationModal = PlaceBetModal;
export default PlaceBetModal;

const styles = StyleSheet.create({
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sheetSubmeta: {
    fontSize: 12,
    marginTop: 2,
  },
  betTabsBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  betTabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  betTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContentWrap: {
    paddingTop: 4,
  },
  tabSectionHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  balanceLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceLineLabel: {
    fontSize: 13,
  },
  balanceLineValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickStakePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickStakePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  quickStakePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stakeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  stakeInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  currencySuffix: {
    fontSize: 16,
    fontWeight: '700',
  },
  promoTextInput: {
    fontSize: 15,
    fontWeight: '600',
  },
  payoutSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 14,
  },
  payoutSummaryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  payoutSummaryValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  placeBetBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  placeBetBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  policyOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  policyOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  policyOptionDesc: {
    fontSize: 12,
  },
});
