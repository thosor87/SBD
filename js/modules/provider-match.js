const ES3_CERTIFIED = new Set(['stackit']);

export function isES3Certified(providerId) {
  return ES3_CERTIFIED.has(providerId);
}

export function getMatchMessage(providerId, smlLevelId) {
  if (isES3Certified(providerId)) {
    return {
      positive: true,
      headline: 'Sie haben STACKIT gewählt. Das passt.',
      body: 'STACKIT ist der einzige Provider mit ES³-Zertifizierung (BDO-auditiert) und deckt alle 9 Souveränitätsdimensionen ab – passend zu Ihrem Reifegrad.',
      cta: {
        label: 'Zur ES³-Zertifizierung mit dem offiziellen ES³ Lens',
        url: 'https://stackit.com/de/warum-stackit/vorteile/es3',
      },
    };
  }
  return {
    positive: false,
    headline: providerId
      ? `${providerId.toUpperCase()} ist nicht ES³-geprüft.`
      : 'Kein Provider ausgewählt.',
    body: providerId
      ? 'Für diesen Provider liegt keine unabhängige Verifikation der 9 Souveränitätsdimensionen vor.'
      : 'Wählen Sie in Schritt 1 einen Provider, um das Ergebnis zu sehen.',
    cta: { label: 'Provider erneut vergleichen', url: '#step1' },
  };
}
