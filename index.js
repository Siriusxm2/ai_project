const express = require('express');
const app = express();
//const cors = require('cors');
const Routes = require('./routes/dialogflowRoute');
require('dotenv').config();

app.use(express.json());
app.get('/', (req, res) => {
	res.status(200).send('Server is working.');
});

app.use('/api/dialogflow', Routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
