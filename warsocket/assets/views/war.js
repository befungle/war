/**
 * Created by Steven Burns on 5/5/16.
 */
jQuery(document).ready(function() {
    getOpenGames();
    pageData.activeGame = 0;
    pageData.war = [];
    io.socket.on('games', function (resData) {
        if (resData.verb == 'updated') {
            getOpenGames();
            if (resData.data.status == 'starting' && resData.data.player1 == pageData.userID){
                pageData.activeGame = resData.data;
                pageData.activeGame.id = resData.id;
                pageData.player1 = pageData.userData.name;
                pageData.player2 = resData.data.player2Name;
                nextCard();
            }

        }
        if (resData.data.status == 'playing' && pageData.activeGame.id == resData.id){
            //flip Player2 Card
            if ($('.isopponent').find('.cardf').hasClass('flipped')){
                $('.isopponent').find('.cardf').removeClass('flipped');
            } else {
                $('.isopponent').find('.cardf').addClass('flipped');
            }
            checkScore();
            //nextCard(resData.data.play1deck,resData.data.play2deck);
        }
        //console.log(resData);

    });
    io.socket.on('games', function (resData) {
        if (resData.verb == 'created') {
            getOpenGames();
            //console.log(resData);
        }

    });
});

function checkScore(){
    //Check if both cards are flipped
    if ($('.isopponent').find('.cardf').hasClass('flipped') && $('.isplayer').find('.cardf').hasClass('flipped')){
        //Get Winner
        var classList = $('.isopponent').find('.cardf').find('.back').attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            if (item != 'face' && item != 'back' && item != 'card') {
                var results1 = item.split("_");
                pageData.opponentScore = results1[1];
                console.log('opponent Card: '+item);
            }
        });
        var classList = $('.isplayer').find('.cardf').find('.back').attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            if (item != 'face' && item != 'back' && item != 'card') {
                var results2 = item.split("_");
                pageData.playerScore = results2[1];
                console.log('player Card: '+item);
            }
        });
        if (parseInt(pageData.opponentScore)>parseInt(pageData.playerScore)){
            //opponent Wins
            $('.isplayer').css('opacity','.5');
            recordScore('them');


        } else if (parseInt(pageData.playerScore)>parseInt(pageData.opponentScore)){
            //player Wins
            $('.isopponent').css('opacity','.5');
            recordScore('me');
        } else {
            //Tie
            recordScore('tie');
        }
    } else {
        //Move along Quietly
    }
}
function recordScore(winner){
    if (winner == 'me'){
        if (pageData.mydeckID == 1){
            pageData.activeGame.play1deck.push(pageData.activeGame.play2deck[0]);
            var length = pageData.activeGame.play2deck.length;
            pageData.activeGame.play2deck = pageData.activeGame.play2deck.splice(1,length);


            pageData.activeGame.play1deck.push(pageData.activeGame.play1deck[0]);
            var length = pageData.activeGame.play1deck.length;
            pageData.activeGame.play1deck = pageData.activeGame.play1deck.splice(1,length);

            //Add War Bounty
            pageData.activeGame.play1deck = $.merge(pageData.activeGame.play1deck,pageData.war);
            pageData.war = [];


        } else {
            pageData.activeGame.play2deck.push(pageData.activeGame.play1deck[0]);
            var length = pageData.activeGame.play1deck.length;
            pageData.activeGame.play1deck = pageData.activeGame.play1deck.splice(1,length);

            pageData.activeGame.play2deck.push(pageData.activeGame.play2deck[0]);
            var length = pageData.activeGame.play2deck.length;
            pageData.activeGame.play2deck = pageData.activeGame.play2deck.splice(1,length);

            pageData.activeGame.play2deck = $.merge(pageData.activeGame.play2deck,pageData.war);
            pageData.war = [];
        }

    } else if (winner == 'them') {
        if (pageData.mydeckID == 1){
            pageData.activeGame.play2deck.push(pageData.activeGame.play1deck[0]);
            var length = pageData.activeGame.play1deck.length;
            pageData.activeGame.play1deck = pageData.activeGame.play1deck.splice(1,length);

            pageData.activeGame.play2deck.push(pageData.activeGame.play2deck[0]);
            var length = pageData.activeGame.play2deck.length;
            pageData.activeGame.play2deck = pageData.activeGame.play2deck.splice(1,length);

            pageData.activeGame.play2deck = $.merge(pageData.activeGame.play2deck,pageData.war);
            pageData.war = [];
        } else {
            pageData.activeGame.play1deck.push(pageData.activeGame.play2deck[0]);
            var length = pageData.activeGame.play2deck.length;
            pageData.activeGame.play2deck = pageData.activeGame.play2deck.splice(1,length);

            pageData.activeGame.play1deck.push(pageData.activeGame.play1deck[0]);
            var length = pageData.activeGame.play1deck.length;
            pageData.activeGame.play1deck = pageData.activeGame.play1deck.splice(1,length);

            pageData.activeGame.play1deck = $.merge(pageData.activeGame.play1deck,pageData.war);
            pageData.war = [];
        }
    } else {
        //pageData.war =[];

        var length = pageData.activeGame.play1deck.length;
        var length2 = pageData.activeGame.play2deck.length;
        if (length < 5){

            $.each(pageData.activeGame.play1deck,function(index,value){
                var lastCard = length-1;
                if (index != lastCard){
                    pageData.war.push(value);
                } else {
                    pageData.activeGame.play1deck = pageData.activeGame.play1deck.splice(length,length);
                }

            });


        } else {
            //Deck One Anti
            pageData.war.push(pageData.activeGame.play1deck[0]);
            pageData.war.push(pageData.activeGame.play1deck[1]);
            pageData.war.push(pageData.activeGame.play1deck[2]);
            pageData.war.push(pageData.activeGame.play1deck[3]);
            var length = pageData.activeGame.play1deck.length;
            pageData.activeGame.play1deck = pageData.activeGame.play1deck.splice(4,length);
        }

        if (length2 < 5){
            $.each(pageData.activeGame.play2deck,function(index,value){
                var lastCard = length-1;
                if (index != lastCard){
                    pageData.war.push(value);
                } else {
                    pageData.activeGame.play2deck = pageData.activeGame.play2deck.splice(length,length);
                }

            });
        } else {
            //Deck Two Anti
            pageData.war.push(pageData.activeGame.play2deck[0]);
            pageData.war.push(pageData.activeGame.play2deck[1]);
            pageData.war.push(pageData.activeGame.play2deck[2]);
            pageData.war.push(pageData.activeGame.play2deck[3]);
            var length2 = pageData.activeGame.play2deck.length;
            pageData.activeGame.play2deck = pageData.activeGame.play2deck.splice(4,length2);
        }





        //
        //

                //Push and loop - not WAR rules
        //pageData.activeGame.play1deck.push(pageData.activeGame.play1deck[0]);
        //var length = pageData.activeGame.play1deck.length;
        //pageData.activeGame.play1deck = pageData.activeGame.play1deck.splice(1,length);
        //pageData.activeGame.play2deck.push(pageData.activeGame.play2deck[0]);
        //var length = pageData.activeGame.play2deck.length;
        //pageData.activeGame.play2deck = pageData.activeGame.play2deck.splice(1,length);
    }

    if (pageData.activeGame.play1deck.length == 0 ){
        setTimeout("showWin(1)",1500);
    } else if (pageData.activeGame.play2deck.length == 0){
        setTimeout("showWin(2)",1500);
    } else {
        setTimeout("nextCard()",1500);
    }

}
function showWin(winner){
    if (pageData.mydeckID == winner){
        $('.isopponent').css('border','1px solid red');
        $('.isplayer').css('opacity','1');
    } else {
        $('.isplayer').css('border','1px solid red');
        $('.isopponent').css('opacity','1');

    }
    $('#gameList').show();
    $('#gameMenu').show();
}
function whichDeck(){
    if (pageData.activeGame.player1 == pageData.userID){
        pageData.mydeckID = 1;
        pageData.mydeck = pageData.activeGame.play1deck;
        pageData.theirdeck = pageData.activeGame.play2deck;
    } else {
        pageData.mydeckID = 2;
        pageData.mydeck = pageData.activeGame.play2deck;
        pageData.theirdeck = pageData.activeGame.play1deck;
    }
}

