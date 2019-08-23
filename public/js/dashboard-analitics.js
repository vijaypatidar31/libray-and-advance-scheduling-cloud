var Admin = {};
var collage = "";
var UID = "";
var mounths;
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
        // getChartData();
        getAllMonthData();
    });
}

function getAllMonthData() {
    firebase.firestore().collection("collage").doc(collage).collection("other").doc("library")
        .collection("analitics").get().then(function(querySnapshot) {
            mounths = {};
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                mounths[doc.id] = doc.data();
            });
            const date = new Date();
            var key = "month" + date.getMonth() + "year" + date.getFullYear();
            console.log("key ========= " + key);
            drawChartOfMounth(mounths[key]);
            drawChartOfYear(mounths);
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}

// function getChartData() {
//     var db = firebase.firestore();
//     var date = new Date();
//     var key = "mounth" + date.getMonth() + "year" + date.getFullYear();
//     const index = date.getDay();
//     db.collection("collage").doc(collage).collection("other").doc("library")
//         .collection("analitics").doc(key).get().then(function(doc) {
//             var data = doc.data();
//             drawChartOfMounth(data);
//         });
// }

function drawChartOfMounth(data) {

    if (data) {


        var title = data.title;
        var pointsData = [];
        var pointsData1 = [];

        for (a = 0; a < 31; a++) {
            let yValue = data.pointsIssued["d" + a] || 0;
            pointsData.push({ label: a + 1, y: yValue });
            let yValue1 = data.pointsSubmit["d" + a] || 0;
            pointsData1.push({ label: a + 1, y: yValue1 });
        }

        console.log(pointsData);
        var chart = new CanvasJS.Chart("chartContainerMonth", {
            animationEnabled: true,
            theme: "light2",
            title: {
                text: title
            },
            axisY: {
                includeZero: false
            },
            data: [{
                type: "line",
                showInLegend: true,
                name: "Book Issued " + data.totalIssued,
                color: "#F08080",
                dataPoints: pointsData
            }, {
                type: "line",
                showInLegend: true,
                name: "Book Submitted " + data.totalSubmit,
                color: "#DD8ed0",
                dataPoints: pointsData1
            }]
        });
        chart.render();

    } else {
        console.log("no data for graph");
        document.getElementById("chartContainerMonth").innerText = "No data for graph";
    }
}

function drawChartOfYear(data) {

    if (data) {


        const date = new Date();
        const MONTH = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "Octomer", "November", "December");

        var title = "Year " + date.getFullYear();
        var pointsData = [];
        var pointsData1 = [];

        var totalIssued = 0;
        var totalSubmit = 0;

        for (a = 0; a < 12; a++) {
            var key = "month" + a + "year" + date.getFullYear();
            let yValue;
            if (data[key]) yValue = data[key].totalIssued || 0;
            else yValue = 0;
            totalIssued = totalIssued + yValue;
            pointsData.push({ label: MONTH[a], y: yValue });
        }
        for (a = 0; a < 12; a++) {
            var key = "month" + a + "year" + date.getFullYear();
            let yValue;
            if (data[key]) yValue = data[key].totalSubmit || 0;
            else yValue = 0;
            totalSubmit = totalSubmit + yValue;
            pointsData1.push({ label: MONTH[a], y: yValue });
        }

        console.log(pointsData);
        var chart = new CanvasJS.Chart("chartContainerYear", {
            animationEnabled: true,
            theme: "light2",
            title: {
                text: title
            },
            axisY: {
                includeZero: false
            },
            data: [{
                type: "line",
                showInLegend: true,
                name: "Book Issued " + totalIssued,
                color: "#F08080",
                dataPoints: pointsData
            }, {
                type: "line",
                showInLegend: true,
                name: "Book Submitted " + totalSubmit,
                color: "#DD8ed0",
                dataPoints: pointsData1
            }]
        });
        chart.render();

    } else {
        console.log("no data for graph");
        document.getElementById("chartContainerYear").innerHTML = "no data for graph";
    }
}