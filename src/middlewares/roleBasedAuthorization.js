const roleBasedAuthorization = (...allowedUsers) => {
  return (req, res, next) => {
    if (!allowedUsers.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
};

module.exports = roleBasedAuthorization;
