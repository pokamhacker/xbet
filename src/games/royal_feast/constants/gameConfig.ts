import { DishType } from '../types/game';

export const MIN_BET = 200;
export const MAX_BET = 68728.18;
export const DEFAULT_BET = 1000;
export const MAX_OPENS = 15;
export const TOTAL_PLATES = 25;
export const POISON_COUNT = 5;
export const PORTIONS_PER_DISH = 4;

export const DISH_KEYS: DishType[] = ['HAM', 'PANCAKES', 'CHICKEN', 'PIE', 'CAKE'];

export const MULTIPLIERS = [
  1.21, 1.53, 1.93, 2.45, 3.10,
  4.00, 5.20, 6.80, 9.00, 12.10,
  16.50, 23.00, 33.00, 48.00, 72.00,
];

export const DISH_IMAGES = {
  CHICKEN: require('../../../../assets/dishes/chicken.png'),
  HAM: require('../../../../assets/dishes/ham.png'),
  PANCAKES: require('../../../../assets/dishes/pancakes.png'),
  PIE: require('../../../../assets/dishes/pie.png'),
  CAKE: require('../../../../assets/dishes/cake.png'),
  POISON: require('../../../../assets/dishes/poison.png'),
};

export const UI_IMAGES = {
  BACKGROUND: require('../../../../assets/ui/game_bg.png'),
  CLOCHE: require('../../../../assets/ui/cloche.png'),
  COINS: require('../../../../assets/ui/coins_icon.png'),
  FOOTER: require('../../../../assets/ui/footer.png'),
  BANNER: require('../../../../assets/ui/banner_clean.png'),
};


// Coordonnées exactes des 25 cloches sur le plateau de jeu (1179 x 2379)
export const GRID_COLS_LEFT_PCT = ['14.08%', '28.774%', '43.469%', '58.164%', '72.858%'] as const;
export const GRID_ROWS_TOP_PCT = ['27.07%', '33.123%', '39.176%', '45.229%', '51.282%'] as const;
export const CLOCHE_WIDTH_PCT = '12.553%';
export const CLOCHE_HEIGHT_PCT = '5.212%';