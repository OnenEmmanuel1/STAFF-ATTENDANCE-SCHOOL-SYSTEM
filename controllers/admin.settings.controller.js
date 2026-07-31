const Settings = require('../models/settings.model');

exports.getSettingsPage = (req, res) => {
    res.render('admin/settings');
};

exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.getAll();
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settingsData = req.body;

        for (const [key, value] of Object.entries(settingsData)) {
            await Settings.update(key, value);
        }

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
