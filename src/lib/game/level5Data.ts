// Level 5: "Das voreingenommene Orakel"
// Lernziel: Datenbias, Chancen & Risiken, KI-Ethik

import type { DialogLine } from './level1Data'

export type { DialogLine }

export type QuizQuestion5 = {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

export type EthicsStatement = {
  id: string
  text: string
  correctVerdict: 'richtig' | 'falsch' | 'kommt_drauf_an'
  explanation: string
}

export type BiasDataEntry = {
  id: string
  bezirk: 'X' | 'Y'
  name: string
  label: 'verdächtig' | 'unverdächtig'
  emoji: string
}

export const WORLD_WIDTH = 900
export const WORLD_HEIGHT = 500

// ─── Dialoge ──────────────────────────────────────────────────────────────────

export const introDialogues5: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Willkommen zum letzten Level, {NAME}! Heute geht es um eine der wichtigsten Fragen der KI: Ist sie fair?',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Die Stadtpolizei hat eine Einstellungs-KI gebaut. Sie soll entscheiden, wer als "verdächtig" gilt.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Aber es gibt ein Problem: Alle Trainingsdaten kamen aus Stadtbezirk X — einem benachteiligten Viertel.',
    portrait: 'node',
  },
  {
    speaker: '{NAME}',
    text: 'Und jetzt markiert die KI alle aus Bezirk X als verdächtig?',
    portrait: 'player',
  },
  {
    speaker: 'Inspector Node',
    text: 'Genau! Das nennt man Datenbias. Die KI lernt Vorurteile aus den Daten — und verstärkt sie noch!',
    portrait: 'node',
  },
]

export const teachingDialogues5: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Bias bedeutet "Voreingenommenheit". In KI-Systemen entsteht Bias, wenn die Trainingsdaten nicht repräsentativ sind.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'In unserem Fall: 90% der Daten aus Bezirk X, nur 10% aus Y. Die KI "denkt", X-Bewohner sind häufiger verdächtig.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Aber das stimmt nicht! Die Daten aus X wurden nur häufiger erhoben — weil die Polizei dort mehr patrouilliert.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Dieses Problem heißt Confirmation Bias: Die Daten bestätigen bereits existierende Vorurteile.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'KI-Systeme können Diskriminierung automatisieren — und das passiert meist unbeabsichtigt!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Deine Aufgabe: Analysiere die Daten, erkenne den Bias, und denke über die ethischen Konsequenzen nach!',
    portrait: 'node',
  },
]

// ─── Datensatz (Bias-Daten) ────────────────────────────────────────────────────

