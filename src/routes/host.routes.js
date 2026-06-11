// src/routes/host.routes.js
const express = require('express');
const router = express.Router();
const { isHost } = require('../middleware/auth');
const roomController = require('../controllers/host/room.controller');
const dashboardController = require('../controllers/host/dashboard.controller');

// All host routes require host role
router.use(isHost);

// Dashboard
router.get('/dashboard', dashboardController.index);

// Room management
router.get('/rooms', roomController.index);
router.get('/rooms/create', roomController.createForm);
router.post('/rooms/create', roomController.create);
router.get('/rooms/edit/:id', roomController.editForm);
router.post('/rooms/edit/:id', roomController.update);
router.post('/rooms/delete/:id', roomController.delete);

module.exports = router;