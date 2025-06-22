const admin = require('firebase-admin');
const serviceAccount = require('./tecweb-proyectofinal-2025-firebase-adminsdk-fbsvc-9fe89c0390.json'); // ruta a tu archivo JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
