// Level 1: "Der Fall der verwirrten Daten"
// Lernziele: Klassifikation, Entscheidungsbaum (Wurzel/Knoten/Kante/Blatt),
//             Objekte klassifizieren

// ─── Mini-Spiel Integration (neue Komponenten) ────────────────────────────────
// Die folgenden neuen Mini-Spiel-Komponenten können in Level-Pages eingebunden werden:
//
// 1. SortingGame — Drag-and-Drop Sortier-Spiel (Trainingsdaten / Testdaten)
//    Import:   import { SortingGame } from '@/components/game/SortingGame'
//    Usage:    <SortingGame onComplete={(xp) => handleXp(xp)} />
//    XP:       0–60 XP je nach Genauigkeit
//
// 2. FillInTheBlank — Lückentext-Komponente (6 Sätze über Entscheidungsbaum-Begriffe)
//    Import:   import { FillInTheBlank } from '@/components/game/FillInTheBlank'
//    Usage:    <FillInTheBlank onComplete={(xp) => handleXp(xp)} />
//    XP:       15 XP pro richtiger Antwort (max. 90 XP)
//
// 3. MatchingPairs — Memory/Matching Karten-Spiel mit Timer-Bonus
//    Import:   import { MatchingPairs } from '@/components/game/MatchingPairs'
//    Usage:    <MatchingPairs onComplete={(xp) => handleXp(xp)} />
//    XP:       60 Basis-XP + 30 Zeitbonus − 3 XP pro Fehler (mind. 10 XP)
//
// 4. CodeTracer — Pseudo-Code Tracer für algorithmisches Denken
//    Import:   import { CodeTracer } from '@/components/game/CodeTracer'
//    Usage:    <CodeTracer onComplete={(xp) => handleXp(xp)} />
//    XP:       20 XP pro Objekt (3 Objekte = max. 60 XP)
//
// Alle Komponenten haben einheitliche Props: { onComplete: (xp: number) => void }
// Sie rendern als fixed overlay (z-50) mit Comic-Stil-Design.
// ─────────────────────────────────────────────────────────────────────────────

export type DialogLine = {
  speaker: string
  text: string
  portrait: 'node' | 'player'
}

export type Suspect = {
  id: string
  name: string
  hat: boolean
  coat: boolean
  beard: boolean
  glasses: boolean
  category: 'verdächtig' | 'unverdächtig'
  emoji: string
}

export type TreeNode = {
  id: string
  question?: string
  attribute?: 'hat' | 'coat' | 'beard' | 'glasses'
  yes?: string  // node id
  no?: string   // node id
  result?: 'verdächtig' | 'unverdächtig'
  isGap?: boolean  // für Mittel-Niveau: Lücke zum Ausfüllen
}

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correct: number  // index
  explanation: string
  level?: 'basis' | 'standard' | 'experten'
}

export type Difficulty = 'basis' | 'standard' | 'experten'

// ─── Intro-Dialoge ────────────────────────────────────────────────────────────

export const introDialogues: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Willkommen bei Team MKS! Ich bin Inspector Node — dein Mentor.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Wir haben ein Problem: Unser Archiv ist ein Chaos!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Niemand weiß mehr, welche Verdächtigen wirklich gefährlich sind.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Ich kenne das wichtigste Werkzeug jedes Top-Detektivs: den Entscheidungsbaum!',
    portrait: 'node',
  },
  {
    speaker: '{NAME}',
    text: 'Einen Entscheidungsbaum? Was ist das?',
    portrait: 'player',
  },
  {
    speaker: 'Inspector Node',
    text: 'Schau dir zuerst das Video am Monitor an — dann erkläre ich dir alles. Los!',
    portrait: 'node',
  },
]

// ─── Monitor-Dialoge (nach Video) ─────────────────────────────────────────────

export const monitorDialogues: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Super! Jetzt weißt du: Klassifikation bedeutet, Objekte anhand ihrer Merkmale in Kategorien einzuteilen.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Ein Entscheidungsbaum hilft uns dabei — er stellt Ja/Nein-Fragen zu den Merkmalen.',
    portrait: 'node',
  },
]

// ─── Inspector Node Lehr-Dialoge (am Case-Board) ──────────────────────────────

export const teachingDialogues: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Schau her! Das ist unser Entscheidungsbaum. Lass mich dir die Teile zeigen.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Die WURZEL ist ganz oben — das ist die erste Frage, die wir stellen.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Die KNOTEN in der Mitte stellen weitere Ja/Nein-Fragen.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Die KANTEN sind die Pfeile zwischen den Knoten — sie zeigen: Ja-Weg oder Nein-Weg.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Die BLÄTTER ganz unten geben die Antwort: verdächtig oder unverdächtig!',
    portrait: 'node',
  },
  {
    speaker: '{NAME}',
    text: 'Das klingt wie ein riesiges Ablaufdiagramm!',
    portrait: 'player',
  },
  {
    speaker: 'Inspector Node',
    text: 'Genau! Jetzt kannst du selbst 3 Verdächtige klassifizieren. Viel Erfolg, {NAME}!',
    portrait: 'node',
  },
]

