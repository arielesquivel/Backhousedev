const express = require("express");
const router = express.Router();
const User = require("../models/usersModels");
const jwt = require("jsonwebtoken");
const validateAuth = require("../middleware/auth");

const generateToken = (payload) => {
  const secretKey = "secret-key";
  const options = { expiresIn: "1h" };
  return jwt.sign(payload, secretKey, options);
};
router.post("/register", (req, res, next) => {
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
  router.options("/", validateAuth, (req, res) => {
    res.send(req.user);
  });

  router.post("/logout", (req, res) => {
    res.clearCookie("token").sendStatus(204);
  });
});

module.exports = router;
