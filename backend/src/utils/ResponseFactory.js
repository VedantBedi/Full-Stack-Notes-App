class ResponseFactory {
  // Factory method for successful responses
  static createSuccess(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString() // Automatically add metadata!
    });
  }

  // Factory method for error responses
  static createError(res, message = "An error occurred", statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors, // Useful for validation errors
      timestamp: new Date().toISOString()
    });
  }
}

export default ResponseFactory;