// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")



router.get("/type/:classificationId", utilities.handleErrors(invController.invCont.buildByClassificationId));

router.get("/detail/:invId", utilities.handleErrors(invController.invDetail.buildByInvId));

// router.get("/trigger-error", utilities.handleErrors(invController.errortry.triggerError));

module.exports = router;