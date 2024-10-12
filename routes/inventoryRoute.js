// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/inventory-validation")



router.get("/type/:classificationId", utilities.handleErrors(invController.invCont.buildByClassificationId));

router.get("/detail/:invId", utilities.handleErrors(invController.invDetail.buildByInvId));

router.get("/trigger-error", utilities.handleErrors(invController.errortry.triggerError));

router.get("/", utilities.handleErrors(invController.buildManagement));

router.get("/classification", utilities.handleErrors(invController.buildClassificationForm));

router.get("/inventory", utilities.handleErrors(invController.inventory.buildInventoryForm));

router.post("/classification", 
    regValidate.classificationRules(),
    regValidate.checkClassificationData,
    utilities.handleErrors(invController.submitClassification)
)

router.post("/inventory",
    regValidate.inventoryRules(),
    regValidate.checkInventoryData,
    utilities.handleErrors(invController.submitInventory)
)

module.exports = router;