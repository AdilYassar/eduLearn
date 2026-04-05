import { View, Text, TouchableOpacity, ViewStyle, TextStyle, TouchableOpacityProps, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface ThemedContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  useGradient?: boolean;
}

export const ThemedContainer: React.FC<ThemedContainerProps> = ({
  children,
  style,
  useGradient = true,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[{ flex: 1, backgroundColor: theme.background[0] }, style]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {useGradient ? (
        <LinearGradient colors={theme.background} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
            {children}
          </SafeAreaView>
        </LinearGradient>
      ) : (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          {children}
        </SafeAreaView>
      )}
    </View>
  );
};

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  opacity?: number;
  glow?: boolean;
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  opacity = 0.08,
  glow = false,
  glowColor
}) => {
  const { theme } = useTheme();

  return (
    <View style={[
      {
        borderRadius: 12,
        backgroundColor: theme.isDark
          ? `rgba(255, 255, 255, ${opacity})`
          : `rgba(0, 0, 0, 0.03)`,
        borderWidth: 1,
        borderColor: theme.isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
      },
      style
    ]}>
      {children}
    </View>
  );
};

interface ThemedTextProps {
  children?: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'normal' | 'bold' | 'semibold';
  [key: string]: any;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  style,
  variant = 'primary',
  size = 'medium',
  weight = 'normal',
  ...props
}) => {
  const { theme } = useTheme();

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.text.secondary;
      case 'accent':
        return theme.text.accent;
      default:
        return theme.text.primary;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 18;
      case 'xlarge':
        return 24;
      default:
        return 14;
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'bold':
        return '700' as const;
      case 'semibold':
        return '600' as const;
      default:
        return '400' as const;
    }
  };

  return (
    <Text
      style={[
        {
          color: getTextColor(),
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          fontFamily: 'Manrope',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.secondary;
      case 'accent':
        return theme.accent;
      default:
        return theme.primary;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: getButtonColor(),
          borderRadius: 8,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        },
        getButtonSize(),
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600' as const,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

interface ThemedInputContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ThemedInputContainer: React.FC<ThemedInputContainerProps> = ({
  children,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};