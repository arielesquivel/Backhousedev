const express = require("express");
const router = express.Router();
const User = require("../models/usersModels");
const Propiedades = require("../models/propiedadesModels");
const Cita = require("../models/citasModels");
const { generateToken } = require("../config/envs");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../middleware/auth");
const { json } = require("sequelize");

/*const generateToken = (payload) => {
  const secretKey = "secret-key";
  const options = { expiresIn: "1h" };
  return jwt.sign(payload, secretKey, options);
};*/
router.post("/register", (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const rol = req.body.rol || "usuario";
  User.findOne({ where: { email } }).then((result) => {
    if (!result) {
      User.create({ ...req.body, rol }).then((user) => {
        console.log("users", user);
        return res.status(201).send(user);
      });
    } else {
      const message = "usuario ya esta registrado con ese mail";
      return res.status(401).json(message);
    }
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
router.get("/me", validateUser, (req, res) => {
  //const validation = req.user.email;
  res.send(req.user);
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").sendStatus(204);
});

router.get("/citas/all", validateUser, (req, res) => {
  const email = req.user.email;
  const message = "no es usuario autorizado";
  User.findOne({ where: { email } })
    .them((user) => {
      if (user.rol == "ADMIN") {
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
router.post("/propiedades", validateUser, (req, res) => {
  const payload = req.body;
  const email = req.user.email;
  const message = "no es usuario autorizado";
  User.findOne({ where: { email } })
    .then((user) => {
      if (user.rol == "ADMIN") {
        Propiedades.create(payload).then((data) => {
          return res.status(201).json(data);
        });
      } else {
        return res.status(401).json(message);
      }
    })
    .catch((error) => {
      return res.status(500).json(error);
    });
});
router.get("/users/:id", (req, res) => {
  const id = req.params.id;
  User.findOne({ where: { id } })
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.send(error);
    });
});
router.get("/propiedades/:id", (req, res) => {
  const id = req.params.id;
  Propiedades.findOne({ where: { id } })
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.send(error);
    });
});
router.get("/properties", (req, res) => {
  console.log("--------------------");
  Propiedades.findAll()
    .then((data) => {
      res.json(data);
      console.log("------------data");
    })
    .catch((error) => {
      console.log(error);
    });
});
router.get("/filter", async (req, res) => {
  try {
    const { categorita, localidad, precio, vender, alquilar } = req.query;
    const filter = {};
    if (vender) {
      filter.vender = vender;
    }
    if (alquilar) {
      filter.alquilar = alquilar;
    }
    if (categorita) {
      filter.categorita = categorita;
    }
    if (localidad) {
      filter.localidad = localidad;
    }
    if (precio) {
      filter.precio = parseFloat(precio);
    }
    const filtrarPropiedades = await Propiedades.findAll({
      where: filter,
    });
    res.json(filtrarPropiedades);
  } catch (error) {
    console.error("Error filtrado:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
