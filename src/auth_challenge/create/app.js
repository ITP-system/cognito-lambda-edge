/**
 *
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.handler = (event, context, callback) => {
  console.log(event);

  if (event.request.challengeName == "CUSTOM_CHALLENGE") {
    event.response.publicChallengeParameters = {};
    event.response.publicChallengeParameters.challenge = "yama";
    event.response.privateChallengeParameters = {};
    event.response.privateChallengeParameters.answer = "kawa";
    event.response.challengeMetadata =
      "CHALLENGE_AND_RESPONSE" + event.request.session.length;
  }

  callback(null, event);
};
