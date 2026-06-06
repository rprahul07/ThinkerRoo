// server.js

const express = require('express');
const app = express();
const PORT = 3000;

const userRoutes = require('./routes/userRoutes');  // this

app.use(express.json());// this

// app.get('/',(req,res)=>{
//   res.send("hello");
// } );

app.use('/profile', userRoutes);// this

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});