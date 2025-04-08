/**************************************************************
 * Constructor function untuk membuat objek pertanyaan.
 * ------------------------------------------------------------
 * question             : string berisi teks pertanyaan
 * questionCategory     : kategori pertanyaan (string)
 * responseOptions      : array string jawaban
 * responseOptionScores : array number bobot skor masing-masing jawaban
 * userResponse         : index jawaban user di array responseOptions (belum diisi)
 **************************************************************/
function Question(question, questionCategory, responseOptions, responseOptionScores) {
    this.question = question;
    this.questionCategory = questionCategory;
    this.responseOptions = responseOptions;
    this.responseOptionScores = responseOptionScores;
    this.userResponse; // Belum diisi sampai user menjawab
}

/**************************************************************
 * Fungsi utama untuk menampilkan satu pertanyaan di halaman
 * dengan progress bar dan opsi jawaban berbentuk lingkaran.
 * ------------------------------------------------------------
 * Param: questionObject (objek question yang ingin ditampilkan)
 **************************************************************/
function askQuestion(questionObject) {
    // 1. Bersihkan elemen utama
    let bannerEl = document.getElementById("banner-image");
    bannerEl.innerText = "";
    let mainEl = document.getElementsByTagName("main")[0];
    mainEl.innerText = "";

    // 2. Hitung progress berdasarkan jumlah pertanyaan yang sudah dijawab.
    // Karena pertanyaan baru belum didaftarkan ke questionsAlreadyAsked,
    // pada tampilan pertama nilai answeredCount akan tetap 0.
    let answeredCount = questionsAlreadyAsked.length; // Pertanyaan yang sudah dijawab
    let totalCount = questionObjects.length;            // Total pertanyaan
    let progressPercent = Math.round((answeredCount / totalCount) * 100);

    // 3. Buat kontainer progress bar
    let progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    // 3a. Bagian kiri: Menampilkan persentase progress (misalnya "0%")
    let progressLeft = document.createElement("div");
    progressLeft.className = "progress-left";
    progressLeft.innerText = progressPercent + "%";

    // 3b. Bagian tengah: Garis progress dengan fill yang lebarnya sesuai persentase
    let progressLine = document.createElement("div");
    progressLine.className = "progress-line";
    progressLine.style.position = "relative";
    let progressFill = document.createElement("div");
    progressFill.style.backgroundColor = "#047857";
    progressFill.style.height = "6px";
    progressFill.style.width = progressPercent + "%";
    progressFill.style.borderRadius = "3px";
    progressLine.appendChild(progressFill);

    // 3c. Bagian kanan: Menampilkan "Step X of Y"
    let progressRight = document.createElement("div");
    progressRight.className = "progress-right";
    // Karena pertanyaan yang sudah dijawab = answeredCount, maka langkah yang ditampilkan adalah answeredCount + 1
    progressRight.innerText = `Step ${answeredCount + 1} of ${totalCount}`;

    // Gabungkan semua bagian progress ke dalam container
    progressContainer.appendChild(progressLeft);
    progressContainer.appendChild(progressLine);
    progressContainer.appendChild(progressRight);

    // 4. Tambahkan progressContainer ke halaman utama
    mainEl.appendChild(progressContainer);

    // 5. Buat prompt atau instruksi di bagian atas
    let promptEl = document.createElement("h2");
    promptEl.className = "question-prompt";
    promptEl.innerText = "Choose how accurately each statement reflects you.";
    mainEl.appendChild(promptEl);

    // 6. (Opsional) Tampilkan nomor pertanyaan
    let questionTitle = document.createElement("h3");
    questionTitle.className = "old-question-title";
    // Cari indeks pertanyaan yang sedang ditampilkan
    let questionIndex;
    for (let i = 0; i < questionObjects.length; i++) {
        if (questionObjects[i].question === questionObject.question) {
            questionIndex = i;
            break;
        }
    }
    questionTitle.innerText = `Question ${questionIndex + 1} of ${totalCount}`;
    mainEl.appendChild(questionTitle);

    // 7. Tampilkan teks pertanyaan
    let questionEl = document.createElement("p");
    questionEl.className = "question-text";
    questionEl.innerText = questionObject.question;
    mainEl.appendChild(questionEl);

    // 8. Buat elemen <ul> untuk menampilkan opsi jawaban (berbentuk lingkaran)
    let answersEl = document.createElement("ul");
    answersEl.className = "circle-options";

    // Loop semua opsi jawaban
    for (let i = 0; i < questionObject.responseOptions.length; i++) {
        // Buat <li> pembungkus
        let liEl = document.createElement("li");

        // Buat label sebagai container tiap opsi
        let labelEl = document.createElement("label");
        labelEl.className = "option-label";

        // Buat input radio
        let inputEl = document.createElement("input");
        inputEl.type = "radio";      // atau "checkbox" jika ingin multiple choice
        inputEl.name = "question";   // gunakan name yang sama untuk satu pertanyaan
        inputEl.value = i;           // simpan indeks jawaban
        // (opsional) Jika userResponse sudah terisi, tandai 'checked'
        if (questionObject.userResponse === i) {
            inputEl.checked = true;
        }

        // Buat span untuk lingkaran kosong
        let circleSpan = document.createElement("span");
        circleSpan.className = "circle";

        // Buat div untuk teks jawaban
        let textDiv = document.createElement("div");
        textDiv.className = "option-text";
        textDiv.innerText = questionObject.responseOptions[i];

        // Gabungkan input, circle, dan teks ke dalam label
        labelEl.appendChild(inputEl);
        labelEl.appendChild(circleSpan);
        labelEl.appendChild(textDiv);

        // Masukkan label ke dalam <li>
        liEl.appendChild(labelEl);

        // Masukkan <li> ke dalam <ul> jawaban
        answersEl.appendChild(liEl);
    }

    // Tambahkan <ul> jawaban ke elemen utama
    mainEl.appendChild(answersEl);

    // 9. Pasang event listener pada <ul> 
    answersEl.addEventListener("click", handleResponse);
}

