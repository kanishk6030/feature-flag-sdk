const nodemailer = require('nodemailer');

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from };
}

function createTransport(config) {
  const secure = config.port === 465;
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

async function sendVerificationEmail(to, link) {
  const config = getMailerConfig();
  if (!config) {
    return false;
  }

  const transporter = createTransport(config);
  await transporter.sendMail({
    from: config.from,
    to,
    subject: 'Verify your Feature Flag account',
    text: `Verify your email by opening this link: ${link}`,
    html: `
      <p>Verify your email by clicking the link below:</p>
      <p><a href="${link}">${link}</a></p>
    `
  });

  return true;
}

module.exports = { sendVerificationEmail };
