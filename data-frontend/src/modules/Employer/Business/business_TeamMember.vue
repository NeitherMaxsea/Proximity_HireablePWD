<template>
  <section class="business-debug-panel">
    <article class="business-debug-panel__card">
      <span class="business-debug-panel__eyebrow">Business Team Manager</span>
      <h2>Team management is temporarily removed</h2>
      <p>
        The heavier permission and team-management views were stripped out so the Business
        module stays lighter while you debug.
      </p>
    </article>
  </section>
</template>

<style scoped>
.business-debug-panel {
  display: grid;
  padding: 1.5rem;
}

.business-debug-panel__card {
  display: grid;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #d5e5da;
  border-radius: 24px;
  background: #ffffff;
  color: #1c3426;
}

.business-debug-panel__eyebrow {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #67816f;
}

.business-debug-panel__card h2,
.business-debug-panel__card p {
  margin: 0;
}

.business-debug-panel__card p {
  line-height: 1.6;
}
</style>
