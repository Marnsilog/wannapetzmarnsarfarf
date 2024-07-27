const firebase=require('firebase')
const firebaseConfig = {
    apiKey: "AIzaSyD8Q5acMaMdhkg4omLjFBBCSBe3luoPcB0",
    authDomain: "wannapetz.firebaseapp.com",
    databaseURL: "https://wannapetz-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wannapetz",
    storageBucket: "wannapetz.appspot.com",
    messagingSenderId: "1088512300091",
    appId: "1:1088512300091:web:9f027b4252d753110a781e"
  };

  firebase.initialize(firebaseConfig)

  const db=firebase.firestore()
  const User = db.collection("Users");
  module.exports = Users;