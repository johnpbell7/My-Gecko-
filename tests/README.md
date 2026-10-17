# Checks

Each file here opens `index.html` in a real browser and plays the game, because
almost everything that has gone wrong with this game went wrong *at runtime* -
a const read a few lines before it existed, a toy placed inside another toy, a
gecko strolling through a castle. None of it shows up in the source.

    ./run.sh              every check (about an hour - they drive a browser)
    ./run.sh tdz verify   just those two

Anything printed between `***` is a failure. `run.sh` exits non-zero if any
check flags something.

## Start with these two

- **tdz** boots ten real saves - day one, a mess, a full tank, the big tank
  with things out on the table, asleep, sick, five hours away - and asks only
  whether anything threw. This exists because a save with *both* a mess and a
  decoration in it killed the game stone dead on load, and every tidy test tank
  sailed past it. Six of those ten saves killed the build that was live.
- **verify** is the first-run path: splash, the "whose gecko is it" chooser,
  the picker, a messy tank, a name with HTML in it, coming back after hours away.

## The rest

| check | what it holds to account |
|---|---|
| players, twogames | two sisters, two links, two saves that never touch |
| solid | he walks round the tall things and climbs over the low ones |
| tour | the four first-run steps, and that they stay done |
| says, levels | Gecko Says, and the ten-level ladder on every game |
| sweep, scenarios | a long play session, and the awkward states |
| cave, jam, ride, toys | the cave, getting stuck, climbing on things, toy sizes |
| custom, box, room, turn | colours, the put-away box, the table, turning things |
| watch | the close-up camera |
| water, play, outdoor | thirst, playing with everything, life out on the table |

## Needs

Node, Playwright, and a Chromium. The scripts expect Chromium where this
container keeps it:

    /opt/pw-browsers/chromium-1194/chrome-linux/chrome

Change `executablePath` at the top of each file if yours lives elsewhere.

## A warning about timing

The browser here runs the game at roughly one frame a second, so game time
passes about twelve times slower than wall-clock time. Several checks wait a
fixed number of seconds for him to walk somewhere. On a slower machine they can
report "he never arrived" when he was simply still on his way - `outdoor` did
exactly that once. If a check fails on walking, raise its tick budget before
believing it.
