// Vordefinierte Chatbot-Antworten für alle Level
// Schlüsselwörter → Antwort

export type ChatEntry = {
  keywords: string[]
  answer: string
  followUp?: string
}

export const chatbotEntries: ChatEntry[] = [
  {
    keywords: ['klassifikation', 'klassifizierung', 'was ist klassifikation', 'klassi'],
    answer:
      '🔍 **Klassifikation** bedeutet: Objekte werden anhand ihrer **Merkmale** einer Kategorie zugeordnet. Beispiel: Hat die Person einen Hut und einen Mantel? → "verdächtig". Ohne Hut? → "unverdächtig".',
    followUp: 'Möchtest du wissen, wie der Entscheidungsbaum dabei hilft?',
  },
  {
    keywords: ['wurzel', 'root', 'erste frage', 'anfang', 'start', 'oben'],
    answer:
      '🌳 Die **Wurzel** ist der Startpunkt des Entscheidungsbaums — ganz oben. Es ist die erste Frage, die gestellt wird. Von hier aus verzweigt sich alles.',
  },
  {
    keywords: ['knoten', 'node', 'verzweigung', 'frage'],
    answer:
      '⭕ Ein **Knoten** ist eine Frage im Entscheidungsbaum, z.B. "Trägt die Person einen Hut?" Von jedem Knoten gehen zwei Kanten ab: eine für Ja, eine für Nein.',
  },
  {
    keywords: ['kante', 'pfeil', 'linie', 'verbindung', 'weg'],
    answer:
      '➡️ Eine **Kante** ist die Verbindung zwischen zwei Knoten. Sie zeigt die Antwort auf eine Frage: entweder "Ja" oder "Nein".',
  },
  {
    keywords: ['blatt', 'leaf', 'ergebnis', 'endpunkt', 'unten', 'kategorie'],
    answer:
      '🍃 Ein **Blatt** ist der Endpunkt des Entscheidungsbaums. Hier steht das Ergebnis der Klassifikation — zum Beispiel "verdächtig" oder "unverdächtig". Keine weiteren Fragen mehr!',
  },
  {
    keywords: ['entscheidungsbaum', 'decision tree', 'was ist ein', 'baum'],
    answer:
      '🌳 Ein **Entscheidungsbaum** ist ein Werkzeug zur Klassifikation. Er stellt Ja/Nein-Fragen zu Merkmalen und leitet so zu einem Ergebnis. Er besteht aus: **Wurzel** (Start), **Knoten** (Fragen), **Kanten** (Ja/Nein-Pfade) und **Blättern** (Ergebnisse).',
  },
  {
    keywords: ['aufgabe', 'nicht verstehen', 'hilfe', 'wie funktioniert', 'was soll ich'],
    answer:
      '💡 **Tipp zur Aufgabe:** Nimm einen Verdächtigen und fang bei der Wurzel (oberste Frage) an. Beantworte die Frage (Ja oder Nein) und folge dem Pfeil. Mach das weiter bis du ein Blatt erreichst — das ist die Antwort!',
    followUp: 'Probier es Schritt für Schritt bei Gustav G.',
  },
  {
    keywords: ['merkmal', 'eigenschaft', 'attribut'],
    answer:
      '📋 Ein **Merkmal** (auch Attribut genannt) ist eine Eigenschaft, die ein Objekt haben kann oder nicht. In unserem Fall: Hut ✓/✗, Mantel ✓/✗, Bart ✓/✗. Der Entscheidungsbaum fragt nach diesen Merkmalen.',
  },
  {
    keywords: ['overfitting', 'überanpassung', 'auswendig', 'zu komplex'],
    answer:
      '⚠️ **Überanpassung (Overfitting)** passiert, wenn ein Baum die Trainingsdaten auswendig lernt — aber bei neuen Daten versagt. Erkennbar: Trainings-Genauigkeit viel höher als Test-Genauigkeit.',
    followUp: 'Das Gegenteil heißt Underfitting — der Baum ist zu simpel und lernt kaum etwas.',
  },
  {
    keywords: ['underfitting', 'zu einfach', 'zu flach'],
    answer:
      '📉 **Underfitting** bedeutet: Der Baum ist zu simpel und erkennt keine echten Muster. Beispiel: Ein Baum mit nur einem Knoten kann kaum unterscheiden. Ziel ist immer die Balance zwischen zu komplex und zu simpel.',
  },
  {
    keywords: ['genauigkeit', 'accuracy', 'prozent', 'wie gut', 'trefferquote'],
    answer:
      '📊 **Genauigkeit (Accuracy)** = Anteil der richtigen Vorhersagen an allen Vorhersagen. Beispiel: 8 von 10 richtig = 80% Genauigkeit. Wichtig: Immer auch die Test-Genauigkeit prüfen, nicht nur die Trainings-Genauigkeit!',
  },
  {
    keywords: ['training', 'trainingsdaten', 'lernen', 'trainingsset'],
    answer:
      '📚 **Trainingsdaten** sind Beispiele mit bekannten Antworten (Labels), aus denen das Modell lernt. Typisch: 80% der Daten fürs Training, 20% für den Test (80/20-Split).',
    followUp: 'Warum brauchen wir auch Testdaten? Frag mich nach "Testdaten"!',
  },
  {
    keywords: ['test', 'testdaten', 'testset', 'split', '80/20'],
    answer:
      '🔬 **Testdaten** sind Daten, die das Modell noch nie gesehen hat. Sie prüfen, ob das Modell wirklich gelernt hat — oder nur auswendig gelernt hat. Typisch: 20% der Daten werden als Testdaten beiseitegelegt.',
  },
  {
    keywords: ['bias', 'voreingenommenheit', 'diskriminierung', 'unfair', 'ungerecht'],
    answer:
      '⚖️ **Bias (Voreingenommenheit)** in KI entsteht, wenn die Trainingsdaten nicht alle Gruppen fair repräsentieren. Die KI lernt dann Vorurteile — und wendet sie auf neue Fälle an. Lösung: vielfältigere und ausgewogenere Daten.',
    followUp: 'Mehr dazu in Level 5: Das voreingenommene Orakel.',
  },
  {
    keywords: ['hallo', 'hi', 'hey', 'guten'],
    answer:
      '👋 Hallo! Ich bin dein KI-Assistent für Team MKS. Frag mich alles über Entscheidungsbäume, Klassifikation oder die aktuelle Aufgabe!',
  },
  {
    keywords: ['danke', 'thanks', 'super', 'toll', 'verstanden'],
    answer: '😊 Sehr gut! Weiter so — du machst das klasse!',
  },
]

export const defaultAnswer =
  "🤔 Das weiß ich leider nicht genau. Versuche es mit Begriffen wie: **Wurzel**, **Knoten**, **Kante**, **Blatt**, **Klassifikation** oder **Entscheidungsbaum**."

export function findAnswer(input: string): { answer: string; followUp?: string } {
  const lower = input.toLowerCase().trim()
  for (const entry of chatbotEntries) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { answer: entry.answer, followUp: entry.followUp }
    }
  }
  return { answer: defaultAnswer }
}
