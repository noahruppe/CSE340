const utilities = require("../CSE340/utilities/");

/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const Util = require("./utilities/index");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static);
// index route
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  let message; // Declare a variable for the message

  // Custom messages for different error types
  if (err.status === 404) {
    message = err.message; // Specific message for 404 errors
  } else if (err.status === 500) {
    message = "Oh no! There was a server error. Please try again later."; // Message for 500 errors
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?"; // General message for other errors
  }

  res.render("errors/error", {
    title: err.status || "Server Error", // Use the status for the title
    message, // Use the determined message
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Use Render's dynamic PORT variable for deployment
 *************************/
const port = process.env.PORT || 4000; // Default to 4000 for local testing
const host = '0.0.0.0'; // Bind to all IP addresses

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, host, () => {
  console.log(`App listening on ${host}:${port}`);
});
