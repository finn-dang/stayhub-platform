// src/controllers/host/dashboard.controller.js
const Room = require('../../models/Room');
const Booking = require('../../models/Booking');

module.exports = {
  index: async (req, res) => {
    try {
      const totalRooms = await Room.countDocuments({ host: req.session.userId });
      const activeRooms = await Room.countDocuments({ 
        host: req.session.userId, 
        status: 'active' 
      });
      const pendingRooms = await Room.countDocuments({ 
        host: req.session.userId, 
        status: 'pending' 
      });
      const totalViews = await Room.aggregate([
        { $match: { host: req.session.userId } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]);
      
      // Get recent bookings for host's rooms
      const hostRooms = await Room.find({ host: req.session.userId }).select('_id');
      const roomIds = hostRooms.map(room => room._id);
      
      const recentBookings = await Booking.find({ room: { $in: roomIds } })
        .populate('room', 'name')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      res.render('pages/host/dashboard', {
        title: 'Host Dashboard',
        stats: {
          totalRooms,
          activeRooms,
          pendingRooms,
          totalViews: totalViews[0]?.total || 0
        },
        recentBookings,
        isLoggedIn: true,
        user_name: req.session.userName,
        user_role: req.session.userRole,
        user_avatar: req.session.userAvatar
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  }
};