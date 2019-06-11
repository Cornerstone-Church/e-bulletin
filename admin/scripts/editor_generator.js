/**
 * @author: Silent Sonata
 * @version: 1.0
 * @description: Script that manages and allows the user to edit the E-Bulletin.
 */

// Firestore variables
const firestore = firebase.firestore();
var db = firestore.collection("announcements-beta");
var statusDelay = 3000; // In Milliseconds

// Variable for all the announcements
var annoucements = [];
// An array that holds all formatted announcements
var formattedAnnouncements = [];

var isNewAnn = false;
var editingId = '';

var iframePreview = document.getElementById('events-preview');

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
getServer();

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
    // Close window saying changes are not saved
    closeEditWindow(false);
});

discardButton.addEventListener('mousedown', () => {
    // Close window saying changes are not saved
    closeEditWindow(false);
});

saveButton.addEventListener('mousedown', () => {
    // Bool that stays true unless form is not valid
    var isValid = true;

    var tempAnn = { id: '', order: 0, title: '', subtitle: '', buttonLink: '', description: '' };

    // Validators
    if (titleInput.value == '') {
        isValid = false;
        alert('Please enter a title.');
    } else if (descriptionInput.value == '') {
        isValid = false;
        alert('Please enter a description.');
    }

    // If valid is true
    if (isValid) {
        if (isNewAnn) {
            // If the editor is creating a new announcement
            tempAnn.id = makeid(15);
            tempAnn.order = annoucements.length;
            tempAnn.title = titleInput.value;
            tempAnn.subtitle = subtitleInput.value;
            tempAnn.buttonLink = buttonLink.value;
            tempAnn.description = descriptionInput.value;

            annoucements.push(tempAnn);
            closeEditWindow(true);

            // Update viewport
            updateDisplay();
        } else {
            // Editing an existing announcement
            annoucements.forEach((e) => {
                if (e.id == editingId) {
                    e.title = titleInput.value;
                    e.subtitle = subtitleInput.value;
                    e.description = descriptionInput.value;
                }
            });
            // Close window stating changes are saved
            closeEditWindow(true);
            // Update viewport
            updateDisplay();
        }
    }
});

updateButton.addEventListener('mousedown', () => {
    updateServer();
})


/** Will create a list item and return it as a <li>
 * @param {String} id - The ID of the announcement
 * @param {String} title - The title of the item
 */
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

/** Called to create a new announcement */
function createAnnouncement() {
    editWindow();
}

/** Change the order of each announcement
 * Accepts the id of the announcement to move and the direction of it
 * @param {String} id - Announcement ID
 * @param {String} direction - The direction of the move. (up/down)
 */
function moveAnnouncement(id, direction) {
    switch (direction) {
        // Moving up
        case 'up': {
            // Store the moving announcement
            var movedAnn;
            // Store the announcment above it
            var beforeAnn;

            // Move the announcement
            for (i = 0; i < annoucements.length; i++) {
                // Prevents the first item from being moved up
                if (i != 0) {
                    // Query
                    if (id == annoucements[i].id) {
                        // Assign the real ann to temporary ones
                        movedAnn = annoucements[i];
                        beforeAnn = annoucements[i - 1];

                        // Swap their positions
                        annoucements[i - 1] = movedAnn;
                        annoucements[i] = beforeAnn;
                        break;
                    }
                }
            }

            // Re-calculate the order variable in each announcement (Not sure if we use this still)
            for (i = 0; i < annoucements.length; i++) {
                annoucements[i].order = i;
            }

            // Redraw viewport
            updateDisplay();
            break;
        }

        // Moving Down
        case 'down': {
            // Temporary Assignmnets
            var movedAnn;
            var afterAnn;

            // Move the announcement
            for (i = 0; i < annoucements.length; i++) {
                // Prevents the element from being moved down if last
                if (i != (annoucements.length - 1)) {
                    // Query
                    if (id == annoucements[i].id) {
                        // Assign to temporary variables
                        movedAnn = annoucements[i];
                        afterAnn = annoucements[i + 1];

                        // Swap ann positions
                        annoucements[i + 1] = movedAnn;
                        annoucements[i] = afterAnn;

                        break;
                    }
                }
            }

            // Re-calculate the order variable in each ann
            for (i = 0; i < annoucements.length; i++) {
                annoucements[i].order = i;
            }

            // Redraw viewport
            updateDisplay();
            break;
        }
        // Called if the direction is anything else
        default: {
            alert('Unknown direction to move announcememnt. Please contact developer with details.');
        }
    }
}

