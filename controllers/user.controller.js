const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  if (!req.body.user_email) {
      res.status(400).send({
          message: "content can not be empty!"
      });
      return;
  }

  const user = {
      user_email: req.body.user_email,
      code: req.body.code
  };

  User.create(user).then(data => {
      res.send(data);
  }).catch(err => {
      res.status(500).send({
          message: err.message || "Some error occured while creating the User."
      });
  });
};

exports.findAll = (req, res) => {
  const user_email = req.query.user_email;
  let condition = user_email? {user_email: {[Op.like]: `%${user_email}%$`}} : null;

  User.findAll({where: condition}).then(data =>{
      res.send(data);
  }).catch(err => {
      res.status(500).send({
          message: err.message || "Some error occurred while retrieving users."
      });
  });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    User.findByPk(id).then(data =>{
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: "Error retrieving User with id =" + id
        });
    });
};

exports.update = (req, res) => {
    const id = req.params.id;

    User.update(req.body, {where: {id: id}}).then(num =>{
        if (num == 1) {
            res.send ({
               message: "User was updated successfully."
            });
        } else {
            res.send ({
                message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: "Error updating User with id =" + id
        });
    });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    User.destroy({where: {id: id}}).then(num =>{
        if (num == 1) {
            res.send ({
                message: "User was deleted successfully."
            });
        } else {
            res.send ({
                message: `Cannot delete User with id=${id}. Maybe User was not found!`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: "Could not delete User with id =" + id
        });
    });
};

exports.deleteAll = (req, res) => {
    User.destroy({where: {}, truncate: false}).then(nums =>{
        res.send ({
            message: `${nums} User was deleted successfully.`
        });

    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while removing all users."
        });
    });
};

exports.findAllByCode = (req, res) => {
    const code = req.params.code;

    User.findOne({ where: { code: code } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving users."
            });
        });
};


exports.findAllPublished = (req, res) => {
    User.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving users."
            });
        });
};
