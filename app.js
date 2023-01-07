const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/todos/", async (request, response) => {
  const { search_q = "", status = "", priority = "" } = request.query;
  let statusF = "";
  if (status == "TO%20DO") {
    statusF = "TO DO";
  } else if (status == "IN%20PROGRESS") {
    statusF = "IN PROGRESS";
  } else if (status == "DONE") {
    statusF = "DONE";
  }
  const getTodosQuery = `SELECT
      *
    FROM
      todo
    WHERE
     todo LIKE '%${search_q}%' AND status LIKE '%${statusF}%'AND priority LIKE '%${priority}%'`;
  const todoArray = await db.all(getTodosQuery);
  response.send(todoArray);
});

//Get Todo API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//Post Todo API-3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `INSERT INTO
      todo (id,todo,priority,status)
    VALUES
      (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
      );`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//Update Todo Status API-4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo = "", status = "", priority = "" } = request.body;
  let updateTodoQuery = "";
  let output = "";
  if (status != "") {
    updateTodoQuery = `UPDATE
      todo
    SET
      status='${status}'
    WHERE
      id = ${todoId};`;
    output = "Status Updated";
  } else if (priority != "") {
    updateTodoQuery = `UPDATE
      todo
    SET
      priority='${priority}'
    WHERE
      id = ${todoId};`;
    output = "Priority Updated";
  } else if (todo != "") {
    updateTodoQuery = `UPDATE
      todo
    SET
      todo='${todo}'
    WHERE
      id = ${todoId};`;
    output = "Todo Updated";
  }
  await db.run(updateTodoQuery);
  response.send(output);
});

//Delete Book API-5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
