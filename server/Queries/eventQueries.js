const { getUser } = require("./userQueries");

const prisma = require("../db/prisma");

const createEvent = async (data, creatorId) => {
  try {
    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        locationName: data.locationName,
        xCoordinate: data.xCoordinate,
        yCoordinate: data.yCoordinate,
        creator: {
          connect: {
            employeeId: creatorId,
          },
        },
      },
    });
    return { event: newEvent };
  } catch (err) {
    return { error: err, event: null };
  }
};

const assignUsers = async (eventId, userIds) => {
  try {
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        assignedOfficers: {
          connect: userIds.map((id) => ({ employeeId: id })),
        },
      },
    });
    return updatedEvent;
  } catch (error) {
    return null;
  }
};
const linkSubEvent = async (parentEventId, subEventId) => {
  if (parentEventId === subEventId) {
    return null;
  }
  try {
    const subEvent = await prisma.event.update({
      where: { id: subEventId },
      data: {
        parentEvent: {
          connect: { id: parentEventId },
        },
      },
    });
    return subEvent;
  } catch (error) {
    return null;
  }
};
const getEvents = async () => {
  try {
    const events = await prisma.event.findMany({
      include: {
        title: true,
        description: true,
        date: true,
      },
    });
    return events;
  } catch (error) {
    return null;
  }
};
const getEvent = async (eventId) => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
    return event;
  } catch (error) {
    return null;
  }
};
const deleteEvent = async (eventId) => {
  try {
    await prisma.event.deleteMany({
      where: {
        parentEventId: eventId,
      },
    });
    const event = await getEvent(eventId);
    await prisma.location.delete({
      where: {
        id: event.locationId,
      },
    });
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });
    return { success: "Events deleted successfully" };
  } catch (error) {
    console.log(`Error Deleting Event: ${error}`);
    throw new Error("Error deleting Event, and related sub events, location");
  }
};

module.exports = {
  createEvent,
  assignUsers,
  linkSubEvent,
  getEvents,
  getEvent,
  deleteEvent,
};
