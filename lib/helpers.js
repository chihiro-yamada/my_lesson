module.exports = {
  padZero: function (num) {
    if (num < 10) {
      return `0${num}`;
    }
    return num;
  },
  formatDateTime: function (date) {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
  }
};