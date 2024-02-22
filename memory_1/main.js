"use strict"
$(document).ready(function() {
    $("#tabs").tabs();

    let matchesCount = 0; // how many cards have been successfully matched
    let attempts = 0; // how many attempts the player has made to match cards
    let playerName = sessionStorage.getItem('playerName') || '';
    let numCards = sessionStorage.getItem('numCards') ? parseInt(sessionStorage.getItem('numCards')) : 48; // displays all 48 cards as default, or whatever amount the player selects
    let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
    let correct = 0; // percentage of how many correct matches have been founded over how many attempts made
    let imagesArr = []; // stores the images for the cards used by a game
    let cardsArr = []; // stores the src attributes of the images for the cards that will be displayed
    let revealedCardsArr = []; // stores the cards that have been clicked

    preloadGame();
    startGame();
    
    // saves the player's name and changes the amount of cards displayed based on the player's choice, reloads the page to show the player's name and desired amount of cards
    $('#save_settings').click(function() {
        playerName = $('#player_name').val() || '';
        numCards = parseInt($('#num_cards').val()) || 48; // displays all 48 cards as default, or whatever amount the player selects
        sessionStorage.setItem('playerName', playerName);
        sessionStorage.setItem('numCards', numCards);
        location.reload(); 
    });
    
    // begins a new game
    $('#new_game a').click(function(e) {
        e.preventDefault();
        startGame();
    });

    // function to preload the game with all of the images of the cards determined, but all cards are face down
    function preloadGame() {
        for (let i = 1; i <= 24; i++) {
            imagesArr.push(`images/card_${i}.png`);
        }
        imagesArr.push('images/back.png'); 
        imagesArr.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // function to start the game with the matches found count, attempts, and correct percentage set/reset to zero
    function startGame() {
        matchesCount = 0;
        attempts = 0;
        correct = 0;
        updateScore();
        cardsArr = dealCards(numCards);
        shuffleCards(cardsArr);
        displayCards();
    }

    // function to deal the desired amount of cards
    function dealCards(num) {
        let cardSet = [];
        for (let i = 1; i <= num / 2; i++) {
            let cardValue = i <= 24 ? i : i % 24;
            cardSet.push(cardValue, cardValue); 
        }
        return cardSet;
    }

    // function to shuffle the cards so it is not the same cards in the same order every game
    function shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // function to render the cards and append it to the HTML
    function displayCards() {
        $('#cards').empty(); 
        cardsArr.forEach((value, index) => {
            const cardElement = $(`<a href="#" class="card" id="card_${index}" data-value="${value}">
                <img src="images/back.png" alt="" draggable="false">
            </a>`);
            cardElement.click(function() { cardClickHandler($(this), value); });
            $('#cards').append(cardElement);
        });
    }
    
    // function to perform the animation for when a card is clicked
    // back of the card is faded out over half a second and the front of the card is faded in over alf a second
    function cardClickHandler(card, value) {
        if (revealedCardsArr.length < 2 && !card.hasClass('flipped')) {
            card.find('img').fadeOut(500, function () {
                $(this).attr('src', `images/card_${value}.png`).fadeIn(500);
            });
            card.addClass('flipped');
            revealedCardsArr.push(card);
    
            if (revealedCardsArr.length === 2) {
                attempts++;
                matchCards();
            }
        }
    }
    
    // function to perform the animations when two cards are matched, the type of animation is dependent on if the cards are a match or mismatch
    // match: cards are hidden after one second using a sliding motion over half a second
    // mismatch: faded out over half a second after two seocnds and the back of the cards faded in over half a second
    function matchCards() {
        if (revealedCardsArr[0].data('value') === revealedCardsArr[1].data('value')) {
            setTimeout(() => {
                revealedCardsArr.forEach(card => {
                    card.slideUp(500, function () {
                        $(this).replaceWith('<img src="images/blank.png" class="matched">');
                    });
                });
                matchesCount++;
                gameOver();
                revealedCardsArr = [];
            }, 1000);
        } 
        
        else {
            setTimeout(() => {
                revealedCardsArr.forEach(card => {
                    card.find('img').fadeOut(500, function () {
                        $(this).attr('src', 'images/back.png').fadeIn(500);
                    }).end().removeClass('flipped');
                });
                revealedCardsArr = [];
            }, 2000);
        }
    }

    // function to determine if the game is over by determining if all cards have been matched
    // records the high score and correct percentage then calls the updateScore() function
    function gameOver() {
        if (matchesCount * 2 === numCards) {
            let score = Math.round((matchesCount / attempts) * 100);
            alert(`Game Over! Your score: ${score}`);
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
            correct = calculateCorrectPercentage();
            updateScore();
        }
    }

    // function to calculate the correct matches found percentage
    function calculateCorrectPercentage() {
        return attempts > 0 ? Math.round((matchesCount / attempts) * 100) : 0;
    }
    
    // function to update the player's high score and correct matches percentage
    function updateScore() {
        $('#player').text(`Player: ${playerName}`);
        $('#high_score').text(`High Score: ${highScore}%`);
        $('#correct').text(`Correct: ${correct}%`);
    }
});