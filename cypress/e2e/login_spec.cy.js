import LoginPage from "../support/pageObjects/LoginPage";
describe('Login Test Suite (Using POM)', () => {

    beforeEach(() => {
        // Use the action method from the Page Object
        LoginPage.visit();
    });

    it('Successful log in with valid admin credentials', () => {
      const role = 'Admin'
        // 2. USE the high-level action method
        LoginPage.submitLogin('admin1@gmail.com', '0624681012', role);
        
        // Assertions remain in the test file
        cy.url().should('include', '/patient');
        //cy.get('[data-cy="welcome-message"]').should('be.visible');
    });

    it('Failed login with invalid admin credentials', () => {
      const role = 'Admin'
        // 2. USE the high-level action method again
        LoginPage.submitLogin('baduser', 'wrongpass', role);
        
        // Assertions remain in the test file
        LoginPage.getErrorMessage().should('be.visible');
    });

    it('Successful log in with valid doctor credentials', () => {
      const role = 'Doctor'
        // 2. USE the high-level action method
        LoginPage.submitLogin('hanmindr@gmail.com', 'password123', role);
        
        // Assertions remain in the test file
        cy.url().should('include', '/dashboard');
        //cy.get('[data-cy="welcome-message"]').should('be.visible');
    });

    it('Failed login with invalid doctor credentials', () => {
      const role = 'Doctor'
        // 2. USE the high-level action method again
        LoginPage.submitLogin('baduser', 'wrongpass', role);
        
        // Assertions remain in the test file
        LoginPage.getErrorMessage().should('be.visible');
    });

    it('Failed doctor login using valid admin credentials', () => {
      const role = 'Doctor'
        // 2. USE the high-level action method again
        LoginPage.submitLogin('admin1@gmail.com', '0624681012', role);
        
        // Assertions remain in the test file
        LoginPage.getErrorMessage().should('be.visible');
    });

    it('Failed admin login using valid doctor credentials', () => {
      const role = 'Admin'
        // 2. USE the high-level action method again
        LoginPage.submitLogin('hanmindr@gmail.com', 'password123', role);
        
        // Assertions remain in the test file
        LoginPage.getErrorMessage().should('be.visible');
    });


});