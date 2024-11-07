const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const deleteChatButton = document.getElementById('delete-btn');

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
const generateAPIresponse = async (incomingMessageDiv) => {

    const textElement = incomingMessageDiv.querySelector(".text") //Get the text element
    console.log(textElement);

    // Send a POST request to the API with the user's message
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });
        const data = await response.json();

        //Get the API response text
        const apiResponse = data?.candidates[0].content.parts[0].text; //Answer by AI 
        console.log(apiResponse)
        
        textElement.innerText = apiResponse;
        
    }
    catch (error) {
        console.log(error);
    } finally{
     
          incomingMessageDiv.classList.remove("loading"); //Remove loading animation

    }

}

//Show a loading animation while waiting for API response
const showLoadingAnimation = () => {
    const html = `<div class="message-content">
            <img src="images/gemini.svg" alt="Gemini Image" class="avatar">
            <p class="text"></p>

            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded"><img src="images/content-copy.svg" alt=""></span>
       </div>` ;


    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");

    chatList.appendChild(incomingMessageDiv);
    generateAPIresponse(incomingMessageDiv);
}

//Copy message to clipboard

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.closest(".message").querySelector(".text").innerText; // Corrected line
    navigator.clipboard.writeText(messageText); // Copy the answer to clipboard
    copyIcon.innerText = "Check"; // Show tick icon
    copyIcon.style.color ="white"

    setTimeout(() => {
        copyIcon.innerHTML = `<img src="images/content-copy.svg" alt="">`; // Revert icon after 1 second
    }, 1000);
};


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