const moment = require('moment');

function formatMessage(username, text, time) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;