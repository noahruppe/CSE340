const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */

async function buildLogIn (req,res,next){
    let nav = await utilities.getNav()
    res.render('account/login', {
        title: "Login",
        nav,
        errors: null,
    })
}


/* ****************************************
*  deliver the register view
* *************************************** */

async function buildRegister (req,res,next){
    let nav = await utilities.getNav()
    res.render('account/register',{
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    let hashedPassword
    try{
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error){
      req.flash("Sorry there was an error processing the registration.")
      res.status(500).render("account/register",{
        title: "Registration",
        nav,
        errors: null,
      })
    }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
  }

/* ****************************************
 *  Process login request
 * ************************************ */

async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/") 
   
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
*  once logged in 
* *************************************** */

async function accountManagement(req, res, next) {
  const accountData = res.locals.accountData;
  let nav = await utilities.getNav();
  if (!accountData) {
      req.flash("notice", "No account data found.");
      return res.redirect("/account/login");
  }
  const greeting = await utilities.buildGreeting(accountData);
  res.render('account/account-management', {
      title: "Account Management",
      nav,
      greeting,
      errors: null,
  });
}

/* ****************************************
*  build update view
* *************************************** */
async function buildUpdateView (req,res,next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData
  if(!accountData.account_id){
    req.flash("notice", "No account found")
    res.redirect("account/login")
  }else{
    res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
*  logic to update account
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email, account_password, formType } = req.body;
  const accountData = res.locals.accountData;

  if (!accountData || !accountData.account_id) {
    req.flash("notice", "Account not found");
    return res.status(400).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      account_password,
      accountData,
    });
  }

  try {
    if (formType === "accountInfo") {
      // Update account information logic
      const updatedAccount = await accountModel.updateAccount({
        account_id: accountData.account_id,
        account_firstname,
        account_lastname,
        account_email,
      });

      if (updatedAccount) {
        // Regenerate JWT token with updated account info
        const newAccessToken = jwt.sign({
          account_id: updatedAccount.account_id,
          account_firstname: updatedAccount.account_firstname,
          account_lastname: updatedAccount.account_lastname,
          account_email: updatedAccount.account_email,
          account_type: updatedAccount.account_type, 
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

        // Set the token in a cookie
        res.cookie("jwt", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development', // Only secure in production
          maxAge: 3600 * 1000,
        });

        req.flash("notice", "The account update was successful.");
        return res.redirect("/account/");
      } else {
        req.flash("notice", "Failed to update account. Please try again.");
        return res.render("account/update", {
          title: "Edit Account",
          nav,
          errors: null,
          account_firstname,
          account_lastname,
          account_email,
          accountData,
        });
      }

    } else if (formType === "passwordChange") {
      // Update password logic
      if (!account_password) {
        req.flash("error", "Password is required.");
        return res.render("account/update", {
          title: "Change Password",
          nav,
          errors: null,
          account_id: accountData.account_id,
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(account_password, 10);

      // Update password in the database
      const updateResult = await accountModel.updatePassword(accountData.account_id, hashedPassword);

      if (updateResult) {
        req.flash("notice", "Your password has been successfully updated.");
        return res.redirect("/account/");
      } else {
        req.flash("notice", "Failed to update password. Please try again.");
        return res.render("account/update", {
          title: "Change Password",
          nav,
          errors: null,
          account_id: accountData.account_id,
        });
      }
    }
  } catch (error) {
    console.error("Error updating account: ", error);
    req.flash("error", "There was an issue updating your account. Please try again.");
    return res.status(500).render("account/update", {
      title: formType === "accountInfo" ? "Edit Account" : "Change Password",
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}




module.exports = {buildLogIn, buildRegister,registerAccount,accountLogin, accountManagement, buildUpdateView, updateAccount,}