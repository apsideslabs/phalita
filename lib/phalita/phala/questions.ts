/**
 * PHALITA — the shared shapes of a weighed answer.
 *
 * A question is a pair of opposed answers, the factors that push either way,
 * and the resulting verdict. Nothing here evaluates anything: the catalogue
 * engine and answers.ts produce these, and the reading renders them.
 */

export interface QFactor {
  label: string;
  side: 'a' | 'b';
  weight: number;
  ground: string;
}

export interface Question {
  id: string;
  domain: string;
  question: string;
  a: string;
  b: string;
  aScore: number;
  bScore: number;
  answer: string;
  confidence: 'clear' | 'leaning' | 'mixed';
  factors: QFactor[];
  caveat: string;
}
