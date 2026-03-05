// Level 2: "Das Urteil des Baumes"
// Lernziel: Objekte mit einem vorgegebenen Entscheidungsbaum klassifizieren (Anwendung)

import type { DialogLine } from './level1Data'

export type { DialogLine }

export type Suspect2 = {
  id: string
  name: string
  hat: boolean
  coat: boolean
  beard: boolean
  briefcase: boolean
  category: 'verdächtig' | 'unverdächtig'
  emoji: string
  description: string
}

export type TreeNode2 = {
  id: string
  question?: string
  attribute?: 'hat' | 'coat' | 'beard' | 'briefcase'
  yes?: string
  no?: string
  result?: 'verdächtig' | 'unverdächtig'
}

export type QuizQuestion2 = {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

export type Difficulty2 = 'basis' | 'standard' | 'experten'

// ─── Konstanten ────────────────────────────────────────────────────────────────
export const WORLD_WIDTH = 900
export const WORLD_HEIGHT = 500

// ─── Intro-Dialoge ─────────────────────────────────────────────────────────────

export const introDialogues2: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Willkommen zurück, {NAME}! In Level 2 wirst du zeigen, was du gelernt hast.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Diesmal: 5 neue Verdächtige und ein fertiger Entscheidungsbaum.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Deine Aufgabe: Klassifiziere jeden Verdächtigen mit dem Baum!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Und pass auf — Verdächtiger Viktor ist auch dabei. Er sagt, er ist unschuldig... Aber stimmt das?',
    portrait: 'node',
  },
  {
    speaker: 'Viktor',
    text: 'Ich schwöre! Ich bin unverdächtig! Bitte klassifiziere mich fair!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Lass den Baum entscheiden, nicht die Meinung. Das ist das Prinzip der KI-Klassifikation!',
    portrait: 'node',
  },
]

// ─── Teaching-Dialoge ──────────────────────────────────────────────────────────

export const teachingDialogues2: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Schau her — unser Entscheidungsbaum hat 4 Ebenen. Jede Ebene prüft ein Merkmal.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Heute lernst du: Wie wendet man einen fertigen Baum auf neue Fälle an?',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Neue Merkmale: Hut, Mantel, Bart — und neu: Aktenkoffer ja/nein.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Du startest an der Wurzel, beantwortest jede Frage und folgst dem Ja- oder Nein-Pfeil.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Am Blatt steht das Ergebnis: verdächtig oder unverdächtig. Kein Ermessen — nur Logik!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Jetzt du! Klicke auf "Starte Klassifikation" und arbeite dich durch den Baum. Viel Erfolg, {NAME}!',
    portrait: 'node',
  },
]

// ─── Verdächtige ───────────────────────────────────────────────────────────────

export const suspects2: Suspect2[] = [
  {
    id: 'viktor',
    name: 'Viktor V.',
    hat: true,
    coat: true,
    beard: false,
    briefcase: true,
    category: 'verdächtig',
    emoji: '🕵️',
    description: 'Trägt immer einen Hut. Sehr höflich. Behauptet, unschuldig zu sein.',
  },
  {
    id: 'rosa',
    name: 'Rosa R.',
    hat: false,
    coat: true,
    beard: false,
    briefcase: false,
    category: 'unverdächtig',
    emoji: '👩‍💼',
    description: 'Arbeiterin aus der Buchhandlung. Trägt keinen Hut.',
  },
  {
    id: 'otto',
    name: 'Otto O.',
    hat: true,
    coat: false,
    beard: true,
    briefcase: false,
    category: 'verdächtig',
    emoji: '🧔',
    description: 'Alter Bekannter der Polizei. Hat einen Bart und einen Hut.',
  },
  {
    id: 'lisa',
    name: 'Lisa L.',
    hat: false,
    coat: false,
    beard: false,
    briefcase: true,
    category: 'unverdächtig',
    emoji: '👩',
    description: 'Studentin. Trägt nur ihre Aktentasche, sonst nichts Auffälliges.',
  },
  {
    id: 'max',
    name: 'Max M.',
    hat: true,
    coat: true,
    beard: true,
    briefcase: true,
    category: 'verdächtig',
    emoji: '🕵️‍♂️',
    description: 'Trägt alles: Hut, Mantel, Bart, Aktenkoffer. Sehr auffällig.',
  },
  {
    id: 'erna',
    name: 'Erna E.',
    hat: false,
    coat: true,
    beard: false,
    briefcase: true,
    category: 'unverdächtig',
    emoji: '👩‍🦳',
    description: 'Rentnerin. Trägt einen Mantel und eine Tasche für ihren Einkauf.',
  },
  {
    id: 'bert',
    name: 'Bert B.',
    hat: true,
    coat: false,
    beard: false,
    briefcase: true,
    category: 'verdächtig',
    emoji: '🤵',
    description: 'Geschäftsmann. Hut ja, Mantel nein, Bart nein, Aktenkoffer ja.',
  },
]

