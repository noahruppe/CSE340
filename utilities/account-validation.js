const utilities = require(".")
const accountModel = require("../models/account-model")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */

validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }


//log in validation 

validate.loginRules = () => {
    return [
      // Validate the email field (email format required)
      body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
  
      // Validate the password field (non-empty password required)
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password is required.")
    ]
  }

//check data 

validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    
    // Check for validation errors
    errors = validationResult(req)
    
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        account_email,  
      })
      return
    }
    
    next()
  }


// make the update rules 
validate.UpdateRules = () => {
    return [
        // Firstname: validate only if it's changed from the original
        body("account_firstname")
            .custom((value, { req }) => {
                // Access accountData from res.locals
                const originalFirstname = req.res.locals.accountData.account_firstname; // Correctly using res
                if (value !== originalFirstname) {
                    if (!value.trim()) {
                        throw new Error("Please provide a valid first name.");
                    }
                    if (value.length < 1) {
                        throw new Error("First name must be at least 1 character long.");
                    }
                }
                return true; // No validation if unchanged
            }),

        // Lastname: validate only if it's changed from the original
        body("account_lastname")
            .custom((value, { req }) => {
                const originalLastname = req.res.locals.accountData.account_lastname; // Correctly using res
                if (value !== originalLastname) {
                    if (!value.trim()) {
                        throw new Error("Please provide a valid last name.");
                    }
                    if (value.length < 2) {
                        throw new Error("Last name must be at least 2 characters long.");
                    }
                }
                return true; // No validation if unchanged
            }),

        // Email: validate only if it's changed from the original
        body("account_email")
            .custom(async (value, { req }) => {
                const originalEmail = req.res.locals.accountData.account_email; // Correctly using res
                if (value !== originalEmail) {
                    if (!value.trim()) {
                        throw new Error("A valid email is required.");
                    }
                    const emailExists = await accountModel.checkExistingEmail(value);
                    if (emailExists) {
                        throw new Error("Email already exists. Please use a different email.");
                    }
                }
                return true; // No validation if unchanged
            }),
    ];
};

  



//check update account info 

validate.checkUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = validationResult(req) // Get validation errors
    
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      
      // If there are validation errors, re-render the form with the errors and original values
      return res.render("account/update", {
        errors,                      
        title: "Edit Account",        
        nav,                           
        account_firstname,             
        account_lastname,              
        account_email,                 
      })
    }

    next() // Proceed to the next middleware if no errors
}


//update the password rules 

validate.UpdatePasswordRules = () => {
    return [
      // Password is optional, but if provided, it must meet the strong password requirements
      body("account_password")
        .optional({ checkFalsy: true }) // Only validate if the password is provided
        .trim()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ];
  }


  // password check 

  validate.checkPasswordData = async (req, res, next) => {
    const { account_password } = req.body;
    let errors = validationResult(req); // Get validation errors

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        
        // If there are validation errors for the password, re-render the password update form
        return res.render("account/update", {
            errors, 
            title: "Change Password", 
            nav, 
            account_password, 
        });
    }

    next(); // Proceed if no errors
};

  
  
  module.exports = validate