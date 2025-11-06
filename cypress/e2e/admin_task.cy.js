import LoginPage from "../support/pageObjects/LoginPage";
import AdminPatientsListPage from "../support/pageObjects/AdminPatientsListPage";

describe('Admin\'s Tasks', () => {
  beforeEach(() => {
          LoginPage.visit();
      });

  it('Patient created successfully', ()=>{
    const role = "Admin";
    LoginPage.submitLogin('admin1@gmail.com', '0624681012', role);
    cy.url().should('include', '/patient');
    AdminPatientsListPage.submitAddPatient('000000001', 'Han Thaw', '6759014671024', '1995-10-15', 'male', '0640371574');
    cy.on('windows:alert', (alertText)=>{
      expect(alertText).to.equal('Patient created successfully!');
    })
  })
})