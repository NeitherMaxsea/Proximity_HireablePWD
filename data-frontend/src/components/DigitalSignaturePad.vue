<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Digital Signature',
  },
  description: {
    type: String,
    default: '',
  },
  signerName: {
    type: String,
    default: '',
  },
  signerNameLabel: {
    type: String,
    default: 'Signer Name',
  },
  consentChecked: {
    type: Boolean,
    default: false,
  },
  consentLabel: {
    type: String,
    default: 'I confirm that this electronic signature is mine and I agree to sign this document.',
  },
  showConsent: {
    type: Boolean,
    default: true,
  },
  submitLabel: {
    type: String,
    default: 'Sign Document',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:signerName', 'update:consentChecked', 'submit'])

const canvasRef = ref(null)
const isDrawing = ref(false)
const hasSignature = ref(false)

const panelDisabled = computed(() => props.disabled || props.isSubmitting)
const canSubmit = computed(() =>
  !panelDisabled.value
  && String(props.signerName || '').trim()
  && hasSignature.value
  && (!props.showConsent || props.consentChecked === true),
)

const resizeCanvas = async () => {
  await nextTick()

  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const width = Math.max(Math.floor(rect.width || 520), 320)
  const height = Math.max(Math.floor(rect.height || 180), 140)
  const context = canvas.getContext('2d')
  if (!context) return

  const snapshot = hasSignature.value ? canvas.toDataURL('image/png') : ''

  canvas.width = width
  canvas.height = height
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = 2.4
  context.strokeStyle = '#183126'
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)

  if (snapshot) {
    const image = new Image()
    image.onload = () => {
      context.drawImage(image, 0, 0, width, height)
    }
    image.src = snapshot
  }
}

const getCanvasPoint = (event) => {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

const startDrawing = (event) => {
  if (panelDisabled.value) return

  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return

  isDrawing.value = true
  hasSignature.value = true
  const point = getCanvasPoint(event)
  context.beginPath()
  context.moveTo(point.x, point.y)
}

const draw = (event) => {
  if (!isDrawing.value || panelDisabled.value) return

  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return

  const point = getCanvasPoint(event)
  context.lineTo(point.x, point.y)
  context.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clearSignature = () => {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  hasSignature.value = false
}

const submitSignature = () => {
  const canvas = canvasRef.value
  if (!canvas || !canSubmit.value) return

  emit('submit', {
    signatureDataUrl: canvas.toDataURL('image/png'),
  })
}

const handlePointerDown = (event) => {
  if (panelDisabled.value) return
  event.preventDefault()
  canvasRef.value?.setPointerCapture?.(event.pointerId)
  startDrawing(event)
}

const handlePointerMove = (event) => {
  if (panelDisabled.value) return
  event.preventDefault()
  draw(event)
}

const handlePointerUp = (event) => {
  event.preventDefault()
  canvasRef.value?.releasePointerCapture?.(event.pointerId)
  stopDrawing()
}

watch(() => props.disabled, (isDisabled) => {
  if (isDisabled) stopDrawing()
})

onMounted(() => {
  void resizeCanvas()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', resizeCanvas)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', resizeCanvas)
  }
})
</script>

