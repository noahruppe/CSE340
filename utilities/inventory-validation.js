const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () =>{
    return[
        body("classification_name")
            .trim() 
            .escape() 
            .notEmpty() 
            .withMessage("Classification name is required.")
            .matches(/^[a-zA-Z0-9]+$/)
            .withMessage("New classification name cannot contain a space or special character of any kind.")
            .isLength({ min: 1 })
            .withMessage("Classification name must be at least 1 character long.")
            .custom(async (classification_name) => {
                const classificationExists = await invModel.checkExistingClassification(classification_name)
                if (classificationExists){
                  throw new Error("Classification exists. Please choose a different classification")
                }
              })
    ]
}


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */

validate.checkClassificationData = async (req, res, next) => {

    const { classification_name } = req.body;
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        let nav = await utilities.getNav(); 
        res.render("./inventory/add-classification", { 
            errors: errors.array(), 
            title: "Add Classification", 
            nav, 
            classification_name,
        });
        return; 
    }
    next();
};


/* ******************************
 * validation for the inventory route 
 * ***************************** */

validate.inventoryRules = () =>{
    return[
        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Make is required")
        .isLength({ min: 3 })
        .withMessage("Inventory Make must be at least 3 letters long")
        .matches(/[A-Za-z0-9\s]{3,}/),


        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Make is required")
        .isLength({ min: 3 })
        .withMessage("Inventory Make must be at least 3 letters long")
        .matches(/^[A-Za-z]+$/)
        .withMessage("Inventory Make must contain only letters"),

        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Make is required")
        .isLength({ min: 4, max: 4 })
        .withMessage("Inventory Year must be a 4-digit number")
        .isNumeric()
        .withMessage("Inventory Year must be numeric")
        .matches(/^\d{4}$/)
        .withMessage("Inventory Year must be a 4-digit year"),

        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Make is required"),

        body("inv_image")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Image is required")
        .custom((value, { req }) => {

            const defaultImage = '/images/vehicles/no-image.png';
            if (value === defaultImage) {
                return true; 
            }
            return true; 
        }),

        body("inv_thumbnail")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Image is required")
        .custom((value, { req }) => {
            
            const defaultImage = '/images/vehicles/no-image.png';
            if (value === defaultImage) {
                return true; 
            }
            return true;
        }),

        body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Price is required")
        .isDecimal({ decimal_digits: '2' }) 
        .withMessage("Inventory Price must be a valid decimal number with up to 2 decimal places")
        .isNumeric()
        .withMessage("Inventory Price must be a numeric value"),

        body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Miles is required")
        .isNumeric()
        .withMessage("Inventory Miles must contain only digits"),

        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Inventory Color is required")
        .matches(/^[A-Za-z]+$/)
        .withMessage("Inventory Color must contain only letters"),

        body("classification_id")
        .notEmpty()
        .withMessage("Classification is required")
        .isInt({ min: 1 })
        .withMessage("Please select a valid classification")
    ]
}


/* ******************************
 * Check data and return errors or continue to inventory 
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {

    const { inv_make, inv_model,inv_year,inv_description,inv_image,inv_thumbnail,inv_price,inv_miles,inv_color, classification_id } = req.body;
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let drop = await utilities.buildClassificationDrop(classification_id);
      res.render("./inventory/add-inventory", {
        errors,
        title: "Add Inventory",
        nav,
        drop,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      })
      return
    }
    next()
  }

  /* ******************************
 * errors will be directed back to the edit view 
 * ***************************** */
validate.checkUpdatedData = async (req, res, next) => {

    const { inv_make, inv_model,inv_year,inv_description,inv_image,inv_thumbnail,inv_price,inv_miles,inv_color, classification_id , inv_id} = req.body;
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      const itemData = await invModel.getDetailsByInvId(inv_id)
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`
      let drop = await utilities.buildClassificationDrop();

      res.render("./inventory/edit-inventory", {
        errors,
        title: "Add Inventory"+itemName,
        nav,
        drop,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        inv_id,
      })
      return
    }
    next()
  }

  /* ******************************
 * validation for the search form 
 * ***************************** */
  validate.searchRules = () => {
    return [
        body("inv_make")
            .optional({ checkFalsy: true }) // Only validate if inv_make is provided
            .trim()
            .escape()
            .isLength({ min: 3 })
            .withMessage("Inventory Make must be at least 3 letters long")
            .matches(/[A-Za-z0-9\s]{3,}/)
            .withMessage("Inventory Make must contain valid characters"),

        body("inv_model")
            .optional({ checkFalsy: true }) // Only validate if inv_model is provided
            .trim()
            .escape()
            .isLength({ min: 3 })
            .withMessage("Inventory Model must be at least 3 letters long")
            .matches(/^[A-Za-z]+$/)
            .withMessage("Inventory Model must contain only letters"),

        body("inv_year")
            .optional({ checkFalsy: true }) // Only validate if inv_year is provided
            .trim()
            .escape()
            .isLength({ min: 4, max: 4 })
            .withMessage("Inventory Year must be a 4-digit number")
            .isNumeric()
            .withMessage("Inventory Year must be numeric")
            .matches(/^\d{4}$/)
            .withMessage("Inventory Year must be a 4-digit year"),

        body("inv_description")
            .optional({ checkFalsy: true }) // Only validate if inv_description is provided
            .trim()
            .escape()
            .isLength({ min: 1 })
            .withMessage("Inventory Description must be provided if typed"),

        body("inv_price")
            .optional({ checkFalsy: true }) // Only validate if inv_price is provided
            .trim()
            .escape()
            .isDecimal({ decimal_digits: '2' })
            .withMessage("Inventory Price must be a valid decimal number with up to 2 decimal places")
            .isNumeric()
            .withMessage("Inventory Price must be a numeric value"),

        body("inv_miles")
            .optional({ checkFalsy: true }) // Only validate if inv_miles is provided
            .trim()
            .escape()
            .isNumeric()
            .withMessage("Inventory Miles must contain only digits"),

        body("inv_color")
            .optional({ checkFalsy: true }) // Only validate if inv_color is provided
            .trim()
            .escape()
            .matches(/^[A-Za-z]+$/)
            .withMessage("Inventory Color must contain only letters"),

        body("classification_id")
            .optional({ checkFalsy: true }) // Only validate if classification_id is provided
            .isInt({ min: 1 })
            .withMessage("Please select a valid classification"),
    ];
};




    /* ******************************
 * check validation for the search form 
 * ***************************** */

  validate.searchCheck = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    
    let errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let drop = await utilities.buildClassificationDropNone(classification_id);
        
        res.render("./inventory/add-inventory", {
            errors,
            title: "Search Form",
            nav,
            drop,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        });
        return;
    }
    
    next();
};


module.exports= validate