/**
 * User Controller
 * 
 * Controllers are responsible for handling incoming HTTP requests,
 * processing data (interacting with models/databases), and returning the appropriate HTTP response.
 * This keeps the routing files clean and focused solely on defining API endpoints.
 */

// Sample in-memory data store for demonstration
const mockUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Developer' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'Designer' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Product Manager' }
];

/**
 * Get all users
 * GET /api/users
 */
const getAllUsers = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: mockUsers.length,
      data: mockUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving users',
      error: error.message
    });
  }
};

/**
 * Get a single user by ID
 * GET /api/users/:id
 */
const getUserById = (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user',
      error: error.message
    });
  }
};

/**
 * Create a new user
 * POST /api/users
 */
const createUser = (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Simple validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and email'
      });
    }

    // Create a new user object
    const newUser = {
      id: mockUsers.length > 0 ? Math.max(...mockUsers.map(u => u.id)) + 1 : 1,
      name,
      email,
      role: role || 'User'
    };

    // Add to our mock database
    mockUsers.push(newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating user',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};
