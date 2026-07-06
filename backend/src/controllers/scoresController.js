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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await scoreMgmt.getUserScores(req.user.id, page, limit);
        return res.status(200).json({ scores: result.scores, totalCount: result.totalCount });
    } catch (error) {
        return next(error);
    }
}

async function updateScoreTitle(req, res, next) {
    try {
        const scoreId = req.params.id;
        const title = req.body?.title;
        const score = await scoreMgmt.updateScoreTitle(scoreId, req.user.id, title);
        return res.status(200).json({ score });
    } catch (error) {
        return next(error);
    }
}

async function deleteScore(req, res, next) {
    try {
        await scoreMgmt.deleteScore(req.params.id, req.user.id);
        return res.sendStatus(204);
    } catch (error) {
        return next(error);
    }
}

async function deleteAllScores(req, res, next) {
    try {
        const deletedCount = await scoreMgmt.deleteAllScores(req.user.id);
        return res.status(200).json({ deletedCount });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    generateScore,
    regenerateScore,
    listScores,
    updateScoreTitle,
    deleteScore,
    deleteAllScores
};
