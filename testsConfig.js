const tests = [
  {
    slug: 'smil-mmpi',
    name: 'Тест СМИЛ / MMPI',
    description: 'Сокращенная адаптация СМИЛ (MMPI) по методичке Собчик Л. Н.',
    scales: [
      { key: 'validity', label: 'L – достоверность', detail: 'Оценка тенденции к социально-желательным ответам.' },
      { key: 'anxiety', label: 'F – тревожность', detail: 'Обобщенный уровень напряжения и эмоциональной нестабильности.' },
      { key: 'control', label: 'K – контроль', detail: 'Самоконтроль и способность открыто говорить о трудностях.' },
      { key: 'somatic', label: 'Hs – соматизация', detail: 'Склонность фокусироваться на телесных ощущениях.' },
      { key: 'depression', label: 'D – депрессия', detail: 'Сниженный фон настроения и утомляемость.' }
    ],
    questions: [
      { id: 'smil_q1', text: 'Я стараюсь произвести впечатление безупречного человека.', scaleWeights: { validity: 1, control: 1 } },
      { id: 'smil_q2', text: 'Мне трудно расслабиться и не думать о проблемах.', scaleWeights: { anxiety: 1, depression: 1 } },
      { id: 'smil_q3', text: 'Я редко задумываюсь о своем здоровье.', scaleWeights: { somatic: -1, control: 1 } },
      { id: 'smil_q4', text: 'Близкие считают меня слишком осторожным.', scaleWeights: { validity: 1, anxiety: 1 } },
      { id: 'smil_q5', text: 'В стрессовых ситуациях я сохраняю самообладание.', scaleWeights: { control: 2, anxiety: -1 } },
      { id: 'smil_q6', text: 'Иногда я ощущаю беспричинную усталость.', scaleWeights: { depression: 2, somatic: 1 } },
      { id: 'smil_q7', text: 'Мне сложно открыто говорить о своих переживаниях.', scaleWeights: { control: -1, anxiety: 1 } },
      { id: 'smil_q8', text: 'Мои сомнения часто мешают принять решение.', scaleWeights: { depression: 1, anxiety: 2 } }
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
