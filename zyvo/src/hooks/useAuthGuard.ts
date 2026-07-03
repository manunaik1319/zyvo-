import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

/**
 * useAuthGuard — Returns a requireLogin() function that gates protected actions
 * behind authentication. If the user is not authenticated, it shows a native
 * alert and pushes them to the login screen with a returnTo param.
 *
 * Usage:
 *   const { isAuthenticated, requireLogin } = useAuthGuard();
 *   const handleBook = requireLogin(() => router.push('/booking'), 'booking');
 */
export function useAuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  const requireLogin = (
    action: () => void,
    reason: 'booking' | 'favourites' | 'review' | 'profile' = 'booking'
  ): (() => void) => {
    return () => {
      if (isAuthenticated) {
        action();
        return;
      }

      const messages: Record<typeof reason, string> = {
        booking: 'Sign in to book a study space and access your session details.',
        favourites: 'Sign in to save your favourite study spaces.',
        review: 'Sign in to write a review for this study space.',
        profile: 'Sign in to view and manage your profile.',
      };

      Alert.alert(
        'Sign In Required',
        messages[reason],
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => router.push('/(auth)/login'),
          },
        ]
      );
    };
  };

  return { isAuthenticated, requireLogin };
}
