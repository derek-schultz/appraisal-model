Computational Model of Appraisal
================================

This project is an attempt at creating a computational appraisal model of the emotions of a virtual character.
A robot waiter brings customers food while obstacles are added and removed. The waiter's emotions are altered
in response to these random events.

[Try the demo](http://derekcomputer.com/projects/appraisal/demo.html)

The Model
---------
For this specific scenario, eight especially relevant emotions were chosen. Taking an approach inline with
[opponent-process theory](http://en.wikipedia.org/wiki/Opponent-process_theory), these eight emotions were
organized into opposing pairs. The chosen emotions are (loosely) inspired by
[Roseman's Theory of Appraisal](http://en.wikipedia.org/wiki/Appraisal_theory#Roseman.27s_Theory_of_Appraisal).

<table>
  <tr><th>Goal Congruent</th><th>Non-Congruent</th></tr>
  <tr><td>Hope</td><td>Despair</td></tr>
  <tr><td>Joy</td><td>Frustration</td></tr>
  <tr><td>Relief</td><td>Disappointment</td></tr>
  <tr><td>Pride</td><td>Embarassment</td></tr>
</table>

These emotional states are represented in the model using a number between -1 and +1 for each pair. For example,
if the waiter is very hopeful: `hope_despair = 0.8`. If the waiter has some degree of diespair:
`hope_despair = -0.3`.

In addition to storing values for the four emotion pairs, the waiter maintains the following knowledge of the world,
based on which it can conduct its appraisal.

* Expected time based on past experience
* Estimated time for this round
* Elapsed time this round
* Progress
* Customer satisfaction

The simulation is run in discrete steps. Each step proceeds as follows.

```
function step:
    if random() > DEFINED_LIKELIHOOD:
        add_random_blockage()
    if random() > DEFINED_LIKELIHOOD:
        remove_random_blockage()

    waiter.recalculate_path()
    emotions = waiter.appraise()
    gui.update(emotions)

function waiter.appraise:
    if elapsed_time > 0:
        time_difference = previous_estimate - current_estimate
        emotions.relief_disappointment = time_difference / previous_estimate

    emotion.joy_frustration = (expected_time - (estimated_time + elapsed_time)) / expected_time

    emotion.hope_despair = (0.75 * expected_time - elapsed_time) * 0.01 * abs(emotion.joy_frustration - 1)

    if round is complete:
        emotion.pride_embarassment = emotion.joy_frustration / (1 + customer_friendliness)

    for each emotion:
        deltas[emotion] = (prev_emotion_value - emotion) / prev_emotion_value
    
    deltas.sort()

    return highest delta where sign(delta) == sign(emotion)
```

### Relief / Disappointment

The first emotion calculated is relief/disappointment. This is an appraisal of how drastically the current
event impacts progress. A sudden decrease in travel time would be a relief, whereas being rerouted 6 blocks
when only 2 blocks away from finishing would be a big disappointment.

```
time_difference = previous_estimate - current_estimate
emotions.relief_disappointment = time_difference / previous_estimate
```

It is simply the calculation of the percent change in time estimate for goal completion.

### Joy / Frustration

This emotion is calculated by comparing initially projected progress to current progress. If things are ahead
of schedule, the result is joy. If the path is slow going, it is a frustrating experience.

```
emotion.joy_frustration = (expected_time - (estimated_time + elapsed_time)) / expected_time
```

### Hope / Despair

Hope/despair is a measure of progress with respect to time elapsed, which occurs when the path is blocked.
Early on in the simulation, the robot will experience hope if the path is blocked. Later in the simulation,
this will slide to despair as time remaining to accomplish the goal on schedule runs out.

```
if path_blocked:
    time_remaining = expected_time - elapsed_time
    hope_despair = time_remaining / estimated_time
```

### Pride / Embarassment

Pride/embarassment is appraised only once the goal is complete. A variable for how friendly the customer is
acts like an oversimplified theory of mind. The waiter takes into account the thoughts and expectations of
the customer. <code>customer_friendliness</code> is a random number between 0.5 and 1.5 that varies round by round.

```
if goal_complete:
    emotion.pride_embarassment = emotion.joy_frustration / customer_friendliness
```

Sample Cases
------------

The demo defaults to random block placement, but two predefined sample sequences are available to choose from. There is also a full manual mode where you can add and remove blocks by clicking on the board. *Note: you can always add and remove blocks by doing this, not just in manual mode. Manual mode simply prevents any blocks from being added or removed by the computer.*

### Joy Specific

The joy specific sequence is very simple. No blocks ever intrude with the robot's path, which is ideal. Note that joy is always positive and increasing as the robot moves through the path, never encountering any obstructions. At the end of the path, the robot experiences pride as it arrives sooner than it expected.

### Frustration Specific

The frustration specific sequence is designed to demonstrate all the emotions not demonstrated in the joy sequence. Throughout this example the robot will experience frustration, disappointment, relief, hope, despair, and embarassment.

1. The robot proceeds upwards without any obstructions.
2. Once the robot has traveled to the top of the board, a piece blocks its path, causing it to retrace its steps to go around the obstruction. This causes the robot disappointment, as things were going well and were suddenly interrupted.
3. Next, the corner with the table is blocked off, leaving no possible path. The robot stops. The initial emotion is again disappointment. Hope increases, as it is still early enough in the simulation for things to improve and for the delivery to be made on time.
4. Frustration increases as time is wasted waiting for the path to clear. Hope changes to despair as the threshold is reached where the situation cannot improve in time for a timely delivery.
5. When the blocks clear, the robot feels relief.
6. When the delivery is made, the robot is embarassed because it is very late.

_Note: Because of my implementation of A* search, the path may change to an equally efficient option even when no blocks have interfered with it. Because the efficiency of the path does not change, this does not affect the robot's emotion, so it does not adversely affect the simulation._

The Interface
-------------

The simulation is controlled using the toolbar in the top left. A dropdown menu allows you to change the pre-programmed block-placing sequence.

The values of the emotion pairs are represented using gauges that update as events unfold. The emotion with the most significant delta is represented on the face of the robot as it traverses the map. The following face is used to represent all four positive emotions.

### Happy
![Happy](https://raw2.github.com/derek-schultz/appraisal-model/master/img/happy.png)

Each of the four negative emotions has its own representation.

### Despair
![Despair](https://raw2.github.com/derek-schultz/appraisal-model/master/img/Despair.png)

### Frustrated
![Frustrated](https://raw2.github.com/derek-schultz/appraisal-model/master/img/frustration.png)

### Disappointed
![Disappointed](https://raw2.github.com/derek-schultz/appraisal-model/master/img/disappointment.png)

### Embarassed
![Embarassed](https://raw2.github.com/derek-schultz/appraisal-model/master/img/embarassment.png)

System Requirements
-------------------

This project was built and tested using Google Chrome. While it *should* work on any modern browser (IE 9+), I can only guarantee that it will only function 100% properly with Chrome.

An internet connection is required to retrieve Google's chart libraries at runtime (for the gauges).
