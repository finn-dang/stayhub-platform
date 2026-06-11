/**
 * @fileOverview Home controller
 * @module Controllers/Home
 */

const houseModel = require("../../models/house.model");
const houseCategoryModel = require("../../models/catefory.model");
const wishlistModel = require("../../models/wishlist.model");
const ROLE = require("../../constants/role");
const VIEW = require("../../constants/viewName");
const { ROLE_CONFIG } = require("../../utils/roleConfig");

/**
 * @classdesc Home class
 * @class
 */
class Home {
  /**
   * @function
   * @name defaultDisplay
   * @description Default display function - Load houses directly from MongoDB
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Void}
   */
  async defaultDisplay(req, res, next) {
    try {
      console.log("Query params:", req.query);
      
      // Build filter object
      const filter = {};
      const sort = {};
      
      // Get user data from cookies
      let user_name = req.cookies.user_name;
      let user_email = req.cookies.user_email;
      let user_phone = req.cookies.user_phone;
      let user_avatar = req.cookies.user_avatar;
      let user_address = req.cookies.user_address;
      let user_role = req.cookies.user_role || 'user';
      let user_id = req.cookies.user_id;
      
      // Login status
      let isLoggedIn = !!(req.cookies.token);
      let isAdmin = (req.cookies.user_role === ROLE.ADMIN && isLoggedIn);
      
      // ========== BUILD FILTERS ==========
      
      // Guest capacity filter
      if (req.query.quantity && req.query.quantity !== '0') {
        filter.maximuncus = { $gte: parseInt(req.query.quantity) };
      }
      
      // Bedrooms filter
      if (req.query.bedroom && req.query.bedroom !== '0') {
        filter.bedroom = { $gte: parseInt(req.query.bedroom) };
      }
      
      // Bathrooms filter
      if (req.query.showerroom && req.query.showerroom !== '0') {
        filter.shower = { $gte: parseInt(req.query.showerroom) };
      }
      
      // Price range filter
      if (req.query.minPrice && req.query.maxPrice && 
          req.query.minPrice !== '0' && req.query.maxPrice !== '300') {
        filter.price = { 
          $gte: parseInt(req.query.minPrice), 
          $lte: parseInt(req.query.maxPrice) 
        };
      } else if (req.query.minPrice && req.query.minPrice !== '0') {
        filter.price = { $gte: parseInt(req.query.minPrice) };
      } else if (req.query.maxPrice && req.query.maxPrice !== '300') {
        filter.price = { $lte: parseInt(req.query.maxPrice) };
      }
      
      // Search by name
      if (req.query.search && req.query.search.trim()) {
        filter.name = { $regex: req.query.search, $options: "i" };
      }
      
      // Exclude current user's own listings
      if (user_id) {
        filter.host = { $ne: user_id };
      }
      
      // Category filter
      if (req.query.type) {
        filter.type = req.query.type;
      }
      
      // Only show admin-approved houses
      filter.validByAdmin = true;
      filter.status = 'active';
      
      // ========== BUILD SORT ==========
      
      // Price sort
      if (req.query.incre) {
        sort.price = 1; // ascending (low to high)
      } else if (req.query.dec) {
        sort.price = -1; // descending (high to low)
      }
      
      // Newest first
      if (req.query.newest) {
        sort.created_at = -1;
      }
      
      // Default sort by name
      sort.name = 1;
      
      // ========== FETCH DATA FROM DATABASE ==========
      console.log("Filter:", JSON.stringify(filter));
      console.log("Sort:", JSON.stringify(sort));
      
      // Get houses with filters and populate host info
      let house_list = await houseModel
        .find(filter)
        .sort(sort)
        .populate("host", "name avatar email phone")
        .lean();
      
      // Add isLoggedIn flag to each house
      house_list = house_list.map(v => ({ 
        ...v, 
        isLoggedIn: isLoggedIn,
        // Format images array if needed
        images: v.img && v.img.length ? v.img : [{ url: '/img/default-house.jpg' }]
      }));
      
      // ========== PREPARE CHART DATA ==========
      // Create price distribution for chart (max price 10,000,000 VND)
      const maxPriceLimit = 10000;
      let datachart = Array(maxPriceLimit + 1).fill(0);
      
      house_list.forEach((item) => {
        const priceInThousands = Math.floor(item.price / 1000);
        if (priceInThousands <= maxPriceLimit) {
          datachart[priceInThousands]++;
        }
      });
      
      let price_label_list = datachart.map((_, index) => index);
      let price_value_list = datachart;
      
      // ========== FETCH CATEGORIES ==========
      let house_category_list = await houseCategoryModel.find({}).lean();
      
      // ========== FETCH WISHLIST (if logged in) ==========
      let wishlist = [];
      if (user_id) {
        wishlist = await wishlistModel.find({ user: user_id }).lean();
      }
      
      // ========== GET ROLE CONFIGURATION FOR SIDEBAR ==========
      const roleConfig = ROLE_CONFIG[user_role?.toUpperCase()] || ROLE_CONFIG.USER;
      
      // ========== RENDER PAGE ==========
      res.render(VIEW.INDEX_PAGE, {
        title: "HostHub - Tìm kiếm chỗ ở tuyệt vời",
        // User data
        user_address,
        user_name: user_name || 'Guest',
        user_email,
        user_phone,
        user_avatar: user_avatar || '/img/default-avatar.png',
        user_role,
        user_id,
        isLoggedIn,
        isAdmin,
        // Role data for sidebar
        roleName: roleConfig.name,
        roleIcon: roleConfig.icon,
        roleGradient: roleConfig.gradient,
        mainNavItems: roleConfig.navigation.main,
        secondaryNavItems: roleConfig.navigation.secondary,
        // Page data
        price_label_list: JSON.stringify(price_label_list),
        price_value_list: JSON.stringify(price_value_list),
        sorted_house_list: house_list,
        house_category_list,
        wish: wishlist,
        // Query params for form persistence
        query: req.query
      });
      
    } catch (error) {
      console.error("Error in defaultDisplay:", error);
      res.status(500).render("errors/500", {
        title: "Lỗi máy chủ",
        message: "Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.",
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }
  
  /**
   * @function
   * @name getHouseDetail
   * @description Get single house detail
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Void}
   */
  async getHouseDetail(req, res) {
    try {
      const houseId = req.params.id;
      const isLoggedIn = !!(req.cookies.token);
      
      const house = await houseModel
        .findById(houseId)
        .populate("host", "name avatar email phone created_at")
        .lean();
      
      if (!house) {
        return res.status(404).render("errors/404", {
          title: "Không tìm thấy chỗ ở"
        });
      }
      
      // Increment view count
      await houseModel.findByIdAndUpdate(houseId, { $inc: { Visittime: 1 } });
      
      // Get similar houses
      const similarHouses = await houseModel
        .find({
          _id: { $ne: houseId },
          city: house.city,
          validByAdmin: true,
          status: 'active'
        })
        .limit(6)
        .lean();
      
      res.render("pages/house-detail", {
        title: house.name,
        house,
        similarHouses,
        isLoggedIn,
        user_role: req.cookies.user_role,
        user_id: req.cookies.user_id
      });
      
    } catch (error) {
      console.error("Error in getHouseDetail:", error);
      res.status(500).render("errors/500", {
        title: "Lỗi máy chủ"
      });
    }
  }
  
  /**
   * @function
   * @name searchHouses
   * @description API endpoint for house search
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Void}
   */
  async searchHouses(req, res) {
    try {
      const { query, minPrice, maxPrice, guests, city } = req.query;
      const filter = {};
      
      if (query) {
        filter.name = { $regex: query, $options: 'i' };
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseInt(minPrice);
        if (maxPrice) filter.price.$lte = parseInt(maxPrice);
      }
      if (guests) {
        filter.maximuncus = { $gte: parseInt(guests) };
      }
      if (city) {
        filter.city = { $regex: city, $options: 'i' };
      }
      
      filter.validByAdmin = true;
      filter.status = 'active';
      
      const houses = await houseModel
        .find(filter)
        .limit(20)
        .lean();
      
      res.json({
        success: true,
        data: houses,
        total: houses.length
      });
      
    } catch (error) {
      console.error("Error in searchHouses:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tìm kiếm"
      });
    }
  }
}

module.exports = new Home();