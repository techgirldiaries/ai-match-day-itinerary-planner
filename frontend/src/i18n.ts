import { preferredLanguage } from "@/core/signals";

export type LangCode =
  | "en"
  | "es"
  | "fr"
  | "pl"
  | "ar"
  | "bn"
  | "pt"
  | "de"
  | "it"
  | "hi"
  | "zh";

export interface Translations {
  // Header
  appName: string;
  appSubtitle: string;
  skipToContent: string;
  switchToLight: string;
  switchToDark: string;
  selectLanguage: string;
  connected: string;
  connecting: string;
  offline: string;
  // Loading / error screens
  connectingAgents: string;
  connectionSetupNeeded: string;
  retryConnection: string;
  envKeysExpected: string;
  // Intake form — hero
  planYourItinerary: string;
  formSubtitle: string;
  // Intake form — trip details
  tripDetails: string;
  whereFrom: string;
  whereFromPlaceholder: string;
  whereFromError: string;
  matchType: string;
  home: string;
  away: string;
  matchDate: string;
  matchDateError: string;
  matchTime: string;
  matchTimeError: string;
  // Intake form — group & budget
  groupBudget: string;
  groupSize: string;
  groupSizeHint: string;
  budgetPerPerson: string;
  travelStyle: string;
  standard: string;
  fastPaced: string;
  leisurely: string;
  // Intake form — options
  options: string;
  howTravel: string;
  selectAll: string;
  transportModes: string;
  transportError: string;
  // Transport mode labels
  train: string;
  coach: string;
  car: string;
  taxi: string;
  fly: string;
  bus: string;
  cycling: string;
  walking: string;
  // Intake form — fan profile
  fanProfile: string;
  fanType: string;
  loyalHatter: string;
  kenilworthRoadFaithful: string;
  supportersTrustOwner: string;
  internationalModernHatters: string;
  awayDaySpecialistsBobbers: string;
  multiculturalTownSupporters: string;
  menInGearMIGs: string;
  otherFanType: string;
  interests: string;
  pubs: string;
  shopping: string;
  attractions: string;
  history: string;
  food: string;
  // Intake form — toggles
  overnightStay: string;
  overnightHint: string;
  communityTips: string;
  communityHint: string;
  // Intake form — advanced options
  advancedOptions: string;
  groupCoordination: string;
  groupCoordinationHint: string;
  groupCoordinationDescription: string;
  loyaltyMember: string;
  loyaltyMemberHint: string;
  loyaltyMemberDescription: string;
  accessibilityNeeds: string;
  wheelchairAccess: string;
  liftRequired: string;
  companionSupport: string;
  accessibilityOther: string;
  accessibilityNone: string;
  other: string;
  preferNotToSay: string;
  // Intake form — preferences & submit
  preferences: string;
  preferencesOptional: string;
  preferencesHint: string;
  preferencesPlaceholder: string;
  planningTrip: string;
  planButton: string;
  // Agent typing / timeout
  agentPlanningTrip: string;
  agentWorking: string;
  agentTimeout: string;
  // Footer / follow-up
  followUpLabel: string;
  followUpPlaceholder: string;
  sendMessage: string;
  // Draft bubble
  youAreTyping: string;
  // Email export
  emailExportSubject: string;
  emailSentSuccess: string;
  emailSendFailed: string;
  // Saved drafts panel
  SavedDrafts: string;
  ConfirmDeleteDraft: string;
  EnterNewTitle: string;
  RestoreDraft: string;
  Rename: string;
  Delete: string;
  SelectDraftToRestore: string;
  // Form placeholders
  accessibilityNeedsPlaceholder: string;
  // Sidebar navigation/actions
  navPlan: string;
  navAllAgents: string;
  navSaveDraft: string;
  navSendEmail: string;
  navShareGroup: string;
  navDownload: string;
  calendarEventSummary: string;
  calendarEventDescription: string;
  closeLabel: string;
  navComingSoon: string;
  comingSoonTitle: string;
  comingSoonSubtitle: string;
  comingSoonHint: string;
  statusPlanned: string;
  statusInProgress: string;
  statusBeta: string;
  agent7Name: string;
  agent7Desc: string;
  agent8Name: string;
  agent8Desc: string;
  agent9Name: string;
  agent9Desc: string;
  agent10Name: string;
  agent10Desc: string;
  agent11Name: string;
  agent11Desc: string;
  agent12Name: string;
  agent12Desc: string;
}

