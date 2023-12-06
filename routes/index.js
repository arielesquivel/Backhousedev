const express = require("express");
const router = express.Router();
const User = require("../models/usersModels");
const Propiedades = require("../models/propiedadesModels");
const Cita = require("../models/citasModels");
const Favorito = require("../models/favoritosModels");
const { generateToken } = require("../config/envs");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../middleware/auth");
const { json } = require("sequelize");
const nodemailer = require("nodemailer");

const smtpTransport = require("nodemailer-smtp-transport");
const { google } = require("googleapis");

const clientId =
  "646065791404-8nuegmaohvpl5lli8f9f41u4ea5ablb9.apps.googleusercontent.com";
const clientSecret = "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";
const refreshToken = "YOUR_REFRESH_TOKEN";

//pass: "Plataforma5Equipo1",

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "jonayariel@gmail.com",
      clientId,
      clientSecret,
      //refreshToken,
    },
  })
);

const sendEmailAdministrador = () => {
  const mailOptions = {
    from: "jonayariel@gmail.com",
    to: "jonayariel@gmail.com",
    subject: "Cita pendiente",
    text: "Alguien a agendado una cita, por favor ingrese a la pagina para confirma la cita",
  };
  const mail = mailOptions;

  transporter.sendMail(mail, (error, info) => {
    console.log(mail);
    if (error) {
      return console.error(error.message);
    }
    console.log("Email sent:", info.response);
  });
};
const sendEmailAceptacion = (email) => {
  const to = email;
  const mailOptions = {
    from: "jonayariel@gmail.com",
    to: "",
    subject: "Cita aceptada",
    text: "gracias por pedir una cita, su cita fue aceptada. Lo esperamos!",
  };
  let mail = mailOptions;
  mail.to = to;

  transporter.sendMail(mail, (error, info) => {
    if (error) {
      return console.error(error.message);
    }
    console.log("Email sent:", info.response);
  });
};
const sendEmailRechazado = (email) => {
  const to = email;
  const mailOptions = {
    from: "jonayariel@gmail.com",
    to: "",
    subject: "Cita rechazada",
    text: "gracias por pedir una cita. Lamentablemente, ha habido un problema y no se ha podido confirmar esta cita. Por favor, comuniquese con nosotros para más información",
  };
  let mail = mailOptions;
  mail.to = to;

  transporter.sendMail(mail, (error, info) => {
    if (error) {
      return console.error(error.message);
    }
    console.log("Email sent:", info.response);
  });
};
const sendEmailConfirmacion = (email) => {
  const to = email;
  const mailOptions = {
    from: "jonayariel@gmail.com",
    to: "",
    subject: "Confirmacíon de cita",
    text: "gracias por pedir una cita, espere por favor para recibir un correo confirmando o no la cita",
  };
  let mail = mailOptions;
  mail.to = to;

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
          rol: user.rol,
        };
        const token = generateToken(payload);
        res.status(201).cookie("token", token).send(payload);
      }
    });
  });
});

router.get("/me", validateUser, (req, res) => {
  //const validation = req.user.email;
  console.log(req.user);
  res.send(req.user);
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").sendStatus(204);
});

