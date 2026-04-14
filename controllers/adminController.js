import User from "../models/User.js";
import Tutor from "../models/Tutor.js"; 

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndDelete(userId);
    await Tutor.findOneAndDelete({ userId });

    res.json({ message: "User deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    await Tutor.findOneAndUpdate(
      { userId: user._id },
      { isActive: user.isActive }
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (role !== "tutor") {
      await Tutor.findOneAndDelete({ userId });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};