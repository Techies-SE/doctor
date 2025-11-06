class AdminPatientListPage {
    // Locators
    getAddNewPatientButton(){
        return cy.get('[data-cy="add-new-patient-button"]')
    }   
    
    getHnNumberInput(){
        return cy.get('[data-cy="hn-number-input"]');
    }

    getFullNameInput(){
        return cy.get('[data-cy="full-name-input"]')
    }

    getCitizenIdInput(){
        return cy.get('[data-cy="citizen-id-input"]')
    }

    getDOBInput(){
        return cy.get('[data-cy="dob-input"]')
    }

    getGenderInput(){
        return cy.get('[data-cy="gender-input"]')
    }

    getPhoneNumberInput(){
        return cy.get('[data-cy="phone-no-input"]')
    }

    getAddPatientButton(){
        return cy.get('[data-cy="add-patient-button"]')
    }

    getPatientModal(){
        return cy.get('[data-cy="patient-modal"]')
    }

    // Actions
    visit(){
         cy.visit('http://localhost:3000/');
    }

    selectGender(genderValue){
        this.getGenderInput().select(genderValue);
    }

    submitAddPatient(hnNum, fullName, cId, dOB, gender, phNo){
        this.getAddNewPatientButton().click();

        this.getHnNumberInput().type(hnNum);
        this.getFullNameInput().type(fullName);
        this.getCitizenIdInput().type(cId);
        this.getDOBInput().type(dOB);
        this.selectGender(gender);
        this.getPhoneNumberInput().type(phNo);

        this.getAddPatientButton().click();
    }
}

export default new AdminPatientListPage();