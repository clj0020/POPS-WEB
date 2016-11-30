'use strict';

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]

var firebase = require('firebase-admin');
var request = require('request');

var API_KEY = "AIzaSyAn0r-O8BRzQuYt9GD1fidzWfosN4C8fy0"; // Your Firebase Cloud Messaging Server API key

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://pops-ed39c.firebaseio.com/"
});

var ref = firebase.database().ref();

function listenForNotificationRequests() {
  var requests = ref.child('notifications');
  ref.on('child_added', function(requestSnapshot) {
    var request = requestSnapshot.val();
    sendNotificationToUser(
      request.uid,
      request.job,
      request.neighborUid,
      request.popperUid,
      request.recieverUid,
      request.title,
      request.description,
      request.type,
      function() {
        requestSnapshot.ref.remove();
      }
    );
  }, function(error) {
    console.error("error");
  });
};

function sendNotificationToUser(uid, job, neighborUid, popperUid, recieverUid, title, description, type, onSuccess) {
  request({
    url: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    headers: {
      'Content-Type' :' application/json',
      'Authorization': 'key=' + API_KEY
    },
    body: JSON.stringify({
      notification: {
        uid: uid,
        job: job,
        neighborUid: neighborUid,
        popperUid: popperUid,
        recieverUid: recieverUid,
        title: title,
        description: description,
        type: type
      },
      to : '/topics/user_' + recieverUid
    })
  }, function(error, response, body) {
    if (error) {
      console.error(error);
    }
    else if (response.statusCode >= 400) {
      console.error('HTTP Error: '+response.statusCode + ' - ' + response.statusMessage);
    }
    else {
      onSuccess();
    }
  });
}

// start listening
listenForNotificationRequests();