/**************************************************************
 * Fungsi yang menangani event klik jawaban user. 
 * ------------------------------------------------------------
 * 1. Mencatat jawaban user (index pada array responseOptions).
 * 2. Menambahkan pertanyaan tersebut ke array questionsAlreadyAsked
 *    setelah user memilih jawaban.
 * 3. Jika semua pertanyaan sudah dijawab, panggil getResults().
 *    Jika belum, panggil askNextQuestion() untuk menampilkan pertanyaan selanjutnya.
 **************************************************************/
function handleResponse(event) {
    let elementClicked = event.target;
    // Hanya proses jika klik pada elemen <li>
    if (elementClicked.tagName !== 'LI') {
        return;
    }

    // Cari pertanyaan yang sedang ditampilkan berdasarkan teks dari <p>
    for (let i = 0; i < questionObjects.length; i++) {
        if (document.getElementsByTagName("p")[0].innerText === questionObjects[i].question) {
            // Catat index jawaban user yang diklik
            let clickedIndex = Array.from(elementClicked.parentNode.children).indexOf(elementClicked);
            questionObjects[i].userResponse = clickedIndex;
            // Tambahkan pertanyaan ini ke array questionsAlreadyAsked jika belum ada
            if (!questionsAlreadyAsked.includes(questionObjects[i])) {
                questionsAlreadyAsked.push(questionObjects[i]);
            }
            break;
        }
    }

    // Jika semua pertanyaan sudah dijawab, tampilkan hasil; jika belum, lanjut ke pertanyaan berikutnya.
    if (questionsAlreadyAsked.length === questionObjects.length) {
        getResults();
    } else {
        askNextQuestion();
    }
}

/**************************************************************
 * Fungsi untuk memilih pertanyaan selanjutnya yang akan ditampilkan.
 * ------------------------------------------------------------
 * Memeriksa setiap pertanyaan dan jika pertanyaan tersebut belum pernah
 * dijawab (belum ada di questionsAlreadyAsked), maka langsung menampilkannya.
 **************************************************************/
function askNextQuestion() {
    for (let i = 0; i < questionObjects.length; i++) {
        // Jika pertanyaan belum ada di array questionsAlreadyAsked, tampilkan pertanyaan tersebut.
        if (!questionsAlreadyAsked.includes(questionObjects[i])) {
            askQuestion(questionObjects[i]);
            break;
        }
    }
}

/**************************************************************
 * Fungsi untuk menghitung skor akhir dan menyiapkan data
 * untuk ditampilkan di chart.
 * ------------------------------------------------------------
 * 1. Mengelompokkan pertanyaan berdasarkan kategori unik.
 * 2. Menjumlahkan skor berdasarkan jawaban user untuk setiap kategori.
 * 3. Memanggil fungsi showResults() untuk menampilkan chart.
 **************************************************************/
