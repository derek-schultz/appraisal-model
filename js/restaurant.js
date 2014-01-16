var Restaurant = function () {
    var GRID_ROWS = 8;
    var GRID_COLS = 8;
    var EVENT_PROBABILITY = 0.5;
    var INIT_BLOCKS = 14;
    var TICK_DURATION = 2000;

    var grid,
        blocks,
        sample_sequences,
        sequence,
        search,
        path,
        waiter,
        waiter_location,
        additions,
        removals,
        clock,
        dr_chart,
        fj_chart,
        dh_chart,
        ep_chart,
        tick_interval;

    sequence = 'random';

    this.initialize = function () {
        // Initialize grid view
        for (var i = 0; i < GRID_ROWS; i++) {
            $('table.grid').append('<tr></tr>');
            for (var j = 0; j < GRID_COLS; j++) {
                $('table.grid tr:last').append('<td></td>');
            }
        }

        // Initialize grid data
        grid = [];
        for (var i = 0; i < GRID_ROWS; i++) {
            grid[i] = [];
            for (var j = 0; j < GRID_COLS; j++) {
                grid[i][j] = 0;
            }
        }

        blocks = [[1, 2], [2, 4], [3, 4], [5, 6], [6, 2]];
        sample_sequences = {
            joy: {
                add: {
                    3: [2, 2],
                    6: [4, 4]
                },
                remove: {
                    4: [2, 4],
                    10: [6, 2]
                }
            },
            frustration: {
                add: {
                    8: [0, 2],
                    10: [0, 6],
                    11: [1, 7]
                },
                remove: {
                    20: [0, 6]
                }
            },
            manual: {
                add:{},
                remove: {}
            }
        };

        // If you want randomly placed initial blocks:
        // var blocks = [];
        // for (var i = 0; i < INIT_BLOCKS; i++) {
        //     var new_coords = randomCoords();
        //     blocks.push(new_coords);
        // }

        for (i in blocks) {
            grid[blocks[i][0]][blocks[i][1]] = 1;
        }

        search = new AStar(grid);
        path = search.get_path([7, 0], [0, 7]);

        draw_grid();

        waiter = new Waiter();
        waiter.customer_friendliness = Math.random() + 0.5;
        waiter_location = [7, 0];
        $('table.grid tr:eq(7) td:eq(0)').addClass('waiter');

        additions = [];
        removals = [];

        // for (var i = 0; i < MAX_EVENTS; i++) {
        //     additions.push(Math.floor(Math.random()*LATEST_EVENT+1));
        //     removals.push(Math.floor(Math.random()*LATEST_EVENT+1));
        // }

        clock = 0;

        google.load('visualization', '1.0', {'packages':['gauge']});
        google.setOnLoadCallback(drawCharts);

    }

    // Add in the blocks
    var randomCoords = function () {
        while (true) {
            var row = Math.floor(Math.random()*GRID_ROWS);
            var col = Math.floor(Math.random()*GRID_COLS);
            if (grid[row][col] == 0) {
                return [row, col];
            }
        }
    }

    var draw_grid = function () {
        for (i in grid) {
            for (j in grid[i]) {
                $('table.grid tr:eq('+i+')').find('td:eq('+j+')').removeClass('blocked path');
            }
        }

        for (i in path) {
            $('table.grid tr:eq('+path[i][0]+')').find('td:eq('+path[i][1]+')').addClass('path');
        }

        for (i in blocks) {
            $('table.grid tr:eq('+blocks[i][0]+')').find('td:eq('+blocks[i][1]+')').addClass('blocked');
        }
    }

    var drawCharts = function () {
        dr_chart = new google.visualization.Gauge(document.getElementById('dr_chart'));
        fj_chart = new google.visualization.Gauge(document.getElementById('fj_chart'));
        dh_chart = new google.visualization.Gauge(document.getElementById('dh_chart'));
        ep_chart = new google.visualization.Gauge(document.getElementById('ep_chart'));

        updateCharts();
    }

    var updateCharts = function () {
        var dr_data = google.visualization.arrayToDataTable([['Label', 'Value'], ['', Math.round(waiter.emotions.relief_disappointment*100)/100]]);
        var fj_data = google.visualization.arrayToDataTable([['Label', 'Value'], ['', Math.round(waiter.emotions.joy_frustration*100)/100]]);
        var dh_data = google.visualization.arrayToDataTable([['Label', 'Value'], ['', Math.round(waiter.emotions.hope_despair*100)/100]]);
        var ep_data = google.visualization.arrayToDataTable([['Label', 'Value'], ['', Math.round(waiter.emotions.pride_embarassment*100)/100]]);
        var options = {
          width: 120, height: 120,
          min: -1, max: 1,
          redFrom: -1, redTo: -.5,
          yellowFrom:-.5, yellowTo: 0.5,
          greenFrom: 0.5, greenTo: 1,
          minorTicks: 5
        };

        dr_chart.draw(dr_data, options);
        fj_chart.draw(fj_data, options);
        dh_chart.draw(dh_data, options);
        ep_chart.draw(ep_data, options);
    }

    var tick = function () {
        if (sequence != 'random') {
            var current_add = sample_sequences[sequence]['add'][clock];
            if (typeof(current_add) == 'object') {
                console.log('adding');
                blocks.push(current_add);
                grid[current_add[0]][current_add[1]] = 1;
            }
            var current_remove = sample_sequences[sequence]['remove'][clock];
            if (typeof(current_remove) == 'object') {
                console.log('removing');
                var removed;
                for (block in blocks) {
                    if (blocks[block][0] == current_remove[0]
                        && blocks[block][1] == current_remove[1]) {
                        removed = blocks.splice(block, 1)[0];
                        grid[removed[0]][removed[1]] = 0;
                        break;
                    }
                }
            }
        } else {
            if (Math.random() > EVENT_PROBABILITY) {
                new_coords = randomCoords();
                blocks.push(new_coords);
                grid[new_coords[0]][new_coords[1]] = 1;
            }
            if (Math.random() > EVENT_PROBABILITY) {
                var idx = Math.floor(Math.random()*blocks.length);
                var removed = blocks.splice(idx, 1)[0];
                grid[removed[0]][removed[1]] = 0;
            }
        }
        search.update_grid(grid);
        path = search.get_path(waiter_location, [0, 7]);
        draw_grid();

        var path_length;
        var path_blocked;
        if (path != null) {
            path_length = path.length;
            path_blocked = false;
        }
        else {
            path_length = 50;
            path_blocked = true;
        }


        waiter.appraise({
            expected_time: waiter.knowledge.expected_time,
            estimated_time: path_length,
            elapsed_time: clock,
            progress: path_length / (path_length + clock),
            customer_friendliness: waiter.knowledge.customer_friendliness,
            path_blocked: path_blocked
        });

        updateCharts();
        $('.goal-relevance-var').html(waiter.appraisal_dimensions.relevance);
        $('.goal-congruence-var').html(waiter.appraisal_dimensions.congruence);
        $('.current_emotion').html(waiter.current_emotion);
        if (waiter.current_emotion != '')
            $('img.waiter').attr('src', 'img/'+waiter.current_emotion+'.png');

        if (path != null) {
            waiter_location = path[1];
            var top = waiter_location[0]*56-117;
            var left = waiter_location[1]*57-14;
            $('img.waiter').animate({'top':top+'px', 'left': left+'px'});
            $('table.grid tr:eq('+waiter_location[0]+')').find('td:eq('+waiter_location[1]+')').addClass('waiter');
        }

        clock += 1;
        if (waiter_location[0] == 0 && waiter_location[1] == 7) {
            clearInterval(tick_interval);
        }
    };


    this.initialize();

    this.start = function () {
        tick_interval = setInterval(tick, TICK_DURATION);
    }

    this.pause = function () {
        clearInterval(tick_interval);
    }

    this.reset = function () {
        $('table.grid tr').remove();
        $('img.waiter').attr('style', '');
        $('img.waiter').attr('src', 'img/Joy.png');
        this.pause();
        this.initialize();
    }

    this.toggle_cell = function (row, col) {
        if (grid[row][col] == 0) {
            grid[row][col] = 1;
            blocks.push([row, col]);
        } else {
            grid[row][col] = 0;
            for (block in blocks) {
                if (blocks[block][0] == row
                    && blocks[block][1] == col) {
                    removed = blocks.splice(block, 1)[0];
                    grid[removed[0]][removed[1]] = 0;
                    break;
                }
            }
        }
        draw_grid();
    }

    this.set_order = function (order) {
        sequence = order;
        this.reset();
    }

};

