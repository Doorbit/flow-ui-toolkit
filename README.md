# Flow UI Toolkit

Ein leistungsstarkes Tool zur visuellen Erstellung und Bearbeitung von UI-Flows mit Drag & Drop Funktionalität und Mehrsprachenunterstützung.

**Live-Demo:** [https://doorbit.github.io/flow-ui-toolkit](https://doorbit.github.io/flow-ui-toolkit)

## Features

- 🎨 Visueller Editor mit Drag & Drop
- 📝 Verschiedene UI-Elemente (Text, Boolean, Select, etc.)
- 🌐 Mehrsprachenunterstützung für Seiten und Elemente
- 🔄 Undo/Redo Funktionalität
- 📋 JSON Import/Export
- 📱 Responsive Design
- 🎯 Verschachtelbare Elemente mit verbesserter Strukturnavigation
- 📄 Multi-Page Support mit anpassbaren Titeln und Icons
- 💻 Material Design Icon-Auswahl für Seiten
- 🧩 Unterstützung für komplexe JSON-Strukturen und Subflows
- 🔍 Verbesserte Containertyp-Erkennung und -Anzeige
- 🔄 Automatische Strukturnormalisierung für konsistente JSON-Ausgabe

## Schnellstart

```bash
# Repository klonen
git clone [repository-url]

# Ins Projektverzeichnis wechseln
cd flow-ui-toolkit

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm start
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Verfügbare Skripte

- `npm start` - Startet den Entwicklungsserver
- `npm test` - Führt die Tests aus
- `npm run build` - Erstellt eine optimierte Production-Build
- `npm run deploy` - Erstellt einen Build und veröffentlicht ihn auf GitHub Pages
- `npm run eject` - Erlaubt tiefgreifende Konfigurationsänderungen

## Dokumentation

Detaillierte Dokumentation finden Sie in:

- [Technische Dokumentation](docs/technical_documentation.md)
  - Architektur
  - Komponenten
  - Technische Features
  - API-Referenz

- [EnhancedPropertyEditor Dokumentation](docs/enhanced_property_editor.md)
  - Architektur des verbesserten Property Editors
  - Integration der PropertyEditor-Businesslogik
  - Spezialisierte Editor-Komponenten
  - Factory-Pattern für Elementtypen

- [Refactoring-Dokumentation](docs/refactoring_documentation.md)
  - Überblick über durchgeführte Refactoring-Maßnahmen
  - Verbesserungen der Codestruktur
  - Performance-Optimierungen

- [Benutzerhandbuch](https://doorbit.github.io/flow-ui-toolkit/documentation.html) — die ausgespielte In-App-Hilfe (auch im Editor über „Dokumentation"). Einzige Quelle: `public/documentation.html`.
  - Einführung
  - Funktionsübersicht
  - Best Practices
  - Troubleshooting

## Technologie-Stack

- React
- TypeScript
- Material-UI
- Styled Components
- React DnD

## Systemanforderungen

- Node.js 14.0 oder höher
- NPM 6.0 oder höher
- Moderner Webbrowser (Chrome, Firefox, Safari, Edge)

## Lizenz

[MIT](LICENSE)

## Beitragen

1. Fork erstellen
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## Support

Bei Fragen oder Problemen:
1. Prüfen Sie die [Dokumentation](docs/)
2. Erstellen Sie ein Issue
3. Kontaktieren Sie das Entwicklerteam
