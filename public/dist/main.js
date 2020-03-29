class App {
    constructor () {
        this.currentUser = null;
        this.db = firebase.firestore();

        this.initFirebaseListeners();
        this.messages = [];
    }

    initFirebaseListeners() {
        let messageOrderByTime = this.db.collection('messages').orderBy('timestamp', 'asc');
        messageOrderByTime.onSnapshot((snapshot) => {
            snapshot.forEach(doc => {

                let message = doc.data();
                message.id = doc.id;

                if (!this.messages.find(m => m.id == message.id)) {
                    this.messages.push(message);
                    this.displayMessage(message);
                }
                // console.log('Messages: ', 'messages');
                // console.log('Message: ', message);
            })
        })
    }

    // получение сообщениея и активация кнопки для отправки
    textMessage = (e) => {
        // console.log(e);
        if (e.target.value) {
            formButton.disabled = false;
        } else {
            formButton.disabled = true;
        }  
    }

    // отправление сообщения
    sendMessage = (e) => {
        e.preventDefault();

        let messageBody = e.target[0].value;

        this.db.collection('messages').add({
            username: this.currentUser.displayName,
            email: this.currentUser.email,
            message: messageBody,
            // timestamp: firebase.firestore.FieldValue.serverTimestamp()
            timestamp: Date.now()
        })
    }

    displayMessage(message) {
        let messageStorage = document.querySelector('.main__messages');

            let divMessage = document.createElement('div');
            divMessage.classList = 'main__message';

                let timestamp = new Date (message.timestamp);
                console.log('timestamp: ', timestamp);

                function timeConverter(timestamp){
                    let a = new Date(timestamp * 1000);
                    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    let year = a.getFullYear();
                    let month = months[a.getMonth()];
                    // let month = '0' + a.getMonth();
                    let date = a.getDate();
                    let hour = a.getHours();
                    let min = a.getMinutes();
                    let sec = a.getUTCSeconds();

                    function pad(n){return n<10 ? '0'+n : n}

                    let time = pad(date) + '.' + pad(month) + '.' + year + ' ' + pad(hour) + ':' + pad(min) + ':' + pad(sec);
                    return time;
                  }

                function name(){
                    if (message.username != null) {
                        return message.username;
                    } else { 
                        return message.email;
                    }
                }
                
                let h4 = document.createElement('h4');
                // h4.innerText = name() + ', ' + (timeConverter(timestamp.toMillis()));
                // h4.innerText = name() + ', ' + (timeConverter(timestamp));
                h4.innerText = name() + ', ' + timestamp.toLocaleString();

                h4.className = 'main__nickname';

                let span = document.createElement('span');
                span.innerText = message.message;
                span.className = 'main__text';

                divMessage.appendChild(h4);
                divMessage.appendChild(span);
        
        messageStorage.appendChild(divMessage);
    }

    displayUserGoogle() {
        popupWindow();

        let signOutButton = document.querySelector('.header__signout');
        signOutButton.hidden = false;

        let userName = document.querySelector('.header__username');
        userName.hidden = false;

        userName.innerText = this.currentUser.displayName;
        console.log('this.currentUserGoogle: ', this.currentUser);

        let userPic = document.querySelector('.header__userpic');
        userPic.hidden = false;
        userPic.innerHTML = '';

        userPic.style.backgroundImage = `url(${this.currentUser.photoURL})`

        signInButton.hidden = true;

        let userList = document.querySelector('.main__users');

            let usernameInUserList = document.createElement('div');
            usernameInUserList.className = 'main_userlist';

                let a = document.createElement('a');
                a.className = 'main__userinfo';
                a.href = 'http://';
                a.innerText = '[i]';

                let span = document.createElement('span');
                span.innerText = ' ' + this.currentUser.displayName;

            usernameInUserList.appendChild(a);
            usernameInUserList.appendChild(span);
            
        userList.appendChild(usernameInUserList);
    }

    displayUserRegistered() {
        popupWindow();

        let signOutButton = document.querySelector('.header__signout');
        signOutButton.hidden = false;

        let userName = document.querySelector('.header__username');
        userName.hidden = false;

        userName.innerText = '' + this.currentUser.email;
        console.log('this.currentUser.email: ', this.currentUser.email);
        

        let userPic = document.querySelector('.header__userpic');
        userPic.hidden = false;
        userPic.innerHTML = '';
        
        let newUserPic = document.querySelector('.main__anonymouspic');
        userPic.style.backgroundImage = `url(${newUserPic.src})`
        
        signInButton.hidden = true;

        let userList = document.querySelector('.main__users');

            let usernameInUserList = document.createElement('div');
            usernameInUserList.className = 'main_userlist';

                let a = document.createElement('a');
                a.className = 'main__userinfo';
                a.href = 'http://';
                a.innerText = '[i]';

                let span = document.createElement('span');
                span.innerText = ' ' + this.currentUser.email;

            usernameInUserList.appendChild(a);
            usernameInUserList.appendChild(span);
            
        userList.appendChild(usernameInUserList);
    }

    signOutUser() {
        let signOutButton = document.querySelector('.header__signout');
        signOutButton.hidden = true;

        let userName = document.querySelector('.header__username');
        userName.hidden = true;

        let userPic = document.querySelector('.header__userpic');
        userPic.hidden = true;

        signInButton.hidden = false;
    }

    signInWithGoogle = async () => {
        let provider = new firebase.auth.GoogleAuthProvider();
        let resultAuth = await firebase.auth().signInWithPopup(provider);
        // console.log(resultAuth);
        this.currentUser = resultAuth.user;

        this.displayUserGoogle();
    }

    registerUser = async () => {

        let email = document.querySelector('.main__email').value;
        let password = document.querySelector('.main__password').value;

        let resultAuth = await firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            console.log('Create user errorCode: ', errorCode);
            var errorMessage = error.message;
            console.log('Create user errorMessage: ', errorMessage);
            // ...
          });
        
        this.currentUser = resultAuth.user;
        
        this.displayUserRegistered();
        
    }

    signInWithEmailAndPassword = async () => {

        let email = document.querySelector('.main__email').value;
        let password = document.querySelector('.main__password').value;

        let resultAuth = await firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            console.log('Login errorCode: ', errorCode);
            var errorMessage = error.message;
            console.log('Login errorMessage: ', errorMessage);
            // ...
        });

        console.log('resultAuth: ', resultAuth);
        this.currentUser = resultAuth.user;
        console.log('this.currentUser: ', this.currentUser);

        this.displayUserRegistered();
        console.log(resultAuth);
    }

    signOut = () => {
        firebase.auth().signOut();
        this.signOutUser();
    }

    // попытка сделать сессию сохраняемой

    // signIn = () => {
    //     firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    //     .then(async () => {
    //         let provider = new firebase.auth.GoogleAuthProvider();
    //         let resultAuth = await firebase.auth().signInWithPopup(provider);

    //         this.currentUser = resultAuth.user;
            
    //         console.log(this);
    //         console.log(this.currentUser);

    //         this.displayUser();

    //     return resultAuth;
    //     })
    //     .catch(function(error) {
    //         // Handle Errors here.
    //         let errorCode = error.code;
    //         let errorMessage = error.message;
    //         console.log(errorCode);
    //         console.log(errorMessage);
    //     });
       
    // }
}

