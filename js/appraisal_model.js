var Waiter = function () {
    this.emotions = {
        hope_despair: 0,
        joy_frustration: 0,
        relief_disappointment: 0,
        pride_embarassment: 0
    };

    this.appraisal_dimensions = {
        relevance: 0,
        congruence: 0
    };

    this.knowledge = {
        expected_time: 18,
        estimated_time: 16,
        elapsed_time: 0,
        progress: 0,
        customer_friendliness: 1,
        path_blocked: 0
    };
}

Waiter.prototype = {
    appraise: function (new_knowledge) {
        var sign = function (number) { return number?number<0?-1:1:0; };

        var knowledge = this.knowledge;
        var time_difference = (knowledge.estimated_time-1) - new_knowledge.estimated_time;

        console.log('h', time_difference, knowledge.estimated_time);
        this.appraisal_dimensions.relevance = Math.abs(time_difference/knowledge.estimated_time);
        this.appraisal_dimensions.congruence = sign(time_difference/knowledge.estimated_time);

        var deltas = [];

        // If the simulation is in progress, we need to compare this new info
        // to the previous knowledge
        if (knowledge.elapsed_time > 0) {
            // Compare and calculate the relative impact this event had on the goal
            var p_relief_disappointment = this.emotions.relief_disappointment;
            //this.emotions.relief_disappointment = time_difference / knowledge.estimated_time;
            this.emotions.relief_disappointment = this.appraisal_dimensions.relevance*this.appraisal_dimensions.congruence;
            deltas.push(['Relief_Disappointment', (p_relief_disappointment - this.emotions.relief_disappointment)/(p_relief_disappointment)]);
        }

        // Accept the new knowledge and update the state
        this.knowledge = new_knowledge;
        knowledge = this.knowledge;

        // Re-evaluate current progress
        var p_joy_frustration = this.emotions.joy_frustration;
        //this.emotions.joy_frustration = (knowledge.expected_time - (knowledge.estimated_time+knowledge.elapsed_time)) / knowledge.expected_time;
        this.emotions.joy_frustration += this.emotions.relief_disappointment;
        deltas.push(['Joy_Frustration', (p_joy_frustration - this.emotions.joy_frustration) / p_joy_frustration]);

        if (this.knowledge.path_blocked == 1) {
            // Evaluate the importance of future progress
            //this.emotions.hope_despair = this.emotions.joy_frustration / knowledge.elapsed_time;
            var p_hope_despair = this.emotions.hope_despair;
            var time_remaining = knowledge.expected_time - knowledge.elapsed_time;
            //this.emotions.hope_despair = (0.75*knowledge.expected_time - knowledge.elapsed_time) * 0.01 * Math.abs(this.emotions.joy_frustration);
            this.emotions.hope_despair = time_remaining / knowledge.estimated_time;
            deltas.push(['Hope_Despair', (p_hope_despair - this.emotions.hope_despair) / p_hope_despair]);
        }

        // If the round is over, reflect on the complete experience
        // The round is over when estimated_time == 2 because included is the
        // tile the waiter was just on and the tile the waiter has moved to
        if (knowledge.estimated_time == 2) {
            var p_pride_embarassment = this.emotions.pride_embarassment;
            this.emotions.pride_embarassment = this.emotions.joy_frustration / (knowledge.customer_friendliness);
            deltas.push(['Pride_Embarassment', (p_pride_embarassment - this.emotions.pride_embarassment) / p_pride_embarassment]);
        }

        // deltas.sort(function (a, b) {
        //     a = Math.abs(a[1]);
        //     b = Math.abs(b[1]);

        //     return a < b ? -1 : (a > b ? 1 : 0);
        // });

        console.log(deltas);

        this.current_emotion = '';
        var current_emotion_value = 0;
        for (delta in deltas) {
            d = deltas[delta];
            if (Math.abs(d[1]) > Math.abs(current_emotion_value)) {
                if (sign(this.emotions[d[0].toLowerCase()]) == -1) {
                    this.current_emotion = d[0].split('_')[1];
                    current_emotion_value = d[1];
                }
                else if (sign(this.emotions[d[0].toLowerCase()]) == 1) {
                    this.current_emotion = d[0].split('_')[0];
                    current_emotion_value = d[1];
                }
            }
        }

        // console.log(deltas);

        // if (deltas[deltas.length - 1][1] < 0) {
        //     this.current_emotion = deltas[deltas.length - 1][0].split('_')[1];
        // } else {
        //     this.current_emotion = deltas[deltas.length - 1][0].split('_')[0];
        // }

        console.log(this.current_emotion);
    }
}