function getResults() {
    // 1. Dapatkan kategori pertanyaan yang unik
    let questionCategories = [];
    let sumOfEachCategory = [];
    for (let i = 0; i < questionObjects.length; i++) {
        if (!questionCategories.includes(questionObjects[i].questionCategory)) {
            questionCategories.push(questionObjects[i].questionCategory);
            sumOfEachCategory.push(0);
        }
    }

    // 2. Jumlahkan skor per kategori dari setiap pertanyaan
    for (let j = 0; j < questionObjects.length; j++) {
        let catIndex = questionCategories.indexOf(questionObjects[j].questionCategory);
        let userRespIndex = Number(questionObjects[j].userResponse);
        sumOfEachCategory[catIndex] += questionObjects[j].responseOptionScores[userRespIndex];
    }

    // 3. Tampilkan hasil dengan memanggil showResults()
    showResults(questionCategories, sumOfEachCategory);
}

/**************************************************************
 * Fungsi untuk menampilkan hasil akhir (chart dan deskripsi).
 * ------------------------------------------------------------
 * x : array string untuk label (kategori)
 * y : array number untuk skor final tiap kategori
 **************************************************************/
function showResults(x, y) {
    // Bersihkan halaman utama
    let mainEl = document.getElementsByTagName("main")[0];
    mainEl.innerText = "";

    // Buat judul halaman hasil
    let titleEl = document.createElement("h1");
    titleEl.innerText = "Questionnaire Results";
    titleEl.setAttribute("id", "results-h1");
    mainEl.appendChild(titleEl);

    // Buat container untuk chart
    let canvasContainer = document.createElement("div");
    canvasContainer.setAttribute("class", "chart-divs");
    mainEl.appendChild(canvasContainer);

    // Buat elemen canvas untuk menampilkan chart menggunakan Chart.js
    let canvasEl = document.createElement("canvas");
    canvasContainer.appendChild(canvasEl);
    let ctx = canvasEl.getContext("2d");

    // Buat chart bar dengan data dan konfigurasi
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: x,
            datasets: [{
                label: 'Score',
                data: y,
                backgroundColor: '#6B88D1'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '% of Maximum Possible Score'
                    }
                }
            }
        }
    });

    // (Opsional) Tambahkan credit atau informasi sumber di sini
    let creditEl = document.createElement("p");
    creditEl.setAttribute("id", "credit-p");
    creditEl.innerText = "";
    mainEl.appendChild(creditEl);

    // Data deskripsi masing-masing kategori kondisi mental
    let descriptionObjects = {
        conditions: [
            'Depression', 'Generalized Anxiety', 'Social Anxiety',
            'ADHD', 'Gender Dysphoria', 'PTSD'
        ],
        links: [
            'https://www.nimh.nih.gov/health/topics/depression',
            'https://www.nimh.nih.gov/health/publications/generalized-anxiety-disorder-gad',
            'https://www.nimh.nih.gov/health/statistics/social-anxiety-disorder',
            'https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd',
            'https://en.wikipedia.org/wiki/Gender_dysphoria',
            'https://www.nimh.nih.gov/health/topics/post-traumatic-stress-disorder-ptsd'
        ],
        descriptions: [
            `Depression (major depressive disorder or clinical depression) is a common but serious mood disorder. It causes severe symptoms that affect how you feel, think, and handle daily activities.`,
            `Occasional anxiety is normal, but people with GAD feel extremely worried or nervous about many things—even tanpa alasan yang jelas.`,
            `Social anxiety disorder ditandai dengan ketakutan yang persisten terhadap situasi sosial dimana orang merasa diawasi atau diperiksa oleh orang lain.`,
            `ADHD ditandai dengan pola kurang perhatian dan/atau hiperaktif-impulsif yang mengganggu fungsi sehari-hari.`,
            `Gender dysphoria adalah stres yang dirasakan seseorang akibat ketidaksesuaian antara identitas gender dan jenis kelamin yang ditetapkan saat lahir.`,
            `PTSD adalah gangguan yang muncul setelah seseorang mengalami kejadian traumatis atau berbahaya.`
        ],
        source: [
            'National Institute of Mental Health',
            'National Institute of Mental Health',
            'National Institute of Mental Health',
            'National Institute of Mental Health',
            'Wikipedia',
            'National Institute of Mental Health'
        ]
    };

    // Buat container untuk menampilkan deskripsi tiap kondisi
    let figureContainer = document.createElement("div");
    figureContainer.setAttribute("id", "figure-container");

    // Loop setiap kondisi dan tampilkan dengan link, deskripsi, dan sumbernya.
    for (let i = 0; i < descriptionObjects.conditions.length; i++) {
        let definitionFig = document.createElement("figure");
        figureContainer.appendChild(definitionFig);

        let link = document.createElement("figcaption");
        link.innerText = descriptionObjects.conditions[i];
        definitionFig.appendChild(link);

        let quote = document.createElement("blockquote");
        quote.innerText = descriptionObjects.descriptions[i];
        definitionFig.appendChild(quote);

        let source = document.createElement("a");
        source.innerText = descriptionObjects.source[i];
        source.href = descriptionObjects.links[i];
        definitionFig.appendChild(source);
    }

    mainEl.appendChild(figureContainer);
}

