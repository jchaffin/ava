import { Appearance } from '@stripe/stripe-js'
import React from 'react'

// AVA Theme Colors (matching your CSS variables)
const AVA_COLORS = {
  // Light Mode
  light: {
    primary: '#864e39',      // --ava-text-primary
    secondary: '#6e625e',    // --ava-text-secondary
    tertiary: '#7F8088',     // --ava-text-tertiary
    muted: '#718096',        // --ava-text-muted
    background: '#faf8f7',   // --ava-bg-primary
    backgroundSecondary: '#ecd9d2', // --ava-bg-secondary
    backgroundTertiary: '#edf2f7',  // --ava-bg-tertiary
    border: '#e2e8f0',       // --ava-border
    borderDark: '#cbd5e0',   // --ava-border-dark
    accent: '#cdd5e0',       // --ava-accent
    gold: '#d69e2e',         // --ava-gold
    cream: '#ECD9D2',        // --ava-cream
  },
  // Dark Mode
  dark: {
    primary: '#cdd5e0',      // --ava-text-primary
    secondary: '#faf8f7',    // --ava-text-secondary
    tertiary: '#DCE1E7',     // --ava-text-tertiary
    muted: '#a0aec0',        // --ava-text-muted
    background: '#1a202c',   // --ava-bg-primary
    backgroundSecondary: '#2d3748', // --ava-bg-secondary
    backgroundTertiary: '#4a5568',  // --ava-bg-tertiary
    border: 'rgba(74, 85, 104, 0.2)', // --ava-border
    borderDark: '#718096',   // --ava-border-dark
    accent: '#1b202b',       // --ava-accent
    gold: '#d69e2e',         // --ava-gold
    cream: '#1a202c',        // --ava-cream
  }
}

// Get current theme colors based on system preference
const getThemeColors = (): typeof AVA_COLORS.light => {
  if (typeof window === 'undefined') return AVA_COLORS.light
  
  const isDark = document.documentElement.classList.contains('dark')
  
  return isDark ? AVA_COLORS.dark : AVA_COLORS.light
}

