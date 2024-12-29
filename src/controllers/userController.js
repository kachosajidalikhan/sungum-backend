const UserModel = require('../models/userModel');

exports.getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const result = await UserModel.create(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
