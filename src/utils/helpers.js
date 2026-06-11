// src/utils/helpers.js
const moment = require('moment');

module.exports = {
  eq: (a, b) => a === b,
  ne: (a, b) => a !== b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  gte: (a, b) => a >= b,
  lte: (a, b) => a <= b,
  and: (a, b) => a && b,
  or: (a, b) => a || b,
  not: (a) => !a,
  
  formatCurrency: (amount) => {
    if (!amount && amount !== 0) return '0₫';
    return amount.toLocaleString('vi-VN') + '₫';
  },
  
  formatDate: (date, format) => {
    if (!date) return '';
    return moment(date).format(format || 'DD/MM/YYYY');
  },
  
  stars: (rating) => {
    if (!rating) return '☆☆☆☆☆';
    const fullStars = Math.floor(rating);
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    for (let i = stars.length; i < 5; i++) stars += '☆';
    return stars;
  },
  
  json: (context) => {
    try { return JSON.stringify(context); } 
    catch(e) { return '{}'; }
  },
  
  range: (start, end, options) => {
    let result = '';
    for (let i = start; i <= end; i++) {
      result += options.fn(i);
    }
    return result;
  },
  
  inc: (value) => parseInt(value) + 1,
  dec: (value) => parseInt(value) - 1,
  
  inWishlist: (roomId, wishlist) => {
    if (!wishlist || !wishlist.length) return false;
    return wishlist.some(item => item.room?.toString() === roomId?.toString());
  },
  // Add this helper
times: function(n, options) {
    let result = '';
    for (let i = 1; i <= n; i++) {
        result += options.fn(i);
    }
    return result;
},
  floor: function(value) {
    return Math.floor(value);
  },
  if_eq: (a, b, options) => {
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
}
};