describe("Pagina Login", () => {
  it("Acesssar homepage", () => {
    cy.visit("/")
    cy.wait(150)
    
    var hoje = new Date().toLocaleString()
    var nomeArquivo = 'cypress/log/log\['+hoje.substring(0,10).replaceAll('/','-')+'\] '+ Cypress.spec.name.replace('\.spec\.js','') +'-its.txt';
    var data = '\[' + hoje + '\] teste executado\n'
    cy.writeFile(nomeArquivo, data,{ flag: 'a+' })

    cy.url().should("be.equal", "http://localhost:3000/")
  })

  it("Botão sign in não encontrado", () => {
    cy.contains('SignIn').should('exist')
  })

  it.skip("Teste pulado", () => {
    cy.contains('Sign In').should('exist')
  })
  
  it("Botão sign in encontrado", () => {
    cy.contains('Sign In').should('exist')
  })
})

