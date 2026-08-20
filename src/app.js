import express from "express";

const app = express();

// Middleware

// Routes
app.get("/", (req, res) => {
  res.send("Hello Welcome backend Series");
});

// error middleware
app.use(errorHandler);

export { app };
