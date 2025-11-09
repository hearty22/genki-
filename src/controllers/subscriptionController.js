import User from '../models/User.js';

export const subscribe = async (req, res) => {
    const subscription = req.body;
    try {
        await User.findByIdAndUpdate(req.user.id, { $set: { subscription: subscription } });
        res.status(201).json({ message: 'Subscription saved.' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ message: 'Failed to save subscription.' });
    }
};