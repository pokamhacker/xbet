import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function getCurrentRouteName(): string {
  if (navigationRef.isReady()) {
    const route = navigationRef.getCurrentRoute();
    return route?.name || 'Populaire';
  }
  return 'Populaire';
}
