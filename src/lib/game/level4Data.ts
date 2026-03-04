// Level 4: "Der fehlerhafte Baum"
// Lernziel: Genauigkeit, Fehlerrate, Overfitting erkennen

import type { DialogLine } from './level1Data'

export type { DialogLine }

export type QuizQuestion4 = {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

export const WORLD_WIDTH = 900
export const WORLD_HEIGHT = 500

// ─── Dialoge ──────────────────────────────────────────────────────────────────

export const introDialogues4: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Willkommen in Level 4, {NAME}! Heute geht es um Fehler — und wie man sie erkennt.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Unser Labor hat zwei Entscheidungsbäume gebaut. Baum A und Baum B. Welcher ist besser?',
    portrait: 'node',
  },
  {
    speaker: 'Tim',
    text: 'Natürlich der mit 100% Genauigkeit — oder nicht?',
    portrait: 'player',
  },
  {
    speaker: 'Inspector Node',
    text: 'Das dachten wir auch. Aber schau dir die Testdaten an... Da wird es interessant, {NAME}!',
    portrait: 'node',
  },
]

export const teachingDialogues4: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Genauigkeit (Accuracy) gibt an, wie viel Prozent der Vorhersagen korrekt sind.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Ein Baum mit 100% Training-Genauigkeit klingt toll. Aber was, wenn er bei neuen Daten versagt?',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Das nennt man Overfitting — der Baum lernt die Trainingsdaten auswendig, versteht aber die Regeln nicht wirklich.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Stell dir Sherlock vor: Er kennt jedes Detail im Büro. Aber bring ihn nach Tokio — und er scheitert!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Ein guter Baum ist nicht perfekt auf Trainingsdaten — aber er funktioniert auch bei neuen Daten gut.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Untersuche jetzt Baum A und Baum B. Erkenne, welcher overfitted ist!',
    portrait: 'node',
  },
]

// ─── Baum-Daten ───────────────────────────────────────────────────────────────

export type TreeProfile = {
  id: 'A' | 'B'
  name: string
  depth: number
  trainAccuracy: number
  testAccuracy: number
  description: string
  isOverfit: boolean
  color: string
}

export const treeProfiles: TreeProfile[] = [
  {
    id: 'A',
    name: 'Baum A (Tiefer Baum)',
    depth: 8,
    trainAccuracy: 100,
    testAccuracy: 58,
    description: 'Sehr tiefer Baum mit 8 Ebenen. Jedes Detail der Trainingsdaten wurde gelernt.',
    isOverfit: true,
    color: '#FF3B3F',
  },
  {
    id: 'B',
    name: 'Baum B (Einfacher Baum)',
    depth: 3,
    trainAccuracy: 85,
    testAccuracy: 82,
    description: 'Einfacher Baum mit 3 Ebenen. Erkennt allgemeine Muster, keine Details.',
    isOverfit: false,
    color: '#00C853',
  },
]

// ─── Overfitting-Szenarien ────────────────────────────────────────────────────

export type OverfitScenario = {
  id: string
  title: string
  trainAcc: number
  testAcc: number
  isOverfit: boolean
  explanation: string
}

export const overfitScenarios: OverfitScenario[] = [
  {
    id: 'sc1',
    title: 'Modell X: Prüfungscomputer',
    trainAcc: 98,
    testAcc: 61,
    isOverfit: true,
    explanation: 'Riesiger Unterschied zwischen Training (98%) und Test (61%) — klares Overfitting!',
  },
  {
    id: 'sc2',
    title: 'Modell Y: Wettervorhersage',
    trainAcc: 79,
    testAcc: 75,
    isOverfit: false,
    explanation: 'Training und Test fast gleich (79% vs 75%) — gute Generalisierung!',
  },
  {
    id: 'sc3',
    title: 'Modell Z: Musikerkennung',
    trainAcc: 92,
    testAcc: 88,
    isOverfit: false,
    explanation: 'Kleiner Unterschied (92% vs 88%) — akzeptabel, kein schweres Overfitting.',
  },
  {
    id: 'sc4',
    title: 'Modell W: Spamfilter',
    trainAcc: 100,
    testAcc: 50,
    isOverfit: true,
    explanation: '100% Training aber nur 50% Test — so gut wie zufällig bei neuen Mails! Extremes Overfitting.',
  },
]

// ─── Quiz-Fragen ───────────────────────────────────────────────────────────────

export const quizQuestions4: QuizQuestion4[] = [
  {
    id: 'q1',
    question: 'Was bedeutet "Genauigkeit" (Accuracy) in der KI?',
    options: [
      'Wie schnell das Modell läuft',
      'Der Anteil korrekter Vorhersagen an allen Vorhersagen',
      'Wie viele Daten das Modell gesehen hat',
      'Die Tiefe des Entscheidungsbaums',
    ],
    correct: 1,
    explanation:
      'Genauigkeit = korrekte Vorhersagen / alle Vorhersagen × 100%. Bei 8 richtigen von 10 Vorhersagen = 80% Genauigkeit.',
  },
  {
    id: 'q2',
    question: 'Wann spricht man von "Overfitting"?',
    options: [
      'Wenn das Modell auf Trainingsdaten schlecht abschneidet',
      'Wenn das Modell auf Training sehr gut, aber auf Test sehr schlecht abschneidet',
      'Wenn das Modell zu wenige Daten hat',
      'Wenn der Baum zu flach ist',
    ],
    correct: 1,
    explanation:
      'Overfitting = das Modell hat die Trainingsdaten "auswendig gelernt". Auf neuen Testdaten versagt es, weil es nur die gelernten Beispiele kennt, nicht die allgemeinen Regeln.',
  },
  {
    id: 'q3',
    question: 'Welcher Baum ist besser: 99% Training/50% Test ODER 85% Training/83% Test?',
    options: [
      'Der erste (99%/50%) — wegen der höheren Training-Genauigkeit',
      'Beide sind gleich gut',
      'Der zweite (85%/83%) — wegen der besseren Generalisierung',
      'Keiner von beiden ist gut',
    ],
    correct: 2,
    explanation:
      'Der zweite Baum ist klar besser! Er generalisiert gut — Training und Test sind fast gleich. Der erste ist overfitted und bei neuen Daten fast nutzlos (50% = Zufallsraten!).',
  },
  {
    id: 'q4',
    question: 'Wie kann man Overfitting vermeiden?',
    options: [
      'Durch mehr Trainingsiterationen',
      'Durch einen tieferen Baum mit mehr Knoten',
      'Durch weniger Tiefe im Baum (Pruning) und mehr Trainingsdaten',
      'Overfitting ist unvermeidbar',
    ],
    correct: 2,
    explanation:
      'Overfitting vermeiden: (1) Baum-Tiefe begrenzen (Pruning), (2) mehr Trainingsdaten sammeln, (3) Regularisierung anwenden. Ein zu tiefer Baum lernt Rauschen statt echte Muster.',
  },
]
