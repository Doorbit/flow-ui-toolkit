# Lösungskonzept: Überlappende Page-Tabs

**Datum:** 21.02.2026  
**Problem:** Bei vielen Seiten (10+) überlappen sich die Tabs in der PageNavigator-Leiste, wodurch der Overflow-Menü-Button (⋮) verdeckt wird  
**Betroffene Komponenten:** [`PageNavigator.tsx`](../src/components/PageNavigator/PageNavigator.tsx), [`PageTab.tsx`](../src/components/PageNavigator/PageTab.tsx)

---

## Problem-Beschreibung

### Visuelles Problem (Screenshot-Befund)
- **10+ Page-Tabs** laufen über die verfügbare Breite hinaus
- Tabs überlappen sich horizontal
- **Overflow-Menü-Button (⋮)** wird am rechten Rand verdeckt
- Scroll-Buttons (← →) der MUI Tabs sind zu klein/unauffällig
- User kann nicht auf alle Seitenaktionen zugreifen

### Technischer Hintergrund
```tsx
// Aktuelle Struktur in PageNavigator.tsx
<Tabs variant="scrollable" scrollButtons="auto">
  {visiblePages.map(page => <PageTab ... />)}
</Tabs>
{/* ⋮-Button NACH den Tabs → wird überdeckt */}
<IconButton onClick={handleMenuOpen}>
  <MoreVertIcon />
</IconButton>
```

**Root Cause:** Der ⋮-Button ist Teil des scrollbaren Bereichs, aber NICHT Teil der Tabs-Komponente → bei Overflow verdeckt.

---

## Lösungsoptionen

### ⭐ Option 1: ⋮-Button links fixieren (EMPFOHLEN)

**Konzept:** Overflow-Button aus scrollbarem Bereich herausnehmen und links NEBEN die Tabs setzen

**Layout:**
```
┌──────┬─────────────────────────────────────────┬──────┬────────┐
│  ⋮   │ [Tab1] [Tab2] ... [Tab10] ← →          │  +   │ Import │
└──────┴─────────────────────────────────────────┴──────┴────────┘
  fix      scrollable Tabs mit Scroll-Buttons      fix     fix
```

**Vorteile:**
- ✅ ⋮-Button **immer** sichtbar und erreichbar
- ✅ Tabs können vollständig scrollen
- ✅ Minimale Code-Änderung
- ✅ Konsistent mit Overflow-Menü-Pattern bei Elementkarten

**Nachteile:**
- ➖ ⋮-Button ist nicht mehr "bei den Tabs", sondern davor
- ➖ Ungewohnte Position (aber konsistent mit Elementkarten)

**Aufwand:** Niedrig (~30 Min)

---

### Option 2: Tabs mit max-width begrenzen

**Konzept:** Jeder Tab bekommt `max-width: 150px` mit Ellipsis bei Overflow

**Layout:**
```
[NEUE SEITE...] [ADRESSE E...] [U-WERT A...] ... [FRAGEKA...] ← → ⋮ +
```

**Vorteile:**
- ✅ Mehr Tabs gleichzeitig sichtbar
- ✅ ⋮ bleibt am rechten Rand erreichbar

**Nachteile:**
- ➖ Lange Seitennamen werden abgeschnitten
- ➖ Tooltip erforderlich für volle Namen
- ➖ Verschlechterte Lesbarkeit

**Aufwand:** Niedrig (~20 Min)

---

### Option 3: Zwei-Zeilen-Layout ab 8+ Tabs

**Konzept:** Tabs umbrechen in zweite Zeile bei Platzmangel

**Layout:**
```
Zeile 1: [Tab1] [Tab2] [Tab3] [Tab4] [Tab5]
Zeile 2: [Tab6] [Tab7] [Tab8] [Tab9] ⋮ + Import
```

**Vorteile:**
- ✅ Alle Tabs vollständig lesbar
- ✅ Kein Scrollen nötig

**Nachteile:**
- ➖ Doppelter vertikaler Platz (32px → 64px)
- ➖ Komplexere Responsive-Logik
- ➖ MUI Tabs unterstützt kein Wrapping nativ

