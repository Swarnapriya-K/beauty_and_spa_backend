const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  exportUsersExcel,
  exportUsersPdf,
  exportUsersCsv,
  exportUsersDelete
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.delete("/delete-users", exportUsersDelete);
router.get("/export-users-csv", exportUsersCsv);
router.get("/export-users-excel", exportUsersExcel);
router.get("/export-users-pdf", exportUsersPdf);

module.exports = router;
