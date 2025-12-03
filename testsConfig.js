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
      { id: 'mlo_q12', text: 'Принимаю ответственность за последствия своих решений.', scaleWeights: { moral_norms: 1, behavior_regulation: 1, self_regulation: 1, adaptivity: 1 } },
      { id: 'mlo_q13', text: 'Могу быстро выстроить контакт с незнакомыми людьми.', scaleWeights: { communication: 2, social_inclusion: 1 } },
      { id: 'mlo_q14', text: 'Даже при усталости нахожу силы завершить начатое.', scaleWeights: { motivation: 2, self_regulation: 1, neuro_resilience: 1 } },
      { id: 'mlo_q15', text: 'Открыт к обратной связи и могу менять свои привычки.', scaleWeights: { flexibility: 1, self_acceptance: 1, adaptivity: 2 } },
      { id: 'mlo_q16', text: 'Стараюсь понимать ценности команды и работать в их рамках.', scaleWeights: { moral_norms: 1, communication: 1, social_inclusion: 2 } },
      { id: 'mlo_q17', text: 'Сохраняю самообладание в очередях, пробках и других стрессовых ситуациях.', scaleWeights: { neuro_resilience: 2, self_regulation: 1 } },
      { id: 'mlo_q18', text: 'Умею просить помощь и делегировать задачи.', scaleWeights: { social_inclusion: 1, communication: 1, adaptivity: 1, behavior_regulation: 1 } },
      { id: 'mlo_q19', text: 'Ценю структуру и заранее продумываю шаги.', scaleWeights: { behavior_regulation: 2, motivation: 1 } },
      { id: 'mlo_q20', text: 'Если допускаю ошибку, умею быстро восстановиться и продолжить.', scaleWeights: { neuro_resilience: 1, self_acceptance: 1, adaptivity: 2 } },
      { id: 'mlo_q21', text: 'Осознанно распределяю ресурсы и не выгораю.', scaleWeights: { self_regulation: 2, motivation: 1 } },
      { id: 'mlo_q22', text: 'Комфортно чувствую себя в новых коллективах.', scaleWeights: { social_inclusion: 1, communication: 2, adaptivity: 1 } },
      { id: 'mlo_q23', text: 'Готов защищать свои ценности и интересы корректно и уважительно.', scaleWeights: { moral_norms: 1, communication: 1, self_acceptance: 1 } },
      { id: 'mlo_q24', text: 'Предпочитаю гибкость, а не жёсткие правила, когда это помогает делу.', scaleWeights: { flexibility: 2, adaptivity: 1, behavior_regulation: 1 } }
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
      { key: 'hyperthymic', label: 'Гипертимность', detail: 'Оптимистичность, активность, общительность.' },
      { key: 'dysthymic', label: 'Дистимичность', detail: 'Склонность к сниженным настроениям, серьёзности.' },
      { key: 'anxious', label: 'Тревожность', detail: 'Неуверенность, ожидание неудачи, осторожность.' },
      { key: 'cyclothymic', label: 'Циклотимность', detail: 'Чередование подъёмов и спадов настроения.' },
      { key: 'emotive', label: 'Эмотивность', detail: 'Глубина переживаний, чувствительность к людям.' },
      { key: 'exalted', label: 'Экзальтированность', detail: 'Склонность к бурным эмоциям, восторженность.' }
    ],
    questions: [
      { id: 'shmishek_q1', text: 'Мне нравится быть в центре внимания.', scaleWeights: { demonstrative: 2, hyperthymic: 1 } },
      { id: 'shmishek_q2', text: 'Я долго помню несправедливость по отношению ко мне.', scaleWeights: { stuck: 2 } },
      { id: 'shmishek_q3', text: 'Я предпочитаю действовать по четким правилам и планам.', scaleWeights: { pedantic: 2 } },
      { id: 'shmishek_q4', text: 'Иногда я резко реагирую на мелкие замечания.', scaleWeights: { excitable: 2, stuck: 1 } },
      { id: 'shmishek_q5', text: 'Я часто испытываю подъем настроения и энергии.', scaleWeights: { hyperthymic: 2, demonstrative: 1 } },
      { id: 'shmishek_q6', text: 'Я тщательно проверяю свою работу перед сдачей.', scaleWeights: { pedantic: 2, anxious: 1 } },
      { id: 'shmishek_q7', text: 'Даже незначительные конфликты выводят меня из себя.', scaleWeights: { excitable: 2 } },
      { id: 'shmishek_q8', text: 'Мне легко подружиться и поддерживать беседу.', scaleWeights: { hyperthymic: 2, demonstrative: 1 } },
      { id: 'shmishek_q9', text: 'Часто переживаю, что что-то пойдёт не так.', scaleWeights: { anxious: 2, pedantic: 1 } },
      { id: 'shmishek_q10', text: 'В плохом настроении я становлюсь молчаливым и мрачным.', scaleWeights: { dysthymic: 2, cyclothymic: 1 } },
      { id: 'shmishek_q11', text: 'Мои эмоции быстро меняются: от подъёма к спаду.', scaleWeights: { cyclothymic: 2 } },
      { id: 'shmishek_q12', text: 'Сильно переживаю чужие беды и радости.', scaleWeights: { emotive: 2, exalted: 1 } },
      { id: 'shmishek_q13', text: 'Склонен преувеличивать свои успехи и недостатки.', scaleWeights: { demonstrative: 2 } },
      { id: 'shmishek_q14', text: 'Если меня критикуют, тяжело отпускаю ситуацию.', scaleWeights: { stuck: 2, anxious: 1 } },
      { id: 'shmishek_q15', text: 'Люблю порядок в вещах и документах.', scaleWeights: { pedantic: 2 } },
      { id: 'shmishek_q16', text: 'В порыве эмоций могу наговорить резких слов.', scaleWeights: { excitable: 2 } },
      { id: 'shmishek_q17', text: 'Мне сложно усидеть без дела, хочется быть в движении.', scaleWeights: { hyperthymic: 2, excitable: 1 } },
      { id: 'shmishek_q18', text: 'Часто размышляю о смысле жизни и серьёзных темах.', scaleWeights: { dysthymic: 2 } },
      { id: 'shmishek_q19', text: 'Иногда меня охватывает беспричинная тревога.', scaleWeights: { anxious: 2 } },
      { id: 'shmishek_q20', text: 'Моё настроение зависит от погоды или мелких событий.', scaleWeights: { cyclothymic: 2, emotive: 1 } },
      { id: 'shmishek_q21', text: 'Я очень эмоционально реагирую на музыку, фильмы, встречи.', scaleWeights: { emotive: 2, exalted: 2 } },
      { id: 'shmishek_q22', text: 'Люблю рассказывать истории, чтобы произвести впечатление.', scaleWeights: { demonstrative: 2 } },
      { id: 'shmishek_q23', text: 'Часто мысленно возвращаюсь к старым обидам.', scaleWeights: { stuck: 2 } },
      { id: 'shmishek_q24', text: 'Делаю дела неторопливо, но довожу до идеала.', scaleWeights: { pedantic: 2, dysthymic: 1 } },
      { id: 'shmishek_q25', text: 'Моя речь и движения бывают резкими.', scaleWeights: { excitable: 2 } },
      { id: 'shmishek_q26', text: 'Часто бываю душой компании.', scaleWeights: { hyperthymic: 2, exalted: 1 } },
      { id: 'shmishek_q27', text: 'Предпочитаю спокойные виды отдыха и одиночество.', scaleWeights: { dysthymic: 2 } },
      { id: 'shmishek_q28', text: 'Постоянно проверяю, всё ли сделал правильно.', scaleWeights: { anxious: 2, pedantic: 1 } },
      { id: 'shmishek_q29', text: 'Моё настроение может резко улучшиться без видимых причин.', scaleWeights: { cyclothymic: 2, exalted: 1 } },
      { id: 'shmishek_q30', text: 'Глубоко сопереживаю героям книг и фильмов.', scaleWeights: { emotive: 2 } },
      { id: 'shmishek_q31', text: 'Стараюсь выглядеть ярко и необычно.', scaleWeights: { demonstrative: 2 } },
      { id: 'shmishek_q32', text: 'С трудом забываю конфликты и возвращаюсь к обычному общению.', scaleWeights: { stuck: 2, excitable: 1 } },
      { id: 'shmishek_q33', text: 'Меня раздражает, когда нарушают установленные правила.', scaleWeights: { pedantic: 2, excitable: 1 } },
      { id: 'shmishek_q34', text: 'Иногда вспыхиваю и так же быстро успокаиваюсь.', scaleWeights: { excitable: 2, cyclothymic: 1 } },
      { id: 'shmishek_q35', text: 'Чувствую внутреннюю энергичность и оптимизм большую часть времени.', scaleWeights: { hyperthymic: 2 } },
      { id: 'shmishek_q36', text: 'Бываю угрюмым и задумчивым без особой причины.', scaleWeights: { dysthymic: 2 } },
      { id: 'shmishek_q37', text: 'Часто волнуюсь перед важными событиями.', scaleWeights: { anxious: 2 } },
      { id: 'shmishek_q38', text: 'Мои эмоции легко передаются окружающим.', scaleWeights: { exalted: 2, emotive: 1 } },
      { id: 'shmishek_q39', text: 'Люблю делиться новыми идеями и вдохновлять других.', scaleWeights: { exalted: 2, demonstrative: 1, hyperthymic: 1 } },
      { id: 'shmishek_q40', text: 'Иногда от восторга или грусти могу прослезиться.', scaleWeights: { emotive: 2, exalted: 1 } }
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
      { id: 'epi_q6', text: 'Я предпочитаю проводить вечер в кругу знакомых людей.', scaleWeights: { extraversion: 2, lie: 1 } },
      { id: 'epi_q7', text: 'Мне свойственно сомневаться после принятия решений.', scaleWeights: { neuroticism: 2 } },
      { id: 'epi_q8', text: 'Я всегда честно выполняю обещания.', scaleWeights: { lie: 2 } },
      { id: 'epi_q9', text: 'Легко вступаю в разговор даже с незнакомыми людьми.', scaleWeights: { extraversion: 2 } },
      { id: 'epi_q10', text: 'Часто чувствую напряжение без видимых причин.', scaleWeights: { neuroticism: 2 } },
      { id: 'epi_q11', text: 'Иногда обещаю больше, чем могу выполнить.', scaleWeights: { lie: 2, neuroticism: 1 } },
      { id: 'epi_q12', text: 'Люблю заниматься рискованными или активными видами отдыха.', scaleWeights: { extraversion: 2 } },
      { id: 'epi_q13', text: 'Даже мелкие неудачи надолго портят мне настроение.', scaleWeights: { neuroticism: 2 } },
      { id: 'epi_q14', text: 'Стараюсь избегать нарушений правил даже в мелочах.', scaleWeights: { lie: 2 } },
      { id: 'epi_q15', text: 'Быстро восстанавливаюсь после стрессовых событий.', scaleWeights: { neuroticism: -2 } },
      { id: 'epi_q16', text: 'Мне нравится быть инициатором встреч и мероприятий.', scaleWeights: { extraversion: 2 } },
      { id: 'epi_q17', text: 'Часто переживаю о будущем.', scaleWeights: { neuroticism: 2 } },
      { id: 'epi_q18', text: 'Даже когда можно схитрить, я выбираю честный путь.', scaleWeights: { lie: 2 } },
      { id: 'epi_q19', text: 'Получаю удовольствие от общения с новыми людьми.', scaleWeights: { extraversion: 2 } },
      { id: 'epi_q20', text: 'Внутренне напряжён перед экзаменами, выступлениями, переговорами.', scaleWeights: { neuroticism: 2 } },
      { id: 'epi_q21', text: 'Избегаю рассказов, которые могли бы выставить меня в лучшем свете.', scaleWeights: { lie: 2 } },
      { id: 'epi_q22', text: 'Часто ищу возможности попробовать что-то новое и активное.', scaleWeights: { extraversion: 2 } },
      { id: 'epi_q23', text: 'Даже после тяжёлого дня сохраняю самообладание.', scaleWeights: { neuroticism: -2 } },
      { id: 'epi_q24', text: 'Стараюсь соответствовать ожиданиям окружающих.', scaleWeights: { lie: 1, neuroticism: 1 } }
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
      { key: 'unstable', label: 'Нестойкий', detail: 'Снижение волевого контроля и дисциплины.' },
      { key: 'astheno', label: 'Астено-невротический', detail: 'Утомляемость, тревожность, сомнения.' },
      { key: 'psychasthenic', label: 'Психастенический', detail: 'Рассудительность, склонность к сомнениям и ритуалам.' },
      { key: 'schizoid', label: 'Шизоидный', detail: 'Закрытость, погружённость в мир идей, дистанцированность.' }
    ],
    questions: [
      { id: 'pdo_q1', text: 'Мне легко знакомиться и заводить разговор первым.', scaleWeights: { hyperthymic: 2 } },
      { id: 'pdo_q2', text: 'Настроение часто меняется без видимых причин.', scaleWeights: { cycloid: 2 } },
      { id: 'pdo_q3', text: 'Мне трудно переносить критику в свой адрес.', scaleWeights: { sensitive: 2 } },
      { id: 'pdo_q4', text: 'Я предпочитаю соглашаться с мнением большинства.', scaleWeights: { conformal: 2 } },
      { id: 'pdo_q5', text: 'Мне сложно заставить себя выполнять скучные дела.', scaleWeights: { unstable: 2, hyperthymic: 1 } },
      { id: 'pdo_q6', text: 'Даже небольшие трудности надолго меня расстраивают.', scaleWeights: { sensitive: 1, cycloid: 1 } },
      { id: 'pdo_q7', text: 'Я редко спорю, даже если не согласен.', scaleWeights: { conformal: 2 } },
      { id: 'pdo_q8', text: 'Я часто действую импульсивно, а потом сожалею.', scaleWeights: { unstable: 2, cycloid: 1 } },
      { id: 'pdo_q9', text: 'Быстро устаю от интенсивной работы и нуждаюсь в отдыхе.', scaleWeights: { astheno: 2 } },
      { id: 'pdo_q10', text: 'Часто сомневаюсь в правильности своих действий.', scaleWeights: { psychasthenic: 2, astheno: 1 } },
      { id: 'pdo_q11', text: 'Предпочитаю одиночные занятия, где могу уйти в себя.', scaleWeights: { schizoid: 2 } },
      { id: 'pdo_q12', text: 'Люблю быть лидером в компании или проекте.', scaleWeights: { hyperthymic: 2, conformal: -1 } },
      { id: 'pdo_q13', text: 'Моё настроение может резко снизиться после удачного периода.', scaleWeights: { cycloid: 2 } },
      { id: 'pdo_q14', text: 'Сильно переживаю, если меня не принимают в группе.', scaleWeights: { sensitive: 2, conformal: 1 } },
      { id: 'pdo_q15', text: 'Часто подстраиваюсь под ожидания окружения.', scaleWeights: { conformal: 2, schizoid: -1 } },
      { id: 'pdo_q16', text: 'Иногда избегаю ответственности, когда становится сложно.', scaleWeights: { unstable: 2 } },
      { id: 'pdo_q17', text: 'С трудом переношу шум и многолюдные места.', scaleWeights: { astheno: 2, sensitive: 1 } },
      { id: 'pdo_q18', text: 'Перед важными шагами обдумываю все варианты и риски.', scaleWeights: { psychasthenic: 2 } },
      { id: 'pdo_q19', text: 'Предпочитаю глубокие разговоры и творческие занятия.', scaleWeights: { schizoid: 2, sensitive: 1 } },
      { id: 'pdo_q20', text: 'Часто беру на себя организацию мероприятий.', scaleWeights: { hyperthymic: 2, conformal: 1 } },
      { id: 'pdo_q21', text: 'В период спада мне сложно заставить себя работать.', scaleWeights: { cycloid: 2, astheno: 1 } },
      { id: 'pdo_q22', text: 'Мне важно, что думают обо мне окружающие.', scaleWeights: { sensitive: 1, conformal: 2 } },
      { id: 'pdo_q23', text: 'Могу бросить начатое дело из-за потери интереса.', scaleWeights: { unstable: 2 } },
      { id: 'pdo_q24', text: 'Волнения нередко переходят в соматические ощущения (боль, усталость).', scaleWeights: { astheno: 2 } },
      { id: 'pdo_q25', text: 'Часто нахожусь в мире собственных идей и наблюдений.', scaleWeights: { schizoid: 2 } }
    ]
  }
];

module.exports = {
  tests,
  getTest(slug) {
    return tests.find((test) => test.slug === slug);
  }
};
