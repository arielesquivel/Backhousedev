const express = require("express");
const router = express.Router();
const User = require("../models/usersModels");
const Propiedades = require("../models/propiedadesModels");
const Cita = require("../models/citasModels");
const { generateToken } = require("../config/envs");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../middleware/auth");
const { json } = require("sequelize");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jonapandolfi@gmail.com",
    pass: "",
  },
});

const mailOptions = {
  from: "jonapandolfi@gmail.com",
  //to: "recipient_email@example.com",
  subject: "Confirmacíon de cita",
  text: "gracias por pedir una cita, lo esperamos!",
};
const sendEmail = (email) => {
  const to = email;
  const mail = [...mailOptions, to];

  transporter.sendMail(mail, (error, info) => {
    if (error) {
      return console.error(error.message);
    }
    console.log("Email sent:", info.response);
  });
};

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

router.post("/cita", validateUser, (req, res) => {
  const email = req.user.email;
  const message = "no se encontro su perfil";
  const fecha = req.body.fecha;
  const propiedad_id = req.body.propiedad_id.prop;
  User.findOne({ where: { email } })
    .then((result) => {
      if (result) {
        const id = result.id;
        const payload = {
          user_id: id,
          propiedad_id: propiedad_id,
          fecha: fecha,
        };
        Cita.create(payload)
          .then((data) => {
            //sendEmail(email);
            return res.status(201).json(data);
          })
          .catch((error) => {
            return res.status(403).json(error);
          });
      } else {
        return res.status(401).json(message);
      }
    })
    .catch((error) => {
      return res.status(500).json(error);
    });
});

router.get("/citas", validateUser, (req, res) => {
  const email = req.user.email;
  const message = "Hubo un error, no se puedo encontrar el usuario";
  User.findOne({ where: { email } }).then((result) => {
    if (result) {
      const id = result.id;
      Cita.findAll({ where: { id } }).then((citas) => {
        return res.send(citas);
      });
    } else {
      //const message = "usuario ya esta registrado con ese mail";
      return res.status(401).json(message);
    }
  });
});

router.get("/perfil", validateUser, (req, res) => {
  const email = req.user.email;
  const message = "Hubo un error, no se puedo encontrar el usuario";
  User.findOne({ where: { email } })
    .then((result) => {
      if (result) {
        return res.send(result);
      } else {
        //const message = "usuario ya esta registrado con ese mail";
        return res.status(401).json(message);
      }
    })
    .catch((error) => {
      return res.status(500).send(error);
    });
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
