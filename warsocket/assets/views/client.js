/**
 * Created by Steven Burns on 5/4/16.
 * Register a client and store ID on device
 * pageData defined in Master.js to store interactive page data
 */

jQuery(document).ready(function(){
    pageData.init = 'n';
    io.socket.on('users',function(resData) {
        if (resData.verb == 'updated'){
            getUsers();
            //console.log(resData);
        }

    });
    //Run check for local storage
    if(lsTest() === true){
        // available
        if (localStorage.getItem('userID')){
            //Set global variable to stored value
            pageData.userID = localStorage.getItem('userID');
            gameInit();
        } else {
            //Establish ID
            createClient();
        }
    } else {
        //Local storage unavailable - set "random"
        var randID = getRandomInt(1000,100000);
        pageData.userID = 'RA_'+randID;
        createClient();
    }
});

function createClient(){
    io.socket.post('/Users/create/', {
        name: ''
    }, function (resData) {
        //resume operation
        localStorage.setItem('userID',resData.id);
        pageData.userID = localStorage.getItem('userID');
        $('#clientRegistration').addClass('hideClass');
        gameInit();
    });
}

function lsTest(){
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function userData(){
    $('#debugmessage').html('');
    $('#debugmessage').prepend('User Id: '+pageData.userID+"<br>");
    io.socket.get("/Users/"+pageData.userID,function(resData,jwres){
        pageData.userData = resData;
        if (pageData.userData.name == ''){
            $('#debugmessage').prepend('Warning, Not Named<br>');
            $('#clientRegistration').removeClass('hideClass');
        } else {
            $('#debugmessage').prepend('Name: '+pageData.userData.name+"<br>");
            $('#clientRegistration').addClass('hideClass');
            $('#gameWindow').removeClass('hideClass');
            if (pageData.init == 'n'){
                setInterval('keepAlive()',1000);
            }
        }
    });
}


function keepAlive(){
    pageData.init = 'y';
    var n = Date.now();
    io.socket.post('/Users/update/'+pageData.userID, {
        lastactive: n
    }, function (resData) {
        //resume operation
        getUsers();
    });
    getOpenGames();
}

function deregister(){
    localStorage.removeItem('userID');
    window.location.reload();
}

/* Custom to War */
$('#deregister').click(function(){
    deregister();
});

$('#playerName').focusout(function() {
    $('#debugmessage').prepend('Name Entered: '+$('#playerName').val()+'<br>');
    //Update Client Name
    io.socket.post('/Users/update/'+pageData.userID, {
        name: $('#playerName').val()
    }, function (resData) {
        //resume operation
        gameInit();
    });
})

function gameInit(){
    userData();
    getUsers();
}

function getUsers(){
    io.socket.get("/Users",function(resData,jwres){
        pageData.users = resData;
        $('#players').html('');
        $('#players').html('<h3>All Players</h3>');
        pageData.activeusers = [];
        $.each(pageData.users, function(){
            var n = Date.now();
            if (this.lastactive){
                var active = n-this.lastactive;
                if (this.name != '' && active < 1000){
                    pageData.activeusers.push(this.id);
                    $('#players').append('<div class="columns large-12 medium-12 small-12">'+this.id+': '+this.name+' ('+active+')</div>');
                }
            }

        })
    });
}