const searchForm = document.querySelector("#search-form");
const searchForm1 = document.querySelector("#search-form1");
const searchFormInput = searchForm.querySelector("input"); // <=> document.querySelector("#search-form input");
const searchFormInput1 = searchForm1.querySelector("input"); // <=> document.querySelector("#search-form1 input");
const info = document.querySelector(".info");
var title;
var incidentId;

// The speech recognition interface lives on the browser’s window object
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; // if none exists -> undefined

if(SpeechRecognition) {
  console.log("Your Browser supports speech Recognition");
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  // recognition.lang = "en-US";

  searchForm.insertAdjacentHTML("beforeend", '<button type="button"><i class="fas fa-microphone"></i></button>');
  searchFormInput.style.paddingRight = "50px";

  const micBtn = searchForm.querySelector("button");
  const micIcon = micBtn.firstElementChild;

  micBtn.addEventListener("click", micBtnClick);
  function micBtnClick() {
    if(micIcon.classList.contains("fa-microphone")) { // Start Voice Recognition
      recognition.start(); // First time you have to allow access to mic!
    }
    else {
      recognition.stop();
    }
  }

  recognition.addEventListener("start", startSpeechRecognition); // <=> recognition.onstart = function() {...}
  function startSpeechRecognition() {
    micIcon.classList.remove("fa-microphone");
    micIcon.classList.add("fa-microphone-slash");
    searchFormInput.focus();
    console.log("Voice activated, SPEAK");
  }

  recognition.addEventListener("end", endSpeechRecognition); // <=> recognition.onend = function() {...}
  function endSpeechRecognition() {
    micIcon.classList.remove("fa-microphone-slash");
    micIcon.classList.add("fa-microphone");
    searchFormInput.focus();
    console.log("Speech recognition service disconnected");
  }

  recognition.addEventListener("result", resultOfSpeechRecognition); // <=> recognition.onresult = function(event) {...} - Fires when you stop talking
  function resultOfSpeechRecognition(event) {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    
    if(transcript.toLowerCase().trim()==="stop recording") {
      recognition.stop();
    }
    else if(!searchFormInput.value) {
      searchFormInput.value = transcript;
      if(searchFormInput.value == 'manage'){
        searchForm1.style.display = 'block';
      }
      else if(searchFormInput.value == 'acknowledge'){
        acknowledgeIncident();
      }
      else if(searchFormInput.value == 'resolve'){
        resolveIncident();
      }
      else{
        getDescription();
      }
    }
    else {
      if(transcript.toLowerCase().trim()==="go") {
        //searchForm.submit();
      }
      else if(transcript.toLowerCase().trim()==="reset input") {
        searchFormInput.value = "";
      } 
      else if(searchFormInput.value == 'manage'){
        searchForm1.style.display = 'block';
      }
      else if(searchFormInput.value == 'acknowledge'){
        acknowledgeIncident();
      }
      else if(searchFormInput.value == 'resolve'){
        resolveIncident();
      }
      else {
        searchFormInput.value = transcript;
      }
    }
    // searchFormInput.value = transcript;
    // searchFormInput.focus();
    // setTimeout(() => {
    //   searchForm.submit();
    // }, 500);
  }
  
  info.textContent = 'Voice Commands: "stop recording", "reset input", "manage", "acknowledge", "resolve"';
  
}
else {
  console.log("Your Browser does not support speech Recognition");
  info.textContent = "Your Browser does not support Speech Recognition";
}

function getDescription(){
    title = searchFormInput.value;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "Name": "Muthali Ganesh",
        "Secret": "pBTzDfGt9QL3Mq5KE2BHpHXNP",
        "Prompt ID": "1675407536988x697570478340964400",
        "Input 1": title,
        "n": 1
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://prompts.riku.ai/webhook/run", requestOptions)
        .then(response => response.text())
        .then(result => //createIncident(result.split('Resolution: ')[1])
            createIncident(result)
        )
        .catch(error => console.log('error', error));
}

