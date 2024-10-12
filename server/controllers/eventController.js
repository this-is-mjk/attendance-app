const {
  getUserAttendanceById,
  getLocation,
} = require("../Queries/userQueries");

const EventQueries = require("../Queries/eventQueries");

const createEvent = async (req, res) => {
  try {
    const { title, description, date, locationName, xCoordinate, yCoordinate } =
      req.body;
    const createUserId = req.userId;
    const location = {
      locationName,
      xCoordinate,
      yCoordinate,
    };
    try {
      const event = await EventQueries.createEvent(
        title,
        description,
        date,
        location,
        createUserId
      );
      if (!event) {
        throw Error("Error Creating Event");
      }
      // if sub event
      try {
        const { parentEventId } = req.body;
        if (parentEventId) {
          const subEvent = await EventQueries.linkSubEvent(
            parentEventId,
            event.id
          );
          if (subEvent) {
            return res.json({
              message: "Sub Event Created Successfully",
              id: event.id,
            });
          } else {
            throw new Error("Error linking parent and SubEvent");
          }
        }
      } catch (error) {
        // if sub event creation fails, delete the temp event created
        await EventQueries.deleteEvent(event.id);
        return res.status(500).json({ message: error.message });
      }
      // if noraml event
      return res
        .status(200)
        .json({ message: "Event Created Successfully", id: event.id });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error Creating Event" });
    }
  } catch (error) {
    res.status(400).json({ message: "Bad Request" });
  }
};

const linkOfficersToEvent = async (req, res) => {
  try {
    const { eventId, userIds } = req.body;
    const event = await EventQueries.assignUsers(eventId, userIds);
    if (event) {
      res.status(200).json({ message: "Users Assigned Successfully" });
    } else {
      return res.status(500).json({ message: "Error Assigning Users" });
    }
  } catch (error) {
    res.status(400).json({ message: "Bad Request" });
  }
};


const getAllEvents = async (req, res) => {
  try {
    const events = await EventQueries.getEvents();
    if (events) {
      res.status(200).json({ events });
    } else {
      throw new Error("Error fetching Events");
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await EventQueries.deleteEvent(eventId);
    if (event) {
      res.status(200).json({ message: "Event Deleted Successfully" });
    } else {
      throw new Error("Error Deleting Event");
    }
  } catch (error) {
    res.status(500).json({ message: "Error Deleting Event", error });
  }
};

const getAllRecentEventAttendance = async (req, res) => {
  console.log("Get All Recent Event Attendance got hit!");
  try {
    const eventId = req.body.event_id;
    const event = await EventQueries.getEvent(eventId);
    if (event) {
      const usersID = event.event.assignedOfficers.map((officer) => officer.id);
      if (usersID) {
        const userLocations = [];
        await Promise.all(
          usersID.map(async (userID) => {
            const userAttendance = await getUserAttendanceById(userID);
            if (userAttendance) {
              // console.log("Running for user: ", userID, userAttendance[0]);
              if (userAttendance[0]) {
                const location = await getLocation(
                  userAttendance[0].locationId
                );
                userAttendance[0].location = location;
              }
              userLocations.push(userAttendance[0]);
            } else {
              throw new Error("Error fetching User");
            }
          })
        );
        res.status(200).json({ userLocations });
      }
    } else {
      throw new Error("Error fetching Event");
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ error: "Validation error", details: error.message });
    } else if (error.name === "CastError") {
      res.status(400).json({ error: "Invalid ID format" });
    } else if (error.code === 11000) {
      res.status(409).json({ error: "Duplicate key error" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
module.exports = {
  createEvent,
  // createSubEvent,
  getAllEvents,
  getAllRecentEventAttendance,
  deleteEvent,
  linkOfficersToEvent,
};
