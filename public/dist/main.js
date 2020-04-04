class App {
    constructor () {
        this.currentUser = null;
        this.db = firebase.firestore();

        this.initFirebaseAuth();
        this.initFirebaseListeners();
        this.messages = [];
        this.users = [];
    }

    initFirebaseAuth() {

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {

                function SingInName(){
                    if (user.displayName != null) {
                        return user.displayName;
                    } else { 
                        return user.email;
                    }
                }

                let signOutButton = document.querySelector('.header__signout');
                signOutButton.hidden = false;

                let userName = document.querySelector('.header__username');
                userName.hidden = false;

                userName.innerText = SingInName();

                let userPic = document.querySelector('.header__userpic');
                userPic.hidden = false;
                userPic.innerHTML = '';

                let newUserPic = document.querySelector('.main__anonymouspic');

                function photoURL(){
                    if (user.photoURL != null) {
                        return user.photoURL;
                    } else { 
                        return newUserPic.src;
                    }
                }

                userPic.style.backgroundImage = `url(${photoURL()})`

                signInButton.hidden = true;

                console.log("Signed in user!");

                unregisteredMessage();
              } else {
                let signOutButton = document.querySelector('.header__signout');
                signOutButton.hidden = true;
        
                let userName = document.querySelector('.header__username');
                userName.hidden = true;
        
                let userPic = document.querySelector('.header__userpic');
                userPic.hidden = true;
        
                signInButton.hidden = false;

                console.log("User Sign out!");

                unregisteredMessage();
              }
            console.log('FirebaseUser: ', user);

        });
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
            })
        })
    let userOrderByName = this.db.collection('users');
    // console.log('userOrderByName: ', userOrderByName);
    userOrderByName.onSnapshot((snapshot) => {
        snapshot.forEach(doc => {
            let user = doc.data();
            // console.log('doc.data(): ', doc.data());
            user.id = doc.id;
            // console.log('doc.id: ', doc.id);
            if (!this.users.find(m => m.id == user.id)) {
                this.users.push(user);
                // console.log('this.users: ', this.users);
                this.displayUsersOnline(user);
            }
         })
    })
    }

    // получение сообщения и активация кнопки для отправки
    textMessage = (e) => {
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
            uid: this.currentUser.uid,
            message: messageBody,
            timestampServer: firebase.firestore.FieldValue.serverTimestamp(),
            timestamp: Date.now()
        })
    }

    //удаление сообщения с сервера и страницы, ТОЛЬКО АДМИН
    deleteMessage = (e) => {
        if (e.target.className != 'delete') return;
    
        let messageId = e.target.dataset.id;
        console.log('messageId: ', messageId);
        this.db.collection("messages").doc(`${messageId}`).delete()
        .then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
        let message = event.target.closest('.main__message');
        message.remove();
    }

    //вставка имени в поле чата
    inputNickname = (e) => {
        if (e.target.className != 'main__nickname') return;
        let first = true;
        inputQueue(e);
       
        function inputQueue (e) {
            let putUserName = document.getElementsByName('nickname')[0];
            let input = putUserName.value + ', ';
            if (first) {
                first = false;
                input = "";
            }
            putUserName.value = input + e.target.innerText;
        }
        
        return false;
    }
    
    // отображение сообщения в чате
    displayMessage(message) {

        let messageStorage = document.querySelector('.main__messages');

            let divMessage = document.createElement('div');
            divMessage.classList = 'main__message';

                let divText = document.createElement('div');
                divText.className = 'main__message_text';

                    let timestamp = new Date (message.timestamp);

                    function name(){
                        if (message.username != null) {
                            return message.username;
                        } else { 
                            return message.email;
                        }
                    }
                    
                    let h4 = document.createElement('h4');
                    h4.innerText = name() + ', ' + timestamp.toLocaleString();

                    h4.className = 'main__nickname';
                    
                    let span = document.createElement('span');
                    span.innerText = message.message;
                    span.className = 'main__text';

                    let options = document.createElement('div');
                    options.className = 'main__message_options';

                        let edit = document.createElement('span');
                        edit.className = 'edit';
                        edit.innerText = 'Edit';
                        let quote = document.createElement('span');
                        quote.className = 'quote';
                        quote.innerText = ' Quote';
                        let del = document.createElement('span');
                        del.className = 'delete';
                        del.innerText = ' Delete';
                        del.dataset.id = message.id;
                    
                    options.appendChild(edit);   
                    options.appendChild(quote);
                    options.appendChild(del);
                divText.appendChild(h4);
                divText.appendChild(span);
                divText.appendChild(options);
            divMessage.appendChild(divText);
        messageStorage.appendChild(divMessage);
    }

    displayUsersOnline(user) {
        let userList = document.querySelector('.main__users');

                    let usernameInUserList = document.createElement('div');
                    usernameInUserList.className = 'main__userslist';

                        let a = document.createElement('a');
                        a.className = 'main__userinfo';
                        a.href = 'http://';
                        a.innerText = '[i]';
                        
                        function name(){
                            if (user.username != null) {
                                return user.username;
                            } else { 
                                return user.email;
                            }
                        }

                        let span = document.createElement('span');
                        span.innerText = ' ' + name();

                    usernameInUserList.appendChild(a);
                    usernameInUserList.appendChild(span);
                    
            userList.prepend(usernameInUserList);
    }

    //добавление пользователя в базу данных
    addUserToDB = (u) => {

        let username = u.displayName;

        this.db.collection('users').add({
            username: username,
            email: this.currentUser.email,
            uid: this.currentUser.uid,
            photoURL: this.currentUser.photoURL,
            timestampServer: firebase.firestore.FieldValue.serverTimestamp()
        })
    }

    //авторизация через гугл
    signInWithGoogle = async () => {
        let provider = new firebase.auth.GoogleAuthProvider();
        let resultAuth = await firebase.auth().signInWithPopup(provider);

        this.currentUser = resultAuth.user;

        this.addUserToDB(this.currentUser);
        popupWindow();
    }
    
    //регистрация через пароль и почту
    registerUser = async () => {
        
        let email = document.querySelector('.main__email').value;
        let password = document.querySelector('.main__password').value;
        
        let resultAuth = await firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            let errorCode = error.code;
            console.log('Create user errorCode: ', errorCode);
            let errorMessage = error.message;
            console.log('Create user errorMessage: ', errorMessage);
            if (errorMessage == 'The email address is badly formatted.') {
                alert('Введите адрес электронной почты для регистрации')
            }
            if (errorMessage == 'Password should be at least 6 characters'){
                alert('ОШИБКА: Пароль должен содержать не менее 6 символов!!!')
            }
            if (errorMessage == 'The password must be 6 characters long or more.') {
                alert('ОШИБКА: Вы не ввели пароль!!!')
            }

        });
        
        this.currentUser = resultAuth.user;

        this.addUserToDB(this.currentUser); 
    }
    
    //авторизация через пароль и почту
    signInWithEmailAndPassword = async () => {
        
        let email = document.querySelector('.main__email').value;
        let password = document.querySelector('.main__password').value;
        
        let resultAuth = await firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            var errorCode = error.code;
            console.log('Login errorCode: ', errorCode);
            var errorMessage = error.message;
            console.log('Login errorMessage: ', errorMessage);
        });

        this.currentUser = resultAuth.user;
        popupWindow();
    }

    signOut = () => {
        firebase.auth().signOut();
    }
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

