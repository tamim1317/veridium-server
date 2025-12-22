const express = require('express');
const { registerHrManager, loginUser } = require('../controllers/authController'); // <-- Import loginUser

const router = express.Router();

router.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.send({ token });
});

// Route for HR Manager registration
router.post('/hr-register', registerHrManager);

// Route for User Login (HR and Employee)
router.post('/login', loginUser); // <-- New Login Route

module.exports = router;