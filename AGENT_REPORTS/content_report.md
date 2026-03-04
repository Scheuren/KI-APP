# Content Review Report – Team MKS Lern-RPG
**Erstellt:** 2026-03-04
**Reviewer:** Claude Code (content-review Agent)
**Zielgruppe:** Klasse 9, Gemeinschaftsschule Saarland, Lehrplan 2025
**Thema:** KI & Entscheidungsbäume

---

## Zusammenfassung

Alle 6 Dateien wurden gelesen, fachlich und didaktisch geprüft und direkt bearbeitet. Die Änderungen verbessern Altersangemessenheit, Lehrplankonformität, Dialoglängen und fachliche Korrektheit.

---

## Datei: `level1Data.ts`

### Gefundene Probleme

| # | Problem | Schwere |
|---|---------|---------|
| 1 | Dialog "Wir haben ein Problem..." zu lang (>120 Zeichen, war 126 Zeichen) | Mittel |
| 2 | "geheimste Werkzeug" ist sprachlich unkorrekt (Superlativ von "geheim" unpassend) | Gering |
| 3 | Kanten-Erklärung und Knoten-Erklärung in einem einzigen Dialog (zu viel auf einmal) | Mittel |
| 4 | Quiz q4: Placeholder `{NAME}` in der Erklärung (inkonsistent mit anderen Quizfragen) | Gering |
| 5 | Fehlendes Quiz-Item zum strukturellen Gesamtverständnis (Lernziel: Baum-Durchlauf) | Mittel |
| 6 | Player-Dialogzeile (`Tim`) – hardcoded Name statt Spielervariable | Mittel |

### Vorgenommene Änderungen

- **Dialog gesplittet:** "Wir haben ein Problem: Unser Archiv ist ein Chaos! Niemand weiß mehr..." → 2 separate Zeilen (je <80 Zeichen)
- **Sprache korrigiert:** "geheimste" → "wichtigste"
- **Kanten-Dialog gesplittet:** Knoten-Erklärung und Kanten-Erklärung in separate Dialogzeilen aufgeteilt
- **Quiz q4 bereinigt:** `{NAME}` aus Erklärungstext entfernt
- **Quiz q9 hinzugefügt:** Strukturelle Frage zum Gesamtverständnis ("Welche Aussage über Entscheidungsbäume ist korrekt?")
- **Tim → {NAME}:** Player-Speaker durch generische Platzhaltervariable ersetzt (Konsistenz)

---

## Datei: `level2Data.ts`

### Gefundene Probleme

| # | Problem | Schwere |
|---|---------|---------|
| 1 | `teachingDialogues2` wiederholt Klassifikations-Definition aus Level 1 wortgetreu | Hoch |
| 2 | Viktor-Portrait: `portrait: 'player'` obwohl Viktor ein Verdächtiger ist, nicht der Spieler | Hoch |
| 3 | `treeStandard2`: Bart-Frage (n2) führt bei Ja und Nein zum selben Ergebnis (verdächtig) – Frage ist wertlos, pädagogisch falsch | Hoch |
| 4 | Fehlendes Quiz-Item zur Vorbereitung auf Level 3 (Training/Test-Trennung) | Mittel |

### Vorgenommene Änderungen

- **teachingDialogues2 überarbeitet:** Klassifikations-Wiederholung entfernt, stattdessen Level-2-spezifischer Fokus (Anwendung eines fertigen Baums, neues Merkmal Aktenkoffer, Ja-/Nein-Pfeil-Mechanismus)
- **Viktor-Portrait korrigiert:** `portrait: 'player'` → `portrait: 'node'` (Viktor ist ein NPC, kein Spieler)
- **{NAME}-Placeholder entfernt aus Viktor-Dialog** (Viktor ist ein NPC und spricht nicht den Spieler an)
- **treeStandard2 fachlich korrigiert:** `leaf_v3` (Hut=Ja, Mantel=Nein, Bart=Nein) von `'verdächtig'` auf `'unverdächtig'` geändert, sodass die Bart-Frage tatsächlich differenziert. Kommentar mit Erklärung ergänzt. Datenkonsistenz mit `suspects2` geprüft und bestätigt.
- **Quiz q5 hinzugefügt:** Warum Training- und Testdaten nicht identisch sein dürfen (Brücke zu Level 3)

