# Security & DSGVO Audit Report — Team MKS Lern-RPG

**Datum:** 2026-03-04
**Auditor:** Claude Code (Security & DSGVO Audit)
**Anwendung:** Next.js Lern-RPG (Schulklasse 9, 14–15 Jahre, Deutschland)
**Scope:** src/middleware.ts, alle API-Routes, Auth-Seiten, Dashboard, Supabase-Clients, Hooks, Components, next.config.ts, .env

---

## Executive Summary

Die Anwendung hat eine solide Grundstruktur mit Zod-Validation auf API-Seite, Supabase RLS als zweiter Sicherheitsschicht und korrektem Server-seitigem Auth-Check in den API-Routes. Es wurden jedoch mehrere Schwachstellen unterschiedlicher Kritikalitaet identifiziert — davon eine KRITISCHE (Rollenselbstzuweisung bei Registrierung) und eine HOHE (Open Redirect im Auth-Callback). Drei direkte Code-Fixes wurden bereits angewendet.

---

## Gefundene Schwachstellen

### KRITISCH

#### SEC-001: Selbstzuweisung der Lehrer-Rolle bei Registrierung
**Datei:** `src/app/auth/register/page.tsx`
**Status:** Nicht behoben (erfordert manuelle Arbeit, da Backend-Logik in Supabase)

Der `role`-Wert (`student` / `teacher`) wird vollstaendig client-seitig ausgewaehlt und unvalidiert als `user_metadata.role` an `supabase.auth.signUp()` uebergeben:

```typescript
// register/page.tsx Zeile 45-55
const { error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName.trim(),
      role,                            // <-- Kann jeder auf 'teacher' setzen!
      class_code: role === 'student' ? classCode.trim().toUpperCase() : null,
    },
  },
})
```

**Risiko:** Jeder Benutzer kann sich als `teacher` registrieren und dadurch Zugriff auf das Teacher-Dashboard mit den Daten ALLER Schueler erhalten.

**Abhilfe (manuell umzusetzen):**
1. In Supabase: Einen Database Trigger auf `auth.users` anlegen, der `user_metadata.role` ignoriert und stattdessen die `role` in der `profiles`-Tabelle immer auf `student` setzt.
2. Lehrer-Rollen nur durch einen Administrator (oder existierenden Lehrer) in Supabase Studio vergeben.
3. Alternativ: Registrierung fuer Lehrer komplett deaktivieren — Lehrer-Accounts nur durch den Schuladmin anlegen.

