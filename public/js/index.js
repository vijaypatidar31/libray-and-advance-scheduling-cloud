document.addEventListener('DOMContentLoaded', function() {
    var isLogIn = false;


    document.getElementById("log_in_out").addEventListener("mouseover", function() {
        var spanHint = document.getElementById("hint_user");
        if (!isLogIn) {
            spanHint.innerHTML = "login";
        } else {
            spanHint.innerHTML = "logout";
        }
        spanHint.style.visibility = "visible";
    });


    document.getElementById("log_in_out").addEventListener("mouseout", function() {
        var spanHint = document.getElementById("hint_user");
        spanHint.style.visibility = "collapse";
    });


    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            isLogIn = true;
            document.getElementById("log_in_out").src = "image/logout_icon.png";
        } else {
            isLogIn = false;
            document.getElementById("log_in_out").src = "image/login_icon.png";
            // No user is signed in.
        }
    });

    //addding listener
    document.getElementById("log_in_out").addEventListener("click", function() {
        if (!isLogIn) {
            alert("redirecting to login page");
            location.replace("login.html");
        } else {
            firebase.auth().signOut().then(function() {
                // Sign-out successful.
                document.getElementById("log_in_out").src = "login_icon.png";
            }).catch(function(error) {
                alert(error);
            });
        }
    });


});