export const biasDataset: BiasDataEntry[] = [
  // Bezirk X: 18 Einträge (90%)
  { id: 'x1',  bezirk: 'X', name: 'Karl K.',   label: 'verdächtig',   emoji: '👨' },
  { id: 'x2',  bezirk: 'X', name: 'Lena L.',   label: 'verdächtig',   emoji: '👩' },
  { id: 'x3',  bezirk: 'X', name: 'Moritz M.', label: 'unverdächtig', emoji: '👦' },
  { id: 'x4',  bezirk: 'X', name: 'Nora N.',   label: 'verdächtig',   emoji: '👧' },
  { id: 'x5',  bezirk: 'X', name: 'Oliver O.', label: 'verdächtig',   emoji: '👨‍🦳' },
  { id: 'x6',  bezirk: 'X', name: 'Paula P.',  label: 'unverdächtig', emoji: '👩‍🦳' },
  { id: 'x7',  bezirk: 'X', name: 'Quentin Q.',label: 'verdächtig',   emoji: '🧔' },
  { id: 'x8',  bezirk: 'X', name: 'Rita R.',   label: 'verdächtig',   emoji: '👩‍💼' },
  { id: 'x9',  bezirk: 'X', name: 'Stefan S.', label: 'unverdächtig', emoji: '👨‍💼' },
  { id: 'x10', bezirk: 'X', name: 'Tina T.',   label: 'verdächtig',   emoji: '👩' },
  { id: 'x11', bezirk: 'X', name: 'Ulrich U.', label: 'verdächtig',   emoji: '👨' },
  { id: 'x12', bezirk: 'X', name: 'Vera V.',   label: 'unverdächtig', emoji: '👩' },
  { id: 'x13', bezirk: 'X', name: 'Werner W.', label: 'verdächtig',   emoji: '🧔' },
  { id: 'x14', bezirk: 'X', name: 'Xenia X.',  label: 'verdächtig',   emoji: '👩‍🎨' },
  { id: 'x15', bezirk: 'X', name: 'Yannick Y.',label: 'unverdächtig', emoji: '👦' },
  { id: 'x16', bezirk: 'X', name: 'Zara Z.',   label: 'verdächtig',   emoji: '👧' },
  { id: 'x17', bezirk: 'X', name: 'Anton A.',  label: 'verdächtig',   emoji: '👨‍🦱' },
  { id: 'x18', bezirk: 'X', name: 'Berta B.',  label: 'unverdächtig', emoji: '👩‍🦱' },
  // Bezirk Y: 2 Einträge (10%)
  { id: 'y1',  bezirk: 'Y', name: 'Carla C.',  label: 'unverdächtig', emoji: '👩' },
  { id: 'y2',  bezirk: 'Y', name: 'Dieter D.', label: 'verdächtig',   emoji: '👨' },
]

// ─── Ethik-Aussagen ───────────────────────────────────────────────────────────

export const ethicsStatements: EthicsStatement[] = [
  {
    id: 'e1',
    text: 'Wenn eine KI mathematisch optimiert ist, trifft sie immer faire Entscheidungen.',
    correctVerdict: 'falsch',
    explanation: 'Falsch! Eine KI kann mathematisch optimal und trotzdem unfair sein — wenn die Trainingsdaten selbst Vorurteile enthalten. "Optimal" bedeutet nur, dass sie die Muster in den Daten gut erkannt hat.',
  },
  {
    id: 'e2',
    text: 'Die Verantwortung für KI-Fehler liegt allein beim Algorithmus, nicht beim Entwickler.',
    correctVerdict: 'falsch',
    explanation: 'Falsch! Entwickler, Unternehmen und auch Auftraggeber tragen Verantwortung. KI trifft keine moralischen Entscheidungen — Menschen, die sie bauen und einsetzen, schon.',
  },
  {
    id: 'e3',
    text: 'Mehr Daten zu sammeln ist immer besser und löst das Bias-Problem.',
    correctVerdict: 'kommt_drauf_an',
    explanation: 'Es kommt drauf an! Mehr Daten helfen nur, wenn sie vielfältig und repräsentativ sind. Wenn du 1000 weitere Daten aus Bezirk X sammelst, verstärkt sich der Bias noch mehr.',
  },
  {
    id: 'e4',
    text: 'KI-Systeme sollten transparent sein — Nutzer sollten verstehen können, warum eine Entscheidung getroffen wurde.',
    correctVerdict: 'richtig',
    explanation: 'Richtig! Transparenz ist ein wichtiges KI-Ethik-Prinzip. Wenn jemand von einer KI-Entscheidung betroffen ist, hat er ein Recht zu wissen, warum. Das nennt man "Erklärbarkeit".',
  },
  {
    id: 'e5',
    text: 'Eine KI, die bei einer Gruppe 80% und bei einer anderen Gruppe nur 40% Genauigkeit hat, ist fair.',
    correctVerdict: 'falsch',
    explanation: 'Falsch! Faire KI-Systeme sollten für alle Gruppen ähnlich gut funktionieren. Große Genauigkeitsunterschiede zwischen Gruppen sind ein Zeichen von Bias — auch wenn das Modell insgesamt "gut" abschneidet.',
  },
]

// ─── Quiz-Fragen ───────────────────────────────────────────────────────────────

