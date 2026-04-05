const User = require('../models/User');
const { analyzeSkin } = require('../utils/aiService');

// @desc    Analyze Face and Update Profile
// @route   POST /api/ai/analyze
// @access  Private
const analyzeFace = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const imageUrl = req.file.path;

        // 1. Call AI Service (Mock)
        const analysis = await analyzeSkin(imageUrl);

        // 2. Update User Profile
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.faceAnalysisImage = imageUrl;
        user.preferences = {
            ...user.preferences,
            skinType: analysis.skinType,
            shade: analysis.shade,
            undertone: analysis.undertone,
            concerns: [...new Set([...user.preferences.concerns, ...analysis.concerns])] // Merge concerns
        };

        await user.save();

        res.json({
            success: true,
            analysis,
            message: 'Face analysis complete. Profile updated.'
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    analyzeFace
};
