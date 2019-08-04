var ADMIN = {};
var lec = 0;
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

function prepareUI() {
    for (var a = 0; a < lec; a++) {

        //text to link with textarea
        var node1 = document.createTextNode("");
        var node2 = document.createTextNode("");
        var node3 = document.createTextNode("");
        var node4 = document.createTextNode("");
        var node5 = document.createTextNode("");
        var node6 = document.createTextNode("");

        var nodefrom = document.createTextNode("");



        var pfrom = document.createElement("textarea");
        pfrom.setAttribute('Id', "t" + getId(0, a));
        pfrom.setAttribute('class', "timeFrom");
        pfrom.appendChild(nodefrom);

        var p1 = document.createElement("textarea");
        p1.setAttribute('Id', getId(1, a));
        p1.appendChild(node1);

        var p2 = document.createElement("textarea");
        p2.setAttribute('Id', getId(2, a));
        p2.appendChild(node2);

        var p3 = document.createElement("textarea");
        p3.setAttribute('Id', getId(3, a));
        p3.appendChild(node3);

        var p4 = document.createElement("textarea");
        p4.setAttribute('Id', getId(4, a));
        p4.appendChild(node4);

        var p5 = document.createElement("textarea");
        p5.setAttribute('Id', getId(5, a));
        p5.appendChild(node5);

        var p6 = document.createElement("textarea");
        p6.setAttribute('Id', getId(6, a));
        p6.appendChild(node6);



        var div1 = document.getElementById("day1");

        var div2 = document.getElementById("day2");

        var div3 = document.getElementById("day3");

        var div4 = document.getElementById("day4");

        var div5 = document.getElementById("day5");

        var div6 = document.getElementById("day6");

        var divfrom = document.getElementById("from");

        //adding the paragraph to the div

        div1.appendChild(p1);
        div2.appendChild(p2);
        div3.appendChild(p3);
        div4.appendChild(p4);
        div6.appendChild(p6);
        div5.appendChild(p5);
        from.appendChild(pfrom);
    }


}

function getId(day, lec) {
    // console.log("id == " + "day" + day + "lec" + lec);
    return "day" + day + "lec" + lec;
}

function upload() {

    var collage = ADMIN.collage;
    var branch = document.getElementById("branch").value;
    var batch = document.getElementById("batch").value;
    var year = document.getElementById("year").value;
    var type = document.getElementById("type").value;

    var dataroot = "/collage/" + collage + "/year/" + year + "/branch/" + branch + "/batch";

    var db = firebase.firestore();
    var docData = {};
    for (d = 1; d < 7; d++) {
        for (l = 0; l < lec; l++) {
            var key = getId(d, l);
            var value = document.getElementById(key).value;
            docData[key] = value;
        }
    }
    db.collection(dataroot).doc(batch).get().then(function(doc) {
        console.log("Current data: ", doc.data());
        var upload = {};
        if (doc.exists) upload = doc.data();

        upload[type] = docData;
        db.collection(dataroot).doc(batch).set(upload).then(function() {
            console.log("Document successfully written!");
            alert("success");
        });
    });
}

function fetch() {
    var collage = ADMIN.collage;
    var branch = document.getElementById("branch").value;
    var batch = document.getElementById("batch").value;
    var year = document.getElementById("year").value;
    var type = document.getElementById("type").value;



    var dataroot = "/collage/" + collage + "/year/" + year + "/branch/" + branch + "/batch";

    var db = firebase.firestore();
    var docData = {};

    db.collection(dataroot).doc(batch).get().then(function(doc) {
        console.log("Current data: ", doc.data());
        var upload = doc.data();
        docData = upload[type];
        for (d = 1; d < 7; d++) {
            for (l = 0; l < lec; l++) {
                var key = getId(d, l);
                var value = docData[key];
                document.getElementById(getId(d, l)).innerHTML = value;
            }
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
        var upload = doc.data().time;
        lec = upload.length - 1;
        prepareUI();
        prepareOption("year", ADMIN.year);
        prepareOption("branch", ADMIN.branch);
        prepareOption("batch", ADMIN.batch);
        for (d = 0; d < lec; d++) {
            var key = getId(0, d);
            var value = upload[d];
            var nd = timeMinToStd(value) + " - " + timeMinToStd(upload[d + 1]);
            document.getElementById("t" + key).innerHTML = nd;
            document.getElementById("t" + key).readOnly = true;
        }
    });
}

function timeMinToStd(value) {
    var hour = parseInt(value / 60);
    var min = value % 60;
    var minString = "" + min;
    if (min < 10) minString = "0" + min;
    var hourString = "" + hour;

    if (hour > 12) {
        hour = hour - 12;
        if (hour < 10) hourString = "0" + hour;
        return hourString + ":" + minString + "PM";
    } else {
        if (hour < 10) hourString = "0" + hour;
        return hourString + ":" + minString + "AM";
    }
}

function prepareOption(id, values) {
    var select = document.getElementById(id);
    for (a = 0; a < values.length; a++) {
        var node = document.createTextNode(values[a]);
        var opt = document.createElement("option");
        opt.appendChild(node);
        select.appendChild(opt);
    }
}