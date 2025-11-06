class LoginPage {
    // 1. Locators (Methods to get Cypress elements)
    getUsernameInput() {
        // Use your robust data-cy selector
        return cy.get('[data-cy="username-input"]');
    }

    getPasswordInput() {
        return cy.get('[data-cy="password-input"]');
    }

    getLoginButton() {
        return cy.get('[data-cy="login-button"]');
    }

    getToggleSwtich(){
        return cy.get('[data-cy="toggle-switch"]')
    }

    getRoleToggleInput() {
        return cy.get('[data-cy="toggle-switch"]');
    }

    getErrorMessage() {
        // This is the locator Cypress will use to find the element
        return cy.get('[data-cy="login-error-message"]');
    }

    // 2. Actions (Methods that perform common user tasks)
    visit() {
        cy.visit('http://localhost:3000/');
    }

    selectRole(role){
        const forceOption = { force: true };
        if(role.toLowerCase() === 'doctor') {
            this.getRoleToggleInput().check(forceOption);
        }else if(role.toLowerCase() === 'admin'){
            this.getRoleToggleInput().uncheck(forceOption);
        }else{
            throw new Error(`Invalid role '${role}' provided to selectRole.`);
        }
    }

    // A reusable login method
    submitLogin(username, password, role) {
        this.selectRole(role);
        this.getUsernameInput().type(username);
        this.getPasswordInput().type(password);
        this.getLoginButton().click();
    }
}

// Export a single, reusable instance of the class
export default new LoginPage();