// Create firestore variable
var firestore = firebase.firestore();

// Announcment List element (the <ul>)
var announcementList = document.querySelector("#announcment-section");

// An array that will hold the announcments in the right order
var announcementsOrdered = [];

// Finds the database to read
var db = firestore.collection("announcements");
// Pull all docs in the database and reads each one.
// Will cal the generateElement function with data recieved.

function getData() {
    console.log("Called")
    db.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            var title = "";
            var date = "";
            var description = "";

            // Check to make sure everything is filled out. If not leave blank
            if (data.title != undefined) {
                title = data.title;
            }
            if (data.date != undefined) {
                date = data.date;
            }
            if (data.description != undefined) {
                description = data.description;
            }

            // Send to the generator to create the HTML layout
            generateElement(title, date, description, data.sort);
        }),
        // After all data is fetched draw it
        drawData();
    })
}

function drawData() {
    // Go through the sorted array and place each one in the ul
    announcementsOrdered.forEach((element) => {
        announcementList.appendChild(element);
    });
}


// Generates the HTML layout for the announcment passed to it
function generateElement(title, date, description, sort) {
    // Define the elements to generate
    const listElement = document.createElement("li");
    const titleElement = document.createElement("h2");
    const dateElement = document.createElement("div");
    const descriptionElement = document.createElement("p");

    // Assign text to each element
    titleElement.innerHTML = title;
    dateElement.innerHTML = date;
    descriptionElement.innerHTML = description;

    // Add date class to dateElement
    dateElement.setAttribute("class", "date");

    // Set up list structure
    listElement.appendChild(titleElement);
    listElement.appendChild(dateElement);
    listElement.appendChild(descriptionElement)


    var index = sort - 1;
    announcementsOrdered[index] = listElement;
}