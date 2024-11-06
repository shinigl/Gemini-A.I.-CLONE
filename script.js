const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");

let userMessage = null ;

const createMessageElement = (content , className)=>{
    const div = document.createElement("div");
    div.classList.add("message",className);
    div.innerHTML = content ;
    return div ;
  
}

//Show a loading animation while waiting for API response
const showLoadingAnimation = ()=>{
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


const incomingMessageDiv =  createMessageElement(html , "incoming" ,"loading");

chatList.appendChild(incomingMessageDiv);
}

const handleOutgoingChat = () =>{
    userMessage = typingForm.querySelector("#typing-input").value.trim();
    if(!userMessage) return ;
    
    const html = `     <div class="message-content">
            <img src="images/user.jpg" alt="User Image" class="avatar">
            <p class="text"></div>` ;
    
   
    const outgoingMessageDiv =  createMessageElement(html , "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage ;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); //Clear input fields
    setTimeout(showLoadingAnimation,500)
}

//Handling outgoing prompt 
typingForm.addEventListener("submit", (e)=>{
    e.preventDefault();


    handleOutgoingChat();
})