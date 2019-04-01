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
    // Gernerate each announcement
    annoucements.forEach((item) => {
        generateEditElement(item[0], item[2], item[1], item[3], item[4]);
    });
    // Place all generated objects in the HTML
    placeElements();
});

/* Orders all the announcements bassed on their sort index */
function orderAnnouncements() {
    var unOrdered = annoucements;
    annoucements = [];
    unOrdered.forEach((item) => {
        annoucements[item[2]] = item;
    })
}

/* Draws elements to the screen */
function placeElements() {
    formattedAnnouncements.forEach((element) => {
        eventList.appendChild(element);
    })
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

    var orderElement = document.createElement("h3");
    var orderField = document.createElement("input");
    orderField.setAttribute("type", "number");
    orderField.setAttribute("id", "elementOrder");

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

    // Assign data to elements
    // Title
    titleElement.innerHTML = "Title";
    if (title != undefined) {
        titleField.value = title;
    }
    // Order
    orderElement.innerHTML = "Order";
    if (index != undefined) {
        orderField.value = index;
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
    annElement.appendChild(orderElement);
    annElement.appendChild(orderField);
    annElement.appendChild(dateElement);
    annElement.appendChild(dateField);
    annElement.appendChild(descriptionElement);
    annElement.appendChild(descriptionField);
    annElement.appendChild(deleteButton);

    // Add to event list
    formattedAnnouncements.push(annElement);
}

/* Check for any changes and applies the updates to the server */
function updateAnnouncements() {
    // var announcementElements = document.querySelectorAll(".announcements");

    // console.log(announcementElements);
    annoucements.forEach((item) => {
        var newData = [] //0=Has been changed, 1=Title, 2=Order, 3=Date, 4=Description
        newData[0] = false;

        var element = document.getElementById(item[0]);
        var elementTitle = element.querySelector("#elementTitle");
        var elementOrder = element.querySelector("#elementOrder");
        var elementDate = element.querySelector("#elementDate");
        var elementDescription = element.querySelector("#elementDescription");

        // Check to see what needs to be changed
        // Title
        if (elementTitle.value != item[1]) {
            console.log("Title for " + item[0] + " is different.");
            // Update element
            newData[1] = elementTitle.value;
            // Update status that it has been updated
            newData[0] = true;
        } else {
            // If no new data, just copy from the existing array
            newData[1] = item[1];
        }

        // Order
        if (elementOrder.value != item[2]) {
            console.log("Order for " + item[0] + " is different.");
            newData[2] = elementOrder.value;
            newData[0] = true
        } else {
            newData[2] = item[2];
        }

        // Date
        if (elementDate.value != item[3]) {
            console.log("Date for " + item[0] + " is different.");
            newData[3] = elementDate.value;
            newData[0] = true
        } else {
            newData[3] = item[3];
        }

        // Description
        if (elementDescription.value != item[4]) {
            console.log("Description for " + item[0] + " is different.");
            newData[4] = elementDescription.value;
            newData[0] = true
        } else {
            newData[4] = item[4];
        }

        // Check if there were any changes and push
        if (newData[0]) {
            pushToDatabase(item[0], newData[1], newData[2], newData[3], newData[4]);
        } else {
            console.log("No changes for " + item[0]);
        }
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

function deleteAnn(element) {
    if (confirm("Are you sure you want to delete?")) {
        db.doc(element).delete().then(() => {
            console.log("Finished deleting document");
            location.reload();
        }).catch((error) => {
            console.error("Unable to remove document: " + error);
        })
    }
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
        },
            3000);
    }).catch((error) => {
        console.error("There was a problem writing to the document: " + error);
    })
}