router.post("/cita", validateUser, (req, res) => {
  const email = req.user.email;
  const message = "no se encontro su perfil";
  const fecha = req.body.fecha;
  console.log("*******************************************", req.body);
  const propiedad_id = req.body.propiedad_id.prop;
  console.log("********************************************", propiedad_id);
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
            console.log("********************************************", email);
            sendEmailConfirmacion(email);
            sendEmailAdministrador();

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
router.post("/citas/aceptado", validateUser, (req, res) => {
  const mail = req.body;
  const email = req.user.email;
  const message = "no es usuario autorizado";
  User.findOne({ where: { email } })
    .then((user) => {
      if (user.rol == "ADMIN") {
        sendEmailAceptacion(mail);
        return res.status(200);
      } else {
        return res.status(401).json(message);
      }
    })
    .catch((error) => {
      return res.status(500).json(error);
    });
});
router.post("/citas/rechazado", validateUser, (req, res) => {
  const mail = req.body;
  const email = req.user.email;
  const message = "no es usuario autorizado";
  User.findOne({ where: { email } })
    .then((user) => {
      if (user.rol == "ADMIN") {
        sendEmailRechazado(mail);
        return res.status(200);
      } else {
        return res.status(401).json(message);
      }
    })
    .catch((error) => {
      return res.status(500).json(error);
    });
});
/*
 router.get("/citas", validateUser, (req, res) => {
  const email = req.user.email;
  let citasAux = [];
  let userAux = {};
  let propiedadesAux = {};
  let nuevoArray = [];
  const message = "Hubo un error, no se puedo encontrar el usuario";
  User.findOne({ where: { email } }).then((result) => {
    if (result) {
      const id = result.id;
      Cita.findAll({ where: { id } }).then((citas) => {
        citasAux = citas;
        for (let element in citasAux) {
          const id = element.user_id;

          User.findOne({ where: { id } }).then((result) => {
            userAux = result;
            const id = element.propiedad_id;
            Propiedades.findOne({ where: { id } }).then((result) => {
              propiedadesAux = result;
              let citaAux = {
                id: element.id,
                fecha: element.fecha,
                direccion: propiedadesAux.direccion,
                localidad: propiedadesAux.localidad,
                email: userAux.email,
                nombre: userAux.name,
                apellido: userAux.lastName,
                contacto: userAux.contact,
                image: propiedadesAux.image,
              };
              nuevoArray.push(citaAux);
            });
          });
        }
        return res.send(nuevoArray);
      });
      //then((citas) => {
        return res.send(citas);
      });
    } else {
      //const message = "usuario ya esta registrado con ese mail";
      return res.status(401).json(message);
    }
  });
});
*/
router.delete("/favoritos", validateUser, (req, res) => {
  const email = req.user.email;
  const { propiedad_id } = req.body;
  const message = "no se encontro su perfil";
  User.findOne({ where: { email } })
    .then((result) => {
      if (result) {
        //console.log("******************************", result);
        const id = result.id;

        const payload = {
          user_id: id,
          propiedad_id: propiedad_id,
        };
        Favorito.destroy({ where: { payload } })
          .then((data) => {
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
router.post("/favoritos", validateUser, (req, res) => {
  const email = req.user.email;
  console.log("----------------------", email);
  const message = "no se encontro su perfil";
  const { propiedad_id } = req.body;
  console.log("***********************************", req.body);
  User.findOne({ where: { email } })
    .then((result) => {
      if (result) {
        //console.log("******************************", result);
        const id = result.id;

        const payload = {
          user_id: id,
          propiedad_id: propiedad_id,
        };
        Favorito.create(payload)
          .then((data) => {
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
router.get("/favoritos", validateUser, (req, res) => {
  const email = req.user.email;
  const message = "Hubo un error, no se puedo encontrar el usuario";
  let payload = [];
  User.findOne({ where: { email } })
    .then((result) => {
      const user_id = result.id;
      Favorito.findAll({ where: { user_id } }).then((data) => {
        for (let element in data) {
          const id = element.propiedad_id;
          Propiedades.findOne({ where: { id } }).then((propiedad) => {
            payload.push(propiedad);
          });
        }
        return res.send(payload);
      });
    })
    .catch((error) => {
      return res.status(500).send(error);
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
/*
router.get("/citas/all", validateUser, (req, res) => {
  const email = req.user.email;
  const message = "no es usuario autorizado";
  let citasAux = [];
  let userAux = {};
  let propiedadesAux = {};
  let nuevoArray = [];
  let flag = "";
  User.findOne({ where: { email } })
    .then((user) => {
      if (user.rol == "ADMIN") {
        Cita.findAll().then((citas) => {
          citasAux = citas;
           for (let element in citasAux) {
            const id = element.user_id;
            console.log("111111111111111111111111111111111");
            console.log(element);
            User.findOne({ where: { id } }).then((result) => {
              userAux = result;
              const id = element.propiedad_id;
              console.log("2222222222222222222222222222222222");
              Propiedades.findOne({ where: { id } }).then((result) => {
                console.log("3333333333333333333333333333333333");
                propiedadesAux = result;
                let citaAux = {
                  id: element.id,
                  fecha: element.fecha,
                  direccion: propiedadesAux.direccion,
                  localidad: propiedadesAux.localidad,
                  email: userAux.email,
                  nombre: userAux.name,
                  apellido: userAux.lastName,
                  contacto: userAux.contact,
                  image: propiedadesAux.image,
                };
                nuevoArray.push(citaAux);
              });
            });
          }
          console.log(flag);
          return res.send(nuevoArray);
        });
      } else {
        return res.status(401).send(message);
      }
    })
    .catch((error) => {
      return res.status(500).send(error);
    });
});
*/
router.get("/citas/all", validateUser, async (req, res) => {
  try {
    const email = req.user.email;
    const message = "no es usuario autorizado";
    let citasAux = [];
    let userAux = {};
    let propiedadesAux = {};
    let nuevoArray = [];
    let flag = "";

    const user = await User.findOne({ where: { email } });

    if (user.rol !== "ADMIN") {
      return res.status(401).send(message);
    }

    const citas = await Cita.findAll();

    for (let element of citas) {
      const userId = element.user_id;
      console.log("111111111111111111111111111111111");
      console.log(element);

      const userResult = await User.findOne({ where: { id: userId } });
      userAux = userResult;

      const propiedadId = element.propiedad_id;
      console.log("2222222222222222222222222222222222");

      const propiedadesResult = await Propiedades.findOne({
        where: { id: propiedadId },
      });
      console.log("3333333333333333333333333333333333");
      propiedadesAux = propiedadesResult;

      let citaAux = {
        id: element.id,
        fecha: element.fecha,
        direccion: propiedadesAux.direccion,
        localidad: propiedadesAux.localidad,
        email: userAux.email,
        nombre: userAux.name,
        apellido: userAux.lastName,
        contacto: userAux.contact,
        image: propiedadesAux.image,
      };
      nuevoArray.push(citaAux);
    }

    console.log(flag);
    return res.send(nuevoArray);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
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
    if (typeof vender === "boolean") {
      filter.vender = vender;
    }
    if (typeof alquilar === "boolean") {
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

router.delete("propiedades/delete", validateUser, (req, res) => {
  const id = req.params.id;
  const email = req.user.email;
  const message = "no es usuario autorizado";
  User.findOne({ where: { email } })
    .then((user) => {
      if (user.rol == "ADMIN") {
        Propiedades.destroy({ where: { id } }).then((data) => {
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
router.put("/users/cambiar", validateUser, (req, res) => {
  const mail = req.user.email;
  const { id, email, password, name, lastName, contact } = req.body;
  if (mail != email) {
    res.status(403).send("el usuario no le pertenece !!");
  } else {
    let payload = {};
    if (email) {
      payload.email = email;
    }
    if (name) {
      payload.name = name;
    }
    if (lastName) {
      payload.lastName = lastName;
    }
    if (contact) {
      payload.contact = contact;
    }
    if (password) {
      payload.password = password;
    }
    User.update({ payload }, { where: { id } })
      .then((result) => {
        return res.status(201).send(result);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
    // User.findOne({ where: { email } })
    //  .then((user) => {});
  }
});

router.put("/propiedades/cambiar/", validateUser, (req, res) => {
  //const email = req.user.email;
  const rol = req.user.rol;
  if (rol == "ADMIN") {
    const {
      id,
      nombre,
      alquilar,
      vender,
      categoria,
      ambientes,
      baños,
      metraje,
      dormitorios,
      direccion,
      localidad,
      precio,
      Image,
      description,
    } = req.body;
    let payload = {};
    if (nombre) {
      payload.nombre = nombre;
    }
    if (typeof alquilar === "boolean") {
      payload.alquilar = alquilar;
    }
    if (typeof vender === "boolean") {
      payload.vender = vender;
    }
    if (categoria) {
      payload.categoria = categoria;
    }
    if (ambientes) {
      payload.ambientes = ambientes;
    }
    if (baños) {
      payload.baños = baños;
    }
    if (metraje) {
      payload.metraje = metraje;
    }
    if (dormitorios) {
      payload.dormitorios = dormitorios;
    }
    if (direccion) {
      payload.direccion = direccion;
    }
    if (localidad) {
      payload.localidad = localidad;
    }
    if (precio) {
      payload.precio = precio;
    }
    if (Image) {
      payload.Image = Image;
    }
    if (description) {
      payload.description = description;
    }

    Propiedades.update({ payload }, { where: { id } })
      .then((result) => {
        return res.status(201).send(result);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  } else {
    return res.status(401).json(message);
  }

  // User.findOne({ where: { email } })
  //  .then((user) => {});
});
//router.router.put("/propiedades/cambiar/:userId", (req, res) => {});
/** 
 * Propiedades.init(
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alquilar: {
      type: DataTypes.BOOLEAN,
    },
    vender: {
      type: DataTypes.BOOLEAN,
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ambientes: {
      type: DataTypes.INTEGER,
    },
    baños: {
      type: DataTypes.INTEGER,
    },
    metraje: {
      type: DataTypes.INTEGER,
    },
    dormitorios: {
      type: DataTypes.INTEGER,
    },
    disponibilidad: {
      type: DataTypes.BOOLEAN,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localidad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localizacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DOUBLE,
    },
    Image: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
 * 
 * ===============================================================
email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: false,
**/
module.exports = router;
