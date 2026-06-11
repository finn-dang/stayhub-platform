// src/controllers/public/home.controller.js
const Room = require('../../models/Room');
const Category = require('../../models/Category');

module.exports = {
  // Home page with real database queries
  index: async (req, res) => {
    try {
      const filter = { status: 'active', validByAdmin: true };
      const sort = { created_at: -1 };
      
      // Apply search filter
      if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
      }
      
      // Apply price filter
      if (req.query.minPrice && req.query.maxPrice) {
        filter.price = { $gte: parseInt(req.query.minPrice), $lte: parseInt(req.query.maxPrice) };
      }
      
      // Apply category filter
      if (req.query.type) {
        filter.type = req.query.type;
      }
      
      // Apply guest filter
      if (req.query.quantity && req.query.quantity !== '0') {
        filter.maximuncus = { $gte: parseInt(req.query.quantity) };
      }
      
      // Apply sort
      if (req.query.incre) sort.price = 1;
      else if (req.query.dec) sort.price = -1;
      if (req.query.newest) sort.created_at = -1;
      
      // REAL DATABASE QUERIES - NO MOCK DATA
      const [house_list, house_category_list] = await Promise.all([
        Room.find(filter)
          .sort(sort)
          .populate('host', 'name avatar')
          .populate('type', 'name img')
          .lean(),
        Category.find({}).lean()
      ]);
      
      // Prepare chart data
      const priceData = {};
      house_list.forEach(room => {
        const priceKey = Math.floor(room.price / 100000) * 100000;
        priceData[priceKey] = (priceData[priceKey] || 0) + 1;
      });
      
      const price_label_list = Object.keys(priceData);
      const price_value_list = Object.values(priceData);
      
      res.render('pages/home', {
        title: 'Find Your Perfect Stay',
        isLoggedIn: !!req.session.userId,
        user_name: req.session.userName,
        user_email: req.session.userEmail,
        user_avatar: req.session.userAvatar,
        user_role: req.session.userRole,
        house_category_list,
        sorted_house_list: house_list,
        wish: [],
        query: req.query,
        price_label_list: JSON.stringify(price_label_list),
        price_value_list: JSON.stringify(price_value_list)
      });
    } catch (error) {
      console.error('Home page error:', error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },
  
  loginForm: (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('pages/login', { 
      title: 'Login', 
      error_msg: req.query.error,
      layout: 'main'
    });
  },
  
  registerForm: (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('pages/register', { 
      title: 'Register',
      layout: 'main'
    });
  }
};