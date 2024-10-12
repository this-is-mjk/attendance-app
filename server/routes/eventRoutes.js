const {
  authenticateToken,
  authenticateUserRole,
} = require("../middlewares/authenticate");

const {
  createEvent,
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
  createEvent
);
router.post(
  "/assignOfficers",
  authenticateToken,
  authenticateUserRole,
  linkOfficersToEvent
);
router.delete("/delete", authenticateToken, authenticateUserRole, deleteEvent);
router.get("/", authenticateToken, authenticateUserRole, getAllEvents);
router.post(
  "/getEventRecentAttandance",
  authenticateToken,
  authenticateUserRole,
  getAllRecentEventAttendance
);

module.exports = router;
