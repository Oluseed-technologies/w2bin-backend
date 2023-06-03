const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const statesData = require("../datas/location.json");

const state = statesData.map((data, index) => {
  return data.state.toLowerCase();
});

const authSchema = mongoose.Schema(
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
          return this.type?.toLowerCase() == "user";
        },
        "user first name is is required",
      ],
      minLength: [3, "First Name cannot be less than 3"],
      maxLength: [30, "First Name cannot be greate than 30"],
    },
    lastName: {
      type: String,
      required: [
        function () {
          return this.type?.toLowerCase() == "user";
        },
        "User last name is required",
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
        values: ["user", "company"],
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

authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

authSchema.statics.comparePassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

authSchema.methods.toJSON = function (doc, ret, options) {
  const user = this.toObject();
  // delete user.password;
  // delete user.__v;
  return user;
};

module.exports = mongoose.model("Auth", authSchema);
