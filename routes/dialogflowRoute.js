const express = require('express');
const router = express.Router();
require('dotenv').config();
const dialogflow = require('dialogflow');
const { v4: uuid } = require('uuid');
const serviceAccount = require('./serviceAccount.json');
const { WebhookClient } = require('dialogflow-fulfillment');
const trivia = require('../quiz/questions2');
const { request, response } = require('express');

router.post('/chatbot', async (req, res) => {
	const sessionClient = new dialogflow.SessionsClient({
		credentials: serviceAccount,
	});

	const sessionPath = sessionClient.sessionPath(process.env.PROJECT_ID, uuid());

	console.log(req.body);

	const rq = {
		session: sessionPath,
		queryInput: {
			text: {
				text: req.body.text,
				languageCode: 'en',
			},
		},
	};

	const responses = await sessionClient.detectIntent(rq);
	const result = responses[0].queryResult;
	res.send(result);
	console.log(`	Query: ${result.queryText}`);
	console.log(`	Response: ${result.fulfillmentText}`);
	console.log(`	Intent: ${result.intent.displayName}`);
});

router.post('/webhook', async function (req, res) {
	const agent = new WebhookClient({ request: req, response: res });
	/*
	try {
		const responses = await sessionClient.detectIntent(rq);
		const result = responses[0].queryResult;
		//res.status(200).send(result);
		console.log(`	Query: ${result.queryText}`);
		console.log(`	Response: ${result.fulfillmentText}`);
		if (result.intent.displayName == 'Ask Question') {
			console.log(`	Intent: ${result.intent.displayName}`);
			askQuestion();
		}
	} catch (err) {
		console.log(err);
		res.status(422).send({ err });
	}*/

	function getQuestion() {
		return trivia.getRandomQuestion();
	}

	function setQuestionContext(question) {
		const oldContext = agent.context.get('quiz_data');
		const questionsCorrect = oldContext
			? oldContext.parameters.questions_correct
			: 0;
		agent.context.set({
			name: 'quiz_data',
			lifespanCount: 5,
			parameters: {
				question: question ? question.question : null,
				correctAnswer: question ? question.correctAnswer : null,
				questions_correct: questionsCorrect,
			},
		});
	}

	function askQuestion() {
		const context = getQuestion();
		console.log(context);
		agent.add(context.question);
		return context;
	}

	function snooze(agent) {
		agent.add('snooze');
	}

	function nextQuestion(agent) {
		agent.add('nextQ');
	}

	function answerQuestion(agent) {
		agent.add('answerQ');
	}

	const intentMap = new Map();
	intentMap.set('Ask Question', askQuestion);
	intentMap.set('Snooze', snooze);
	intentMap.set('Next Question', nextQuestion);
	intentMap.set('Answer Question', answerQuestion);
	agent.handleRequest(intentMap);
});

module.exports = router;
