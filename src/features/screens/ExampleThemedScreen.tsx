import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
  ThemedContainer,
  ThemedCard,
  ThemedText,
  ThemedButton,
  ThemedInputContainer,
} from '../../components/ui/ThemedComponents';
import { useTheme, useMood } from '../../context/ThemeContext';
import { getMoodDisplayName, getMoodEmoji } from '../../utils/ThemeUtils';

const ExampleThemedScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentMood } = useMood();

  return (
    <ThemedContainer>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedCard>
            <ThemedText size="xlarge" weight="bold">
              🎨 Theme System Demo
            </ThemedText>
            <ThemedText variant="secondary" style={styles.marginTop}>
              This screen demonstrates the global theme system with mood-based colors.
            </ThemedText>
          </ThemedCard>

          <ThemedCard>
            <ThemedText size="large" weight="semibold">
              Current Mood: {getMoodEmoji(currentMood)} {getMoodDisplayName(currentMood)}
            </ThemedText>
            <ThemedText variant="secondary" style={styles.marginTop}>
              The entire app adapts to your mood selection from the dashboard.
            </ThemedText>
          </ThemedCard>

          <ThemedCard>
            <ThemedText size="large" weight="semibold">
              Color Palette
            </ThemedText>
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.primary }]} />
              <ThemedText>Primary: {theme.primary}</ThemedText>
            </View>
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.secondary }]} />
              <ThemedText>Secondary: {theme.secondary}</ThemedText>
            </View>
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.accent }]} />
              <ThemedText>Accent: {theme.accent}</ThemedText>
            </View>
          </ThemedCard>

          <ThemedCard>
            <ThemedText size="large" weight="semibold">
              Text Variants
            </ThemedText>
            <ThemedText variant="primary" style={styles.marginTop}>
              Primary text color
            </ThemedText>
            <ThemedText variant="secondary" style={styles.marginTop}>
              Secondary text color
            </ThemedText>
            <ThemedText variant="accent" style={styles.marginTop}>
              Accent text color
            </ThemedText>
          </ThemedCard>

          <ThemedCard>
            <ThemedText size="large" weight="semibold">
              Button Variants
            </ThemedText>
            <View style={styles.buttonContainer}>
              <ThemedButton title="Primary Button" variant="primary" style={styles.button} />
              <ThemedButton title="Secondary Button" variant="secondary" style={styles.button} />
              <ThemedButton title="Accent Button" variant="accent" style={styles.button} />
            </View>
          </ThemedCard>

          <ThemedCard>
            <ThemedText size="large" weight="semibold">
              Input Container
            </ThemedText>
            <ThemedInputContainer style={styles.marginTop}>
              <ThemedText>This is a themed input container</ThemedText>
            </ThemedInputContainer>
          </ThemedCard>

          <ThemedCard>
            <ThemedText size="large" weight="semibold">
              Font Sizes
            </ThemedText>
            <ThemedText size="small" style={styles.marginTop}>Small text</ThemedText>
            <ThemedText size="medium" style={styles.marginTop}>Medium text</ThemedText>
            <ThemedText size="large" style={styles.marginTop}>Large text</ThemedText>
            <ThemedText size="xlarge" style={styles.marginTop}>Extra large text</ThemedText>
          </ThemedCard>

          <ThemedCard>
            <ThemedText size="large" weight="semibold">
              Font Weights
            </ThemedText>
            <ThemedText weight="normal" style={styles.marginTop}>Normal weight</ThemedText>
            <ThemedText weight="semibold" style={styles.marginTop}>Semi-bold weight</ThemedText>
            <ThemedText weight="bold" style={styles.marginTop}>Bold weight</ThemedText>
          </ThemedCard>
        </View>
      </ScrollView>
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  marginTop: {
    marginTop: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});

export default ExampleThemedScreen;
