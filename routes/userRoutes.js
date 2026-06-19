const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Secure all user/profile routes
router.use(verifyToken);

router.route('/all')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
