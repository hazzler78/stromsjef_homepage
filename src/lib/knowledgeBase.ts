// Dynamisk kunskapsbas för AI-chatten
// Denna fil kan uppdateras enkelt för att hålla AI:n uppdaterad

export interface KnowledgeItem {
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  lastUpdated: string;
}

export interface CampaignInfo {
  id: string;
  title: string;
  description: string;
  validFrom: string;
  validTo: string;
  active: boolean;
}

export interface ProviderInfo {
  name: string;
  type: 'rorligt' | 'fastpris' | 'foretag';
  features: string[];
  url: string;
  active: boolean;
}

// Vanliga frågor och svar
export const faqKnowledge: KnowledgeItem[] = [
  {
    category: "stromavtale",
    question: "Hvordan finner jeg gode strømavtaler?",
    answer: "Registrer e‑posten din i skjemaet i foten, så får du tidlige tilbud før de blir fullbooket.",
    keywords: ["finn", "gode", "tilbud", "registrer", "e-post"],
    lastUpdated: "2025-09-29"
  },
  {
    category: "stromomrader",
    question: "Prisområder for strøm i Norge (2025) – oversikt og kilder",
    answer: `### Prisområden för el i Norge (2025)

Norge är indelat i fem huvudsakliga prisområden (NO1–NO5). Gränserna styrs av NVE/Statnett och ändras sällan. En komplett officiell CSV med alla postnummer och zon publiceras inte som öppen lista, men kan härledas via Bring.no postnummer och NVE/Elhub‑källor.

#### Översikt
| Prisområde | Region/Område | Exempelkommuner | Exempelpostnr |
|---|---|---|---|
| NO1 – Øst‑Norge | Oslo/Østlandet | Oslo, Akershus, Østfold, Vestfold og Telemark (delar), Innlandet (delar), Viken (delar) | 0010, 2000, 1600 |
| NO2 – Sør‑Norge | Sørlandet | Agder (Aust/Vest), delar av Vestfold og Telemark | 4600, 4800, 4880 |
| NO3 – Midt‑Norge | Midt‑Norge | Trøndelag, Møre og Romsdal | 7000, 6000, 7600 |
| NO4 – Nord‑Norge | Nord‑Norge | Nordland, Troms og Finnmark | 8000, 9000, 9700 |
| NO5 – Vest‑Norge | Vestlandet | Rogaland, Vestland (Hordaland + Sogn og Fjordane), delar av Viken/Innlandet | 4000, 5000, 6800 |

#### Hur du får en fullständig lista
1. Ladda ner postnummerregister från Bring.no
2. Korsreferera mot NVE kart (Elspot‑lager) eller Elhub
3. Uppdatera löpande (kolla Statnett tariffbok 2025)

Källor: NVE, Statnett, Elhub, Nord Pool.`,
    keywords: ["NO1", "NO2", "NO3", "NO4", "NO5", "prisområden", "stromomrader", "NVE", "Statnett", "Elhub", "postnummer"],
    lastUpdated: "2025-09-29"
  },
  {
    category: "stromavtale",
    question: "Hva skal jeg velge – Fastpris eller Spotpris?",
    answer: "**Fastpris**: Forutsigbart gjennom hele perioden, bra om du vil unngå prissjokk. **Spotpris**: Følger markedet, historisk billigere over tid men kan variere. Tenk: Tror du strømprisene blir billigere eller dyrere fremover?",
    keywords: ["fastpris", "spotpris", "valg", "prissjokk", "marked"],
    lastUpdated: "2025-09-29"
  },
  {
    category: "bytte",
    question: "Må jeg si opp min gamle strømavtale når jeg bytter?",
    answer: "Nei, som regel trenger du ikke si opp selv. Når du bytter strømleverandør, håndterer den nye leverandøren byttet for deg, inkludert oppsigelsen.",
    keywords: ["oppsigelse", "gammelt", "avtale", "bytte", "leverandør"],
    lastUpdated: "2025-09-29"
  },
  {
    category: "avgifter",
    question: "Er det noen avgift ved oppsigelse av strømavtale?",
    answer: "Spotpris‑avtaler kan som oftest sies opp uten avgift og har normalt 1 måneds oppsigelsestid. Fastprisavtaler har gjerne bindingstid, og ved oppsigelse før tiden kan det komme et bruddgebyr (løsningsavgift).",
    keywords: ["avgift", "oppsigelse", "bruddgebyr", "løsningsavgift", "bindingstid"],
    lastUpdated: "2025-09-29"
  },
  {
    category: "stromomrader",
    question: "Hvilket strømområde tilhører jeg?",
    answer: "Norge er inndelt i fem strømområder: **NO1** Øst‑Norge, **NO2** Sør‑Norge, **NO3** Midt‑Norge, **NO4** Nord‑Norge, **NO5** Vest‑Norge. Området du tilhører påvirker strømprisen i din region.",
    keywords: ["strømområde", "NO1", "NO2", "NO3", "NO4", "NO5", "region"],
    lastUpdated: "2025-09-29"
  },
  {
    category: "angrerett",
    question: "Kan jeg angre strømavtalen?",
    answer: "Ja, du har 14 dagers angrerett ved avtale inngått på nett. Det betyr at du kan angre uten kostnad i denne perioden. Unntak: betalt forbrukt strøm under angreperioden.",
    keywords: ["angrerett", "avtale", "14 dager", "netthandel", "kostnad"],
    lastUpdated: "2025-09-29"
  }
];

