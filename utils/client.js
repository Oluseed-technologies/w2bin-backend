const OneSignal = require("onesignal-node");

exports.NotificationClient = () => {
  return new OneSignal.Client(process.env.SIGNAL_ID, process.env.SIGNAL_KEY);
};
