const appConstants = require("../../constants/appConstants");
const UserModel = require("../../models/User");
const View = require("../../constants/viewName")
const ROLE=require("../../constants/role")
const bcrypt = require("bcrypt");
const saltRounds = 10;
class ResisterController {
  /**
 * GET /register
 * Register page.
 */
  index(req, res, next) {
    res.render(View.REGISTER_PAGE, { hideNavigation: true, });
  }
  /**
 * POST /register
 * Check if email exists.
 */
  async checkEmailExist(req, res, next) {
    UserModel.countDocuments({ email: req.body.email }, function (err, count) {
      if (count > 0) {
        res.render(View.REGISTER_PAGE, {
          message: appConstants.REGISTER_EMAIL_EXIST,
          announce: true,
          hideNavigation: true,

        });
      }
      else {
        next();
      }
    });

  }

  /**
 * POST /register
 * Register user.
 */
  load(req, res, next) {
    const pw = req.body.password;
    const role = (req.body.email === "bothofuscando@gmail.com") ? ROLE.ADMIN : ROLE.USER;
    let lowerCase = new RegExp("(?=.*[a-z])");
    let upperCase = new RegExp("(?=.*[A-Z])");
    let number = new RegExp("(?=.*[0-9])");
    let eightChar = new RegExp("(?=.{8,})");

    if (
      eightChar.test(req.body.password) &&
      lowerCase.test(req.body.password) &&
      upperCase.test(req.body.password) &&
      number.test(req.body.password)
    ) {
      if (req.body.password === req.body.passwordChecking) {
        bcrypt.hash(pw, saltRounds).then(function (hash) {
          const NewUser = new UserModel({
            password: hash,
            email: req.body.email,
            fullName: req.body.fullName,
            role: role,
            autherized: false,
            brief: "",
            numberOfjudgement: 0

          });

          NewUser.save();
        });

        res.redirect("/login");
      } else {
        res.render(View.REGISTER_PAGE, {
          data: req.body,
          announce: true,
          message: appConstants.REGISTER_PASSWORD_WRONGCONFIRM,
          hideNavigation: true,
        });
      }
    }
    res.render(View.REGISTER_PAGE, {
      announce: true,
      message: appConstants.REGISTER_PASSWORD_CONSTRAIN,
      hideNavigation: true,
    });
  }
}
module.exports = new ResisterController();
