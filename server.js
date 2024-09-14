import express from 'express';

const app = express();

// Serve static files from the 'dist' folder
app.use(express.static('dist'));

const PORT = process.env.PORT || 3132;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
