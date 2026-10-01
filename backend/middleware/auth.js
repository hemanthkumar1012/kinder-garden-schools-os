const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kinder-garden-secret-key-2026');
    const company = await Company.findById(decoded.id).select('-passwordHash');
    if (!company) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.company = company;
    req.companyId = company._id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
};

module.exports = auth;
