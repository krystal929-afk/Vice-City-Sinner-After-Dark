# Vice City Sinner / Reconfigurable Newspaper

STAGING: https://krystal929-afk.github.io/Vice-City-Sinner-After-Dark/
The production site at vicecitysinner.com and its repository are untouched.

## Design Desk

Open design-desk.html. Choose a visual edition, change layout, density, headline font and accent ink. The live, clickable preview carries your chosen look into stories and the archive.

Save draft locally stores named drafts only in this browser. Download design pack exports a portable JSON backup. Import design pack reads a saved JSON file. Use on my device applies the design locally across newspaper pages, without changing anyone else's default. Reset my device restores the published default.

Download publishing file exports a complete publication-config.js ready for a GitHub commit. It DOES NOT publish or change the production site. To release a design, replace this file in the STAGING repository after approval, or send the pack to Corvus.

The Design Desk is unlisted, not password-protected. Do not place secrets in it. No browser GitHub token is requested.

## Architecture

newspaper.css: original base newspaper structure and full article formatting.
edition-controls.css: layout presets (broadsheet, folio, poster), density and headline font.
publication-config.js: central default theme and theme catalog. Changing this one file switches the default across every page.
edition-engine.js: selects design from preview URL, local preference or published default.
themes/*.css: self-contained visual edition packs. Add more packs to keep reinventing the publication.
design-desk.html, design-desk.css, design-desk.js: visual design editor with previews, local draft cabinet, import and export.
archive.html: existing articles. All published text and real photos remain unchanged.
editions.html and edition-manifest.json: historical issue cabinet, populated only after an approved issue is released.
scripts/freeze-edition.py: preserves a released edition's HTML, CSS, JavaScript and original photos and adds it to the cabinet.

## Release and historical snapshot

Before switching the published appearance, save a complete, permanent version of the outgoing issue. From a GitHub checkout:

python scripts/freeze-edition.py --slug winter-2027 --name "Winter 2027" --date 2027-01 --issue 2 --design-pack approved-winter-2027-design.json

Then commit the new editions/winter-2027/ directory and changed edition-manifest.json. The archived issue keeps its original presentation and individual article pages.

Do not run the release command for an unapproved issue. It refuses to overwrite an existing snapshot. It requires the checkout's actual asset files.

## Editorial boundaries

Fictional classifieds, unusual notices and recurring narrative clues are intentional fictional atmosphere. Real articles, dates, original photography and interview subjects remain factual and independent of themes.

## Status

The Other Edition remains the site-wide published STAGING default. Blue Hour and Black Letter are optional experiments. There is no hard-coded four-month schedule. No unapproved edition is listed as published, and nothing here changes the live site.
