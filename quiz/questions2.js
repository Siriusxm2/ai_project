const quiz = require('./quiztions.json');

let rndq = quiz.easy;

function returnQuestion(question) {
	let arr = Object.values(question);
	return arr[Math.floor(Math.random() * arr.length)];
}

let ran = returnQuestion(rndq);

module.exports.getRandomQuestion = () => {
	return ran;
};
