var restaurant = new Restaurant();

$('.start-btn').click(function (event) {
    $('.play-toolbar > button').removeAttr('disabled');
    $('.start-btn').attr('disabled', 'disabled');
    restaurant.start();
});

$('.pause-btn').click(function (event) {
    $('.play-toolbar > button').removeAttr('disabled');
    $('.pause-btn').attr('disabled', 'disabled');
    restaurant.pause();
});

$('.reset-btn').click(function (event) {
    $('.play-toolbar > button').removeAttr('disabled');
    restaurant.reset();
});

$('.random-btn').click(function (event) {
    $('.play-toolbar > button').removeAttr('disabled');
    restaurant.set_order('random');
    update_dropdown($(event.target).html());
});

$('.manual-btn').click(function (event) {
    $('.play-toolbar > button').removeAttr('disabled');
    restaurant.set_order('manual');
    update_dropdown($(event.target).html());
});

$('.joy-btn').click(function (event) {
    $('.play-toolbar > button').removeAttr('disabled');
    restaurant.set_order('joy');
    update_dropdown($(event.target).html());
});

$('.frustration-btn').click(function (event) {
    $('.play-toolbar > button').removeAttr('disabled');
    restaurant.set_order('frustration');
    update_dropdown($(event.target).html());
});

$('table.grid').on('click', 'td', function (event) {
    var row = $(this).parent().index();
    var col = $(this).index();
    restaurant.toggle_cell(row, col);
});

function update_dropdown(text) {
    console.log(text);
    $('.sim-type').html(text);
}