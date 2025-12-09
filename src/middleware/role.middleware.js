// src/middleware/role.middleware.js
module.exports = function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role) return res.status(403).json({ message: 'User role not found' });
    if (role === 'admin') return next();
    if (allowedRoles.length === 0 || allowedRoles.includes(role)) return next();
    return res.status(403).json({ message: 'Forbidden: insufficient permission' });
  };
};
