// Shared by the Timeline section and the one-page resume. Newest first. `*...*` in `text` is emphasised.
export const timeline = [
    { when: "2023 — now", what: "PhD in Machine Learning", icon: "🏛️", where: "HuMaLearn Lab — UNamur", text: "Explored the modeling capabilities of Gaussian processes on Venusian atmospheric data" },
    { when: "2021 — 2023", what: "Data Science Master", icon: "🏛️", where: "University of Namur", text: "Presented my master thesis on “Personalised Speech Compression using Deep Learning”" },
    { when: "2018 — 2021", what: "Computer Science Bachelor", icon: "🏛️", where: "University of Namur", text: "Finished my general informatics cursus with *great distinction*" },
    { when: "2000 — 2018", what: "Homeschooling", icon: "🏠", where: "Well... at home!", text: "Spent my childhood being curious and learning by myself (and with my parents)" },
];

// Splits `text` on `*`: odd parts are emphasised
export const emphasised = (text: string) => text.split("*");
