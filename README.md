# TerminalSite
A website that feels like a Linux Terminal, and acts as my portfolio. Accessible live from [here](https://www.nathanwise.tech/).

Recently entirely rewritten in TypeScript with Vite to work as a static site, complete with new functionality!

Functionality includes:
  - Large array of Linux Commands
  - Realistic Command & Argument Parsing
  - File & Directory Navigation
  - Command History
  - Terminal Flavours & Themes
  - Autocomplete

## Set up
1. Clone the project, typically using `git clone git@github.com:WiseNat/TerminalSite.git`
2. To set up project dependencies, run `npm install`
3. To run the development web server, run `npm run dev`
4. To check whether the site is working, run `npm run test:e2e` (this may take a while)
   - If you have issues installing certain browsers, refer to the instructions in `playwright.config.ts`
