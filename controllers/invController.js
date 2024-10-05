const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}
const invDetail = {}
const errortry = {}

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
// invDetail.buildByInvId = async function (req,res,next){
//     const inv_id = req.params.invId
//     const data = await invModel.getDetailsByInvId(inv_id)
//     const lists = await utilities.buildInvIdInfo(data)
//     let nav = await utilities.getNav()
//     const makename = data[0].inv_make
//     const modelname = data[0].inv_model
//     const caryear = data[0].inv_year
//     res.render("./inventory/details",{
//         title: caryear + " " + makename + " " + modelname,
//         nav,
//         lists,
//     })
// }

// //try this 
// errortry.triggerError = (req, res, next) => {
//     // Intentional error to simulate a 500 error
//     throw new Error("Oh no there was a crash maybe try a different route");
// };

module.exports = invCont

// invDetail,
    // errortry,