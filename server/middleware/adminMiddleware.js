const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "AdminUser") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = verifyAdmin;
