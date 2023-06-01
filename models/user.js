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
      required: [
        function () {
          return this.type.toLowerCase() == "user";
        },
        "user first name is re is required",
      ],
      minLength: [3, "First Name cannot be less than 3"],
      maxLength: [30, "First Name cannot be greate than 30"],
    },
    lastName: {
      type: String,
      required: [
        function () {
          return this.type.toLowerCase() == "user";
        },
        "User last name is required",
      ],
      minLength: [3, "Last Name cannot be less than 3"],
      maxLength: [30, "Last Name cannot be greate than 30"],
    },
    // cacNumber: {
    //   type: Number,
    //   required: [
    //     function () {
    //       return this.type.toLowerCase() == "company";
    //     },
    //     "CAC registration number is required",
    //   ],
    // },
    companyName: {
      type: String,
      required: [
        function () {
          return this.type.toLowerCase() == "company";
        },
        "The company name is required",
      ],
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
      enum: {
        values: state,
        message: "{{VALUE}} is not a valid a Nigeria state",
      },
      required: [true, "Please enter your state"],
    },
    lga: {
      type: String,
      required: [true, "Please enter your local government"],
    },
    address: {
      type: String,
      required: [true, "Please enter your home address"],
    },
    type: {
      type: String,
      default: "user",
      // required : [],
      enum: {
        values: ["user", "company", "admin"],
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

UserSchema.statics.comparePassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

UserSchema.methods.toJSON = function (doc, ret, options) {
  const user = this.toObject();
  // delete user.password;
  // delete user.__v;
  return user;
};

module.exports = mongoose.model("User", UserSchema);
