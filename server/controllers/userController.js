const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all team members (admin and team members)
// @route   GET /api/users/team
// @access  Protected (Admin and Team Members)
const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      teamMembers,
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching team members',
    });
  }
};

// @desc    Add team member (admin only)
// @route   POST /api/users/team
// @access  Protected (Admin only)
const addTeamMember = async (req, res) => {
  try {
    const { name, email, phone, firstName, lastName, designation } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and email',
      });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Create team member with email as password
    const user = await User.create({
      name,
      email,
      password: email, // Default password is email
      role: 'team_member',
      phone: phone || '',
      firstName: firstName || '',
      lastName: lastName || '',
      designation: designation || '',
    });

    res.status(201).json({
      success: true,
      message: 'Team member added successfully. Default password is their email address.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        designation: user.designation,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding team member',
      error: error.message,
    });
  }
};

// @desc    Edit team member (admin can edit anyone, members can edit themselves)
// @route   PUT /api/users/team/:id
// @access  Protected (Admin and Team Members)
const editTeamMember = async (req, res) => {
  try {
    const { name, phone, firstName, lastName, designation } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check permissions: admin can edit anyone, members can only edit themselves
    const isAdmin = req.user.role === 'admin';
    const currentUserId = req.user.id.toString();
    const targetUserId = user._id.toString();
    const isEditingSelf = currentUserId === targetUserId;

    console.log('Edit permission check:', {
      isAdmin,
      currentUserId,
      targetUserId,
      isEditingSelf,
      userRole: req.user.role
    });

    if (!isAdmin && !isEditingSelf) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own profile',
      });
    }

    // Update allowed fields only
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (designation !== undefined) user.designation = designation;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        designation: user.designation,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Edit team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error editing team member',
    });
  }
};

// @desc    Delete team member (admin only)
// @route   DELETE /api/users/team/:id
// @access  Protected (Admin only)
const deleteTeamMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deletion of admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin account',
      });
    }

    // Prevent deletion of self
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting team member',
    });
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Protected
const updateProfile = async (req, res) => {
  try {
    const { name, phone, firstName, lastName, designation, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent email modification from Settings page
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Email cannot be modified from settings. Contact administrator if needed.',
      });
    }

    // Update allowed fields only
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (designation !== undefined) user.designation = designation;

    // Update name field based on firstName and lastName if they are provided
    if (firstName !== undefined || lastName !== undefined) {
      const updatedFirstName = firstName !== undefined ? firstName : user.firstName;
      const updatedLastName = lastName !== undefined ? lastName : user.lastName;
      user.name = `${updatedFirstName} ${updatedLastName}`.trim();
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        designation: user.designation,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Protected
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.',
      requiresLogout: true,
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
    });
  }
};

module.exports = {
  getTeamMembers,
  addTeamMember,
  editTeamMember,
  deleteTeamMember,
  updateProfile,
  changePassword,
};
