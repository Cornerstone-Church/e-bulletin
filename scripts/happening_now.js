
function checkDay() {

    var noEvent = document.getElementById('no-event-hn');
    var sunday = document.getElementById('sunday-hn');
    var saturday = document.getElementById('saturday-hn');

    if (getDate() == 'sunday') {
        // Enable Date
        sunday.style.display = 'inline';
    } else if (getDate() == 'saturday') {
        // Enable Date
        saturday.style.display = 'inline';
    } else {
        noEvent.style.display = 'inline';
    }
}

function getDate() {
    var date = new Date();
    var weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return weekday[date.getDay()];
}