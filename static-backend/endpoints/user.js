const express = require('express');
const router = express.Router();
const user = require('../resources/mocked_user_details.json');

router.get('/profile/:id', (req,res) => {
    res.json(user);
});

module.exports = router;