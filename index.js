var questions = {
    "test1": {
        "answer": "If you are on a joined domain windows PC press control alt delete and choose change password." + "If you are on a joined domain mac OC, go to system users and preference group and choose change password." + "If you are not on any joined domain machine, go to mytoken.trendmicro.com. Once you are logged in, click change domain password on upper right-corner."
    },
    "does zoom work internationally": {
        "answer": "Yes, zoom works globally."
    },
    "how do i remove my browser cache credentials": {
        "answer": "Open Chrome. In the browser bar, enter: chrome://settings/clearBrowserData." + "Select the following: Browsing history, Download history, Cookies and other site and plug-in data, Cached images and files, Passwords, Auto-fill form data, Hosted app data." + "Finally, click clear browsing data." 
    }
}

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if(intentName = "TrendMicroITHelpDesk"){
        handleQuestionResponse(intent, session, callback)
    } else if(intentName = "AMAZON.HelpIntent") {
        handleGetHelpRequest(intent, session, callback)
    } else if(intentName = "AMAZON.StopIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else if(intentName = "AMAZON.CancelIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else{
        throw "Invalid Intent"
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Welcome to Trend Micro IT Helpdesk. What can I help you with?"

    var reprompt = "What can I help you with?"

    var header = "Trend Micro IT Helpdesk"

    var shouldEndSession = false

    var sessionAttributes = {
        "SpeechOutput" : speechOutput,
        "repromptText" : reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}

function handleQuestionResponse(intent, session, callback) {
    var question = intent.slots.Question.value.toLowerCase()
    if(!questions[question]){
        var speechOutPut = "I don't know how to answer that question right now"
        var repromptText = "I don't know how to answer that quesiton right now"
        var header = "I don't know"
    }
    else{
        var answer = questions[question].answer
        var speechOutput = capitalizeFirst(question) + " " + answer + ". Do you want to ask another question?"
        var repromptText = "Do you want to ask another question?"
        var header = capitalizeFirst(question)
    }

    var shouldEndSession = false

    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};

    }

    var speechOutput = "Ask me about any issues you have"

    var repromptText = speechOutput

    var shouldEndSession = false

    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}