// input msg and enable send_button
let message = document.querySelector('.main__input');
let formButton = document.querySelector('.main__send');
message.addEventListener('input', myChat.textMessage);

// send msg
let form = document.querySelector('.main__input-form');
form.addEventListener('submit', myChat.sendMessage);

// delete msg
let deleteButton = document.querySelector('.main__messages');
deleteButton.addEventListener('click', myChat.deleteMessage);

// input nickname
let inputName = document.querySelector('.main__container');
inputName.addEventListener('click', myChat.inputNickname);

// popup window
let popupWindow = () => {
    document.querySelector('.main__popup').classList.toggle('main__popup_display-none');
    document.querySelector('.main__popup').classList.toggle('main__popup_display-flex');
}

let unregisteredMessage = () => {
    document.querySelector('.main__unregistered').classList.toggle('main__unregistered_display-none');
    document.querySelector('.main__unregistered').classList.toggle('main__unregistered_display-flex');

    document.querySelector('.main__chatinput').classList.toggle('main__chatinput_display-flex');
    document.querySelector('.main__chatinput').classList.toggle('main__chatinput_display-none');
}

// display popup window
let signInButton = document.querySelector('.header__signin');
signInButton.hidden = false;
signInButton.addEventListener('click', popupWindow);

// hide popup window
let closePopupWindow = document.querySelector('.main__close');
closePopupWindow.addEventListener('click', popupWindow);

currentUsersOnline = () => {

    let usersOnline = document.querySelector('.main__usersonline');
        let number = document.querySelectorAll('.main__userslist').length;

    usersOnline.innerHTML = 'Current users online: ' + number;

    return number;
}

currentUsersOnline()