export const quizQuestions5: QuizQuestion5[] = [
  {
    id: 'q1',
    question: 'Was ist "Bias" in KI-Systemen?',
    options: [
      'Ein Programmierfehler im Code des Algorithmus',
      'Voreingenommenheit durch nicht-repräsentative Trainingsdaten oder Designentscheidungen',
      'Wenn die KI zu langsam läuft',
      'Ein Bug, der durch Updates behoben werden kann',
    ],
    correct: 1,
    explanation:
      'Bias in KI ist Voreingenommenheit, die durch schiefe Trainingsdaten oder Designentscheidungen entsteht. Die KI lernt Muster, die gesellschaftliche Ungleichheiten widerspiegeln — und verstärkt sie.',
  },
  {
    id: 'q2',
    question: 'Welche Konsequenzen kann eine voreingenommene KI haben?',
    options: [
      'Keine — KI ist immer objektiv',
      'Nur technische Probleme, keine sozialen',
      'Diskriminierung, ungerechte Entscheidungen, Verstärkung von Vorurteilen',
      'Nur marginale Auswirkungen bei kleinen Datensätzen',
    ],
    correct: 2,
    explanation:
      'Voreingenommene KI kann echten Schaden anrichten: Menschen werden aufgrund von Postleitzahl, Hautfarbe oder anderen Merkmalen benachteiligt. Bekannte Beispiele: Kreditvergabe, Strafverfolgung, Stellenbewerbungen.',
  },
  {
    id: 'q3',
    question: 'Wie kann man Datenbias erkennen?',
    options: [
      'Es ist nicht möglich — KI-Systeme sind Black Boxes',
      'Nur durch Ausprobieren im echten Betrieb',
      'Durch Analyse der Datenherkunft, Fairness-Tests und Vergleich der Ergebnisse für verschiedene Gruppen',
      'Durch mehr Trainingsdaten',
    ],
    correct: 2,
    explanation:
      'Bias erkennt man durch: Analyse der Datenherkunft (Woher kommen die Daten?), Fairness-Metriken (Wie unterscheiden sich Ergebnisse für verschiedene Gruppen?), und kritisches Hinterfragen der Annahmen.',
  },
  {
    id: 'q4',
    question: 'Wer ist verantwortlich, wenn eine KI falsche oder diskriminierende Entscheidungen trifft?',
    options: [
      'Niemand — KI trifft autonome Entscheidungen',
      'Nur die Programmierer des Algorithmus',
      'Alle Beteiligten: Entwickler, Auftraggeber, Betreiber — und manchmal auch Nutzer',
      'Nur die KI selbst',
    ],
    correct: 2,
    explanation:
      'Verantwortung für KI-Systeme ist geteilt: Entwickler sind für den Algorithmus verantwortlich, Auftraggeber für die Anforderungen, Betreiber für den Einsatz. Der EU AI Act (seit 2024) regelt diese Verantwortlichkeiten gesetzlich.',
  },
  {
    id: 'q5',
    question: 'Wie kann man Datenbias in einem KI-System reduzieren?',
    options: [
      'Den Algorithmus schneller machen',
      'Mehr Daten aus derselben Quelle sammeln',
      'Vielfältigere und ausgewogenere Trainingsdaten verwenden und regelmäßig auf Fairness prüfen',
      'Den Baum tiefer machen',
    ],
    correct: 2,
    explanation:
      'Bias reduzieren: (1) Daten aus verschiedenen Gruppen gleichmäßig sammeln, (2) Daten auf Überrepräsentation prüfen, (3) Fairness-Tests für alle betroffenen Gruppen durchführen, (4) Ergebnisse regelmäßig kritisch hinterfragen.',
  },
]

// ─── Zweites Bias-Beispiel: Gesichtserkennung ─────────────────────────────────

export type FaceRecogEntry = {
  id: string
  name: string
  gruppe: 'A' | 'B'
  gruppenLabel: string
  erkannt: boolean   // ob die KI das Gesicht korrekt erkennt
  emoji: string
}

