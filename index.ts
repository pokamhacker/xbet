import { setupCleanLogging } from './src/utils/logger';

// Nettoyage immédiat des logs console et avertissements parasites
setupCleanLogging();

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);

