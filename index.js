const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Olá, servidor Express a funcionar no Render!');
});

app.listen(port, () => {
  console.log(`Servidor a correr na porta ${port}`);
});
