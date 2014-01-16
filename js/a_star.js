var GridState = function (grid, coords, dest, prev_state) {
    var EMPTY = 0;
    var BLOCK = 1;

    var grid = grid;
    var coords = coords;
    this.coords = coords;
    var dest = dest;
    var prev_state = prev_state;

    var manhattan_distance = function () {
        return Math.abs(coords[0] - dest[0]) + Math.abs(coords[1] - dest[1]);
    };

    var g;
    if (prev_state)
        g = prev_state.g + 1;
    else
        g = 0;

    var h = manhattan_distance();
    var f = g + h;

    this.f = f;
    this.g = g;
    this.h = h;

    this.get_prev = function () {
        return prev_state;
    }

    this.possible_moves = function () {
        var moves = [];

        // If not the top row and above space is free
        if (coords[0] > 0 && grid[coords[0]-1][coords[1]] == EMPTY) {
            moves.push(new GridState(grid, [coords[0]-1, coords[1]], dest, this));
        }

        // If not the bottom row and the below space is free
        if (coords[0] < (grid.length - 1)
                && grid[coords[0]+1][coords[1]] == EMPTY) {
            moves.push(new GridState(grid, [coords[0]+1, coords[1]], dest, this));
        }

        // If not the left col and the left space is free
        if (coords[1] > 0
                && grid[coords[0]][coords[1]-1] == EMPTY) {
            moves.push(new GridState(grid, [coords[0], coords[1]-1], dest, this));
        }

        // If not the right col and the right space is free
        if (coords[1] < (grid[0].length - 1)
                && grid[coords[0]][coords[1]+1] == EMPTY) {
            moves.push(new GridState(grid, [coords[0], coords[1]+1], dest, this));
        }

        return moves;
    };
}


var AStar = function (new_grid) {
    var grid = new_grid;

    var sort_queue = function (a, b) {
        if (a.f < b.f) return -1;
        if (a.f > b.f) return 1;
        return 0;
    };

    var trace_path = function (state) {
        var path = [];
        path.push(state);
        while (path[path.length - 1].get_prev() != null) {
            path.push(path[path.length - 1].get_prev());
        }
        path = path.reverse();
        for (i in path) {
            path[i] = path[i].coords;
        }
        return path;
    };

    var arrays_equal = function (arr1, arr2) {
        if(arr1.length !== arr2.length)
            return false;
        for(var i = arr1.length; i--;) {
            if(arr1[i] !== arr2[i])
                return false;
        }
        return true;
    }

    this.update_grid = function (new_grid) {
        grid = new_grid;
    };

    this.get_path = function (from, to) {
        var queue = [];
        var processed = [];

        var initial_state = new GridState(grid, from, to, null);
        queue.push(initial_state);

        while (queue.length > 0) {
            current_state = queue.shift();

            if (arrays_equal(current_state.coords, to)) {
                return trace_path(current_state);
            }

            var possible_moves = current_state.possible_moves();
            for (i in possible_moves) {
                var avoid = false;
                var move = possible_moves[i];
                for (j in queue) {
                    var state = queue[j];
                    if (arrays_equal(state.coords, move.coords) && state.f <= move.f) {
                        avoid = true;
                    }
                }
                for (j in processed) {
                    var state = processed[j];
                    if (arrays_equal(state.coords, move.coords) && state.f <= move.f) {
                        avoid = true;
                    }
                }
                if (!avoid) {
                    queue.push(move);
                }
            }

            processed.push(current_state);
            queue = queue.sort(sort_queue);
        }

        // No path found
        return null;
    };
}