Beispiel Supabase Trigger (in Supabase SQL Editor ausfuehren):
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, class_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'student',  -- Immer 'student', niemals aus Metadata uebernehmen
    UPPER(TRIM(NEW.raw_user_meta_data->>'class_code'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### SEC-002: .env.local mit echten Credentials in Arbeitsverzeichnis
**Datei:** `.env.local`
**Status:** Risiko-Information

Die Datei `.env.local` enthaelt einen echten Supabase-Projekt-URL und einen JWT-Anon-Key. Der `.gitignore` schliesst `.env*.local` korrekt aus, aber:

- Der Anon-Key ist ein JWT und oeffentlich sichtbar, wenn er versehentlich committed wird
- Regelmassig pruefen: `git log --all --full-history -- .env.local` und `git status`
- Der Anon-Key hat eine Ablaufzeit von ~30 Jahren (iat: 2026, exp: 2088) — bei Kompromittierung muss er in Supabase rotiert werden

---

### HOCH

#### SEC-003: Open Redirect im Auth-Callback (BEHOBEN)
**Datei:** `src/app/auth/callback/route.ts`
**Status:** Fix angewendet

**Urspruenglicher Code:**
```typescript
const next = searchParams.get('next') ?? '/game'
return NextResponse.redirect(`${origin}${next}`)
```

Der `next`-Parameter wurde ohne Validierung als Redirect-Ziel verwendet. Ein Angreifer konnte z.B. einen Link wie `/auth/callback?code=valid&next=//evil.com` erstellen und Nutzer nach dem Login auf externe Seiten weiterleiten (Phishing).

**Angewendeter Fix:**
```typescript
const ALLOWED_REDIRECT_PATHS = ['/game', '/dashboard', '/auth/login']

function getSafeRedirectPath(next: string | null): string {
  if (!next) return '/game'
  if (next.startsWith('/') && ALLOWED_REDIRECT_PATHS.includes(next)) {
    return next
  }
  return '/game'
}
```

---

#### SEC-004: Fehlende Validierung des `phase`-Feldes (BEHOBEN)
**Datei:** `src/app/api/progress/save/route.ts`
**Status:** Fix angewendet

**Urspruenglicher Code:**
```typescript
phase: z.string(),  // Akzeptiert beliebige Strings — inklusive sehr langer Strings
```

Ein authentifizierter Angreifer konnte beliebige Strings als `phase` speichern (z.B. SQL-artige Sequenzen, sehr lange Strings, Script-Tags). Da Supabase parametrisierte Queries verwendet, ist SQL-Injection nicht moeglich, aber der Angriff erlaubt das Speichern von Schrott-Daten in der DB.

**Angewendeter Fix:** `phase` ist jetzt ein `z.enum()` mit den 10 bekannten Phasen.

---

#### SEC-005: Fehlende Grenzen bei numerischen Feldern und Strings (BEHOBEN)
**Dateien:** `src/app/api/progress/save/route.ts`, `src/app/api/progress/scores/route.ts`
**Status:** Fix angewendet

Folgende Felder hatten keine Obergrenzen:
- `xp`: konnte auf beliebig hohe Werte gesetzt werden (Score-Manipulation)
- `score`, `max_score`: keine Maximalwerte
- `attempt_number`: keine Obergrenze
- `time_spent_seconds`: keine Obergrenze (moeglicherweise grosse Werte in DB)
- `answers_json`: keine Groessenbegrenzung (DoS durch grosse Payloads)
- `concept` in LearningAnalytics: keine Laengenbegrenzung
- `completed_zones`: kein Array-Groessenlimit

**Angewendeter Fix:** Realistische Obergrenzen fuer alle Felder hinzugefuegt.

---

#### SEC-006: Kein Rate Limiting auf Auth- und API-Endpunkten
**Dateien:** `src/app/api/progress/save/route.ts`, `src/app/api/progress/scores/route.ts`, Login/Register-Seiten
**Status:** Nicht behoben (erfordert Infrastruktur-Massnahme)

Es gibt kein Rate Limiting auf:
- `/api/progress/save` — ein Angreifer kann tausende Requests senden
- `/api/progress/scores` — massenhaftes Speichern von Analytics moeglich
- Login-Seite — Brute-Force auf Passwoerter

**Abhilfe:**
- Supabase Auth hat eingebautes Rate Limiting fuer Auth-Endpoints (konfigurierbar in Supabase Dashboard unter Auth > Rate Limits)
- Fuer API-Routes: Vercel Edge Rate Limiting oder `@upstash/ratelimit` mit Redis implementieren
- Kurzfristig: In Supabase Dashboard Auth-Rate-Limits sicherstellen (Standard: 3 E-Mails/Stunde, 30 Login-Versuche/Stunde)

---

#### SEC-007: Dashboard-Seite laedt Schueler-Daten direkt client-seitig ohne explizite Class-Filterung
**Datei:** `src/app/dashboard/page.tsx` (Zeile 118-123)
**Status:** Nicht behoben (abhaengig von Supabase RLS)

```typescript
const { data: studentData, error: studentError } = await supabase
  .from('teacher_dashboard_view')
  .select('*')
  // Kein .eq('teacher_id', user.id) Filter!
```

Der Query hat keinen expliziten Filter auf `teacher_id`. Die Sicherheit haengt vollstaendig davon ab, dass die RLS-Policy auf der `teacher_dashboard_view` korrekt konfiguriert ist.

**Kritisch zu pruefen:** Stellt die RLS-Policy auf `teacher_dashboard_view` sicher, dass ein Lehrer nur die Schueler SEINER Klassen sieht? Falls die View keine RLS hat oder falsch konfiguriert ist, kann jeder Lehrer die Daten ALLER Schueler sehen.

**Abhilfe:**
```sql
-- Beispiel RLS Policy fuer teacher_dashboard_view
CREATE POLICY "teacher_sees_own_students" ON teacher_dashboard_view
  FOR SELECT USING (
    class_code IN (
      SELECT access_code FROM classes WHERE teacher_id = auth.uid()
    )
  );
```

---

### MITTEL

#### SEC-008: Fehlende Content-Security-Policy (BEHOBEN - Teilweise)
**Datei:** `next.config.ts`
**Status:** Fix angewendet (Basis-CSP)

Die urspruengliche Konfiguration hatte keine CSP, keine Permissions-Policy und keine X-Permitted-Cross-Domain-Policies.

**Angewendeter Fix:** CSP, Permissions-Policy (deaktiviert Camera, Mikrofon, Geolocation, Payment, USB) und X-Permitted-Cross-Domain-Policies hinzugefuegt.

**Hinweis:** Die CSP enthaelt `unsafe-inline` und `unsafe-eval` fuer Scripts, da Next.js diese benoetigt. In einer Produktionsumgebung sollte auf Nonce-basierte CSP umgestellt werden — das erfordert jedoch Aenderungen am Next.js Build-Prozess.

---

#### SEC-009: `Referrer-Policy` war zu locker gesetzt (BEHOBEN)
**Datei:** `next.config.ts`
**Status:** Fix angewendet

`origin-when-cross-origin` sendet den vollstaendigen Pfad-Referrer innerhalb derselben Origin. Da die App Schueler-Emails und -Fortschritte enthaelt, wurde auf `strict-origin-when-cross-origin` geaendert, das nur den Origin (ohne Pfad) an externe Seiten sendet.

---

#### SEC-010: Teacher-Role-Check in Dashboard ist nur als Client-Side Defense-in-Depth
**Datei:** `src/app/dashboard/page.tsx` (Zeile 96-104)
**Status:** Akzeptabel (Middleware schuetzt bereits server-seitig)

Der Client-Side-Check `if (profile?.role !== 'teacher') { window.location.href = '/game' }` ist redundant, da `middleware.ts` den Zugriff auf `/dashboard` bereits server-seitig auf Lehrer beschraenkt. Dies ist akzeptable Defense-in-Depth. Kein Handlungsbedarf.

---

#### SEC-011: `createClass` verwendet `window.prompt()` — kein Input-Sanitizing
**Datei:** `src/app/dashboard/page.tsx` (Zeile 158-169)
**Status:** Niedrige Prioritaet

`className` aus `prompt()` wird direkt in die DB geschrieben und spaeter via React-JSX (`{cls.class_name}`) gerendert. React escaped automatisch, daher kein XSS-Risiko. Allerdings gibt es keine Laengenbegrenzung auf dem Client und kein Server-seitiges Validation-Layer fuer den Klassenname.

**Abhilfe (optional):** `class_name` server-seitig auf max. 100 Zeichen begrenzen (Supabase CHECK-Constraint oder dedicated API-Route mit Zod).

---

#### SEC-012: Dashboard laedt individuelle Schueler-Daten ohne RLS-Verifikation
**Datei:** `src/app/dashboard/page.tsx` (Zeile 136-146)
**Status:** Abhaengig von Supabase RLS

```typescript
supabase.from('game_progress').select('*').eq('user_id', row.student_id ?? '')
supabase.from('activity_scores').select('*').eq('user_id', row.student_id ?? '')
```

Ein Lehrer koennte theoretisch eine beliebige `student_id` uebergeben und Daten anderer Schueler laden, falls die RLS-Policies nicht korrekt sind. **Zu pruefen:** RLS auf `game_progress` und `activity_scores` muss sicherstellen, dass nur der Schueler selbst oder sein Lehrer (via Klassen-Relation) lesen kann.

---

### NIEDRIG

#### SEC-013: Passwort-Mindestaengen-Policy zu schwach
**Datei:** `src/app/auth/register/page.tsx`
**Status:** Empfehlung

Mindestpasswortlaenge ist 6 Zeichen. Fuer eine Schul-App mit Minderjaerigen-Daten sollten mindestens 8 Zeichen gefordert werden, idealer mit Komplexitaetsanforderungen.

---

#### SEC-014: Console.error gibt Supabase-Fehlerdetails aus
**Dateien:** Mehrere API-Routes
**Status:** Informationell

`console.error('Save progress error:', error)` loggt Supabase-Fehlerobjekte. In Produktion sollte nur anonymisiertes Logging stattfinden (z.B. via Sentry), da Fehlerobjekte interne DB-Schemainfos enthalten koennen. Der Fehler wird nicht an den Client zurueckgegeben (korrekt), aber serverseitige Logs sollten ebenfalls sensibel behandelt werden.

---

#### SEC-015: Keine Bestaetigungsseite vor CSV-Export
**Datei:** `src/app/dashboard/page.tsx`
**Status:** Informationell / DSGVO-relevant

Der CSV-Export enthaelt Schueler-Namen, E-Mails, Quiz-Noten und Aktivitaetsdaten ohne Benutzerbestaetigung oder Download-Logging.

---

## Was bereits gut ist

- **Auth-Checks in allen API-Routes korrekt:** Jede API-Route ruft `supabase.auth.getUser()` server-seitig auf (nicht nur `getSession()`).
- **Zod-Validation vorhanden:** Alle POST-Endpoints verwenden Zod-Schemas mit `safeParse()`.
- **Middleware schuetzt Dashboard korrekt:** Middleware prueft sowohl Authentifizierung als auch die Teacher-Rolle fuer `/dashboard/*`.
- **Keine SQL-Injection moeglich:** Supabase verwendet parametrisierte Queries fuer alle DB-Operationen.
- **XSS nicht moeglich durch Supabase-Outputs:** Alle Datenbankwerte werden durch React-JSX-Rendering automatisch escaped.
- **HSTS korrekt konfiguriert:** 2 Jahre, includeSubDomains, preload.
- **X-Frame-Options DENY:** Kein Clickjacking moeglich.
- **Session-Management korrekt:** Supabase `@supabase/ssr` mit korrekter Cookie-Verwaltung in Middleware und Server-Client.
- **localStorage-Fallback fuer Gaeste korrekt implementiert:** Kein Datenleck zwischen Gastmodus und authentifiziertem Modus.
- **`getUser()` statt `getSession()`:** Die App verwendet durchgehend `getUser()` (serverseitig verifiziert) anstelle von `getSession()` (nur JWT-Decode, unsicher).
- **Fehlerbehandlung:** Alle API-Routes haben try-catch und geben keine internen Fehlerdetails an den Client zurueck.
- **.gitignore korrekt:** `.env*.local` ist im gitignore.

---

## DSGVO-Checkliste

| Punkt | Status | Details |
|-------|--------|---------|
| Minderjaerigen-Schutz (Art. 8 DSGVO) | **NICHT ERFUELLT** | Keine Altersverifikation, keine Eltern-Einwilligung bei Registrierung. Schueler unter 16 Jahren benoetigen in Deutschland elterliche Einwilligung fuer die Datenverarbeitung. |
| Datenschutzerklaerung (Art. 13 DSGVO) | **FEHLT** | Keine Datenschutzerklaerung in der App gefunden. Pflichtinhalt: Verantwortlicher, Zweck, Rechtsgrundlage, Speicherdauer, Betroffenenrechte. |
| Einwilligungsmanagement | **NICHT ERFUELLT** | Keine Cookie-/Einwilligungs-Banner, keine Dokumentation der Einwilligung. |
| Datensparsamkeit (Art. 5 DSGVO) | **TEILWEISE** | `answers_json` speichert vollstaendige Antworten — pruefen ob das fuer den Lernzweck notwendig ist oder ob nur Scores reichen. `learning_analytics` speichert jede Interaktion. |
| Recht auf Loeschung (Art. 17 DSGVO) | **NICHT IMPLEMENTIERT** | Kein "Konto loeschen"-Button fuer Schueler oder Lehrer in der App. |
| Recht auf Auskunft (Art. 15 DSGVO) | **NICHT IMPLEMENTIERT** | Kein "Meine Daten herunterladen"-Feature fuer Schueler. |
| Datenuebertragbarkeit (Art. 20 DSGVO) | **NICHT IMPLEMENTIERT** | Kein Datenexport fuer eigene Daten (nur Lehrer kann CSV exportieren — fremde Daten!). |
| Verzeichnis von Verarbeitungstaetigkeiten (Art. 30 DSGVO) | **UNBEKANNT** | Muss ausserhalb der App gefuehrt werden (organisatorische Massnahme). |
| Auftragsverarbeitung (Art. 28 DSGVO) | **PRUEFEN** | Supabase (USA / EU-Region) als Auftragsverarbeiter: AVV-Vertrag mit Supabase notwendig. Sicherstellen dass Supabase-Projekt in `eu-central-1` (Frankfurt) betrieben wird. |
| Cookies DSGVO-konform | **TEILWEISE** | Supabase Auth-Cookies sind funktional notwendig (kein Consent erforderlich). Pruefen ob Supabase Analytics-Cookies setzt. |
| localStorage Gast-Modus | **GUT** | localStorage-Daten werden nicht an den Server uebertragen solange der Nutzer nicht eingeloggt ist. Datenschutzerklaerung sollte localStorage-Nutzung erwaehnen. |
| Speicherdauer | **NICHT DEFINIERT** | Keine automatische Loeschung von Lerndaten nach Schuljahresende definiert. |
| Pseudonymisierung/Anonymisierung | **NICHT UMGESETZT** | Schueler-Namen und E-Mails im Klartext in Teacher-Dashboard sichtbar. Fuer Analytics koennte Pseudonymisierung sinnvoll sein. |

---

## Was noch manuell getan werden muss

### Prioritaet 1 — Sicherheit (vor Go-Live)

1. **SEC-001 umsetzen:** Supabase-Trigger anlegen der `role` bei Registrierung immer auf `student` setzt. Lehrer-Accounts nur durch Admin anlegen.

2. **Supabase RLS pruefen und haerten:**
   - `teacher_dashboard_view`: RLS-Policy die Lehrer auf eigene Klassen beschraenkt
   - `game_progress`: Lehrer kann nur Schueler seiner Klassen lesen
   - `activity_scores`: gleiche Regel
   - `learning_analytics`: gleiche Regel
   - `classes`: Lehrer kann nur eigene Klassen sehen/aendern
   - In Supabase Dashboard unter Authentication > Policies pruefen

3. **Rate Limiting konfigurieren:**
   - Supabase Dashboard > Auth > Rate Limits pruefen (Login, Registrierung, E-Mail-Versand)
   - Fuer API-Routes: Vercel Edge Config oder `@upstash/ratelimit` implementieren

4. **Passwort-Policy verscharfen:**
   - Supabase Dashboard > Auth > Password Settings: Minimum 8 Zeichen
   - Frontend-Validation in register/page.tsx anpassen

### Prioritaet 2 — DSGVO (vor Go-Live)

5. **Datenschutzerklaerung erstellen** (Art. 13 DSGVO):
   - Verantwortliche Schule/Lehrkraft nennen
   - Datenarten auflisten: E-Mail, Name, Spielfortschritt, Quiz-Antworten, Lernanalytics
   - Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 a) oder berechtigtes Interesse (Bildung)
   - Speicherdauer: z.B. Loeschung nach Schuljahresende
   - Link im Footer aller Seiten

6. **Eltern-Einwilligung fuer Schueler unter 16:**
   - Entweder: Registrierung nur mit Bestaetigungs-Formular durch Erziehungsberechtigte
   - Oder: Nutzung nur im Rahmen des Schulvertrags (Schultraeger als Verantwortlicher)
   - Rechtliche Abstimmung mit Schulleitung/Datenschutzbeauftragtem erforderlich

7. **"Konto loeschen"-Funktion implementieren** (Art. 17 DSGVO):
   - API-Route `DELETE /api/account` mit kompletter Datenloeschschung
   - Supabase `auth.admin.deleteUser()` (benoetigt Service-Role-Key auf Server)
   - Cascading-Delete in DB sicherstellen (ON DELETE CASCADE auf allen Tabellen)

8. **AVV mit Supabase abschliessen:**
   - Supabase bietet DPA unter https://supabase.com/dpa
   - Sicherstellen dass Projekt in `eu-central-1` (Frankfurt) laeuft

### Prioritaet 3 — Verbesserungen

9. **CSP zu Nonce-basierter CSP migrieren** (entfernt `unsafe-inline`/`unsafe-eval`):
   - Next.js 14+ unterstuetzt CSP Nonces via Middleware
   - Dokumentation: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy

10. **Structured Logging / Sentry einrichten:**
    - `console.error` durch Sentry oder strukturiertes Logging ersetzen
    - Sicherstellen dass keine personenbezogenen Daten in Logs erscheinen

11. **CSV-Export DSGVO-konform gestalten:**
    - Download-Logging (wer hat wann exportiert)
    - Benutzerbestaetigung vor Export
    - Hinweis dass Export lokal gespeicherte Daten schuetzt

12. **`answers_json` Datensparsamkeit pruefen:**
    - Sind vollstaendige Schuelantworten fuer Lernanalytik notwendig?
    - Falls nicht: `answers_json` aus Schema entfernen

---

## Angewendete Code-Fixes (Zusammenfassung)

| Datei | Aenderung |
|-------|-----------|
| `next.config.ts` | Content-Security-Policy, Permissions-Policy, X-Permitted-Cross-Domain-Policies hinzugefuegt; Referrer-Policy auf `strict-origin-when-cross-origin` geaendert |
| `src/app/auth/callback/route.ts` | Open-Redirect-Fix: `next`-Parameter wird gegen Allowlist validiert |
| `src/app/api/progress/save/route.ts` | `phase` als `z.enum()` mit bekannten Werten; Obergrenzen fuer `xp`, `max_xp`, `completed_zones`; `player_name` mit `.trim().min(1)` |
| `src/app/api/progress/scores/route.ts` | Obergrenzen fuer `score`, `max_score`, `attempt_number`, `time_spent_seconds`; `answers_json` auf 50 Schluessel und 500 Zeichen begrenzt; `concept` mit Laengenbegrenzung |

Alle Aenderungen sind TypeScript-kompatibel und erfordern keinen Build-Eingriff.
