const houseModel = require("../../models/house.model");
const reservationModel = require("../../models/reservation.model");
const ratingModel = require("../../models/rate.model");
const client = require("../../config/redis");
const   ROLE  = require("../../constants/role");
const { cookieValue } = require("../../constants/cookieValue");
const  VIEW  = require("../../constants/viewName");
const houseCategoryModel = require("../../models/catefory.model");
const userModel = require("../../models/User");
class HouseController {
  async addComment(req, res, next) {
    try {
      const item = await ratingModel.findOne({ owner: req.cookies.id, room: req.body.room });
      if (item) {
        item.value = req.body.value;
        item.star = req.body.rating;
        await item.save();
      } else {
        const newComment = new ratingModel({
          owner: req.cookies.id,
          value: req.body.value,
          star: req.body.rating,
          room: req.body.room,
          host: req.body.host
        });
        await newComment.save();
      }
      res.redirect("/user/trip");
    } catch (err) {
      console.log(err);
    }
  }
  async specific(req, res, next) {
    let logged;
    if (req.cookies.token) {
      logged = true;
    }
    else {
      logged = false;
    }
    let isAdmin = false;
    if (req.cookies.user_role) {
      isAdmin = req.cookies.user_role === ROLE.ADMIN ? true : false;
    }
    else { isAdmin = false; }
    let user_name = req.cookies.user_name;
    let user_email = req.cookies.user_email;
    let user_phone = req.cookies.user_phone;
    let user_avatar = req.cookies.user_avatar;
    let user_address = req.cookies.user_address;
    let user_id = req.cookies.user_id;

    let conversationId = req.cookies.conversationId;
    let item = await reservationModel.find({ value: "9.2" });
    let key = "room" + req.params.id;
    client.hGetAll(key, async (error, value) => {
      if (error || value === null) {

        let house_detail = await houseModel.findOne({ _id: req.params.id }).populate('host');
        house_detail.Visittime = house_detail.Visittime + 1;
        house_detail.save();
        house_detail = house_detail.toObject();
        await client.hSet(key, 'data', JSON.stringify(house_detail));
        let isOwner = (req.cookies.user_id === house_detail.host._id)
          ? true : false;
        let house_rating_list = await ratingModel.find({ room: req.params.id }).populate("owner").lean();
        await client.hSet(key, 'rating', JSON.stringify(house_rating_list));
        client.expire(key, 600);
        house_detail = JSON.stringify(house_detail);
        house_detail = JSON.parse(house_detail);

        res.render(VIEW.HOUSE_DETAIL_PAGE, {
          user_role: req.cookies.user_role,
          user_address,
          isOwner,
          user_id,
          user_name,
          user_email,
          user_phone,
          user_avatar,
          islogged: logged,
          house_detail,
          admin: isAdmin,
          house_rating_list,
          Title:house_detail.name
        });

      }
      else {

        let house_detail = JSON.parse(value.data);
        let house_rating_list = JSON.parse(value.rating);

        res.render(VIEW.HOUSE_DETAIL_PAGE, {
          user_role: req.cookies.user_role,
          user_address,
          isOwner,
          user_id,
          user_name,
          user_email,
          user_phone,
          user_avatar,
          islogged: logged,
          house_detail,
          admin: isAdmin,
          house_rating_list
        });

      }
    });


  }