// ─── Entscheidungsbäume ────────────────────────────────────────────────────────

// Basis: 2 Merkmale (Hut, Mantel), 3 Verdächtige
export const treeBasis2: TreeNode2[] = [
  { id: 'root', question: 'Trägt die Person einen Hut?', attribute: 'hat', yes: 'n1', no: 'leaf_u1' },
  { id: 'n1', question: 'Trägt die Person einen Mantel?', attribute: 'coat', yes: 'leaf_v1', no: 'leaf_v2' },
  { id: 'leaf_u1', result: 'unverdächtig' },
  { id: 'leaf_v1', result: 'verdächtig' },
  { id: 'leaf_v2', result: 'verdächtig' },
]

export const suspectsBasis2 = ['viktor', 'rosa', 'otto']

// Standard: 3 Merkmale (Hut, Mantel, Bart), 5 Verdächtige
// Hut=Ja, Mantel=Ja → verdächtig
// Hut=Ja, Mantel=Nein, Bart=Ja → verdächtig (Otto)
// Hut=Ja, Mantel=Nein, Bart=Nein → unverdächtig (kein weiteres Warnsignal)
// Hut=Nein → unverdächtig (Rosa, Lisa)
export const treeStandard2: TreeNode2[] = [
  { id: 'root', question: 'Trägt die Person einen Hut?', attribute: 'hat', yes: 'n1', no: 'leaf_u1' },
  { id: 'n1', question: 'Trägt die Person einen Mantel?', attribute: 'coat', yes: 'leaf_v1', no: 'n2' },
  { id: 'leaf_u1', result: 'unverdächtig' },
  { id: 'leaf_v1', result: 'verdächtig' },
  { id: 'n2', question: 'Hat die Person einen Bart?', attribute: 'beard', yes: 'leaf_v2', no: 'leaf_u2' },
  { id: 'leaf_v2', result: 'verdächtig' },
  { id: 'leaf_u2', result: 'unverdächtig' },
]

export const suspectsStandard2 = ['viktor', 'rosa', 'otto', 'lisa', 'max']

// Experten: 4 Merkmale (Hut, Mantel, Bart, Aktenkoffer), 7 Verdächtige + Zeitlimit
export const treeExperten2: TreeNode2[] = [
  { id: 'root', question: 'Trägt die Person einen Hut?', attribute: 'hat', yes: 'n1', no: 'n2' },
  { id: 'n1', question: 'Trägt die Person einen Mantel?', attribute: 'coat', yes: 'leaf_v1', no: 'n3' },
  { id: 'n2', question: 'Trägt die Person einen Mantel?', attribute: 'coat', yes: 'leaf_u1', no: 'leaf_u2' },
  { id: 'leaf_v1', result: 'verdächtig' },
  { id: 'n3', question: 'Hat die Person einen Bart?', attribute: 'beard', yes: 'leaf_v2', no: 'n4' },
  { id: 'leaf_u1', result: 'unverdächtig' },
  { id: 'leaf_u2', result: 'unverdächtig' },
  { id: 'leaf_v2', result: 'verdächtig' },
  { id: 'n4', question: 'Trägt die Person einen Aktenkoffer?', attribute: 'briefcase', yes: 'leaf_v3', no: 'leaf_u3' },
  { id: 'leaf_v3', result: 'verdächtig' },
  { id: 'leaf_u3', result: 'unverdächtig' },
]

export const suspectsExperten2 = ['viktor', 'rosa', 'otto', 'lisa', 'max', 'erna', 'bert']

export const EXPERTEN_TIME_LIMIT = 120 // Sekunden

// ─── Quiz-Fragen ───────────────────────────────────────────────────────────────

