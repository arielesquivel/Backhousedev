const express = require("express");
const db = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());
const authAPI = require("./routes/index");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use("/api", authAPI);
db.sync({ force: false })
  .then(() => {
    console.log("sincronizada  bases");
  })
  .then(() => {
    app.listen(5000, () => {
      console.log("Servidorr en puerto 5000");
    });
  });
