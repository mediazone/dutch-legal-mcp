# 🇳🇱⚖️ Dutch Legal MCP Server

**⚠️ GEBRUIK OP EIGEN RISICO - LEES DIT EERST ⚠️**

🚨 **GEEN GARANTIE** - Deze software wordt geleverd "ZOALS HET IS"  
🛡️ **UW VERANTWOORDELIJKHEID** - U bent 100% verantwoordelijk voor ALLE acties  
📝 **GEEN AANSPRAKELIJKHEID** - Auteurs niet aansprakelijk voor schade of juridische problemen  
⚖️ **GEEN JURIDISCH ADVIES** - Deze tool analyseert alleen, u neemt beslissingen  

---

## Wat Dit Doet (Simpele Versie)

Deze tool helpt u Nederlandse rechtspraak doorzoeken en juridische compliance controleren. Het werkt met AI assistenten zoals Claude.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  U Vraagt AI    │───▶│  Dutch Legal    │───▶│ Krijg Resultaten│
│ "Zoek privacy   │    │     MCP Tool    │    │ Rechtspraak +   │
│  rechtspraak"   │    │                 │    │ Juridische      │
│                 │    │                 │    │ analyse         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Wat u krijgt:**
- 📚 Doorzoek 800.000+ Nederlandse rechtspraak uitspraken
- ⚖️ GDPR compliance controle  
- 🤖 EU AI Act risico analyse
- 🔍 Juridische risico beoordeling

---

## Installatie (Kopieer Deze Commando's)

### Optie 1: Snelle Start (Aanbevolen)
```bash
# Kopieer deze regel:
npx @mediazone/dutch-legal-mcp
```

### Optie 2: Toevoegen aan Claude Code
```bash
# Kopieer deze regel:
claude mcp add dutch-legal npx -- -y @mediazone/dutch-legal-mcp

# Controleer of het werkt:
claude mcp list
```

### Optie 3: Handmatige Setup
Voeg dit toe aan uw MCP client configuratie:

```json
{
  "mcpServers": {
    "dutch-legal": {
      "command": "npx",
      "args": ["-y", "@mediazone/dutch-legal-mcp"]
    }
  }
}
```

---

## Hoe Te Gebruiken (Stap voor Stap)

### Stap 1: Vraag naar Rechtspraak
```
Zoek naar GDPR privacy zaken van de Hoge Raad in 2024
```

### Stap 2: Controleer GDPR Compliance  
```
Controleer GDPR compliance voor verwerken van klant emails voor marketing
```

### Stap 3: Analyseer AI Systemen
```
Classificeer AI systeem voor sollicitatiescreening volgens EU AI Act
```

### Stap 4: Beoordeel Juridische Risico's
```
Analyseer juridische risico's van nieuwe SaaS applicatie voor Nederlandse markt
```

---

## Installatie Stroomschema

```
Start Hier
    │
    ▼
Heeft u Claude Code?
    │
    ├─JA──▶ Run: claude mcp add dutch-legal npx -- -y @mediazone/dutch-legal-mcp
    │           │
    │           ▼
    │       Test: Vraag Claude "Zoek privacy rechtspraak"
    │           │
    │           ▼
    │       ✅ Klaar!
    │
    └─NEE─▶ Run: npx @mediazone/dutch-legal-mcp
               │
               ▼
           ✅ MCP Server Draait!
```

---

## **⚠️ KRITIEKE JURIDISCHE DISCLAIMER ⚠️**

**U BENT 100% VERANTWOORDELIJK VOOR:**
- ✋ ALLE acties uitgevoerd door deze tool
- 📋 Compliance met ALLE gebruiksvoorwaarden  
- 🔍 Verifiëren van data accuratesse en autoriteit
- ⚖️ Alle juridische gevolgen en consequenties
- 💼 Professionele juridische review van alle beslissingen
- 🎯 Juist toezicht op tool operaties

**WAT DEZE TOOL DOET:**
- ✅ Biedt alleen onderzoeksondersteuning
- ❌ Geeft GEEN juridisch advies
- ❌ Garandeert GEEN accuratesse
- ❌ Vervangt GEEN advocaten

**ALS ER IETS MISGAAT:**
- 🚫 Auteurs hebben NUL aansprakelijkheid
- 💸 U betaalt voor ALLE schade
- ⚖️ U handelt ALLE juridische problemen af

---

## Probleemoplossing (Veelvoorkomende Problemen)

**Probleem:** "Commando niet gevonden"
```bash
# Oplossing: Installeer eerst Node.js
# Dan run: npx @mediazone/dutch-legal-mcp
```

**Probleem:** "Tool werkt niet in Claude"
```bash
# Oplossing: Herstart Claude en probeer opnieuw
claude mcp list  # Controleer of tool in lijst staat
```

**Probleem:** "Geen resultaten gevonden"
- ✅ Controleer uw zoektermen (gebruik Nederlands of Engels)
- ✅ Probeer bredere zoektermen
- ✅ Controleer datumbereiken (rechtspraak gaat jaren terug)

---

## Data Bronnen

- **Rechtspraak.nl** - Officiële Nederlandse rechtspraak uitspraken (800K+ zaken)
- **EU GDPR** - Privacy regelgeving compliance framework  
- **EU AI Act** - AI systeem risico classificatie regels

---

## Technische Details (Voor Ontwikkelaars)

**Vereisten:** Node.js ≥18.0.0

**Omgevingsvariabelen (Optioneel):**
```bash
# Aangepaste endpoints (u bent verantwoordelijk voor compliance)
export DUTCH_LEGAL_API_BASE_URL="https://uw-api.com"
export DUTCH_LEGAL_VIEW_BASE_URL="https://uw-viewer.com"
```

**Architectuur:**
```
Uw Verzoek → Input Validatie → API Call → Nederlandse Rechtspraak → Geformatteerd Antwoord
     ↓              ↓               ↓           ↓                           ↓
   Claude       Zod Schema    Rechtspraak.nl  XML Parser             JSON Resultaten
```

---

## Ondersteuning & Hulp

- 📚 **Documentatie**: [GitHub Repository](https://github.com/mediazone/dutch-legal-mcp)
- 🐛 **Problemen**: [Rapporteer Problemen](https://github.com/mediazone/dutch-legal-mcp/issues)
- 💬 **Vragen**: Gebruik GitHub Discussions

**Professionele Ondersteuning:**
Voor organisatorische implementatie of aangepaste configuratie is professionele begeleiding beschikbaar via de juiste kanalen.

---

## Licentie

MIT License © 2025 - Gebruik op eigen risico

---

**🚨 LAATSTE HERINNERING: U BENT VOLLEDIG VERANTWOORDELIJK VOOR AL HET GEBRUIK 🚨**

Deze tool helpt met juridisch onderzoek maar U neemt alle beslissingen.
Raadpleeg altijd gekwalificeerde advocaten voor belangrijke juridische kwesties.