  //GET /host/room
  async Index(req, res, next) {
    try {
      const user_id = req.cookies.user_id;
      const user_house_list = await houseModel.find({ host: user_id }).lean();
      res.render(VIEW.ADD_HOUSE_GUIDE_PAGE, {
        hideNavigation: true,
        user_house_list
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Erroccr");
    }
  }

  async GerHouseDetails(req, res, next) {
    try {
      const user_id = req.cookies.user_id;
      const user_house_list = await houseModel.find({ host: user_id }, { name: 1 }).lean();
      const user_house = await houseModel.findById(req.params.id).lean();
      res.render(VIEW.ADD_HOUSE_GUIDE_PAGE, {
        hideNavigation: true,
        user_house_list,
        user_house
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  async DisplayTitle(req, res, next) {
    try {
      if (!req.cookies.token) {
        return res.redirect("/login");
      }

      let isAdmin = false;
      if (req.cookies.user_role) {
        isAdmin = req.cookies.user_role === "admin";
      }

      const items = await houseCategoryModel.find({ gender: req.params.gender }).lean();
      const categories = items.map((item) => item.toObject());

      res.render(VIEW.ADD_HOUSE_TITLE_PAGE, { items: categories, hideNavigation: true, process: 0 });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  //GET /host/room/detail
  DisplayDetail(req, res, next) {

    res.render(VIEW.ADD_HOUSE_DETAIL_PAGE, { hideNavigation: true, process: 25 });
  }
  //GET /host/room/photos
  DisplayPhotos(req, res, next) {
    res.render(VIEW.ADD_HOUSE_PHOTO_PAGE, { hideNavigation: true, process: 50 });
  }
  //GET /host/room/price
  DisplayPrice(req, res, next) {
    res.render(VIEW.ADD_HOUSE_PRICE_PAGE, { hideNavigation: true, process: 75 });
  }
  /**
   * Saves the title of the room.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  SaveTitle(req, res, next) {
    /**
     * Sets the house name cookie.
     */
    res.cookie(cookieValue.HOUSE_NAME, req.body.name);
    /**
     * Sets the house category cookie.
     */
    res.cookie(cookieValue.HOUSE_CATEGORY, req.body.type);
    /**
     * Redirects to the room detail page.
     */
    res.redirect("/room/detail");
  }
  /**
 * Saves the room information to the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
  SaveDetail(req, res, next) {
    console.log(req.body);
    /**
     * Sets the maximum customer count cookie.
     */
    res.cookie(cookieValue.HOUSE_MAX_CUSTOMER, req.body.maximumcus);

    /**
     * Sets the available bed count and shower count cookies.
     */
    res.cookie(cookieValue.HOUSE_AVAILABLE_BED, req.body.bed);
    res.cookie(cookieValue.HOUSE_AVAILABLE_SHOWER, req.body.shower);

    /**
     * Sets the address cookie.
     */
    res.cookie(cookieValue.HOUSE_ADDRESS, req.body.address);


    /**
     * Redirects to the photos page.
     */
    res.redirect("/host/room/photos");
  }
  /**
   * Saves the uploaded photos to the database and sets the display photo.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  SavePhotos(req, res, next) {
    /**
     * The uploaded photos.
     * @type {string[]}
     */
    const love = req.files.map(e => e.path);

    /**
     * Sets the display photo cookie.
     */
    res.cookie(cookieValue.HOUSE_IMAGES, love);

    /**
     * Redirects to the price page.
     */
    res.redirect("/host/room/price");
  }

  /**
   * Saves the new room information to the database and sets the user role to "host".
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async SaveNewRoom(req, res, next) {
    try {
      const user = await userModel.findOne({ _id: req.cookies.user_id });
      if (user) {
        user.role = ROLE.HOST;
        await user.save();
      } else {
        throw new Error("User not found");
      }

      const newProduct = new houseModel({
        name: req.cookies.user_name,
        host: req.cookies.user_id,
        startday: req.body.startday,
        endday: req.body.endday,
        maximuncus: req.cookies.maximumcus,
        price: req.body.price,
        type: req.cookies.house_category,
        bed: req.cookies.house_available_bed,
        shower: req.cookies.house_available_shower,
        hosthome: true,
        img: req.cookies.house_images,
        display: req.cookies.house_images[0] ? req.cookies.house_images[0].path : "https://i.ibb.co/FxhPxzF/a5.png",
        isRented: false,
        address: req.cookies.house_address,
        validByAdmin: true,
        Visittime: 0,
        validByAdmin: false
      });

      await newProduct.save();

      res.cookie(cookieValue.USER_ROLE, ROLE.HOST);

      // Clear the house information cookies
      res.clearCookie(cookieValue.HOUSE_NAME);
      res.clearCookie(cookieValue.HOUSE_AVAILABLE_FROM);
      res.clearCookie(cookieValue.HOUSE_AVAILABLE_TO);
      res.clearCookie(cookieValue.HOUSE_IMAGES);
      res.clearCookie(cookieValue.HOUSE_CATEGORY);
      res.clearCookie(cookieValue.HOUSE_AVAILABLE_BED);
      res.clearCookie(cookieValue.HOUSE_AVAILABLE_SHOWER);
      res.clearCookie(cookieValue.HOUSE_ADDRESS);
      res.clearCookie("display");

      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }


}
module.exports = new HouseController();
