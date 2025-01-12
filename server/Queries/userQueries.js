const prisma = require("../db/prisma");
const bcrypt = require("bcrypt");

const doUserExist = async (employeeId) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        employeeId: employeeId,
      },
    });
    return { exists: user ? true : false, user: user };
  } catch (err) {
    return { exists: null, error: err.message };
  }
};

const getUser = async (employee_Id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        employeeId: employee_Id,
      },
      include: {
        profile: true,
      },
    });
    return { exists: user ? true : false, user: user };
  } catch (error) {
    return { exists: null, error: err.message };
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
    return null;
  }
};

const createUser = async (data) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        employeeId: data.employee_id,
        password: data.password,
        role: data.role,
        profile: {
          create: {
            name: data.name,
            gender: data.gender,
            position: data.position,
          },
        },
      },
    });
    return { user: newUser };
  } catch (err) {
    return { user: null, error: err.message };
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
  doUserExist,
  createUser,
  getUsers,
  getUser,
  getUserEvents,
  // getUserAttendance,
  getUserAttendanceById,
  getLocation,
};
