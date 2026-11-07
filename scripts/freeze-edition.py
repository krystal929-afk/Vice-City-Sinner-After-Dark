#!/usr/bin/env python3
"""Freeze the real VCS static publication into an immutable-looking edition.

Run from a GitHub checkout, only AFTER approving the design and article slate.
The saved issue is a full independent copy, including original images, CSS,
scripts, and HTML. The registry is updated separately from the article archive.

Example:
    python scripts/freeze-edition.py --slug november-2026 --name "November 2026" \
        --date 2026-11 --issue 1 --design-pack my-edition.json

Do not run for staging proofs or unapproved issues.
"""
import argparse
import html
import json
import re
import shutil
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PAGES=["index.html","archive.html","notices.html","foxhole.html","hoochie-daddy.html",
       "hair-metal.html","real-name.html","dungeon.html","about.html","links.html",
       "subscribed.html","404.html"]
ALLOWED_THEMES={"other-edition","blue-hour","black-letter"}
ALLOWED_LAYOUTS={"broadsheet","folio","poster"}
ALLOWED_DENSITIES={"classic","compact","airy"}
ALLOWED_HEADLINES={"newspaper","deco","condensed"}
DEFAULT={"theme":"other-edition","layout":"broadsheet","density":"classic",
         "headlines":"newspaper","accent":"#2b4d58"}


def main():
    a=argparse.ArgumentParser(description="Freeze and register an approved VCS edition.")
    a.add_argument("--slug",required=True,help="Unique lower-case folder name, e.g. winter-2027")
    a.add_argument("--name",required=True,help="Actual published edition title")
    a.add_argument("--date",required=True,help="Publication month, e.g. 2027-03")
    a.add_argument("--issue",required=True,type=int,help="Approved issue number")
    a.add_argument("--design-pack",help="Exported VCS Design Desk JSON file")
    a.add_argument("--description",default="Preserved as originally printed.")
    args=a.parse_args()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",args.slug):
        a.error("Slug must be lower-case letters, numbers and single hyphens.")
    if not re.fullmatch(r"\d{4}-\d{2}",args.date):
        a.error("Date must be YYYY-MM.")
    if args.issue<1:a.error("Issue number must be positive.")
    design=dict(DEFAULT)
    if args.design_pack:
        pack=json.loads(Path(args.design_pack).read_text(encoding="utf-8"))
        if pack.get("format")!="vcs-design-pack":a.error("Not a VCS Design Desk pack.")
        design.update(pack.get("design") or {})
    if design["theme"] not in ALLOWED_THEMES:a.error("Unknown edition theme; register it before freezing.")
    if design["layout"] not in ALLOWED_LAYOUTS:a.error("Unsupported layout.")
    if design["density"] not in ALLOWED_DENSITIES:a.error("Unsupported density.")
    if design["headlines"] not in ALLOWED_HEADLINES:a.error("Unsupported headline font.")
    if not re.fullmatch(r"#[0-9a-fA-F]{6}",str(design["accent"])):a.error("Accent must be a 6-digit hex color.")

    target=ROOT/"editions"/args.slug
    if target.exists():a.error("Edition already exists. Frozen editions cannot be overwritten.")
    stylesheet=ROOT/"themes"/(design["theme"]+".css")
    if not stylesheet.exists():a.error("Theme CSS not found.")
    marker='<script src="publication-config.js?v=1"></script><script src="edition-engine.js?v=1"></script><link rel="stylesheet" href="edition-controls.css?v=1">'
    frozen_styles='<link rel="stylesheet" href="themes/'+design["theme"]+'.css"><link rel="stylesheet" href="edition-controls.css?v=1">'
    target.mkdir(parents=True)
    try:
        for page in PAGES:
            source=(ROOT/page).read_text(encoding="utf-8")
            if marker not in source:raise RuntimeError("Expected edition engine not found in "+page)
            source=source.replace(marker,frozen_styles,1)
            # Edition cabinet lives at the publication root, outside this frozen copy.
            source=source.replace('href="editions.html"','href="../../editions.html"')
            attrs=' '.join('data-vcs-'+html.escape(k,quote=True)+'="'+html.escape(str(v),quote=True)+'"' for k,v in design.items() if k!="accent")
            source=source.replace("<html lang=\"en\">",'<html lang="en" '+attrs+' style="--vcs-accent:'+design["accent"]+'">',1)
            (target/page).write_text(source,encoding="utf-8")
        shutil.copy2(ROOT/"newspaper.css",target/"newspaper.css")
        shutil.copy2(ROOT/"edition-controls.css",target/"edition-controls.css")
        shutil.copy2(ROOT/"newspaper.js",target/"newspaper.js")
        (target/"themes").mkdir()
        shutil.copy2(stylesheet,target/"themes"/stylesheet.name)
        # Preserve real article photographs at the point of publication.
        shutil.copytree(ROOT/"assets",target/"assets")
        (target/"issue.json").write_text(json.dumps({
            "slug":args.slug,"name":args.name,"date":args.date,"issue":args.issue,
            "description":args.description,"design":design,"frozen":True
        },indent=2)+"\n",encoding="utf-8")
        registry_path=ROOT/"edition-manifest.json"
        registry=json.loads(registry_path.read_text(encoding="utf-8"))
        if any(x.get("slug")==args.slug for x in registry.get("issues",[])):
            raise RuntimeError("Edition already registered.")
        registry.setdefault("issues",[]).insert(0,{
            "slug":args.slug,"name":args.name,"date":args.date,
            "number":args.issue,"description":args.description
        })
        registry_path.write_text(json.dumps(registry,indent=2)+"\n",encoding="utf-8")
    except Exception:
        shutil.rmtree(target,ignore_errors=True)
        raise
    print("Frozen edition:",target.relative_to(ROOT))
    print("Files preserved:",len(PAGES),"HTML pages, CSS, JavaScript, and original photo assets.")
    print("Review changes and commit them to GitHub only after final editorial approval.")


if __name__=="__main__":
    main()
