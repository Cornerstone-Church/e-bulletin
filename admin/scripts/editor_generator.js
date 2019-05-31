// Firestore variables
const firestore = firebase.firestore();
var db = firestore.collection("announcements");

/* 
    Index:
    0 => ID
    1 => Title
    2 => Order
    3 => Date
    4 => Description
*/
var annoucements = [];

// An array that holds all formatted announcements
var formattedAnnouncements = [];

// Placeholder element
var eventList = document.querySelector("#events-placeholder");

// Fetch data from server
db.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        var document = [];
        var data = doc.data();
        var id = doc.id;
        var title = "";
        var order = "";
        var date = "";
        var description = "";

        // Check to make sure everything is filled out. If not leave blank
        if (data.title != undefined) {
            title = data.title;
        }
        if (data.sort != undefined) {
            order = data.sort;
        }
        if (data.date != undefined) {
            date = data.date;
        }
        if (data.description != undefined) {
            description = data.description;
        }
        document = [id, title, order, date, description];
        annoucements.push(document);
    })
    // Put the announcements in order bassed on their sort number
    orderAnnouncements();
    // Place all generated objects in the HTML
    placeElements();
});

/* Orders all the announcements bassed on their sort index */
function orderAnnouncements() {
    var unOrdered = annoucements;
    annoucements = [];
    unOrdered.forEach((item) => {
        annoucements[item[2]] = item;
    });
}

/* Draws elements to the screen */
function placeElements() {
    // Clear formatted announcements
    formattedAnnouncements = [];
    // Clear the UI List
    eventList.innerHTML = '';

    // Gernerate each announcement
    annoucements.forEach((item) => {
        generateEditElement(item[0], item[2], item[1], item[3], item[4]);
    });


    // Apply the formatted announcement as a child to the event list
    formattedAnnouncements.forEach((element) => {
        eventList.appendChild(element);
    })
}

/* Clears all the elements on the screen */
function clearElements() {
    var elements = document.querySelectorAll("#events-placeholder li");

    // Remove each html element
    elements.forEach((element) => {
        element.parentNode.removeChild(element);
    });

    // Clear the formatted announcements
    formattedAnnouncements = [];
}

/* Builds the structure and elements for each announcment */
function generateEditElement(id, index, title, date, description) {
    // Define all elements
    // Wrapper Element
    var annElement = document.createElement("li");
    annElement.setAttribute("id", id);

    // Child Elements
    var titleElement = document.createElement("h3");
    var titleField = document.createElement("input");
    titleField.setAttribute("placeholder", "Example Announcement");
    titleField.setAttribute("id", "elementTitle");

    var dateElement = document.createElement("h3");
    var dateField = document.createElement("input");
    dateField.setAttribute("placeholder", "April 1st | 7:00pm - 8:00pm");
    dateField.setAttribute("id", "elementDate");

    var descriptionElement = document.createElement("h3");
    var descriptionField = document.createElement("textarea");
    descriptionField.setAttribute("placeholder", "Description");
    descriptionField.setAttribute("id", "elementDescription");

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.setAttribute("onclick", "deleteAnn('" + id + "')");
    deleteButton.setAttribute("style", "color: red;");

    var moveUpButton = document.createElement("button");
    moveUpButton.innerHTML = "Move Up";
    moveUpButton.setAttribute("onclick", "moveAnnouncement('up', '" + id + "', " + index + ")");

    var moveDownButton = document.createElement("button");
    moveDownButton.innerHTML = "Move Down";
    moveDownButton.setAttribute("onclick", "moveAnnouncement('down', '" + id + "', " + index + ")");

    // Assign data to elements
    // Title
    titleElement.innerHTML = "Title";
    if (title != undefined) {
        titleField.value = title;
    }
    // Date
    dateElement.innerHTML = "Date";
    if (date != undefined) {
        dateField.value = date;
    }
    // Description
    descriptionElement.innerHTML = "Description";
    if (description != undefined) {
        descriptionField.value = description;
    }

    // Build Tree
    annElement.appendChild(titleElement);
    annElement.appendChild(titleField);
    annElement.appendChild(dateElement);
    annElement.appendChild(dateField);
    annElement.appendChild(descriptionElement);
    annElement.appendChild(descriptionField);
    annElement.appendChild(deleteButton);
    annElement.appendChild(moveUpButton);
    annElement.appendChild(moveDownButton);

    // Add to event list
    formattedAnnouncements.push(annElement);
}