---

## Datei: `level3Data.ts`

### Gefundene Probleme

| # | Problem | Schwere |
|---|---------|---------|
| 1 | `teachingDialogues3`: Gini-Index und Entropie genannt – zu fortgeschritten für Klasse 9 Gemeinschaftsschule | Hoch |
| 2 | Player-Speaker hardcoded als "Tim" statt `{NAME}` | Mittel |
| 3 | Fehlendes Quiz-Item zur Attributauswahl (Lernziel: welches Merkmal kommt an die Wurzel?) | Mittel |

### Vorgenommene Änderungen

- **Gini-Index/Entropie-Dialog ersetzt:** Durch allgemeinverständliche Erklärung ("Wähle das Merkmal, das die Gruppen am besten trennt") ohne Fachformel; zwei separate Dialogzeilen statt einer überlangen
- **Tim → {NAME}:** Player-Speaker durch generische Platzhaltervariable ersetzt
- **Quiz q5 hinzugefügt:** "Welches Merkmal wählt man sinnvollerweise als Wurzel?" – prüft direktes Lernziel der Attributauswahl

---

## Datei: `level4Data.ts`

### Gefundene Probleme

| # | Problem | Schwere |
|---|---------|---------|
| 1 | Player-Speaker hardcoded als "Tim" statt `{NAME}` | Mittel |
| 2 | Sherlock-Analogie: kulturell weniger nahe für 14-jährige Saarländer (nicht falsch, aber weniger wirksam) | Gering |
| 3 | Verbindung Training/Test-Split → Overfitting nicht explizit im Dialog hergestellt | Mittel |
| 4 | Underfitting (Gegenbegriff) fehlt vollständig – Lehrplan-Anforderung für Balance-Verständnis | Mittel |
| 5 | Dialog-Zeile zu "Pruning" in q4-Erklärung: "Regularisierung" ist zu fortgeschritten | Gering |

### Vorgenommene Änderungen

- **Tim → {NAME}:** Player-Speaker durch generische Platzhaltervariable ersetzt
- **Sherlock-Analogie ersetzt:** Durch altersnahe Prüfungs-Analogie ("Du lernst nur die alten Aufgaben auswendig...") – direkter verständlich für 14-15-Jährige
- **Training/Test-Split explizit eingebunden:** Zwei neue Dialogzeilen verbinden Overfitting mit dem bereits bekannten Split-Konzept aus Level 3
- **Quiz q5 hinzugefügt:** Underfitting als Gegenbegriff mit Erklärung ("Ziel ist die Balance")
- **q4-Erklärung bereinigt:** "Regularisierung anwenden" entfernt (zu technisch für Klasse 9)

---

## Datei: `level5Data.ts`

### Gefundene Probleme

| # | Problem | Schwere |
|---|---------|---------|
| 1 | Player-Speaker hardcoded als "Tim" statt `{NAME}` | Mittel |
| 2 | `finalSpeechDialogues` Zeile 3: 134 Zeichen (deutlich über Limit von 120) | Mittel |
| 3 | `finalSpeechDialogues` Zeile 2: 119 Zeichen (grenzwertig) | Gering |
| 4 | Ethik-Aussagen: Fairness-Metrik-Konzept fehlt (KI kann insgesamt gut, aber für eine Gruppe schlecht sein) | Mittel |
| 5 | Quiz: Keine Frage zu konkreten Maßnahmen gegen Bias (handlungsorientiert) | Mittel |

### Vorgenommene Änderungen

- **Tim → {NAME}:** Player-Speaker durch generische Platzhaltervariable ersetzt
- **finalSpeech Zeile 3 verkürzt:** 134 Zeichen → 87 Zeichen ("Ihr seid die Gestalter von morgen. Setzt KI fair, transparent und zum Wohl aller ein!")
- **finalSpeech Zeile 2 gesplittet:** In zwei eigenständige Zeilen aufgeteilt (beide <110 Zeichen)
- **Ethik-Aussage e5 hinzugefügt:** "Eine KI, die bei einer Gruppe 80% und bei einer anderen 40% hat, ist fair." (Antwort: falsch) – prüft Fairness-Metrik-Verständnis
- **Quiz q5 hinzugefügt:** Konkrete Maßnahmen gegen Datenbias – handlungsorientiert, direkt lehrplanrelevant
- **Quiz q4-Erklärung aktualisiert:** EU AI Act mit Jahreszahl 2024 ergänzt (aktueller Lehrplanbezug)

