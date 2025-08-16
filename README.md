# 🇳🇱⚖️ Dutch Legal MCP Server

**⚠️ USE AT YOUR OWN RISK - READ THIS FIRST ⚠️**

🚨 **NO WARRANTY** - This software is provided "AS IS"  
🛡️ **YOUR RESPONSIBILITY** - You are 100% responsible for ALL actions  
📝 **NO LIABILITY** - Authors not liable for any damages or legal issues  
⚖️ **NOT LEGAL ADVICE** - This tool analyzes only, you make decisions  

---

## What This Does (Simple Version)

This tool helps you search Dutch court cases and check legal compliance. It works with AI assistants like Claude.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   You Ask AI    │───▶│  Dutch Legal    │───▶│   Get Results   │
│ "Find privacy   │    │     MCP Tool    │    │ Court cases +   │
│  court cases"   │    │                 │    │ Legal analysis  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**What you get:**
- 📚 Search 800,000+ Dutch court decisions
- ⚖️ GDPR compliance checking  
- 🤖 EU AI Act risk analysis
- 🔍 Legal risk assessment

---

## Installation (Copy These Commands)

### Option 1: Quick Start (Recommended)
```bash
# Copy this line:
npx @mediazone/dutch-legal-mcp
```

### Option 2: Add to Claude Code
```bash
# Copy this line:
claude mcp add dutch-legal npx -- -y @mediazone/dutch-legal-mcp

# Then verify it worked:
claude mcp list
```

### Option 3: Manual Setup
Add this to your MCP client configuration:

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

## How to Use (Step by Step)

### Step 1: Ask for Court Cases
```
Search for GDPR privacy cases from Supreme Court in 2024
```

### Step 2: Check GDPR Compliance  
```
Check GDPR compliance for processing customer emails for marketing
```

### Step 3: Analyze AI Systems
```
Classify AI system for job application screening according to EU AI Act
```

### Step 4: Assess Legal Risks
```
Analyze legal risks of new SaaS application for Dutch market
```

---

## Installation Flow

```
Start Here
    │
    ▼
Do you have Claude Code?
    │
    ├─YES─▶ Run: claude mcp add dutch-legal npx -- -y @mediazone/dutch-legal-mcp
    │           │
    │           ▼
    │       Test: Ask Claude "Search for privacy court cases"
    │           │
    │           ▼
    │       ✅ Done!
    │
    └─NO──▶ Run: npx @mediazone/dutch-legal-mcp
               │
               ▼
           ✅ MCP Server Running!
```

---

## **⚠️ CRITICAL LEGAL DISCLAIMER ⚠️**

**YOU ARE 100% RESPONSIBLE FOR:**
- ✋ ALL actions performed by this tool
- 📋 Compliance with ALL terms of service  
- 🔍 Verifying data accuracy and authority
- ⚖️ All legal implications and consequences
- 💼 Professional legal review of all decisions
- 🎯 Proper supervision of tool operations

**WHAT THIS TOOL DOES:**
- ✅ Provides research assistance only
- ❌ Does NOT provide legal advice
- ❌ Does NOT guarantee accuracy
- ❌ Does NOT replace lawyers

**IF SOMETHING GOES WRONG:**
- 🚫 Authors have ZERO liability
- 💸 You pay for ALL damages
- ⚖️ You handle ALL legal issues

---

## Troubleshooting (Common Issues)

**Problem:** "Command not found"
```bash
# Solution: Install Node.js first
# Then run: npx @mediazone/dutch-legal-mcp
```

**Problem:** "Tool not working in Claude"
```bash
# Solution: Restart Claude and try again
claude mcp list  # Check if tool is listed
```

**Problem:** "No results found"
- ✅ Check your search terms (use Dutch or English)
- ✅ Try broader search terms
- ✅ Check date ranges (court cases go back years)

---

## Data Sources

- **Rechtspraak.nl** - Official Dutch court decisions (800K+ cases)
- **EU GDPR** - Privacy regulation compliance framework  
- **EU AI Act** - AI system risk classification rules

---

## Technical Details (For Developers)

**Requirements:** Node.js ≥18.0.0

**Environment Variables (Optional):**
```bash
# Custom endpoints (you are responsible for compliance)
export DUTCH_LEGAL_API_BASE_URL="https://your-api.com"
export DUTCH_LEGAL_VIEW_BASE_URL="https://your-viewer.com"
```

**Architecture:**
```
Your Request → Input Validation → API Call → Dutch Court Data → Formatted Response
     ↓              ↓               ↓           ↓                    ↓
   Claude       Zod Schema    Rechtspraak.nl  XML Parser      JSON Results
```

---

## Support & Help

- 📚 **Documentation**: [GitHub Repository](https://github.com/mediazone/dutch-legal-mcp)
- 🐛 **Issues**: [Report Problems](https://github.com/mediazone/dutch-legal-mcp/issues)
- 💬 **Questions**: Use GitHub Discussions

**Professional Support:**
For organizational deployment or custom configuration, professional assistance is available through appropriate channels.

---

## License

MIT License © 2025 - Use at your own risk

---

**🚨 FINAL REMINDER: YOU ARE FULLY RESPONSIBLE FOR ALL USAGE 🚨**

This tool helps with legal research but YOU make all decisions.
Always consult qualified lawyers for important legal matters.