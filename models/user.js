const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const statesData = require("../datas/location.json");

const state = statesData.map((data, index) => {
  return data.state;
});

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide your email "],
      unique: true,
      validate: [validator.isEmail, "Please Provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required "],
      select: false,
      minLength: [8, "Password should be atleast 8 characters"],
      validate: [
        validator.isStrongPassword,
        "Password must contain atleast one digit, one lowercase letter , one uppercase letter and one character",
      ],
    },
    confirmPassword: {
      type: String,
      required: [true, "Confirm password is required"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message:
          "Password confirmation failed, please check the password again.",
      },
    },
    firstName: {
      type: String,
      required: [true, "First Name is required "],
      minLength: [3, "First Name cannot be less than 3"],
      maxLength: [30, "First Name cannot be greate than 30"],
    },
    lastName: {
      type: String,
      required: [true, "The Last Name is required"],
      minLength: [3, "Last Name cannot be less than 3"],
      maxLength: [30, "Last Name cannot be greate than 30"],
    },
    phone: {
      type: String,
      validate: [
        validator.isMobilePhone,
        "Please provide a valid phone number",
      ],
      unique: [true, "The user with the specified phone number already exist"],
      required: [true, "Phone number is required"],
    },
    country: {
      type: String,
      default: "Nigeria",
    },
    state: {
      type: String,
      enum: state,
    },
    lga: {
      type: String,
    },
    address: {
      type: String,
    },
    token: {
      type: Number,
    },
    tokenExpire: {
      type: Date,
    },
    resetToken: {
      type: Number,
    },
    resetTokenExpire: {
      type: Date,
    },
    status: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "suspended", "active"],
        message:
          "{{VALUE}} is not a valid status, status can either be pending, suspended or active",
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// pre save middlwares

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

UserSchema.statics.comparePassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  // delete user.password;
  // delete user.__v;
  return user;
};

module.exports = mongoose.model("User", UserSchema);
