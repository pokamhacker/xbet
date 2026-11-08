export type DishType = 'CHICKEN' | 'HAM' | 'PANCAKES' | 'PIE' | 'CAKE';
export type ItemType = DishType | 'POISON';

export interface PlateData {
  id: number;
  type: ItemType;
  isRevealed: boolean;
  row: number;
  col: number;
}

export type GameStatus =
  | 'IDLE'
  | 'PLAYING'
  | 'EVALUATING'
  | 'REVEALED'
  | 'WON'
  | 'LOST'
  | 'CASHED_OUT';

export interface DishCounter {
  CHICKEN: number;
  HAM: number;
  PANCAKES: number;
  PIE: number;
  CAKE: number;
}
