$(document).ready(function () {

    var now = new Date();

    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);

    var today = now.getFullYear() + "-" + (month) + "-" + (day);

    $('#datePicker').val(today);

    
    


    

    $("#findPos").click(function () {
        var win = window.open('https://www.linkedin.com/search/results/all/?keywords=' + $('#fName').val() + '%20' + $('#lName').val(), '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        } else {
            //Browser has blocked it
            alert('Please allow popups for this website');
        }
    });






});