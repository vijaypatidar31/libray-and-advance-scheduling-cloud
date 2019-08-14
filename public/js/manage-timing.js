var ADMIN = {};
var values;
var lec = 1;
var UID = "uid";
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
        if (doc.exits) {
            console.log("Current data: ", doc.data());
            values = doc.data().time;
            lec = values.length;
        }
        prepareUI();
    });
}


function prepareUI() {

    var type = "input";
    var conFrom = document.getElementById("conFrom");
    var conTo = document.getElementById("conTo");

    var node = document.createTextNode(values[0]);
    var opt = document.createElement(type);
    opt.setAttribute('id', "key0");
    opt.setAttribute('type', "time");
    opt.appendChild(node);
    conFrom.appendChild(opt);
    document.getElementById("key0").valueAsNumber = values[0] * 60000;


    for (a = 1; a < lec - 1; a++) {
        var key = "key" + a;
        ///from    
        var node = document.createTextNode("");
        var opt = document.createElement(type);
        opt.setAttribute('id', "f" + key);
        opt.setAttribute('type', "time");
        opt.appendChild(node);
        conFrom.appendChild(opt);
        document.getElementById("f" + key).valueAsNumber = values[a] * 60000;
        document.getElementById("f" + key).readOnly = true;

        ///to    
        var node1 = document.createTextNode("");
        var opt1 = document.createElement(type);
        opt1.setAttribute('id', key);
        opt1.setAttribute('type', "time");
        opt1.setAttribute('onclick', "timechange()");
        opt1.appendChild(node1);
        conTo.appendChild(opt1);
        document.getElementById(key).valueAsNumber = values[a] * 60000;
    }

    var opt = document.createElement(type);
    opt.setAttribute('id', "key" + (lec - 1));
    opt.setAttribute('type', "time");
    conTo.appendChild(opt);
    document.getElementById("key" + (lec - 1)).valueAsNumber = values[lec - 1] * 60000;
}


function timechange() {
    for (q = 1; q < lec - 1; q++) {
        document.getElementById("fkey" + q).valueAsNumber = document.getElementById("key" + q).valueAsNumber;
    }
}

function removeLast() {
    if (lec > 0) {
        lec--;
        var input = document.getElementById("key" + lec);
        input.parentNode.removeChild(input);

        var inputF = document.getElementById("fkey" + (lec - 1));
        inputF.parentNode.removeChild(inputF);
    }
}

function addNew() {
    lec++;
    var node = document.createTextNode("");
    var opt = document.createElement("input");
    opt.setAttribute('id', "fkey" + (lec - 2));
    opt.setAttribute('type', "time");
    opt.appendChild(node);
    conFrom.appendChild(opt);
    document.getElementById("fkey" + (lec - 2)).readOnly = true;

    ///to    
    var node1 = document.createTextNode("");
    var opt1 = document.createElement("input");
    opt1.setAttribute('id', "key" + (lec - 1));
    opt1.setAttribute('type', "time");
    opt1.setAttribute('onclick', "timechange()");
    opt1.appendChild(node1);
    conTo.appendChild(opt1);
    timechange();

}

function saveTimeData() {
    var ar = new Array();
    for (a = 0; a < lec; a++) {
        ar[a] = parseInt(document.getElementById("key" + a).valueAsNumber) / 60000;
    }
    alert(ar);
}