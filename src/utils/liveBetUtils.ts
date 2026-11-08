import { combineDateAndTime } from './dateFormatter';

/**
 * Extrait la date/heure de début d'un coupon ou de ses événements
 */
export function getCouponStartTime(coupon: any): Date | null {
  if (!coupon) return null;

  // 1. matchDate + matchTime explicites sur le coupon
  if (coupon.matchDate && coupon.matchTime) {
    const res = combineDateAndTime(coupon.matchDate, coupon.matchTime);
    if (!isNaN(res.date.getTime())) return res.date;
  }

  // 2. Événements du coupon : trouver l'horaire de début le plus proche
  if (Array.isArray(coupon.events) && coupon.events.length > 0) {
    let earliestDate: Date | null = null;
    for (const ev of coupon.events) {
      const d = ev.matchDate && ev.matchTime
        ? combineDateAndTime(ev.matchDate, ev.matchTime).date
        : ev.startDate
        ? combineDateAndTime(ev.startDate, ev.matchTime).date
        : ev.date
        ? combineDateAndTime(ev.date, ev.matchTime).date
        : null;

      if (d && !isNaN(d.getTime())) {
        if (!earliestDate || d.getTime() < earliestDate.getTime()) {
          earliestDate = d;
        }
      }
    }
    if (earliestDate) return earliestDate;
  }

  // 3. startDate sur le coupon
  if (coupon.startDate) {
    const res = combineDateAndTime(coupon.startDate, coupon.matchTime);
    if (!isNaN(res.date.getTime())) return res.date;
  }

  // 4. date formatée sur le coupon (ex: "27.09.2026 (08:30)")
  if (coupon.date) {
    const res = combineDateAndTime(coupon.date, coupon.matchTime);
    if (!isNaN(res.date.getTime())) return res.date;
  }

  // 5. createdAt sur le coupon
  if (coupon.createdAt) {
    const res = combineDateAndTime(coupon.createdAt, coupon.matchTime);
    if (!isNaN(res.date.getTime())) return res.date;
  }

  return null;
}

/**
 * Détermine si un coupon doit afficher le badge "En direct" :
 * - Retourne false si le statut est terminé (Payé, Gagné, Gain, Perdu, Annulé, Vendu).
 * - Retourne true si le coupon ou un de ses événements a explicitement `isLive: true`.
 * - Retourne true si le coupon a le statut 'Accepté' (ou 'En cours') ET qu'on est à 5 min ou moins de son début.
 */
export function isCouponLiveOr5MinBefore(coupon: any): boolean {
  if (!coupon) return false;

  // Statut normalisé
  const normStatus = String(coupon.status || '').toLowerCase().trim();
  const isFinished =
    normStatus === 'payé' ||
    normStatus === 'paye' ||
    normStatus === 'gagné' ||
    normStatus === 'gagne' ||
    normStatus === 'gain' ||
    normStatus === 'perdu' ||
    normStatus === 'annulé' ||
    normStatus === 'annule' ||
    normStatus === 'vendu' ||
    coupon.isWon === true ||
    coupon.isSettled === true ||
    Boolean(coupon.completedCount && coupon.eventsCount && coupon.completedCount >= coupon.eventsCount);

  if (isFinished) {
    return false;
  }

  // 1. Si le coupon ou un de ses événements a explicitement isLive: true
  if (
    coupon.isLive === true ||
    coupon.events?.some((e: any) => e.isLive === true) ||
    coupon.selections?.some((s: any) => s.isLive === true)
  ) {
    return true;
  }

  // 2. Règle demandée : Statut 'Accepté' ET à 5min du début du coupon
  const isAccepted =
    normStatus === 'accepté' ||
    normStatus === 'accepte' ||
    normStatus === 'en cours' ||
    normStatus === '';

  if (!isAccepted) {
    return false;
  }

  const startTime = getCouponStartTime(coupon);
  if (!startTime) {
    return false;
  }

  const now = new Date();
  const diffMs = startTime.getTime() - now.getTime();

  // À 5 minutes du début (now >= startTime - 5 minutes, i.e. diffMs <= 5 * 60 * 1000)
  return diffMs <= 5 * 60 * 1000;
}