---

## Datei: `chatbotData.ts`

### Gefundene Probleme

| # | Problem | Schwere |
|---|---------|---------|
| 1 | Dateikommentar: "für Level 1" – irreführend, da Datei alle Level bedient | Gering |
| 2 | Greeting/Danke-Antworten: "Agent X" – inkonsistent mit Spielname/Charakternamen | Mittel |
| 3 | Fehlende Einträge: Training/Testdaten, Genauigkeit/Accuracy, Bias, Underfitting | Hoch |
| 4 | Overfitting-Eintrag: Keywords zu eingeschränkt ("overfitting, überanpassung, zu viele") | Gering |

### Vorgenommene Änderungen

- **Dateikommentar korrigiert:** "für Level 1" → "für alle Level"
- **"Agent X" entfernt:** Beide Vorkommen durch generische Anrede ersetzt ("Hallo!" / "Weiter so — du machst das klasse!")
- **5 neue ChatEntry-Objekte hinzugefügt:**
  - `overfitting/auswendig/zu komplex` – mit followUp zu Underfitting
  - `underfitting/zu einfach/zu flach` – Gegenbegriff Overfitting
  - `genauigkeit/accuracy/prozent/trefferquote` – mit Formel-Beispiel
  - `training/trainingsdaten/lernen/trainingsset` – mit followUp zu Testdaten
  - `test/testdaten/testset/split/80/20` – erklärt 80/20-Split
  - `bias/voreingenommenheit/diskriminierung/unfair/ungerecht` – mit Level-5-Verweis
- **Overfitting-Keywords erweitert:** `auswendig`, `zu komplex` ergänzt

---

## Pacing-Einschätzung (45 Minuten pro Level)

| Level | Dialoge | Quiz-Fragen | Puzzle-Aktivitäten | Einschätzung |
|-------|---------|-------------|-------------------|--------------|
| Level 1 | 13 Zeilen (war 11) | 9 (war 8) | Verdächtige klassifizieren (3-5) | ~40-45 Min. |
| Level 2 | 10 Zeilen | 5 (war 4) | 3-7 Verdächtige je Schwierigkeitsgrad | ~40-45 Min. |
| Level 3 | 11 Zeilen (war 10) | 5 (war 4) | Daten sortieren + Baum bauen | ~45 Min. |
| Level 4 | 11 Zeilen (war 7) | 5 (war 4) | Szenarien analysieren (4) | ~40-45 Min. |
| Level 5 | 12 Zeilen (war 11) | 5 (war 4) | Bias-Analyse + Ethik-Bewertung | ~45 Min. |

---

## Fachliche Korrektheitsprüfung

### Fachbegriffe (Lehrplan-Anforderung)

| Begriff | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|---------|---------|---------|---------|---------|---------|
| Wurzel | Eingeführt | Angewandt | – | – | – |
| Knoten | Eingeführt | Angewandt | – | – | – |
| Kante | Eingeführt | Angewandt | – | – | – |
| Blatt | Eingeführt | Angewandt | – | – | – |
| Klassifikation | Eingeführt | Vertieft | Angewandt | – | – |
| Training/Test-Split | – | Vorbereitet (neu) | Eingeführt | Vertieft | – |
| Overfitting | – | – | Erwähnt | Eingeführt + Vertieft | – |
| Underfitting | – | – | – | Eingeführt (neu) | – |
| Bias | – | – | – | – | Eingeführt + Vertieft |
| Genauigkeit/Accuracy | – | – | – | Eingeführt | Angewandt |

### Baum-Daten-Konsistenzprüfung

