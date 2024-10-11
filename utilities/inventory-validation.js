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
                  throw new Error("Email exists. Please log in or use different email")
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


module.exports= validate