$('#hostGame').click(function(){
    hostGame();
});

function getOpenGames(){
    io.socket.get('/Games?where={"status":{"contains":"open"}}',function(resData,jwres){
        pageData.games = resData;
        pageData.availGames = [];
        $('#gameList').html('<h2>Available Games</h2>');
        $.each(pageData.games, function(index,value){
            arr = jQuery.grep(pageData.activeusers, function( n, i ) {
                if (n == value.hostedBy && n != pageData.userID){
                    pageData.availGames.push(value);
                }
            });


        })
        $.each(pageData.availGames, function(index,value){
            arr = jQuery.grep(pageData.users, function( n, i ) {
                if (n.id == value.hostedBy){
                    value.hostname = n.name;
                    value.player1 = n.id;
                    $('#gameList').append('<div id="openGame_'+value.player1+'_'+value.id+'_'+index+'" class="openGame">'+value.hostname+'\'s Game</div>');
//                    pageData.availGames.push(value);
                }
            });
        });
        if (pageData.availGames.length == 0){
            $('#gameList').append('Sorry, there are no available games in your area at this time.');
        }
        $('.openGame').click(function(){
            var res = this.id.split("_");
            console.log(res);
            //update game to remove open status - add player 2
            pageData.player1 = pageData.userData.name;
            pageData.player2 = pageData.availGames[res[3]].player1Name;
            pageData.availGames[res[3]].player2 = parseInt(pageData.userID);
            pageData.activeGame = pageData.availGames[res[3]];
            io.socket.post('/Games/update/'+res[2], {
                player2: pageData.userID,
                player1: res[1],
                player1Name:pageData.availGames[res[3]].player1Name,
                player2Name:pageData.userData.name,
                play1deck: pageData.availGames[res[3]].play1deck,
                play2deck: pageData.availGames[res[3]].play2deck,
                status: 'starting'
            }, function (resData) {
                //resume operation
                //load Deck2
                nextCard();
            });

        })
    });
}