/* Takes all changes and saves it to the array */
function updateAnnouncements() {
    var currentIndex = 0;
    var editorElementId = document.querySelectorAll("#events-placeholder li");
    var inputTitle = document.querySelectorAll("#elementTitle");
    var inputDate = document.querySelectorAll("#elementDate");
    var inputDescription = document.querySelectorAll("#elementDescription");

    annoucements.forEach((element) => {
        if (element[0] == editorElementId[currentIndex].id) {
            element[1] = inputTitle[currentIndex].value;
            element[3] = inputDate[currentIndex].value;
            element[4] = inputDescription[currentIndex].value;
        }
        currentIndex++;
    });
}

/* Creates a new announcement and stores it in the database */
function createAnnouncement() {
    // Create a new sort number
    var newSortNumber = annoucements.length;
    // Make sure number is not 0 when creating from scratch
    if (newSortNumber == 0) {
        newSortNumber++;
    }
    // Create temporary announcement
    var newAnnouncement = [undefined, undefined, newSortNumber, undefined, undefined];
    db.add({
        // Assign the sort order
        sort: newAnnouncement[2],
    }).then((docRef) => {
        console.log("Document Created");
        // Assign the ID to the new Announcement
        newAnnouncement[0] = docRef.id;
        // Add new announcement to array
        annoucements.push(newAnnouncement);
        // Generate the HTML element
        generateEditElement(newAnnouncement[0], newAnnouncement[2], newAnnouncement[1], newAnnouncement[3], newAnnouncement[4]);
        // Re-draw
        placeElements();
    }).catch((error) => {
        console.error("Unable to create document: " + error);
    })
}

/* Change the order of the annoncements */
function moveAnnouncement(direction, id, index) {
    updateAnnouncements();
    if (direction == "up") {
        // Make sure element is not the top element
        if (index != 1) {
            var firstElement = annoucements[index];
            var secondElement = annoucements[index - 1];

            // Remove the two elements
            annoucements.splice(index - 1, 2);

            // Swap the index numbers
            firstElement[2] = index - 1;
            secondElement[2] = index;

            // Add elements back in
            annoucements.push(firstElement);
            annoucements.push(secondElement);

            // Order the announcements
            orderAnnouncements();

            clearElements();
            placeElements();
        }

    } else if (direction == "down") {
        // Make sure its not the bottom element
        if (index != annoucements.length) {
            var firstElement = annoucements[index];
            var secondElement = annoucements[index + 1];

            // Remove the two elements
            annoucements.splice(index, 2);

            // Swap the index numbers
            firstElement[2] = index + 1;
            secondElement[2] = index;

            // Add elements back in
            annoucements.push(firstElement);
            annoucements.push(secondElement);

            // Order the announcements
            orderAnnouncements();

            clearElements();
            placeElements();
        }
    } else {
        console.error("Invalid direction to move announcement.");
    }
}

/* Deletes an announcement */
function deleteAnn(element) {
    if (confirm("Are you sure you want to delete? This action will be applied live to the bulletin.")) {
        db.doc(element).delete().then(() => {
            console.log("Finished deleting document");
            location.reload();
        }).catch((error) => {
            console.error("Unable to remove document: " + error);
        })
    }
}

function publishAnnouncements() {
    updateAnnouncements();
    annoucements.forEach((element) => {
        pushToDatabase(element[0], element[1], element[2], element[3], element[4]);
    })
}

/* Push changes to the database */
function pushToDatabase(id, localTitle, localOrder, localDate, localDescription) {
    var statusElement = document.getElementById("update-status");
    
    db.doc(id).set({
        title: localTitle,
        sort: localOrder,
        date: localDate,
        description: localDescription
    }).then(() => {
        console.log("Document written!");
        // Update the status
        statusElement.innerHTML = "Updated"

        // Reload the preview
        var iframe = document.getElementById("events-preview");
        iframe.src = iframe.src;

        // Clear the status
        setTimeout(() => {
            statusElement.innerHTML = "";
        }, 3000);
    }).catch((error) => {
        console.error("There was a problem writing to the document: " + error);
    })
}