// Aktuella kampanjer
export const activeCampaigns: CampaignInfo[] = [
  {
    id: "spot-2025",
    title: "Spotpris – 0 kr i avgifter",
    description: "0 kr i avgifter første året – uten bindingstid",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    active: true
  },
  {
    id: "fastpris-2025",
    title: "Fastpris med prisgaranti",
    description: "Prisgaranti med valgfri bindingstid (1–3 år)",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    active: true
  },
  {
    id: "bedrift-2025",
    title: "Bedriftsavtaler via Energi2",
    description: "Spesielle bedriftsavtaler for bedrifter",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    active: true
  }
];

// Leverantörsinformation
export const providers: ProviderInfo[] = [
  {
    name: "Kilden Kraft – Fastpris 1 år",
    type: "fastpris",
    features: ["Fastpris 1 år", "Forutsigbarhet", "Ingen skjulte avgifter"],
    url: "https://kildenkraft.no/bedrift/fastpris-1-ar/?utm_source=stromsjef.no",
    active: true
  },
  {
    name: "Kilden Kraft – Fastpris 3 år",
    type: "fastpris",
    features: ["Fastpris 3 år", "Prisgaranti", "Stabilitet"],
    url: "https://kildenkraft.no/bedrift/fastpris-3-ar/?utm_source=stromsjef.no",
    active: true
  },
  {
    name: "Kilden Kraft – Fastpris 5 år",
    type: "fastpris",
    features: ["Fastpris 5 år", "Langsiktig", "Forutsigbart"],
    url: "https://kildenkraft.no/bedrift/fastpris-5-ar/?utm_source=stromsjef.no",
    active: true
  },
  {
    name: "Bærum Energi",
    type: "rorligt",
    features: ["Spotpris", "Enkel oppstart", "Konkurransedyktige vilkår"],
    url: "https://baerumenergi.no/?utm_source=stromsjef.no",
    active: true
  },
  {
    name: "Cheap Energy Norge",
    type: "rorligt",
    features: ["Spotpris", "Enkel bytteprosess"],
    url: "https://cheapenergy.no/?utm_source=stromsjef.no",
    active: true
  },
  {
    name: "VStrøm – RenSpot",
    type: "rorligt",
    features: ["Spotpris RenSpot", "Ingen bindingstid", "Lave påslag"],
    url: "https://www.vstrom.no/renspot?utm_source=stromsjef&utm_medium=cpc&utm_campaign=renspot",
    active: true
  }
];

