import { signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { app, auth } from "./fbSetup.js"

const redirectOnLogin = (user) => {
    if (user) {
        document.getElementById("redirectMeHere").click();
    }
};
var disableAuthCallback = onAuthStateChanged(auth, redirectOnLogin);

function validateEmail(text) {
    // RFC 2822 email regex
    return text.match("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
}

export function handleFormFocus(e) {
    e.currentTarget.className = "form-control mb-3";
}

export function handleEmailFieldBlur(e) {
    if (validateEmail(e.currentTarget.value)) {
        e.currentTarget.className = "form-control mb-3 is-valid";
    } else {
        e.currentTarget.className = "form-control mb-3 is-invalid";
    }
}

export function handlePasswordFieldBlur(e) {
    if (e.currentTarget.value.length > 1) {
        e.currentTarget.className = "form-control mb-3 is-valid";
    } else {
        e.currentTarget.className = "form-control mb-3 is-invalid";
    }
}

export function handleSignUpPasswordFieldBlur(e) {
    // TODO: Better password security
    if (e.currentTarget.value.length > 6) {
        e.currentTarget.className = "form-control mb-3 is-valid";
        const passwordField2 = document.getElementById("signUpPassword2");
        if (passwordField2.value != "") {
            passwordField2.onblur();
        }
    } else {
        e.currentTarget.className = "form-control mb-3 is-invalid";
    }
}

export function handlePasswordConfirmFieldBlur(e) {
    const passwordField = document.getElementById("signUpPassword");
    if (e.currentTarget.value != passwordField.value) {
        e.currentTarget.className = "form-control mb-3 is-valid";
    } else {
        e.currentTarget.className = "form-control mb-3 is-invalid";
    }
}

export function handleSignUpButtonClick(e) {
    const emailField = document.getElementById("signUpEmail").value;
    const passwordField = document.getElementById("signUpPassword").value;
    const passwordField2 = document.getElementById("signUpPassword2").value;
    const nameField = document.getElementById("signUpName").value;
    e.preventDefault();

    if (!validateEmail(emailField) || passwordField != passwordField2 || passwordField == "") {
        return false;
    }

    disableAuthCallback()
    createUserWithEmailAndPassword(auth, emailField, passwordField)
        .then(() => {
            console.log("You did it, you won!")
            // TODO: Associate name if provided
            // Need to figure out firestore structure
            // Probably uid folder name, with files info, tasks, taskTimes
            document.getElementById("redirectMeHere").click();
        })
        .catch((error) => {
            disableAuthCallback = onAuthStateChanged(auth, redirectOnLogin);
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage)
            // TODO: Error modal
        });
    return false;
}

export function handleLoginButtonClick(e) {
    const emailField = document.getElementById("loginEmail").value;
    const passwordField = document.getElementById("loginPassword").value;
    e.preventDefault();

    if (!validateEmail(emailField) || passwordField == "") {
        return false;
    }

    signInWithEmailAndPassword(auth, emailField, passwordField)
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            // TODO: Error modal
        });
    return false;
}

export function handleGuestButtonClick() {
    signInAnonymously(auth).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // TODO: Error modal (only possible reason is a config error)
    });
}
