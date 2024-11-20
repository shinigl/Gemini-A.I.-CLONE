const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const deleteChatButton = document.getElementById('delete-btn');
let header = document.querySelector("header");
let suggestion = document.querySelectorAll(".suggestion");

let userMessage = null;

// Pre-requisite of API requests
const API_KEY = "AIzaSyCcXIoehlfCn6RrhB2BgcGMPRwS7IkmxU8";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Retry parameters
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Retry function for fetching API response
const fetchAPIResponse = async (attempt = 1) => {
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

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error);

        // Retry mechanism if status 503 is received (Server overloaded)
        if (error.message.includes('503') && attempt < MAX_RETRIES) {
            console.log(`Retrying... (${attempt + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Wait before retrying
            return await fetchAPIResponse(attempt + 1); // Retry the request
        }

        // If retries are exhausted or the error isn't 503, throw the error
        throw error;
    }
};

// Fetching API response
const generateAPIresponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");

    try {
        // Try to fetch the data from the API with retries
        const data = await fetchAPIResponse();

        console.log('API Response:', data); // Log the entire response to check structure

        // Ensure data and candidates are valid before accessing
        if (data?.candidates && data.candidates.length > 0 && data.candidates[0]?.content?.parts?.[0]?.text) {
            let apiResponse = data.candidates[0].content.parts[0].text;

            // Clean up the response text to remove Markdown formatting
            const cleanedResponse = apiResponse
                .replace(/^(\*\*\*|\s+)/g, '') // Remove leading ***
                .replace(/(\*\*\*|\s+)$/g, '') // Remove trailing ***
                .replace(/\*\*/g, '')          // Remove bold markdown (optional)
                .replace(/\_/g, '')            // Remove underscore markdown (optional)
                .replace(/\n/g, '<br>');       // Replace line breaks with <br> (optional)

            // Render the cleaned response as plain text
            textElement.innerHTML = cleanedResponse;

            // Use typing effect to display the response gradually
            typingEffect(textElement, cleanedResponse);
        } else {
            console.error("No valid candidates found in the API response");
            textElement.innerHTML = "Sorry, no response from API. Please try again later."; // Handle missing candidates
        }
    } catch (error) {
        console.log(error);
        textElement.innerHTML = "Sorry, there was an issue with the API request. Please try again later."; // Gracefully handle errors
    } finally {
        incomingMessageDiv.classList.remove("loading"); // Remove loading animation
    }
};

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
    const messageText = copyIcon.closest(".message").querySelector(".text").innerText;
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

// Suggestion-list working
suggestion.forEach((ele) => {
    console.log(ele);
    ele.addEventListener("click", () => {
        typingForm.querySelector("#typing-input").value = ele.querySelector(".text").textContent;
        handleOutgoingChat();
    })
});

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