// Bytprocessinformation
export const bytProcess = {
  steps: [
    "Fyll inn skjemaet med dine opplysninger",
    "Velg avtaletype (spotpris eller fastpris)",
    "Vi fikser oppsigelsen hos din gamle leverandør",
    "Klart på 14 dager",
    "Ingen avgifter – helt gratis"
  ],
  features: [
    "Helt digitalt – ingen papirer eller samtaler",
    "Vi håndterer alt for deg",
    "Angrerett i 14 dager",
    "Ingen skjulte kostnader"
  ],
  timeFrame: "14 dager"
};

// Vädrets påverkan på elpriset
export const weatherImpact = {
  lowerPrices: [
    { factor: "Regn", reason: "Fyller vannmagasin – billig vannkraft" },
    { factor: "Vind", reason: "Mye vindkraftproduksjon presser prisen" },
    { factor: "Varme", reason: "Mindre etterspørsel etter oppvarming" }
  ],
  higherPrices: [
    { factor: "Tørke eller vindstille", reason: "Mindre billig kraft – mer import" }
  ]
};

// Sommartips
export const summerTips = {
  title: "Sommeren er perfekt for å sikre en god strømavtale",
  reasons: [
    "Mange vil låse inn lave sommerpriser før høsten",
    "Hos oss får du spotpris uten påslag – kun markedsprisen",
    "Vi viser også faste avtaler for deg som vil unngå prissjokk"
  ]
};

// Hemsidans grundinformation
export const companyInfo = {
  name: "Strømsjef.no",
  company: "VKNG LTD",
  experience: "30+ års erfaring fra bransjen",
  description: "Vi er IKKE et strømselskap – du får aldri en strømregning fra oss. Vi jobber uavhengig og samarbeider med flere leverandører for å løfte frem kampanjer og rabatter som faktisk gjør en forskjell.",
  mission: "Gi deg kontrollen tilbake. Du skal slippe å bruke timer på å lete selv. Vi viser kun avtaler som er verdt å vurdere – med tydelige vilkår og priser du faktisk forstår."
};

// Funktion för att hämta relevant kunskap baserat på fråga
export function findRelevantKnowledge(question: string): KnowledgeItem[] {
  const lowerQuestion = question.toLowerCase();
  return faqKnowledge.filter(item => 
    item.keywords.some(keyword => 
      lowerQuestion.includes(keyword.toLowerCase())
    )
  );
}

// Funktion för att hämta aktiva kampanjer
export function getActiveCampaigns(): CampaignInfo[] {
  const now = new Date();
  return activeCampaigns.filter(campaign => 
    campaign.active && 
    new Date(campaign.validFrom) <= now && 
    new Date(campaign.validTo) >= now
  );
}

// Funktion för att hämta leverantörer efter typ
export function getProvidersByType(type: 'rorligt' | 'fastpris' | 'foretag'): ProviderInfo[] {
  return providers.filter(provider => 
    provider.type === type && provider.active
  );
}

// Funktion för att generera sammanfattning av aktuell kunskap
export function generateKnowledgeSummary(): string {
  const activeCampaigns = getActiveCampaigns();
  const rorligtProviders = getProvidersByType('rorligt');
  const fastprisProviders = getProvidersByType('fastpris');
  
  let summary = `## Aktuelle tilbud (${new Date().toLocaleDateString('nb-NO')})\n\n`;
  
  if (activeCampaigns.length > 0) {
    summary += "**Aktive kampanjer:**\n";
    activeCampaigns.forEach(campaign => {
      summary += `• ${campaign.title}: ${campaign.description}\n`;
    });
    summary += "\n";
  }
  
  if (rorligtProviders.length > 0) {
    summary += "**Spotpris‑avtaler:**\n";
    rorligtProviders.forEach(provider => {
      summary += `• ${provider.name}: ${provider.features.join(', ')}\n`;
    });
    summary += "\n";
  }
  
  if (fastprisProviders.length > 0) {
    summary += "**Fastprisavtaler:**\n";
    fastprisProviders.forEach(provider => {
      summary += `• ${provider.name}: ${provider.features.join(', ')}\n`;
    });
    summary += "\n";
  }
  
  summary += `**Bytteprosess:** ${bytProcess.timeFrame}, ${bytProcess.features.join(', ')}\n`;
  summary += `**Selskap:** ${companyInfo.description}`;
  
  return summary;
}
