import { computed, createApp, ref } from 'vue'

const BOARD_SIZE = 16
const SYMBOL_POOL = [
  '🐶', '🐱', '🐸', '🦊', '🐼', '🦁', '🐨', '🐵', '🐙', '🐬',
  '🦄', '🦋', '🌸', '🍀', '🍓', '🍉', '⚡', '🔥', '⭐', '🌙'
]

createApp({
  setup() {
    const cards = ref([])
    const openedCards = ref([])
    const turns = ref(0)
    const lockBoard = ref(false)

    const shuffle = (array) => [...array]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

    const setupGame = () => {
      const pairCount = BOARD_SIZE / 2
      const symbols = shuffle(SYMBOL_POOL).slice(0, pairCount)
      cards.value = shuffle([...symbols, ...symbols]).map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
      openedCards.value = []
      turns.value = 0
      lockBoard.value = false
    }

    const flipCard = (card) => {
      if (lockBoard.value || card.isMatched || card.isFlipped) return

      card.isFlipped = true
      openedCards.value.push(card)

      if (openedCards.value.length < 2) return

      turns.value += 1
      const [first, second] = openedCards.value
      if (first.emoji === second.emoji) {
        first.isMatched = true
        second.isMatched = true
        openedCards.value = []
        return
      }

      lockBoard.value = true
      setTimeout(() => {
        first.isFlipped = false
        second.isFlipped = false
        openedCards.value = []
        lockBoard.value = false
      }, 900)
    }

    const matchedCount = computed(() => cards.value.filter((card) => card.isMatched).length)
    const gameWon = computed(() => matchedCount.value === BOARD_SIZE)

    setupGame()

    return { cards, turns, matchedCount, gameWon, setupGame, flipCard }
  },
  template: `
    <main class="page">
      <section class="game-card">
        <header class="header">
          <h1>Memory Game</h1>
          <div class="stats">
            <span>Ходы: {{ turns }}</span>
            <span>Пары: {{ matchedCount / 2 }}/8</span>
          </div>
        </header>

        <div class="board" aria-label="Memory game board">
          <button
            v-for="card in cards"
            :key="card.id"
            class="tile"
            type="button"
            @click="flipCard(card)"
          >
            <span class="tile-inner" :class="{ flipped: card.isFlipped || card.isMatched }">
              <span class="tile-face tile-front">?</span>
              <span class="tile-face tile-back">{{ card.emoji }}</span>
            </span>
          </button>
        </div>

        <footer class="footer">
          <p v-if="gameWon" class="win">Отлично! Все пары собраны 🎉</p>
          <button class="reset" type="button" @click="setupGame">Новая игра</button>
        </footer>
      </section>
    </main>
  `
}).mount('#app')