// Stripe Appearance Configuration
export const getStripeAppearance = (): Appearance => {
  const colors = getThemeColors()
  
  return {
    theme: 'stripe',
    variables: {
      colorPrimary: colors.gold,
      colorBackground: colors.background,
      colorText: colors.primary,
      colorDanger: '#e53e3e',
      colorSuccess: '#38a169',
      colorWarning: colors.gold,
      fontFamily: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
      fontSizeBase: '14px',
      fontSizeSm: '12px',
      fontSizeLg: '16px',
      spacingUnit: '4px',
      borderRadius: '8px',
      colorTextPlaceholder: colors.muted,
    },
    rules: {
      '.Tab': {
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.backgroundTertiary,
        color: colors.primary,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '8px',
        transition: 'all 0.2s ease',
        fontFamily: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: '400',
      },
      '.Tab:hover': {
        backgroundColor: colors.backgroundTertiary,
        borderColor: colors.gold,
      },
      '.Tab.Tab--selected': {
        backgroundColor: colors.gold,
        color: colors.background,
        borderColor: colors.gold,
        boxShadow: '0 2px 4px rgba(214, 158, 46, 0.2)',
      },
      '.TabLabel': {
        fontWeight: '600',
        fontSize: '14px',
        fontFamily: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
      },
      '.TabIcon': {
        color: colors.primary,
      },
      '.TabIcon.TabIcon--selected': {
        color: colors.background,
      },
      '.Input': {
        backgroundColor: colors.backgroundTertiary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        color: colors.primary,
        fontSize: '14px',
        fontFamily: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
        fontWeight: '400',
        padding: '12px 16px',
        transition: 'all 0.2s ease',
      },
      '.Input--invalid': {
        backgroundColor: colors.backgroundTertiary,
        borderColor: '#e53e3e',
      },
      '.Input--complete': {
        backgroundColor: colors.backgroundTertiary,
        borderColor: '#38a169',
      },
      '.Input:focus': {
        borderColor: colors.gold,
        boxShadow: `0 0 0 2px rgba(214, 158, 46, 0.2)`,
        outline: 'none',
      },
      '.Input:hover': {
        borderColor: colors.borderDark,
      },
      '.Input::placeholder': {
        color: colors.muted,
      },
      '.Label': {
        color: colors.primary,
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '8px',
        fontFamily: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
      },
      '.Error': {
        color: '#e53e3e',
        fontSize: '12px',
        marginTop: '4px',
       
      },
      '.Block': {
        backgroundColor: colors.backgroundTertiary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      },
      '.Divider': {
        backgroundColor: colors.border,
        margin: '16px 0',
      },
      '.DividerText': {
        color: colors.muted,
        fontSize: '12px',
        fontWeight: '500',
       
      },
      '.Button': {
        backgroundColor: colors.gold,
        color: colors.background,
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        padding: '16px 24px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
       
      },
      '.Button:hover': {
        backgroundColor: '#b7791f',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(214, 158, 46, 0.3)',
      },
      '.Button:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px rgba(214, 158, 46, 0.4)`,
      },
      '.Button:disabled': {
        backgroundColor: colors.muted,
        color: colors.backgroundSecondary,
        cursor: 'not-allowed',
        transform: 'none',
        boxShadow: 'none',
      },
      '.Button--secondary': {
        backgroundColor: colors.backgroundTertiary,
        color: colors.primary,
        border: `1px solid ${colors.border}`,
      },
      '.Button--secondary:hover': {
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.gold,
      },
      '.Button--danger': {
        backgroundColor: '#e53e3e',
      },
      '.Button--danger:hover': {
        backgroundColor: '#c53030',
      },
      '.Icon': {
        color: colors.primary,
      },
      '.Icon--selected': {
        color: colors.gold,
      },
      '.Icon--error': {
        color: '#e53e3e',
      },
      '.Icon--success': {
        color: '#38a169',
      },
      '.Text': {
        color: colors.primary,
      },
      '.Text--secondary': {
        color: colors.secondary,
      },
      '.Text--muted': {
        color: colors.muted,
      },
      '.Text--success': {
        color: '#38a169',
      },
      '.Text--error': {
        color: '#e53e3e',
      },
      '.Text--warning': {
        color: colors.gold,
      },
      '.Link': {
        color: colors.gold,
        textDecoration: 'none',
      },
      '.Link:hover': {
        textDecoration: 'underline',
      },
      '.Alert': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
      },
      '.Alert--error': {
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
        borderColor: '#e53e3e',
        color: '#e53e3e',
      },
      '.Alert--success': {
        backgroundColor: 'rgba(56, 161, 105, 0.1)',
        borderColor: '#38a169',
        color: '#38a169',
      },
      '.Alert--warning': {
        backgroundColor: `rgba(214, 158, 46, 0.1)`,
        borderColor: colors.gold,
        color: colors.gold,
      },
      '.Alert--info': {
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        borderColor: '#3182ce',
        color: '#3182ce',
      },
      '.Spinner': {
        color: colors.gold,
      },
      '.Checkbox': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
      },
      '.Checkbox:checked': {
        backgroundColor: colors.gold,
        borderColor: colors.gold,
      },
      '.Checkbox:focus': {
        borderColor: colors.gold,
        boxShadow: `0 0 0 2px rgba(214, 158, 46, 0.2)`,
      },
      '.Radio': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
      },
      '.Radio:checked': {
        backgroundColor: colors.gold,
        borderColor: colors.gold,
      },
      '.Radio:focus': {
        borderColor: colors.gold,
        boxShadow: `0 0 0 2px rgba(214, 158, 46, 0.2)`,
      },
      '.Select': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        color: colors.primary,
        fontSize: '14px',
        padding: '12px 16px',
      },
      '.Select:focus': {
        borderColor: colors.background,
        boxShadow: `0 0 0 2px rgba(214, 158, 46, 0.2)`,
      },
      '.Select--disabled': {
        backgroundColor: colors.backgroundTertiary,
        color: colors.muted,
        cursor: 'not-allowed',
      },
      '.TabIcon--error': {
        color: '#e53e3e',
      },
      '.TabIcon--success': {
        color: '#38a169',
      },
      '.TabIcon--warning': {
        color: colors.gold,
      },
      '.TabIcon--info': {
        color: '#3182ce',
      },
      '.CardElement': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '400',
      },
      '.CardNumberElement': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: '400',
      },
      '.CardExpiryElement': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: '400',
      },
      '.CardCvcElement': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: '400',
      },
      '.IbanElement': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
      },
      '.IdealBankElement': {
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
      },
      '.Card': {
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '400',
        color: colors.primary,
      },
      '.CashApp': {
        backgroundColor: colors.backgroundTertiary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '400',
        color: colors.primary,
      },
      '.CashAppPay': {
        backgroundColor: colors.backgroundTertiary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '400',
        color: colors.primary,
      },
      '.CashAppPayButton': {
        backgroundColor: colors.backgroundTertiary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '400',
        color: colors.primary,
      },
    },
  }
}

// Hook to get reactive appearance (updates when theme changes)
export const useStripeAppearance = (): Appearance => {
  const [appearance, setAppearance] = React.useState<Appearance>(getStripeAppearance)

  React.useEffect(() => {
    const updateAppearance = () => {
      setAppearance(getStripeAppearance())
    }

    // Listen for manual theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateAppearance()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return appearance
} 