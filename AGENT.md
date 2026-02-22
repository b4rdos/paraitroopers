# Paraitroopers - Agent Documentation

## Project Overview

- **Type**: Single-page HTML5 canvas game
- **Stack**: Plain HTML, CSS, JavaScript (no frameworks)
- **Location**: `/home/b4rdarian/workspace/b4rdos/aidev/paraitroopers/`
- **Files**: 
  - `index.html` - Main HTML file
  - `paraitroopers.js` - Game logic
  - `README.md` - User documentation

## Game Concept

Ground-to-air cannon defense game. Player shoots down paratroopers dropped by airplanes before 5 land safely from either side (game over condition).

## Technical Details

- Canvas size: 800x600
- Ground level: 40px from bottom
- Cannon position: Center-bottom, elevated 30px above ground
- Angle range: ~30° to ~330° (configurable via LEFT_ANGLE/RIGHT_ANGLE constants)
- Game loop: requestAnimationFrame

## Key Constants (paraitroopers.js)

```
canvas: 800x600
GROUND_Y: canvas.height - 40
CANNON_X: canvas.width / 2
CANNON_Y: GROUND_Y - 30
LEFT_ANGLE: 190
RIGHT_ANGLE: 350
specialAmmo.radius: 80
specialAmmo.maxCooldown: 300 frames (~5 seconds)
cannon.cooldownTime: 15 frames
```

## Controls

| Key | Action |
|-----|--------|
| A | Rotate cannon counter-clockwise |
| D | Rotate cannon clockwise |
| Space | Fire projectile |
| Q | Fire special ammo (press again to arm, press again to detonate) |
| ESC | Pause/Resume |
| R | Restart (when game over) |

## Game Mechanics

1. **Airplanes**: Spawn every 8-12 seconds from left/right edges, fly horizontally, drop 1-3 paratroopers
2. **Paratroopers**: Descend with parachute, instant kill if hit anywhere (parachute or body)
3. **Landed tracking**: Left and right side tracked separately, game over when either reaches 5
4. **Special ammo**: Floats in air when fired, stops when armed (Q), explodes on detonation (Q) with area damage

## Color Scheme (Bi-colour)

```
Background: #0a0a1a (dark navy)
Player/Cannon: #ff6b35 (orange)
Player Light: #ff8c5a
Enemies: #e0e0e0 / #a0a0a0 (light/gray)
Ground: #1a1a2e
Special ammo: #ffcc00 (yellow)
Cannon body: #4a4a4a (dark grey)
Cannon base: #2a2a2a
```

## Known Issues / Notes

- Cannon starts at angle 0 (pointing right)
- Paratroopers that reach ground stay visible (landed = true)
- Hitting parachute anywhere kills paratrooper immediately (no survival fall)
- Random parachute release code was removed - parachutes don't fail randomly

## Future Improvements

- Add sound effects
- Add difficulty scaling
- Add high score tracking
- Consider adding sprites for better visuals
- Could add power-ups or wave system
