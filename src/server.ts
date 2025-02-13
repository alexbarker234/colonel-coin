import express, { Request, Response } from "express";

const server = express();

server.all("/", (req: Request, res: Response) => {
    res.send("ayo");
});

function keepAlive() {
    server.listen(3000, () => {
        console.log("boop, server up");
    });
}

export = keepAlive;
