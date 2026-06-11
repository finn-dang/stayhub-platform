// helpers/handlebars-helpers.js

let moment;
try {
    moment = require('moment');
} catch (e) {
    moment = global.moment || require('moment');
}

module.exports = {
    // ========== EXISTING HELPERS FROM YOUR CODE ==========
    ifeq: function(a, b, options) {
        if (a === b) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    
    IsUser: function(role, role2) {
        return role === role2;
    },
    
    iterateArray: function(array, options) {
        let result = '';
        for (let i = 0; i < array.length; i++) {
            result += options.fn(array[i]);
        }
        return result;
    },
    
    genarr: function(arr) {
        let result = [];
        for (let i = 0; i < arr.length; i++) {
            result.push(arr[i]);
        }
        return result;
    },
    
    json: function(context) {
        try {
            return JSON.stringify(context);
        } catch (e) {
            return '{}';
        }
    },
    
    genTime: function(date, format) {
        if (!date) return '';
        return moment(date).format(format).toString();
    },
    
    formatCalendar: function(obj) {
        obj = JSON.parse(JSON.stringify(obj));
        let result = [];
        for (let i = 0; i < obj.length; i++) {
            let love = {};
            love.title = obj[i].name + " đã thuê";
            love.start = moment(obj[i].startday).format('YYYY-MM-DD');
            love.end = moment(obj[i].endday).format('YYYY-MM-DD');
            result.push(love);
        }
        return result;
    },
    
    genTimeloz: function(dates, format) {
        if (!dates || !dates.length) return [];
        return dates.map((e) => { return "'" + moment(e).format(format).toString() + "'" });
    },
    
    checkListEmpty: function(list) {
        return (list.length === 0);
    },
    
    extracost: function(value) {
        return Math.round(0.2 * value);
    },
    
    addedWishlist: function(value1, value2) {
        return (value1 === value2) ? "v" : "";
    },
    
    phoneNumberFormat: function(phoneNumber) {
        if (!phoneNumber) return '';
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        var len = phoneNumber.length;
        if (len == 7)
            phoneNumber = phoneNumber.replace(/([0-9]{3})([0-9]{4})/g, '$1-$2');
        else if (len == 10)
            phoneNumber = phoneNumber.replace(/([0-9]{3})([0-9]{3})([0-9]{4})/g, '($1) $2-$3');
        return phoneNumber;
    },
    
    beautyNumber: function(number) {
        return Math.floor(number);
    },
    
    for: function(from, to, incr, block) {
        var accum = '';
        for (var i = from; i < to; i += incr)
            accum += block.fn(i);
        return accum;
    },
    
    IsYou: function(cusID, UserID) {
        if (cusID && UserID)
            return cusID === UserID;
        return false;
    },
    
    // ========== NEW COMPARISON HELPERS ==========
    eq: function(a, b) {
        return a === b;
    },
    
    ne: function(a, b) {
        return a !== b;
    },
    
    gt: function(a, b) {
        return a > b;
    },
    
    lt: function(a, b) {
        return a < b;
    },
    
    gte: function(a, b) {
        return a >= b;
    },
    
    lte: function(a, b) {
        return a <= b;
    },
    
    and: function(a, b) {
        return a && b;
    },
    
    or: function(a, b) {
        return a || b;
    },
    
    not: function(a) {
        return !a;
    },
    
    // ========== FORMATTING HELPERS ==========
    formatCurrency: function(amount) {
        if (!amount && amount !== 0) return '0₫';
        return amount.toLocaleString('vi-VN') + '₫';
    },
    
    formatDate: function(date, format) {
        if (!date) return '';
        return moment(date).format(format || 'DD/MM/YYYY');
    },
    
    formatDateTime: function(date) {
        if (!date) return '';
        return moment(date).format('DD/MM/YYYY HH:mm');
    },
    
    // ========== STRING HELPERS ==========
    truncate: function(str, length) {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    },
    
    toLowerCase: function(str) {
        return str ? str.toLowerCase() : '';
    },
    
    toUpperCase: function(str) {
        return str ? str.toUpperCase() : '';
    },
    
    capitalize: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    // ========== MATH HELPERS ==========
    inc: function(value) {
        return parseInt(value) + 1;
    },
    
    dec: function(value) {
        return parseInt(value) - 1;
    },
    
    // ========== RANGE HELPER ==========
    range: function(start, end, options) {
        let result = '';
        for (let i = start; i <= end; i++) {
            result += options.fn(i);
        }
        return result;
    },
    
    // ========== RATING HELPERS ==========
    stars: function(rating) {
        if (!rating || rating === 0) return '☆☆☆☆☆';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '★';
        if (hasHalfStar) stars += '½';
        for (let i = stars.length; i < 5; i++) stars += '☆';
        return stars;
    },
    
    ratingPercentage: function(rating) {
        if (!rating) return 0;
        return (rating / 5) * 100;
    },
    
    // ========== IMAGE HELPERS ==========
    firstImage: function(images) {
        if (images && images.length > 0) {
            if (typeof images[0] === 'string') return images[0];
            if (images[0].url) return images[0].url;
        }
        return '/img/default-house.jpg';
    },
    
    // ========== WISHLIST HELPER ==========
    inWishlist: function(roomId, wishlist) {
        if (!wishlist || !wishlist.length) return false;
        return wishlist.some(item => {
            const itemRoomId = item.room ? item.room.toString() : null;
            return itemRoomId === roomId.toString();
        });
    },
    
    // ========== UTILITY HELPERS ==========
    pluralize: function(count, singular, plural) {
        return count === 1 ? singular : (plural || singular + 's');
    },
    
    default: function(value, defaultValue) {
        return value ? value : defaultValue;
    },
    
    // Block helper for if_eq (alternative to ifeq)
    if_eq: function(a, b, options) {
        if (a === b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },
    
    // Block helper for if_not_eq
    if_not_eq: function(a, b, options) {
        if (a !== b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    }
};