import cron from 'node-cron';
import User from '../models/User.js';
import Class from '../models/Class.js';
import webPush from 'web-push';

// Tarea programada para ejecutarse todos los días a las 7:00 AM
cron.schedule('0 7 * * *', async () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    try {
        const users = await User.find({ subscription: { $exists: true } });

        for (const user of users) {
            const classes = await Class.find({ user: user._id, dayOfWeek: today });

            if (classes.length > 0) {
                const notificationPayload = {
                    title: 'Tus clases de hoy',
                    body: `Hoy tienes ${classes.length} clase(s). ¡No te las pierdas!`,
                    icon: '/assets/images/logo.png'
                };

                try {
                    await webPush.sendNotification(user.subscription, JSON.stringify(notificationPayload));
                } catch (error) {
                    console.error('Error sending push notification:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching users or classes for notifications:', error);
    }
});