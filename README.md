# TerminalSite
A website that feels like a Linux Terminal, and acts as my portfolio. Accessible live from [here](https://www.nathanwise.tech/).

Recently entirely rewritten in TypeScript to work as a static site, complete with new functionality!

Functionality includes:
  - Large array of Linux Commands
  - Realistic Command & Argument Parsing
  - File & Directory Navigation
  - Command History
  - Terminal Flavours & Themes

## Set up
1. Clone the project, typically using `git clone git@github.com:WiseNat/TerminalSite.git`
2. To set up project dependencies, run `npm install`
3. To run the development web server, run `npm run dev`
4. To check whether the site is working, run `npm run test:e2e` (this may take a while)
   - If you have issues installing certain browsers, refer to the instructions in `playwright.config.ts`

## Full Feature List
- Terminal Flavours for text-based changes
- Terminal Themes for colour-based changes
- Large amount of Linux Commands (see help command)
- Limited TUI library
- Ctrl+R for reverse-i-search
- Quote and Newline compliant Argument Parsing
- Tab Autocomplete with command specific suggestions
- Command History with Arrow Keys
- Home/End for line navigation
- Read-only section with protections against user modification
