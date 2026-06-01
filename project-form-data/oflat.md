# OFLAT — Project Form Data

**Title:** OFLAT (OCamlFlat)

**Headline:** OCaml library + browser web app compiled with js_of_ocaml and deployed as a static site via GitLab Pages.

**Release Date:** September - 2023

**Link:** https://oflat-ocamlflat-pages-d4fe77.gitlab.io/

## Description
OFLAT is a personal variant inspired by a thesis project series funded by FACTOR to promote OCaml. I couldn't recover the original source code, so I rebuilt the project from available material and extended it—especially around Turing Machine functionality—across both OCaml-Flat and the OFLAT web app.

This was a great exercise in building a clean two-project workflow (library + web app), keeping dependencies reproducible with opam, and making the deployment fully static and automated through GitLab Pages.

## Achievements
- Rebuilt a two-project workflow: the OCamlFlat library plus the OFLAT web app compiled from OCaml.
- Compiled OCaml to JavaScript with js_of_ocaml to produce a fully static browser app.
- Added Turing Machine support and extra functionality across both OCaml-Flat and OFLAT.
- Automated GitLab Pages deployment with cache-busting (`?v=$CI_COMMIT_SHA`) and a `version.txt` traceability breadcrumb.

## Skills
- OCaml
- JavaScript
- js_of_ocaml
- HTML/CSS
- GitLab Pages
- GitLab CI/CD

## Gallery
- /projects_images/oflat/oflat_main_L.png
- /projects_images/oflat/oflat_main_D.png
