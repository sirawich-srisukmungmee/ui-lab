# UI lab results

Tool parts chosen: **Part 1: Selenium IDE** and **Part 4: Cypress**.

## Part 0

- Chrome version: 157.0.8103.80.
- ChromeDriver version: 157.0.8103.80.
- Node.js: v24.11.0; npm: 11.6.2.
- Pizza, Please!: `button[name="pizza-please"]`.
- Excluded tools: `select`.
- Must be vegetarian: `#default-checkbox`.
- Custom Pizza Name: `input#pizza-name`.
- Max Calories per Slice: `xpath=//label[normalize-space()='Max Calories per Slice']/preceding-sibling::input`; the page has three inputs with the same `floating_filled` id, so that id alone is ambiguous.

### QP-01 run by hand

- Pizza name: `Lab Pizza 20261122-004015`.
- Recommendation: Pizza cutter, 500 calories per slice.

| Step | Actual result | Pass or fail |
|---|---|---|
| 1 | QuickPizza heading read “Looking to break out of your pizza routine?” | Pass |
| 2 | Advanced showed Max Calories per Slice, Excluded tools, Must be vegetarian, and Custom Pizza Name. | Pass |
| 3 | Values showed 600, Knife excluded, vegetarian checked, and the unique pizza name. | Pass |
| 4 | The answer used the entered name, Pizza cutter, and 500 calories per slice. | Pass |
| 5 | Love it! showed “Please log in first.” | Pass |
| 6 | Admin sign-in showed “Latest pizza recommendations.” | Pass |
| 7 | Admin list contained `Lab Pizza 20261122-004015 (tool=Pizza cutter, ingredients_number=6)`. | Pass |

## Part 1: Selenium IDE

- Firefox / Selenium IDE add-on: not available on this computer, so the `.side` project was prepared and executed with `selenium-side-runner` rather than recorded or exported through the IDE window. The checked-in Java/JUnit file is an adapted translation, not a claim of a GUI-generated export.
- Node.js: v24.11.0; npm: 11.6.2; `selenium-side-runner`: 4.0.13.
- Step 1.4 intentional wrong check: expected `Received`, actual `Received!`; runner reported `Actual value 'Received!' did not match 'Received'` and `Tests: 1 failed, 1 total`. The final project restores `Received!`.
- Step 1.5: the recorded class target `css=.btn` is fragile because other buttons can share the class. The final project uses `xpath=//button[@type='submit']`, which identifies the form's submit action.
- Step 1.6: the QP-01 test contains the required 29 commands for steps 1-5. It waits for delayed page elements, generates a timestamped name, checks the entered restrictions and returned recommendation, and prints the pizza name with `echo`.
- Step 1.6 run 1: `Lab Pizza 20261122-005227`; both tests passed (2 passed, 0 failed). Web form: 2.998 s; QP-01: 5.498 s.
- Step 1.6 run 2: `Lab Pizza 20261122-005324`; both tests passed (2 passed, 0 failed). Web form: 3.242 s; QP-01: 5.543 s.
- Step 1.7 correction: an IDE Java export that types `600` must clear the pre-filled box first; otherwise it can become `1000600`. The checked-in adaptation calls `clear()` before `sendKeys("600")`; generated variable assertions also need to compare the runtime pizza name.
- Runner reports: `evidence/selenium-ide/run1/` and `run2/`; the intentional Step 1.4 failure report is in `evidence/selenium-ide/step1.4-failure/`.

## Part 4: Cypress

- Node.js: v24.11.0; npm: 11.6.2; Cypress: 16.2.1.
- Step 4.3 wrong-title failure: failed as expected. Cypress reported expected title `Web form - target page`, received `Wrong form - target page` (1 test failed, 0 passed); screenshot and runner output retained in `cypress/evidence/lesson-step-4.3/`.
- Step 4.6: the test intercepts `POST /api/pizza`, checks status 200 and that the request carries `maxCaloriesPerSlice: 600`, then compares the page's tool and calories with the API response.
- Step 4.7: the same test signs in on `/admin` and checks the new pizza line contains the same tool as the recommendation.
- Step 4.8 run 1: PASS (2 specs, 2 tests); 14.4 s; `Lab Pizza 20261121-181850`; API tool Scissors, 400 calories per slice; vegetarian true; request max 600.
- Step 4.8 run 2: PASS (2 specs, 2 tests); 14.1 s; `Lab Pizza 20261121-181905`; API tool Scissors, 525 calories per slice; vegetarian true; request max 600.
- Cypress evidence from both runs is retained in `cypress/evidence/run1/` and `run2/`, plus Cypress screenshots and videos in `cypress/cypress/screenshots/` and `cypress/cypress/videos/`. The Step 4.3 failure screenshot and output are in `cypress/evidence/lesson-step-4.3/`.
- Step 4.9 (optional): not run; the required runs use Chrome.
- Environment note: Cypress 16.2.1's Windows executable exited during its local smoke test in this managed environment. The committed workflow uses a hosted Ubuntu/Chrome runner to execute the same tests and retain their evidence.

## Part B: Reflection

1. **Why find Max Calories per Slice through its label?** QuickPizza gives all three number boxes the same `floating_filled` id, so an id selector matches three elements and cannot identify the right one. A unique id such as `max-calories-per-slice` on that input would let the test use `#max-calories-per-slice`. The label-based XPath works with the page as it is and also documents which field the test intends to fill.

2. **What kind of oracle is the Step 7 check?** It is a consistency oracle: the test compares the tool shown in the admin record with the tool returned to the customer in Step 4. It would catch a fault where the admin list stores or displays a different tool from the recommendation. The Selenium runs passed this comparison for both generated pizza names.

3. **How could the test check vegetarian?** It could assert that the `vegetarian` field in the `POST /api/pizza` response is `true`, and compare that value with the submitted checkbox. To verify the actual ingredients are vegetarian rather than trusting a server flag, the test would also need the page to expose ingredients or an independent ingredient classification source.

4. **How did the tools wait, author, and report QP-01?** The Selenium IDE project uses explicit `wait for element visible` commands before checking QuickPizza's delayed content; its runner JSON and terminal output show each test and command failure. Cypress retries queries and assertions, and `cy.intercept` waits for the API response without a fixed pause; its command log, videos, and screenshots make the full customer-to-admin flow visible. The Selenium QP-01 steps took about 5.5 seconds in each passing run; Cypress QP-01 steps took 14.4 s and 14.1 s in the two passing runs.

5. **Which tool fits Project 2?** Cypress is my choice because the test can compare the submitted request and server response with what the page displays, which catches faults that a click-only test misses. Its custom `adminLogin` command also keeps the staff/customer transition reusable, while screenshots and video retain a readable full-run record.

6. **Part 1: fragile and stable Submit targets.** The recorder's `css=.btn` target describes a visual class that can be shared by several buttons. The replacement `xpath=//button[@type='submit']` selects by the button's form role, so adding another styled button does not redirect the test.

7. **Part 4: why keep QP-01 in one test?** Cypress clears cookies before each test, and QuickPizza uses a cookie to keep the browser on the same server. If admin steps 6-7 were a second test, that cookie could be cleared and the new test could reach a server that does not contain the pizza created by the first test. Keeping all seven steps in one test preserves the customer-to-admin flow and its record.

## Section 5: Project 2 carry-over

The lab's QP-01 mapping carries over to a project system test: write expected results for every step, use stable locators and waits, and compare the same created record across customer and staff views. The synthetic pizza name demonstrates a timestamped test-data convention, while the screenshots and video demonstrate full-run evidence. Project 2 staff passwords must remain in environment variables and out of code, logs, and videos.
