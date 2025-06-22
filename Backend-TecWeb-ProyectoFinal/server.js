const express = require('express');
const cors = require('cors');
const { db, admin } = require('./firebase'); 

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

app.get('/api/redsocial', async (req, res) => {
  try {
    const docRef = db.collection('redesQR').doc('actual');
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const data = docSnap.data();
    const redes = ['instagram', 'facebook', 'youtube'];
    const actual = data.activo;
    const timestamp = data.actualizado.toDate();
    const ahora = new Date();
    const msPasados = ahora - timestamp;
    const diezSegundosMS = 10 * 1000;

    console.log('Tiempo ahora:', ahora);
    console.log('Última actualización:', timestamp);
    console.log('Milisegundos pasados:', msPasados);
    console.log('¿Han pasado 10 segundos?', msPasados >= diezSegundosMS);

    let nuevoActivo = actual;

    if (msPasados >= diezSegundosMS) {
      const index = redes.indexOf(actual);
      nuevoActivo = redes[(index + 1) % redes.length];

      await docRef.update({
        activo: nuevoActivo,
        actualizado: admin.firestore.Timestamp.fromDate(ahora),
      });

      console.log(`QR actualizado a: ${nuevoActivo}`);
    }

    const url = data[nuevoActivo];
    res.json({ redSocialActiva: nuevoActivo, url });

  } catch (error) {
    console.error('Error al obtener red social activa:', error);
    res.status(500).json({ error: 'Error al obtener red social activa' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
