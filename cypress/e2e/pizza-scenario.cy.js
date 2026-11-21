describe('QP-01: A custom pizza reaches the admin list', () => {
  const requiredEnv = ['QUICKPIZZA_ADMIN_USERNAME', 'QUICKPIZZA_ADMIN_PASSWORD']

  before(() => {
    const missing = requiredEnv.filter((key) => !Cypress.env(key))
    expect(missing, 'required local environment variables').to.deep.equal([])
  })

  it('keeps restrictions, requires login to rate, and appears in admin', () => {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
    const pizzaName = `Lab Pizza ${stamp}`

    cy.visit('/')
    cy.get('h1').should('contain.text', 'Looking to break out of your pizza routine?')

    cy.contains('label', 'Advanced').click()
    cy.contains('label', 'Max Calories per Slice').should('be.visible')
    cy.contains('label', 'Excluded tools').should('be.visible')
    cy.contains('label', 'Must be vegetarian').should('be.visible')
    cy.get('#pizza-name').should('be.visible')

    cy.contains('label', 'Max Calories per Slice').parent().find('input').clear().type('600')
    cy.get('select').select(['Knife'])
    cy.get('#default-checkbox').check()
    cy.get('#pizza-name').clear().type(pizzaName)

    cy.contains('label', 'Max Calories per Slice').parent().find('input').should('have.value', '600')
    cy.get('#default-checkbox').should('be.checked')
    cy.get('#pizza-name').should('have.value', pizzaName)
    cy.get('select').should('contain.text', 'Knife')

    cy.get('[name="pizza-please"]').click()
    cy.contains('p', `Name: ${pizzaName}`).should('be.visible')
    cy.contains('p', /^Tool:/).should('be.visible').and('not.contain.text', 'Knife')
    cy.contains('p', /^Calories per slice:/).invoke('text').then((text) => {
      const calories = Number.parseInt(text.split(':')[1].trim(), 10)
      expect(calories).to.be.at.most(600)
    })
    cy.contains('p', /^Tool:/).invoke('text').as('recommendedTool')

    cy.get('#rate-5').click()
    cy.get('#rate-result').should('contain.text', 'Please log in first.')

    cy.visit('/admin')
    cy.get('input[name="username"]').type(Cypress.env('QUICKPIZZA_ADMIN_USERNAME'))
    cy.get('input[name="password"]').type(Cypress.env('QUICKPIZZA_ADMIN_PASSWORD'), { log: false })
    cy.get('button[type="submit"]').click()
    cy.contains('Latest pizza recommendations').should('be.visible')
    cy.get('@recommendedTool').then((toolLine) => {
      const tool = toolLine.replace(/^Tool:\s*/, '').trim()
      cy.contains('li', pizzaName).should('be.visible').and('contain.text', tool)
    })
  })
})
