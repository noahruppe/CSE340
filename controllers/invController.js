const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}
const invDetail = {}
const errortry = {}
const inventory = {}


/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  }

/* ***************************
 *  grabe details
 * ************************** */
invDetail.buildByInvId = async function (req,res,next){
    const inv_id = req.params.invId
    const data = await invModel.getDetailsByInvId(inv_id)
    const lists = await utilities.buildInvIdInfo(data)
    let nav = await utilities.getNav()
    const makename = data[0].inv_make
    const modelname = data[0].inv_model
    const caryear = data[0].inv_year
    res.render("./inventory/details",{
        title: caryear + " " + makename + " " + modelname,
        nav,
        lists,
    })
}

//try this 
errortry.triggerError = (req, res, next) => {
    // Intentional error to simulate a 500 error
    throw new Error("Oh no there was a crash maybe try a different route");
};

/* ***************************
 *  build the management view
 * ************************** */
async function buildManagement (req,res,next){
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationDrop()
    res.render("inventory/management",{
        title: "Vehicle Management",
        nav,
        classificationSelect,
        errors: null,
    })
}
/* ***************************
 *  build the classification form view
 * ************************** */


async function buildClassificationForm (req,res,next){
    let nav = await utilities.getNav()
    res.render("inventory/add-classification",{
        title: "Add Classification",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */

async function submitClassification (req,res) {
    let nav = await utilities.getNav()
    const {classification_name} = req.body

    const regResult = await invModel.submitClassification(
        classification_name
    )
// res.status(200).redirect("/inv");
    

    if (regResult){
        req.flash(
            "notice",
            `Congratulations, a new classification has been made: ${classification_name}.`
        )
        res.status(200).render("inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
          })
    } else{
        req.flash("error", "Failed to add the classification. Please try again.");
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
          })
    }
}

/* ****************************************
*  build the drop down list
* *************************************** */

inventory.buildInventoryForm = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const drop = await utilities.buildClassificationDrop(data)
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      drop,
      errors:null
    })
  }

/* ****************************************
*  process the inventory 
* *************************************** */

async function submitInventory (req,res) {
    let nav = await utilities.getNav()
    const {inv_make,inv_model, inv_year, inv_description, inv_image,inv_thumbnail,inv_price, inv_miles,inv_color, classification_id} = req.body


    const regResult = await invModel.submitInventory(
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      )
    

    if (regResult){
        req.flash(
            "notice",
            `Congratulations, new inventory has been added: ${inv_make} ${inv_model}.`
        )
        res.status(200).render("inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
          })
    } else{
        req.flash("error", "Failed to add the classification. Please try again.");
        res.status(501).render("inventory/add-inventory", {
            title: "Registration",
            nav,
            errors: null,
          })
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */

invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
      return res.json(invData)
    } else {
      next(new Error("No data returned"))
    }
  }

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getDetailsByInvId(inv_id)
    const classificationSelect = await utilities.buildClassificationDrop(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  }
  


module.exports = {
    invCont,
    invDetail,
    errortry,
    buildManagement,
    buildClassificationForm,
    submitClassification,
    inventory,
    submitInventory,
    
};