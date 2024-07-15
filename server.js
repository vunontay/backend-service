const app = require("./src/app");

const PORT = process.env.DEV_APP_PORT || 3055;

app.listen(PORT, () => {
    console.log("Server listening on port:" + PORT);
});

// process.on("SIGINT", () => {
//     server.close(() => console.log(`Exist server Express`));
// });
