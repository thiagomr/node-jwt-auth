"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var routing_controllers_1 = require("routing-controllers");
var typedi_1 = require("typedi");
var logger_1 = require("../utils/logger");
var Server = /** @class */ (function () {
    function Server() {
        routing_controllers_1.useContainer(typedi_1.Container);
        this.app = routing_controllers_1.createExpressServer({ controllers: [process.env.PWD + "/**/*controller.js"] });
        this.port = 8000;
    }
    Server.prototype.listen = function () {
        var _this = this;
        this.app.listen(this.port, function () { return logger_1.logger.info("server listen at " + _this.port); });
    };
    return Server;
}());
exports.Server = Server;
