require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use('/profile', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
