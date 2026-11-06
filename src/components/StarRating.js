import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

export default function StarRating({ value, onChange, onBlur, disabled = false }) {
  return (
    <View style={styles.estrellas}>
      {[1, 2, 3, 4, 5].map((numero) => (
        <Pressable key={numero} accessibilityRole="radio"
          accessibilityLabel={`${numero} ${numero === 1 ? 'estrella' : 'estrellas'}`}
          accessibilityState={{ checked: value === numero, disabled }}
          disabled={disabled} onBlur={onBlur} onPress={() => onChange(numero)} style={styles.estrella}>
          <Ionicons name={numero <= value ? 'star' : 'star-outline'} size={28}
            color={numero <= value ? colors.maintenanceText : colors.textSecondary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  estrellas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  estrella: { padding: spacing.sm },
});
