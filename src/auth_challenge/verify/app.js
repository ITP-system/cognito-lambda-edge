/**
 *
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.handler = (event, context, callback) => {
  console.log(event);

  if (
    event.request.privateChallengeParameters.answer ==
    event.request.challengeAnswer
  ) {
    console.log("answer OK");
    event.response.answerCorrect = true;
  } else {
    console.log("answer NG");
    event.response.answerCorrect = false;
  }

  callback(null, event);
};
