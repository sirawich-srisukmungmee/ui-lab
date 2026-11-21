$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$cypressRoot = Join-Path $repoRoot 'cypress'
$evidenceRoot = Join-Path $cypressRoot 'evidence'
$resultsPath = Join-Path $repoRoot 'RESULTS.md'

Push-Location $cypressRoot
try {
    $lessonSpec = Join-Path 'cypress/e2e' 'web-form-step-4-3-failure.cy.js'
    $source = Get-Content -Raw 'cypress/e2e/web-form.cy.js'
    $wrongTitle = $source.Replace('Web form - target page', 'Wrong form - target page')
    if ($wrongTitle -eq $source) { throw 'Could not prepare the Step 4.3 wrong-title check.' }
    Set-Content -Path $lessonSpec -Value $wrongTitle -Encoding utf8

    $lessonDir = Join-Path $evidenceRoot 'lesson-step-4.3'
    New-Item -ItemType Directory -Force $lessonDir | Out-Null
    $lessonOutput = & npx cypress run --browser chrome --spec $lessonSpec 2>&1
    $lessonExitCode = $LASTEXITCODE
    $lessonOutput | Set-Content -Path (Join-Path $lessonDir 'wrong-title-output.txt') -Encoding utf8
    if ($lessonExitCode -eq 0 -or (($lessonOutput -join "`n") -notmatch 'Wrong form - target page')) {
        throw 'Step 4.3 did not fail on the intentionally wrong page title.'
    }

    $failureImage = Get-ChildItem -Path 'cypress/screenshots' -Filter '*.png' -Recurse | Select-Object -First 1
    if (-not $failureImage) { throw 'The Step 4.3 failure screenshot was not created.' }
    Copy-Item -LiteralPath $failureImage.FullName -Destination (Join-Path $lessonDir 'wrong-title.png') -Force
    Remove-Item -LiteralPath $lessonSpec -Force
    foreach ($generated in @('cypress/screenshots', 'cypress/videos')) {
        if (Test-Path -LiteralPath $generated) { Remove-Item -LiteralPath $generated -Recurse -Force }
    }

    $runSummaries = @{}
    foreach ($run in @('run1', 'run2')) {
        $runDir = Join-Path $evidenceRoot $run
        New-Item -ItemType Directory -Force $runDir | Out-Null
        $env:CYPRESS_LAB_RUN = $run
        $timer = [System.Diagnostics.Stopwatch]::StartNew()
        $output = & npx cypress run --browser chrome 2>&1
        $exitCode = $LASTEXITCODE
        $timer.Stop()
        $output | Set-Content -Path (Join-Path $runDir 'runner-output.txt') -Encoding utf8
        if ($exitCode -ne 0) { throw "Cypress $run failed. See $runDir/runner-output.txt." }

        $runScreenshots = 'cypress/screenshots'
        $runVideos = 'cypress/videos'
        if (-not (Test-Path -LiteralPath $runScreenshots) -or -not (Test-Path -LiteralPath $runVideos)) {
            throw "Cypress $run did not save its screenshots and videos."
        }
        Copy-Item -LiteralPath $runScreenshots -Destination (Join-Path $runDir 'screenshots') -Recurse -Force
        Copy-Item -LiteralPath $runVideos -Destination (Join-Path $runDir 'videos') -Recurse -Force

        $pizzaPath = Join-Path $runDir 'pizza-name.txt'
        $apiPath = Join-Path $runDir 'api-response.json'
        if (-not (Test-Path -LiteralPath $pizzaPath) -or -not (Test-Path -LiteralPath $apiPath)) {
            throw "Cypress $run did not write its QP-01 run details."
        }
        $pizzaName = (Get-Content -Raw $pizzaPath).Trim()
        $api = Get-Content -Raw $apiPath | ConvertFrom-Json
        if ($api.pizzaName -ne $pizzaName -or $api.requestMaxCaloriesPerSlice -ne 600 -or $api.vegetarian -ne $true) {
            throw "Cypress $run QP-01 API data did not match the required request and result."
        }
        $runSummaries[$run] = [pscustomobject]@{
            pizzaName = $pizzaName
            tool = $api.tool
            calories = $api.calories
            elapsedSeconds = [Math]::Round($timer.Elapsed.TotalSeconds, 1)
            result = 'PASS (2 specs, 2 tests)'
        }
        $runSummaries[$run] | ConvertTo-Json | Set-Content -Path (Join-Path $runDir 'summary.json') -Encoding utf8
    }

    $lessonLine = ($lessonOutput | Where-Object { $_ -match 'Wrong form - target page' } | Select-Object -First 1).ToString().Trim()
    if (-not $lessonLine) { $lessonLine = 'The intentionally wrong title assertion failed as expected.' }
    $results = Get-Content -Raw $resultsPath
    $run1 = $runSummaries.run1
    $run2 = $runSummaries.run2
    $results = $results.Replace('<!-- CYPRESS STEP 4.3 -->', $lessonLine)
    $results = $results.Replace('<!-- CYPRESS RUN 1 -->', "$($run1.result); $($run1.elapsedSeconds)s; $($run1.pizzaName); API tool $($run1.tool), $($run1.calories) calories.")
    $results = $results.Replace('<!-- CYPRESS RUN 2 -->', "$($run2.result); $($run2.elapsedSeconds)s; $($run2.pizzaName); API tool $($run2.tool), $($run2.calories) calories.")
    Set-Content -Path $resultsPath -Value $results -Encoding utf8
}
finally {
    Remove-Item -LiteralPath (Join-Path 'cypress/e2e' 'web-form-step-4-3-failure.cy.js') -Force -ErrorAction SilentlyContinue
    Remove-Item Env:CYPRESS_LAB_RUN -ErrorAction SilentlyContinue
    Pop-Location
}
