var ADMIN = {};
var values;
var lec = 1;
var UID = "uid";
const type = "input";
window.onload = function() {

    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            alert("you are not logged in...");
            location.replace("main_content.html");
        } else {
            UID = user.uid;
            fetchAdminData();
        }
    });

}

function fetchAdminData() {
    var db = firebase.firestore();

    db.collection("admins").doc(UID).get().then(function(doc) {
        console.log("Admin data: ", doc.data());
        ADMIN = doc.data();
        fetchTimingData();
    });
}


function fetchTimingData() {

    var collage = ADMIN.collage;
    var dataroot = "/collage/" + collage + "/other/";
    var db = firebase.firestore();

    db.collection(dataroot).doc("time").get().then(function(doc) {
        console.log("Current data: ", doc.data());
        values = doc.data().time;
        lec = values.length;
        prepareUI();
    });
}


function prepareUI() {

    var conFrom = document.getElementById("conFrom");


    for (a = 0; a < lec; a++) {
        var key = "key" + a;

        var node1 = document.createTextNode("");
        var opt1 = document.createElement(type);
        opt1.setAttribute('id', key);
        opt1.setAttribute('type', "time");
        opt1.setAttribute('onclick', "timechange()");
        opt1.appendChild(node1);
        conFrom.appendChild(opt1);
        document.getElementById(key).valueAsNumber = values[a] * 60000;
    }
}



function removeLast() {
    if (lec > 0) {
        lec--;
        var input = document.getElementById("key" + lec);
        input.parentNode.removeChild(input);
    }
}

function addNew() {

    var key = "key" + lec;
    values[lec] = 0;
    var node1 = document.createTextNode("");
    var opt1 = document.createElement(type);
    opt1.setAttribute('id', key);
    opt1.setAttribute('type', "time");
    opt1.setAttribute('onclick', "timechange()");
    opt1.appendChild(node1);
    conFrom.appendChild(opt1);
    document.getElementById(key).valueAsNumber = values[lec] * 60000;
    lec++;
}

function saveTimeData() {
    var ar = new Array();
    for (a = 0; a < lec; a++) {
        ar[a] = parseInt(document.getElementById("key" + a).valueAsNumber) / 60000;
    }
    firebase.firestore().collection("collage").doc(ADMIN.collage).collection("other").doc("time").set({
        time: ar,
        lastUpdated: new Date()
    }).then(function() {
        console.log("Document successfully written!");
        alert("Time updated successfully");
    });
}