// server.js

const express = require('express');
const app = express();

const userRoutes = require('./routes/userRoutes');  // this

app.use(express.json());// this

app.use('/profile', userRoutes);// this

app.listen(3000, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});