export const quizQuestions2: QuizQuestion2[] = [
  {
    id: 'q1',
    question: 'Was ist der Unterschied zwischen Klassifikation und Regression?',
    options: [
      'Klassifikation ordnet Kategorien zu (z.B. verdächtig/nicht), Regression sagt Zahlen vorher (z.B. Preis)',
      'Klassifikation ist schneller als Regression',
      'Regression ordnet Kategorien zu, Klassifikation sagt Zahlen vorher',
      'Es gibt keinen Unterschied — beide machen dasselbe',
    ],
    correct: 0,
    explanation:
      'Klassifikation = Zuordnung zu Klassen (verdächtig/unverdächtig). Regression = Vorhersage eines Zahlenwertes (z.B. 42,50 Euro). Zwei verschiedene Typen von KI-Aufgaben!',
  },
  {
    id: 'q2',
    question: 'Welche Merkmale sind gut für Entscheidungsbäume geeignet?',
    options: [
      'Nur Merkmale mit vielen verschiedenen Werten (z.B. Name, Adresse)',
      'Merkmale mit wenigen, klaren Werten — am besten Ja/Nein-Eigenschaften',
      'Nur Merkmale, die eine Person beschreiben',
      'Merkmale, die immer gleich sind (z.B. alle tragen Schuhe)',
    ],
    correct: 1,
    explanation:
      'Entscheidungsbäume funktionieren am besten mit klaren, wenigen Ausprägungen — vor allem Ja/Nein. Merkmale wie "Name" haben zu viele Werte und helfen nicht beim Klassifizieren.',
  },
  {
    id: 'q3',
    question: 'Was passiert, wenn ein Merkmal fehlt (null/unbekannt)?',
    options: [
      'Der Baum gibt automatisch "verdächtig" aus',
      'Der Baum gibt einen Fehler aus und stoppt',
      'Das Merkmal wird als "Nein/Falsch" behandelt — oder es wird ein Standardweg gewählt',
      'Das Merkmal wird ignoriert und der Baum läuft schneller',
    ],
    correct: 2,
    explanation:
      'Fehlende Werte sind ein echtes Problem in der KI! Meistens wird ein Standardwert angenommen (z.B. Nein) oder der häufigste Wert aus den Trainingsdaten eingesetzt. Gute Systeme kennzeichnen diese Unsicherheit.',
  },
  {
    id: 'q4',
    question: 'Wie viele Klassen kann ein Entscheidungsbaum haben?',
    options: [
      'Genau 2 — immer nur Ja oder Nein',
      'Genau 2 oder 3 — nicht mehr',
      'Beliebig viele — z.B. auch 5 oder 10 Klassen',
      'Keine — Entscheidungsbäume geben immer Zahlen aus',
    ],
    correct: 2,
    explanation:
      'Entscheidungsbäume können beliebig viele Klassen haben! Unser Beispiel hat 2 (verdächtig/unverdächtig), aber echte Systeme klassifizieren z.B. Bildinhalte in hunderte Kategorien.',
  },
  {
    id: 'q5',
    question: 'Warum darf man denselben Datensatz nicht zum Trainieren UND Testen nutzen?',
    options: [
      'Das ist erlaubt — mehr Daten sind immer besser',
      'Weil der Baum dann die Antworten "auswendig kennt" und man nicht weiß, ob er wirklich gelernt hat',
      'Weil Testdaten immer größer sein müssen als Trainingsdaten',
      'Weil das zu langsam wäre',
    ],
    correct: 1,
    explanation:
      'Wenn man mit denselben Daten trainiert und testet, prüft man nichts Neues. Der Baum kennt die Antworten schon — wie eine Prüfung mit denselben Aufgaben wie im Unterricht. Echte Tests brauchen neue Daten!',
  },
]

// ─── Interaktionszonen ────────────────────────────────────────────────────────

export type InteractionZone2 = {
  id: 'viktor' | 'inspector' | 'caseboard'
  x: number
  y: number
  label: string
  icon: string
}

export const interactionZones2: InteractionZone2[] = [
  { id: 'viktor', x: 200, y: 280, label: 'Viktor befragen', icon: '🕵️' },
  { id: 'inspector', x: 680, y: 200, label: 'Inspector Node', icon: '🧠' },
  { id: 'caseboard', x: 680, y: 360, label: 'Klassifikation starten', icon: '🔍' },
]