/** Removes the announcemnt of the given id 
 * @param {String} id - ID of the Announcement to remove
 */
function deleteAnnouncement(id) {
    var message = confirm("Are you sure you want to delete?");

    // Parse announcement and when the ID matches remove the item at that index
    if (message) {
        for (i = 0; i < annoucements.length; i++) {
            if (annoucements[i].id == id) {
                annoucements.splice(i, 1);
            }
        }
        // Redraw Viewport
        updateDisplay();
    }
}

/** Open edit window
 * If the @id is empty then it will create a new announcement
 * @param {String} id - The id of the ann to edit
 */
function editWindow(id) {
    if (id == null) {
        // New Announcement

        // Dissable Button Link
        checkbox.checked = false;
        buttonLink.disabled = true;
        buttonLink.classList.add('dissabled');

        // Show window
        eewWrapper.style.display = 'block';
        // Sets save button to new announcement mode
        isNewAnn = true;

        // All definitions are in the Save button listener
    } else {
        // Editor
        // Sets save button to edit mode
        isNewAnn = false;
        // Variable to hold the modified ann
        var editAnn;
        // Query till ann is found with matching ID
        annoucements.forEach((ann) => {
            if (ann.id == id) {
                // Assign Ann and ID to the editAnn
                editingId = ann.id;
                editAnn = ann;
            }
        });

        // Fill in the exisiting values to the input fields
        titleInput.value = editAnn.title;
        subtitleInput.value = editAnn.subtitle;
        descriptionInput.value = editAnn.description;

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

        // Display the edit window
        eewWrapper.style.display = 'block';
    }
}


/** Closes the edit window
 * 
 * @param {bool} saved - Booliean that says if the edit is saved or not
 */
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

/** Updates the viewport display */
function updateDisplay() {
    // Clear the display
    eventList.innerHTML = "";
    // Draw announcements to screen
    annoucements.forEach((element) => {
        eventList.appendChild(createListItem(element.id, element.title));
    })
}

/** Generates a random ID */
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/** Clears and uploads changes to the server */
function updateServer() {
    db.get().then((querySnapshot) => {
        // Remove all announcements from server
        querySnapshot.forEach((doc) => {
            db.doc(doc.id).delete().then(() => {
                console.log('Removing old document.');
            })
        });
        
        // Add all announcements to the server
        annoucements.forEach((e) => {
            db.doc(e.id).set({
                title: e.title,
                subtitle: e.subtitle,
                order: e.order,
                buttonLink: e.buttonLink,
                description: e.description,
            })
            // Update the display
            statusMessage('Updated');
            iframePreview.src = iframePreview.src;
        });

        // When there are no announcements still update the display
        if (annoucements.length == 0) {
            statusMessage('Updated');
            iframePreview.src = iframePreview.src;
        }
    });

}

/** Download and update local information with servers */
function getServer() {
    db.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            var singleAnn = {
                id: doc.id,
                order: data.order,
                title: data.title,
                subtitle: data.subtitle,
                buttonLink: data.buttonLink,
                description: data.description,
            }

            annoucements.push(singleAnn);
            updateDisplay();
        })
    })
}

// Displays a status message at the bottom of the screen
function statusMessage(message) {
    updateStatus.innerHTML = message;
    setTimeout(() => {
        updateStatus.innerHTML = '';
    }, statusDelay);
}