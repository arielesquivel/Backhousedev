const express = require("express");
const router = express.Router();
const User = require("../models/usersModels");
const propiedadesModels = require("../models/propiedadesModels");
const Cita = require("../models/citasModels");
const jwt = require("jsonwebtoken");
const validateAuth = require("../middleware/auth");

const generateToken = (payload) => {
  const secretKey = "secret-key";
  const options = { expiresIn: "1h" };
  return jwt.sign(payload, secretKey, options);
};
router.post("/register", (req, res) => {
  console.log(req.body);
  const rol = req.body.rol || "usuario";
  User.create({ ...req.body, rol }).then((user) => {
    console.log("users", user);
    return res.status(201).send(user);
  });
  /* const { email, password, name } = req.body;
  const role = req.body.role || "user";
  User.create(email, password, name, role)
    .then((user) => {
      const payload = {
        email: user.email,
        name: user.name,
      };
      const token = generateToken(payload);

      res.status(201).cookie("token", token).send(payload);
    })
    .catch(next); */
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const status = 404;
  User.findOne({
    where: { email },
  }).then((user) => {
    if (!user) return res.sendStatus(status);
    user.validatePassword(password).then((isValidate) => {
      if (!isValidate) return res.send(401);
      else {
        const payload = {
          email: user.email,
          name: user.name,
        };
        const token = generateToken(payload);
        res.status(201).cookie("token", token).send(payload);
      }
    });
  });
});
 router.get("/me", validateAuth.validateUser, (req, res) => {
    //const validation = req.user.email;
    res.send(req.user);
  });

  router.post("/logout", (req, res) => {
    res.clearCookie("token").sendStatus(204);
  });
});
router.get("/citas/all", validateAuth.validateUser, (req, res) => {
  const validation = req.user.email;
  const message = "no es usuario autorizado";
  User.findOne({ where: { validation } })
    .them((user) => {
      if (user.role == "ADMIN") {
        Cita.findAll().then((citas) => {
          return res.send(citas);
        });
      } else {
        return res.status(401).send(message);
      }
    })
    .catch((error) => {
      return res.status(500).send(error);
    });
});
router.post("/propiedades", validateAuth.validateUser, (req, res) => {
  const payload = req.body;
  const validation = req.user.email;
  const message = "no es usuario autorizado";
  User.findOne({ where: { validation } })
    .them((user) => {
      if (user.role == "ADMIN") {
        propiedadesModels.create(payload).then((data) => {
          return res.status(201).send(data);
        });
      } else {
        return res.status(401).send(message);
      }
    })
    .catch((error) => {
      return res.status(500).send(error);
    });
});

router.get("./filter", async (req, res) => {
  try {
    const { categorita, localidad, precio } = req.query;
    const filter = {};
    if (categorita) {
      filter.categorita = categorita;
    }
    if (localidad) {
      filter.localidad = localidad;
    }
    if (precio) {
      filter.precio = parseFloat(precio);
    }
    const filtrarPropiedades = await PropiedadesModel.findAll({
      where: filter,
    });
    res.json(filtrarPropiedades);
  } catch (error) {
    console.error("Error filtrado:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
