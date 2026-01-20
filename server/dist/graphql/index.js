"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGraphQL = configureGraphQL;
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const client_1 = require("@prisma/client");
const schema_1 = require("./v1/schema");
const prisma = new client_1.PrismaClient();
async function configureGraphQL(app) {
    const apolloServer = new server_1.ApolloServer({
        schema: schema_1.combinedSchemas,
    });
    await apolloServer.start();
    app.use("/api/v1/graphql", (0, cors_1.default)({
        origin: process.env.NODE_ENV === "production"
            ? ["https://ecommerce-nu-rosy.vercel.app"]
            : ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Apollo-Require-Preflight",
        ],
    }), body_parser_1.default.json(), (0, express4_1.expressMiddleware)(apolloServer, {
        context: async ({ req, res }) => ({
            req,
            res,
            prisma,
            user: req.user,
        }),
    }));
}
