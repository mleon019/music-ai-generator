const scoreMgmt = require("../services/scoreMgmt");

async function generateScore(req, res, next) {
    try {
        const promptConfig = req.validatedConfig;
        const user = req.user;

        const result = await scoreMgmt.generateScore(promptConfig, user);

        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
}

async function regenerateScore(req, res, next) {
    try {
        const promptConfig = req.validatedConfig;
        const scoreId = req.body?.id;
        const user = req.user;

        const result = await scoreMgmt.regenerateScore(promptConfig, scoreId, user);

        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
}

async function listScores(req, res, next) {
    try {
        const scores = await scoreMgmt.getUserScores(req.user.id);
        return res.status(200).json({ scores });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    generateScore,
    regenerateScore,
    listScores
};
