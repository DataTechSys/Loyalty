// js/loyalty.js
export const CASHBACK_RATE = 0.05;       // 5%
export const POINTS_PER_KWD = 1000;      // 1000 pts = 1 KWD

export function pointsFromSpend(kwdSpend) {
  // points awarded from a transaction amount in KWD
  return Math.round(kwdSpend * CASHBACK_RATE * POINTS_PER_KWD);
}

export function kwdFromPoints(points) {
  return points / POINTS_PER_KWD;
}

export function formatKWD(v) {
  return 'KWD ' + (+v).toFixed(1);
}