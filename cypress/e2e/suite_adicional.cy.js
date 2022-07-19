describe("Login - testes adicionais", () => {
  it("Acesssar home novamente", () => {
    cy.visit("/")
    cy.wait(300)

    cy.url().should("be.equal", "http://localhost:3000/")
  })
})