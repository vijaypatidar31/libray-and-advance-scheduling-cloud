var password = "12345";
var Admin = {};
var collage = "";
var UID = "";
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
        collage = ADMIN.collage;
        prepareOption("year", ADMIN.year);
        prepareOption("branch", ADMIN.branch);
        prepareOption("batch", ADMIN.batch);
    });
}

function CreateAccount() {
    var rows = document.getElementById("students").rows;
    var year = document.getElementById("year").value;
    var branch = document.getElementById("branch").value;
    password = collage + "@12345"
    alert("default password is " + password);
    console.log("row length = " + rows.length);
    var db = firebase.firestore().collection("collage").doc(ADMIN.collage).collection("temp");

    const batch = firebase.firestore().batch();

    for (a = 1; a < rows.length; a++) {
        var name = rows[a].cells[0].innerText;
        var email = rows[a].cells[1].innerText;
        // console.log(name + " " + email);

        var sfRef = db.doc(email);
        batch.set(sfRef, {
            name: name,
            email: email,
            password: password,
            branch: branch,
            year: year
        });
    }

    batch.commit().then(function() {
        alert("All accounts will be created in within 1 hour");
    });
}

function addRow() {
    var table = document.getElementById("students");

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(table.rows.length);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    // Add some text to the new cells:
    cell1.setAttribute("contenteditable", true);
    cell2.setAttribute("contenteditable", true);
    cell3.innerHTML = "remove";
    resetDeleteindex();
}

function deleteRow(a) {
    document.getElementById("students").deleteRow(a);
    resetDeleteindex();
}

function resetDeleteindex() {
    var rows = document.getElementById("students").rows;
    console.log("row length = " + rows.length);
    for (a = 1; a < rows.length; a++) {
        rows[a].cells[2].setAttribute("onclick", "deleteRow(" + a + ")");
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