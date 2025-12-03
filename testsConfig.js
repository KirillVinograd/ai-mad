const tests = [
  {
    slug: 'mlo-am',
    name: 'МЛО-АМ (Многоуровневый личностный опросник «Адаптивность»)',
    description: 'Комплексная оценка адаптивных ресурсов и личностных качеств по методике МЛО-АМ.',
    scales: [
      { key: 'adaptivity', label: 'Интегральная адаптивность', detail: 'Обобщённый показатель готовности к изменениям и восстанавливаемости.' },
      { key: 'neuro_resilience', label: 'Нервно‑психическая устойчивость', detail: 'Толерантность к стрессу и эмоциональное равновесие.' },
      { key: 'behavior_regulation', label: 'Поведенческая регуляция', detail: 'Самоконтроль, соблюдение норм и структурирование действий.' },
      { key: 'moral_norms', label: 'Моральная нормативность', detail: 'Следование правилам, честность и социальная надёжность.' },
      { key: 'communication', label: 'Коммуникативный потенциал', detail: 'Готовность к взаимодействию, способность слышать и убеждать.' },
      { key: 'self_acceptance', label: 'Самопринятие', detail: 'Удовлетворённость собой и принятие собственных особенностей.' },
      { key: 'self_regulation', label: 'Саморегуляция', detail: 'Управление эмоциями, импульсами и ресурсами энергии.' },
      { key: 'motivation', label: 'Мотивация достижения', detail: 'Стремление к целям, настойчивость и ориентация на результат.' },
      { key: 'flexibility', label: 'Поведенческая гибкость', detail: 'Готовность менять подход и искать альтернативные решения.' },
      { key: 'social_inclusion', label: 'Социальная включённость', detail: 'Чувство принадлежности, принятие окружающих и кооперация.' },
      {
        key: 'integral_index',
        label: 'Сводный индекс адаптивности',
        detail: 'Среднее по базовым шкалам МЛО-АМ: адаптивные ресурсы, устойчивость, нормы и коммуникация.',
        formula(scores) {
          const baseKeys = ['adaptivity', 'neuro_resilience', 'behavior_regulation', 'moral_norms', 'communication'];
          const values = baseKeys.map((k) => scores[k]?.normalized || 0);
          const normalized = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
          return { raw: values.reduce((a, b) => a + b, 0), normalized };
        }
      }
    ],
    questions: [
      { id: 'mlo_q1', text: 'Легко включаюсь в новые условия и быстро в них ориентируюсь.', scaleWeights: { adaptivity: 2, flexibility: 1, neuro_resilience: 1 } },
      { id: 'mlo_q2', text: 'Даже под давлением сохраняю спокойствие и контроль над собой.', scaleWeights: { neuro_resilience: 2, self_regulation: 2 } },
      { id: 'mlo_q3', text: 'Стараюсь действовать по правилам и доводить дела до конца.', scaleWeights: { behavior_regulation: 2, moral_norms: 1, motivation: 1 } },
      { id: 'mlo_q4', text: 'Мне легко слушать собеседника и договариваться.', scaleWeights: { communication: 2, social_inclusion: 1 } },
      { id: 'mlo_q5', text: 'Чувствую уверенность в себе и принимаю свои особенности.', scaleWeights: { self_acceptance: 2, self_regulation: 1 } },
      { id: 'mlo_q6', text: 'Ставлю конкретные цели и настойчиво иду к ним.', scaleWeights: { motivation: 2, behavior_regulation: 1 } },
      { id: 'mlo_q7', text: 'В сложностях ищу варианты, а не застреваю на проблеме.', scaleWeights: { flexibility: 2, adaptivity: 1, neuro_resilience: 1 } },
      { id: 'mlo_q8', text: 'Стараюсь быть честным и ответственным даже в мелочах.', scaleWeights: { moral_norms: 2, self_regulation: 1 } },
      { id: 'mlo_q9', text: 'Поддержка других важна для меня, и я готов её принимать и давать.', scaleWeights: { social_inclusion: 2, communication: 1, self_acceptance: 1 } },
      { id: 'mlo_q10', text: 'В эмоционально напряжённых ситуациях я сохраняю рациональность.', scaleWeights: { neuro_resilience: 1, self_regulation: 2 } },
      { id: 'mlo_q11', text: 'Я не боюсь корректировать план, если вижу лучший путь.', scaleWeights: { flexibility: 2, adaptivity: 1, motivation: 1 } },
      { id: 'mlo_q12', text: 'Принимаю ответственность за последствия своих решений.', scaleWeights: { moral_norms: 1, behavior_regulation: 1, self_regulation: 1, adaptivity: 1 } }
    ]
  },
  {
    slug: 'shmishek',
    name: 'Опросник Шмишека',
    description: 'Диагностика акцентуаций характера по К. Леонгарду – Н. Шмишеку.',
    scales: [
      { key: 'demonstrative', label: 'Демонстративность', detail: 'Выраженность стремления к признанию и яркости.' },
      { key: 'stuck', label: 'Застревание', detail: 'Склонность к переживанию обид и фиксации на идеях.' },
      { key: 'pedantic', label: 'Педантичность', detail: 'Уровень аккуратности, ригидности и формализма.' },
      { key: 'excitable', label: 'Возбудимость', detail: 'Импульсивность и склонность к вспышкам раздражения.' },
      { key: 'hyperthymic', label: 'Гипертимность', detail: 'Оптимистичность, активность, общительность.' }
    ],
    questions: [
      { id: 'shmishek_q1', text: 'Мне нравится быть в центре внимания.', scaleWeights: { demonstrative: 2, hyperthymic: 1 } },
      { id: 'shmishek_q2', text: 'Я долго помню несправедливость по отношению ко мне.', scaleWeights: { stuck: 2 } },
      { id: 'shmishek_q3', text: 'Я предпочитаю действовать по четким правилам и планам.', scaleWeights: { pedantic: 2 } },
      { id: 'shmishek_q4', text: 'Иногда я резко реагирую на мелкие замечания.', scaleWeights: { excitable: 2, stuck: 1 } },
      { id: 'shmishek_q5', text: 'Я часто испытываю подъем настроения и энергии.', scaleWeights: { hyperthymic: 2, demonstrative: 1 } },
      { id: 'shmishek_q6', text: 'Я тщательно проверяю свою работу перед сдачей.', scaleWeights: { pedantic: 1, stuck: 1 } },
      { id: 'shmishek_q7', text: 'Даже незначительные конфликты выводят меня из себя.', scaleWeights: { excitable: 2 } },
      { id: 'shmishek_q8', text: 'Мне легко подружиться и поддерживать беседу.', scaleWeights: { hyperthymic: 2, demonstrative: 1 } }
    ]
  },
  {
    slug: 'epi',
    name: 'Личностный опросник Айзенка (EPI)',
    description: 'Оценка экстраверсии и нейротизма по методике Г. Айзенка.',
    scales: [
      { key: 'extraversion', label: 'Экстраверсия', detail: 'Социальная активность, общительность и энергичность.' },
      { key: 'neuroticism', label: 'Нейротизм', detail: 'Эмоциональная стабильность и уровень тревожности.' },
      { key: 'lie', label: 'Шкала лжи', detail: 'Склонность давать социально-желательные ответы.' }
    ],
    questions: [
      { id: 'epi_q1', text: 'Мне нравится бывать в больших компаниях.', scaleWeights: { extraversion: 2 } },
      { id: 'epi_q2', text: 'Я часто волнуюсь по пустякам.', scaleWeights: { neuroticism: 2 } },
      { id: 'epi_q3', text: 'Иногда я украшаю истории о себе.', scaleWeights: { lie: 2, extraversion: 1 } },
      { id: 'epi_q4', text: 'Мне сложно усидеть на одном месте длительное время.', scaleWeights: { extraversion: 1, neuroticism: 1 } },
      { id: 'epi_q5', text: 'Я сохраняю спокойствие в неожиданных ситуациях.', scaleWeights: { neuroticism: -2 } },
      { id: 'epi_q6', text: 'Я предпочитаю проводить вечер в кругу знакомых людей.', scaleWeights: { extraversion: 1, lie: 1 } },
      { id: 'epi_q7', text: 'Мне свойственно сомневаться после принятия решений.', scaleWeights: { neuroticism: 1 } },
      { id: 'epi_q8', text: 'Я всегда честно выполняю обещания.', scaleWeights: { lie: 2 } }
    ]
  },
  {
    slug: 'pdo',
    name: 'Патохарактерологический диагностический опросник (ПДО)',
    description: 'Оценка акцентуаций характера по методике Иванова-Личко.',
    scales: [
      { key: 'hyperthymic', label: 'Гипертимный', detail: 'Повышенный жизненный тонус, общительность.' },
      { key: 'cycloid', label: 'Циклоидный', detail: 'Чередование подъемов и спадов настроения.' },
      { key: 'sensitive', label: 'Сензитивный', detail: 'Ранимость, впечатлительность, боязнь оценок.' },
      { key: 'conformal', label: 'Конформный', detail: 'Подчинение группе, зависимость от окружения.' },
      { key: 'unstable', label: 'Нестойкий', detail: 'Снижение волевого контроля и дисциплины.' }
    ],
    questions: [
      { id: 'pdo_q1', text: 'Мне легко знакомиться и заводить разговор первым.', scaleWeights: { hyperthymic: 2 } },
      { id: 'pdo_q2', text: 'Настроение часто меняется без видимых причин.', scaleWeights: { cycloid: 2 } },
      { id: 'pdo_q3', text: 'Мне трудно переносить критику в свой адрес.', scaleWeights: { sensitive: 2 } },
      { id: 'pdo_q4', text: 'Я предпочитаю соглашаться с мнением большинства.', scaleWeights: { conformal: 2 } },
      { id: 'pdo_q5', text: 'Мне сложно заставить себя выполнять скучные дела.', scaleWeights: { unstable: 2, hyperthymic: 1 } },
      { id: 'pdo_q6', text: 'Даже небольшие трудности надолго меня расстраивают.', scaleWeights: { sensitive: 1, cycloid: 1 } },
      { id: 'pdo_q7', text: 'Я редко спорю, даже если не согласен.', scaleWeights: { conformal: 2 } },
      { id: 'pdo_q8', text: 'Я часто действую импульсивно, а потом сожалею.', scaleWeights: { unstable: 2, cycloid: 1 } }
    ]
  }
];

module.exports = {
  tests,
  getTest(slug) {
    return tests.find((test) => test.slug === slug);
  }
};
