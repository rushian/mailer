describe("Pagina Login", () => {
  it("Acesssar homepage", () => {
    cy.visit("/")
    cy.wait(150)
    
    var hoje = new Date().toLocaleString()
    var nomeArquivo = 'cypress/log/log\['+hoje.substring(0,10).replaceAll('/','-')+'\] '+ Cypress.spec.name.replace('\.spec\.js','') +'-its.txt';
    var data = '\[' + hoje + '\] teste executado\n'
    cy.writeFile(nomeArquivo, data,{ flag: 'a+' })

    var rst = cy.url().should("be.equal", "http://localhost:3000/")
  })

  it("Botão sign in é exibido", () => {
    cy.contains('Sign In').should('exist')
  })
})