let myChat = new App();

// register User Email and Password
let registerLink = document.querySelector('.main__register');
registerLink.addEventListener('click', myChat.registerUser);

// auth Email and Password
let logInButton = document.querySelector('.main__signinbutton');
logInButton.addEventListener('click', myChat.signInWithEmailAndPassword);

// auth Google
let logInButtonGoogle  = document.querySelector('.main__button-google');
logInButtonGoogle.addEventListener('click', myChat.signInWithGoogle);

// signout
let signOutButton = document.querySelector('.header__signout');
signOutButton.addEventListener('click', myChat.signOut);

// chat msg and enable send_button
let message = document.querySelector('.main__input');
let formButton = document.querySelector('.main__send');
message.addEventListener('input', myChat.textMessage);

// send msg
let form = document.querySelector('.main__input-form');
form.addEventListener('submit', myChat.sendMessage);

let currentUsersOnline = () => {

    let usersOnline = document.querySelector('.main__usersonline');

        let number = document.querySelectorAll('.main__userslist').length;

    usersOnline.innerHTML = 'Current users online: ' + number;
}

currentUsersOnline();

// popup window

let popupWindow = function(){
    document.querySelector('.main__popup').classList.toggle('main__popup_display-none');
    document.querySelector('.main__popup').classList.toggle('main__popup_display-flex');
}

// display popup window
let signInButton = document.querySelector('.header__signin');
signInButton.hidden = false;
signInButton.addEventListener('click', popupWindow);

// hide popup window
let closePopupWindow = document.querySelector('.main__close');
closePopupWindow.addEventListener('click', popupWindow);

firebase.auth().onAuthStateChanged(function(firebaseUser) {
    console.log('FirebaseUser: ', firebaseUser);
    // window.user = user;
    // console.log('window.user: ', window.user);


    // Step 1:
    //  If no user, sign in anonymously with firebase.auth().signInAnonymously()
    //  If there is a user, log out out user details for debugging purposes.
  });


// function initFirebaseAuth() {
//     // Listen to auth state changes.
//     firebase.auth().onAuthStateChanged(authStateObserver);
// }

// initFirebaseAuth()