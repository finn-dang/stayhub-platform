// middleware/roleMiddleware.js
const { ROLE_CONFIG } = require('../utils/roleConfig');

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
    user: 1,
    host: 2,
    admin: 3
};

// Get role configuration based on user role
function getRoleConfig(role) {
    switch(role) {
        case 'admin':
            return ROLE_CONFIG.ADMIN;
        case 'host':
            return ROLE_CONFIG.HOST;
        case 'user':
        default:
            return ROLE_CONFIG.USER;
    }
}

// Middleware: Inject role data into all templates
function injectRoleData(req, res, next) {
    try {
        const userRole = req.user?.role || 'user';
        const roleConfig = getRoleConfig(userRole);
        
        // Basic role info
        res.locals.userRole = userRole;
        res.locals.roleName = roleConfig.name;
        res.locals.roleIcon = roleConfig.icon;
        res.locals.roleColor = roleConfig.color;
        res.locals.roleGradient = roleConfig.gradient;
        
        // Navigation items (only show visible ones)
        res.locals.mainNavItems = roleConfig.navigation.main.filter(item => item.visible !== false);
        res.locals.secondaryNavItems = roleConfig.navigation.secondary;
        
        // Permissions
        res.locals.permissions = roleConfig.permissions;
        
        // Role-specific data
        if (userRole === 'host') {
            res.locals.isHost = true;
            res.locals.isUser = false;
            res.locals.isAdmin = false;
        } else if (userRole === 'admin') {
            res.locals.isHost = false;
            res.locals.isUser = false;
            res.locals.isAdmin = true;
        } else {
            res.locals.isHost = false;
            res.locals.isUser = true;
            res.locals.isAdmin = false;
        }
        
        next();
    } catch (error) {
        console.error('Error in injectRoleData:', error);
        // Fallback to default user role
        res.locals.userRole = 'user';
        res.locals.roleName = 'Khách hàng';
        res.locals.roleIcon = 'bi-person';
        res.locals.roleColor = '#4285F4';
        res.locals.roleGradient = 'linear-gradient(135deg, #4285F4 0%, #5A9CFF 100%)';
        res.locals.mainNavItems = [];
        res.locals.secondaryNavItems = [];
        res.locals.permissions = {};
        next();
    }
}

// Middleware: Check if user has required role
function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        
        const userRole = req.user.role || 'user';
        const userLevel = ROLE_HIERARCHY[userRole] || 1;
        const requiredLevel = ROLE_HIERARCHY[requiredRole] || 1;
        
        if (userLevel >= requiredLevel) {
            return next();
        }
        
        // Access denied
        req.flash('error', 'Bạn không có quyền truy cập trang này');
        return res.redirect('/');
    };
}

// Middleware: Check if user is host
function requireHost(req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    }
    
    if (req.user.role === 'host' || req.user.role === 'admin') {
        return next();
    }
    
    req.flash('error', 'Bạn cần đăng ký làm chủ nhà để sử dụng tính năng này');
    return res.redirect('/become-host');
}

// Middleware: Check if user is admin
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    }
    
    if (req.user.role === 'admin') {
        return next();
    }
    
    req.flash('error', 'Bạn không có quyền truy cập trang quản trị');
    return res.redirect('/');
}

// Middleware: Check if user owns the resource (room, booking, etc.)
function requireOwnership(model, idParam = 'id', userIdField = 'host') {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.redirect('/login');
            }
            
            // Admin can access anything
            if (req.user.role === 'admin') {
                return next();
            }
            
            const resourceId = req.params[idParam];
            const resource = await model.findById(resourceId);
            
            if (!resource) {
                return res.status(404).render('errors/404');
            }
            
            // Check if user owns the resource
            if (resource[userIdField].toString() === req.user._id.toString()) {
                return next();
            }
            
            req.flash('error', 'Bạn không có quyền truy cập tài nguyên này');
            return res.redirect('/');
        } catch (error) {
            console.error('Error in requireOwnership:', error);
            res.status(500).render('errors/500');
        }
    };
}

// Middleware: Get role-specific dashboard data
async function getRoleDashboardData(req, res, next) {
    try {
        const userRole = req.user?.role || 'user';
        
        switch(userRole) {
            case 'admin':
                // Fetch admin dashboard data
                const User = require('../models/User');
                const Room = require('../models/Room');
                const Booking = require('../models/Booking');
                
                res.locals.dashboardData = {
                    totalUsers: await User.countDocuments(),
                    totalHosts: await User.countDocuments({ role: 'host' }),
                    totalRooms: await Room.countDocuments(),
                    pendingRooms: await Room.countDocuments({ status: 'pending' }),
                    totalBookings: await Booking.countDocuments(),
                    totalRevenue: await Booking.aggregate([
                        { $match: { status: 'completed' } },
                        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
                    ]).then(result => result[0]?.total || 0)
                };
                break;
                
            case 'host':
                // Fetch host dashboard data
                const HostRoom = require('../models/Room');
                const HostBooking = require('../models/Booking');
                
                res.locals.dashboardData = {
                    totalRooms: await HostRoom.countDocuments({ host: req.user._id }),
                    activeRooms: await HostRoom.countDocuments({ host: req.user._id, status: 'active' }),
                    totalBookings: await HostBooking.countDocuments({ host: req.user._id }),
                    pendingBookings: await HostBooking.countDocuments({ host: req.user._id, status: 'pending' }),
                    totalEarnings: await HostBooking.aggregate([
                        { $match: { host: req.user._id, status: 'completed' } },
                        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
                    ]).then(result => result[0]?.total || 0),
                    averageRating: await HostRoom.aggregate([
                        { $match: { host: req.user._id } },
                        { $group: { _id: null, avg: { $avg: '$rating' } } }
                    ]).then(result => result[0]?.avg || 0)
                };
                break;
                
            default:
                // Fetch user dashboard data
                const UserBooking = require('../models/Booking');
                
                res.locals.dashboardData = {
                    totalBookings: await UserBooking.countDocuments({ user: req.user?._id }),
                    upcomingTrips: await UserBooking.countDocuments({ 
                        user: req.user?._id, 
                        startDate: { $gte: new Date() },
                        status: 'confirmed'
                    }),
                    wishlistCount: req.user?.wishlist?.length || 0
                };
        }
        
        next();
    } catch (error) {
        console.error('Error in getRoleDashboardData:', error);
        res.locals.dashboardData = {};
        next();
    }
}

// Middleware: Restrict access based on permission
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        
        const userRole = req.user.role || 'user';
        const roleConfig = getRoleConfig(userRole);
        
        if (roleConfig.permissions[permission]) {
            return next();
        }
        
        req.flash('error', 'Bạn không có quyền thực hiện hành động này');
        return res.redirect('/');
    };
}

// Helper: Format currency for display
function formatCurrency(amount) {
    if (!amount) return '0₫';
    return amount.toLocaleString('vi-VN') + '₫';
}

// Export all middlewares
module.exports = {
    injectRoleData,
    requireRole,
    requireHost,
    requireAdmin,
    requireOwnership,
    requirePermission,
    getRoleDashboardData,
    formatCurrency,
    ROLE_HIERARCHY,
    getRoleConfig
};