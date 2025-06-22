const express = require('express');
const cors = require('cors');
const { db } = require('./firebase');

const app = express();
app.use(cors());

const PORT = 3000;

app.get('/api/registros', async (req, res) => {
  try {
    const snapshot = await db.collection('registros').get();
    const registros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
