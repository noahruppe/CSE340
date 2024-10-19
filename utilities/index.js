const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }

/* ****************************************
 build for details 
 **************************************** */
 Util.buildInvIdInfo = async function(data) {
    let lists;
    if(data.length > 0) {
        lists = '<div id="inv-details-display">';
        data.forEach(vehicle => {
            lists += '<img src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_name + '">';
            lists += '<ul id="groupings">';
            lists += '<li>';
            lists += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' ' + 'Details</h2>';
            lists += '<span>Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
            lists += '<p class="p1">Description: ' + vehicle.inv_description + '</p>';
            lists += '<p class="p2">Color: ' + vehicle.inv_color + '</p>';
            lists += '<p class="p3">Miles: ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</p>';
            lists += '</li>';
            lists += '</ul>'; 
        });
        lists += '</div>'; 
    } else {
        lists += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return lists;
}

/* ****************************************
 build for drop down 
 **************************************** */
 Util.buildClassificationDrop = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let drop =
    '<select name="classification_id" id="drop" required>'
  drop += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    drop += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      drop += " selected "
    }
    drop += ">" + row.classification_name + "</option>"
  })
  drop += "</select>"
  return drop
}


/* ****************************************
 name for welcome 
 **************************************** */
 
 Util.buildGreeting = async function(accountData) {
  let greeting;

  if (accountData) {
      if (accountData.account_type === "Client") {
          greeting = `<h2>Welcome, ${accountData.account_firstname}</h2>`;
          greeting += `<p>You're logged in`;
          greeting += `<p><a href="/account/update/${accountData.account_id}">Edit Account Information</a></p>`;
      } else if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
          greeting = `<h2>Welcome, ${accountData.account_firstname}</h2>`;
          greeting += `<p>You're logged in`;
          greeting += `<p><a href="/account/update/${accountData.account_id}">Edit Account Information</a></p>`;
          greeting += `<h3>Inventory Management</h3>`;
          greeting += `<p><a href="/inv/">Access Inventory Management</a></p>`;
      }
  } else {
      greeting = '<p class="notice">No account details available.</p>';
  }

  return greeting; // Return the constructed greeting
}



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */

Util.handleErrors = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

  /* ****************************************
 *  account Type
 * ************************************ */

  Util.accountType = (req, res, next) => {
    if (res.locals.loggedin) {
      const account_type = res.locals.accountData.account_type;
      
      if (account_type === "Employee" || account_type === "Admin") {
        return next(); // User has the right access, proceed to the next middleware
      } else {
        // User is logged in but does not have sufficient access
        req.flash("error", "Sign into an account with higher access");
        return res.redirect("/account/login"); // Redirect to the login page
      }
    } else {
      // User is not logged in
      req.flash("error", "Please sign in to access this page.");
      return res.redirect("/account/login"); // Redirect to the login page
    }
  };
  
  





module.exports = Util