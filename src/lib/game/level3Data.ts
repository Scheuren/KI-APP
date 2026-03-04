// Level 3: "Baue deinen eigenen Baum"
// Lernziel: Grundprinzip des Lernalgorithmus verstehen; Trainingsdaten nutzen; Datensplits

import type { DialogLine } from './level1Data'

export type { DialogLine }

export type LabeledSuspect = {
  id: string
  name: string
  hat: boolean
  coat: boolean
  beard: boolean
  briefcase: boolean
  label: 'verdächtig' | 'unverdächtig'
  emoji: string
}

export type BuilderNode = {
  id: string
  attribute: 'hat' | 'coat' | 'beard' | 'briefcase' | null // null = leaf
  result?: 'verdächtig' | 'unverdächtig'
  yesChild?: string
  noChild?: string
}

export type QuizQuestion3 = {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

export const WORLD_WIDTH = 900
export const WORLD_HEIGHT = 500

// ─── 10 Beispiel-Verdächtige mit Labels ──────────────────────────────────────

export const allSuspects3: LabeledSuspect[] = [
  // Training (8) + Test (2)
  { id: 's1',  name: 'Albert A.', hat: true,  coat: true,  beard: true,  briefcase: false, label: 'verdächtig',   emoji: '🕵️' },
  { id: 's2',  name: 'Bertha B.', hat: false, coat: true,  beard: false, briefcase: false, label: 'unverdächtig', emoji: '👩‍💼' },
  { id: 's3',  name: 'Carl C.',   hat: true,  coat: false, beard: true,  briefcase: true,  label: 'verdächtig',   emoji: '🧔' },
  { id: 's4',  name: 'Doris D.',  hat: false, coat: false, beard: false, briefcase: true,  label: 'unverdächtig', emoji: '👩' },
  { id: 's5',  name: 'Emil E.',   hat: true,  coat: true,  beard: false, briefcase: true,  label: 'verdächtig',   emoji: '🤵' },
  { id: 's6',  name: 'Frieda F.', hat: false, coat: true,  beard: false, briefcase: true,  label: 'unverdächtig', emoji: '👩‍🦳' },
  { id: 's7',  name: 'Gustav G.', hat: true,  coat: false, beard: false, briefcase: false, label: 'verdächtig',   emoji: '👨' },
  { id: 's8',  name: 'Herta H.',  hat: false, coat: false, beard: false, briefcase: false, label: 'unverdächtig', emoji: '👧' },
  // Test data (indices 8 & 9)
  { id: 's9',  name: 'Ivan I.',   hat: true,  coat: true,  beard: true,  briefcase: true,  label: 'verdächtig',   emoji: '🕵️‍♂️' },
  { id: 's10', name: 'Julia J.',  hat: false, coat: true,  beard: false, briefcase: false, label: 'unverdächtig', emoji: '👩‍🎨' },
]

export const trainingSuspects = allSuspects3.slice(0, 8)
export const testSuspects = allSuspects3.slice(8)

// ─── Dialoge ──────────────────────────────────────────────────────────────────

export const introDialogues3: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Willkommen in Level 3, {NAME}! Bisher haben wir fertige Bäume benutzt. Heute baust du selbst einen!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Du hast 10 Beispiel-Verdächtige mit bekannten Ergebnissen. Das nennt man Trainingsdaten!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Zuerst sortierst du die Daten: 8 für Training, 2 für Tests. Dann baust du deinen eigenen Entscheidungsbaum!',
    portrait: 'node',
  },
  {
    speaker: '{NAME}',
    text: 'Ich baue meinen eigenen Baum? Das klingt nach echter KI-Arbeit!',
    portrait: 'player',
  },
  {
    speaker: 'Inspector Node',
    text: 'Genau das ist es! KI "lernt" aus Beispielen — genau wie du jetzt. Los geht\'s, {NAME}!',
    portrait: 'node',
  },
]

export const teachingDialogues3: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Beim maschinellen Lernen zeigt man dem Algorithmus viele Beispiele mit bekannten Antworten.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Diese Beispiele heißen Trainingsdaten. Der Algorithmus "lernt" daraus Regeln — also einen Baum!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Aber Vorsicht: Wir brauchen auch Testdaten, die der Baum vorher nicht gesehen hat.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Typisch ist ein 80/20 Split: 80% Training, 20% Test. Bei 10 Datensätzen: 8 Training, 2 Test.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Tipp: Wähle das Merkmal als Wurzel, das die Gruppen am besten trennt.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Schau, ob ein Merkmal alle Verdächtigen auf einer Seite und alle Unverdächtigen auf der anderen hat.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Jetzt sortierst du zuerst die Datensätze, dann baust du deinen Baum. Viel Erfolg, {NAME}!',
    portrait: 'node',
  },
]