// ─── Verdächtige ──────────────────────────────────────────────────────────────

export const suspects: Suspect[] = [
  {
    id: 'suspect1',
    name: 'Gustav G.',
    hat: true,
    coat: true,
    beard: false,
    glasses: false,
    category: 'verdächtig',
    emoji: '🕵️',
  },
  {
    id: 'suspect2',
    name: 'Maria M.',
    hat: false,
    coat: true,
    beard: false,
    glasses: true,
    category: 'unverdächtig',
    emoji: '👩',
  },
  {
    id: 'suspect3',
    name: 'Boris B.',
    hat: true,
    coat: false,
    beard: true,
    glasses: false,
    category: 'verdächtig',
    emoji: '🧔',
  },
  {
    id: 'suspect4',
    name: 'Anna A.',
    hat: false,
    coat: false,
    beard: false,
    glasses: false,
    category: 'unverdächtig',
    emoji: '👩',
  },
  {
    id: 'suspect5',
    name: 'Heinrich H.',
    hat: true,
    coat: true,
    beard: true,
    glasses: false,
    category: 'verdächtig',
    emoji: '🕵️',
  },
  {
    id: 'suspect6',
    name: 'Frieda F.',
    hat: false,
    coat: true,
    beard: false,
    glasses: false,
    category: 'unverdächtig',
    emoji: '👩‍💼',
  },
]

// ─── Entscheidungsbäume nach Schwierigkeitsgrad ───────────────────────────────

// Basis: 2 Merkmale (Hut, Mantel), Baum komplett vorgegeben
export const treeBasic: TreeNode[] = [
  { id: 'root', question: 'Trägt die Person einen Hut?', attribute: 'hat', yes: 'n1', no: 'n2' },
  { id: 'n1', question: 'Trägt die Person einen Mantel?', attribute: 'coat', yes: 'leaf_v1', no: 'leaf_u1' },
  { id: 'n2', result: 'unverdächtig' },
  { id: 'leaf_v1', result: 'verdächtig' },
  { id: 'leaf_u1', result: 'unverdächtig' },
]

// Standard: 3 Merkmale, eine Lücke zum Ausfüllen (Bart-Knoten fehlt)
export const treeStandard: TreeNode[] = [
  { id: 'root', question: 'Trägt die Person einen Hut?', attribute: 'hat', yes: 'n1', no: 'n2' },
  { id: 'n1', question: 'Trägt die Person einen Mantel?', attribute: 'coat', yes: 'leaf_v1', no: 'n3' },
  { id: 'n2', result: 'unverdächtig' },
  { id: 'leaf_v1', result: 'verdächtig' },
  { id: 'n3', question: '???', attribute: 'beard', yes: 'leaf_v2', no: 'leaf_u2', isGap: true },
  { id: 'leaf_v2', result: 'verdächtig' },
  { id: 'leaf_u2', result: 'unverdächtig' },
]

// Experten: 4 Merkmale + ein Fehler versteckt (Brillen-Zweig ist falsch)
export const treeExperten: TreeNode[] = [
  { id: 'root', question: 'Trägt die Person einen Hut?', attribute: 'hat', yes: 'n1', no: 'n2' },
  { id: 'n1', question: 'Trägt die Person einen Mantel?', attribute: 'coat', yes: 'leaf_v1', no: 'n3' },
  { id: 'n2', question: 'Trägt die Person eine Brille?', attribute: 'glasses', yes: 'leaf_v_wrong', no: 'leaf_u1' },
  { id: 'leaf_v1', result: 'verdächtig' },
  { id: 'n3', question: 'Hat die Person einen Bart?', attribute: 'beard', yes: 'leaf_v2', no: 'leaf_u2' },
  // Fehler: Brille→verdächtig ist falsch (sollte unverdächtig sein)
  { id: 'leaf_v_wrong', result: 'verdächtig' }, // absichtlich falsch
  { id: 'leaf_u1', result: 'unverdächtig' },
  { id: 'leaf_v2', result: 'verdächtig' },
  { id: 'leaf_u2', result: 'unverdächtig' },
]

export const expertenError = {
  nodeId: 'leaf_v_wrong',
  correctResult: 'unverdächtig' as const,
  hint: 'Schau dir den Brille-Zweig nochmal an: Maria trägt eine Brille, aber ist sie wirklich verdächtig?',
}

