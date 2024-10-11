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


  module.exports = {getClassifications, getInventoryByClassificationId,getDetailsByInvId,submitClassification,checkExistingClassification};

  