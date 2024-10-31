const adminAuth = (req, res, next) => {
  const adminToken = req.headers['admin-token'];

  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized: Admin access required' });
  }

  next();
};

module.exports = adminAuth;
