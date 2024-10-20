<template>
  <main>
    <section
      class="pt-20 pb-28 min-h-screen flex flex-col justify-center relative"
    >
      <div class="px-6 w-full mx-auto max-w-6xl relative z-10">
        <!-- Set z-index here -->
        <slot />
      </div>

      <!-- Background -->
      <div class="absolute inset-0 z-0">
        <div class="background-gradient">
          <div class="background-gradient-pattern"></div>
        </div>
      </div>

      <!-- Animated Circles -->
    </section>
  </main>
</template>

<style scoped>
/* Existing styles for layout */
.relative {
  position: relative;
}

.z-10 {
  z-index: 10;
}

.z-0 {
  z-index: 0;
}

.absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.background-gradient {
  background: linear-gradient(45deg, #0f172a, #083344);
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 0;
}

.background-gradient-pattern {
  background: radial-gradient(rgba(255, 255, 255, 0.15) 10%, transparent 90%);
  opacity: 0.3;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 0;
}

/* Animation styles */
@property --progress {
  syntax: "<percentage>";
  inherits: true;
  initial-value: 0%;
}

:root {
  --c1: #6eccee;
  --c2: #f672ca;
  --c3: #fdb428;
  --c4: #b9f;
}

@keyframes progress {
  from {
    --progress: 0%;
  }

  to {
    --progress: 100%;
  }
}

.circle {
  --progress: 60%;
  @supports (background: paint(houdini)) {
    --progress: 0%;
  }
  background: conic-gradient(
    at center,
    var(--c1) var(--progress),
    black var(--progress),
    var(--c2) calc(var(--progress) + 20%),
    var(--c3) calc(var(--progress) + 30%),
    var(--c3) calc(var(--progress) + 50%),
    transparent,
    transparent,
    transparent,
    transparent
  );
  animation: progress 4s linear infinite;
  border-radius: 50%;
  mask: radial-gradient(circle at center, transparent 65%, black 65%);
  position: absolute;
  inset: 0;
}

.circle:nth-child(2) {
  inset: 4vmin;
  animation-delay: 1s;
}

.circle:nth-child(3) {
  inset: 8vmin;
  animation-delay: 0.5s;
}

.container {
  filter: drop-shadow(0 0 0.8vmin hsla(0, 0, 0%, 1));
  position: absolute;
  width: 40vmin;
  aspect-ratio: 1;
  top: 50%;
  right: 5%;
  transform: translateY(-50%);
  z-index: 5; /* Make sure it's above the background */

  @media (max-width: 768px) {
    right: 50%;
    transform: translate(50%, -50%);
  }

  &:after {
    content: "@property 🧙‍♂️✨";
    font-weight: bold;
    position: absolute;
    font-size: 2.5vmin;
    inset: 0;
    color: white;
    display: grid;
    place-items: center;
  }
}

/* Body styling */
body {
  height: 100vh;
  width: 100vw;
  font-family: Roboto, Inter, "Helvetica Neue", Helvetica, sans-serif;
  background: radial-gradient(
      30% 40% at center,
      hsla(0, 0, 100%, 0.03),
      transparent
    ),
    #111;
  color: var(--c1);
  display: grid;
  place-items: center;
}
</style>
