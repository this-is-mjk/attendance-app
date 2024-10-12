const prisma = require("../db/prisma");
const bcrypt = require("bcrypt");

const createUser = async (req, callback) => {
  try {
    const existingUser = await getUser(req.body.employee_id);
    if (existingUser) {
      return callback({ error: "User already exists", code: 403 }, null);
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    const user = await prisma.user.create({
      data: {
        employeeId: req.body.employee_id,
        role: req.body.role,
        profile: {
          create: {
            employeeId: req.body.employee_id,
            name: req.body.name,
            gender: req.body.gender,
            position: req.body.position,
            password: password,
          },
        },
      },
      include: {
        profile: {
          select: {
            name: true,
            position: true,
            gender: true,
          },
        },
      },
    });
    callback(null, user); // Successful creation
  } catch (error) {
    callback({ error: "Bad Request", code: 400 }, null); // Error handling
  }
};

const getUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    return users;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUser = async (employee_Id) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        employeeId: employee_Id,
      },
      include: {
        profile: true,
        events: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

const getUserAttendance = async (employeeId) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        profile: {
          employeeId,
        },
      },
      include: {
        Attendance: true,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserEvents = async (employeeId) => {
  try {
    const user = await getUser(employeeId);
    if (user === null) {
      return { error: { msg: "No profile found", code: 404 }, events: null };
    }
    // get all the events, the user is assigned
    const events = await prisma.event.findMany({
      where: {
        id: {
          in: user.events.map((event) => event.id),
        },
      },
      include: {
        location: {
          select: {
            locationName: true,
          },
        },
        subEvents: {
          select: {
            id: true,
          },
        },
        assignedOfficers: {
          select: {
            employeeId: true,
          },
        },
      },
    });
    // // convert the events to frontend requied format
    // events.forEach((event) => {
    return { error: null, events };
  } catch (err) {
    console.error(err.message);
    return { error: { error: "Server Error", code: 500 }, events: null };
  }
};

const getUserAttendanceById = async (id) => {
  try {
    const attendance = await prisma.attendance.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        id: "desc",
      },
    });
    return attendance;
  } catch (error) {
    // console.log(error);
    return null;
  }
};

const getLocation = async (locationId) => {
  try {
    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });
    return location;
  } catch (error) {
    // console.log(error);
    return null;
  }
};
module.exports = {
  createUser,
  getUsers,
  getUser,
  getUserEvents,
  getUserAttendance,
  getUserAttendanceById,
  getLocation,
};
