const express = require('express');
const router = express.Router();

const { requestReport, requestStatus, csvData } = require('../controller/similarwebController');


router.post('/request-report',requestReport);

router.get('/request-status/:reportId',requestStatus);

router.post('/load-data',csvData );

module.exports = router;
