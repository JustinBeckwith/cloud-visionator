var label = null;
var counter = null;
var counterTime = 30000;
var timeStarted = null;
var currentItem = null;
var items = null;

var notAllowedItems = [
  'mobile device'
]

var width = 320;
var height = 0;
var streaming = false;
var video = null;
var canvas = null;
var photo = null;
var startbutton = null;
var okBtn = null;
var message = null;
var clearImage = false;
var dotdotInterval = null;

function onload() {
  label = document.getElementById('label');
  counter = document.getElementById('counter'); 
  okBtn = document.getElementById('okBtn');
  message = document.getElementById('message');
  startup();
  
  getData().then((data) => {
    items = data.items;
    newBring()
  });;

  okBtn.addEventListener('click',() => {
    message.style.display = 'none';
    if (clearImage) {
      photo.style.display = 'none';
      clearImage = false;
    }
  });

  // var ref = new Firebase("torrid-inferno-5288.firebaseio.com");
  // var scores = ref.child("scores");
  // scores.on('child_added', function(snapshot) {
  //   var score = snapshot.val();
  //   console.log(score);
  // });
  // var uid = scores.push({
  //   email: "joe@google.com",
  //   points: 243
  // });

}

function newBring() {
  var itemIndex = Math.floor(Math.random() * items.length);
  currentItem = items[itemIndex];
  label.innerText = "Bring me " + currentItem.name;
  timeStarted = new Date();
  updateTimer();
  photo.style.display = 'none';
}

function updateTimer() {
  var timeNow = new Date();
  var diffMilli = Math.abs(timeNow - timeStarted);
  var milliLeft = counterTime - diffMilli;
  var secLeft = Math.floor(milliLeft/1000);
  counter.innerText = secLeft;
  if (secLeft > 0) {
    setTimeout(updateTimer, 250);
  } else {
    setTimeout(newBring, 3000);
  }
}

function startup() {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  photo = document.getElementById('photo');
  startbutton = document.getElementById('startbutton');

  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  navigator.getMedia({
      video: true,
      audio: false
    },
    function(stream) {
      var vendorURL = window.URL || window.webkitURL;
      video.src = vendorURL.createObjectURL(stream);
      video.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
    
      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.
    
      if (isNaN(height)) {
        height = width / (4/3);
      }
    
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  startbutton.addEventListener('click', function(ev){
    takepicture();
    ev.preventDefault();
  }, false);

}

function takepicture() {
  var context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
  photo.style.height = video.offsetHeight;
  photo.style.display = "inline-block";

  showMessage('Looking at the image...', 'We can tell by the pixels.', true);
  
  var form = new FormData()
  form.append('pic', data);

  fetch("/sendpic", {
    method: "POST",
    body: form
  }).then((response) => {
    return response.json();
  }).then((labels) => {
    console.log(labels);
    var found = false;
    var subtext = labels.join(', ');
    for (var i=0; i<labels.length; i++) {
      var label = labels[i];
      if (notAllowedItems.indexOf(label) >= 0) {
        showMessage("Hey...  no using your phone :P", subtext);
        found = true;
      } else if (currentItem.labels.indexOf(label) >= 0) {
        showMessage("YOU FOUND IT!  THANK YOU SO MUCH!", subtext);
        found = true;
      }
    }

    if (!found) {
      showMessage('Nope, try again.', subtext);
      clearImage = true;
    }

  });
}

function showMessage(text, subtext, dotdot) {
  var messageText = document.getElementById('message-text');
  var messageSubText = document.getElementById('message-subtext');
  messageText.innerText = text;
  messageSubText.innerText = subtext;
  message.style.display = 'inline-block';
  if (dotdotInterval) {
    clearInterval(dotdotInterval);
  }
  if (dotdot) {
    dotdotInterval = setInterval(() => {
      messageText.innerText = messageText.innerText + ".";
    }, 500);
  }
}

function hideMessage() {
  message.style.display = 'none';
  if (dotdotInterval) {
    clearInterval(dotdotInterval);
  }
}

function getData() {
  return fetch("data.json").then((response) => {
      return response.json();
  });
}