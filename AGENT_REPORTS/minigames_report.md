# Mini-Games Agent Report
**Datum:** 2026-03-04
**Agent:** Game Designer (Gamification & Lern-Spiele)

---

## Zusammenfassung

Es wurden 4 neue Mini-Spiel-Komponenten erstellt und in das bestehende Lern-RPG-Projekt integriert. Alle Komponenten folgen dem Comic-Stil-Design des Projekts und verwenden ausschliesslich bestehende Technologien (React, TypeScript, Tailwind CSS) ohne neue NPM-Pakete. Der TypeScript-Build ist fehlerfrei.

---

## Erstellte Dateien

### 1. `src/components/game/SortingGame.tsx`
**Typ:** Kategorisierungs-Spiel (simuliertes Drag-and-Drop mit onClick/State)

**Spielmechanik:**
- Spieler klickt zuerst ein Element aus einem Pool unzugeordneter Items an
- Anschliessend klickt er die Ziel-Kategorie (Trainingsdaten / Testdaten)
- Sofort-Feedback: Grüner Rahmen = richtig, roter Rahmen = falsch
- Tipp-Texte bei falscher Zuordnung
- Elemente können durch Klick wieder aus der Kategorie entfernt werden

**Inhalt:** 8 Elemente rund um Trainings- vs. Testdaten (Beispielverdächtige, abstrakte Datensatz-Konzepte)

**XP-System:** 0–60 XP proportional zur Genauigkeit

