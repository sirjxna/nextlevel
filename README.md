# Minecraft Client med WebGUI

En Lunar/Badlion-lignende Minecraft Client med WebGUI som gir deg FPS overlay, ToggleSprint og mange flere legitime QoL (Quality of Life) funksjoner!

## 🚀 Funksjoner

### Movement
- **Toggle Sprint** - Hold sprint-tasten en gang for kontinuerlig sprinting
- **Auto Walk** - Automatisk gåing fremover
- **Auto Jump** - Automatisk hopp når du går inn i blokker
- **Safe Walk** - Forhindrer fall fra kanter når du sniker

### Visual
- **Fullbright** - Maksimal lysstyrke i alle områder
- **Clear Water** - Gjør vann transparent for bedre synlighet
- **Better Foliage** - Forbedrer rendering av gress og løv
- **Custom Crosshair** - Tilpasset korshår med forskjellige stiler
- **FOV Changer** - Justerbar synsfelt

### Utility
- **Auto Eat** - Automatisk spising når du er sulten
- **Auto Potion** - Automatisk drikking av eliksirer
- **Inventory Manager** - Smart inventarorganisering og sortering
- **Auto Tool** - Automatisk bytte til beste verktøy for blokken
- **Auto Armor** - Automatisk utstyr av beste rustning tilgjengelig
- **Auto Repair** - Automatisk reparasjon når holdbarhet er lav

### Performance
- **FPS Overlay** - Sanntids FPS, Ping, RAM og CPS
- **Performance Monitoring** - Overvåk ytelse
- **Customizable Settings** - Justerbare innstillinger
- **Multiple Themes** - Forskjellige fargetemaer

## 📋 Installasjon

### Forutsetninger
- Node.js 14.0.0 eller høyere
- Minecraft 1.12.2 (for mod-versjonen)
- Java 8 (for mod-utvikling)

### WebGUI Server (Anbefalt for testing)

1. **Klon eller last ned prosjektet**
   ```bash
   git clone <repository-url>
   cd minecraft-webgui-client
   ```

2. **Installer avhengigheter**
   ```bash
   npm install
   ```

3. **Start WebGUI serveren**
   ```bash
   npm start
   ```

4. **Åpne WebGUI**
   - Gå til `http://localhost:3000/minecraft-client.html`
   - Trykk F1 for å åpne/lukke GUI
   - Trykk F2 for Toggle Sprint
   - Trykk F3 for Auto Walk
   - Trykk F4 for Fullbright

### Minecraft Mod (For ekte Minecraft integrasjon)

1. **Bygg mod-en**
   ```bash
   cd minecraft-mod
   ./gradlew build
   ```

2. **Installer mod-en**
   - Kopier den bygde `.jar` filen til din Minecraft mods-mappe
   - Start Minecraft med Forge 1.12.2

3. **Start WebGUI serveren**
   ```bash
   npm start
   ```

4. **Koble til fra Minecraft**
   - Mod-en vil automatisk koble til WebSocket serveren
   - Åpne `http://localhost:3000/minecraft-client.html` i nettleseren

## 🎮 Bruk

### Hotkeys
- **F1** - Åpne/lukke WebGUI
- **F2** - Toggle Sprint
- **F3** - Toggle Auto Walk
- **F4** - Toggle Fullbright

### WebGUI Kontroller
- **Toggle Switches** - Aktiver/deaktiver funksjoner
- **Sliders** - Juster CPS og oppdateringshastighet
- **Tabs** - Naviger mellom forskjellige funksjonskategorier

### FPS Overlay
- Viser sanntids FPS, Ping og RAM bruk
- Fargekodet basert på ytelse
- Kan flyttes rundt på skjermen

## 🔧 Konfigurasjon

### WebSocket Port
Standard port er 3000. Du kan endre dette i innstillingene.

### Performance Settings
- **Update Rate** - Hvor ofte data oppdateres (10-120 FPS)
- **CPS** - Klikker per sekund for Auto Clicker (1-20)

### Hotkeys
Alle hotkeys kan endres i Minecraft mod-en.

## 🏗️ Arkitektur

### Komponenter
1. **WebGUI** - HTML/CSS/JavaScript frontend
2. **WebSocket Server** - Node.js server for kommunikasjon
3. **Minecraft Mod** - Java mod for Minecraft integrasjon

### Kommunikasjon
- WebSocket for sanntids kommunikasjon
- JSON meldinger for datautveksling
- Event-basert arkitektur

## 🐛 Feilsøking

### Vanlige problemer

**WebGUI åpnes ikke**
- Sjekk at WebSocket serveren kjører
- Sjekk at port 3000 er tilgjengelig
- Prøv å oppdatere siden

**Funksjoner fungerer ikke**
- Sjekk at Minecraft mod-en er installert
- Sjekk at WebSocket tilkoblingen er aktiv
- Sjekk Minecraft konsollen for feilmeldinger

**Performance problemer**
- Reduser oppdateringshastigheten
- Deaktiver unødvendige funksjoner
- Sjekk systemressurser

## 📝 Utvikling

### Bygge fra kildekode
```bash
# WebGUI
npm install
npm start

# Minecraft Mod
cd minecraft-mod
./gradlew build
```

### Legge til nye funksjoner
1. Legg til funksjon i `minecraft-client.js`
2. Oppdater WebSocket server håndtering
3. Legg til Minecraft mod støtte
4. Test funksjonen

## 📄 Lisens

MIT License - se LICENSE fil for detaljer.

## 🤝 Bidrag

Bidrag er velkomne! Vennligst:
1. Fork prosjektet
2. Lag en feature branch
3. Commit endringene
4. Push til branch
5. Opprett Pull Request

## 📞 Support

For support eller spørsmål:
- Opprett en issue på GitHub
- Kontakt utviklerteamet

---

**Merk**: Denne Minecraft Client er laget for utdanningsformål. Bruk på egen risiko og følg Minecraft's Terms of Service.