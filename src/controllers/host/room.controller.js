// src/controllers/host/room.controller.js
const Room = require('../../models/Room');
const Category = require('../../models/Category');

module.exports = {
  // List all rooms for the host
  index: async (req, res) => {
    try {
      const rooms = await Room.find({ host: req.session.userId })
        .populate('type', 'name')
        .sort({ created_at: -1 })
        .lean();
      
      res.render('pages/host/rooms', {
        title: 'My Rooms',
        rooms,
        isLoggedIn: true,
        user_name: req.session.userName,
        user_role: req.session.userRole,
        user_avatar: req.session.userAvatar
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },

  // Show create room form
  createForm: async (req, res) => {
    try {
      const categories = await Category.find({}).lean();
      res.render('pages/host/room-create', {
        title: 'Create New Room',
        categories,
        isLoggedIn: true,
        user_name: req.session.userName,
        user_role: req.session.userRole,
        user_avatar: req.session.userAvatar
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },

  // Create new room
  create: async (req, res) => {
    try {
      const roomData = {
        ...req.body,
        host: req.session.userId,
        status: 'pending',
        validByAdmin: false,
        // Convert amenities from form checkboxes
        amenities: {
          wifi: req.body.wifi === 'on',
          air_conditioner: req.body.air_conditioner === 'on',
          parking: req.body.parking === 'on',
          kitchen: req.body.kitchen === 'on',
          pool: req.body.pool === 'on',
          tv: req.body.tv === 'on'
        }
      };
      
      const room = new Room(roomData);
      await room.save();
      
      res.redirect('/host/rooms');
    } catch (error) {
      console.error(error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },

  // Show edit room form
  editForm: async (req, res) => {
    try {
      const room = await Room.findOne({ 
        _id: req.params.id, 
        host: req.session.userId 
      }).lean();
      
      if (!room) {
        return res.status(404).send('Room not found');
      }
      
      const categories = await Category.find({}).lean();
      res.render('pages/host/room-edit', {
        title: 'Edit Room',
        room,
        categories,
        isLoggedIn: true,
        user_name: req.session.userName,
        user_role: req.session.userRole,
        user_avatar: req.session.userAvatar
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },

  // Update room
  update: async (req, res) => {
    try {
      await Room.updateOne(
        { _id: req.params.id, host: req.session.userId },
        { 
          $set: {
            ...req.body,
            amenities: {
              wifi: req.body.wifi === 'on',
              air_conditioner: req.body.air_conditioner === 'on',
              parking: req.body.parking === 'on',
              kitchen: req.body.kitchen === 'on',
              pool: req.body.pool === 'on',
              tv: req.body.tv === 'on'
            }
          }
        }
      );
      res.redirect('/host/rooms');
    } catch (error) {
      console.error(error);
      res.status(500).render('pages/errors/500', { title: 'Server Error' });
    }
  },

  // Delete room
  delete: async (req, res) => {
    try {
      await Room.deleteOne({ _id: req.params.id, host: req.session.userId });
      res.redirect('/host/rooms');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting room');
    }
  }
};