**Design-Merkmale:**
- Header: Rot (#FF3B3F) mit Polka-Dot-Hintergrund
- Kategorie-Zonen mit gestricheltem Rahmen in Kategoriefarbe
- Comic-Schatten: shadow-[2px_2px_0_#111], shadow-[3px_3px_0_#111]

---

### 2. `src/components/game/FillInTheBlank.tsx`
**Typ:** Lückentext-Spiel mit Button-Auswahl

**Spielmechanik:**
- 6 Sätze nacheinander, jeder mit einer Lücke (inline hervorgehoben)
- Schüler wählt aus 3 Buttons die richtige Antwort
- Sofort-Feedback nach Klick: Grün = richtig, Rot = falsch
- Erklärungstext erscheint nach jeder Antwort
- XP-Anzeige im Feedback-Bereich

**Satz-Inhalt:**
1. Wurzel = Startpunkt des Baums
2. Blätter = Klassifikationsergebnis
3. Knoten = Verzweigungspunkt mit Frage
4. Kanten = Verbindungen (Ja/Nein-Pfad)
5. Klassifikation = Merkmalsbasierte Einordnung
6. Trainingsdatensatz = Lerndaten (schwieriger)

**XP-System:** 15 XP pro korrekter Antwort (Satz 6 = 20 XP), max. 90 XP

**Design-Merkmale:**
- Header: Blau (#0066FF) mit Fortschrittsbalken in Gelb
- Lücke als farbig hinterlegter Inline-Span (Gelb → Blau wenn gewählt → Grün/Rot)
- Progress-Dots im Footer

---

### 3. `src/components/game/MatchingPairs.tsx`
**Typ:** Memory/Matching-Spiel mit Timer-Bonus

**Spielmechanik:**
- 6 Begriffspaare (Entscheidungsbaum-Terminologie)
- Linke Spalte: farbige Begriffskarten, rechte Spalte: shuffled Erklärungskarten
- Klick auf Begriff → Klick auf passende Erklärung
- Falsches Paar: rote Markierung + automatisches Zurücksetzen nach 900ms
- Timer: 60 Sekunden für Bonus-XP, startet beim ersten Klick

**Begriffe:**
- Wurzel, Knoten, Blatt, Kante, Klassifikation, Merkmal

**XP-System:**
- Basis: 60 XP
- Zeitbonus: +30 XP wenn Timer noch läuft
- Fehler-Abzug: -3 XP pro Fehler
- Minimum: 10 XP

**Design-Merkmale:**
- Header: Lila (#9C27B0) mit Timer-Balken (grün → orange → rot)
- Jeder Begriff hat eine einzigartige Farbe
- Fehler-Zähler als Badge im Header

---

### 4. `src/components/game/CodeTracer.tsx`
**Typ:** Pseudo-Code Tracer (algorithmisches Denken)

**Spielmechanik:**
- Zeigt einen Pseudo-Code-Editor (dunkler Theme, syntax-highlighted)
- 3 Aufgaben: Objekt wird angezeigt (Name, Merkmale), Schüler muss den Algorithmus "tracer"
- Bei jeder Bedingungszeile: JA/NEIN-Auswahl
- Falsche Wahl: rote Markierung, automatischer Reset nach 1200ms (nochmal versuchen)
- Richtige Wahl: aktive Zeile wandert weiter, grüner Pfad bleibt sichtbar
- Am Ende: Klassifikationsergebnis wird im Code-Editor angezeigt

**Pseudo-Code-Inhalt:**
```
FUNKTION klassifiziere(person):
  WENN person.hat == JA:
    WENN person.mantel == JA:
      GEBE ZURÜCK "verdächtig"
    SONST:
      GEBE ZURÜCK "verdächtig" (Bart?)
  SONST:
    GEBE ZURÜCK "unverdächtig"
ENDE
```

**Test-Objekte:**
1. Gustav G. (Hut: JA, Mantel: JA) → verdächtig
2. Maria M. (Hut: NEIN) → unverdächtig
3. Boris B. (Hut: JA, Mantel: NEIN) → verdächtig

**XP-System:** 20 XP pro Objekt, max. 60 XP

**Design-Merkmale:**
- Dunkler Code-Editor: Hintergrund #1E1E2E (Catppuccin-Theme)
- Aktive Zeile: gelber Pfeil ► + goldene Hervorhebung
- Besuchte Zeilen: grüne Tönungen
- Syntax-Coloring: Keywords in Lila, Conditions in Blau, Results in Rot/Grün

---

## Geänderte Dateien

### `src/lib/game/level1Data.ts`
- Hinzugefügt: Integrations-Kommentarblock mit Import-Pfaden, Usage-Beispielen und XP-Werten für alle 4 neuen Komponenten

---

## Design-Konsistenz

Alle Komponenten verwenden:
| Element | Wert |
|---------|------|
| Comic-Border | `border-[4px] border-[#111]` (Header), `border-[2.5px] border-[#111]` (Buttons) |
| Comic-Shadow | `shadow-[8px_8px_0_#111]` (Hauptcontainer), `shadow-[3px_3px_0_#111]` (Karten) |
| Gelb | `#FFE135` |
| Rot | `#FF3B3F` |
| Blau | `#0066FF` |
| Grün | `#00C853` |
| Titel-Font | `font-[family-name:var(--font-bangers)]` |
| Text-Font | `font-[family-name:var(--font-comic)]` |
| Max-Breite | `max-w-2xl` / `max-w-3xl` je nach Layout |
| Overlay | `fixed inset-0 z-50`, Hintergrund `rgba(0,0,0,0.8)` |

---

## Integration durch andere Agents

```tsx
// Beispiel: Einbindung in eine Level-Page
import { SortingGame } from '@/components/game/SortingGame'
import { FillInTheBlank } from '@/components/game/FillInTheBlank'
import { MatchingPairs } from '@/components/game/MatchingPairs'
import { CodeTracer } from '@/components/game/CodeTracer'

// Alle haben dieselbe Prop-Schnittstelle:
<SortingGame onComplete={(xp) => handleXpGain(xp)} />
<FillInTheBlank onComplete={(xp) => handleXpGain(xp)} />
<MatchingPairs onComplete={(xp) => handleXpGain(xp)} />
<CodeTracer onComplete={(xp) => handleXpGain(xp)} />
```

---

## TypeScript Build

```
npx tsc --noEmit
```
Ergebnis: **0 Fehler, 0 Warnungen** — Build ist fehlerfrei.

---

## XP-Übersicht

| Komponente | Min XP | Max XP | Bemerkung |
|------------|--------|--------|-----------|
| SortingGame | 0 | 60 | Proportional zur Genauigkeit |
| FillInTheBlank | 0 | 90 | 15 XP pro richtige Antwort |
| MatchingPairs | 10 | 90 | Basis + Zeitbonus - Fehler |
| CodeTracer | 0 | 60 | 20 XP pro Objekt (3 Objekte) |
