const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");

let userMessage = null;

//Pre-requiste of API requests
const API_KEY = "AIzaSyCcXIoehlfCn6RrhB2BgcGMPRwS7IkmxU8 ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;

}


//Fetch response from the API based on user message
const generateAPIresponse = async () => {
    // Send a POST request to the API with the user's message
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contens: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });
        const data = await response.json();
    }
    catch (error) {
        console.log(error);
    }

}

//Show a loading animation while waiting for API response
const showLoadingAnimation = () => {
    const html = ` <div class="message incoming loading">
        <div class="message-content">
            <img src="images/gemini.svg" alt="Gemini Image" class="avatar">
            <p class="text"></p>

            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span class="icon material-symbols-rounded"><img src="images/content-copy.svg" alt=""></span>
       </div>` ;


    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");

    chatList.appendChild(incomingMessageDiv);
    generateAPIresponse();
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector("#typing-input").value.trim();
    if (!userMessage) return;

    const html = `     <div class="message-content">
            <img src="images/user.jpg" alt="User Image" class="avatar">
            <p class="text"></div>` ;


    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); //Clear input fields
    setTimeout(showLoadingAnimation, 500)
}

//Handling outgoing prompt 
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();


    handleOutgoingChat();
})