const userModel = require("../../models/User");
const { verifyEmail, sendPassword } = require("../../config/nodemail");
const generator = require('generate-password');
const bcrypt = require("bcrypt");
const { VIEW, APP_MESSAGE, COOKIE_VALUE } = require("../../constants");

class AccountController {
  async sendVerifyEmail(req, res, next) {
    try {
      const url = `${process.env.BASE_URL}/account/validemail/${req.params.id}`;
      await verifyEmail(req.cookies.user_email, "Verify Email", url);
      next();
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  validEmail(req, res, next) {
    res.render(VIEW.EMAIL_VERIFY_PAGE, { hideNavigation: true, user_id: req.params.id });
  }

  validateEmail(req, res, next) {
    const cookiesToClear = Object.values(COOKIE_VALUE);
    cookiesToClear.forEach(cookie => res.clearCookie(cookie));
    res.render(VIEW.EMAIL_VERIFY_SUCCESS_PAGE, { hideNavigation: true });
  }

  async activateAccount(req, res, next) {
    try {
      await userModel.findByIdAndUpdate(req.params.id, { authorized: true });
      res.redirect("/login");
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  getPassword(req, res, next) {
    res.render(VIEW.FORGET_PASSWORD_PAGE, { hideNavigation: true });
  }

  async sendPassword(req, res, next) {
    try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) {
        return res.render(VIEW.FORGET_PASSWORD_PAGE, {
          message: APP_MESSAGE.ACCOUNT_EMAIL_UNREGISTERED,
          hideNavigation: true,
        });
      }

      const password = generator.generate({ length: 10, numbers: true });
      const hash = await bcrypt.hash(password, 10);
      await userModel.findOneAndUpdate({ email: req.body.email }, { password: hash });

      const url = "Your new password is " + password;
      await sendPassword(req.body.email, "Verify Email", url);
      res.render(VIEW.FORGET_PASSWORD_PAGE, {
        message: "Your new password has been sent to " + req.body.email,
        announce: true,
        hideNavigation: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async updatePersonalName(req, res, next) {
    try {
      const name = req.body.firstname + req.body.lastname;
      await userModel.findByIdAndUpdate(req.cookies.user_id, { fullName: name });
      res.cookie(COOKIE_VALUE.USER_FULLNAME, name, { secure: true, httpOnly: true });
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async updatePersonalPhone(req, res, next) {
    try {
      await userModel.findByIdAndUpdate(req.cookies.user_id, { phoneNumber: req.body.phone });
      res.cookie(COOKIE_VALUE.USER_PHONE_NUMBER, req.body.phone, { secure: true, httpOnly: true });
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async updatePersonalAddress(req, res, next) {
    try {
      await userModel.findByIdAndUpdate(req.cookies.user_id, { address: req.body.address });
      res.cookie(COOKIE_VALUE.USER_ADDRESS, req.body.address, { secure: true, httpOnly: true });
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
}

module.exports = new AccountController();
