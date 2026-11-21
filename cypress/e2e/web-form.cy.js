describe('Selenium practice web form', () => {
  it('submits text and a selection and displays the result', () => {
    cy.visit('https://www.selenium.dev/selenium/web/web-form.html')
    cy.get('h1').should('have.text', 'Web form')
    cy.get('#my-text-id').type('Hello Selenium')
    cy.get('[name="my-select"]').select('Two')
    cy.get('button[type="submit"]').click()
    cy.get('#message').should('have.text', 'Received!')
    cy.title().should('eq', 'Web form - target page')
  })
})
