
const express = require('express');
const cors = require('cors');
const { sendMail } = require('./mailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { to, subject, message } = req.body;
  const date = new Date().toLocaleString();

  try {
    await sendMail(to, subject, `${message}\n\nEnviado el: ${date}`);
    res.json({ ok: true, msg: 'Correo enviado correctamente.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log('✅ Servidor corriendo en http://localhost:3000');
});
