const {
  authenticateToken,
  authenticateUserRole,
} = require("../middlewares/authenticate");

const {
  getEventDetails,
  createEventHandler,
  // createSubEvent,
  getAllEvents,
  deleteEvent,
  getAllRecentEventAttendance,
  linkOfficersToEvent,
} = require("../controllers/eventController");

const express = require("express");
const router = express.Router();

router.post(
  "/createEvent",
  authenticateToken,
  authenticateUserRole,
  createEventHandler
);
router.post(
  "/assignOfficers",
  authenticateToken,
  authenticateUserRole,
  linkOfficersToEvent
);
router.delete("/delete", authenticateToken, authenticateUserRole, deleteEvent);
router.get("/", authenticateToken, authenticateUserRole, getAllEvents);
router.get("/event/:eventId", authenticateToken, getEventDetails);
router.post(
  "/getEventRecentAttandance",
  authenticateToken,
  authenticateUserRole,
  getAllRecentEventAttendance
);

module.exports = router;
