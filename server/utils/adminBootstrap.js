const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');

async function ensureAdminUser() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    // eslint-disable-next-line no-console
    console.warn('ADMIN_USERNAME/ADMIN_PASSWORD not set; no admin bootstrapped');
    return;
  }

  const existing = await AdminUser.findOne({ username: username.toLowerCase() }).lean();
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await AdminUser.create({
    username: username.toLowerCase(),
    passwordHash,
    role: 'admin'
  });

  // eslint-disable-next-line no-console
  console.log('Admin user created from env credentials');
}

module.exports = { ensureAdminUser };
