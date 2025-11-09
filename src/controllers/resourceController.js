import Resource from '../models/Resource.js';
import User from '../models/User.js';

// @desc    Get all resources for a user
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res) => {
    try {
        const resources = await Resource.find({ user: req.user.id });
        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private
export const uploadResource = async (req, res) => {
    const { name } = req.body;
    const { originalname, path, mimetype, size } = req.file;

    try {
        const newResource = new Resource({
            name,
            fileName: originalname,
            filePath: path,
            fileType: mimetype,
            fileSize: size,
            user: req.user.id
        });

        const resource = await newResource.save();
        res.status(201).json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};