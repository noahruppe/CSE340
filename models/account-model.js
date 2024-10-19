const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */

async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email
 * ********************* */

async function checkExistingEmail(account_email) {
  try{
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */

async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* update account logic 
* ***************************** */
async function updateAccount({ account_id, account_firstname, account_lastname, account_email, account_password }) {
  try {
    // Start with updating the account details (firstname, lastname, email)
    const sql = `
      UPDATE account
      SET account_firstname = $1, 
          account_lastname = $2, 
          account_email = $3
      WHERE account_id = $4
      RETURNING *;
    `;

    const updatedAccount = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);

    // If account_password is provided, hash it and update the password
    if (account_password) {
      const hashedPassword = await bcrypt.hash(account_password, 10);

      const passwordSQL = `
        UPDATE account
        SET account_password = $1
        WHERE account_id = $2
        RETURNING *;
      `;

      const updatedPassword = await pool.query(passwordSQL, [
        hashedPassword,
        account_id,
      ]);

      // If no rows were affected, throw an error for password update failure
      if (!updatedPassword.rows.length) {
        throw new Error("Failed to update password in the database.");
      }
    }

    return updatedAccount.rows[0]; // Return the updated account data
  } catch (error) {
    console.error("Error updating account:", error);
    throw new Error("Failed to update account and/or password in the database.");
  }
}


// process the new password 

async function updatePassword(account_id, hashedPassword) {
  try {
      const sql = `
          UPDATE account 
          SET account_password = $1 
          WHERE account_id = $2
          RETURNING *;
      `;

      const result = await pool.query(sql, [hashedPassword, account_id]);

      // Check if a row was affected (updated)
      return result.rowCount > 0; // returns true if the password was updated successfully
  } catch (error) {
      console.error("Error updating password:", error);
      throw new Error("Database error while updating password."); // Handle error as needed
  }
}




module.exports = {registerAccount, checkExistingEmail, getAccountByEmail,updateAccount,updatePassword};