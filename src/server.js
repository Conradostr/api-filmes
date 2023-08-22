require("express-async-errors");

const migrationsRun = require("./database/sqlite/migrations");
const AppError = require("./utills/AppError");
const express = require("express")
const app = express();
const PORT = 3333;

const routes = require("./routes/index");

app.use(express.json());

app.use(routes);

migrationsRun();

app.use((error, request, response, next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: "error",
      message: error.message
    });
  }

  console.error(error);

  return response.status(500).json({
      status: "error",
      message: "internal server error",
  })
});


app.listen(PORT, () => console.log(`Server is runnin in ${PORT}`));