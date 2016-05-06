pageData = new Object();
//Establish Listeners
io.socket.on('user_logged_in',function(resData) {
    console.log(resData);
});
