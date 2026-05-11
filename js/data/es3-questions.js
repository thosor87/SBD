export const DIMENSIONS = [
  { id: 'd1', label: 'Strategic Sovereignty',      description: 'Ist digitale Souveränität strategisch verankert?' },
  { id: 'd2', label: 'Legal & Jurisdictional',     description: 'Schutz vor Fremdrechtsrisiken (z.B. US CLOUD Act)' },
  { id: 'd3', label: 'Data',                       description: 'Kontrolle über Daten und deren Speicherort' },
  { id: 'd4', label: 'Operational',                description: 'Unabhängiger Betrieb ohne Hersteller-Lock-in' },
  { id: 'd5', label: 'Supply Chain',               description: 'Transparenz kritischer Abhängigkeiten' },
  { id: 'd6', label: 'Technology',                 description: 'Offene Standards, Portabilität, kein Vendor Lock-in' },
  { id: 'd7', label: 'Security & Compliance',      description: 'EU-konforme Sicherheitsoperationen' },
  { id: 'd8', label: 'Environmental Sustainability', description: 'Ressourceneffizienz und Resilienz' },
  { id: 'd9', label: 'Artificial Intelligence',    description: 'KI-Governance und Kontrolle über KI-Systeme' },
];

const QUESTIONS = {
  d1: [
    { id: 'd1-reg', level: 'reg', text: 'Ist digitale Souveränität formal in der IT- oder Unternehmensstrategie dokumentiert?' },
    { id: 'd1-org', level: 'org', text: 'Gibt es eine dedizierte Rolle oder ein Team, das für Cloud-Souveränität verantwortlich ist?' },
    { id: 'd1-tech', level: 'tech', text: 'Werden Cloud-Abhängigkeiten regelmäßig (mind. jährlich) gemessen und reported?' },
  ],
  d2: [
    { id: 'd2-reg', level: 'reg', text: 'Sind alle Cloud-Verträge ausschließlich europäischem Recht unterstellt?' },
    { id: 'd2-org', level: 'org', text: 'Gibt es einen internen Prozess zur Prüfung neuer Cloud-Dienste auf Fremdrechtsrisiken?' },
    { id: 'd2-tech', level: 'tech', text: 'Sind technische Maßnahmen gegen unberechtigte Drittstaaten-Zugriffe implementiert (z.B. BYOK)?' },
  ],
  d3: [
    { id: 'd3-reg', level: 'reg', text: 'Sind alle personenbezogenen Daten vertraglich auf europäische Rechenzentren beschränkt?' },
    { id: 'd3-org', level: 'org', text: 'Existiert eine vollständige Datenkarte aller in der Cloud gespeicherten Daten?' },
    { id: 'd3-tech', level: 'tech', text: 'Sind alle sensiblen Daten mit kundeneigenem Schlüssel verschlüsselt (BYOK/HYOK)?' },
  ],
  d4: [
    { id: 'd4-reg', level: 'reg', text: 'Haben Sie vertraglich garantierten Zugang zu Betriebsdaten und Logs?' },
    { id: 'd4-org', level: 'org', text: 'Kann Ihr Team Cloud-Dienste vollständig ohne Hersteller-Support betreiben?' },
    { id: 'd4-tech', level: 'tech', text: 'Sind Betriebsautomatisierungen (IaC, GitOps) in Ihrer Kontrolle und provider-unabhängig?' },
  ],
  d5: [
    { id: 'd5-reg', level: 'reg', text: 'Sind Abhängigkeiten von Subunternehmern und deren Jurisdiktion vertraglich transparent?' },
    { id: 'd5-org', level: 'org', text: 'Wurde die gesamte Supply Chain auf kritische Einzelabhängigkeiten analysiert?' },
    { id: 'd5-tech', level: 'tech', text: 'Können Sie alle eingesetzten Open-Source-Komponenten und deren Herkunft nachverfolgen?' },
  ],
  d6: [
    { id: 'd6-reg', level: 'reg', text: 'Sind offene Standards (OCI, S3-kompatibel, Kubernetes) vertraglich zugesichert?' },
    { id: 'd6-org', level: 'org', text: 'Gibt es einen dokumentierten Exit-Plan für jeden genutzten Cloud-Dienst?' },
    { id: 'd6-tech', level: 'tech', text: 'Sind Ihre Workloads containerisiert und auf mindestens einen weiteren Provider portierbar?' },
  ],
  d7: [
    { id: 'd7-reg', level: 'reg', text: 'Ist Ihr Cloud-Provider nach BSI C5, ISO 27001 oder SOC 2 Type II zertifiziert?' },
    { id: 'd7-org', level: 'org', text: 'Führen Sie regelmäßige Penetrationstests und Security-Reviews durch?' },
    { id: 'd7-tech', level: 'tech', text: 'Ist eine Zero-Trust-Netzwerkarchitektur oder vergleichbare Segmentierung implementiert?' },
  ],
  d8: [
    { id: 'd8-reg', level: 'reg', text: 'Sind Nachhaltigkeitsziele im Cloud-Vertrag messbar verankert?' },
    { id: 'd8-org', level: 'org', text: 'Messen Sie den CO₂-Fußabdruck Ihrer Cloud-Nutzung regelmäßig?' },
    { id: 'd8-tech', level: 'tech', text: 'Nutzen Sie Auto-Scaling und Infrastructure Right-Sizing zur Ressourcenoptimierung?' },
  ],
  d9: [
    { id: 'd9-reg', level: 'reg', text: 'Sind KI-Systeme und deren Datenverarbeitung vertraglich DSGVO-konform geregelt?' },
    { id: 'd9-org', level: 'org', text: 'Gibt es eine AI-Governance-Richtlinie in Ihrem Unternehmen?' },
    { id: 'd9-tech', level: 'tech', text: 'Sind KI-Modelle, die mit Unternehmensdaten trainiert wurden, in Ihrer eigenen Kontrolle?' },
  ],
};

export function getQuestions(dimensionId) {
  return QUESTIONS[dimensionId] ?? [];
}
