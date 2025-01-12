const { PrismaClient } = require("@prisma/client");

// TODO: write error handling for the database downtime
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUser,
  getUser,
  getUserEvents,
  getUserAttendance,
  doUserExist,
} = require("../Queries/userQueries");
var currentdate = new Date();

// register user
const register = async (req, res) => {
  try {
    // check if already exist
    const userCheck = await doUserExist(req.body.employee_id);
    if (userCheck.error) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }
    if (userCheck.exists) {
      return res.status(400).json({ msg: "User already exists" });
    }
    // password hashing
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    // create user
    const newUser = await createUser(req.body);
    if (newUser.error) {
      res.status(500).json({ msg: "Error Creating User" });
    } else {
      return res
        .status(200)
        .json({ msg: "New User Created", id: newUser.user.employeeId });
    }
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// login user
const login = async (req, res) => {
  try {
    const { employee_id, password } = req.body;
    // See if user exists
    const userCheck = await getUser(employee_id);
    if (userCheck.error) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }
    if (!userCheck.exists) {
      return res.status(404).json({ msg: "No profile found" });
    }
    // Match password
    const isMatch = await bcrypt.compare(password, userCheck.user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Password" });
    }
    // payload
    const payload = {
      user: {
        // TODO: include the profile pic url field
        userId: employee_id,
        role: userCheck.user.role,
        name: userCheck.user.profile.name,
        position: userCheck.user.profile.position,
      },
    };
    // Options for JWT, including expiry time
    const options = {
      expiresIn: "7d", // Token expires in 7 days
    };
    // Sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    const literal = "Bearer ".concat(token);
    // send the token
    res.json({
      message: "User Log in successfull",
      token: literal,
    });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error", des: err.message });
  }
};

// TODO:
// mark attendance
const markAttendance = async (req, res) => {
  console.log("Mark User Attendance got hit!");
  var {
    id, // user id
    lat,
    log,
    locationName,
  } = req.body;

  try {
    if (!id || !lat || !log || !locationName) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_PARAMETERS",
          message:
            "Please provide all the required details: id, lat, log, and locationName",
        },
      });
    }
    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(log))) {
      return res.status(400).json({ msg: "Invalid Coordinates" });
    }
    const location = await prisma.location.create({
      data: {
        locationName: locationName,
        xCoordinate: parseFloat(lat),
        yCoordinate: parseFloat(log),
      },
    });

    if (!location) {
      return res.status(500).json({ msg: "Error in creating location" });
    }
    const attendance = await prisma.attendance.create({
      data: {
        time: currentdate,
        locationId: location.id,
        userId: id,
      },
    });
    if (!attendance) {
      return res.status(500).json({ msg: "Error in marking attendance" });
    }
    res.status(200).send("Marked Attendance!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
// TODO: handle the case of the admin if he uses this route
// returns all events of the user,

const userEvents = async (req, res) => {
  console.log("UserEvents got hit!");
  try {
    const employeeId = req.userId;
    if (req.role === "ADMIN") {
      return res.status(200).json({ msg: "working to give all events" });
    }
    // if not admin
    const { error, events } = await getUserEvents(employeeId);
    if (error) {
      return res.status(error.code).json({ msg: error.msg });
    }
    res.status(200).json({ events });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: "Bad Request" });
  }
};

// // returns attendance history  of the user
// const getAttendance = async (req, res) => {
//   console.log("Get Attendance got hit!");
//   try {
//     const { employeeId } = req.body;
//     const user = await getUserAttendance(employeeId);
//     if (user === null) {
//       return res.status(404).json({ msg: "No profile found" });
//     }
//     res.status(200).json({ Attendance: user.Attendance });
//   } catch {
//     console.error(err.message);
//     res.status(400).json({ msg: "Bad Request" });
//   }
// };

// User attendacne

module.exports = {
  register,
  login,
  markAttendance,
  userEvents,
  // getAttendance,
};