**Aufwand:** Mittel (~2-3 Stunden, Custom-Layout nötig)

---

### Option 4: Sticky ⋮-Button mit z-index

**Konzept:** ⋮-Button rechts mit `position: sticky` und `z-index: 10`

**Layout:**
```
[Tab1] [Tab2] ... [Tab10] ← →         [⋮] [+]
                                      sticky
```

**Vorteile:**
- ✅ ⋮ bleibt rechts (gewohnte Position)
- ✅ Immer sichtbar durch sticky + z-index

**Nachteile:**
- ➖ Überlappt letzte Tabs visuell (kann verwirrend sein)
- ➖ CSS-Hack, nicht semantisch sauber

**Aufwand:** Niedrig (~30 Min)

---

## Empfehlung: Option 1 + Option 2 kombiniert

### Hybride Lösung

**Layout:**
```
┌──────┬────────────────────────────────────┬──────┬────────┐
│  ⋮   │ [Tab1] [Tab2 mit...] [Tab3] ← →   │  +   │ Import │
└──────┴────────────────────────────────────┴──────┴────────┘
  fix      max-width: 180px mit Ellipsis      fix     fix
```

**Implementierung:**

#### 1. PageNavigator.tsx anpassen
```tsx
<Box sx={{ 
  display: 'flex', 
  alignItems: 'center', 
  borderBottom: 1, 
  borderColor: 'divider',
  gap: 1,
  px: 1
}}>
  {/* Fixierter Overflow-Button LINKS */}
  <Tooltip title="Seitenaktionen">
    <IconButton 
      onClick={handleMenuOpen} 
      size="small"
      sx={{ flexShrink: 0 }}
    >
      <MoreVertIcon />
    </IconButton>
  </Tooltip>

  {/* Scrollbare Tabs mit begrenzter Breite */}
  <Tabs
    value={validatedValue}
    onChange={handleTabChange}
    variant="scrollable"
    scrollButtons="auto"
    allowScrollButtonsMobile
    sx={{ 
      flexGrow: 1, 
      minWidth: 0,
      '& .MuiTab-root': {
        maxWidth: 180,
        minWidth: 100
      }
    }}
  >
    {visiblePages.map(page => <PageTab ... />)}
  </Tabs>

  {/* Fixierte Buttons RECHTS */}
  <Tooltip title="Neue Seite hinzufügen">
    <IconButton onClick={handleAddPage} size="small" sx={{ flexShrink: 0 }}>
      <AddIcon />
    </IconButton>
  </Tooltip>
  
  <Tooltip title="Seiten importieren">
    <IconButton onClick={handleOpenImportDialog} size="small" sx={{ flexShrink: 0 }}>
      <FileUploadIcon />
    </IconButton>
  </Tooltip>
</Box>
```

#### 2. PageTab.tsx anpassen
```tsx
// Tab-Label mit Ellipsis
<Tab
  value={page.id}
  label={page.title.de || page.id}
  icon={...}
  iconPosition="start"
  sx={{
    textTransform: 'none',
    fontSize: '0.875rem',
    '& .MuiTab-iconWrapper': { marginRight: 1 },
    // Ellipsis für lange Namen
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }}
  // Tooltip für vollständigen Namen
  title={page.title.de || page.id}
/>
```

---

## Akzeptanzkriterien

- [ ] ⋮-Button ist **immer sichtbar**, auch bei 15+ Tabs
- [ ] Tabs sind scrollbar mit deutlichen ← → Buttons
- [ ] Lange Seitennamen werden mit `...` abgekürzt
- [ ] Tooltip zeigt vollständigen Seitennamen
- [ ] +Seite und Import-Buttons bleiben rechts fixiert
- [ ] Layout responsiv auf kleineren Bildschirmen
- [ ] Keine horizontale Überlappung

---

## Alternative: Falls User andere Option bevorzugt

Falls Option 2, 3 oder 4 gewünscht ist, kann ich den Plan anpassen.

**Nächster Schritt:** User-Entscheidung einholen → dann in Code-Mode wechseln für Implementierung
