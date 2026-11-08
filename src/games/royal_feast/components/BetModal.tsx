import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MIN_BET, MAX_BET } from '../constants/gameConfig';

interface BetModalProps {
  visible: boolean;
  currentBet: number;
  balance: number;
  onClose: () => void;
  onSetBet: (bet: number) => void;
}

export const BetModal: React.FC<BetModalProps> = ({
  visible,
  currentBet,
  balance,
  onClose,
  onSetBet,
}) => {
  const [val, setVal] = useState(currentBet.toString());

  const handleQuickBet = (amount: number) => {
    setVal(amount.toString());
  };

  const handleConfirm = () => {
    let parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < MIN_BET) parsed = MIN_BET;
    if (parsed > MAX_BET) parsed = MAX_BET;
    if (parsed > balance) parsed = balance;
    onSetBet(parsed);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.header}>Définir la mise</Text>
          <Text style={styles.limitsText}>
            Min: {MIN_BET} XAF | Max: {MAX_BET.toFixed(2)} XAF
          </Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={val}
            onChangeText={setVal}
          />

          <View style={styles.quickRow}>
            {[200, 500, 1000, 5000, 10000].map((quick) => (
              <TouchableOpacity
                key={quick}
                style={styles.quickBtn}
                onPress={() => handleQuickBet(quick)}
              >
                <Text style={styles.quickText}>{quick}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#2a0808',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e8a938',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  limitsText: {
    color: '#ffcc77',
    fontSize: 12,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#400c0c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8a938',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  quickBtn: {
    backgroundColor: '#521415',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c68e22',
  },
  quickText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#72c824',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#083300',
    fontWeight: 'bold',
  },
});
