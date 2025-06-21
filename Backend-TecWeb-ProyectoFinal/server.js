const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api/qr/:id', (req, res) => {
  const id = req.params.id;

  // Simulación de datos como si vinieran de Firebase
  const datos = {
    id: id,
    nombre: "Ejemplo QR",
    mensaje: "Hola desde Node.js para ID " + id
  };

  res.json(datos);
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
