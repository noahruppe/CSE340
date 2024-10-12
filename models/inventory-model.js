const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

module.exports = {getClassifications}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */


async function getInventoryByClassificationId(classification_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
      )
      return data.rows
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
  }

// get detail info**********************************

async function getDetailsByInvId(inv_id) {
    try{
        const data = await pool.query(
            `SELECT * FROM public.inventory
            WHERE inv_id = $1 `,
            [inv_id]
        )
        return data.rows
    }catch (error){
        console.error("getDetailsByInvId error" + error)
    }
}

/* *****************************
*   create new classification
* *************************** */

async function submitClassification (classification_name) {
    try{
      const sql = "INSERT INTO classification(classification_name) VALUES ($1) RETURNING *"
      return await pool.query(sql,[classification_name])
    }catch (error){
      return error.message
    }
}

/* **********************
 *   Check for existing classification
 * ********************* */


async function checkExistingClassification(classification_name) {
  try{
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  }catch (error){
    return error.message
  }
}

/* *****************************
*   create new classification
* *************************** */

async function submitInventory (inv_make,inv_model,inv_year,inv_description,inv_image,inv_thumbnail,inv_price,inv_miles,inv_color) {
  try {
    const sql = "INSERT INTO account (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *"
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price,inv_miles,inv_color])
  } catch (error) {
    return error.message
  }
}

  module.exports = {getClassifications, getInventoryByClassificationId,getDetailsByInvId,submitClassification,checkExistingClassification,submitInventory};

  