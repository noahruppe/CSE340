// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/inventory-validation")



router.get("/type/:classificationId", utilities.handleErrors(invController.invCont.buildByClassificationId));

router.get("/detail/:invId", utilities.handleErrors(invController.invDetail.buildByInvId));

router.get("/trigger-error", utilities.handleErrors(invController.errortry.triggerError));

router.get("/", utilities.accountType, utilities.handleErrors(invController.buildManagement));

router.get("/classification", utilities.handleErrors(invController.buildClassificationForm));

router.get("/add-inventory", utilities.handleErrors(invController.inventory.buildInventoryForm));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.invCont.getInventoryJSON))

router.get("/edit/:inv_id", utilities.handleErrors(invController.invCont.editInventoryView))

router.get("/delete/:inv_id", utilities.handleErrors(invController.invCont.deleteInventoryView))

router.get("/search", utilities.handleErrors(invController.buildSearchView))

router.post("/classification", 
    regValidate.classificationRules(),
    regValidate.checkClassificationData,
    utilities.handleErrors(invController.submitClassification)
)

router.post("/add-inventory",
    regValidate.inventoryRules(),
    regValidate.checkInventoryData,
    utilities.handleErrors(invController.submitInventory)
)

router.post("/edit/:inv_id",
    regValidate.inventoryRules(),
    regValidate.checkUpdatedData,
    utilities.handleErrors(invController.invCont.updateInventory)
)

router.post("/delete/:inv_id",
    utilities.handleErrors(invController.invCont.deleteInventory)
)

router.post(
    "/search",
    regValidate.searchRules(),
    regValidate.searchCheck,
    utilities.handleErrors(invController.invCont.searchInventory)
)

module.exports = router;