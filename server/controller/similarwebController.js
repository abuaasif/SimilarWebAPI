const axios = require('axios');
const { response } = require('express');
// Load environment variables from .env file
require('dotenv').config();
const csv = require('csv-parser');
const { Readable } = require('stream');


///================================= Request Report =====================================================///

const similarWebAPIUrl = 'https://api.similarweb.com/v3/batch/traffic_and_engagement/request-report';

const requestReport = (req, res) => {
  const apiKey = process.env.API_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'api-key': apiKey
  };

  axios.post(similarWebAPIUrl, req.body, { headers })
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(500).json({ error: error.response.data.errors });
      console.log(error);
    });
};



///================================= Request Status =====================================================///

const similarWebAPIStatusUrl = 'https://api.similarweb.com/v3/batch/request-status';

const requestStatus = async (req, res) => {
  if (!process.env.API_KEY) {
    console.error('API_KEY is not defined in the environment variables.');
    return res.status(500).json({ error: 'API_KEY is not defined in the environment variables.' });
  }

  try {
    const response = await axios.get(
      `${similarWebAPIStatusUrl}/${req.params.reportId}`,
      { headers: { 'api-key': process.env.API_KEY } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error making request:', error.message); // Log the error message
    console.error('Error stack:', error.stack); // Log the error stack for more details

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('Request data:', error.request);
      res.status(500).json({ error: 'No response received from the server.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ error: 'Error in setting up the request: ' + error.message });
    }
  }
}


///================================= Access URL Report =====================================================///
const csvData = async (req, res) => {
  const { url } = req.body;
  console.log(url)
  if (!url) {
    return res.status(400).json({ error: 'URL in request body is required' });
  }

  try {
    const response = await axios.get(url);
    console.log(response)
    const csvData = response.data;

    const readableStream = new Readable();
    readableStream.push(csvData);
    readableStream.push(null);

    const results = [];

    readableStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        res.json(results);
      })
      .on('error', (err) => {
        res.status(500).json({ error: err.message });
      });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

///================================= Download pdf =====================================================///


const downloadPDF = async (req, res) => {
  const { content } = req.body;

  if (!content) {
      return res.status(400).send('Content is required');
  }

  try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Set HTML content
      await page.setContent(content);

      // Generate PDF
      const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
      });

      await browser.close();

      // Send PDF as response
      res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=download.pdf',
          'Content-Length': pdfBuffer.length
      });

      res.send(pdfBuffer);
  } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Internal Server Error');
  }
};

module.exports = { requestReport, requestStatus, csvData };