/**************************************************************
 * Bank pertanyaan dan inisialisasi array questionObjects.
 * Data di bawah ini terdiri dari kategori, pertanyaan, opsi jawaban,
 * dan skor untuk masing-masing opsi.
 **************************************************************/
let QuestionCategory = [
    'Depression', 'Depression', 'Depression',
    'Generalized Anxiety', 'Generalized Anxiety',
    'Social Anxiety', 'Social Anxiety', 'Social Anxiety', 'Social Anxiety', 'Social Anxiety',
    'ADHD', 'ADHD', 'ADHD', 'ADHD', 'ADHD', 'ADHD',
    'Gender Dysphoria', 'Gender Dysphoria', 'Gender Dysphoria', 'Gender Dysphoria', 'Gender Dysphoria',
    'PTSD', 'PTSD', 'PTSD'
];
let Questions = [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Thoughts that you would be better off dead, or thoughts of hurting yourself in some way?',
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'I find it difficult to mix comfortably with the people I work with.',
    'I am at ease meeting people at parties, etc.',
    'I have difficulty talking with other people.',
    'I worry about expressing myself in case I appear awkward.',
    'I find myself worrying that I won\'t know what to say in social situations.',
    'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    'How often do you have problems remembering appointments or obligations?',
    'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
    'Every time someone treats me like my assigned sex I feel hurt',
    'It feels good to live as my affirmed gender',
    'A life in my affirmed gender is more attractive for me than a life in my assigned sex',
    'I wish I had been born as my affirmed gender',
    'I feel unhappy when someone misgenders me',
    'Memories of trauma come to mind at unwanted moments',
    'At random times, I feel a burst of anger and/or guilt about past trauma',
    'I feel a physical effect when remembering a past trauma, effects can range from racing pulse, excessive sweating, chills or shaking?'
];
let ResponseOptions = [
    ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
    ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
    ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
    ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
    ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
    ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    ['Disagree completely', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Agree completely'],
    ['Disagree completely', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Agree completely'],
    ['Disagree completely', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Agree completely'],
    ['Disagree completely', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Agree completely'],
    ['Disagree completely', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Agree completely'],
    ['Disagree completely', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Agree completely'],
    ['Disagree completely', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Agree completely'],
    ['Disagree completely', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Agree completely']
];
let ScoringKey = [
    [0, 11.11, 22.22, 33.33],
    [0, 11.11, 22.22, 33.33],
    [0, 11.11, 22.22, 33.33],
    [0, 16.67, 33.33, 50],
    [0, 16.67, 33.33, 50],
    [0, 5, 10, 15, 20],
    [20, 15, 10, 5, 0],
    [0, 5, 10, 15, 20],
    [0, 5, 10, 15, 20],
    [0, 5, 10, 15, 20],
    [0, 0, 16.67, 16.67, 16.67],
    [0, 0, 16.67, 16.67, 16.67],
    [0, 0, 16.67, 16.67, 16.67],
    [0, 0, 0, 16.67, 16.67],
    [0, 0, 0, 16.67, 16.67],
    [0, 0, 0, 16.67, 16.67],
    [0, 0, 0, 10, 20],
    [0, 0, 0, 10, 20],
    [0, 0, 0, 10, 20],
    [0, 0, 0, 10, 20],
    [0, 0, 0, 10, 20],
    [0, 0, 0, 16.67, 33.33],
    [0, 0, 0, 16.67, 33.33],
    [0, 0, 0, 16.67, 33.33]
];

// Buat array questionObjects yang berisi objek-objek pertanyaan
let questionObjects = [];
for (let i = 0; i < Questions.length; i++) {
    let tempObj = new Question(
        Questions[i],
        QuestionCategory[i],
        ResponseOptions[i],
        ScoringKey[i]
    );
    questionObjects.push(tempObj);
}

// Array untuk melacak pertanyaan yang sudah dijawab
let questionsAlreadyAsked = [];

// Pasang event listener pada tombol "Start" di HTML
document.getElementById("yes").addEventListener("click", askNextQuestion);
