import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

interface BookReg {
    bid: string;
    date: Date;
    issuedBy: string;
}
interface BookDetail {
    name: string;
    author: string;
    total: number;
    available: number;
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
            } else {
                bookDetail.available--;
            }

            ref.update(bookDetail).then(function () {
                console.log("Document successfully written! -- ");
            }).catch(function (error) {
                console.error("Error writing document: ", error);
            });
        } else {
            console.log("No such document! book detail not found");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });

    if (newValue.issuedBy.length !== 0) {
        admin.firestore().collection("students").doc(newValue.issuedBy).update({
            isssuedBooks: admin.firestore.FieldValue.arrayUnion(newValue.bid)
        }).then(function () {
            console.log("book issued : book id " + bid);
        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });;
    } else {
        admin.firestore().collection("students").doc(oldValue.issuedBy).update({
            isssuedBooks: admin.firestore.FieldValue.arrayRemove(oldValue.bid)
        }).then(function () {
            console.log("book submited : book id " + bid);
        }).catch(function (error) {
            console.error("Error writing document: ", error);
        });;
    }


});


