const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token байхгүй байна. Эхлээд нэвтэрнэ үү.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token хүчингүй байна.' });
  }
};

module.exports = verifyToken;
