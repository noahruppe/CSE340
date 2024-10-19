const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}
const invDetail = {}
const errortry = {}
const inventory = {}


/* ***************************
 *  Build inventory by classification view
 * ************************** */
// invCont.buildByClassificationId = async function (req, res, next) {
//     const classification_id = req.params.classificationId
//     const data = await invModel.getInventoryByClassificationId(classification_id)
//     const grid = await utilities.buildClassificationGrid(data)
//     let nav = await utilities.getNav()
//     const className = data[0].classification_name
//     res.render("./inventory/classification", {
//       title: className + " vehicles",
//       nav,
//       grid,
//     })
//   }
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    let nav = await utilities.getNav();
    if (!data || data.length === 0) {
        return res.render("./inventory/classification", {
            title: "No Vehicles Found",
            nav,
            grid: null,
            message: "No vehicles found for this classification.",
        });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const className = data[0].classification_name; 
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
}


/* ***************************
 *  grabe details
 * ************************** */
invDetail.buildByInvId = async function (req,res,next){
    const inv_id = req.params.invId
    const data = await invModel.getDetailsByInvId(inv_id)
    const data2 = await invModel.getDetailsByInvId1(inv_id)
    const lists = await utilities.buildInvIdInfo(data,data2)
    let nav = await utilities.getNav()
    const makename = data2.inv_make
    const modelname = data2.inv_model
    const caryear = data2.inv_year
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
    const drop = await utilities.buildClassificationDrop()
    res.render("inventory/management",{
        title: "Vehicle Management",
        nav,
        drop,
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
        const drop = await utilities.buildClassificationDrop()
        let nav = await utilities.getNav()
        res.status(200).render("inventory/management", {
            title: "Vehicle Management",
            nav,
            drop,
            nav,
            errors: null,
          })
    } else{
        const drop = await utilities.buildClassificationDrop()
        req.flash("error", "Failed to add the classification. Please try again.");
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            drop,
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
        const drop = await utilities.buildClassificationDrop()
        res.status(200).render("inventory/management", {
            title: "Vehicle Management",
            nav,
            drop,
            errors: null,
          })
    } else{
        const drop = await utilities.buildClassificationDrop()
        req.flash("error", "Failed to add the classification. Please try again.");
        res.status(501).render("inventory/add-inventory", {
            title: "Registration",
            nav,
            drop,
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
    const itemData = await invModel.getDetailsByInvId1(inv_id)
    const drop = await utilities.buildClassificationDrop(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      drop: drop,
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
  
/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req,res,next){
    let nav = await utilities.getNav()
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
      } = req.body
      const updateResult = await invModel.updateInventory(
        inv_id,  
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
      )

      if (updateResult){
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `the ${itemName} was successfully updated.`)
        res.redirect("/inv/") 
      }else{
        const drop = await utilities.buildClassificationDrop(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry the insert failed.")
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            drop,
            errors: null,
            inv_id,
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
        })
      }

}


/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getDetailsByInvId1(inv_id)
    const drop = await utilities.buildClassificationDrop(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
      drop: drop,
    })
  }

  /* ***************************
 *  delete the inventory command
 * ************************** */
invCont.deleteInventory = async function (req,res,next){
    let nav = await utilities.getNav()
    
    
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_price,
        inv_year,
      } = req.body
      const deleteResult = await invModel.deleteInventory(
        inv_id,  
        inv_make,
        inv_model,
        inv_price,
        inv_year,
      )

      if (deleteResult){
        const itemName = deleteResult.inv_make + " " + deleteResult.inv_model
        req.flash("notice", `the ${itemName} was successfully deleted.`)
        res.redirect("/inv/") 
      }else{
        const drop = await utilities.buildClassificationDrop(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry the deletion failed.")
        res.status(501).redirect("/delete/:inv_id", {
            title: "Delete " + itemName,
            nav,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
            drop,
        })
      }

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