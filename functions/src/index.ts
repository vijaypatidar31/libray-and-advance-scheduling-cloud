import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { Timestamp } from '@google-cloud/firestore';
export const md5 = (contents: string) => crypto.createHash('md5').update(contents).digest("hex");

admin.initializeApp();

interface BookReg {
    bid: string;
    date: Timestamp;
    issuedBy: string;
}
interface BookDetail {
    name: string;
    author: string;
    total: number;
    available: number;
}
interface IssuedBookDetail {
    title: string,
    author: string,
    BookId: string,
    issueDate: Timestamp,
    submitDate: Timestamp
}
interface Student {
    name: string;
    email: string;
    password: string,
    branch: string,
    year: string
}
interface AnaliticsData {
    title: string,
    pointsSubmit: any,
    pointsIssued: any,
    totalSubmit: number,
    totalIssued: number

}
exports.updateBookRegDetail = functions.firestore.document('collage/{collage}/other/library/all-book/{barcode}').onUpdate((doc, context) => {
    //const old = doc.before.data();
    const newValue = <BookReg>doc.after.data();
    const oldValue = <BookReg>doc.before.data();
    const collage = context.params.collage;
    const bid: string = newValue.bid;
    // console.log("BOD =" + bid + " collag " + collage + " data " + newValue);
    const ref = admin.firestore().collection("collage").doc(collage).collection("other").doc("library").collection("book-detail").doc(bid);
    //managing counting of books
    ref.get().then(function (document) {
        if (document.exists) {
            const bookDetail = <BookDetail>document.data();
            //updating book detail depending on value of issuedBy value
            if (newValue.issuedBy.length === 0) {
                bookDetail.available++;
                updateAnaliticsData(true, collage);
            } else {
                bookDetail.available--;
                updateAnaliticsData(false, collage);
            }

            ref.update(bookDetail).then(function () {
                console.log("Book count updated bid = " + bid);
            }).catch(function (error) {
                console.error("Error writing document: ", error);
            });

            // bookk detail to student history
            if (newValue.issuedBy.length !== 0) {
                console.log("date============= " + newValue.date.toDate());
                const docId: string = md5(newValue.bid + "" + newValue.date.toDate());
                const newBook: IssuedBookDetail = {
                    title: bookDetail.name,
                    author: bookDetail.author,
                    issueDate: newValue.date,
                    submitDate: newValue.date,
                    BookId: newValue.bid
                };

                admin.firestore().collection("students").doc(newValue.issuedBy).collection("bookTransaction").doc(docId).set(newBook)
                    .then(function () {
                        console.log("book issued : book id " + bid);
                    }).catch(function (error) {
                        console.error("Error writing document: ", error);
                    });
            } else {
                const docId: string = md5(oldValue.bid + "" + oldValue.date.toDate());
                admin.firestore().collection("students").doc(oldValue.issuedBy).collection("bookTransaction").doc(docId).update({
                    submitDate: newValue.date
                }).then(function () {
                    console.log("book submited : book id " + bid);
                }).catch(function (error) {
                    console.error("Error writing document: ", error);
                });
            }
        } else {
            console.log("No such document! book detail not found");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });

});


exports.createStudentAccount = functions.firestore.document('collage/{collage}/temp/{tempID}').onCreate((doc, context) => {
    const st = <Student>doc.data();
    const collage = context.params.collage;
    admin.auth().createUser({
        email: st.email,
        emailVerified: true,
        password: st.password,
        displayName: st.name,
        disabled: false
    }).then(userData => {
        // add student detail
        admin.firestore().collection("students").doc(userData.uid).set({
            name: st.name,
            email: st.email,
            collage: collage,
            branch: st.branch,
            batch: null,
            year: st.year
        }).then(function () {
            console.log("new student created " + st.email);
            admin.firestore().collection("collage").doc(context.params.collage).collection("temp")
                .doc(context.params.tempID).delete().then(function () {
                    console.log("temp data deleted " + st.email);
                }).catch(error => {
                    console.log(error);
                });
        }).catch(error => {
            console.log(error);
        });
    }).catch(error => {
        console.log(error);
    });
});

function updateAnaliticsData(isSubmit: boolean, collage: string) {
    console.log("updateAnaliticsData====================== called");
    const date = new Date();
    const key = "month" + date.getMonth() + "year" + date.getFullYear();
    const index = date.getUTCDate();
    admin.firestore().collection("collage").doc(collage).collection("other").doc("library")
        .collection("analitics").doc(key).get().then(function (doc) {
            if (doc.data()) {
                const data = <AnaliticsData>doc.data();
                if (isSubmit) {
                    const value: number = data.pointsSubmit["m" + index] || 0;
                    data.pointsSubmit["d" + index] = value + 1;
                    data.totalSubmit++;
                } else {
                    const value1: number = data.pointsIssued["m" + index] || 0;
                    data.pointsIssued["d" + index] = value1 + 1;
                    data.totalIssued++;
                }
                admin.firestore().collection("collage").doc(collage).collection("other").doc("library")
                    .collection("analitics").doc(key).set(data).then(function () {
                        console.log("analitics data creates " + key);
                    }).catch(function (error) {
                        console.error("Error creating analitics data", error);
                    });

            } else {
                createAnaliticsData(isSubmit, collage);
            }
        }).catch(function (error) {
            console.error("Error creating analitics data", error);
        });
}


function createAnaliticsData(isSubmit: boolean, collage: string) {
    console.log("createAnaliticsData =================  called isSubmit == " + isSubmit);
    const date = new Date();
    const MONTH=new Array("January","February","March","April","May","June","July","August","September","Octomer","November","December");
    const key = "month" + date.getMonth() + "year" + date.getFullYear();
    const index = date.getUTCDate();
    const data: AnaliticsData = {
        title: MONTH[date.getMonth()]+" "+date.getFullYear(),
        totalIssued: 0,
        totalSubmit: 0,
        pointsIssued: {},
        pointsSubmit: {}
    };
    if (isSubmit) {
        data.pointsSubmit["d" + index] = 1;
        data.totalSubmit++;
    } else {
        data.pointsIssued["d" + index] = 1;
        data.totalIssued++;
    }
    admin.firestore().collection("collage").doc(collage).collection("other").doc("library")
        .collection("analitics").doc(key).set(data).then(function () {
            console.log("analitics data creates " + key);
        }).catch(function (error) {
            console.error("Error creating analitics data", error);
        });
}