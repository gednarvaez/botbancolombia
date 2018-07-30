/**
 * This file contains all of the web and hybrid functions for interacting with 
 * the basic chat bot dialog pane. 
 *
 * @summary   Functions for Chat Bot.
 *
 * @since     0.0.1
 *
 */





"use strict";
var userMessageStorage = [];
var params = {
    input: '',
    context: '',
};
var watson = 'Bot';
var user = {
    name: "Usuario"
};
var noAnswer = 0;
var context;
/**
 * @summary Enter Keyboard Event.
 *
 * When a user presses enter in the chat input window it triggers the service interactions.
 *
 * @function newEvent
 * @param {Object} e - Information about the keyboard event. 
 */




function getTime() {
    var time = new Date();
    var h = time.getHours();
    var m = time.getMinutes();
    time = h + ":" + m
    return time;
}
var trueSendMessage = false;
var eventMethod = window.addEventListener
    ? "addEventListener"
    : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod === "attachEvent"
    ? "onmessage"
    : "message";


eventer(messageEvent, function (e) {
    var miData = e.data.split("#");
    if (miData[0] == "agenteConectado" || miData[0] == "agenteConectado") {
        document.getElementById("chatMessage").removeAttribute("onkeypress");
        document.getElementById("chatMessage").setAttribute("onkeypress", "return eventDisplay(event)");
        displayMessage("Hola, mi nombre es: " + miData[1] + ", es un gusto atenderte. Resolveremos tu consulta inmediatamente", "agente", miData[1]);
        userMessageStorage.forEach((e) => {
            window.parent.postMessage("sendStorageMessage#" + e, "*");
        })
    }
    else {
        if (miData[0] == "sendMessage" || miData[0] == "sendMessage")
            displayMessage(miData[1], "agente", miData[2]);
        if (miData[0] == "stoppedTyping" || e.message == "stoppedTyping") {
            document.querySelector("#chatBox > div:last-child > .bot").remove();
        }
        else if (miData[0] == "sessionExpires" || e.message == "sessionExpires") {
            var chat = document.getElementById('chatBox');
            var p = document.createElement("p");
            p.classList.add("systemMessage");
            var ptext = document.createTextNode(miData[1]);
            p.appendChild(ptext);
            chat.appendChild(p);
        }
    }
});
function newEvent(e) {
    if (e.which === 13 || e.keyCode === 13) {

        var userInput = document.getElementById('chatMessage');
        var text = userInput.value;
        text = text.replace(/(\r\n|\n|\r)/gm, "");

        if (text) {

            displayMessage(text, user);
            userInput.value = '';
            userMessageStorage.push("Tú dijiste: " + text);
            userMessage(text);

        } else {


            console.error("No message.");
            userInput.value = '';

            return false;
        }
    }
}


function eventDisplay(e) {
    if (e.which === 13 || e.keyCode === 13) {

        var userInput = document.getElementById('chatMessage');
        var text = userInput.value;
        text = text.replace(/(\r\n|\n|\r)/gm, "");

        if (text) {

            displayMessage(text, user);
            userInput.value = '';
            window.parent.postMessage("sendUserMessage#" + text, "*")

        } else {
            console.error("No message.");
            userInput.value = '';

            return false;
        }
    }
}

/**
 * @summary 
 *
 * 
 *
 * @function userMessage
 * @param {String} message - Input message from user or page load.  
 */


function userMessage(message) {
    params.input = {
        text: message
    };
    if (trueSendMessage == true) {
        window.parent.postMessage("sendUserMessage#" + message, "*")
        return
    }

    if (context) {
        params.context = context;
    }
    userMessageStorage.push("Tú dijiste: " + message);

    var xhr = new XMLHttpRequest();
    var uri = '/api/bot';
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText) {

            var response = JSON.parse(xhr.responseText);
            var text = response.output.text[0];
            displayMessage(text, watson);
            context = response.context; // Store the context for next round of questions


            if (text) {
                if (response.output.text[0].search(/Facebook/i) != -1) {
                    setTimeout(() => {
                        userMessage("Hola");
                    }, 2000)
                }
                userMessageStorage.push("Tabot dijo: " + text);
            }
            if (context.system.dialog_turn_counter > 10) {
                displayMessage("Enviaremos tu consulta a un asesor, por favor mantente en espera mientras se une a la sesión.", watson);
                window.parent.postMessage("myevent", "*")
                return false
            }
            else {
                for (var i = 0; i < response.context.controls.length; i++) {
                    if (!context.user) {
                        if (response.context.controls[i].type == "link") {
                            createLink(response.context.controls[i]);
                        }
                        else if (response.context.controls[i].type == "button") {
                            createButton(response.context.controls[i])

                        }
                        else if (response.context.controls[i].type == "menu") {
                            createButton(response.context.controls[i])
                        }
                        else if (response.context.controls[i].type == "text") {
                            displayMessage(response.context.controls[i].value, watson)
                        }


                    }
                    else if (context.user && context.user.termsAndConditions == true) {
                        if (response.context.controls[i].type == "link") {
                            if (response.context.controls[i].title != "Términos y Condiciones") {
                                createLink(response.context.controls[i]);
                            }
                        }
                        if (response.context.controls[i].type == "menu") {
                            createButton(response.context.controls[i])
                        }
                        else if (response.context.controls[i].type == "button") {
                            if (response.context.controls[i].title != "¿Aceptas los términos y condiciones?") {
                                createButton(response.context.controls[i])
                            }
                        }
                        else if (response.context.controls[i].type == "menu") {
                            createButton(response.context.controls[i])
                        }

                    }
                }
            }


        } else {
            console.error('Server error for Conversation. Return status of: ', xhr.statusText);
        }
    };

    xhr.onerror = function () {
        console.error('Network error trying to send message!');
    };

    xhr.send(JSON.stringify(params));
}