function createIncident(desc){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "message": title,
        "description": desc,
        "status": "trigger",
        "event_id": "3"
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://api.squadcast.com/v2/incidents/api/f0d1e89ecdd07a6d966c0051b1b96c9f29caaf1c", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

searchFormInput1.onblur = function(){
    searchForm1.style.display = 'none';
    searchFormInput.value = "";
    incidentId = searchFormInput1.value;
}

function acknowledgeIncident(){
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU1ODE5NjAsImp0aSI6IjQ1NTMyYTBlNDMxOTVhMjA0OTU1M2RhYzM5N2Y1N2E2NmM2NjQ5MDc1OTFhNzAwOTBmMzY4MzVmZGNjY2RkMmIiLCJpYXQiOjE2NzU0MDkxNjAsImlzcyI6ImFwaS5zcXVhZGNhc3QuY29tIiwibmJmIjoxNjc1NDA5MTYwLCJpZCI6IjVkMTM1N2YxNmZmMmM2MDAxMGJjMzg1OCIsImZpcnN0X25hbWUiOiJTcXVhZGNhc3QiLCJlbWFpbCI6ImRlbW9Ac3F1YWQuY2FtcCIsInVzZXIiOm51bGwsInNzb19sb2dpbiI6ZmFsc2UsInNzb190b2tlbiI6IiIsIm9yZ2FuaXphdGlvbl9pZCI6IjYwY2IyMDBiYzlkZTRhMDAwOGQyZmM0MSIsIm9yZ2FuaXphdGlvbiI6bnVsbCwicmVmcmVzaF90b2tlbiI6Ijk3YTM0ODhmYmRiYmEzOTY2MzFmYzI1ZjFmMTMzNDU5ZmE4MmVjMmI5ODhkZTI0ODhhNzczYTYzMjgzYTNjODk0NjRlZjQ5M2JiNGI4MTMzNDVjODZhZmJhYTYwNjYwYzVkNDBlZWU0NTNjMjFjMjE2MDBhN2I5Mjc3MzE3NGNkIiwid2ViX3Rva2VuIjpmYWxzZSwiYXBpX3Rva2VuIjp0cnVlfQ.EJ_uxdZi57FObstH4gGQzjxlXuTSKb2L8ux9wI3U5vw");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api.squadcast.com/v3/incidents/"+incidentId+"/acknowledge", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

function resolveIncident(){
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU1ODE5NjAsImp0aSI6IjQ1NTMyYTBlNDMxOTVhMjA0OTU1M2RhYzM5N2Y1N2E2NmM2NjQ5MDc1OTFhNzAwOTBmMzY4MzVmZGNjY2RkMmIiLCJpYXQiOjE2NzU0MDkxNjAsImlzcyI6ImFwaS5zcXVhZGNhc3QuY29tIiwibmJmIjoxNjc1NDA5MTYwLCJpZCI6IjVkMTM1N2YxNmZmMmM2MDAxMGJjMzg1OCIsImZpcnN0X25hbWUiOiJTcXVhZGNhc3QiLCJlbWFpbCI6ImRlbW9Ac3F1YWQuY2FtcCIsInVzZXIiOm51bGwsInNzb19sb2dpbiI6ZmFsc2UsInNzb190b2tlbiI6IiIsIm9yZ2FuaXphdGlvbl9pZCI6IjYwY2IyMDBiYzlkZTRhMDAwOGQyZmM0MSIsIm9yZ2FuaXphdGlvbiI6bnVsbCwicmVmcmVzaF90b2tlbiI6Ijk3YTM0ODhmYmRiYmEzOTY2MzFmYzI1ZjFmMTMzNDU5ZmE4MmVjMmI5ODhkZTI0ODhhNzczYTYzMjgzYTNjODk0NjRlZjQ5M2JiNGI4MTMzNDVjODZhZmJhYTYwNjYwYzVkNDBlZWU0NTNjMjFjMjE2MDBhN2I5Mjc3MzE3NGNkIiwid2ViX3Rva2VuIjpmYWxzZSwiYXBpX3Rva2VuIjp0cnVlfQ.EJ_uxdZi57FObstH4gGQzjxlXuTSKb2L8ux9wI3U5vw");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api.squadcast.com/v3/incidents/"+incidentId+"/resolve", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}