export const faceRecogData: FaceRecogEntry[] = [
  { id: 'f1',  name: 'Mia',    gruppe: 'A', gruppenLabel: 'Gruppe A (hell)', erkannt: true,  emoji: '👩' },
  { id: 'f2',  name: 'Lena',   gruppe: 'A', gruppenLabel: 'Gruppe A (hell)', erkannt: true,  emoji: '👩‍🦱' },
  { id: 'f3',  name: 'Emma',   gruppe: 'A', gruppenLabel: 'Gruppe A (hell)', erkannt: true,  emoji: '👩‍🦳' },
  { id: 'f4',  name: 'Sophie', gruppe: 'A', gruppenLabel: 'Gruppe A (hell)', erkannt: true,  emoji: '🧑' },
  { id: 'f5',  name: 'Anna',   gruppe: 'A', gruppenLabel: 'Gruppe A (hell)', erkannt: false, emoji: '👩‍🦰' },
  { id: 'f6',  name: 'Kofi',   gruppe: 'B', gruppenLabel: 'Gruppe B (dunkel)', erkannt: false, emoji: '🧑🏿' },
  { id: 'f7',  name: 'Amara',  gruppe: 'B', gruppenLabel: 'Gruppe B (dunkel)', erkannt: false, emoji: '👩🏿' },
  { id: 'f8',  name: 'Yaw',    gruppe: 'B', gruppenLabel: 'Gruppe B (dunkel)', erkannt: false, emoji: '🧑🏿‍🦱' },
  { id: 'f9',  name: 'Fatima', gruppe: 'B', gruppenLabel: 'Gruppe B (dunkel)', erkannt: true,  emoji: '👩🏿‍🦱' },
  { id: 'f10', name: 'Kwame',  gruppe: 'B', gruppenLabel: 'Gruppe B (dunkel)', erkannt: false, emoji: '🧔🏿' },
]

export const faceRecogTrainingComposition = {
  gruppeA: 900,
  gruppeB: 100,
  gesamt: 1000,
}

export const faceRecogBiasDialogue: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Gut erkannt, {NAME}! Aber Datenbias tritt nicht nur bei der Polizei auf. Schau dir dieses Beispiel an!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Ein Unternehmen hat eine Gesichtserkennung entwickelt — mit 1000 Trainingsfotos: 900 von Gruppe A, nur 100 von Gruppe B.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Jetzt testen wir: Wie gut erkennt die KI Gesichter aus Gruppe A? Und aus Gruppe B?',
    portrait: 'node',
  },
  {
    speaker: '{NAME}',
    text: 'Das Ergebnis ist bestimmt unterschiedlich, oder?',
    portrait: 'player',
  },
  {
    speaker: 'Inspector Node',
    text: 'Genau! Analysiere die Erkennungsrate — und überlege: Welche realen Konsequenzen hätte das?',
    portrait: 'node',
  },
]

// ─── Inspector Abschluss-Rede ─────────────────────────────────────────────────

export const finalSpeechDialogues: DialogLine[] = [
  {
    speaker: 'Inspector Node',
    text: 'Glückwunsch, {NAME}! Du hast alle 5 Level abgeschlossen und die wichtigsten KI-Konzepte gemeistert.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'KI ist mächtig, aber nicht unfehlbar. Sie lernt aus Daten — und Daten spiegeln unsere Welt wider.',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Unsere Welt ist nicht perfekt — und deshalb sind KI-Systeme es auch nicht. Das ist wichtig zu wissen!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Ihr seid die Gestalter von morgen. Setzt KI fair, transparent und zum Wohl aller ein!',
    portrait: 'node',
  },
  {
    speaker: 'Inspector Node',
    text: 'Team MKS — ihr seid jetzt echte KI-Detektive. Macht eure Sache gut da draußen!',
    portrait: 'node',
  },
]
