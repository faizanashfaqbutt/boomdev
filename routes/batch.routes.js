module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const bulk = require("../controllers/bulk.controller.js");

    let router = require("express").Router();

    router.post("/user/", users.create);
    router.get("/user/", users.findAll);
    router.get("/user/:id", users.findOne);
    router.get("/user/code/:code", users.findAllByCode);
    router.put("/user/:id", users.update);
    router.delete("/user/:id", users.delete);
    router.delete("/user/", users.deleteAll);

    router.post("/bulk/", bulk.bulk_create);
    router.get("/bulk/", bulk.bulk_findAll);
    router.get("/bulk/:id", bulk.bulk_findOne);
    router.get("/bulk/code/:code", bulk.bulk_findAllByCode);
    router.put("/bulk/:id", bulk.bulk_update);
    router.delete("/bulk/:id", bulk.bulk_delete);
    router.delete("/bulk/", bulk.bulk_deleteAll);

    app.use('/api/', router);
    //app.use('/api/bulk', router);

};