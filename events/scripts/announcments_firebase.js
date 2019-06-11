// Create firestore variable
var firestore = firebase.firestore();

// Announcment List element (the <ul>)
var announcementList = document.querySelector("#announcment-section");

// An array that will hold the announcments in the right order
var announcementsOrdered = [];

// Finds the database to read
var db = firestore.collection("announcements-beta");
// Pull all docs in the database and reads each one.
// Will cal the generateElement function with data recieved.

function getData() {
    db.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            var title = data.title;
            var subtitle = data.subtitle;
            var description = data.description;

            // Send to the generator to create the HTML layout
            generateElement(title, subtitle, description, data.order);
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
function generateElement(title, subtitle, description, sort) {
    // Define the elements to generate
    const listElement = document.createElement("li");
    const titleElement = document.createElement("h2");
    const subtitleElement = document.createElement("div");
    const descriptionElement = document.createElement("p");

    // Assign text to each element
    titleElement.innerHTML = title;
    subtitleElement.innerHTML = subtitle;
    descriptionElement.innerHTML = description;

    // Add subtitle class to subtitleElement
    subtitleElement.setAttribute("class", "subtitle");

    // Set up list structure
    listElement.appendChild(titleElement);
    listElement.appendChild(subtitleElement);
    listElement.appendChild(descriptionElement)

    announcementsOrdered[sort] = listElement;
}