// src/middleware/auth.js (UPDATED)
// Authentication middleware

const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

const isHost = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  if (req.session.userRole !== 'host' && req.session.userRole !== 'admin') {
    return res.status(403).render('pages/errors/403', {
      title: 'Access Denied',
      layout: 'main',
      user_role: req.session.userRole,
      required_role: 'host or admin'
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  if (req.session.userRole !== 'admin') {
    return res.status(403).render('pages/errors/403', {
      title: 'Access Denied',
      layout: 'main',
      user_role: req.session.userRole,
      required_role: 'admin'
    });
  }
  next();
};

// Optional: For specific role checks
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    if (!allowedRoles.includes(req.session.userRole)) {
      return res.status(403).render('pages/errors/403', {
        title: 'Access Denied',
        layout: 'main',
        user_role: req.session.userRole,
        required_role: allowedRoles.join(' or ')
      });
    }
    next();
  };
};

module.exports = { isAuthenticated, isHost, isAdmin, hasRole };