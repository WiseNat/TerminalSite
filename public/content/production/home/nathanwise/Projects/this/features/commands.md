This site implements all the required Linux commands on top of some additional common and custom commands.

A list of required commands was determined via [3.4. /bin : Essential user command binaries (for use by all users)](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch03s04.html).
All of these required commands are runnable within the site, with some being 'disabled' in a way and erroring with:
- **Permission Denied** - for commands that have no reason to be implemented
- **Exec Format Error** - for commands that could be implemented

For a full list of non-disabled commands, run the 'help' command.