<template>
  <section class="digital-signature-pad" :class="{ 'is-disabled': panelDisabled }">
    <div class="digital-signature-pad__head">
      <div>
        <p class="digital-signature-pad__eyebrow">Electronic Signature</p>
        <h4>{{ title }}</h4>
        <p v-if="description">{{ description }}</p>
      </div>
      <button type="button" class="digital-signature-pad__clear" :disabled="panelDisabled" @click="clearSignature">
        Clear
      </button>
    </div>

    <label class="digital-signature-pad__field">
      <span>{{ signerNameLabel }}</span>
      <input
        :value="signerName"
        type="text"
        :disabled="panelDisabled"
        placeholder="Type full legal name"
        @input="emit('update:signerName', $event.target.value)"
      >
    </label>

    <div class="digital-signature-pad__canvas-wrap">
      <canvas
        ref="canvasRef"
        class="digital-signature-pad__canvas"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointerleave="stopDrawing"
        @pointercancel="stopDrawing"
      />
      <span class="digital-signature-pad__canvas-hint">
        Draw signature here
      </span>
    </div>

    <label v-if="showConsent" class="digital-signature-pad__consent">
      <input
        :checked="consentChecked"
        type="checkbox"
        :disabled="panelDisabled"
        @change="emit('update:consentChecked', $event.target.checked)"
      >
      <span>{{ consentLabel }}</span>
    </label>

    <div class="digital-signature-pad__actions">
      <button
        type="button"
        class="digital-signature-pad__submit"
        :disabled="!canSubmit"
        @click="submitSignature"
      >
        {{ isSubmitting ? 'Saving...' : submitLabel }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.digital-signature-pad {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(193, 206, 214, 0.92);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 1px 0 rgba(15, 23, 42, 0.03),
    0 16px 28px rgba(15, 23, 42, 0.05);
}

.digital-signature-pad.is-disabled {
  opacity: 0.82;
}

.digital-signature-pad__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.digital-signature-pad__head h4,
.digital-signature-pad__head p,
.digital-signature-pad__eyebrow {
  margin: 0;
}

.digital-signature-pad__eyebrow {
  color: #6c8376;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.digital-signature-pad__head h4 {
  margin-top: 0.2rem;
  color: #183126;
  font-size: 1rem;
  font-weight: 800;
}

.digital-signature-pad__head p:not(.digital-signature-pad__eyebrow) {
  margin-top: 0.3rem;
  color: #5f7268;
  font-size: 0.82rem;
  line-height: 1.55;
}

.digital-signature-pad__clear,
.digital-signature-pad__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  border-radius: 0.9rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
}

.digital-signature-pad__clear {
  min-width: 5rem;
  border: 1px solid rgba(193, 206, 214, 0.92);
  background: rgba(249, 251, 250, 0.98);
  color: #355646;
}

.digital-signature-pad__field {
  display: grid;
  gap: 0.45rem;
}

.digital-signature-pad__field span {
  color: #355646;
  font-size: 0.78rem;
  font-weight: 700;
}

.digital-signature-pad__field input {
  width: 100%;
  min-height: 2.9rem;
  border: 1px solid rgba(193, 206, 214, 0.92);
  border-radius: 0.95rem;
  padding: 0.75rem 0.9rem;
  background: #ffffff;
  color: #183126;
  font-size: 0.9rem;
}

.digital-signature-pad__canvas-wrap {
  position: relative;
  display: grid;
}

.digital-signature-pad__canvas {
  width: 100%;
  min-height: 11rem;
  border: 1px dashed rgba(129, 169, 143, 0.56);
  border-radius: 1rem;
  background: #ffffff;
  touch-action: none;
}

.digital-signature-pad__canvas-hint {
  position: absolute;
  right: 0.85rem;
  bottom: 0.8rem;
  color: #7b8a83;
  font-size: 0.72rem;
  font-weight: 700;
  pointer-events: none;
}

.digital-signature-pad__consent {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.65rem;
  align-items: start;
  color: #4f6359;
  font-size: 0.78rem;
  line-height: 1.55;
}

.digital-signature-pad__consent input {
  margin-top: 0.15rem;
  width: 1rem;
  height: 1rem;
  accent-color: #1b8a54;
}

.digital-signature-pad__actions {
  display: flex;
  justify-content: flex-end;
}

.digital-signature-pad__submit {
  min-width: 10rem;
  border: 1px solid rgba(24, 122, 74, 0.3);
  background: linear-gradient(135deg, #1b8a54 0%, #166534 100%);
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(27, 138, 84, 0.18);
}

.digital-signature-pad__clear:disabled,
.digital-signature-pad__submit:disabled,
.digital-signature-pad__field input:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .digital-signature-pad__head {
    flex-direction: column;
    align-items: stretch;
  }

  .digital-signature-pad__actions {
    justify-content: stretch;
  }

  .digital-signature-pad__submit {
    width: 100%;
  }
}
</style>
