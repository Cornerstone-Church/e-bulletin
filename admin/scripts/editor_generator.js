// Firestore variables
const firestore = firebase.firestore();
var db = firestore.collection("announcements-beta");
var statusDelay = 3000; // In Milliseconds

/* 
    Index:
    0 => ID
    1 => Order
    2 => Title
    3 => Subtitle
    4 => Description
*/
var annoucements = [
    { id: 'FakeID', order: 0, title: 'Fake Title', subtitle: 'Some Date', buttonLink: '', description: 'Fake Description' },
];
// An array that holds all formatted announcements
var formattedAnnouncements = [];

var isNewAnn = false;
var editingId = '';

// Document Elements
var eventList = document.querySelector("#events-placeholder");
var updateStatus = document.getElementById('update-status');
var updateButton = document.getElementById('update-button');

// Editor
var eewWrapper = document.getElementById('eew-wrapper');
var closeButton = document.getElementById('eew-close-button')
var checkbox = document.getElementById('checkbox-button');
var discardButton = document.getElementById('discard-button');
var saveButton = document.getElementById('save-button');

var titleInput = document.getElementById('title-input');
var subtitleInput = document.getElementById('subtitle-input');
var buttonLink = document.getElementById('button-link');
var descriptionInput = document.getElementById('description-input');


// ON LOAD CODE
updateDisplay();

// Listeners
checkbox.addEventListener('mousedown', (event) => {
    if (!checkbox.checked) {
        buttonLink.classList.remove('dissabled');
        buttonLink.toggleAttribute('disabled');
    } else {
        buttonLink.classList.add('dissabled');
        buttonLink.toggleAttribute('disabled');
    }
});

closeButton.addEventListener('mousedown', () => {
    closeEditWindow(false);
});

discardButton.addEventListener('mousedown', () => {
    closeEditWindow(false);
});

saveButton.addEventListener('mousedown', () => {
    var isValid = true;
    var tempAnn = { id: '', order: 0, title: '', subtitle: '', buttonLink: '', description: '' };

    if (titleInput.value == '') {
        isValid = false;
        alert('Please enter a title.');
    } else if (descriptionInput.value == '') {
        isValid = false;
        alert('Please enter a description.');
    }

    if (isValid) {
        if (isNewAnn) {
            tempAnn.id = makeid(15);
            tempAnn.order = annoucements.length;
            tempAnn.title = titleInput.value;
            tempAnn.subtitle = subtitleInput.value;
            tempAnn.buttonLink = buttonLink.value;
            tempAnn.description = descriptionInput.value;

            annoucements.push(tempAnn);
            closeEditWindow(true);
            updateDisplay();
        } else {
            annoucements.forEach((e) => {
                if (e.id == editingId) {
                    e.title = titleInput.value;
                    e.subtitle = subtitleInput.value;
                    e.description = descriptionInput.value;
                }
            });
            closeEditWindow(true);
            updateDisplay();
        }
    }
});

updateButton.addEventListener('mousedown', () => {
    updateServer();
})


// Will create a list item and return it as a <li>
function createListItem(id, title) {
    var listItem = document.createElement('li');
    var titleElement = document.createElement('h1');
    var upElement = document.createElement('img');
    var downElement = document.createElement('img');
    var trashElement = document.createElement('img');

    // Assign the item ID to the actual list item
    listItem.setAttribute('id', id);

    // Set the title
    titleElement.innerHTML = title;

    // Give up, down, and trash the class 'icon'
    upElement.setAttribute('class', 'icon');
    downElement.setAttribute('class', 'icon');
    trashElement.setAttribute('class', 'icon');

    // Assign on click elements
    titleElement.setAttribute('onclick', "editWindow('" + id + "')");
    upElement.setAttribute('onclick', "moveAnnouncement('" + id + "', 'up')");
    downElement.setAttribute('onclick', "moveAnnouncement('" + id + "', 'down')");
    trashElement.setAttribute('onclick', "deleteAnnouncement('" + id + "')");

    // Assign image file
    upElement.setAttribute('src', '/ref/events_page/admin/up-icon.png');
    downElement.setAttribute('src', '/ref/events_page/admin/down-icon.png');
    trashElement.setAttribute('src', '/ref/events_page/admin/trashcan-icon.png');

    // Add elements to list item
    listItem.appendChild(titleElement);
    listItem.appendChild(upElement);
    listItem.appendChild(downElement);
    listItem.appendChild(trashElement);

    // Return finished list item
    return listItem;
}

function createAnnouncement() {
    editWindow();
}

function openAnnouncement(id) {
    alert('Opening: ' + id);
}

