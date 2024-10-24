const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


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
  try {
      const data = await pool.query(
          `SELECT * FROM public.inventory WHERE inv_id = $1`,
          [inv_id]
      );
      return data.rows; // Return the first item
  } catch (error) {
      console.error("getDetailsByInvId error: " + error);
  }
}

async function getDetailsByInvId1(inv_id) {
  try {
      const data = await pool.query(
          `SELECT * FROM public.inventory WHERE inv_id = $1`,
          [inv_id]
      );
      return data.rows[0]; // Return the first item
  } catch (error) {
      console.error("getDetailsByInvId error: " + error);
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

async function submitInventory (inv_make,inv_model,inv_year,inv_description,inv_image,inv_thumbnail,inv_price,inv_miles,inv_color, classification_id) {
  try {
    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price,inv_miles,inv_color,classification_id])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */

async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1 RETURNING inv_make, inv_model';
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];  // Return the deleted row details
  } catch (error) {
    throw new Error("Delete Inventory Error");
  }
}


/* ***************************
 *  Search form
 * ************************** */

async function searchResults (searchCriteria) {
  let query = "SELECT * FROM inventory WHERE 1=1";  

  
  if (searchCriteria.classification_id) query += ` AND classification_id = ${searchCriteria.classification_id}`;
  if (searchCriteria.inv_make) query += ` AND inv_make ILIKE '%${searchCriteria.inv_make}%'`;
  if (searchCriteria.inv_model) query += ` AND inv_model ILIKE '%${searchCriteria.inv_model}%'`;
  if (searchCriteria.inv_year) query += ` AND inv_year = ${searchCriteria.inv_year}`;
  if (searchCriteria.inv_description) query += ` AND inv_description ILIKE '%${searchCriteria.inv_description}%'`;
  if (searchCriteria.inv_price) query += ` AND inv_price <= ${searchCriteria.inv_price}`;
  if (searchCriteria.inv_miles) query += ` AND inv_miles <= ${searchCriteria.inv_miles}`;
  if (searchCriteria.inv_color) query += ` AND inv_color ILIKE '%${searchCriteria.inv_color}%'`;

  const result = await pool.query(query);
  return result.rows;
};


  module.exports = {getClassifications, getInventoryByClassificationId,getDetailsByInvId,submitClassification,checkExistingClassification,submitInventory,updateInventory,deleteInventory,getDetailsByInvId1, searchResults};

  