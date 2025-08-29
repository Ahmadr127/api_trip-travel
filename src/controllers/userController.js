const User = require('../models/User');
const Boom = require('@hapi/boom');

// @desc    Get user profile
// @route   GET /users/profile
// @access  Private
exports.getProfile = async (request, h) => {
  try {
    const user = await User.findById(request.auth.credentials.id);
    
    if (!user) {
      return Boom.notFound('User tidak ditemukan');
    }

    return {
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// @desc    Update user profile
// @route   PUT /users/profile
// @access  Private
exports.updateProfile = async (request, h) => {
  try {
    const { name, photo, preferences } = request.payload;
    
    // Buat objek updateData dengan field yang akan diupdate
    const updateData = {};
    if (name) updateData.name = name;
    if (photo) updateData.photo = photo;
    if (preferences) updateData.preferences = preferences;
    
    // Temukan user dan update
    const user = await User.findByIdAndUpdate(
      request.auth.credentials.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return Boom.notFound('User tidak ditemukan');
    }

    return {
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};

// @desc    Delete user
// @route   DELETE /users/delete
// @access  Private
exports.deleteUser = async (request, h) => {
  try {
    const user = await User.findById(request.auth.credentials.id);
    
    if (!user) {
      return Boom.notFound('User tidak ditemukan');
    }
    
    await user.deleteOne();
    
    return {
      success: true,
      message: 'Akun berhasil dihapus'
    };
  } catch (error) {
    console.error(error);
    return Boom.badImplementation('Server Error');
  }
};