// ─── Quiz-Fragen ───────────────────────────────────────────────────────────────

export const quizQuestions3: QuizQuestion3[] = [
  {
    id: 'q1',
    question: 'Was sind Trainingsdaten?',
    options: [
      'Daten, die zufällig aus dem Internet geladen werden',
      'Beispiele mit bekannten Antworten, aus denen das Modell lernt',
      'Daten, die nur zum Testen verwendet werden',
      'Eine Sammlung von Programmiercode',
    ],
    correct: 1,
    explanation:
      'Trainingsdaten sind Beispiele mit bereits bekannten richtigen Antworten (Labels). Der Algorithmus lernt aus diesen Beispielen Muster und Regeln.',
  },
  {
    id: 'q2',
    question: 'Warum brauchen wir Testdaten?',
    options: [
      'Um mehr Daten zum Trainieren zu haben',
      'Um zu prüfen, ob das Modell auch bei neuen, unbekannten Daten funktioniert',
      'Testdaten sind eigentlich unnötig',
      'Um die Datenbank zu füllen',
    ],
    correct: 1,
    explanation:
      'Testdaten prüfen, ob das Modell generalisiert — also auch bei neuen Daten funktioniert, die es nie gesehen hat. Ohne Testdaten weiß man nicht, ob das Modell wirklich gelernt hat oder nur auswendig gelernt hat.',
  },
  {
    id: 'q3',
    question: 'Was ist der Unterschied zwischen einem "Lernalgorithmus" und einem "klassischen Algorithmus"?',
    options: [
      'Es gibt keinen Unterschied — beide sind gleich',
      'Klassische Algorithmen sind immer schneller',
      'Ein Lernalgorithmus entwickelt seine Regeln selbst aus Daten; ein klassischer Algorithmus hat feste Regeln vom Programmierer',
      'Lernalgorithmen brauchen keine Daten',
    ],
    correct: 2,
    explanation:
      'Klassische Algorithmen haben feste, vom Programmierer geschriebene Regeln. Lernalgorithmen entdecken Muster selbst aus Beispieldaten — das ist maschinelles Lernen!',
  },
  {
    id: 'q4',
    question: 'Wie viele Trainingsdaten braucht man mindestens für einen guten Entscheidungsbaum?',
    options: [
      '1-2 Beispiele reichen immer aus',
      'Genau 10 — mehr ist schlechter',
      'Möglichst viele — mehr Daten bedeuten in der Regel bessere Ergebnisse',
      'Exakt 1000 Beispiele, nie mehr oder weniger',
    ],
    correct: 2,
    explanation:
      'Mehr Trainingsdaten helfen dem Modell, bessere und allgemeinere Regeln zu lernen. Mit nur 1-2 Beispielen kann kein zuverlässiger Baum entstehen. In der Praxis braucht man oft Tausende oder Millionen von Beispielen!',
  },
  {
    id: 'q5',
    question: 'Welches Merkmal wählt man sinnvollerweise als Wurzel des Entscheidungsbaums?',
    options: [
      'Das Merkmal, das in den Trainingsdaten am häufigsten vorkommt',
      'Das Merkmal, das die Daten am besten in verdächtig und unverdächtig trennt',
      'Immer das erste Merkmal in der Liste',
      'Das Merkmal, das am seltensten vorkommt',
    ],
    correct: 1,
    explanation:
      'Als Wurzel wählt man das Merkmal, das die Gruppen am stärksten trennt — also auf einer Seite möglichst viele Verdächtige und auf der anderen möglichst viele Unverdächtige. Das macht den Baum effizient und genau.',
  },
]

// ─── Attribute-Labels ─────────────────────────────────────────────────────────

export const ATTRIBUTE_LABELS: Record<'hat' | 'coat' | 'beard' | 'briefcase', string> = {
  hat: 'Hut?',
  coat: 'Mantel?',
  beard: 'Bart?',
  briefcase: 'Aktenkoffer?',
}

export const ATTRIBUTES = ['hat', 'coat', 'beard', 'briefcase'] as const
export type Attribute = typeof ATTRIBUTES[number]

// ─── Interaction zones ────────────────────────────────────────────────────────

export type InteractionZone3 = {
  id: 'datalab' | 'inspector' | 'builder'
  x: number
  y: number
  label: string
  icon: string
}

export const interactionZones3: InteractionZone3[] = [
  { id: 'datalab', x: 180, y: 250, label: 'Datensätze sortieren', icon: '📊' },
  { id: 'inspector', x: 670, y: 180, label: 'Inspector Node', icon: '🧠' },
  { id: 'builder', x: 670, y: 360, label: 'Baum bauen', icon: '🌳' },
]
