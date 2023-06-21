const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const statesData = require("../datas/location.json");

const Account = require("./accounts");

const state = statesData.map((data, index) => {
  return data.state.toLowerCase();
});

const workerSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Worker first name cannot be empty"],

    minLength: [3, "First Name cannot be less than 3"],
    maxLength: [30, "First Name cannot be greater than 30"],
  },
  lastName: {
    type: String,
    required: [true, "Worker Last name caanot be empty"],
    minLength: [3, "Last Name cannot be less than 3 characters"],
    maxLength: [30, "Last Name cannot be greate than 30 characters"],
  },
  role: {
    type: String,
    required: [true, "A worker must have a role"],
    minLength: [3, "Worker role should not be less than 3 charactes"],
  },
});
const workHoursSchema = mongoose.Schema({
  day: {
    type: String,
    required: [true, "Please choose a day"],
    enum: {
      values: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      message: "Please provide a valid day of the week",
    },
  },
  startHour: {
    type: Number,
    required: [true, "Please specify the start hours"],
    min: 0,
    max: 23,
  },
  endHour: {
    type: Number,
    required: [true, "Please specify the end hour"],
    min: 0,
    max: 23,
  },
});

const socialMediaSchema = mongoose.Schema({
  whatsapp: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
    required: [true, "Please provide your whatsapp link"],
  },
  facebook: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
    required: [true, "Please provide your facebook link"],
  },
  twitter: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
  },
  instagram: {
    type: String,
    validate: [validator.isURL, "Please enter a valid link"],
  },
});

const userSchema = mongoose.Schema(
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
      required: [
        true,
        // function () {
        //   return this.type?.toLowerCase() == "user";
        // },
        "First name is is required",
      ],
      minLength: [3, "First Name cannot be less than 3"],
      maxLength: [30, "First Name cannot be greate than 30"],
    },
    lastName: {
      type: String,
      required: [
        true,
        // function () {
        //   return this.type?.toLowerCase() == "user";
        // },
        " Last name is required",
      ],
      minLength: [3, "Last Name cannot be less than 3"],
      maxLength: [30, "Last Name cannot be greate than 30"],
    },
    companyName: {
      type: String,
      required: [
        function () {
          return this.type?.toLowerCase() == "company";
        },
        "The company name is required",
      ],
    },
    phone: {
      type: String,
      validate: {
        validator: function (val) {
          return validator.isMobilePhone(val, "en-NG");
        },
        message: "Please specify a valid Nigeria number",
      },
      unique: [true, "The user with the specified phone number already exist"],
      required: [true, "Phone number is required"],
    },
    country: {
      type: String,
      default: "Nigeria",
    },

    state: {
      type: String,
      validate: {
        validator: function (val) {
          return state.some((data) => {
            return data === val?.toLowerCase();
          });
        },
        message: `{{VALUE}} is not a valid Nigeria state`,
      },
      required: [true, "Please enter your state"],
    },
    lga: {
      type: String,
      required: [true, "Please enter your local government"],
      validate: {
        validator: function (val) {
          const localGvtAreas = statesData.filter((data, index) => {
            return data.state.toLowerCase() === this.state?.toLowerCase();
          })[0]?.lgas;

          return localGvtAreas?.some((data) => {
            return data?.toLowerCase() === val?.toLowerCase();
          });
        },
        message: `{{VALUE}} Local Government does not exist the specified state`,
      },
    },
    address: {
      type: String,
      required: [true, "Please enter your home address"],
    },
    type: {
      type: String,

      required: [
        true,
        "Please specify the account type, either user or company",
      ],
      enum: {
        values: ["user", "company", "super-admin", "admin"],
        message: "{{VALUE}} is not a valid user",
      },
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
    about: {
      type: String,
      trim: true,
      minLength: [
        30,
        "The description about the company should not be less than 30 characters",
      ],
    },
    workers: {
      type: [
        {
          firstName: {
            type: String,
          },
          lastName: {
            type: String,
          },
          role: {
            type: String,
          },
        },
      ],
    },
    workhours: {
      type: [workHoursSchema],
    },
    socialMedias: {
      type: [socialMediaSchema],
    },
    services: {
      type: mongoose.Schema.ObjectId,
      ref: "Service",
    },
    device_id: {
      type: String,
    },
    bankAccounts: {
      type: [mongoose.Schema.ObjectId],
      ref: "Accounts",
    },
    wallet: {
      type: mongoose.Schema.ObjectId,
      ref: "Wallet",
    },
  },

  {
    timestamps: true,
  },
  {
    toJSON: {
      transform: function (doc, ret, options) {
        if (options.includePassword) {
          return ret; // Include the password field
        }
        delete ret.password; // Remove the password field from the returned object
        return ret;
      },
    },
  }
);

// pre save middlwares

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

// userSchema.pre(/^find/, async function (next) {
//   const user = this.find({ _id: this.getQuery()._id });
//   console.log(user);
//   const account = await Account.find({ user: this.getQuery()._id });

//   console.log(account);
//   // next();
// });

userSchema.statics.comparePassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

userSchema.methods.toJSON = function (doc, ret, options) {
  const user = this.toObject();
  // delete user.password;
  // delete user.__v;
  return user;
};

module.exports = mongoose.model("User", userSchema);