- **Level 1 treeBasic:** Korrekt. Hut=Ja,Mantel=Ja→verdächtig; Hut=Ja,Mantel=Nein→unverdächtig; Hut=Nein→unverdächtig. Alle 6 Verdächtigen korrekt klassifiziert.
- **Level 1 treeStandard:** Korrekt. 3 Merkmale, Lücke im Bart-Knoten pädagogisch sinnvoll.
- **Level 1 treeExperten:** Korrekt. Absichtlicher Fehler im Brille-Zweig (leaf_v_wrong) klar dokumentiert.
- **Level 2 treeBasis2:** Korrekt. Viktor(v), Rosa(u), Otto(v) korrekt klassifiziert.
- **Level 2 treeStandard2 (KORRIGIERT):** War fachlich falsch (Bart-Frage ohne Wirkung). Jetzt: Hut=Ja,Mantel=Nein,Bart=Nein→unverdächtig. Alle 5 Suspects geprüft: Viktor(v), Rosa(u), Otto(v), Lisa(u), Max(v). Alle korrekt.
- **Level 2 treeExperten2:** Korrekt. 4 Merkmale, alle 7 Suspects geprüft und konsistent.
- **Level 3 allSuspects3:** Korrekt. Alle hat=true Einträge sind verdächtig, alle hat=false sind unverdächtig – saubere Trennbarkeit durch ein Merkmal, pädagogisch sinnvoll für erste eigene Baum-Erfahrung.
- **Level 4 treeProfiles:** Korrekt. Baum A (100%/58%) = Overfitting; Baum B (85%/82%) = gut generalisiert. Werte realistisch und lehrreich.
- **Level 5 biasDataset:** Korrekt. 18 X-Einträge (12 verdächtig = 67%), 2 Y-Einträge (50%). Unterschied demonstriert Bias überzeugend.

---

## Wiederholungen zwischen Leveln

| Wiederholung | Gefunden | Behoben |
|---|---|---|
| Klassifikations-Definition Level 1 → Level 2 wortgetreu | Ja | Ja (Level 2 Dialog neu fokussiert) |
| "Blatt = Ergebnis" in Level 1 und Level 2 | Minimale Überschneidung | Behalten (sinnvolle Wiederholung zur Festigung) |
| Trainingsdaten-Definition Level 3 → Level 4 | Nein | – |

---

## Schwierigkeitsprogression

| Level | Aufgabe | Schwierigkeit | Kognitive Stufe |
|-------|---------|---------------|-----------------|
| 1 | Begriffe lernen + fertigen Baum verfolgen | Einfach | Erinnern / Verstehen |
| 2 | Fertigen Baum auf neue Daten anwenden | Mittel | Anwenden |
| 3 | Eigenen Baum aus Trainingsdaten bauen | Mittel-Schwer | Analysieren / Erschaffen |
| 4 | Overfitting erkennen + Genauigkeit bewerten | Schwer | Analysieren / Bewerten |
| 5 | Bias erkennen + ethisch reflektieren | Komplex | Bewerten / Schlussfolgern |

Progression ist konsistent und folgt Blooms Taxonomie.

---

## Offene Empfehlungen (nicht in diesem Durchlauf umsetzbar)

1. **Interaktionszonen-Koordinaten prüfen:** Die x/y-Werte in allen Leveln wurden nicht gegen das tatsächliche Spielwelt-Layout validiert. Falls Objekte sich überlappen oder unzugänglich sind, sollte dies in einer separaten UI-Review geprüft werden.
2. **{NAME}-Placeholder-System:** Mehrere Levels verwenden noch hardcoded "Tim" an Stellen, die in diesem Review korrigiert wurden. Es sollte ein globales Find & Replace über alle Spielkomponenten durchgeführt werden.
3. **Zeitlimit Level 2 Experten (120 Sekunden):** 120 Sekunden für 7 Verdächtige mit 4-Merkmal-Baum kann für schwächere Schüler sehr knapp sein. Empfehlung: 180 Sekunden oder differenziertes Zeitlimit nach Schwierigkeitsgrad.
4. **Level 3 Datensatz:** Alle hat=true Einträge sind verdächtig – zu offensichtliches Muster. Für stärkere Schüler könnte ein gemischteres Dataset den Lerneffekt erhöhen. Für Klasse 9 Gemeinschaftsschule ist die aktuelle Variante jedoch didaktisch angemessen.
5. **Chatbot-Mehrsprachigkeit:** Derzeit nur Deutsch. Saarland hat Grenzlage zu Frankreich/Luxemburg – optional könnte ein Hinweis auf Bias durch Sprachdaten hinzugefügt werden (thematisch passend zu Level 5).