$('#joinGame').click(function(){
   joinGame();
});
function joinGame(){
    $('#gameList').show();
}


function showJoinGame(){
    getOpenGames();
}
function hostGame(){
    $('#hostGame').css('color','#CCC');

    pageData.player = 1;

    //Create Deck
    createDeck();

    //Create Game Space
    publishDeck();

    //Go to wait for join screen
    //$('#gameTable').html('');

}

function publishDeck(){
    io.socket.post('/Games/create/', {
        fulldeck: pageData.fulldeck,
        play1deck: pageData.play1deck,
        play2deck: pageData.play2deck,
        hostedBy: pageData.userID,
        player1Name:pageData.userData.name,
        status: 'open'
    }, function (resData) {
        //resume operation
        pageData.activeGame = resData;
    });
}

function createDeck(){
    var fulldeck = [];
    $('#gameTable').html('');
    //suites
    var i = 1;
    while (i < 5) {
        var x = 1;
        while(x < 14){
            fulldeck.push("s"+i+"_"+x);
            x++;
        }
        i++;
    }
    pageData.fulldeck = fulldeck.slice(0);
    pageData.play1deck = shuffle(fulldeck);
    var half_length = Math.ceil(pageData.play1deck.length / 2);
    pageData.play2deck = pageData.play1deck.splice(0,half_length);


}

function nextCard(){
    $('#gameList').hide();
    $('#gameMenu').hide();

    whichDeck();
    show1 = pageData.mydeck;
    show2 = pageData.theirdeck;
    $('#gameTable').html('').removeClass('hideClass');
    $('#gameTable').append('<div id="vs" class="row"><div class="columns large-4 small-4 medium-4">'+pageData.player1+'</div><div class="columns large-4 small-4 medium-4">VS</div><div class="columns large-4 small-4 medium-4">'+pageData.player2+'</div></div>');
    $('#gameTable').append('<div id="score" class="row"><div class="columns large-4 small-4 medium-4">'+$(show1).length+'</div><div class="columns large-4 small-4 medium-4">TO</div><div class="columns large-4 small-4 medium-4">'+$(show2).length+'</div></div>');
    $('#gameTable').append('<div id="warChest" class="row"></div>');
    $('#gameTable').append('<div class="cardCont"><div class="flip isplayer"><div class="cardf"><div class="face front card back1"></div><div class="face back card '+show1[0]+'"></div></div></div></div>');
    $('#gameTable').append('<div class="cardCont"><div class="flip isopponent"><div class="cardf"><div class="face front card back1"></div><div class="face back card '+show2[0]+'"></div></div></div></div>')
    //

    if (pageData.war.length > 0){
        $('#warChest').html('WAR DECLARED - Cards at Stake: '+pageData.war.length);
    }

    $('.isplayer').click(function(){
        $('.isplayer').unbind('click');
        if ($(this).find('.cardf').hasClass('flipped')){
            $(this).find('.cardf').removeClass('flipped');
        } else {
            $(this).find('.cardf').addClass('flipped');
        }
        checkScore();
        io.socket.post('/Games/update/'+pageData.activeGame.id, {
            status: 'playing'
        }, function (resData) {
            //resume operation
            //load Deck2
            //nextCard(pageData.activeGame.play2deck,pageData.activeGame.play1deck);
        });

        return false;
    });
}

function showDeck(deck){
    $('#gameTable').html('').removeClass('hideClass');
    $.each(deck,function(index,value){

        /*
         <div class="flipper"><div class="front"></div><div class="back"></div></div>
         */
        $('#gameTable').append('<div class="cardCont"><div class="flip"><div class="cardf"><div class="face front card back1"></div><div class="face back card '+value+'"></div></div></div></div>');
    })
    $('.flip').click(function(){
        if ($(this).find('.cardf').hasClass('flipped')){
            $(this).find('.cardf').removeClass('flipped');
        } else {
            $(this).find('.cardf').addClass('flipped');
        }
        return false;
    });
    //$.each(pageData.play2deck,function(index,value){
    //    $('#gameTable').append('<div class="'+value+'"></div>');
    //})
}

function changeCard (cid,card){
    $('#'+cid).removeClass();
    $('#'+cid).addClass(card);
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}