// QP-01 A custom pizza reaches the admin list
// Goal: check that a pizza request with restrictions gives a pizza that keeps
// them, that rating a pizza needs a login, and that the admin sees the new pizza.
function stamp() {
  const d = new Date()
  const two = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + two(d.getMonth() + 1) + two(d.getDate()) +
    '-' + two(d.getHours()) + two(d.getMinutes()) + two(d.getSeconds())
}

describe('QP-01 A custom pizza reaches the admin list', () => {
  it('follows the steps of QP-01', () => {
    // Step 1: open QuickPizza
    cy.visit('https://quickpizza.grafana.com')
    cy.get('h1').should('have.text', 'Looking to break out of your pizza routine?')

    // Step 2: turn on Advanced
    cy.contains('label', 'Advanced').click()
    cy.contains('label', 'Max Calories per Slice').should('be.visible')
    cy.contains('label', 'Excluded tools').should('be.visible')
    cy.contains('label', 'Must be vegetarian').should('be.visible')
    cy.contains('label', 'Custom Pizza Name').should('be.visible')

    // Step 3: fill in the restrictions and the name
    const pizzaName = 'Lab Pizza ' + stamp()
    cy.contains('label', 'Max Calories per Slice')
      .siblings('input')
      .clear()
      .type('600')
      .should('have.value', '600')
    cy.get('select').select('Knife')
    cy.contains('option', 'Knife').should('be.selected')
    cy.get('#default-checkbox').check().should('be.checked')
    cy.get('input#pizza-name').type(pizzaName)
    cy.get('input#pizza-name').should('have.value', pizzaName)

    // Step 4: ask for a pizza and compare the page with the API answer
    cy.intercept('POST', '/api/pizza').as('pizza')
    cy.get('button[name="pizza-please"]').click()
    cy.wait('@pizza').its('response.statusCode').should('eq', 200)
    cy.get('@pizza').then(({ request, response }) => {
      expect(request.body.maxCaloriesPerSlice).to.equal(600)
      const { pizza, calories } = response.body
      cy.env(['LAB_RUN']).then(({ LAB_RUN }) => {
        const run = LAB_RUN || 'local'
        cy.writeFile(`evidence/${run}/pizza-name.txt`, pizzaName)
        cy.writeFile(`evidence/${run}/api-response.json`, {
          requestMaxCaloriesPerSlice: request.body.maxCaloriesPerSlice,
          pizzaName: pizza.name,
          tool: pizza.tool,
          calories,
          vegetarian: response.body.vegetarian,
        })
      })
      cy.get('#recommendations').should('contain', 'Name: ' + pizzaName)
      cy.contains('#recommendations p', 'Tool:').should('have.text', 'Tool: ' + pizza.tool)
      cy.contains('#recommendations p', 'Calories per slice:')
        .should('have.text', 'Calories per slice: ' + calories)
      expect(pizza.name).to.equal(pizzaName)
      expect(pizza.tool).not.to.equal('Knife')
      expect(calories).to.be.at.most(600)
      cy.wrap(pizza.tool).as('tool')
    })
    cy.screenshot('qp01-step4-recommendation')

    // Step 5: rate the pizza without logging in
    cy.get('button[name="rate-5"]').click()
    cy.get('#rate-result').should('have.text', 'Please log in first.')
    cy.screenshot('qp01-step5-login-needed')

    // Step 6: log in on the admin page
    cy.env(['QUICKPIZZA_ADMIN_USERNAME', 'QUICKPIZZA_ADMIN_PASSWORD'])
      .then(({ QUICKPIZZA_ADMIN_USERNAME, QUICKPIZZA_ADMIN_PASSWORD }) => {
        expect(QUICKPIZZA_ADMIN_USERNAME, 'practice admin user').to.be.a('string').and.not.be.empty
        expect(QUICKPIZZA_ADMIN_PASSWORD, 'practice admin password').to.be.a('string').and.not.be.empty
        cy.adminLogin(QUICKPIZZA_ADMIN_USERNAME, QUICKPIZZA_ADMIN_PASSWORD)
      })
    cy.contains('Latest pizza recommendations').should('be.visible')

    // Step 7: find the new pizza and confirm the same tool
    cy.get('@tool').then((tool) => {
      cy.contains('li', pizzaName).should('contain', '(tool=' + tool + ',')
    })
    cy.screenshot('qp01-step7-admin-list')
  })
})