function moveAnnouncement(id, direction) {
    switch (direction) {
        case 'up': {
            var movedAnn;
            var beforeAnn;

            // Move the announcement
            for (i = 0; i < annoucements.length; i++) {
                // Prevents the first item from being moved up
                if (i != 0) {
                    // Query
                    if (id == annoucements[i].id) {
                        movedAnn = annoucements[i];
                        beforeAnn = annoucements[i - 1];
    
                        annoucements[i - 1] = movedAnn;
                        annoucements[i] = beforeAnn;
                        break;
                    }
                }
            }

            // Update the order variable
            for (i = 0; i < annoucements.length; i++) {
                annoucements[i].order = i;
            }

            updateDisplay();
            break;
        }
        case 'down': {
            var movedAnn;
            var afterAnn;


            // Move the announcement
            for (i = 0; i < annoucements.length; i++) {
                // Prevents the element from being moved down if last
                if (i != (annoucements.length - 1)) {
                    // Query
                    if (id == annoucements[i].id) {
                        movedAnn = annoucements[i];
                        afterAnn = annoucements[i + 1];
    
                        annoucements[i + 1] = movedAnn;
                        annoucements[i] = afterAnn;
    
                        break;
                    }
                }
            }

            // Update the order variable
            for (i = 0; i < annoucements.length; i++) {
                annoucements[i].order = i;
            }

            updateDisplay();
            break;
        }
        default: {
            alert('Unknown direction to move announcememnt. Please contact developer with details.');
        }
    }
}

function deleteAnnouncement(id) {
    var message = confirm("Are you sure you want to delete?");

    // Parse announcement and when the ID matches remove the item at that index
    if (message) {
        for (i = 0; i < annoucements.length; i++) {
            if (annoucements[i].id == id) {
                annoucements.splice(i, 1);
            }
        }
        updateDisplay();
    }
}

function editWindow(id) {
    if (id == null) {
        // New Announcement

        // Dissable Button Link
        checkbox.checked = false;
        buttonLink.disabled = true;
        buttonLink.classList.add('dissabled');

        eewWrapper.style.display = 'block';
        isNewAnn = true;

        // All definitions are in the Save button listener
    } else {
        // Editor
        isNewAnn = false;
        var editAnn;
        annoucements.forEach((ann) => {
            if (ann.id == id) {
                editingId = ann.id;
                editAnn = ann;
            }
        });

        titleInput.value = editAnn.title;
        subtitleInput.value = editAnn.subtitle;

        // Check to see if there is a button link
        // If so fill it in and enable it
        if (editAnn.buttonLink != '') {
            checkbox.checked = true;

            // Enable button Link
            buttonLink.classList.remove('dissabled');
            buttonLink.disabled = false;
            buttonLink.value = editAnn.buttonLink;
        } else {
            // Dissable Button Link
            checkbox.checked = false;
            buttonLink.disabled = true;
            buttonLink.classList.add('dissabled');
        }



        descriptionInput.value = editAnn.description;

        eewWrapper.style.display = 'block';
    }
}

function closeEditWindow(saved) {
    if (saved) {
        eewWrapper.style.display = 'none';
        titleInput.value = '';
        subtitleInput.value = '';
        checkbox.checked = false;
        buttonLink.value = '';
        descriptionInput.value = '';
    } else {
        if (confirm('Changes will not be saved. Are you sure?')) {
            eewWrapper.style.display = 'none';
            titleInput.value = '';
            subtitleInput.value = '';
            checkbox.checked = false;
            buttonLink.value = '';
            descriptionInput.value = '';
        }
    }
}

function updateDisplay() {
    // Clear the display
    eventList.innerHTML = "";
    // Draw announcements to screen
    annoucements.forEach((element) => {
        eventList.appendChild(createListItem(element.id, element.title));
    })
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function updateServer() {
    db.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            db.doc(doc.id).delete().then(() => {
                console.log('Removing old document.');
            })
        });

        annoucements.forEach((e) => {
            db.doc(e.id).set({
                title: e.title,
                subtitle: e.subtitle,
                order: e.order,
                buttonLink: e.buttonLink,
                description: e.description
            })
        });
        statusMessage('Updated');
    });

}

// Displays a status message at the bottom of the screen
function statusMessage(message) {
    updateStatus.innerHTML = message;
    setTimeout(() => {
        updateStatus.innerHTML = '';
    }, statusDelay);
}

// Fetch data from server
// function getData() {
//     db.get().then((querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//             var document = [];
//             var data = doc.data();
//             var id = doc.id;
//             var title = "";
//             var order = "";
//             var date = "";
//             var description = "";

//             // Check to make sure everything is filled out. If not leave blank
//             if (data.title != undefined) {
//                 title = data.title;
//             }
//             if (data.sort != undefined) {
//                 order = data.sort;
//             }
//             if (data.date != undefined) {
//                 date = data.date;
//             }
//             if (data.description != undefined) {
//                 description = data.description;
//             }
//             document = [id, title, order, date, description];
//             annoucements.push(document);
//         })
//     });
// }