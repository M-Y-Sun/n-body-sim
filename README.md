# N-Body Simulation

A native JavaScript webapp that simulates the gravitational interactions between multiple masses.

The force calculations and collision detection in each frame runs in $\Theta(N\log N)$
time with a reasonable $\theta$ value and $O(N^2)$ at the worst case where $\theta = 0$,
where $N$ is the number of masses. Other updates, e.g. velocity and path graphics, sliders,
happen in $O(N)$.

---

The app uses Newton's law of universal gravitation

$$F = G\frac{m_1m_2}{r^2}$$

to calculate the net force vector acting on each body every frame and updates their velocities accordingly.

To add bodies to the simulation, click the black part of the screen on the right.
The "Run" button on the left sidebar runs the simulation and pressing it again will pause the simulation.
The "Reset" button will remove all bodies and clear the display.

The sliders on the sidebar on the left adjusts various aspects of the simulation.
Notably, _lowering the accuracy value will result in a more accurate simulation_, at the cost of the algorithm running closer to $O(N^2)$.
Higher accuracy will cause the movements of the bodies to be jerky and imprecise.

The visibility force vectors and/or paths traced by each body can be toggled.

When a body is placed on the display, it can be clicked to show a popup to edit the body.
The position of the popup can be adjusted by dragging it with the dark bar at the top.
The "Done" button dismisses the popup and the "delete" button deletes the body.
The "Edit Position" button allows you to drag the selected body to a new position.
Pressing "Finish" will lock the body in place.

When a body is selected, the area around the body can be clicked and dragged to adjust the velocity of the body
instead of just using the sliders on the popup.

A few keybinds are supported in the app:

-   **Spacebar** toggles te running state of the app, i.e. switches between running and stopped.
-   **Backspace** deletes the currently selected body, if one is selected
-   **Escape** dismisses the popup if it is shown.
