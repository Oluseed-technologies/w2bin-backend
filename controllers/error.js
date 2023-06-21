// global error controller

const handleValidationError = (err, res) => {
  const data = Object.keys(err.errors).map((data) => {
    return err.errors[data].message;
  });

  const arr = Object.keys(err.errors).map((data) => {
    return err.errors[data];
  })[0];

  if (arr.name === "CastError") {
    return res.status(401).json({
      status: "fail",
      message: `invalid ${arr.kind}  passed :${arr.stringValue} `,

      err: err.errors,
    });
  }

  res.status(401).json({
    status: "fail",
    type: "validation error",
    message: data[0],

    err: err,
  });
};

const handleDuplicateError = (err, res) => {
  res.status(409).json({
    status: "fail",
    message: "User credential already exist",
    err: err,
  });
};

const handleCastError = (err, res) => {
  res.status(422).json({
    status: "error",
    message: `invalid : ${err.path} : ${err.value.id} `,
  });
};

const handleJWTMalformed = (err, res) => {
  res.status(422).json({
    status: "fail",
    message: "invalid authorization header ",
  });
};

const handlePaystackError = (err, res) => {
  console.log(err.response.data.message);
  if (
    err?.response?.data?.message?.split(":")[0].trim() == "Unknown bank code"
  ) {
    return res.status(422).json({
      status: "fail",
      message: "Please provide a valid bank code",
    });
  }
  if (
    err?.response?.data?.message ===
    "Could not resolve account name. Check parameters or try again."
  )
    return res.status(422).json({
      status: "fail",
      message: "Please provide a account number",
    });
  return res.status(422).json({
    status: "fail",
    message: "This is a paystack error",
  });
};

const GlobalError = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || "fail";
  // console.log(err);
  console.log(err);

  if (err?.name === "ValidationError") {
    return handleValidationError(err, res);
  }
  if (err?.name === "CastError") {
    return handleCastError(err, res);
  }
  if (err?.code === 11000) {
    return handleDuplicateError(err, res);
  }
  if (err.name === "JsonWebTokenError") {
    return handleJWTMalformed(err, res);
  }
  if (
    `${err?.response?.request?.protocol}//${err?.response?.request?.host}` ===
    process.env.PAYSTACK_URL
  ) {
    return handlePaystackError(err, res);
  }
  // if
  res.status(statusCode).json({
    status,
    message: err.message,
    err,
  });
};

module.exports = GlobalError;
