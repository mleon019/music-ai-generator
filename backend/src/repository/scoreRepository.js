const pool = require("../db/pool");

async function createScore(userId, title, config, musicxml) {
    const result = await pool.query(
        `INSERT INTO scores (user_id, title, config, musicxml, created_at)
         VALUES ($1, $2, $3, $4, now())
         RETURNING id`,
        [userId, title, JSON.stringify(config), musicxml]
    );

    return result.rows[0];
}

async function findByIdAndUser(scoreId, userId) {
    const result = await pool.query(
        "SELECT * FROM scores WHERE id = $1 AND user_id = $2",
        [scoreId, userId]
    );

    return result.rows[0] || null;
}

async function updateScore(scoreId, userId, musicxml, config) {
    const result = await pool.query(
        `UPDATE scores
         SET musicxml = $1,
             config = $2,
             created_at = now()
         WHERE id = $3
         AND user_id = $4
         RETURNING id`,
        [musicxml, JSON.stringify(config), scoreId, userId]
    );

    return result.rows[0];
}

async function findAllByUser(userId, limit = null, offset = null) {
    let query = `SELECT id, title, config, musicxml, created_at
                 FROM scores
                 WHERE user_id = $1
                 ORDER BY created_at DESC`;
    const params = [userId];

    if (limit !== null) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(limit);
    }
    if (offset !== null) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
}

async function countByUser(userId) {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count FROM scores WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0].count;
}

async function updateTitle(scoreId, userId, title) {
    const result = await pool.query(
        `UPDATE scores
         SET title = $1
         WHERE id = $2
         AND user_id = $3
         RETURNING id, title, config, musicxml, created_at`,
        [title, scoreId, userId]
    );

    return result;
}

async function deleteById(scoreId, userId) {
    return pool.query(
        "DELETE FROM scores WHERE id = $1 AND user_id = $2 RETURNING id",
        [scoreId, userId]
    );
}

async function deleteAllByUser(userId) {
    return pool.query(
        "DELETE FROM scores WHERE user_id = $1",
        [userId]
    );
}

module.exports = {
    createScore,
    findByIdAndUser,
    updateScore,
    findAllByUser,
    countByUser,
    updateTitle,
    deleteById,
    deleteAllByUser
};