// ─── Quiz-Fragen ──────────────────────────────────────────────────────────────

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Was bedeutet Klassifikation in der Informatik?',
    options: [
      'Objekte anhand ihrer Merkmale Kategorien zuordnen',
      'Daten in einer Datenbank speichern',
      'Einen Algorithmus programmieren',
      'Variablen deklarieren',
    ],
    correct: 0,
    explanation:
      'Klassifikation ist die merkmalsbasierte Zuordnung von Objekten zu Kategorien — genau das macht unser Entscheidungsbaum!',
  },
  {
    id: 'q2',
    question: 'Welcher Begriff bezeichnet die oberste Verzweigung im Entscheidungsbaum?',
    options: ['Blatt', 'Wurzel', 'Knoten', 'Kante'],
    correct: 1,
    explanation:
      'Die Wurzel ist der Startpunkt des Entscheidungsbaums — ganz oben, die erste Frage.',
  },
  {
    id: 'q3',
    question: 'Was bezeichnen die Blätter im Entscheidungsbaum?',
    options: [
      'Weitere Fragen zu Merkmalen',
      'Die Verbindungen zwischen Knoten',
      'Den Startpunkt des Baums',
      'Die Ergebnisse / Kategorien',
    ],
    correct: 3,
    explanation:
      'Blätter sind die Endpunkte des Baums — hier steht das Ergebnis der Klassifikation, z.B. "verdächtig".',
  },
  {
    id: 'q4',
    question:
      'Boris: Hut=Ja, Mantel=Nein, Bart=Ja. Welche Kategorie ergibt der Standard-Baum?',
    options: ['unverdächtig', 'verdächtig', 'unbekannt', 'Fehler im Baum'],
    correct: 1,
    explanation:
      'Hut=Ja → Mantel=Nein → Bart=Ja → verdächtig. Du hast den Pfad richtig durchlaufen!',
  },
  {
    id: 'q5',
    question: 'Was ist eine "Kante" im Entscheidungsbaum?',
    options: [
      'Eine weitere Frage in der Mitte des Baums',
      'Der Endpunkt mit dem Ergebnis',
      'Die Verbindung zwischen zwei Knoten — zeigt den Ja- oder Nein-Pfad',
      'Der Startpunkt ganz oben',
    ],
    correct: 2,
    explanation: 'Kanten verbinden Knoten miteinander und zeigen, welchen Weg wir je nach Antwort (Ja/Nein) nehmen.',
  },
  {
    id: 'q6',
    question: 'Wie viele Ausgänge hat ein normaler Knoten im Entscheidungsbaum?',
    options: ['Einen (nur Ja)', 'Zwei (Ja und Nein)', 'Drei oder mehr', 'Keinen — Knoten sind Endpunkte'],
    correct: 1,
    explanation: 'Jeder Knoten stellt eine Ja/Nein-Frage und hat genau zwei Ausgänge: einen für Ja und einen für Nein.',
  },
  {
    id: 'q7',
    question: 'Was unterscheidet einen Knoten von einem Blatt?',
    options: [
      'Ein Knoten ist größer als ein Blatt',
      'Ein Blatt stellt Fragen, ein Knoten gibt Ergebnisse',
      'Ein Knoten stellt eine Frage und verzweigt, ein Blatt gibt das Endergebnis',
      'Es gibt keinen Unterschied',
    ],
    correct: 2,
    explanation: 'Knoten sind Verzweigungspunkte mit Fragen. Blätter sind Endpunkte ohne weitere Fragen — hier steht das Klassifikationsergebnis.',
  },
  {
    id: 'q8',
    question: 'Anna trägt keinen Hut. Was ergibt der Basis-Entscheidungsbaum für sie?',
    options: ['verdächtig', 'unverdächtig', 'Es wird weiter gefragt', 'Fehler im Baum'],
    correct: 1,
    explanation: 'Im Basis-Baum: Hut=Nein → direkt unverdächtig. Kein Hut bedeutet keine weitere Prüfung nötig.',
  },
  {
    id: 'q9',
    question: 'Welche Aussage über Entscheidungsbäume ist korrekt?',
    options: [
      'Ein Entscheidungsbaum kann nur zwei Merkmale prüfen',
      'Jeder Knoten kann beliebig viele Ausgänge haben',
      'Der Baum startet immer an der Wurzel und endet an einem Blatt',
      'Blätter stellen Fragen, Knoten geben Ergebnisse',
    ],
    correct: 2,
    explanation:
      'Richtig! Jede Klassifikation startet an der Wurzel und folgt den Kanten bis zu einem Blatt. Blätter sind Endpunkte mit Ergebnissen — nie Fragen.',
  },
]

// ─── Spielwelt-Konstanten ──────────────────────────────────────────────────────

export const WORLD_WIDTH = 900
export const WORLD_HEIGHT = 500
export const PLAYER_SPEED = 3
export const INTERACTION_RADIUS = 80

export type InteractionZone = {
  id: 'monitor' | 'inspector' | 'caseboard'
  x: number
  y: number
  label: string
  icon: string
}

export const interactionZones: InteractionZone[] = [
  { id: 'monitor', x: 160, y: 180, label: 'Video ansehen', icon: '📺' },
  { id: 'inspector', x: 220, y: 340, label: 'Inspector Node', icon: '🕵️‍♂️' },
  { id: 'caseboard', x: 700, y: 260, label: 'Fall-Board', icon: '🔍' },
]
