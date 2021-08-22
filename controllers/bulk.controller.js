const db = require("../models");
const Bulk = db.bulks;
const Op = db.Sequelize.Op;

exports.bulk_create = (req, res) => {
  if (!req.body.user_email) {
      res.status(400).send({
          message: "content can not be empty!"
      });
      return;
  }

  const bulk = {
      user_email: req.body.user_email,
      code: req.body.code,
      address: req.body.address,
      sendto: req.body.sendto,
      cc: req.body.cc,
      name: req.body.name,
      phone: req.body.phone
  };

  Bulk.create(bulk).then(data => {
      res.send(data);
  }).catch(err => {
      res.status(500).send({
          message: err.message || "Some error occured while creating the Bulk."
      });
  });
};

exports.bulk_findAll = (req, res) => {
  const user_email = req.query.user_email;
  let condition = user_email? {user_email: {[Op.like]: `%${user_email}%$`}} : null;

  Bulk.findAll({where: condition}).then(data =>{
      res.send(data);
  }).catch(err => {
      res.status(500).send({
          message: err.message || "Some error occurred while retrieving bulk emails."
      });
  });
};

exports.bulk_findOne = (req, res) => {
    const id = req.params.id;

    Bulk.findByPk(id).then(data =>{
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: "Error retrieving Bulk email with id =" + id
        });
    });
};

exports.bulk_update = (req, res) => {
    const id = req.params.id;

    Bulk.update(req.body, {where: {id: id}}).then(num =>{
        if (num == 1) {
            res.send ({
               message: "Bulk was updated successfully."
            });
        } else {
            res.send ({
                message: `Cannot update Bulk with id=${id}. Maybe Bulk was not found or req.body is empty`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: "Error updating Bulk with id =" + id
        });
    });
};

exports.bulk_delete = (req, res) => {
    const id = req.params.id;

    Bulk.destroy({where: {id: id}}).then(num =>{
        if (num == 1) {
            res.send ({
                message: "Bulk was deleted successfully."
            });
        } else {
            res.send ({
                message: `Cannot delete Bulk with id=${id}. Maybe Bulk was not found!`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: "Could not delete Bulk with id =" + id
        });
    });
};

exports.bulk_deleteAll = (req, res) => {
    Bulk.destroy({where: {}, truncate: false}).then(nums =>{
        res.send ({
            message: `${nums} Bulk was deleted successfully.`
        });

    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while removing all bulk emails."
        });
    });
};

exports.bulk_findAllByCode = (req, res) => {
    const code = req.params.code;

    Bulk.findAll({ where: { code: code } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving bulk emails."
            });
        });
};