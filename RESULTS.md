# Results and test notes

## Part 0: Setup and locator notes

### Browser and driver

- Browser used: Google Chrome 157.0.8103.80.
- Driver used for the attempt: ChromeDriver 157.0.8103.78, from Google's Chrome for Testing release for the same major version. Keep it under `C:\drivers\` and exclude it from Git.
- Browser automation opens a fresh browser for each run. Cypress drives the browser directly; Selenium IDE runner uses the configured ChromeDriver.
- No fixed pauses are used. Tests wait for a visible heading, a result row, or a success message before continuing.

### Selenium web form locators

| Element | Locator | Why it is stable |
|---|---|---|
| Text input | `id=my-text-id` | Explicit ID in the practice page. |
| Dropdown | `name=my-select` | Explicit name; option is selected by visible label `Two`. |
| Submit | `css=button[type='submit']` | Describes the control's role, not its visual class. |
| Result | `id=message` | Explicit ID containing the submitted result. |

### QuickPizza locators

| Element | Locator approach | Why it is stable |
|---|---|---|
| Main heading | `h1` plus exact expected text | Semantic heading. |
| Advanced switch | label text `Advanced` and its associated checkbox | Uses the accessible label. |
| Max calories | label text `Max Calories per Slice`, then its input | Label identifies the field even if classes change. |
| Excluded tool | select option with visible label `Knife` | Uses the option's accessible text. |
| Vegetarian | `#default-checkbox` | Stable ID recorded in the lab. |
| Pizza name | `#pizza-name` | Explicit ID. |
| Request button | `name=pizza-please` | Explicit name. |
| Recommendation result | paragraphs beginning `Name:`, `Tool:`, and `Calories per slice:` | Verifies actual answer values, not only a page load. |
| Love it | `#rate-5` | Explicit ID recorded in the lab. |
| Rating result | `#rate-result` | Explicit ID containing the login prompt. |
| Admin list | text under `/admin` after login | Cypress verifies the new pizza and its recommendation. |

## Test case QP-01

- **Title:** A custom pizza reaches the admin list.
- **Objective:** Check that a pizza request with restrictions gets a pizza that keeps them, rating a pizza needs a login, and the admin sees the new pizza.
- **Precondition:** QuickPizza is reachable; browser is not already logged in.
- **Test data:** `Lab Pizza YYYYMMDD-HHMMSS`, maximum calories `600`, excluded tool `Knife`, vegetarian checked. Use the lab's shared practice account through environment variables for the admin check.
- **Expected results:** Advanced fields appear; values remain selected; recommendation has the generated name, does not use Knife, and has at most 600 calories per slice; Love it prompts `Please log in first.`; the admin list contains the generated name and the same recommended tool.

| Step | Action | Expected result |
|---|---|---|
| 1 | Open QuickPizza | Heading is `Looking to break out of your pizza routine?` |
| 2 | Turn on Advanced | Max Calories per Slice, Excluded tools, Must be vegetarian, and Custom Pizza Name appear. |
| 3 | Enter `600`, exclude Knife, check vegetarian, enter a unique name | Each field shows the requested value. |
| 4 | Click Pizza, Please! | Recommendation contains the name, a tool other than Knife, and no more than 600 calories per slice. |
| 5 | Click Love it! without logging in | `Please log in first.` appears. |
| 6 | Open `/admin` and sign in with the lab account | The page shows Latest pizza recommendations. |
| 7 | Find the generated pizza | Its row contains the same name and tool as the recommendation. |

## Test results

No end-to-end test completed in this Codex environment. Keep this result separate from a test pass; rerun both suites on the assigned computer and replace this section with the generated names and report paths.

| Tool | Run | Command | Result | Evidence path |
|---|---|---|---|---|
| Selenium IDE | Preflight | `selenium-side-runner --filter 'web form' ...` | Failed before the page opened: ChromeDriver could not build a session; when connected to the local driver, Chrome exited before creating DevToolsActivePort. No test assertion ran. | No test report saved. |
| Selenium IDE | Required runs 1-2 | Run the web form and QP-01 steps 1-5, twice | Not run because the preflight could not launch Chrome. No QuickPizza record was created. | `evidence/selenium-ide/run1/`, `evidence/selenium-ide/run2/` |
| Cypress | Preflight | `npx cypress run --browser chrome --spec cypress/e2e/web-form.cy.js` | Failed before tests: Cypress 16.2.1's bundled executable exited during its startup smoke test (exit code 2147483651). | Command output only; Cypress produced no test report. |
| Cypress | Required runs 1-2 | Run both specs twice | Not run because the Cypress executable could not start in this environment. No QuickPizza record was created. | `evidence/cypress/run1/`, `evidence/cypress/run2/` |

## Part B: Comparison and Project 2 carry-over

This comparison records the differences in the lab workflows and test artifacts. It does not claim either suite passed in the current environment; both browser launch attempts stopped before a test step ran.

| Topic | Selenium IDE | Cypress |
|---|---|---|
| Test authoring | Records browser actions and stores them as command, target, and value rows in a `.side` project. | Tests are JavaScript source files with executable assertions. |
| Locator management | Multiple recorded targets can be inspected and replaced with a stable CSS or XPath target. | Locators are visible in code and can be shared through helper functions. |
| Waiting | `wait for element visible` uses a target and timeout. | Queries and assertions retry until they pass or time out. |
| Failure evidence | Runner report identifies the command that failed; browser screenshots can be retained. | Runner reports include command history, screenshots, and video. |
| Maintenance | Quick to record; long recorded flows are harder to review and refactor. | More code at the start; easier to review, reuse, and extend in source control. |
| Project 2 fit | Useful for a short smoke test or a quick locator prototype. | Better fit for a maintainable automated suite with reusable helpers and CI output. |

Project 2 currently uses Robot Framework and SeleniumLibrary. The locator discipline, explicit waits, unique synthetic data, and evidence policy from this lab carry over directly. Cypress is the stronger alternative if the team later wants JavaScript tests and built-in browser video; this lab does not change Project 2 code or connect to its staff account.

## Known limitations

- The shared practice site may change content or be unavailable; keep the reported result tied to the actual run date and output.
- The admin check relies on the course-provided shared practice account. Credentials are read from local environment variables and must not appear in committed test reports.
- QP-01 creates new synthetic practice data. Run only the requested number of times and never clear ratings.
