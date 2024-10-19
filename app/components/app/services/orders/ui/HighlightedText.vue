<template>
  <p class="text-xs font-mono" style="white-space: pre-line; line-height: 1.5">
    <span v-for="(part, index) in parts" :key="index" :class="part.class">{{
      part.text
    }}</span>
  </p>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Пропсы, которые принимает компонент
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

// Функция для удаления лишних вертикальных пробелов
function removeVerticalSpaces(text: string) {
  return text.replace(/^\s*[\r\n]/gm, "").trim();
}

// Функция для подсветки текста
function highlightText(text: string) {
  const parts: Array<{ text: string; class?: string }> = [];

  // Шаблоны для поиска
  const patterns = [
    {
      // Габариты: 200x200x170, 200 х 200 х 170, и возможны пробелы
      regex: /\b(\d+\s?[xх]\s?\d+\s?[xх]\s?\d+\s?(см|cm)?)\b/gi,
      class: "highlight-dimension",
    },
    {
      // Вес: 100кг, 100 кг, 100kg, 100 кг (с любым количеством пробелов между числом и кг)
      regex: /\b(\d+)\s*(кг|kg|КГ|KG)\b/gi,
      class: "highlight-weight",
    },
    {
      // Даты: 01.01.2024
      regex: /\b(\d{2}\.\d{2}\.\d{4})\b/g,
      class: "highlight-date",
    },
    {
      // Время: 12:30
      regex: /\b(\d{2}:\d{2})\b/g,
      class: "highlight-time",
    },
    {
      // Телефоны: +7 999 123 45 67
      regex:
        /(\+?\d{1,3}[-\s]?\d{1,3}[-\s]?\d{2,3}[-\s]?\d{2,3}[-\s]?\d{2,3})/g,
      class: "highlight-phone",
    },
    {
      // Услуги: трактор, телега, вильчатый погрузчик, стропы
      regex: /\b(трактор|телега|вильчатый\sпогрузчик|стропы?)\b/gi,
      class: "highlight-service",
    },
  ];

  const servicesFound: string[] = []; // Для хранения найденных услуг
  let remainingText = removeVerticalSpaces(text);

  while (remainingText) {
    let matchFound = false;

    // Проверяем каждый шаблон
    for (const { regex, class: className } of patterns) {
      regex.lastIndex = 0; // Сбрасываем lastIndex для корректного поиска
      const match = regex.exec(remainingText);

      if (match) {
        // Добавляем обычный текст перед найденным совпадением
        if (match.index > 0) {
          parts.push({ text: remainingText.slice(0, match.index) });
        }

        // Добавляем текст с подсветкой
        parts.push({ text: match[0], class: className });

        // Если найдено упоминание услуги, сохраняем его
        if (className === "highlight-service") {
          servicesFound.push(match[0].toLowerCase());
        }

        // Обновляем оставшийся текст
        remainingText = remainingText.slice(match.index + match[0].length);
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      // Если совпадений больше нет, добавляем оставшийся текст
      parts.push({ text: remainingText });
      remainingText = "";
    }
  }

  // Выводим услуги как теги через запятую
  const contextTags = servicesFound.join(", ");
  console.log("Найденные услуги:", contextTags); // Можем использовать для обновления поля context_tags

  return parts;
}

// Компьютед-свойство для обработки текста
const parts = computed(() => highlightText(props.text));
</script>

<style scoped>
.highlight-dimension {
  background-color: rgba(255, 255, 0, 0.5); /* Yellow with transparency */
  font-weight: bold; /* Bold text */
  font-size: 1.6em; /* Slightly larger text */
}

.highlight-weight {
  background-color: rgb(217 70 239);
  font-weight: bold; /* Bold text */
  font-size: 1.6em; /* Slightly larger text */
}

.highlight-date {
  background-color: rgb(14 116 144);
  font-weight: bold; /* Bold text */
}

.highlight-time {
  background-color: rgb(59 130 246);
  font-weight: bold; /* Bold text */
  font-size: 1.6em; /* Slightly larger text */
}

.highlight-phone {
  background-color: rgb(157 23 77);
  font-weight: bold; /* Bold text */
  font-size: 1.6em; /* Slightly larger text */
}

.highlight-service {
  background-color: rgb(255, 204, 102);
  font-weight: bold;
  font-size: 1.4em;
}
</style>
