const express = require("express");
const users = require("./MOCK_DATA.json");
const mongoose = require("mongoose");
const fs = require("fs");
const { emitWarning } = require("process");
const { type } = require("os");
const { error } = require("console");
const app = express();
const PORT = 3838;

app.use(express.urlencoded({ extended: false }));

//connection to the mongodb

mongoose
  .connect("mongodb://127.0.0.1:27017/userdb")
  .then(() => console.log("Mongodb Connected sucessfully"))
  .catch((err) =>
    console.log("Error in connecting the mongodb to the db ", err)
  );

//Create a new schema

const Userschema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  job_title: {
    type: String,
  },
  gender: {
    type: String,
  },
});

const User = mongoose.model("user", Userschema);

app.use((req, res, next) => {
  console.log("Your are in the middleware func");
  fs.appendFile(
    "log.txt",
    `${Date.now()} : ${req.method} ${req.path}`,
    (err, data) => {
      next();
    }
  );
});

//routes
//listing the user with the html file
app.get("/users", async (req, res) => {
  const alldbuser = await User.find({});
  const html = `
    <ul>
    ${alldbuser.map((user) => `<li> ${user.firstName}</li>`).join("")}
    </ul>
    `;
  return res.send(html);
});

//listing all the user with the json data
app.get("/api/users", (req, res) => {
  res.json(users);
});

//listing all the users with the id specified in the path
app.get("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  const user = users.find((user) => user.id === id);
  if (user == undefined) {
    return res
      .status(404)
      .json({ status: "Error", message: "User not Found !" });
  }
  return res.json(user);
});

//for creating a new user we are creating this route

app.post("/api/users", async (req, res) => {
  //TODO:  Creating a new user status is pending
  const bodyData = req.body;

  /* ********************* This code is for pushing the user in the file ********************  */

    users.push({ ...bodyData, id: users.length });
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
      res.json({ status: "Success", id: users.length + 1 });
    });

  /* **************************** This code is used for pushing in to the db ************************  */
  const result = await User.create({
    firstName: bodyData.first_name,
    lastName: bodyData.last_name,
    email: bodyData.email,
    gender: bodyData.gender,
    job_title: bodyData.job_title,
  });

  console.log(result);

  return res.status(201).json({ msg: "Success" });
});

//for editing user with the specified id

app.patch("/api/users/:id", (req, res) => {
  //TODO: editing a user status is pending

  const id = req.params.id;
  const updates = req.body;

  fs.readFile("./MOCK_DATA.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({
        status: "Error",
        message: "Failed to read the data from the file ",
      });
    }
    let usersdata;
    try {
      usersdata = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({
        status: "Error",
        message: "Failed to parse the data from the file ",
      });
    }

    const userIndex = users.findIndex((user) => user.id == id);

    console.log(userIndex);

    if (userIndex === -1) {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found." });
    }

    users[userIndex] = { ...users[userIndex], ...updates };

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          message: "Failed to write the users data ",
        });
      }
      return res.json({ status: "Success", id });
    });
  });
});

//for deleting user with the specified id

app.delete("/api/users/:id", (req, res) => {
  //TODO: delete a user status is pending
  console.log(req);
  const id = req.params.id;
  console.log(id);
  fs.readFile("./MOCK_DATA.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({
        status: "Error",
        message: "Failed to read the data from the file ",
      });
    }
    let usersdata;
    try {
      usersdata = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({
        status: "Error",
        message: "Failed to parse the data from the file ",
      });
    }

    const userIndex = users.findIndex((user) => user.id == id);
    if (userIndex === -1) {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found." });
    }
    users.splice(userIndex, 1);

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          message: "Failed to write the users data ",
        });
      }
      res.json({ status: "Success", id });
    });
  });
});

//Combining all the routes in this

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    return res.json(user);
  })
  .patch((req, res) => {
    //TODO: editing a user  is pending
    res.json({ status: "Status Pending " });
  })
  .delete((req, res) => {
    //TODO: deleting a user is pending
    res.json({ status: "Status Pending " });
  });

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
