import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { useBetStore } from '../store/useBetStore';
import { BetSlip } from '../types/bet';

export default function EmptyCouponScreen({ navigation }: any) {
  const { theme } = useThemeStore();
  const { balance, deposit, coupons, addCoupon } = useBetStore();

  // Modals state
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');

  // Handle Load Coupon by Code
  const handleLoadCoupon = () => {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Code requis', 'Veuillez saisir le code du coupon de pari.');
      return;
    }

    // Check if code matches an existing coupon
    const existingCoupon = coupons.find(
      (c) =>
        (c.shareCode && c.shareCode.toUpperCase() === code) ||
        c.id === code ||
        c.events.some((e) => e.roundCode && e.roundCode.toUpperCase() === code)
    );

    if (existingCoupon) {
      setShowLoadModal(false);
      setCouponCodeInput('');
      Alert.alert(
        'Coupon chargé avec succès !',
        `Coupon № ${existingCoupon.id} trouvé (${existingCoupon.eventsCount} événements, cote ${existingCoupon.totalOdds.toLocaleString('fr-FR')}).`,
        [
          {
            text: 'Consulter le billet',
            onPress: () => navigation.navigate('BetDetailTicket', { couponId: existingCoupon.id }),
          },
        ]
      );
      return;
    }

    // Generate and import a realistic coupon for this code
    const generatedId = '85' + Math.floor(100000000 + Math.random() * 900000000);
    const newCoupon: BetSlip = {
      id: generatedId,
      createdAt: '04.09.2026 (19:30)',
      type: 'Combiné',
      eventsCount: 3,
      completedCount: 0,
      totalOdds: 14.85,
      stake: 2000,
      potentialPayout: 29700,
      status: 'Accepté',
      gameCategory: 'sports',
      shareCode: code,
      isForSale: true,
      cashoutAmount: 1900,
      events: [
        {
          id: `ev-imp-1-${Date.now()}`,
          sport: 'Football',
          league: 'UEFA Champions League',
          date: '04.09.2026 (20:45)',
          homeTeam: { name: 'Real Madrid' },
          awayTeam: { name: 'Bayern Munich' },
          prediction: 'V1 (Victoire 1)',
          odd: 2.15,
          status: 'Accepté',
          roundCode: code,
          gameCategory: 'sports',
        },
        {
          id: `ev-imp-2-${Date.now()}`,
          sport: 'Football',
          league: 'Premier League',
          date: '04.09.2026 (21:00)',
          homeTeam: { name: 'Arsenal' },
          awayTeam: { name: 'Chelsea' },
          prediction: 'Total Plus de (2.5)',
          odd: 1.85,
          status: 'Accepté',
          gameCategory: 'sports',
        },
        {
          id: `ev-imp-3-${Date.now()}`,
          sport: 'Football',
          league: 'Serie A',
          date: '04.09.2026 (21:15)',
          homeTeam: { name: 'Inter Milan' },
          awayTeam: { name: 'Juventus' },
          prediction: 'Les deux équipes marquent : Oui',
          odd: 3.73,
          status: 'Accepté',
          gameCategory: 'sports',
        },
      ],
    };

    addCoupon(newCoupon);
    setShowLoadModal(false);
    setCouponCodeInput('');

    Alert.alert(
      'Coupon importé avec succès !',
      `Le coupon importé avec le code ${code} a été ajouté à votre historique.`,
      [
        {
          text: 'Voir le coupon',
          onPress: () => navigation.navigate('BetDetailTicket', { couponId: newCoupon.id }),
        },
        { text: 'OK' },
      ]
    );
  };

  // Handle Quick Deposit
  const handleDeposit = () => {
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      deposit(val);
      setShowDepositModal(false);
      Alert.alert(
        'Dépôt effectué !',
        `Votre solde a été crédité de ${val.toLocaleString('fr-FR')} ₣.`
      );
    }
  };

  // Handle Boosted Accumulator of the Day
  const handleComboOfTheDay = () => {
    Alert.alert(
      'Pari combiné du jour 🚀',
      'Le combiné exclusif du jour propose un boost de cote de +10% sur 3 sélections majeures de football (Cote boostée : 9.50).\n\nSouhaitez-vous charger ce coupon ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Charger le coupon',
          onPress: () => {
            const comboId = '85' + Math.floor(100000000 + Math.random() * 900000000);
            const comboCoupon: BetSlip = {
              id: comboId,
              createdAt: '04.09.2026 (19:35)',
              type: 'Combiné',
              eventsCount: 3,
              completedCount: 0,
              totalOdds: 9.5,
              stake: 5000,
              potentialPayout: 47500,
              status: 'Accepté',
              gameCategory: 'sports',
              shareCode: 'DAY95',
              isForSale: true,
              cashoutAmount: 4750,
              events: [
                {
                  id: `ev-day-1-${Date.now()}`,
                  sport: 'Football',
                  league: 'Ligue 1 Uber Eats',
                  date: '04.09.2026 (21:00)',
                  homeTeam: { name: 'Paris Saint-Germain' },
                  awayTeam: { name: 'Marseille' },
                  prediction: 'V1 & Plus de 2.5 buts',
                  odd: 2.1,
                  status: 'Accepté',
                  gameCategory: 'sports',
                },
                {
                  id: `ev-day-2-${Date.now()}`,
                  sport: 'Football',
                  league: 'LaLiga EA Sports',
                  date: '04.09.2026 (21:30)',
                  homeTeam: { name: 'FC Barcelona' },
                  awayTeam: { name: 'Atlético Madrid' },
                  prediction: 'Score exact : 2–1',
                  odd: 2.5,
                  status: 'Accepté',
                  gameCategory: 'sports',
                },
                {
                  id: `ev-day-3-${Date.now()}`,
                  sport: 'Football',
                  league: 'Premier League',
                  date: '04.09.2026 (21:45)',
                  homeTeam: { name: 'Manchester City' },
                  awayTeam: { name: 'Liverpool' },
                  prediction: 'V1',
                  odd: 1.81,
                  status: 'Accepté',
                  gameCategory: 'sports',
                },
              ],
            };

            addCoupon(comboCoupon);
            navigation.navigate('BetDetailTicket', { couponId: comboCoupon.id });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. Header centré "Coupon" conforme à la capture */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.isDark ? '#181A20' : '#EEF2F6',
            borderBottomColor: theme.barBorder,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.primary }]}>Coupon</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Zone d'Avertissement (Empty State Notice) */}
        <View style={styles.noticeContainer}>
          <Text
            style={[
              styles.noticeTitle,
              { color: theme.isDark ? '#F8FAFC' : '#1E293B' },
            ]}
          >
            Votre coupon de pari est vide
          </Text>
          <Text style={styles.noticeSubtitle}>
            Ajoutez un événement au coupon de pari ou{'\n'}sélectionnez l'une des options
          </Text>
        </View>

        {/* 3. Liste des 5 Cartes d'Actions Blanches (Card Action Stack) */}
        <View style={styles.cardStack}>
          {/* Card 1 : Recharger le compte */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.isDark ? '#1E222D' : '#FFFFFF',
                borderColor: theme.isDark ? '#2A2E39' : '#E2E8F0',
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setShowDepositModal(true)}
          >
            <View style={[styles.iconBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Recharger le compte
              </Text>
              <Text style={styles.cardSubtitle}>
                Votre solde :{' '}
                <Text style={styles.boldSubtitle}>
                  {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₣
                </Text>
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Card 2 : Recherche d'événement */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.isDark ? '#1E222D' : '#FFFFFF',
                borderColor: theme.isDark ? '#2A2E39' : '#E2E8F0',
              },
            ]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Populaire')}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: theme.isDark ? '#2A2E39' : '#EFF6FF' },
              ]}
            >
              <Ionicons name="search" size={19} color={theme.primary} />
            </View>
            <View style={styles.cardTextWrap}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Recherche d'événement
              </Text>
              <Text style={styles.cardSubtitle}>Uniquement pour vous</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Card 3 : Pari combiné du jour */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.isDark ? '#1E222D' : '#FFFFFF',
                borderColor: theme.isDark ? '#2A2E39' : '#E2E8F0',
              },
            ]}
            activeOpacity={0.8}
            onPress={handleComboOfTheDay}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: theme.isDark ? '#2A2E39' : '#FEF3C7' },
              ]}
            >
              <MaterialCommunityIcons name="layers-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Pari combiné du jour
              </Text>
              <Text style={styles.cardSubtitle}>Meilleures offres du jour</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Card 4 : Créer coupon de pari */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.isDark ? '#1E222D' : '#FFFFFF',
                borderColor: theme.isDark ? '#2A2E39' : '#E2E8F0',
              },
            ]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StudioCreation')}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: theme.isDark ? '#2A2E39' : '#F0FDF4' },
              ]}
            >
              <Ionicons name="options-outline" size={19} color="#16A34A" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Créer coupon de pari
              </Text>
              <Text style={styles.cardSubtitle}>Générez votre coupon de pari</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Card 5 : Charger le coupon de pari */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: theme.isDark ? '#1E222D' : '#FFFFFF',
                borderColor: theme.isDark ? '#2A2E39' : '#E2E8F0',
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setShowLoadModal(true)}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: theme.isDark ? '#2A2E39' : '#F5F3FF' },
              ]}
            >
              <MaterialCommunityIcons name="tray-arrow-up" size={20} color="#7C3AED" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Charger le coupon de pari
              </Text>
              <Text style={styles.cardSubtitle}>Chargez votre coupon de pari</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODALE 1 : Saisie de code pour charger un coupon */}
      <Modal visible={showLoadModal} transparent animationType="fade" onRequestClose={() => setShowLoadModal(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.isDark ? '#1E222D' : '#FFFFFF',
                borderColor: theme.isDark ? '#2A2E39' : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Charger un coupon
              </Text>
              <TouchableOpacity onPress={() => setShowLoadModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              Entrez le code alphanumérique du coupon partagé (ex : A8KF2, PK89X, ou VN77Q) :
            </Text>

            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: theme.isDark ? '#181A20' : '#F8FAFC',
                  borderColor: theme.isDark ? '#2A2E39' : '#CBD5E1',
                  color: theme.isDark ? '#FFFFFF' : '#0F172A',
                },
              ]}
              placeholder="Ex : A8KF2"
              placeholderTextColor="#94A3B8"
              value={couponCodeInput}
              onChangeText={setCouponCodeInput}
              autoCapitalize="characters"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLoadModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                onPress={handleLoadCoupon}
              >
                <Text style={styles.modalSubmitText}>Télécharger</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODALE 2 : Recharger le compte */}
      <Modal visible={showDepositModal} transparent animationType="fade" onRequestClose={() => setShowDepositModal(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.isDark ? '#1E222D' : '#FFFFFF',
                borderColor: theme.isDark ? '#2A2E39' : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Recharger le compte
              </Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              Solde actuel : <Text style={styles.boldSubtitle}>{balance.toLocaleString('fr-FR')} ₣</Text>
            </Text>

            <View style={styles.quickAmountRow}>
              {['50000', '100000', '500000', '1000000'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickAmountBadge,
                    depositAmount === amt && { borderColor: theme.primary, backgroundColor: theme.isDark ? '#2A2E39' : '#EFF6FF' },
                  ]}
                  onPress={() => setDepositAmount(amt)}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      depositAmount === amt && { color: theme.primary, fontWeight: '800' },
                    ]}
                  >
                    +{(parseFloat(amt) / 1000).toLocaleString('fr-FR')} k ₣
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: theme.isDark ? '#181A20' : '#F8FAFC',
                  borderColor: theme.isDark ? '#2A2E39' : '#CBD5E1',
                  color: theme.isDark ? '#FFFFFF' : '#0F172A',
                },
              ]}
              placeholder="Montant en ₣"
              placeholderTextColor="#94A3B8"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDepositModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                onPress={handleDeposit}
              >
                <Text style={styles.modalSubmitText}>Recharger</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 88, // Calibré pour la barre fixe persistante
  },
  noticeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  noticeSubtitle: {
    fontSize: 13,
    color: '#4B6B94',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardStack: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2.5,
  },
  boldSubtitle: {
    fontWeight: '700',
    color: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalHint: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  codeInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickAmountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  quickAmountText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalSubmitText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
