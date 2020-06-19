import * as firebase from 'firebase'
require('@firebase/firestore');


  var firebaseConfig = {
    apiKey: "AIzaSyDpKvp1uX-plWMJtlQqUEwxKb1NxIqObaM",
    authDomain: "willy-app-e6b72.firebaseapp.com",
    databaseURL: "https://willy-app-e6b72.firebaseio.com",
    projectId: "willy-app-e6b72",
    storageBucket: "willy-app-e6b72.appspot.com",
    messagingSenderId: "363666745155",
    appId: "1:363666745155:web:2ac8a875b87b60217631f6"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();