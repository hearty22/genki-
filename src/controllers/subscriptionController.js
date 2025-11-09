import User from '../models/User.js';

export const subscribe = async (req, res) => {
    const { subscription } = req.body;
    const userId = req.user.id; // Corrected: Get userId from req.user

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if subscription object already exists and is the same
        if (user.subscription && user.subscription.endpoint === subscription.endpoint) {
            return res.status(200).json({ message: 'Subscription already exists' });
        }

        user.subscription = subscription;
        await user.save();

        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ message: 'Failed to subscribe' });
    }
};

export const getVapidPublicKey = (req, res) => {
    res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};