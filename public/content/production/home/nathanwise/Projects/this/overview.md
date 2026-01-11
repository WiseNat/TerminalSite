The site you're on is, surprisingly, a project I've worked on.
This is effectively a version 2.0 with a complete rewrite of the codebase. 
See [here](https://github.com/WiseNat/TerminalSite/commit/d86e053477a90643af0b97cb796924428aae7a65) if you want to know what version 1.0 looked like.

The north star for this project was to create a terminal that 'just feels right' with the only limitation for features 
chosen being my time. This resulted in a lot of small details that most users wouldn't notice, e.g. inverted colours on 
text select.

This also meant that a host of common useful functionality exists on this site (see files under `./features` for more info):
- Command & Argument Parsing
- Tab Autocomplete
- Command History
- Tons of Linux Commands
- Terminal Flavours & Themes
- File & Directory Navigation

If there's anything you feel like is missing that you'd expect in a terminal, feel free to raise an issue [here](https://github.com/WiseNat/TerminalSite/issues)!

---

This rewrite has been my first introduction into TypeScript, Vite, Vitest, Playwright, and production ready static sites.

Spending close to a year in my free time rewriting this site was entirely motivated by the cost of the DigitalOcean 
droplet I was running version 1.0 on. On the original version, the only portion that required a server - outside of 
serving files - was for retrieving terminal themes and files/folders. For just that, £65 a year seemed excessive when a 
freely hosted static site could do the exact same thing.

Despite the motivation and this being the longest I've spent on a personal project, I've enjoyed every second of development.