// utils/roleConfig.js
const ROLE_CONFIG = {
    USER: {
        id: 'user',
        name: 'Khách hàng',
        icon: 'bi-person',
        color: '#4285F4',
        gradient: 'linear-gradient(135deg, #4285F4 0%, #5A9CFF 100%)',
        navigation: {
            main: [
                { icon: 'bi-house-door', label: 'Trang chủ', href: '/', visible: true },
                { icon: 'bi-search', label: 'Tìm kiếm', href: '/rooms', visible: true },
                { icon: 'bi-calendar-check', label: 'Chuyến đi', href: '/user/bookings', visible: true },
                { icon: 'bi-heart', label: 'Yêu thích', href: '/user/wishlist', visible: true },
                { icon: 'bi-chat', label: 'Tin nhắn', href: '/user/messages', visible: true }
            ],
            secondary: [
                { icon: 'bi-person', label: 'Hồ sơ', href: '/user/profile' },
                { icon: 'bi-gear', label: 'Cài đặt', href: '/user/settings' },
                { icon: 'bi-question-circle', label: 'Trợ giúp', href: '/help' }
            ]
        },
        permissions: {
            canViewRooms: true,
            canBookRooms: true,
            canReview: true,
            canCreateListing: false,
            canManageOwnListings: false,
            canManageUsers: false,
            canAccessAdmin: false,
            canViewReports: false
        }
    },
    
    HOST: {
        id: 'host',
        name: 'Chủ nhà',
        icon: 'bi-building',
        color: '#34A853',
        gradient: 'linear-gradient(135deg, #34A853 0%, #5BCF7A 100%)',
        navigation: {
            main: [
                { icon: 'bi-house-door', label: 'Trang chủ', href: '/', visible: true },
                { icon: 'bi-search', label: 'Tìm kiếm', href: '/rooms', visible: true },
                { icon: 'bi-plus-circle', label: 'Đăng tin mới', href: '/rooms/create', visible: true },
                { icon: 'bi-grid-3x3', label: 'Quản lý phòng', href: '/host/rooms', visible: true },
                { icon: 'bi-calendar-week', label: 'Quản lý đặt phòng', href: '/host/bookings', visible: true },
                { icon: 'bi-graph-up', label: 'Thống kê', href: '/host/analytics', visible: true }
            ],
            secondary: [
                { icon: 'bi-wallet2', label: 'Doanh thu', href: '/host/earnings' },
                { icon: 'bi-person', label: 'Hồ sơ chủ nhà', href: '/host/profile' },
                { icon: 'bi-gear', label: 'Cài đặt', href: '/host/settings' },
                { icon: 'bi-question-circle', label: 'Trợ giúp', href: '/help' }
            ]
        },
        permissions: {
            canViewRooms: true,
            canBookRooms: true,
            canReview: true,
            canCreateListing: true,
            canManageOwnListings: true,
            canViewEarnings: true,
            canManageUsers: false,
            canAccessAdmin: false,
            canViewReports: false
        }
    },
    
    ADMIN: {
        id: 'admin',
        name: 'Quản trị viên',
        icon: 'bi-shield-lock-fill',
        color: '#EA4335',
        gradient: 'linear-gradient(135deg, #EA4335 0%, #FF6B6B 100%)',
        navigation: {
            main: [
                { icon: 'bi-speedometer2', label: 'Dashboard', href: '/admin', visible: true },
                { icon: 'bi-people', label: 'Quản lý người dùng', href: '/admin/users', visible: true },
                { icon: 'bi-building', label: 'Quản lý bài đăng', href: '/admin/rooms', visible: true },
                { icon: 'bi-calendar-check', label: 'Quản lý đặt phòng', href: '/admin/bookings', visible: true },
                { icon: 'bi-flag', label: 'Báo cáo vi phạm', href: '/admin/reports', visible: true },
                { icon: 'bi-cash-stack', label: 'Doanh thu', href: '/admin/revenue', visible: true }
            ],
            secondary: [
                { icon: 'bi-tags', label: 'Quản lý danh mục', href: '/admin/categories' },
                { icon: 'bi-megaphone', label: 'Thông báo', href: '/admin/notifications' },
                { icon: 'bi-gear', label: 'Cấu hình hệ thống', href: '/admin/settings' },
                { icon: 'bi-file-text', label: 'Báo cáo tổng hợp', href: '/admin/reports' },
                { icon: 'bi-database', label: 'Backup dữ liệu', href: '/admin/backup' }
            ]
        },
        permissions: {
            canViewRooms: true,
            canBookRooms: false,
            canReview: true,
            canCreateListing: false,
            canManageAllListings: true,
            canManageUsers: true,
            canAccessAdmin: true,
            canViewReports: true,
            canManageSystem: true
        }
    }
};

module.exports = { ROLE_CONFIG };