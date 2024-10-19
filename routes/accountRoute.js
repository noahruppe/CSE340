// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.checkJWTToken, utilities.handleErrors(accountController.buildLogIn));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.accountManagement))

router.get("/update/:account_id", utilities.checkJWTToken, utilities.handleErrors(accountController.buildUpdateView))

router.get('/logout', utilities.checkJWTToken, accountController.timeToLogOut);

// post 
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

  // Process the login attempt
router.post(
    "/login",
    utilities.handleErrors(accountController.accountLogin)
)

//process the update account

router.post(
    "/update/:account_id",
    utilities.checkJWTToken,
    regValidate.UpdateRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(accountController.updateAccount),
)



module.exports = router;