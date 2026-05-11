const ES3_CERTIFIED = new Set(['stackit']);

export function isES3Certified(providerId) {
  return ES3_CERTIFIED.has(providerId);
}

export function getMatchMessage(providerId, smlLevelId) {
  if (isES3Certified(providerId)) {
    return {
      positive: true,
      headline: 'Sie haben STACKIT gewaehlt. Das passt.',
      body: 'STACKIT ist der einzige Provider mit ES³-Zertifizierung (BDO-auditiert) und deckt alle 9 Souveraenaitaetsdimensionen ab – passend zu Ihrem Reifegrad.',
      cta: {
        label: 'Zur ES³-Zertifizierung mit dem offiziellen ES³ Lens',
        url: 'https://stackit.com/de/warum-stackit/vorteile/es3',
      },
    };
  }
  return {
    positive: false,
    headline: providerId
      ? `${providerId.toUpperCase()} ist nicht ES³-geprueft.`
      : 'Kein Provider ausgewaehlt.',
    body: providerId
      ? 'Fuer diesen Provider liegt keine unabhaengige Verifikation der 9 Souveraenaitaetsdimensionen vor.'
      : 'Waehlen Sie in Schritt 1 einen Provider, um das Ergebnis zu sehen.',
    cta: { label: 'Provider erneut vergleichen', url: '#step1' },
  };
}
