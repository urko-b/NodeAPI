"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const server = require("./app");
dotenv.config();
mongoose.connect(process.env.DB, connectionError => {
    if (connectionError) {
        return console.error(`Error while connecting to database: ${connectionError} - ${process.env.DB}`);
    }
    const app = new server.App(process.env.PORT);
    app.init();
    app.Run();
});
//# sourceMappingURL=index.js.map