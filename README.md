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
