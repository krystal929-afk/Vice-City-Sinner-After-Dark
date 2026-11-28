# Vice City Sinner / Reconfigurable Newspaper

STAGING: https://krystal929-afk.github.io/Vice-City-Sinner-After-Dark/
The production site at vicecitysinner.com and its repository are untouched.

## Design Desk

Open design-desk.html. Choose from six visual editions, five layouts, five mastheads, photo processing, print texture, rule styles, text size, headline font and custom accent ink. The Surprise Me control creates a fresh editable combination, and the preview now supports front page, archives, notices or a feature article. The live, clickable preview carries your chosen look into stories and the archive.

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

The Strange Desk publishes only verified unusual South Florida history or genuinely recent news, each with dates and original source links. No fictional local news, municipal notices, or invented addresses are published in this section. Real articles and interview subjects remain factual.

## Status

The Other Edition remains the site-wide STAGING default. Blue Hour, Black Letter, Velvet Vice, Acid Riviera, and Sunday Strange are optional experiments. There is no hard-coded four-month schedule. No unapproved edition is listed as published, and nothing here changes the live site.


## Art Department II (expanded)

Six visual editions: The Other Edition, Blue Hour, Black Letter, Velvet Vice, Acid Riviera and Sunday Strange.

Five front-page structures: broadsheet, folio, poster/tabloid, editorial split and photographic feature.
Other live controls: density, five headline types, five masthead styles, five photo finishes, four paper textures, four rule treatments, four reading sizes, and custom or preset accent ink.

The Surprise Me control generates a new combination in the preview only; it does not modify the published site.
The proof drawer preserves a design's name, optional art-director notes and all its settings in a downloadable v2 JSON design pack.
Existing v1 saved packs continue to load with the new settings defaulted.


## Art Vault (Design Desk)

Open the Art Vault from the Design Desk. Upload JPEG, PNG, WebP or GIF (8 MB per file); the original bytes are stored in IndexedDB in the browser, never uploaded automatically. Select an artwork location using the dropdown or click an outlined image in Select in preview mode. Choose an image, add its accurate alt description, set the frame shape and fit, and place it. The crop/position controls never modify the original image. Check factual image captions and credits before releasing a changed photograph. Empty illustration slots are available for the fictional advertisement and notices.

Save named artwork collections independently from design drafts; export an artwork pack to retain the assigned images and placements across browsers. Import restores the collection without publishing. Browser storage is not a backup. The publishing export is a separate artwork-config.js file containing the selected images and placements, and must be reviewed and committed to the staging repository to release. Normal visitors never see locally stored artwork drafts. Artwork is public only once its publishing file is committed to a public repository. Keep sensitive images out of released packs.

Freeze an approved outgoing edition only after its artwork-config.js has been finalized. The historical snapshot includes the released artwork configuration, image slots, renderer and styles. An archived edition ignores local artwork previews. The original repository image files are not overwritten.

## Approved Gazette design

The Vice City Gazette is the new staging default, translating the approved illustrated tropical newspaper mockup into a functional layout. The real 2026 issue dates, article text, credits and original photographs are preserved. The two masthead ornaments and fictional Bellwether Rooms illustration are original decorative SVG assets. The earlier six themes remain available. The new front-page Identity photograph and illustrated classified are Art Vault slots. New articles are not published until final approval. The live custom domain is unaffected.

## Reference-faithful Gazette update

The Gazette staging theme now uses artwork cropped directly from the approved user-supplied newspaper reference, stored under assets/mockup/ as optimized JPEG files. This is not a screenshot of the whole page. The masthead is a single illustrative logo asset; all real story headlines, navigation, body copy, classifications, links, articles and the archive remain genuine HTML content. Featured editorial, hair-metal, identity and fictional hotel illustrations match the reference artwork; original photography and article content remain available on their corresponding article pages.

Do not backdate real article publication dates to match the mockup's fictional historical look. The edition date stays current in live HTML, while the imported masthead and typography establish the period design. Other site themes and the Design Desk / Art Vault are untouched.

This is the staging site only; vicecitysinner.com was not edited.

## The Strange Desk / edition November 2026

The visible former Pelican Row fiction has been replaced with fully sourced reports on the front page and notices.html. The original fictional art asset remains in repository history and is no longer displayed. The Art Vault retains optional illustration slots without altering real reporting.

Current selection: Rosie the elephant being used as a golf tee in Miami Beach on May 20, 1927 (Florida State Archives); alleged discovery of 10 live songbirds sewn into underwear at Miami International Airport, reported October 6, 2026 (NBC 6 South Florida); Tom the Cat-stamped cocaine package found in Key Largo mangroves October 2, 2026 (Miami Herald reporting). Read editorial/oddities.json for event dates, attribution and source URLs.

Editorial filter: South Florida only; genuinely recent stories (within 60 days of the issue) or legitimately archival history (preferably pre-1960). Source links and factual attribution are mandatory. Do not publish older filler as new news, misrepresent allegations as convictions, or invent lore to fill space. This desk is manually curated per edition; it is NOT an auto-updating news feed. Check freshness and citations again before production release.


## November 2026 new issue / STAGING PROOF

Five complete, copyedited editorial articles were built from the November 18 manuscript. Full copy including research trail and homelessness resources lives in new stand-alone HTML pages:
sidewalk.html, mullet.html, black-is-not-a-phase.html, last-song.html, genx-millennials.html.

The lead story is "The Sidewalk Is Not a Diagnosis." The front page is redesigned around this and the other four articles with a darker oxblood, plum, faded teal and aged paper treatment. Article headlines now use sturdy, readable Georgia rather than extreme stretched decorative Bodoni. The existing ornate, approved masthead artwork remains intact. New proof illustrations are original vector artworks, not photographs of invented real individuals. No source photo of any real person was changed.

The Art Vault recognizes all five new article covers, five front-page placements and five archive thumbnails, and earlier stories still live in the archive. Current November pages are strictly preview/staging, with noindex,nofollow. Article dates are month-only until a release date is approved. The production vicecitysinner.com domain is untouched.

For status and editorial issue metadata see editorial/november-2026.json. Do not freeze or register this issue as publicly published until approved. The Strange Desk remains sourced real South Florida oddities.

## November 2026 visual fidelity proof V3

This visual update is the first staging-only implementation of the approved darker newspaper mockup: illustrated black masthead; oxblood print labels; warm paper story panels; high-contrast readable Georgia headlines; five cohesive original editorial paintings. CSS uses the existing vice-city-gazette theme and is reversible. The five original articles, existing story text, archive, Strange Desk, Design Desk and Art Vault remain intact. All new image sources are registered in artwork-slots.js and editable through the Art Vault.

There is no production deployment. Do not merge this staging repository into vicecitysinner.com until the editor approves desktop/mobile layout and article imagery.
