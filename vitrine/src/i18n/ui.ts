export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = { fr: 'FR', en: 'EN' };
export const ogLocales: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' };

const fr = {
  meta: {
    title: 'ilipro — Automatisation sur-mesure pour PME, payée à la livraison',
    description:
      "Agence d'automatisation pour PME : prospection email, routage de leads Salesforce, réponse aux devis. Vous ne payez qu'à la livraison, si ça répond au besoin.",
  },
  nav: {
    cases: 'Automatisations',
    process: 'Méthode',
    model: 'Modèle',
    cta: 'Prenons contact',
    switchLabel: 'Changer de langue',
    mainLabel: 'Navigation principale',
  },
  hero: {
    eyebrow: "Agence d'automatisation",
    titleStart: 'Vos process, automatisés.',
    titleEm: 'Payés à la livraison.',
    lead: 'Nous concevons, livrons et maintenons les automatisations qui libèrent vos équipes. Vous ne payez que si elles répondent au besoin.',
    primary: 'Discutons de votre process',
    secondary: 'Voir nos automatisations',
  },
  demo: {
    label: 'Exemple · réponse aux devis',
    status: 'En production',
    steps: [
      'Lecture de la boîte mail',
      'Détection des demandes de devis',
      'Transmission au secrétariat',
      'Envoi au client, devis en copie',
    ],
    toolsLabel: 'Branché sur vos outils',
  },
  cases: {
    eyebrow: 'Nos automatisations',
    titleStart: 'Trois cas, livrés et',
    titleEm: 'en production.',
    lead: 'Chaque automatisation est construite pour votre contexte — vos outils, vos équipes, vos règles métier.',
    items: [
      {
        tags: ['Ventes', 'Email'],
        title: 'Réponse automatique aux demandes de devis',
        text: 'Chaque demande de devis prenait du temps aux commerciaux, et le lead attendait des jours avant de recevoir son devis.',
        imageAlt: 'Réponse automatique à une demande de devis',
      },
      {
        tags: ['CRM', 'Distribution'],
        title: 'Leads routés par pays vers vos distributeurs',
        text: '3 000+ leads restaient inexploités dans Salesforce, trop lourds à répartir à la main entre 50+ distributeurs.',
        imageAlt: 'Routage des leads Salesforce vers les distributeurs',
      },
      {
        tags: ['Prospection', 'Outbound'],
        title: 'Boîtes mail en masse pour la prospection',
        text: "Pour chaque nouveau client, configurer domaine, DNS et boîtes était fastidieux, long et source d'erreurs.",
        imageAlt: 'Infrastructure de boîtes mail pour la prospection',
      },
    ],
  },
  process: {
    eyebrow: 'Méthode',
    titleStart: 'On vous conseille',
    titleEm: 'avant',
    titleEnd: 'de construire.',
    steps: [
      {
        label: 'Diagnostic',
        text: 'On chiffre ce que le process vous coûte : temps perdu, opportunités manquées, talents sous-employés.',
      },
      { label: 'Conception', text: "On définit ensemble le résultat attendu : c'est lui qui conditionne le paiement." },
      { label: 'Livraison', text: "L'automatisation tourne sur vos outils. Vous validez — ou vous ne payez pas." },
      { label: 'Suivi', text: 'Maintenance continue, livrables et factures dans votre espace client.' },
    ],
  },
  model: {
    eyebrow: 'Modèle',
    titleStart: 'Le risque est',
    titleEm: 'de notre côté.',
    items: [
      {
        value: '0 €',
        label: 'Avant validation',
        text: "Vous payez à la livraison, uniquement si l'automatisation répond au besoin convenu.",
      },
      {
        value: '1 000 €',
        unit: '/mois',
        label: 'À partir de',
        text: 'Abonnement avec engagement annuel, dimensionné selon la complexité.',
      },
      {
        value: 'Incluse',
        label: 'Maintenance',
        text: "Évolutions d'API, pannes, ajustements : on garde votre automatisation en état de marche.",
      },
    ],
  },
  difference: {
    eyebrow: 'Ce qui nous distingue',
    titleStart: 'Une agence qui',
    titleEm: "s'engage",
    titleEnd: 'sur le résultat.',
    items: [
      { title: 'Payé au résultat', text: "Pas de devis d'heures. Un résultat défini ensemble, validé par vous." },
      {
        title: 'Vos outils, pas les nôtres',
        text: 'Salesforce, SharePoint, votre messagerie : aucune nouvelle plateforme à adopter.',
      },
      { title: 'Un interlocuteur direct', text: 'Celui qui conçoit votre automatisation est celui qui vous répond.' },
      { title: 'Un espace client dédié', text: 'Livrables, factures et suivi de vos automatisations, au même endroit.' },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    titleStart: 'Questions',
    titleEm: 'fréquentes',
    items: [
      {
        q: "Et si l'automatisation ne répond pas au besoin ?",
        a: 'Vous ne payez pas. Le résultat attendu est défini ensemble avant de commencer.',
      },
      {
        q: 'Combien coûte une automatisation ?',
        a: "Rien avant la livraison. Ensuite, un abonnement à partir de 1 000 € par mois avec engagement annuel, maintenance incluse. Le montant dépend de la complexité, et on le fixe avec vous lors de l'appel de qualification.",
      },
      {
        q: 'Travaillez-vous avec des entreprises hors de France ?',
        a: 'Oui. Nous accompagnons des PME partout dans le monde, à distance.',
      },
      {
        q: 'Que comprend la maintenance ?',
        a: "Le suivi et les corrections nécessaires pour que l'automatisation continue de fonctionner. Sans surcoût.",
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    titleStart: 'Concrétisons votre',
    titleEm: 'première automatisation.',
    lead: "Décrivez le process qui vous coûte du temps. On revient vers vous pour un appel de qualification.",
    name: 'Nom',
    company: 'Entreprise',
    email: 'Email professionnel',
    message: 'Le process à automatiser',
    submit: 'Envoyer ma demande',
  },
  footer: {
    tagline: "Agence d'automatisation pour PME, en France et à l'international.",
    casesTitle: 'Automatisations',
    agencyTitle: 'Agence',
    caseLinks: ['Réponse aux devis', 'Routage de leads', 'Prospection email'],
    clientArea: 'Espace client',
  },
};

export type Dictionary = typeof fr;

const en: Dictionary = {
  meta: {
    title: 'ilipro — Custom automation for SMBs, paid on delivery',
    description:
      'Automation agency for SMBs: cold email infrastructure, Salesforce lead routing, quote request handling. You only pay on delivery, if it meets the need.',
  },
  nav: {
    cases: 'Automations',
    process: 'Method',
    model: 'Pricing model',
    cta: 'Get in touch',
    switchLabel: 'Change language',
    mainLabel: 'Main navigation',
  },
  hero: {
    eyebrow: 'Automation agency',
    titleStart: 'Your processes, automated.',
    titleEm: 'Paid on delivery.',
    lead: 'We design, deliver and maintain the automations that free up your teams. You only pay if they meet the need.',
    primary: "Let's talk about your process",
    secondary: 'See our automations',
  },
  demo: {
    label: 'Example · quote requests',
    status: 'In production',
    steps: [
      'Reads the inbox',
      'Detects quote requests',
      'Forwards to the office team',
      'Sends to the client, quote attached',
    ],
    toolsLabel: 'Plugged into your tools',
  },
  cases: {
    eyebrow: 'Our automations',
    titleStart: 'Three cases, delivered and',
    titleEm: 'in production.',
    lead: 'Every automation is built for your context — your tools, your teams, your business rules.',
    items: [
      {
        tags: ['Sales', 'Email'],
        title: 'Automatic replies to quote requests',
        text: 'Every quote request ate up sales time, and the lead waited days before getting their quote.',
        imageAlt: 'Automatic reply to a quote request',
      },
      {
        tags: ['CRM', 'Distribution'],
        title: 'Leads routed by country to your distributors',
        text: '3,000+ leads went untouched in Salesforce, too tedious to split by hand across 50+ distributors.',
        imageAlt: 'Salesforce leads routed to distributors',
      },
      {
        tags: ['Prospecting', 'Outbound'],
        title: 'Mailboxes at scale for prospecting',
        text: 'For every new client, setting up domain, DNS and mailboxes was tedious, slow and error-prone.',
        imageAlt: 'Mailbox infrastructure for prospecting',
      },
    ],
  },
  process: {
    eyebrow: 'Method',
    titleStart: 'We advise you',
    titleEm: 'before',
    titleEnd: 'we build.',
    steps: [
      {
        label: 'Assessment',
        text: 'We measure what the process costs you: lost time, missed opportunities, underused talent.',
      },
      { label: 'Design', text: 'We agree on the expected outcome together: it is what payment depends on.' },
      { label: 'Delivery', text: 'The automation runs on your tools. You sign off — or you don’t pay.' },
      { label: 'Follow-up', text: 'Ongoing maintenance, deliverables and invoices in your client area.' },
    ],
  },
  model: {
    eyebrow: 'Pricing model',
    titleStart: 'The risk is',
    titleEm: 'on our side.',
    items: [
      {
        value: '€0',
        label: 'Before sign-off',
        text: 'You pay on delivery, only if the automation meets the agreed need.',
      },
      {
        value: '€1,000',
        unit: '/month',
        label: 'Starting at',
        text: 'Subscription with an annual commitment, sized to the complexity.',
      },
      {
        value: 'Included',
        label: 'Maintenance',
        text: 'API changes, outages, adjustments: we keep your automation running.',
      },
    ],
  },
  difference: {
    eyebrow: 'What sets us apart',
    titleStart: 'An agency that',
    titleEm: 'commits',
    titleEnd: 'to results.',
    items: [
      { title: 'Paid for results', text: 'No hourly quotes. An outcome defined together, signed off by you.' },
      {
        title: 'Your tools, not ours',
        text: 'Salesforce, SharePoint, your mailbox: no new platform to adopt.',
      },
      { title: 'A direct contact', text: 'The person who builds your automation is the one who answers you.' },
      { title: 'A dedicated client area', text: 'Deliverables, invoices and automation follow-up, all in one place.' },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    titleStart: 'Frequently asked',
    titleEm: 'questions',
    items: [
      {
        q: 'What if the automation doesn’t meet the need?',
        a: 'You don’t pay. The expected outcome is agreed together before we start.',
      },
      {
        q: 'How much does an automation cost?',
        a: 'Nothing before delivery. Then a subscription starting at €1,000 per month with an annual commitment, maintenance included. The amount depends on complexity, and we set it with you during the qualification call.',
      },
      {
        q: 'Do you work with companies outside France?',
        a: 'Yes. We work with SMBs worldwide, remotely.',
      },
      {
        q: 'What does maintenance include?',
        a: 'The monitoring and fixes needed to keep the automation running. At no extra cost.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    titleStart: 'Let’s build your',
    titleEm: 'first automation.',
    lead: 'Describe the process that costs you time. We’ll get back to you for a qualification call.',
    name: 'Name',
    company: 'Company',
    email: 'Work email',
    message: 'The process to automate',
    submit: 'Send my request',
  },
  footer: {
    tagline: 'Automation agency for SMBs, in France and worldwide.',
    casesTitle: 'Automations',
    agencyTitle: 'Agency',
    caseLinks: ['Quote replies', 'Lead routing', 'Cold email'],
    clientArea: 'Client area',
  },
};

export const ui: Record<Locale, Dictionary> = { fr, en };

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: string | undefined): Dictionary {
  return ui[isLocale(locale) ? locale : defaultLocale];
}
