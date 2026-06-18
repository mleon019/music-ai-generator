const nodemailer = require("nodemailer");
const config = require("../config");

let transporter = null;

async function getTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  return transporter;
}

async function sendResetEmail(to, resetLink) {
  try {
    const tr = await getTransporter();

    const info = await tr.sendMail({
      from: config.smtp.from,
      to,
      subject: "Recuperación de contraseña",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#333;">Recuperación de contraseña</h2>
          <p style="color:#555;">Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Restablecer contraseña</a>
          <p style="color:#999;font-size:0.85em;">Si no solicitaste este cambio, ignora este correo. El enlace expirará en 10 minutos.</p>
        </div>
      `
    });
    return info;
  } catch (error) {
    console.error(`[SMTP] ERROR al enviar correo a ${to}:`, error.message);
    if (error.code) console.error(`[SMTP] Código de error: ${error.code}`);
    if (error.response) console.error(`[SMTP] Respuesta del servidor: ${error.response}`);
    throw error;
  }
}

module.exports = {
  sendResetEmail
};
