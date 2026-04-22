export interface IshiharaPlate {
  id: number;
  correctDigit: number | string;
  pageNumber: number; // PDF Page Number
}

/**
 * Standard Ishihara 24 Plate Mapping
 * Mapping assumes plates start from Page 1
 */
export const ISHIHARA_SEQUENCE: IshiharaPlate[] = [
  { id: 1, correctDigit: 12, pageNumber: 1 },
  { id: 2, correctDigit: 8, pageNumber: 2 },
  { id: 3, correctDigit: 5, pageNumber: 3 },
  { id: 4, correctDigit: 29, pageNumber: 4 },
  { id: 5, correctDigit: 74, pageNumber: 5 },
  { id: 6, correctDigit: 7, pageNumber: 6 },
  { id: 7, correctDigit: 45, pageNumber: 7 },
  { id: 8, correctDigit: 2, pageNumber: 8 },
  { id: 9, correctDigit: 'nothing', pageNumber: 9 }, // Control
  { id: 10, correctDigit: 16, pageNumber: 10 },
  { id: 11, correctDigit: 35, pageNumber: 11 },
  { id: 12, correctDigit: 96, pageNumber: 12 },
  { id: 13, correctDigit: 3, pageNumber: 13 },
  { id: 14, correctDigit: 15, pageNumber: 14 },
  { id: 15, correctDigit: 74, pageNumber: 15 },
  { id: 16, correctDigit: 10, pageNumber: 16 },
  { id: 17, correctDigit: 6, pageNumber: 17 },
  { id: 18, correctDigit: 25, pageNumber: 18 },
  { id: 19, correctDigit: 'nothing', pageNumber: 19 },
  { id: 20, correctDigit: 'nothing', pageNumber: 20 },
  { id: 21, correctDigit: 'nothing', pageNumber: 21 },
  { id: 22, correctDigit: 'nothing', pageNumber: 22 },
  { id: 23, correctDigit: 'nothing', pageNumber: 23 },
  { id: 24, correctDigit: 12, pageNumber: 24 }, // Repeating base
];

export const calculateCPVerdict = (correctCount: number, total: number): 'CP-I' | 'CP-II' | 'CP-III' | 'CP-IV' => {
  const accuracy = (correctCount / total) * 100;
  if (accuracy >= 95) return 'CP-I';
  if (accuracy >= 80) return 'CP-II';
  if (accuracy >= 60) return 'CP-III';
  return 'CP-IV';
};
