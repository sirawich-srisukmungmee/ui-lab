# UI Lab: Automated UI Testing

This repository contains the individual lab work for ITDS362, using **Selenium IDE** and **Cypress** on the Selenium web form and QuickPizza practice sites. The lab asks students to complete Part 0, Part B, Section 4, and two of Parts 1-4. Part 2 of Project 2 already uses Robot Framework; this lab compares the recorder based Selenium IDE workflow with Cypress.

## Repository layout

- `selenium-ide/ui-lab.side` - Selenium IDE project with the web form and QP-01 tests.
- `selenium-ide/QP01customerTest.java` - Java/JUnit export-style version required by the Selenium IDE part.
- `cypress/e2e/` - Cypress web form and QP-01 specs.
- `RESULTS.md` - Part 0 locator notes, QP-01, actual run status, evidence index, comparison, and Project 2 carry-over.
- `evidence/` - retained per-run reports and Cypress videos/screenshots.

## Requirements

- Google Chrome, current stable.
- Node.js 22 or newer and npm.
- Firefox with the Selenium IDE add-on 3.17.4 for recording or editing the `.side` file.
- ChromeDriver matching the installed Chrome major version, placed outside this repository and exposed as `CHROMEDRIVER`.

Keep ChromeDriver outside the repository. Never commit staff credentials, `.env` files, browser profiles, or tokens.

## Setup

```powershell
npm install
$env:CYPRESS_CACHE_FOLDER = (Join-Path (Get-Location) '.cache\cypress')
npx cypress install
```

Install the Selenium IDE runner for the IDE part:

```powershell
npm install --global selenium-side-runner@4.0.13
```

Set `CHROMEDRIVER` to the full path of the matching driver in the current PowerShell session. For example:

```powershell
$env:CHROMEDRIVER = 'C:\drivers\chromedriver-win64\chromedriver.exe'
$env:PATH = (Split-Path $env:CHROMEDRIVER) + ';' + $env:PATH
```

The Cypress QP-01 test signs in to the shared practice site's admin page after creating its pizza. Supply the practice account values through environment variables; do not put them in source files or commit output containing them:

```powershell
$env:QUICKPIZZA_ADMIN_USERNAME = '<course-provided-practice-user>'
$env:QUICKPIZZA_ADMIN_PASSWORD = '<course-provided-practice-password>'
$env:CYPRESS_QUICKPIZZA_ADMIN_USERNAME = $env:QUICKPIZZA_ADMIN_USERNAME
$env:CYPRESS_QUICKPIZZA_ADMIN_PASSWORD = $env:QUICKPIZZA_ADMIN_PASSWORD
```

Enter the course-provided shared-practice account values locally. Do not put them in a source file, commit a `.env` file, or include a Project 2 staff password in this repository.

## Run

Selenium IDE automates QP-01 steps 1-5; Cypress automates steps 1-7, including the Admin check. Run each suite twice, one command at a time. QP-01 creates a new pizza each time, so use the generated `Lab Pizza YYYYMMDD-HHMMSS` name to distinguish runs. Do not run in a loop and do not use the practice site's Clear Ratings control.

```powershell
npx cypress run --browser chrome --config videosFolder=evidence/cypress/run1/videos,screenshotsFolder=evidence/cypress/run1/screenshots
npx cypress run --browser chrome --config videosFolder=evidence/cypress/run2/videos,screenshotsFolder=evidence/cypress/run2/screenshots
selenium-side-runner --output-directory evidence/selenium-ide/run1 selenium-ide/ui-lab.side
selenium-side-runner --output-directory evidence/selenium-ide/run2 selenium-ide/ui-lab.side
```

For browser headed evidence, use:

```powershell
npx cypress run --browser chrome --headed
```

Cypress stores screenshots and videos under `evidence/cypress/`; the Selenium IDE runner writes JSON reports under `evidence/selenium-ide/`. Run the suites only the stated two times and note the generated pizza names and times in `RESULTS.md`.

## Safety and data

The tests use only the lab's shared practice sites. QP-01 creates a synthetic pizza recommendation with a unique name; repeated runs create additional practice data. The tests do not clear ratings, submit a payment, or use the Project 2 application. The web-form spec submits only the lab's sample form.

See [`RESULTS.md`](RESULTS.md) for the test steps, expected outcomes, locator notes, and the framework comparison.
