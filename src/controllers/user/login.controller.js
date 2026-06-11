const userModel = require("../../models/User");
var jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const View=require("../../constants/viewName");
const Role=require("../../constants/role");
const CookieValue=require("../../constants/cookieValue")
const APP_SECRET=require("../../constants/appSecret");
const appConstants = require("../../constants/appConstants");
const appSecret = require("../../constants/appSecret");

class LoginController {
/**
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
  index(req, res, next) {
    res.render(View.LOGIN_PAGE, { loginform: true, hideNavigation: true });

  }
  googleauth(req, res, next) {
    userModel.find({ email: req.cookies.userProfile.email }).then((docs) => {
      if (docs.length === 0) {
        const NewUser = new userModel({
          email: req.cookies.userProfile.email,
          fullName: req.cookies.userProfile.name,
          role: Role.USER,
          brief: "",
          numberOfjudgement: 0,
          autherized: true
        });
        NewUser.save();
        const token = jwt.sign({ name: NewUser.email }, APP_SECRET.TOKEN_SECRET);
        res.cookie(CookieValue.USER_ID, NewUser._id, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.TOKEN, token, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_NAME, NewUser.fullName, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_ROLE, NewUser.role, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_EMAIL, NewUser.email, {
          secure: true,
          httpOnly: true,
        });
          res.redirect("/user/avatar");
    }
      else {


        const token = jwt.sign({ name: req.cookies.userProfile.email }, APP_SECRET.TOKEN_SECRET);
        res.cookie(CookieValue.USER_ID, docs[0]._id, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.TOKEN, token, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_AVATAR, docs[0].avatar, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_NAME, docs[0].fullName, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_ROLE, docs[0].role, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_EMAIL, docs[0].email, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_PHONE_NUMBER, docs[0].phoneNumber || "chưa cập nhật", {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_EVALUE_COUNT, docs[0].numberOfjudgement, {
          secure: true,
          httpOnly: true,
        });
        res.cookie(CookieValue.USER_ADDRESS, req.body.password, {
          secure: true,
          httpOnly: true,
        });

        if (docs[0].avatar === undefined) {
          res.redirect("/user/avatar");
        } else {
          if (docs[0].autherized === false) {
            res.redirect(`/user/validemail/${docs[0]._id}`);
          }
          else {
            res.redirect("/");
          }

        }

      }
    });
  }

/**
 * Checks if the given email is registered in the database.
 * If the email is not registered, it renders the login page with an error message.
 * If the email is registered, it calls the next middleware function.
 */
async checkEmail(req, res, next) {
  const registered = await userModel.findOne({ email: req.body.username });
  if (!registered) {
    res.render(View.LoginController, {
      message: appConstants.LOGIN_UNREGISTERED,
      announce: true,
      addProcessing: true,
      hideNavigation: true
    });
  } else {
    next();
  }
}

async login(req, res, next) {
  const user = await userModel.findOne({ email: req.body.username });

  if (!user) {
      res.render(View.LOGIN_PAGE, {
          message: appConstants.LOGIN_UNREGISTERED,
          announce: true,
          addProcessing: true,
          hideNavigation: true
      });
  } else {
      const valid = await bcrypt.compare(req.body.password, user.password);

      if (valid) {
          const token = jwt.sign({ name: user.email }, appSecret.TOKEN_SECRET);
          res.cookie(CookieValue.USER_ID, user._id, {
              secure: true,
              httpOnly: true,
          });
          res.cookie(CookieValue.TOKEN, token, {
              secure: true,
              httpOnly: true,
          });
          res.cookie(CookieValue.USER_AVATAR, user.avatar, {
              secure: true,
              httpOnly: true,
          });
          res.cookie(CookieValue.USER_FULLNAME, user.fullName, {
              secure: true,
              httpOnly: true,
          });
          res.cookie("password", user.password, {
              secure: true,
              httpOnly: true,
          });
          res.cookie(CookieValue.USER_ROLE, user.role, {
              secure: true,
              httpOnly: true,
          });
          res.cookie(CookieValue.USER_EVALUE_COUNT, user.numberOfjudgement, {
              secure: true,
              httpOnly: true,
          });
          res.cookie(CookieValue.USER_NAME, req.body.username, {
              secure: true,
              httpOnly: true,
          });
          res.cookie(CookieValue.USER_ADDRESS, req.body.address, {
              secure: true,
              httpOnly: true,
          });
          res.cookie(CookieValue.USER_PHONE_NUMBER, req.body.phone, {
              secure: true,
              httpOnly: true,
          });
          if (user.avatar === undefined) {
              res.redirect("/user/avatar");
          } else {
              if (user.autherized !== false) {
                  res.redirect("/");
              } else {
                  res.redirect(`/user/validemail/${user.id}`);
              }
          }
      } else {
          res.render(View.LOGIN_PAGE, {
              message: appConstants.LOGIN_PASSWORD_WRONG,
              announce: true,
              addProcessing: true,
              hideNavigation: true
          });
      }
  }
}
}
module.exports = new LoginController();
