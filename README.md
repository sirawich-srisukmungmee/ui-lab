# UI Lab: Automated UI Testing

Individual ITDS362 lab work for **Part 1: Selenium IDE** and **Part 4: Cypress**. Both tools automate the Selenium practice web form and QP-01 on QuickPizza. The repository also contains the required Part 0 locator notes, Part B reflection, and Section 4 deliverables in `RESULTS.md`.

## Repository layout

- `selenium-ide/` contains the Selenium IDE `.side` project, the Java/JUnit translation of its QP-01 customer flow, and JSON results from two full runs.
- `cypress/` is the Cypress project. Its specs and admin login command are under `cypress/`; screenshots and videos from both passing runs are saved under `evidence/` and the normal Cypress output folders.
- `evidence/` contains the Selenium IDE runner reports and the Cypress run evidence. `RESULTS.md` records the actual run names, outcomes, durations, and reflection.

## Requirements

- Node.js 24 or newer and npm.
- Google Chrome and a matching ChromeDriver for Selenium IDE's runner.
- The QP-01 Cypress admin check uses the shared QuickPizza practice account (`admin` / `admin`). These are practice-site credentials, not a Project 2 staff account. Never replace them with staff credentials or commit private credentials.

## Run Part 1: Selenium IDE

From the repository root in Windows PowerShell, set the matching driver path, then run both tests:

```powershell
$env:CHROMEDRIVER = 'C:\drivers\chromedriver-win64\chromedriver.exe'
$env:Path = (Split-Path $env:CHROMEDRIVER) + ';' + $env:Path
npx --yes selenium-side-runner@4.0.13 --capabilities 'goog:chromeOptions.args=[headless,no-sandbox,disable-dev-shm-usage]' --jest-options '"--forceExit"' selenium-ide/ui-lab.side
```

The `.side` project runs the web form and QP-01 steps 1-5. Each QP-01 run creates one uniquely named practice pizza. The two recorded JSON reports are in `evidence/selenium-ide/run1/` and `run2/`.

## Run Part 4: Cypress

From the `cypress/` directory:

```powershell
npm ci
$env:CYPRESS_CACHE_FOLDER = (Join-Path (Get-Location) '.cache\cypress')
npx cypress install
$env:CYPRESS_QUICKPIZZA_ADMIN_USERNAME = 'admin'
$env:CYPRESS_QUICKPIZZA_ADMIN_PASSWORD = 'admin'
npx cypress run --browser chrome
npx cypress run --browser chrome
```

Cypress records the QP-01 screenshots and videos. Its test reads the shared practice credentials from `CYPRESS_QUICKPIZZA_ADMIN_USERNAME` and `CYPRESS_QUICKPIZZA_ADMIN_PASSWORD`; set each to `admin` for the public QuickPizza practice site. The Cypress 16 test uses `cy.env()` and does not print the password in the command log.

This computer's Cypress 16.2.1 executable failed its Windows startup smoke test. To produce the required Cypress run evidence without changing the tests, use **Actions → Cypress lab and evidence → Run workflow** in the public GitHub repository. The manual workflow runs the Step 4.3 wrong-title check, runs the full specs twice, saves the videos and screenshots, updates `RESULTS.md`, and commits the resulting evidence.

## Safety and data

QP-01 creates one synthetic pizza on the shared practice site per run. Run the required two times per tool, one run at a time. The tests do not use Clear Ratings, a payment flow, or the Project 2 application. Read `RESULTS.md` for the step-by-step test case, locator notes, actual outcomes, evidence, and comparison.
