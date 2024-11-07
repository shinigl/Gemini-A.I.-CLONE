const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const deleteChatButton = document.getElementById('delete-btn');
let header = document.querySelector("header");
let suggestion = document.querySelectorAll(".suggestion");

let userMessage = null;

// Pre-requisite of API requests
const API_KEY = "AIzaSyCcXIoehlfCn6RrhB2BgcGMPRwS7IkmxU8 ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Fetching API response
const generateAPIresponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text"); // Get the text element

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

        // Get the API response text
        let apiResponse = data?.candidates[0].content.parts[0].text;


        // Clean up the response text to remove Markdown formatting (like ***, **, or any other symbols)
        const cleanedResponse = apiResponse
            .replace(/^(\*\*\*|\s+)/g, '') // Remove leading ***
            .replace(/(\*\*\*|\s+)$/g, '') // Remove trailing ***
            .replace(/\*\*/g, '')          // Remove bold markdown (optional)
            .replace(/\_/g, '')            // Remove underscore markdown (optional)
            .replace(/\n/g, '<br>');       // Replace line breaks with <br> (optional, if you want to keep line breaks)



        // Render the cleaned response as plain text
        textElement.innerHTML = cleanedResponse;

        // Use typing effect to display the response gradually
        typingEffect(textElement, cleanedResponse);

    } catch (error) {
        console.log(error);
    } finally {
        incomingMessageDiv.classList.remove("loading"); // Remove loading animation
    }
}


// Show a loading animation while waiting for API response
const showLoadingAnimation = () => {
    const html = `
        <div class="message-content">
            <img src="images/gemini.svg" alt="Gemini Image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded">
            <img src="images/content-copy.svg" alt="">
        </span>
    `;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);
    generateAPIresponse(incomingMessageDiv);



};


// Copy message to clipboard
const copyMessage = (copyIcon) => {
    const messageText = copyIcon.closest(".message").querySelector(".text").innerText; // Corrected line
    navigator.clipboard.writeText(messageText); // Copy the answer to clipboard
    copyIcon.innerText = "Check"; // Show tick icon
    copyIcon.style.color = "white";

    setTimeout(() => {
        copyIcon.innerHTML = `<img src="images/content-copy.svg" alt="">`; // Revert icon after 1 second
    }, 1000);
};

// Handle outgoing chat message
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector("#typing-input").value.trim();
    if (!userMessage) return;

    const html = `
        <div class="message-content">
            <img src="images/user.jpg" alt="User Image" class="avatar">
            <p class="text"></p>
        </div>
    `;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    // Remove header when chat started
    header.classList.add("hide-header");

    typingForm.reset(); // Clear input fields
    setTimeout(showLoadingAnimation, 500); // Show loading animation after a brief delay
}

// Delete chat history
deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete chat history?")) {
        chatList.innerHTML = ""; // Clear chat history
        header.classList.remove("hide-header"); // Show header when chat ended
    }
});

//Suggestion-list working
suggestion.forEach((ele) => {
    console.log(ele);
    ele.addEventListener("click", () => {
        typingForm.querySelector("#typing-input").value = ele.querySelector(".text").textContent;
        handleOutgoingChat();
    })
})

const typingEffect = (element, text, delay = 8) => {
    let index = 0;
    element.innerHTML = '';  // Clear any previous content

    const typeCharacter = () => {
        if (index < text.length) {
            if (text.slice(index, index + 4) === '<br>') {
                // If we encounter <br>, add a line break in the HTML content
                element.innerHTML += '<br>';
                index += 4; // Skip over the <br> tag in the text
            } else {
                // Otherwise, type out one character at a time
                element.innerHTML += text[index++];
            }
            setTimeout(typeCharacter, delay); // Recursively type characters with a delay
        }
    };

    // Start typing the content
    typeCharacter();
};


// Handling outgoing prompt
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