const translations: Record<LangCode, Partial<Translations>> = {
  en: {
    appName: "Hatters Away",
    appSubtitle: "LTFC Itinerary Planner",
    skipToContent: "Skip to main content",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    selectLanguage: "Select language",
    connected: "Connected",
    connecting: "Connecting\u2026",
    offline: "Offline",
    connectingAgents: "Connecting to the planning agents\u2026",
    connectionSetupNeeded: "Connection setup needed",
    retryConnection: "Retry connection",
    envKeysExpected: "Expected .env keys:",
    planYourItinerary: "Plan Your Itinerary",
    formSubtitle: "Tell us about your trip and the agents will sort the rest",
    tripDetails: "Trip details",
    whereFrom: "Where are you travelling from?",
    whereFromPlaceholder: "e.g. Manchester, Birmingham, Leeds",
    whereFromError: "Please enter your departure city.",
    matchType: "Match type",
    home: "Home",
    away: "Away",
    matchDate: "Match date",
    matchDateError: "Please select a match date.",
    matchTime: "Match time",
    matchTimeError: "Please enter a match time.",
    groupBudget: "Group & budget",
    groupSize: "Group size",
    groupSizeHint: "Number of fans",
    budgetPerPerson: "Budget per person",
    travelStyle: "Travel style",
    standard: "Standard",
    fastPaced: "Fast-paced",
    leisurely: "Leisurely",
    options: "Options",
    howTravel: "How would you like to travel?",
    selectAll: "(select all that apply)",
    transportModes: "Transport modes",
    transportError: "Please select at least one transport mode.",
    train: "Train",
    coach: "Coach",
    car: "Car",
    taxi: "Taxi",
    fly: "Fly",
    bus: "Bus",
    cycling: "Cycling",
    walking: "Walking",
    fanProfile: "Fan profile",
    fanType: "Fan type",
    loyalHatter: "Loyal Hatter",
    kenilworthRoadFaithful: "Kenilworth Road Faithful",
    supportersTrustOwner: "Supporters' Trust Owner",
    internationalModernHatters: "International Modern Hatters",
    awayDaySpecialistsBobbers: "Away Day Specialists (Bobbers)",
    multiculturalTownSupporters: "Multicultural Town Supporters",
    menInGearMIGs: "Men in Gear (MIGs)",
    otherFanType: "Other",
    interests: "Interests",
    pubs: "Pubs",
    shopping: "Shopping",
    attractions: "Attractions",
    history: "History",
    food: "Food",
    advancedOptions: "Advanced options",
    groupCoordination: "Group coordination",
    groupCoordinationHint: "Organise travel and activities with a group",
    groupCoordinationDescription:
      "Help coordinate travel and activities for your group",
    loyaltyMember: "LTFC Loyalty Member",
    loyaltyMemberHint: "Access exclusive member benefits, discounts and offers",
    loyaltyMemberDescription: "Are you a registered LTFC loyalty member?",
    accessibilityNeeds: "Accessibility needs",
    wheelchairAccess: "Wheelchair access",
    liftRequired: "Lift required",
    companionSupport: "Companion support",
    accessibilityOther: "Other accessibility needs",
    accessibilityNone: "No accessibility needs",
    other: "Other",
    preferNotToSay: "Prefer not to say",
    overnightStay: "Overnight stay",
    overnightHint: "Include accommodation suggestions",
    communityTips: "Hatters community tips",
    communityHint: "Include crowdsourced fan recommendations",
    preferences: "Any preferences?",
    preferencesOptional: "(optional)",
    preferencesHint:
      "Dietary needs, mobility requirements, or anything else \u2014 we\u2019ll factor it in",
    preferencesPlaceholder:
      "e.g. wheelchair accessible routes, pubs near Kenilworth Road, halal food, family friendly venues\u2026",
    planningTrip: "Planning your trip\u2026",
    planButton: "Plan my match day 🏠",
    agentPlanningTrip: "planning your trip\u2026",
    agentWorking: "12 agents working \u00b7 usually 15\u201330 seconds",
    // ...existing translations...
    followUpPlaceholder: "Ask a follow-up about your match day\u2026",
    sendMessage: "Send message",
    youAreTyping: "You are typing\u2026",
    emailExportSubject: "Your LTFC Itinerary",
    emailSentSuccess: "Itinerary sent to",
    emailSendFailed: "Failed to send itinerary",
    SavedDrafts: "Saved Drafts",
    ConfirmDeleteDraft: "Delete this draft?",
    EnterNewTitle: "Enter new title:",
    RestoreDraft: "Restore",
    Rename: "Rename",
    Delete: "Delete",
    SelectDraftToRestore: "Click a draft to restore or hover for options",
    accessibilityNeedsPlaceholder:
      "e.g. wheelchair access, lift required, companion support…",
    navPlan: "Plan",
    navAllAgents: "All Agents",
    navSaveDraft: "Save Draft",
    navSendEmail: "Send Email",
    navShareGroup: "Share Link",
    navDownload: "Download",
    calendarEventSummary: "Luton Town Match Day",
    calendarEventDescription: "Match-day itinerary generated by Hatters Away.",
    closeLabel: "Close",
    navComingSoon: "Coming Soon",
    comingSoonTitle: "Agents 7 to 12: Coming Soon",
    comingSoonSubtitle:
      "New specialist agents are being prepared for supporters of all ages and group types.",
    comingSoonHint:
      "You can continue using Plan now. These new agents will appear here as they launch.",
    statusPlanned: "Planned",
    statusInProgress: "In Progress",
    statusBeta: "Beta Soon",
    agent7Name: "Heritage and Storytelling",
    agent7Desc:
      "Club history, fan stories, and match-day context for new and long-time Hatters.",
    agent8Name: "Fantasy and Prediction",
    agent8Desc:
      "Friendly score predictions, form insights, and match-day what-if views.",
    agent9Name: "Social Impact",
    agent9Desc:
      "Community initiatives, volunteering opportunities, and supporter-led causes.",
    agent10Name: "Business Intelligence",
    agent10Desc:
      "Operational insights to improve travel, timing, and supporter experience quality.",
    agent11Name: "Youth Development",
    agent11Desc:
      "Family-friendly and youth-focused recommendations for safe, enjoyable match days.",
    agent12Name: "Weather Agent",
    agent12Desc:
      "Forecast-aware planning for travel, clothing, and safer choices on match day.",
  },

  es: {
    appName: "Hatters Away",
    appSubtitle: "Planificador LTFC",
    skipToContent: "Saltar al contenido principal",
    switchToLight: "Cambiar a modo claro",
    switchToDark: "Cambiar a modo oscuro",
    selectLanguage: "Seleccionar idioma",
    connected: "Conectado",
    connecting: "Conectando\u2026",
    offline: "Sin conexi\u00f3n",
    connectingAgents: "Conectando con los agentes de planificaci\u00f3n\u2026",
    connectionSetupNeeded: "Configuraci\u00f3n de conexi\u00f3n necesaria",
    retryConnection: "Reintentar conexi\u00f3n",
    envKeysExpected: "Claves .env esperadas:",
    planYourItinerary: "Planifica Tu Itinerario",
    formSubtitle:
      "Cu\u00e9ntanos sobre tu viaje y los agentes se encargar\u00e1n del resto",
    tripDetails: "Detalles del viaje",
    whereFrom: "\u00bfDesde d\u00f3nde viajas?",
    whereFromPlaceholder: "ej. Manchester, Birmingham, Leeds",
    whereFromError: "Por favor, introduce tu ciudad de salida.",
    matchDate: "Fecha del partido",
    matchDateError: "Por favor, selecciona una fecha.",
    matchTime: "Hora del partido",
    matchTimeError: "Por favor, introduce una hora.",
    groupBudget: "Grupo y presupuesto",
    groupSize: "Tama\u00f1o del grupo",
    groupSizeHint: "N\u00famero de aficionados que viajan",
    budgetPerPerson: "Presupuesto por persona",
    options: "Opciones",
    howTravel: "\u00bfC\u00f3mo te gustar\u00eda viajar?",
    selectAll: "(selecciona todos los que apliquen)",
    transportError: "Por favor, selecciona al menos un modo de transporte.",
    train: "Tren",
    coach: "Autocar",
    car: "Coche",
    taxi: "Taxi",
    fly: "Vuelo",
    overnightStay: "Estancia nocturna",
    overnightHint: "Incluir sugerencias de alojamiento",
    communityTips: "Consejos de la comunidad Hatters",
    communityHint: "Incluir recomendaciones de aficionados",
    preferences: "\u00bfAlguna preferencia?",
    preferencesOptional: "(opcional)",
    preferencesHint:
      "Necesidades diet\u00e9ticas, requisitos de movilidad u otras preferencias",
    preferencesPlaceholder:
      "ej. rutas accesibles, pubs cerca de Kenilworth Road, comida halal\u2026",
    planningTrip: "Planificando tu viaje\u2026",
    planButton: "Planificar mi d\u00eda de partido \uD83D\uDFE0",
    agentPlanningTrip: "planificando tu viaje\u2026",
    agentWorking: "6 agentes trabajando \u00b7 normalmente 15\u201330 segundos",
    agentTimeout:
      "Los agentes tardan m\u00e1s de lo habitual \u2014 por favor, int\u00e9ntalo de nuevo.",
    followUpLabel: "Enviar un mensaje de seguimiento",
    followUpPlaceholder: "Haz una pregunta sobre tu d\u00eda de partido\u2026",
    sendMessage: "Enviar mensaje",
    youAreTyping: "Est\u00e1s escribiendo\u2026",
    SavedDrafts: "Borradores Guardados",
    ConfirmDeleteDraft: "¿Eliminar este borrador?",
    EnterNewTitle: "Introduce un nuevo título:",
    RestoreDraft: "Restaurar",
    Rename: "Renombrar",
    Delete: "Eliminar",
    SelectDraftToRestore:
      "Haz clic en un borrador para restaurar o pasa el cursor para ver opciones",
    accessibilityNeedsPlaceholder:
      "ej. acceso en silla de ruedas, ascensor requerido, apoyo de acompañante…",
  },

  fr: {
    appName: "Hatters Away",
    appSubtitle: "Planificateur LTFC",
    skipToContent: "Aller au contenu principal",
    switchToLight: "Passer en mode clair",
    switchToDark: "Passer en mode sombre",
    selectLanguage: "Choisir la langue",
    connected: "Connect\u00e9",
    connecting: "Connexion\u2026",
    offline: "Hors ligne",
    connectingAgents: "Connexion aux agents de planification\u2026",
    connectionSetupNeeded: "Configuration de connexion requise",
    retryConnection: "R\u00e9essayer la connexion",
    envKeysExpected: "Cl\u00e9s .env attendues\u00a0:",
    planYourItinerary: "Planifiez Votre Itin\u00e9raire",
    formSubtitle:
      "Parlez-nous de votre voyage et les agents s\u2019occupent du reste",
    tripDetails: "D\u00e9tails du voyage",
    whereFrom: "D\u2019o\u00f9 voyagez-vous\u00a0?",
    whereFromPlaceholder: "ex. Manchester, Birmingham, Leeds",
    whereFromError: "Veuillez entrer votre ville de d\u00e9part.",
    matchDate: "Date du match",
    matchDateError: "Veuillez s\u00e9lectionner une date.",
    matchTime: "Heure du match",
    matchTimeError: "Veuillez entrer une heure.",
    groupBudget: "Groupe et budget",
    groupSize: "Taille du groupe",
    groupSizeHint: "Nombre de supporters voyageant",
    budgetPerPerson: "Budget par personne",
    options: "Options",
    howTravel: "Comment souhaitez-vous voyager\u00a0?",
    selectAll: "(s\u00e9lectionnez tout ce qui s\u2019applique)",
    transportError: "Veuillez s\u00e9lectionner au moins un mode de transport.",
    train: "Train",
    coach: "Car",
    car: "Voiture",
    taxi: "Taxi",
    fly: "Avion",
    overnightStay: "Nuit sur place",
    overnightHint: "Inclure des suggestions d\u2019h\u00e9bergement",
    communityTips: "Conseils de la communaut\u00e9 Hatters",
    communityHint: "Inclure les recommandations des supporters",
    preferences: "Pr\u00e9f\u00e9rences\u00a0?",
    preferencesOptional: "(optionnel)",
    preferencesHint:
      "Besoins alimentaires, mobilit\u00e9 r\u00e9duite ou autre \u2014 nous en tiendrons compte",
    preferencesPlaceholder:
      "ex. itin\u00e9raires accessibles, pubs pr\u00e8s de Kenilworth Road, nourriture halal\u2026",
    planningTrip: "Planification de votre voyage\u2026",
    planButton: "Planifier mon jour de match \uD83D\uDFE0",
    agentPlanningTrip: "planifie votre voyage\u2026",
    agentWorking:
      "6 agents actifs \u00b7 g\u00e9n\u00e9ralement 15\u201330 secondes",
    agentTimeout:
      "Les agents prennent plus de temps que d\u2019habitude \u2014 veuillez r\u00e9essayer.",
    followUpLabel: "Envoyer un message de suivi",
    followUpPlaceholder:
      "Posez une question sur votre journ\u00e9e de match\u2026",
    sendMessage: "Envoyer le message",
    youAreTyping: "Vous \u00eates en train d\u2019\u00e9crire\u2026",
    SavedDrafts: "Brouillons Enregistrés",
    ConfirmDeleteDraft: "Supprimer ce brouillon ?",
    EnterNewTitle: "Entrez un nouveau titre :",
    RestoreDraft: "Restaurer",
    Rename: "Renommer",
    Delete: "Supprimer",
    SelectDraftToRestore:
      "Cliquez sur un brouillon pour restaurer ou survolez pour les options",
    accessibilityNeedsPlaceholder:
      "ex. accès en fauteuil roulant, ascenseur nécessaire, soutien d'accompagnateur…",
  },

  pl: {
    appName: "Hatters Away",
    appSubtitle: "Planista podr\u00f3\u017cy LTFC",
    skipToContent: "Przejd\u017a do g\u0142\u00f3wnej tre\u015bci",
    switchToLight: "Prze\u0142\u0105cz na tryb jasny",
    switchToDark: "Prze\u0142\u0105cz na tryb ciemny",
    selectLanguage: "Wybierz j\u0119zyk",
    connected: "Po\u0142\u0105czono",
    connecting: "\u0141\u0105czenie\u2026",
    offline: "Offline",
    connectingAgents: "\u0141\u0105czenie z agentami planowania\u2026",
    connectionSetupNeeded: "Wymagana konfiguracja po\u0142\u0105czenia",
    retryConnection: "Pon\u00f3w po\u0142\u0105czenie",
    envKeysExpected: "Oczekiwane klucze .env:",
    planYourItinerary: "Zaplanuj Swoj\u0105 Podr\u00f3\u017c",
    formSubtitle:
      "Powiedz nam o swojej podr\u00f3\u017cy, a agenci zajm\u0105 si\u0119 reszt\u0105",
    tripDetails: "Szczeg\u00f3\u0142y podr\u00f3\u017cy",
    whereFrom: "Sk\u0105d podr\u00f3\u017cujesz?",
    whereFromPlaceholder: "np. Manchester, Birmingham, Leeds",
    whereFromError: "Prosz\u0119 poda\u0107 miasto wyjazdu.",
    matchDate: "Data meczu",
    matchDateError: "Prosz\u0119 wybra\u0107 dat\u0119 meczu.",
    matchTime: "Godzina meczu",
    matchTimeError: "Prosz\u0119 poda\u0107 godzin\u0119 meczu.",
    groupBudget: "Grupa i bud\u017cet",
    groupSize: "Liczba os\u00f3b",
    groupSizeHint: "Liczba podr\u00f3\u017cuj\u0105cych kibic\u00f3w",
    budgetPerPerson: "Bud\u017cet na osob\u0119",
    options: "Opcje",
    howTravel: "Jak chcia\u0142by\u015b podr\u00f3\u017cowa\u0107?",
    selectAll: "(zaznacz wszystkie pasuj\u0105ce)",
    transportError: "Wybierz co najmniej jeden \u015brodek transportu.",
    train: "Poci\u0105g",
    coach: "Autokar",
    car: "Samoch\u00f3d",
    taxi: "Taks\u00f3wka",
    fly: "Lot",
    overnightStay: "Nocleg",
    overnightHint: "Uwzgl\u0119dnij sugestie dotycz\u0105ce zakwaterowania",
    communityTips: "Wskaz\u00f3wki spo\u0142eczno\u015bci Hatters",
    communityHint: "Uwzgl\u0119dnij rekomendacje kibic\u00f3w",
    preferences: "Preferencje?",
    preferencesOptional: "(opcjonalne)",
    preferencesHint:
      "Wymagania dietetyczne, potrzeby ruchowe lub inne \u2014 we\u017amiemy je pod uwag\u0119",
    preferencesPlaceholder:
      "np. trasy dost\u0119pne dla w\u00f3zk\u00f3w, puby przy Kenilworth Road, jedzenie halal\u2026",
    planningTrip: "Planujemy Twoj\u0105 podr\u00f3\u017c\u2026",
    planButton: "Zaplanuj m\u00f3j dzie\u0144 meczowy \uD83D\uDFE0",
    agentPlanningTrip: "planuje Twoj\u0105 podr\u00f3\u017c\u2026",
    agentWorking: "6 agent\u00f3w pracuje \u00b7 zwykle 15\u201330 sekund",
    agentTimeout:
      "Agenci potrzebuj\u0105 wi\u0119cej czasu \u2014 spr\u00f3buj ponownie.",
    followUpLabel:
      "Wy\u015blij wiadomo\u015b\u0107 uzupe\u0142niaj\u0105c\u0105",
    followUpPlaceholder: "Zadaj pytanie dotycz\u0105ce dnia meczu\u2026",
    sendMessage: "Wy\u015blij wiadomo\u015b\u0107",
    youAreTyping: "Piszesz\u2026",
    SavedDrafts: "Zapisane Wersje Robocze",
    ConfirmDeleteDraft: "Usunąć ten szkic?",
    EnterNewTitle: "Wprowadź nowy tytuł:",
    RestoreDraft: "Przywróć",
    Rename: "Zmień nazwę",
    Delete: "Usuń",
    SelectDraftToRestore:
      "Kliknij szkic, aby przywrócić lub najedź kursorem, aby zobaczyć opcje",
    accessibilityNeedsPlaceholder:
      "np. dostęp na wózku inwalidzkim, wymagana winda, wsparcie opiekuna…",
  },

  ar: {
    appName: "\u0647\u0627\u062a\u0631\u0632 \u0623\u0648\u0627\u064a",
    appSubtitle: "\u0645\u062e\u0637\u0637 \u0631\u062d\u0644\u0627\u062a LTFC",
    skipToContent:
      "\u0627\u0646\u062a\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0631\u0626\u064a\u0633\u064a",
    switchToLight:
      "\u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062a\u062d",
    switchToDark:
      "\u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646",
    selectLanguage: "\u0627\u062e\u062a\u0631 \u0627\u0644\u0644\u063a\u0629",
    connected: "\u0645\u062a\u0635\u0644",
    connecting:
      "\u062c\u0627\u0631\u064d \u0627\u0644\u0627\u062a\u0635\u0627\u0644\u2026",
    offline: "\u063a\u064a\u0631 \u0645\u062a\u0635\u0644",
    connectingAgents:
      "\u062c\u0627\u0631\u064d \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0648\u0643\u0644\u0627\u0621 \u0627\u0644\u062a\u062e\u0637\u064a\u0637\u2026",
    connectionSetupNeeded:
      "\u0645\u0637\u0644\u0648\u0628 \u0625\u0639\u062f\u0627\u062f \u0627\u0644\u0627\u062a\u0635\u0627\u0644",
    retryConnection:
      "\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629",
    envKeysExpected:
      "\u0645\u0641\u0627\u062a\u064a\u062d .env \u0627\u0644\u0645\u062a\u0648\u0642\u0639\u0629:",
    planYourItinerary:
      "\u062e\u0637\u0637 \u0644\u0631\u062d\u0644\u062a\u0643",
    formSubtitle:
      "\u0623\u062e\u0628\u0631\u0646\u0627 \u0639\u0646 \u0631\u062d\u0644\u062a\u0643 \u0648\u0633\u064a\u062a\u0648\u0644\u0649 \u0627\u0644\u0648\u0643\u0644\u0627\u0621 \u0627\u0644\u0628\u0627\u0642\u064a",
    tripDetails:
      "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0631\u062d\u0644\u0629",
    whereFrom:
      "\u0645\u0646 \u0623\u064a\u0646 \u062a\u0633\u0627\u0641\u0631\u061f",
    whereFromPlaceholder:
      "\u0645\u062b\u0627\u0644: \u0645\u0627\u0646\u0634\u0633\u062a\u0631\u060c \u0628\u0631\u0645\u0646\u063a\u0647\u0627\u0645",
    whereFromError:
      "\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0645\u062f\u064a\u0646\u0629 \u0627\u0644\u0645\u063a\u0627\u062f\u0631\u0629.",
    matchDate:
      "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629",
    matchDateError:
      "\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u062a\u0627\u0631\u064a\u062e.",
    matchTime:
      "\u0648\u0642\u062a \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629",
    matchTimeError:
      "\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0648\u0642\u062a.",
    groupBudget:
      "\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 \u0648\u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629",
    groupSize:
      "\u062d\u062c\u0645 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629",
    groupSizeHint:
      "\u0639\u062f\u062f \u0627\u0644\u0645\u0634\u062c\u0639\u064a\u0646 \u0627\u0644\u0645\u0633\u0627\u0641\u0631\u064a\u0646",
    budgetPerPerson:
      "\u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629 \u0644\u0644\u0634\u062e\u0635",
    options: "\u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a",
    howTravel:
      "\u0643\u064a\u0641 \u062a\u0631\u064a\u062f \u0627\u0644\u0633\u0641\u0631\u061f",
    selectAll:
      "(\u0627\u062e\u062a\u0631 \u0643\u0644 \u0645\u0627 \u064a\u0646\u0637\u0628\u0642)",
    transportError:
      "\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0648\u0633\u064a\u0644\u0629 \u0646\u0642\u0644 \u0648\u0627\u062d\u062f\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
    train: "\u0642\u0637\u0627\u0631",
    coach: "\u062d\u0627\u0641\u0644\u0629",
    car: "\u0633\u064a\u0627\u0631\u0629",
    taxi: "\u062a\u0627\u0643\u0633\u064a",
    fly: "\u0637\u064a\u0631\u0627\u0646",
    overnightStay:
      "\u0627\u0644\u0625\u0642\u0627\u0645\u0629 \u0627\u0644\u0644\u064a\u0644\u064a\u0629",
    overnightHint:
      "\u062a\u0636\u0645\u064a\u0646 \u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a \u0627\u0644\u0625\u0642\u0627\u0645\u0629",
    communityTips:
      "\u0646\u0635\u0627\u0626\u062d \u0645\u062c\u062a\u0645\u0639 \u0647\u0627\u062a\u0631\u0632",
    communityHint:
      "\u062a\u0636\u0645\u064a\u0646 \u062a\u0648\u0635\u064a\u0627\u062a \u0627\u0644\u0645\u0634\u062c\u0639\u064a\u0646",
    preferences:
      "\u0623\u064a \u062a\u0641\u0636\u064a\u0644\u0627\u062a\u061f",
    preferencesOptional: "(\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
    preferencesHint:
      "\u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u063a\u0630\u0627\u0626\u064a\u0629\u060c \u0645\u062a\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062a\u0646\u0642\u0644 \u0623\u0648 \u063a\u064a\u0631\u0647\u0627",
    preferencesPlaceholder:
      "\u0645\u062b\u0627\u0644: \u0645\u0633\u0627\u0631\u0627\u062a \u0644\u0643\u0631\u0627\u0633\u064a \u0627\u0644\u0639\u062c\u0644\u060c \u0637\u0639\u0627\u0645 \u062d\u0644\u0627\u0644\u2026",
    planningTrip:
      "\u062c\u0627\u0631\u064d \u062a\u062e\u0637\u064a\u0637 \u0631\u062d\u0644\u062a\u0643\u2026",
    planButton:
      "\u062e\u0637\u0637 \u0644\u064a\u0648\u0645 \u0645\u0628\u0627\u0631\u0627\u062a\u064a \uD83D\uDFE0",
    agentPlanningTrip:
      "\u064a\u062e\u0637\u0637 \u0631\u062d\u0644\u062a\u0643\u2026",
    agentWorking:
      "6 \u0648\u0643\u0644\u0627\u0621 \u064a\u0639\u0645\u0644\u0648\u0646 \u00b7 \u0639\u0627\u062f\u0629\u064b 15\u201330 \u062b\u0627\u0646\u064a\u0629",
    agentTimeout:
      "\u0627\u0644\u0648\u0643\u0644\u0627\u0621 \u064a\u0633\u062a\u063a\u0631\u0642\u0648\u0646 \u0648\u0642\u062a\u0627\u064b \u0623\u0637\u0648\u0644 \u2014 \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    followUpLabel:
      "\u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0645\u062a\u0627\u0628\u0639\u0629",
    followUpPlaceholder:
      "\u0627\u0637\u0631\u062d \u0633\u0624\u0627\u0644\u0627\u064b \u0639\u0646 \u064a\u0648\u0645 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629\u2026",
    sendMessage:
      "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629",
    youAreTyping: "\u0623\u0646\u062a \u062a\u0643\u062a\u0628\u2026",
    SavedDrafts:
      "\u0627\u0644\u0645\u0633\u0648\u062f\u0627\u062a \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629",
    ConfirmDeleteDraft:
      "\u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u0633\u0648\u062f\u0629\u061f",
    EnterNewTitle:
      "\u0623\u062f\u062e\u0644 \u0639\u0646\u0648\u0627\u0646\u064b\u0627 \u062c\u062f\u064a\u062f\u064b\u0627:",
    RestoreDraft: "\u0627\u0633\u062a\u0639\u0627\u062f\u0629",
    Rename:
      "\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0633\u0645\u064a\u0629",
    Delete: "\u062d\u0630\u0641",
    SelectDraftToRestore:
      "\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0645\u0633\u0648\u062f\u0629 \u0644\u0644\u0627\u0633\u062a\u0639\u0627\u062f\u0629 \u0623\u0648 \u0645\u0631\u0631 \u0627\u0644\u0645\u0624\u0634\u0631 \u0644\u0644\u062e\u064a\u0627\u0631\u0627\u062a",
  },

  bn: {
    appName:
      "\u09b9\u09cd\u09af\u09be\u099f\u09be\u09b0\u09cd\u09b8 \u0985\u09cd\u09af\u09be\u0993\u09af\u09bc\u09c7",
    appSubtitle:
      "LTFC \u09ad\u09cd\u09b0\u09ae\u09a3 \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be\u0995\u09be\u09b0\u09c0",
    skipToContent:
      "\u09ae\u09c2\u09b2 \u09ac\u09bf\u09b7\u09af\u09bc\u09ac\u09b8\u09cd\u09a4\u09c1\u09a4\u09c7 \u09af\u09be\u09a8",
    switchToLight:
      "\u09b2\u09be\u0987\u099f \u09ae\u09cb\u09a1\u09c7 \u09af\u09be\u09a8",
    switchToDark:
      "\u09a1\u09be\u09b0\u09cd\u0995 \u09ae\u09cb\u09a1\u09c7 \u09af\u09be\u09a8",
    selectLanguage:
      "\u09ad\u09be\u09b7\u09be \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u0995\u09b0\u09c1\u09a8",
    connected: "\u09b8\u0982\u09af\u09c1\u0995\u09cd\u09a4",
    connecting:
      "\u09b8\u0982\u09af\u09cb\u0997 \u09b9\u099a\u09cd\u099b\u09c7\u2026",
    offline: "\u0985\u09ab\u09b2\u09be\u0987\u09a8",
    connectingAgents:
      "\u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be \u098f\u099c\u09c7\u09a8\u09cd\u099f\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09b8\u0982\u09af\u09cb\u0997 \u09b9\u099a\u09cd\u099b\u09c7\u2026",
    connectionSetupNeeded:
      "\u09b8\u0982\u09af\u09cb\u0997 \u09b8\u09c7\u099f\u0986\u09aa \u09aa\u09cd\u09b0\u09af\u09bc\u09cb\u099c\u09a8",
    retryConnection:
      "\u09aa\u09c1\u09a8\u09b0\u09be\u09af\u09bc \u09b8\u0982\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8",
    envKeysExpected:
      "\u09aa\u09cd\u09b0\u09a4\u09cd\u09af\u09be\u09b6\u09bf\u09a4 .env \u0995\u09c0:",
    planYourItinerary:
      "\u0986\u09aa\u09a8\u09be\u09b0 \u09ad\u09cd\u09b0\u09ae\u09a3 \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be \u0995\u09b0\u09c1\u09a8",
    formSubtitle:
      "\u0986\u09aa\u09a8\u09be\u09b0 \u09ad\u09cd\u09b0\u09ae\u09a3 \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09c7 \u09ac\u09b2\u09c1\u09a8 \u098f\u09ac\u0982 \u098f\u099c\u09c7\u09a8\u09cd\u099f\u09b0\u09be \u09ac\u09be\u0995\u09bf\u099f\u09be \u09b8\u09be\u09ae\u09b2\u09be\u09ac\u09c7",
    tripDetails:
      "\u09ad\u09cd\u09b0\u09ae\u09a3\u09c7\u09b0 \u09ac\u09bf\u09ac\u09b0\u09a3",
    whereFrom:
      "\u0986\u09aa\u09a8\u09bf \u0995\u09cb\u09a5\u09be \u09a5\u09c7\u0995\u09c7 \u09af\u09be\u09a4\u09cd\u09b0\u09be \u0995\u09b0\u099b\u09c7\u09a8?",
    whereFromPlaceholder:
      "\u09af\u09c7\u09ae\u09a8: \u09ae\u09cd\u09af\u09be\u09a8\u099a\u09c7\u09b8\u09cd\u099f\u09be\u09b0, \u09ac\u09be\u09b0\u09cd\u09ae\u09bf\u0982\u09b9\u09be\u09ae, \u09b2\u09bf\u09a1\u09b8",
    whereFromError:
      "\u0985\u09a8\u09c1\u0997\u09cd\u09b0\u09b9\u09aa\u09c2\u09b0\u09cd\u09ac\u0995 \u0986\u09aa\u09a8\u09be\u09b0 \u09af\u09be\u09a4\u09cd\u09b0\u09be\u09b0 \u09b6\u09b9\u09b0 \u09b2\u09bf\u0996\u09c1\u09a8\u0964",
    matchDate:
      "\u09ae\u09cd\u09af\u09be\u099a\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996",
    matchDateError:
      "\u0985\u09a8\u09c1\u0997\u09cd\u09b0\u09b9\u09aa\u09c2\u09b0\u09cd\u09ac\u0995 \u098f\u0995\u099f\u09bf \u09a4\u09be\u09b0\u09bf\u0996 \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u0995\u09b0\u09c1\u09a8\u0964",
    matchTime:
      "\u09ae\u09cd\u09af\u09be\u099a\u09c7\u09b0 \u09b8\u09ae\u09af\u09bc",
    matchTimeError:
      "\u0985\u09a8\u09c1\u0997\u09cd\u09b0\u09b9\u09aa\u09c2\u09b0\u09cd\u09ac\u0995 \u09b8\u09ae\u09af\u09bc \u09b2\u09bf\u0996\u09c1\u09a8\u0964",
    groupBudget:
      "\u0997\u09cd\u09b0\u09c1\u09aa \u0993 \u09ac\u09be\u099c\u09c7\u099f",
    groupSize:
      "\u0997\u09cd\u09b0\u09c1\u09aa\u09c7\u09b0 \u0986\u0995\u09be\u09b0",
    groupSizeHint:
      "\u09ad\u09cd\u09b0\u09ae\u09a3\u0995\u09be\u09b0\u09c0 \u09b8\u09ae\u09b0\u09cd\u09a5\u0995\u09a6\u09c7\u09b0 \u09b8\u0982\u0996\u09cd\u09af\u09be",
    budgetPerPerson:
      "\u09aa\u09cd\u09b0\u09a4\u09bf \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09ac\u09be\u099c\u09c7\u099f",
    options: "\u09ac\u09bf\u0995\u09b2\u09cd\u09aa\u09b8\u09ae\u09c2\u09b9",
    howTravel:
      "\u0986\u09aa\u09a8\u09bf \u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u09af\u09c7\u09a4\u09c7 \u099a\u09be\u09a8?",
    selectAll:
      "(\u09aa\u09cd\u09b0\u09af\u09cb\u099c\u09cd\u09af \u09b8\u09ac \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u0995\u09b0\u09c1\u09a8)",
    transportError:
      "\u0985\u09a8\u09cd\u09a4\u09a4 \u098f\u0995\u099f\u09bf \u09aa\u09b0\u09bf\u09ac\u09b9\u09a8 \u09ae\u09be\u09a7\u09cd\u09af\u09ae \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u0995\u09b0\u09c1\u09a8\u0964",
    train: "\u099f\u09cd\u09b0\u09c7\u09a8",
    coach: "\u0995\u09cb\u099a",
    car: "\u0997\u09be\u09dc\u09bf",
    taxi: "\u099f\u09cd\u09af\u09be\u0995\u09cd\u09b8\u09bf",
    fly: "\u09ac\u09bf\u09ae\u09be\u09a8",
    overnightStay:
      "\u09b0\u09be\u09a4\u09cd\u09b0\u09bf\u09af\u09be\u09aa\u09a8",
    overnightHint:
      "\u09a5\u09be\u0995\u09be\u09b0 \u09ac\u09cd\u09af\u09ac\u09b8\u09cd\u09a5\u09be\u09b0 \u09aa\u09b0\u09be\u09ae\u09b0\u09cd\u09b6 \u0985\u09a8\u09cd\u09a4\u09b0\u09cd\u09ad\u09c1\u0995\u09cd\u09a4 \u0995\u09b0\u09c1\u09a8",
    communityTips:
      "\u09b9\u09cd\u09af\u09be\u099f\u09be\u09b0\u09cd\u09b8 \u09b8\u09ae\u09cd\u09aa\u09cd\u09b0\u09a6\u09be\u09af\u09bc\u09c7\u09b0 \u099f\u09bf\u09aa\u09b8",
    communityHint:
      "\u09b8\u09ae\u09b0\u09cd\u09a5\u0995\u09a6\u09c7\u09b0 \u09b8\u09c1\u09aa\u09be\u09b0\u09bf\u09b6 \u0985\u09a8\u09cd\u09a4\u09b0\u09cd\u09ad\u09c1\u0995\u09cd\u09a4 \u0995\u09b0\u09c1\u09a8",
    preferences:
      "\u0995\u09cb\u09a8\u09cb \u09aa\u099b\u09a8\u09cd\u09a6 \u0986\u099b\u09c7?",
    preferencesOptional:
      "(\u09ac\u09be\u099e\u09cd\u099b\u09a8\u09c0\u09af\u09bc)",
    preferencesHint:
      "\u0996\u09be\u09a6\u09cd\u09af\u09a4\u09be\u09b2\u09bf\u0995\u09be\u0997\u09a4 \u09aa\u09cd\u09b0\u09af\u09bc\u09cb\u099c\u09a8\u09c0\u09af\u09bc\u09a4\u09be, \u0997\u09a4\u09bf\u09b6\u09c0\u09b2\u09a4\u09be\u09b0 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u09ac\u09be \u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af \u0995\u09bf\u099b\u09c1",
    preferencesPlaceholder:
      "\u09af\u09c7\u09ae\u09a8: \u09b9\u09c1\u0987\u09b2\u099a\u09c7\u09af\u09bc\u09be\u09b0 \u09b0\u09c1\u099f, \u09b9\u09be\u09b2\u09be\u09b2 \u0996\u09be\u09ac\u09be\u09b0\u2026",
    planningTrip:
      "\u0986\u09aa\u09a8\u09be\u09b0 \u09ad\u09cd\u09b0\u09ae\u09a3 \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be \u0995\u09b0\u09be \u09b9\u099a\u09cd\u099b\u09c7\u2026",
    planButton:
      "\u0986\u09ae\u09be\u09b0 \u09ae\u09cd\u09af\u09be\u099a \u09a1\u09c7 \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be \u0995\u09b0\u09c1\u09a8 \uD83D\uDFE0",
    agentPlanningTrip:
      "\u0986\u09aa\u09a8\u09be\u09b0 \u09ad\u09cd\u09b0\u09ae\u09a3 \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be \u0995\u09b0\u099b\u09c7\u2026",
    agentWorking:
      "6 \u098f\u099c\u09c7\u09a8\u09cd\u099f \u0995\u09be\u099c \u0995\u09b0\u099b\u09c7 \u00b7 \u09b8\u09be\u09a7\u09be\u09b0\u09a3\u09a4 15\u201330 \u09b8\u09c7\u0995\u09c7\u09a8\u09cd\u09a1",
    agentTimeout:
      "\u098f\u099c\u09c7\u09a8\u09cd\u099f\u09b0\u09be \u09b8\u09be\u09a7\u09be\u09b0\u09a3\u09c7\u09b0 \u099a\u09c7\u09df\u09c7 \u09ac\u09c7\u09b6\u09bf \u09b8\u09ae\u09af\u09bc \u09a8\u09bf\u099a\u09cd\u099b\u09c7 \u2014 \u0986\u09ac\u09be\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09c1\u09a8\u0964",
    followUpLabel:
      "\u09ab\u09b2\u09cb-\u0986\u09aa \u09ac\u09be\u09b0\u09cd\u09a4\u09be \u09aa\u09be\u09a0\u09be\u09a8",
    followUpPlaceholder:
      "\u0986\u09aa\u09a8\u09be\u09b0 \u09ae\u09cd\u09af\u09be\u099a \u09a1\u09c7 \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09c7 \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u0995\u09b0\u09c1\u09a8\u2026",
    sendMessage:
      "\u09ac\u09be\u09b0\u09cd\u09a4\u09be \u09aa\u09be\u09a0\u09be\u09a8",
    youAreTyping:
      "\u0986\u09aa\u09a8\u09bf \u099f\u09be\u0987\u09aa \u0995\u09b0\u099b\u09c7\u09a8\u2026",
    SavedDrafts:
      "\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u0996\u09b8\u09dc\u09be",
    ConfirmDeleteDraft:
      "\u098f\u0987 \u0996\u09b8\u09dc\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09ac\u09c7\u09a8?",
    EnterNewTitle:
      "\u09a8\u09a4\u09c1\u09a8 \u09b6\u09bf\u09b0\u09cb\u09a8\u09be\u09ae \u09b2\u09bf\u0996\u09c1\u09a8:",
    RestoreDraft:
      "\u09aa\u09c1\u09a8\u09b0\u09c1\u09a6\u09cd\u09a7\u09be\u09b0",
    Rename:
      "\u09a8\u09be\u09ae \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8",
    Delete: "\u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8",
    SelectDraftToRestore:
      "\u09aa\u09c1\u09a8\u09b0\u09c1\u09a6\u09cd\u09a7\u09be\u09b0 \u0995\u09b0\u09a4\u09c7 \u0996\u09b8\u09dc\u09be\u09af\u09bc \u0995\u09cd\u09b2\u09bf\u0995 \u0995\u09b0\u09c1\u09a8 \u09ac\u09be \u09ac\u09bf\u0995\u09b2\u09cd\u09aa\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u09b9\u09ad\u09be\u09b0 \u0995\u09b0\u09c1\u09a8",
  },

  pt: {
    appName: "Hatters Away",
    appSubtitle: "Planificador de Viagens LTFC",
    skipToContent: "Ir para o conte\u00fado principal",
    switchToLight: "Mudar para modo claro",
    switchToDark: "Mudar para modo escuro",
    selectLanguage: "Selecionar idioma",
    connected: "Conectado",
    connecting: "A conectar\u2026",
    offline: "Offline",
    connectingAgents: "A conectar aos agentes de planeamento\u2026",
    connectionSetupNeeded:
      "Configura\u00e7\u00e3o de liga\u00e7\u00e3o necess\u00e1ria",
    retryConnection: "Tentar ligar novamente",
    envKeysExpected: "Chaves .env esperadas:",
    planYourItinerary: "Planeie o Seu Itin\u00e9rario",
    formSubtitle: "Conte-nos sobre a sua viagem e os agentes tratam do resto",
    tripDetails: "Detalhes da viagem",
    whereFrom: "De onde est\u00e1 a viajar?",
    whereFromPlaceholder: "ex. Manchester, Birmingham, Leeds",
    whereFromError: "Por favor, introduza a sua cidade de partida.",
    matchDate: "Data do jogo",
    matchDateError: "Por favor, selecione uma data.",
    matchTime: "Hora do jogo",
    matchTimeError: "Por favor, introduza uma hora.",
    groupBudget: "Grupo e or\u00e7amento",
    groupSize: "Tamanho do grupo",
    groupSizeHint: "N\u00famero de adeptos a viajar",
    budgetPerPerson: "Or\u00e7amento por pessoa",
    options: "Op\u00e7\u00f5es",
    howTravel: "Como prefere viajar?",
    selectAll: "(selecione tudo o que se aplica)",
    transportError: "Por favor, selecione pelo menos um meio de transporte.",
    train: "Comboio",
    coach: "Autocarro",
    car: "Carro",
    taxi: "T\u00e1xi",
    fly: "Avi\u00e3o",
    overnightStay: "Pernoita",
    overnightHint: "Incluir sugest\u00f5es de alojamento",
    communityTips: "Dicas da comunidade Hatters",
    communityHint: "Incluir recomenda\u00e7\u00f5es dos adeptos",
    preferences: "Alguma prefer\u00eancia?",
    preferencesOptional: "(opcional)",
    preferencesHint:
      "Necessidades alimentares, mobilidade reduzida ou outra coisa \u2014 teremos em conta",
    preferencesPlaceholder:
      "ex. rotas acess\u00edveis, pubs perto do Kenilworth Road, comida halal\u2026",
    planningTrip: "A planear a sua viagem\u2026",
    planButton: "Planear o meu dia de jogo \uD83D\uDFE0",
    agentPlanningTrip: "a planear a sua viagem\u2026",
    agentWorking: "6 agentes ativos \u00b7 geralmente 15\u201330 segundos",
    agentTimeout:
      "Os agentes est\u00e3o a demorar mais do que o habitual \u2014 tente novamente.",
    followUpLabel: "Enviar uma mensagem de seguimento",
    followUpPlaceholder: "Fa\u00e7a uma pergunta sobre o seu dia de jogo\u2026",
    sendMessage: "Enviar mensagem",
    youAreTyping: "Est\u00e1 a escrever\u2026",
    SavedDrafts: "Rascunhos Guardados",
    ConfirmDeleteDraft: "Eliminar este rascunho?",
    EnterNewTitle: "Introduza um novo título:",
    RestoreDraft: "Restaurar",
    Rename: "Renomear",
    Delete: "Eliminar",
    SelectDraftToRestore:
      "Clique num rascunho para restaurar ou passe o cursor para ver opções",
    accessibilityNeedsPlaceholder:
      "z.B. Rollstuhlzugang, Aufzug erforderlich, Begleiterunterstützung…",
  },

  de: {
    appName: "Hatters Away",
    appSubtitle: "LTFC Reiseplaner",
    skipToContent: "Zum Hauptinhalt springen",
    switchToLight: "Zum hellen Modus wechseln",
    switchToDark: "Zum dunklen Modus wechseln",
    selectLanguage: "Sprache ausw\u00e4hlen",
    connected: "Verbunden",
    connecting: "Verbinde\u2026",
    offline: "Offline",
    connectingAgents: "Verbinde mit Planungsagenten\u2026",
    connectionSetupNeeded: "Verbindungseinrichtung erforderlich",
    retryConnection: "Verbindung erneut versuchen",
    envKeysExpected: "Erwartete .env-Schl\u00fcssel:",
    planYourItinerary: "Plane Deine Reise",
    formSubtitle:
      "Erz\u00e4hl uns von deiner Reise und die Agenten erledigen den Rest",
    tripDetails: "Reisedetails",
    whereFrom: "Von wo reist du?",
    whereFromPlaceholder: "z.B. Manchester, Birmingham, Leeds",
    whereFromError: "Bitte gib deine Abfahrtsstadt ein.",
    matchDate: "Spieltag",
    matchDateError: "Bitte w\u00e4hle ein Datum.",
    matchTime: "Ansto\u00dfzeit",
    matchTimeError: "Bitte gib eine Uhrzeit ein.",
    groupBudget: "Gruppe & Budget",
    groupSize: "Gruppengr\u00f6\u00dfe",
    groupSizeHint: "Anzahl der reisenden Fans",
    budgetPerPerson: "Budget pro Person",
    options: "Optionen",
    howTravel: "Wie m\u00f6chtest du reisen?",
    selectAll: "(alle zutreffenden ausw\u00e4hlen)",
    transportError: "Bitte w\u00e4hle mindestens ein Transportmittel.",
    train: "Zug",
    coach: "Bus",
    car: "Auto",
    taxi: "Taxi",
    fly: "Flugzeug",
    overnightStay: "\u00dcbernachtung",
    overnightHint: "Unterkunftsvorschl\u00e4ge einbeziehen",
    communityTips: "Hatters-Community-Tipps",
    communityHint: "Empfehlungen der Fans einbeziehen",
    preferences: "Besondere W\u00fcnsche?",
    preferencesOptional: "(optional)",
    preferencesHint:
      "Ern\u00e4hrungsbed\u00fcrfnisse, Mobilit\u00e4tsanforderungen oder anderes \u2014 wir ber\u00fccksichtigen es",
    preferencesPlaceholder:
      "z.B. rollstuhlgerechte Routen, Pubs in der N\u00e4he von Kenilworth Road, halales Essen\u2026",
    planningTrip: "Deine Reise wird geplant\u2026",
    planButton: "Meinen Spieltag planen \uD83D\uDFE0",
    agentPlanningTrip: "plant deine Reise\u2026",
    agentWorking:
      "6 Agenten aktiv \u00b7 \u00fcblicherweise 15\u201330 Sekunden",
    agentTimeout:
      "Die Agenten brauchen l\u00e4nger als \u00fcblich \u2014 bitte versuche es erneut.",
    followUpLabel: "Eine Folgefrage stellen",
    followUpPlaceholder: "Frage etwas zu deinem Spieltag\u2026",
    sendMessage: "Nachricht senden",
    youAreTyping: "Du tippst\u2026",
    SavedDrafts: "Gespeicherte Entwürfe",
    ConfirmDeleteDraft: "Diesen Entwurf löschen?",
    EnterNewTitle: "Neuen Titel eingeben:",
    RestoreDraft: "Wiederherstellen",
    Rename: "Umbenennen",
    Delete: "Löschen",
    SelectDraftToRestore:
      "Klicke auf einen Entwurf zum Wiederherstellen oder bewege die Maus für Optionen",
    accessibilityNeedsPlaceholder:
      "z.B. Rollstuhlzugang, Aufzug erforderlich, Begleiterunterstützung…",
  },

  it: {
    appName: "Hatters Away",
    appSubtitle: "Pianificatore di Viaggi LTFC",
    skipToContent: "Vai al contenuto principale",
    switchToLight: "Passa alla modalit\u00e0 chiara",
    switchToDark: "Passa alla modalit\u00e0 scura",
    selectLanguage: "Seleziona la lingua",
    connected: "Connesso",
    connecting: "Connessione\u2026",
    offline: "Offline",
    connectingAgents: "Connessione agli agenti di pianificazione\u2026",
    connectionSetupNeeded: "Configurazione connessione necessaria",
    retryConnection: "Riprova connessione",
    envKeysExpected: "Chiavi .env attese:",
    planYourItinerary: "Pianifica il Tuo Itinerario",
    formSubtitle: "Dicci del tuo viaggio e gli agenti penseranno al resto",
    tripDetails: "Dettagli del viaggio",
    whereFrom: "Da dove viaggi?",
    whereFromPlaceholder: "es. Manchester, Birmingham, Leeds",
    whereFromError: "Inserisci la tua citt\u00e0 di partenza.",
    matchDate: "Data della partita",
    matchDateError: "Seleziona una data.",
    matchTime: "Orario della partita",
    matchTimeError: "Inserisci un orario.",
    groupBudget: "Gruppo e budget",
    groupSize: "Dimensione del gruppo",
    groupSizeHint: "Numero di tifosi in viaggio",
    budgetPerPerson: "Budget per persona",
    options: "Opzioni",
    howTravel: "Come preferisci viaggiare?",
    selectAll: "(seleziona tutto ci\u00f2 che si applica)",
    transportError: "Seleziona almeno un mezzo di trasporto.",
    train: "Treno",
    coach: "Pullman",
    car: "Auto",
    taxi: "Taxi",
    fly: "Aereo",
    overnightStay: "Pernottamento",
    overnightHint: "Includi suggerimenti per l\u2019alloggio",
    communityTips: "Consigli della community Hatters",
    communityHint: "Includi consigli dai tifosi",
    preferences: "Hai preferenze?",
    preferencesOptional: "(opzionale)",
    preferencesHint:
      "Esigenze alimentari, requisiti di mobilit\u00e0 o altro \u2014 ne terremo conto",
    preferencesPlaceholder:
      "es. percorsi accessibili, pub vicino a Kenilworth Road, cibo halal\u2026",
    planningTrip: "Pianificazione del viaggio in corso\u2026",
    planButton: "Pianifica la mia giornata \uD83D\uDFE0",
    agentPlanningTrip: "pianifica il tuo viaggio\u2026",
    agentWorking: "6 agenti attivi \u00b7 di solito 15\u201330 secondi",
    agentTimeout:
      "Gli agenti stanno impiegando pi\u00f9 tempo del solito \u2014 riprova.",
    followUpLabel: "Invia un messaggio di follow-up",
    followUpPlaceholder: "Fai una domanda sulla tua giornata\u2026",
    sendMessage: "Invia messaggio",
    youAreTyping: "Stai scrivendo\u2026",
    SavedDrafts: "Bozze Salvate",
    ConfirmDeleteDraft: "Eliminare questa bozza?",
    EnterNewTitle: "Inserisci un nuovo titolo:",
    RestoreDraft: "Ripristina",
    Rename: "Rinomina",
    Delete: "Elimina",
    SelectDraftToRestore:
      "Clicca su una bozza per ripristinare o passa il mouse per le opzioni",
    accessibilityNeedsPlaceholder:
      "ad es. accesso in sedia a rotelle, ascensore richiesto, supporto accompagnatore…",
  },

  hi: {
    appName: "\u0939\u0948\u091f\u0930\u094d\u0938 \u0905\u0935\u0947",
    appSubtitle:
      "LTFC \u092f\u093e\u0924\u094d\u0930\u093e \u092f\u094b\u091c\u0928\u093e\u0915\u093e\u0930\u0940",
    skipToContent:
      "\u092e\u0941\u0916\u094d\u092f \u0938\u093e\u092e\u0917\u094d\u0930\u0940 \u092a\u0930 \u091c\u093e\u090f\u0902",
    switchToLight:
      "\u0932\u093e\u0907\u091f \u092e\u094b\u0921 \u092a\u0930 \u091c\u093e\u090f\u0902",
    switchToDark:
      "\u0921\u093e\u0930\u094d\u0915 \u092e\u094b\u0921 \u092a\u0930 \u091c\u093e\u090f\u0902",
    selectLanguage: "\u092d\u093e\u0937\u093e \u091a\u0941\u0928\u0947\u0902",
    connected: "\u091c\u0941\u0921\u093c\u093e \u0939\u0941\u0906",
    connecting:
      "\u091c\u094b\u0921\u093c\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948\u2026",
    offline: "\u0911\u092b\u093c\u0932\u093e\u0907\u0928",
    connectingAgents:
      "\u092f\u094b\u091c\u0928\u093e \u090f\u091c\u0947\u0902\u091f\u094b\u0902 \u0938\u0947 \u091c\u0941\u0921\u093c\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948\u2026",
    connectionSetupNeeded:
      "\u0915\u0928\u0947\u0915\u094d\u0936\u0928 \u0938\u0947\u091f\u0905\u092a \u0906\u0935\u0936\u094d\u092f\u0915",
    retryConnection:
      "\u092a\u0941\u0928\u0903 \u0915\u0928\u0947\u0915\u094d\u091f \u0915\u0930\u0947\u0902",
    envKeysExpected:
      "\u0905\u092a\u0947\u0915\u094d\u0937\u093f\u0924 .env \u0915\u0940:",
    planYourItinerary:
      "\u0905\u092a\u0928\u0940 \u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0940 \u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902",
    formSubtitle:
      "\u0939\u092e\u0947\u0902 \u0905\u092a\u0928\u0940 \u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u092c\u0924\u093e\u090f\u0902 \u0914\u0930 \u090f\u091c\u0947\u0902\u091f \u092c\u093e\u0915\u0940 \u0938\u092c \u0938\u0902\u092d\u093e\u0932 \u0932\u0947\u0902\u0917\u0947",
    tripDetails:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u0935\u093f\u0935\u0930\u0923",
    whereFrom:
      "\u0906\u092a \u0915\u0939\u093e\u0901 \u0938\u0947 \u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902?",
    whereFromPlaceholder:
      "\u091c\u0948\u0938\u0947: \u092e\u0948\u0928\u091a\u0947\u0938\u094d\u091f\u0930, \u092c\u0930\u094d\u092e\u093f\u0902\u0918\u092e, \u0932\u0940\u0921\u094d\u0938",
    whereFromError:
      "\u0915\u0943\u092a\u092f\u093e \u0905\u092a\u0928\u093e \u092a\u094d\u0930\u0938\u094d\u0925\u093e\u0928 \u0936\u0939\u0930 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964",
    matchDate: "\u092e\u0948\u091a \u0915\u0940 \u0924\u093e\u0930\u0940\u0916",
    matchDateError:
      "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0924\u093e\u0930\u0940\u0916 \u091a\u0941\u0928\u0947\u0902\u0964",
    matchTime: "\u092e\u0948\u091a \u0915\u093e \u0938\u092e\u092f",
    matchTimeError:
      "\u0915\u0943\u092a\u092f\u093e \u0938\u092e\u092f \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964",
    groupBudget: "\u0938\u092e\u0942\u0939 \u0914\u0930 \u092c\u091c\u091f",
    groupSize: "\u0938\u092e\u0942\u0939 \u0915\u093e \u0906\u0915\u093e\u0930",
    groupSizeHint:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u0947 \u092a\u094d\u0930\u0936\u0902\u0938\u0915\u094b\u0902 \u0915\u0940 \u0938\u0902\u0916\u094d\u092f\u093e",
    budgetPerPerson:
      "\u092a\u094d\u0930\u0924\u093f \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u092c\u091c\u091f",
    options: "\u0935\u093f\u0915\u0932\u094d\u092a",
    howTravel:
      "\u0906\u092a \u0915\u0948\u0938\u0947 \u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0930\u0928\u093e \u091a\u093e\u0939\u0924\u0947 \u0939\u0948\u0902?",
    selectAll:
      "(\u0938\u092d\u0940 \u0932\u093e\u0917\u0942 \u0935\u093f\u0915\u0932\u094d\u092a \u091a\u0941\u0928\u0947\u0902)",
    transportError:
      "\u0915\u0943\u092a\u092f\u093e \u0915\u092e \u0938\u0947 \u0915\u092e \u090f\u0915 \u092a\u0930\u093f\u0935\u0939\u0928 \u092e\u093e\u0927\u094d\u092f\u092e \u091a\u0941\u0928\u0947\u0902\u0964",
    train: "\u091f\u094d\u0930\u0947\u0928",
    coach: "\u0915\u094b\u091a",
    car: "\u0915\u093e\u0930",
    taxi: "\u091f\u0948\u0915\u094d\u0938\u0940",
    fly: "\u0909\u0921\u093c\u093e\u0928",
    overnightStay:
      "\u0930\u093e\u0924 \u092d\u0930 \u0930\u0941\u0915\u0928\u093e",
    overnightHint:
      "\u0906\u0935\u093e\u0938 \u0938\u0941\u091d\u093e\u0935 \u0936\u093e\u092e\u093f\u0932 \u0915\u0930\u0947\u0902",
    communityTips:
      "\u0939\u0948\u091f\u0930\u094d\u0938 \u0938\u092e\u0941\u0926\u093e\u092f \u0915\u0947 \u0938\u0941\u091d\u093e\u0935",
    communityHint:
      "\u092a\u094d\u0930\u0936\u0902\u0938\u0915\u094b\u0902 \u0915\u0940 \u0938\u093f\u092b\u093c\u093e\u0930\u093f\u0936\u0947\u0902 \u0936\u093e\u092e\u093f\u0932 \u0915\u0930\u0947\u0902",
    preferences:
      "\u0915\u094b\u0908 \u092a\u094d\u0930\u093e\u0925\u092e\u093f\u0915\u0924\u093e?",
    preferencesOptional: "(\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)",
    preferencesHint:
      "\u0906\u0939\u093e\u0930 \u0938\u0902\u092c\u0902\u0927\u0940 \u091c\u0930\u0942\u0930\u0924\u0947\u0902, \u0917\u0924\u093f\u0936\u0940\u0932\u0924\u093e \u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e\u090f\u0902 \u092f\u093e \u0905\u0928\u094d\u092f \u0915\u0941\u091b \u2014 \u0939\u092e \u0935\u093f\u091a\u093e\u0930 \u0915\u0930\u0947\u0902\u0917\u0947",
    preferencesPlaceholder:
      "\u091c\u0948\u0938\u0947: \u0935\u094d\u0939\u0940\u0932\u091a\u0947\u092f\u0930 \u0938\u0941\u0932\u092d \u092e\u093e\u0930\u094d\u0917, \u0939\u0932\u093e\u0932 \u092d\u094b\u091c\u0928\u2026",
    planningTrip:
      "\u0906\u092a\u0915\u0940 \u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0940 \u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u0908 \u091c\u093e \u0930\u0939\u0940 \u0939\u0948\u2026",
    planButton:
      "\u092e\u0947\u0930\u093e \u092e\u0948\u091a \u0921\u0947 \u092a\u094d\u0932\u093e\u0928 \u0915\u0930\u0947\u0902 \uD83D\uDFE0",
    agentPlanningTrip:
      "\u0906\u092a\u0915\u0940 \u092f\u093e\u0924\u094d\u0930\u093e \u092f\u094b\u091c\u0928\u093e \u0915\u0930 \u0930\u0939\u093e \u0939\u0948\u2026",
    agentWorking:
      "6 \u090f\u091c\u0947\u0902\u091f \u0915\u093e\u092e \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902 \u00b7 \u0906\u092e\u0924\u094c\u0930 \u092a\u0930 15\u201330 \u0938\u0947\u0915\u0902\u0921",
    agentTimeout:
      "\u090f\u091c\u0947\u0902\u091f \u0938\u093e\u092e\u093e\u0928\u094d\u092f \u0938\u0947 \u0905\u0927\u093f\u0915 \u0938\u092e\u092f \u0932\u0947 \u0930\u0939\u093e \u0939\u0948 \u2014 \u092a\u0941\u0928\u0903 \u092a\u094d\u0930\u092f\u093e\u0938 \u0915\u0930\u0947\u0902\u0964",
    followUpLabel:
      "\u092b\u093c\u0949\u0932\u094b-\u0905\u092a \u0938\u0902\u0926\u0947\u0936 \u092d\u0947\u091c\u0947\u0902",
    followUpPlaceholder:
      "\u0905\u092a\u0928\u0947 \u092e\u0948\u091a \u0921\u0947 \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u092a\u0942\u091b\u0947\u0902\u2026",
    sendMessage:
      "\u0938\u0902\u0926\u0947\u0936 \u092d\u0947\u091c\u0947\u0902",
    youAreTyping:
      "\u0906\u092a \u091f\u093e\u0907\u092a \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902\u2026",
    SavedDrafts:
      "\u0938\u0939\u0947\u091c\u0947 \u0917\u090f \u0921\u094d\u0930\u093e\u092b\u094d\u091f",
    ConfirmDeleteDraft:
      "\u0907\u0938 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0915\u094b \u0939\u091f\u093e\u090f\u0902?",
    EnterNewTitle:
      "\u0928\u092f\u093e \u0936\u0940\u0930\u094d\u0937\u0915 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902:",
    RestoreDraft:
      "\u092a\u0941\u0928\u0930\u094d\u0938\u094d\u0925\u093e\u092a\u093f\u0924 \u0915\u0930\u0947\u0902",
    Rename: "\u0928\u093e\u092e \u092c\u0926\u0932\u0947\u0902",
    Delete: "\u0939\u091f\u093e\u090f\u0902",
    SelectDraftToRestore:
      "\u092a\u0941\u0928\u0930\u094d\u0938\u094d\u0925\u093e\u092a\u093f\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u092a\u0930 \u0915\u094d\u0932\u093f\u0915 \u0915\u0930\u0947\u0902 \u092f\u093e \u0935\u093f\u0915\u0932\u094d\u092a\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u0939\u094b\u0935\u0930 \u0915\u0930\u0947\u0902",
  },

  zh: {
    appName: "\u54c8\u7279\u65af\u5ba2\u573a\u4e4b\u65c5",
    appSubtitle: "LTFC \u884c\u7a0b\u89c4\u5212",
    skipToContent: "\u8df3\u81f3\u4e3b\u8981\u5185\u5bb9",
    switchToLight: "\u5207\u6362\u81f3\u6d45\u8272\u6a21\u5f0f",
    switchToDark: "\u5207\u6362\u81f3\u6df1\u8272\u6a21\u5f0f",
    selectLanguage: "\u9009\u62e9\u8bed\u8a00",
    connected: "\u5df2\u8fde\u63a5",
    connecting: "\u8fde\u63a5\u4e2d\u2026",
    offline: "\u79bb\u7ebf",
    connectingAgents: "\u6b63\u5728\u8fde\u63a5\u89c4\u5212\u52a9\u624b\u2026",
    connectionSetupNeeded: "\u9700\u8981\u914d\u7f6e\u8fde\u63a5",
    retryConnection: "\u91cd\u8bd5\u8fde\u63a5",
    envKeysExpected: "\u9884\u671f\u7684 .env \u5bc6\u9470\uff1a",
    planYourItinerary: "\u89c4\u5212\u60a8\u7684\u884c\u7a0b",
    formSubtitle:
      "\u544a\u8bc9\u6211\u4eec\u60a8\u7684\u65c5\u884c\u8be6\u60c5\uff0c\u52a9\u624b\u5c06\u4e3a\u60a8\u5b89\u6392\u4e00\u5207",
    tripDetails: "\u65c5\u884c\u8be6\u60c5",
    whereFrom: "\u60a8\u4ece\u54ea\u91cc\u51fa\u53d1\uff1f",
    whereFromPlaceholder:
      "\u4f8b\u5982\uff1a\u66fc\u5f7b\u65af\u7279\u3001\u4f2f\u660e\u7ff0\u3001\u5229\u5179",
    whereFromError: "\u8bf7\u8f93\u5165\u51fa\u53d1\u57ce\u5e02\u3002",
    matchDate: "\u6bd4\u8d5b\u65e5\u671f",
    matchDateError: "\u8bf7\u9009\u62e9\u6bd4\u8d5b\u65e5\u671f\u3002",
    matchTime: "\u6bd4\u8d5b\u65f6\u95f4",
    matchTimeError: "\u8bf7\u8f93\u5165\u6bd4\u8d5b\u65f6\u95f4\u3002",
    groupBudget: "\u56e2\u961f\u4e0e\u9884\u7b97",
    groupSize: "\u56e2\u961f\u4eba\u6570",
    groupSizeHint: "\u51fa\u884c\u7403\u8ff7\u4eba\u6570",
    budgetPerPerson: "\u6bcf\u4eba\u9884\u7b97",
    options: "\u9009\u9879",
    howTravel: "\u60a8\u5e0c\u671b\u5982\u4f55\u51fa\u884c\uff1f",
    selectAll: "(\u9009\u62e9\u6240\u6709\u9002\u7528\u9879)",
    transportError:
      "\u8bf7\u81f3\u5c11\u9009\u62e9\u4e00\u79cd\u51fa\u884c\u65b9\u5f0f\u3002",
    train: "\u706b\u8f66",
    coach: "\u5927\u5df4",
    car: "\u81ea\u9a7e",
    taxi: "\u51fa\u79df\u8f66",
    fly: "\u98de\u673a",
    overnightStay: "\u8fc7\u591c\u4f4f\u5bbf",
    overnightHint: "\u5305\u542b\u4f4f\u5bbf\u5efa\u8bae",
    communityTips: "\u54c8\u7279\u65af\u7403\u8ff7\u793e\u533a\u5efa\u8bae",
    communityHint: "\u5305\u542b\u7403\u8ff7\u63a8\u8350",
    preferences: "\u6709\u4efb\u4f55\u504f\u597d\uff1f",
    preferencesOptional: "(\u53ef\u9009)",
    preferencesHint:
      "\u996e\u98df\u9700\u6c42\u3001\u884c\u52a8\u4fbf\u5229\u9700\u6c42\u6216\u5176\u4ed6\u2014\u2014\u6211\u4eec\u5c06\u7edf\u7edf\u8003\u8651",
    preferencesPlaceholder:
      "\u4f8b\u5982\uff1a\u65e0\u969c\u788d\u8def\u7ebf\u3001\u6e05\u771f\u98df\u54c1\u3001\u9002\u5408\u5bb6\u5ead\u573a\u6240\u2026",
    planningTrip: "\u6b63\u5728\u89c4\u5212\u60a8\u7684\u884c\u7a0b\u2026",
    planButton: "\u89c4\u5212\u6211\u7684\u6bd4\u8d5b\u65e5 \uD83D\uDFE0",
    agentPlanningTrip: "\u6b63\u5728\u89c4\u5212\u60a8\u7684\u884c\u7a0b\u2026",
    agentWorking:
      "6 \u4e2a\u52a9\u624b\u5de5\u4f5c\u4e2d \u00b7 \u901a\u5e38\u9700 15\u201330 \u79d2",
    agentTimeout:
      "\u52a9\u624b\u54cd\u5e94\u65f6\u95f4\u8f83\u957f\uff0c\u53ef\u80fd\u4ecd\u5728\u5904\u7406\u2014\u2014\u6216\u8005\u8bf7\u91cd\u65b0\u53d1\u9001\u6d88\u606f\u3002",
    followUpLabel: "\u53d1\u9001\u540e\u7eed\u95ee\u9898",
    followUpPlaceholder:
      "\u5c31\u60a8\u7684\u6bd4\u8d5b\u65e5\u63d0\u95ee\u2026",
    sendMessage: "\u53d1\u9001\u6d88\u606f",
    youAreTyping: "\u60a8\u6b63\u5728\u8f93\u5165\u2026",
    SavedDrafts: "\u5df2\u4fdd\u5b58\u8349\u7a3f",
    ConfirmDeleteDraft: "\u5220\u9664\u6b64\u8349\u7a3f\uff1f",
    EnterNewTitle: "\u8f93\u5165\u65b0\u6807\u9898\uff1a",
    RestoreDraft: "\u6062\u590d",
    Rename: "\u91cd\u547d\u540d",
    Delete: "\u5220\u9664",
    SelectDraftToRestore:
      "\u70b9\u51fb\u8349\u7a3f\u4ee5\u6062\u590d\u6216\u60ac\u505c\u67e5\u770b\u9009\u9879",
  },
};

/** Reactive translation helper — reads preferredLanguage signal */
export function t(key: keyof Translations): string {
  const lang = preferredLanguage.value as LangCode;
  return (translations[lang]?.[key] ?? translations.en[key] ?? key) as string;
}
