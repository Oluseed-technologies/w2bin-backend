const nodemailer = require("nodemailer");
class Email {
  constructor(to) {
    this.to = to;
  }
  createTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: "465",
      auth: {
        user: "devhalltech@gmail.com",
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: true,
    });
  }
  async sendMail(subject, text) {
    const mailOptions = {
      from: "devhalltech@gmail.com",
      to: this.to,
      subject,
      text,
    };
    await this.createTransport().sendMail(mailOptions);
  }
  async sendWelcomeOTP(token) {
    this.sendMail(
      "Welcome to waste management site",
      `Enter this OTP to verify your email - ${token}`
    );
  }
  async sendPasswordOTP(token) {
    this.sendMail(
      "Forgotten Password",
      `Enter this OTP to reset your passsword - ${token}`
    );
  }
}
module.exports = Email;
