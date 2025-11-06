import LoginPage from "../support/pageObjects/LoginPage";
import AdminPatientsListPage from "../support/pageObjects/AdminPatientsListPage";

describe("Admin's Tasks", () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  it("Patient created successfully", () => {
    const role = "Admin";
    LoginPage.submitLogin("admin1@gmail.com", "0624681012", role);
    cy.url().should("include", "/patient");

    // Intercept the patient creation API
    cy.intercept("POST", "**/patients").as("createPatient");

    cy.on("window:alert", (alertText) => {
      expect(alertText).to.equal("Patient created successfully!");
    });

    AdminPatientsListPage.submitAddPatient(
      "000000009",
      "Han Thaw",
      "6759012679624",
      "1995-10-15",
      "male",
      "0600372574"
    );
    cy.wait("@createPatient");
  });

  it("Patient duplicated", () => {
    const role = "Admin";
    LoginPage.submitLogin("admin1@gmail.com", "0624681012", role);
    cy.url().should("include", "/patient");
    // Intercept duplicate patient creation request
    cy.intercept("POST", "**/patients").as("createPatient");
    cy.on("window:alert", (alertText) => {
      expect(alertText).to.include("Failed to create patient:");
    });
    AdminPatientsListPage.submitAddPatient(
      "000000009",
      "Han Thaw",
      "6759012679624",
      "1995-10-15",
      "male",
      "0600372574"
    );
    // Wait for the API response and assert status code or error message
    cy.wait("@createPatient").its("response.statusCode").should("eq", 409); 
  });
});
