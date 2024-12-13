# N-Body Simulation

A native JavaScript webapp that simulates the gravitational interactions between multiple masses.

The force calculations and collision detection in each frame runs in $\Theta(N\log N)$
time with a reasonable $\theta$ value and $O(N^2)$ at the worst case where $\theta = 0$,
where $N$ is the number of masses. Other updates, e.g. velocity and path graphics, sliders,
happen in $O(N)$.

---

The webapp currently cannot be accessed on the Web.