function CUSTOMER(name, lastname, ci, email) {
    this.name = name;
    this.lastname = lastname;
    this.ci = ci;
    this.email = email;

}

var currentuser = new CUSTOMER("Usuario", "Invitado", "", "");

/**
 * @summary Display Chat Bubble.
 *
 * Formats the chat bubble element based on if the message is from the user or from Bot.
 *
 * @function displayMessage
 * @param {String} text - Text to be dispalyed in chat box.
 * @param {String} user - Denotes if the message is from Bot or the user. 
 * @return null
 */
function displayMessage(text, user, agentename) {

    var chat = document.getElementById('chatBox');
    var bubble = document.createElement('div');
    bubble.className = 'message';
    if (text !== undefined && text != "" && text != null && text != "undefined") {
        if (user === watson && text != null) {
            bubble.innerHTML = "<div class='bot'><p class='cx-name' style='font-weight: bolder; color: #222; font-size:13px; padding-right: 5px;white-space: nowrap;'>Tabot</p>" + text + "<p cx-time style='text-align: right; color:#aaa'>" + getTime() + "</p></div>";
        }
        else if (user == "agente") {
            if (text != undefined || text != "") {
                bubble.innerHTML = "<div class='bot'><p class='cx-name' style='font-weight: bolder; color: #222; font-size:13px; padding-right: 5px;white-space: nowrap;'>" + agentename + "</p>" + text + "<p cx-time style='text-align: right; color:#aaa'>" + getTime() + "</p></div>";
            }
        }
        else if (user !== "agente" || user !== watson) {
            if (text != undefined || text != "undefined")
                bubble.innerHTML = "<div class='user'><p class='cx-name' style='font-weight: bolder;color: #222; font-size:13px; padding-right: 5px;white-space: nowrap;'>" + currentuser.name + " " + currentuser.lastname + "</p>" + text + "<p cx-time style='color:#aaa'>" + getTime() + "</p></div>";
        }
        chat.appendChild(bubble);
        chat.scrollTop = chat.scrollHeight;
        document.getElementById('chatMessage').focus();
        return null;

    }
}


function createLink(elem) {
    var chat = document.getElementById('chatBox');
    var div = document.createElement("div");
    div.classList.add("link-content-bot")
    var title1 = document.createElement("p");
    var subtitle2 = document.createElement("p");
    var textcontent = document.createTextNode(elem.title);
    var textSubcontent = document.createTextNode(elem.subtitle);
    title1.appendChild(textcontent);
    subtitle2.appendChild(textSubcontent)


    div.appendChild(title1);
    div.appendChild(subtitle2);
    if (elem.value) {
        for (var i = 0; i <= elem.value.lenght; i++) {
            var link = document.createElement("a");
            var linkText = document.createTextNode(elem[i].text);
            link.setAttribute("href", elem[i].url);
            div.appendChild(link);
        }
    } else {
        var link = document.createElement("a");
        var linkText = document.createTextNode(elem.text);
        link.appendChild(linkText)
        link.setAttribute("href", elem.url);
        link.setAttribute("target", "_blank")
        div.appendChild(link);

    }
    chat.appendChild(div)
    chat.scrollTop = chat.scrollHeight;
    userMessageStorage.push("Tabot dijo: " + elem.title);
    return
}


function createButton(elem) {
    var chat = document.getElementById('chatBox');
    var div = document.createElement("div");
    div.classList.add("button-content-bot")
    var title1 = document.createElement("p");
    var textcontent = document.createTextNode(elem.title);
    div.appendChild(title1);
    title1.appendChild(textcontent);
    if (elem.values) {
        elem.values.forEach((e) => {
            var button = document.createElement("button");
            var buttonText = document.createTextNode(e.text);

            button.setAttribute("value", e.value);
            button.setAttribute("onclick", "userMessage('" + e.value + "')");
            button.appendChild(buttonText);
            div.appendChild(button);
        })
    } else {
        var button = document.createElement("button");
        var buttonText = document.createTextNode(elem.values.text);
        button.setAttribute("value", elem.values.value);
        button.setAttribute("onclick", "userMessage('" + e.value + "')");
        div.appendChild(button);

    }
    chat.appendChild(div)
    chat.scrollTop = chat.scrollHeight;
    userMessageStorage.push("Tabot dijo: " + elem.title);
    return
}

function createMenu(elem) {
    var chat = document.getElementById('chatBox');
    var div = document.createElement("div");
    div.classList.add("menu-content-bot")
    var title1 = document.createElement("p");
    var textcontent = document.createTextNode(elem.title);
    div.appendChild(title1)
    title1.appendChild(textcontent);
    if (elem.values) {
        elem.values.forEach((e) => {
            var element_Type = document.createElement(e.type);
            var element_TypeText = document.createTextNode(e.text);
            element_Type.setAttribute("value", e.value);
            element_Type.setAttribute("onclick", "userMessage('" + e.value + "')");
            element_Type.appendChild(element_TypeText);
            div.appendChild(element_Type);
        })
    }
    else {
        var element_Type = document.createElement(e.type);
        var element_TypeText = document.createTextNode(e.text);
        element_Type.setAttribute("value", e.value);
        element_Type.setAttribute("onclick", "userMessage('" + e.value + "')");
        element_Type.appendChild(element_TypeText);
        div.appendChild(element_Type);
    }
    chat.appendChild(div)
    chat.scrollTop = chat.scrollHeight;
    userMessageStorage.push("Tabot dijo: " + elem.title);
}





