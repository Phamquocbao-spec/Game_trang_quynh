"use strict";

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const toastEl = document.getElementById("toast");
const interactEl = document.getElementById("interact");
const interactText = document.getElementById("interact-text");
const objectiveText = document.getElementById("objective-text");
const quoteLine = document.getElementById("quote-line");

const W = canvas.width, H = canvas.height;
const HERO_SPEED = 220;
const keys = new Set();
let lastTime = 0;
let toastTimer = null;

const images = {};
function loadImage(key, src) {
  const image = new Image();
  image.src = src;
  images[key] = image;
}

loadImage("cover", "anh/cover.webp");
loadImage("map", "anh/map.webp");
[
  "quynh_idle", "quynh_walk", "quynh_hack", "quynh_win",
  "emperor_idle", "emperor_point", "emperor_accept",
].forEach(name => loadImage(name, `anh/sprites/${name}.webp`));

const NODES = {
  stage1: { x: 180, y: 485, radius: 54, label: "Ải 1 · Cổng dân gian" },
  stage2: { x: 505, y: 275, radius: 54, label: "Ải 2 · Miếu trí tuệ" },
  stage3: { x: 785, y: 330, radius: 54, label: "Ải 3 · Đối thoại Ngọc Hoàng" },
  gate:   { x: 965, y: 110, radius: 56, label: "Bế Quan" },
};

// 50 câu hỏi (20/20/10), tham khảo nội dung đã chốt trong cuộc trò chuyện.
// Mỗi mục: [câu hỏi, A, B, C, D, chỉ số đáp án (0–3), giải thích].
const QUESTION_BANK = [
  [
    ["Thân em vốn ở bụi tre, trời oi thì mở, trời se lại gấp. Em là gì?", "Quạt giấy", "Nón lá", "Chiếc chiếu", "Cái nia", 0, "Quạt giấy truyền thống thường làm từ nan tre và giấy."],
    ["Không chân mà chạy khắp đồng, không miệng mà hát bên dòng tre xanh. Là gì?", "Cái cày", "Dòng nước", "Cái chum", "Đèn dầu", 1, "Nước chảy tạo ra tiếng róc rách."],
    ["Con gì hai sừng trên đầu, ăn cỏ, kéo cày giúp người nhà nông?", "Con dê", "Con trâu", "Con ngựa", "Con lợn", 1, "Trâu gắn liền với nền văn minh lúa nước."],
    ["Vật gì nhiều răng nhưng không thể cắn?", "Cái cưa", "Cái lược", "Cái kéo", "Cái nơm", 1, "Răng lược chỉ dùng để chải tóc."],
    ["Vật gì có cổ nhưng chẳng có đầu, có thân nhưng chẳng có tay chân?", "Cái chai", "Cái bàn", "Cái chổi", "Cái rổ", 0, "Cổ chai là phần hẹp phía trên thân chai."],
    ["Mình tròn, mặc áo lá xanh, bên trong nếp đỗ thịt lành ngày xuân. Là bánh gì?", "Bánh giầy", "Bánh ít", "Bánh tét", "Bánh gai", 2, "Bánh tét hình trụ, thường gói lá chuối."],
    ["Bánh gì vuông vức, lá xanh, gạo nếp đậu thịt, tượng trưng đất trời?", "Bánh chưng", "Bánh cuốn", "Bánh đúc", "Bánh bèo", 0, "Bánh chưng thường có hình vuông."],
    ["Vật gì đầu nhọn, thân dài, giúp mẹ vá áo, luồn hoài sợi tơ?", "Cây kim", "Cái kéo", "Cái thoi", "Cái đục", 0, "Kim khâu có lỗ để luồn chỉ."],
    ["Vật gì đứng giữa sân đình, đánh lên một tiếng cả làng đều nghe?", "Cái chuông", "Cái trống", "Cái mõ", "Cái sáo", 1, "Trống đình dùng trong sinh hoạt và lễ hội."],
    ["Đêm rằm treo giữa trời cao, tròn như chiếc đĩa, sáng vào sân quê. Là gì?", "Mặt trời", "Đèn lồng", "Mặt trăng", "Đom đóm", 2, "Trăng tròn xuất hiện vào khoảng ngày rằm âm lịch."],
    ["Cái gì có mặt, có kim, có số nhưng chẳng có mắt?", "Đồng hồ", "Cái nón", "Cái gương", "Cái cân", 0, "Đồng hồ có mặt số và kim chỉ giờ."],
    ["Vật gì càng lau càng ướt?", "Mặt bàn", "Cái khăn lau", "Cái chổi", "Cái quạt", 1, "Khăn thấm nước từ đồ vật."],
    ["Cái gì càng đốt càng ngắn?", "Cây tre", "Cây nến", "Cái thước", "Cái đòn gánh", 1, "Nến cháy dần và ngắn lại."],
    ["Không cánh mà bay, không chân mà chạy, đi qua ngọn tre làm lá lao xao. Là gì?", "Gió", "Mưa", "Mây", "Sương", 0, "Gió làm lá cây rung động."],
    ["Con gì đội nhà trên lưng, đi chậm thong thả, chẳng cần thuê nhà?", "Con cua", "Con rùa", "Con cá", "Con cò", 1, "Mai rùa được ví như ngôi nhà."],
    ["Cái gì đi thì nằm, đứng cũng nằm, chỉ khi nằm mới đứng?", "Bàn chân", "Cái nón", "Cái ghế", "Cái võng", 0, "Khi nằm, bàn chân có thể hướng dựng lên."],
    ["Điền tục ngữ: Có công mài sắt, có ngày nên...", "Dao", "Kim", "Vàng", "Bạc", 1, "Câu tục ngữ đề cao sự kiên trì."],
    ["Điền tục ngữ: Uống nước nhớ...", "Người uống", "Nguồn", "Dòng sông", "Cái giếng", 1, "Nhắc nhớ lòng biết ơn cội nguồn."],
    ["Điền tục ngữ: Một cây làm chẳng nên non, ba cây chụm lại nên...", "Ngọn núi", "Hòn núi cao", "Rừng sâu", "Đồng xanh", 1, "Đề cao sức mạnh đoàn kết."],
    ["Trên bàn có 5 quả cau. Trạng Quỳnh lấy đi 2 quả. Trạng đang có mấy quả?", "2", "3", "5", "7", 0, "Hỏi số quả Trạng lấy được, không phải số quả còn trên bàn."]
  ],
  [
    ["Ba người cùng đi qua cầu: hai cha và hai con. Vì sao chỉ có ba người?", "Một người đi hai lần", "Ông, cha và con", "Có người vô hình", "Một người không qua cầu", 1, "Người cha ở giữa vừa là con của ông, vừa là cha của cháu."],
    ["Trong sân có 10 con gà. Tất cả trừ 3 con chạy ra vườn. Còn bao nhiêu con trong sân?", "7", "10", "3", "0", 2, "Tất cả trừ 3 nghĩa là còn 3."],
    ["Có 8 ngọn đèn dầu đang cháy. Gió thổi tắt 3 ngọn, các ngọn còn lại cháy hết dầu. Cuối cùng còn bao nhiêu ngọn chưa cháy hết?", "3", "5", "8", "0", 0, "Ba ngọn bị tắt vẫn còn dầu, giả sử chúng không được thắp lại."],
    ["Một người đi dưới mưa, không nón không ô, nhưng tóc không ướt. Tại sao?", "Đi rất nhanh", "Người ấy hói đầu", "Mưa rất nhỏ", "Có phép thuật", 1, "Người ấy không có tóc để ướt."],
    ["Một tháng có 28 ngày. Hỏi có bao nhiêu tháng trong năm có ít nhất 28 ngày?", "1", "2", "11", "12", 3, "Cả 12 tháng đều có ít nhất 28 ngày."],
    ["Một con trâu bị buộc dây dài 5 mét, cỏ ngon cách 8 mét. Nó vẫn ăn được, tại sao?", "Dây co giãn", "Trâu biết bay", "Đầu kia dây không buộc cố định", "Cỏ tự mọc gần", 2, "Đề chỉ nói dây buộc vào trâu, không nói đầu kia được neo."],
    ["Trạng Quỳnh có một que diêm, bước vào phòng tối có đèn dầu, nến và bếp củi. Thắp gì trước?", "Đèn dầu", "Que diêm", "Nến", "Bếp củi", 1, "Phải thắp que diêm trước."],
    ["Có 4 người cùng chơi cờ, mỗi người chơi một ván với từng người khác. Có bao nhiêu ván?", "4", "6", "8", "12", 1, "Số cặp là 4 × 3 / 2 = 6."],
    ["Một chiếc thuyền chở 12 người. 5 người lên bờ, 3 người xuống thuyền. Còn bao nhiêu người trên thuyền?", "8", "9", "10", "14", 2, "12 − 5 + 3 = 10."],
    ["Thứ gì càng lấy đất ra thì càng lớn?", "Đống đất", "Cái hố", "Cái cây", "Hòn đá", 1, "Đào thêm đất làm hố rộng hoặc sâu hơn."],
    ["Một người nói: 'Tôi không có anh chị em. Cha của người trong tranh là con trai của cha tôi.' Người trong tranh là ai?", "Cha của người nói", "Con trai của người nói", "Ông nội", "Cháu họ", 1, "Con trai của cha tôi chính là tôi, nên người trong tranh là con tôi."],
    ["Có 3 chiếc rương: một chứa vàng, một chứa bạc, một chứa đá. Biết rương vàng không ở bên trái, rương đá ở bên phải. Rương vàng ở đâu?", "Bên trái", "Ở giữa", "Bên phải", "Không đủ dữ kiện", 1, "Đá ở phải, vàng không ở trái nên vàng ở giữa."],
    ["Một người cần qua sông với sói, dê và rau. Thuyền chỉ chở người và một món. Phải chở gì sang trước?", "Sói", "Rau", "Dê", "Món nào cũng được", 2, "Đưa dê sang trước để không để sói ăn dê hoặc dê ăn rau."],
    ["Một cái cân thăng bằng: 2 quả bưởi nặng bằng 6 quả cam cùng loại. Một quả bưởi nặng bằng mấy quả cam?", "2", "3", "4", "6", 1, "Chia hai vế cho 2."],
    ["Bạn vượt qua người đang đứng thứ hai trong cuộc đua. Bạn đứng thứ mấy?", "Thứ nhất", "Thứ hai", "Thứ ba", "Cuối cùng", 1, "Bạn chiếm vị trí thứ hai."],
    ["Có hai tờ tiền tổng cộng 15.000 đồng, một tờ không phải 5.000 đồng. Hai tờ là gì?", "10.000 và 5.000", "10.000 và 2.000", "5.000 và 5.000", "Không thể có", 0, "Một tờ là 10.000 đồng, tờ còn lại là 5.000 đồng."],
    ["Một chiếc áo phơi khô trong 1 giờ. Nếu phơi 5 chiếc áo cùng lúc trong điều kiện tương tự thì cần bao lâu?", "5 giờ", "2 giờ", "1 giờ", "30 phút", 2, "Phơi đồng thời, đủ không gian và điều kiện như nhau."],
    ["Một người có 17 con trâu, tất cả trừ 9 con bị bán. Còn lại mấy con?", "8", "9", "17", "0", 1, "Còn 9 con không bị bán."],
    ["Có ba túi: túi đỏ chỉ có đậu, túi xanh chỉ có lạc, túi vàng chứa cả hai. Tất cả nhãn đều sai. Nên rút một hạt từ túi ghi nhãn nào để xác định cả ba?", "Chỉ đậu", "Chỉ lạc", "Đậu và lạc", "Bất kỳ túi nào", 2, "Túi ghi 'đậu và lạc' chắc chắn chỉ chứa một loại. Một lần rút sẽ xác định túi đó và suy ra hai túi còn lại."],
    ["Trạng cần qua cây cầu chỉ chịu tối đa 100 kg. Trạng nặng 70 kg, mang 2 túi gạo mỗi túi 20 kg. Làm thế nào qua cầu mà không bỏ gạo?", "Mang cả hai cùng lúc", "Đi hai lượt, mỗi lượt một túi", "Nhảy qua cầu", "Không thể", 1, "Mỗi lượt Trạng và một túi nặng 90 kg; cần có cách quay lại lấy túi còn lại."]
  ],
  [
    ["Ngọc Hoàng phán: 'Ta sẽ xử ngươi theo câu nói cuối. Nếu nói thật, ta đày ngươi xuống trần; nếu nói dối, ta nhốt ngươi trong thiên lao.' Trạng nên nói gì để gây nghịch lý?", "Ta là Trạng Quỳnh", "Ngài sẽ nhốt thần trong thiên lao", "Hôm nay trời đẹp", "Thần xin tha", 1, "Nếu nhốt thì lời nói đúng và phải đày; nếu đày thì lời nói sai và phải nhốt."],
    ["Có hai cánh cửa, một sống một chết, với hai lính gác: một luôn nói thật, một luôn nói dối. Chỉ được hỏi một câu. Hỏi gì?", "Cửa nào đẹp hơn?", "Ngươi có nói dối không?", "Nếu hỏi người kia cửa sống ở đâu, hắn sẽ chỉ cửa nào?", "Ta có được sống không?", 2, "Cả hai sẽ chỉ cửa chết; chọn cửa ngược lại."],
    ["Có ba vị thần A, B, C. Một luôn nói thật, một luôn nói dối, một trả lời ngẫu nhiên. Hỏi một câu 'Ngươi có phải thần nói thật không?' có chắc tìm được thần thật không?", "Có", "Không", "Chỉ khi hỏi A", "Chỉ khi hỏi C", 1, "Một câu như vậy không đủ loại trừ mọi khả năng."],
    ["Ngọc Hoàng đưa 9 viên ngọc, một viên nhẹ hơn 8 viên còn lại. Có cân đĩa, cần ít nhất mấy lần cân để chắc chắn tìm được?", "1", "2", "3", "4", 1, "Chia 3 nhóm 3 viên; cân hai nhóm rồi cân hai viên trong nhóm nhẹ hơn."],
    ["Có 3 công tắc bên ngoài và 3 đèn sợi đốt trong phòng kín. Được vào phòng một lần, làm sao biết công tắc nào điều khiển đèn nào?", "Bật cả ba", "Bật A một lúc rồi tắt, bật B và vào phòng", "Chỉ bật C", "Không thể", 1, "Đèn sáng ứng với B, đèn tắt còn ấm ứng với A, đèn tắt nguội ứng với C."],
    ["Ngọc Hoàng nói: 'Ta có 100 viên ngọc, lấy đi 10 rồi lấy tiếp một nửa số còn lại.' Còn mấy viên?", "40", "45", "50", "90", 1, "100 − 10 = 90, lấy nửa 90 thì còn 45."],
    ["Có 5 chiếc mũ: 3 đỏ, 2 xanh. A nhìn thấy mũ B và C, B nhìn thấy mũ C, C không nhìn thấy ai. A nói không biết mũ mình, B cũng nói không biết. C biết mũ mình màu gì?", "Đỏ", "Xanh", "Không thể biết", "Cả hai", 0, "Nếu B và C cùng xanh thì A biết mình đỏ. A không biết nên không thể cả hai xanh. Nếu C xanh, B sẽ suy ra mình đỏ. B không biết nên C đỏ."],
    ["Trạng bị nhốt trong phòng có hai dây cháy không đều, mỗi dây cháy hết đúng 60 phút. Làm sao đo 45 phút?", "Đốt một dây ở một đầu", "Đốt dây A hai đầu, dây B một đầu; khi A hết thì đốt đầu còn lại của B", "Gấp đôi dây", "Không thể", 1, "A hết sau 30 phút. B còn 30 phút thời gian cháy, đốt hai đầu thì hết sau 15 phút nữa."],
    ["Ngọc Hoàng ra lệnh: 'Ngươi phải mang tới thứ mà càng chia sẻ thì người sở hữu càng không mất đi.' Đó là gì?", "Vàng", "Gạo", "Kiến thức", "Nước", 2, "Chia sẻ kiến thức không nhất thiết làm người truyền đạt mất kiến thức."],
    ["Ngọc Hoàng hỏi: 'Nếu luật của ta là không ai được bước qua cổng, ngươi làm sao đi qua mà không phạm luật?'", "Phá cổng", "Bay qua cổng", "Đào hầm dưới cổng", "Đi qua cửa phụ không bị cấm", 3, "Luật chỉ cấm bước qua cổng ấy, không cấm lối khác."]
  ]
];


// Hệ thống rút câu không trùng trong cùng một lượt và tránh trùng bộ câu vừa chơi.
const QUESTION_COUNT = 5;
const QUESTION_TIME_SECONDS = 15;
// Một đồng hồ độc lập cho từng câu, dùng mốc thời gian thực thay vì trừ từng giây.
let questionClock = null;

function clearQuestionClock() {
  if (questionClock) clearInterval(questionClock.intervalId);
  questionClock = null;
}

function startQuestionClock(runToken, onExpired) {
  clearQuestionClock();
  const clock = {
    runToken,
    deadline: performance.now() + QUESTION_TIME_SECONDS * 1000,
    intervalId: null,
    tick: null
  };
  questionClock = clock;
  clock.tick = () => {
    if (questionClock !== clock || runToken !== quizRunToken) return;
    const remainingMs = Math.max(0, clock.deadline - performance.now());
    const countdown = document.getElementById('question-seconds');
    const fill = document.getElementById('question-timer-fill');
    const root = document.getElementById('question-timer');
    if (!countdown || !fill || !root) {
      clearQuestionClock();
      return;
    }
    countdown.textContent = String(Math.ceil(remainingMs / 1000)).padStart(2, '0');
    fill.style.width = `${remainingMs / (QUESTION_TIME_SECONDS * 1000) * 100}%`;
    root.classList.toggle('urgent', remainingMs <= 5000);
    if (remainingMs <= 0) {
      clearQuestionClock();
      onExpired();
    }
  };
  clock.tick();
  if (questionClock === clock) clock.intervalId = setInterval(clock.tick, 75);
}

// Trình duyệt có thể giảm tần suất timer khi chuyển tab; kiểm tra lại ngay khi quay lại.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && questionClock?.tick) questionClock.tick();
});
let questionQueue = [[], [], []];
let lastDraw = [[], [], []];
let quizRunToken = 0;

function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function drawQuestions(stageIndex) {
  const bank = QUESTION_BANK[stageIndex];
  const last = new Set(lastDraw[stageIndex]);
  let available = questionQueue[stageIndex].filter(i => !last.has(i));
  // Sau khi dùng hết lượt câu chưa gặp, làm mới kho nhưng vẫn loại 5 câu vừa chơi.
  if (available.length < QUESTION_COUNT) {
    available = shuffle(bank.map((_, i) => i).filter(i => !last.has(i)));
  }
  const chosen = shuffle(available).slice(0, QUESTION_COUNT);
  questionQueue[stageIndex] = available.filter(i => !chosen.includes(i));
  lastDraw[stageIndex] = chosen;
  return chosen.map(i => {
    const [q, a, b, c, d, answer, explain] = bank[i];
    return { q, options: [a, b, c, d], answer, explain };
  });
}


const QUOTES = {
  intro: "“Càng khó càng vui. Đố mới đúng sở trường của ta!” — Trạng Quỳnh",
  stage1: "“Sức mạnh ư? Ở ải này, trí khôn mới là vũ khí!” — Trạng Quỳnh",
  stage2: "“Câu đố càng khó, đầu óc càng phải sắc.” — Trạng Quỳnh",
  stage3: "“Nếu đã tới được đây, ta xin đối đáp cùng Ngọc Hoàng.” — Trạng Quỳnh",
  gate: "“Bế quan không dành cho kẻ mạnh, mà cho kẻ đủ trí.” — Thiên Luật",
  win: "“Tạ ơn trời đất. Một chuyến bế quan, muôn phần khai trí.” — Trạng Quỳnh"
};

const state = {
  screen: "intro",
  hero: { x: 140, y: 525, tx: 140, ty: 525, moving: false, facing: 1 },
  currentStage: 0,
  unlocked: [true, false, false, false],
  completed: [false, false, false, false],
  modal: null,
  soundOn: true,
  hoverNode: null,
  animationTime: 0, points:0, mistakes:0
};

const NPCS = [
  {x:355,y:445,label:'Lão thư sinh',stage:0,lines:[
    '“Đến cổng đầu tiên, quan giữ cửa không nhận vàng bạc. Chỉ có câu trả lời mới thành chìa khóa!”',
    '“Trạng hãy nhớ: mỗi câu đố có một chi tiết nhỏ đáng chú ý. Chớ vội đoán!”'
  ]},
  {x:645,y:230,label:'Thần giữ sách',stage:1,lines:[
    '“Miếu trí tuệ giấu năm thử thách. Chuyện khó sẽ hóa dễ nếu biết nhìn khác đi.”',
    '“Nếu chưa rõ, hãy dùng nút Gợi ý; trí khôn không sợ đặt câu hỏi.”'
  ]}
];
let stars=Array.from({length:34},(_,i)=>({x:(i*173+47)%W,y:(i*89+41)%H,phase:i*.72}));
let audioContext=null;
function tone(kind='tap'){
  if(!state.soundOn)return;
  try{
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume();
    const notes=kind==='win'?[392,493.9,587.3,783.9]:kind==='correct'?[523.25,659.25]:kind==='wrong'?[220,185]:[330];
    notes.forEach((f,i)=>{
      const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime+i*.095;
      o.type=kind==='wrong'?'triangle':'sine';o.frequency.value=f;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.18);
      o.connect(g).connect(audioContext.destination);o.start(t);o.stop(t+.19);
    });
  }catch(_){}
}
function openStory(text,src='anh/sprites/quynh_idle.webp',onClose=null){
  openModal(`<div class="modal story-dialog"><img class="figure" src="${src}" alt="Nhân vật dân gian"><span class="label">CHUYỆN THIÊN LUẬT</span><h2>Đối thoại trên đường</h2><div class="quote">${text}</div><div class="actions"><button class="primary" id="story-ok">Tiếp tục</button></div></div>`);
  document.getElementById('story-ok').onclick=()=>{closeModal();if(onClose)onClose();};
}
function showNPC(npc){tone('tap');openStory(npc.lines[0]+`<br><br>${npc.lines[1]}`,'anh/sprites/quynh_hack.webp');}

function showToast(text, type = "") {
  clearTimeout(toastTimer);
  toastEl.textContent = text;
  toastEl.className = `toast show ${type}`.trim();
  toastTimer = setTimeout(() => toastEl.className = "toast", 2400);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function setObjective(text) {
  objectiveText.textContent = text;
}

function updateProgress() {
  const ids = ["step-1", "step-2", "step-3", "step-4"];
  ids.forEach((id, index) => {
    const el = document.getElementById(id);
    el.className = "step";
    if (state.completed[index]) el.classList.add("done");
    else if (!state.unlocked[index]) el.classList.add("locked");
    else if (index === state.currentStage) el.classList.add("current");
  });
}

function updateMissionText() {
  if (state.screen === "intro") {
    setObjective("Nhấn Bắt đầu để bước vào hành trình bế quan.");
    quoteLine.textContent = QUOTES.intro;
    return;
  }
  if (state.screen === "won") {
    setObjective("Chúc mừng! Trạng Quỳnh đã vượt mọi cửa ải và tiến vào Bế Quan.");
    quoteLine.textContent = QUOTES.win;
    return;
  }

  const messages = [
    "Đi tới Ải 1 và giải đúng liên tiếp 5 câu dân gian. Sai một câu sẽ thử lại với bộ câu khác.",
    "Đi tới Ải 2: 5 câu suy luận mới. Sai một câu là làm lại ải này.",
    "Đối thoại Ngọc Hoàng: phải đúng cả 5 câu hack não để mở Bế Quan.",
    "Cánh cổng Bế Quan đã mở. Hãy tiến lên và hoàn tất hành trình."
  ];
  const quoteKeys = ["stage1", "stage2", "stage3", "gate"];
  setObjective(messages[state.currentStage]);
  quoteLine.textContent = QUOTES[quoteKeys[state.currentStage]];
}

function resetGame() {
  clearQuestionClock();
  document.getElementById('help-btn').disabled = false;
  state.screen = "intro";
  state.hero = { x: 140, y: 525, tx: 140, ty: 525, moving: false, facing: 1 };
  state.currentStage = 0;
  state.unlocked = [true, false, false, false];
  state.completed = [false, false, false, false];
  state.modal = null;
  state.hoverNode = null;
  state.points=0;state.mistakes=0;
  quizRunToken += 1;
  questionQueue = [[], [], []];
  lastDraw = [[], [], []];
  overlay.hidden = true;
  overlay.innerHTML = "";
  updateProgress();
  updateMissionText();
  showIntro();
}

function openModal(html) {
  state.modal = true;
  overlay.hidden = false;
  overlay.innerHTML = html;
}

function closeModal() {
  clearQuestionClock();
  document.getElementById('help-btn').disabled = false;
  state.modal = false;
  overlay.hidden = true;
  overlay.innerHTML = "";
}

function showIntro() {
  openModal(`
    <div class="modal">
      <img class="story-cover" src="anh/cover.webp" alt="Ảnh bìa Trạng Quỳnh">
      <span class="label">MỞ ĐẦU</span>
      <h2>TRẠNG QUỲNH: <span style="color:#a94937">KẺ HACK THIÊN MỆNH</span></h2>
      <p>Người chơi hóa thân thành <strong>Trạng Quỳnh</strong>, đi qua ba cửa ải để tiến lên <strong>Bế Quan</strong>. Không dùng võ lực, bạn sẽ chinh phục hành trình bằng trí thông minh, các câu đố dân gian và những màn đối đáp “hack não”.</p>
      <div class="quote">Lộ trình: <strong>Ải 1</strong>, <strong>Ải 2</strong> và <strong>Ải 3</strong> đều có 5 câu hỏi ngẫu nhiên. <strong>Mỗi câu chỉ có 15 giây</strong>. Sai hoặc hết giờ sẽ phải <strong>làm lại ải đó với 5 câu khác</strong>. Vượt đủ ba ải để mở cổng <strong>Bế Quan</strong>.</div>
      <div class="actions">
        <button class="primary" id="start-game-btn">Bắt đầu hành trình</button>
        <button class="secondary" id="howto-btn">Xem cách chơi</button>
      </div>
    </div>
  `);
  document.getElementById("start-game-btn").onclick = () => {
    state.screen = "playing";
    closeModal();
    updateMissionText();
    showToast("Hành trình bắt đầu! Hãy đi tới Ải 1.", "success");
    tone("correct");
  };
  document.getElementById("howto-btn").onclick = showHelp;
}

function showHelp() {
  if (questionClock) return; // Không cho mở hướng dẫn để né thời gian khi đang làm bài.
  openModal(`
    <div class="modal">
      <span class="label">HƯỚNG DẪN</span>
      <h2>Cách chơi</h2>
      <p><strong>Di chuyển</strong> bằng <kbd>W A S D</kbd> hoặc phím mũi tên. Bạn cũng có thể <strong>nhấp chuột</strong> lên một điểm trên bản đồ để Trạng Quỳnh tự đi đến.</p>
      <p>Khi đứng gần một điểm tương tác, nhấn <kbd>E</kbd> để mở thử thách.</p>
      <div class="quote">
        • Ải 1: Rút ngẫu nhiên 5/20 câu đố dân gian.<br>
        • Ải 2: Rút ngẫu nhiên 5/20 câu đố suy luận.<br>
        • Ải 3: Đối thoại với Ngọc Hoàng, rút ngẫu nhiên 5/10 câu hack não.<br>
        • Mỗi câu được giới hạn <strong>15 giây</strong>, có đồng hồ và thanh đếm ngược.<br>
        • Sai hoặc hết giờ: dừng lượt, làm lại ải đang chơi với 5 câu khác.<br>
        • Sau khi hoàn tất, cổng Bế Quan sẽ mở.
      </div>
      <div class="actions">
        <button class="primary" id="close-help-btn">Đã hiểu</button>
      </div>
    </div>
  `);
  document.getElementById("close-help-btn").onclick = () => {
    if (state.screen === "intro") showIntro(); else closeModal();
  };
}

function showStageIntro(index) {
  if (index === 0) {
    startQuiz(0, {
      title: "Ải 1 · Câu đố dân gian",
      label: "THIÊN MÔN",
      intro: "Đến cổng đầu tiên, Trạng Quỳnh không được dùng sức mạnh. Muốn vượt ải, chàng phải giải mã những câu hỏi dân gian quen thuộc.",
      image: "anh/sprites/quynh_idle.webp"
    });
  } else if (index === 1) {
    startQuiz(1, {
      title: "Ải 2 · Câu đố nâng cao",
      label: "MIẾU TRÍ TUỆ",
      intro: "Độ khó tăng lên. Bạn cần vượt qua 5 câu hỏi dân gian được chọn ngẫu nhiên để chứng minh trí tuệ của Trạng Quỳnh.",
      image: "anh/sprites/quynh_hack.webp"
    });
  } else if (index === 2) {
    startQuiz(2, {
      title: "Ải 3 · Đối thoại với Ngọc Hoàng",
      label: "THIÊN ĐÌNH",
      intro: "Ngọc Hoàng đích thân xuất hiện. Hãy đối đáp và trả lời 5 câu hỏi hack não được chọn ngẫu nhiên để được phép tiến lên Bế Quan.",
      image: "anh/sprites/emperor_point.webp",
      dialogue: true
    });
  } else if (index === 3) {
    showGateModal();
  }
}

function startQuiz(stageIndex, config) {
  // Mỗi lần chơi hay chơi lại đều lấy bộ 5 câu mới từ đúng kho của ải.
  const questions = drawQuestions(stageIndex);
  const runToken = ++quizRunToken;
  clearQuestionClock();
  document.getElementById('help-btn').disabled = true;
  const pointsAtStart = state.points;
  let current = 0, locked = false, hintShown = false;
  const sayings = [
    ['“Không phải đánh, phải nghĩ!”', '“Cứ bình tĩnh, xem kỹ từng chữ.”'],
    ['“Đố mẹo thì phải nghĩ ngược!”', '“Đừng để câu chữ dắt mũi.”'],
    ['“Muôn tâu Ngọc Hoàng, thần xin ứng đối!”', '“Đầu óc thắng được thiên luật hay chăng?”']
  ];

  function render(message = '') {
    if (runToken !== quizRunToken) return;
    clearQuestionClock();
    const item = questions[current];
    const bars = questions.map((_, i) => `<i class="${i < current ? 'done' : i === current ? 'current' : ''}"></i>`).join('');
    const opts = item.options.map((text, i) => `<button class="option-btn" data-idx="${i}"><b>${String.fromCharCode(65 + i)}</b><span>${text}</span></button>`).join('');
    const avatar = stageIndex === 2 ? 'anh/sprites/emperor_point.webp' : config.image;
    openModal(`<div class="modal quiz-dialog">
      <img class="figure quiz-actor" src="${avatar}" alt="Nhân vật ra câu đố">
      <span class="label">${config.label} · LƯỢT CÂU HỎI NGẪU NHIÊN</span><h2>${config.title}</h2>
      <p>${current === 0 ? config.intro : stageIndex === 2 ? 'Ngọc Hoàng lại thử thách Trạng Quỳnh bằng một câu hỏi khác.' : 'Câu đố tiếp theo đang chờ bạn.'}</p>
      <div class="speaker-line"><span>${stageIndex === 2 ? 'NGỌC HOÀNG' : 'TRẠNG QUỲNH'}</span>${sayings[stageIndex][current % 2]}</div>
      <div class="progress-line">${bars}</div>
      <div class="quiz-meta"><span>Câu ${current + 1}/${QUESTION_COUNT} · Sai/hết giờ là thử lại ải</span><span>Điểm trí tuệ: ${state.points}</span></div>
      <div class="question-timer" id="question-timer" role="timer" aria-label="Thời gian còn lại cho câu hỏi">
        <div class="question-timer-head"><span>⏳ THỜI GIAN TRẢ LỜI</span><strong><span id="question-seconds">15</span>s</strong></div>
        <div class="question-timer-track"><div id="question-timer-fill" class="question-timer-fill"></div></div>
      </div>
      <div class="quote question-text">${item.q}</div>
      <div class="option-list">${opts}</div>
      <div class="feedback" aria-live="polite">${message}</div>
      <div class="actions"><button class="secondary" id="hint-quiz">💡 Gợi ý (-10 điểm)</button><button class="secondary" id="quit-quiz-btn">Rời ải</button></div>
    </div>`);

    function timeExpired() {
      if (locked || runToken !== quizRunToken || state.screen !== 'playing') return;
      locked = true;
      clearQuestionClock();
      state.mistakes += 1;
      state.points = pointsAtStart;
      tone('wrong');
      document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      showQuizFailure(stageIndex, config, current + 1, true);
    }

    document.querySelectorAll('.option-btn').forEach(btn => btn.onclick = () => {
      if (locked || runToken !== quizRunToken) return;
      if (!questionClock || performance.now() >= questionClock.deadline) {
        timeExpired();
        return;
      }
      locked = true;
      clearQuestionClock();
      const ok = Number(btn.dataset.idx) === item.answer;
      btn.classList.add(ok ? 'correct' : 'wrong');
      document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      if (ok) {
        state.points += 100;
        tone('correct');
        document.querySelector('.feedback').textContent = 'Chính xác! ' + item.explain;
      } else {
        state.mistakes += 1;
        tone('wrong');
        document.querySelector('.feedback').textContent = 'Sai rồi! Lượt này kết thúc. Bạn sẽ nhận 5 câu khác.';
      }
      setTimeout(() => {
        if (runToken !== quizRunToken || state.screen !== 'playing') return;
        locked = false;
        if (!ok) {
          // Điểm của lượt chơi bị hủy, không mất tiến độ hai ải đã hoàn thành.
          state.points = pointsAtStart;
          showQuizFailure(stageIndex, config, current + 1);
          return;
        }
        current += 1;
        hintShown = false;
        if (current === QUESTION_COUNT) finishStage(stageIndex);
        else render(item.explain);
      }, ok ? 1050 : 1100);
    });
    document.getElementById('hint-quiz').onclick = () => {
      if (locked || hintShown) return;
      hintShown = true;
      state.points = Math.max(pointsAtStart, state.points - 10);
      document.querySelector('.feedback').textContent = 'Gợi ý: Đọc kỹ từ khóa và loại trừ các phương án sai trước.';
      document.getElementById('hint-quiz').disabled = true;
    };
    document.getElementById('quit-quiz-btn').onclick = () => {
      if (locked) return;
      quizRunToken += 1;
      clearQuestionClock();
      state.points = pointsAtStart;
      closeModal();
      showToast('Đã rời thử thách. Quay lại ải để nhận bộ 5 câu mới.');
    };
    // Bắt đầu 15 giây từ thời điểm câu hỏi hiện ra, không tính lúc xem phản hồi.
    startQuestionClock(runToken, timeExpired);
  }
  render();
}

function showQuizFailure(stageIndex, config, failedQuestion, outOfTime = false) {
  clearQuestionClock();
  document.getElementById('help-btn').disabled = false;
  const stage = stageIndex + 1;
  openModal(`<div class="modal quiz-dialog">
    <img class="figure quiz-actor" src="${stageIndex === 2 ? 'anh/sprites/emperor_surprised.webp' : 'anh/sprites/quynh_distract.webp'}" alt="Nhân vật thất bại">
    <span class="label">THỬ THÁCH THẤT BẠI · ẢI ${stage}</span>
    <h2>${outOfTime ? 'Hết giờ! Thiên Luật đã thắng lượt này!' : 'Thiên Luật chưa chịu thua!'}</h2>
    <p>${outOfTime ? `Bạn đã hết <strong>15 giây</strong> ở <strong>câu số ${failedQuestion}/5</strong>.` : `Bạn đã trả lời sai ở <strong>câu số ${failedQuestion}/5</strong>.`} Theo quy tắc của game, bạn phải <strong>làm lại ải ${stage}</strong> từ câu đầu tiên.</p>
    <div class="quote">Trạng Quỳnh: “Thua một câu thì ta đổi cách nghĩ. Đố lại đi!”<br><strong>5 câu ở lượt tiếp theo sẽ khác bộ vừa chơi.</strong></div>
    <div class="actions">
      <button class="primary" id="retry-current-stage">↻ Thử lại ải ${stage} · 5 câu mới</button>
      <button class="secondary" id="return-to-map">Trở về bản đồ</button>
    </div>
  </div>`);
  document.getElementById('retry-current-stage').onclick = () => startQuiz(stageIndex, config);
  document.getElementById('return-to-map').onclick = () => {
    quizRunToken += 1;
    closeModal();
    showToast('Hãy quay lại điểm thử thách để nhận một bộ câu mới.');
  };
}

function finishStage(stageIndex) {
  clearQuestionClock();
  closeModal();
  state.completed[stageIndex] = true;
  if (stageIndex < 3) state.unlocked[stageIndex + 1] = true;
  state.currentStage = Math.min(stageIndex + 1, 3);
  updateProgress();
  updateMissionText();
  tone('win');
  if (stageIndex===0){state.hero.tx=NODES.stage2.x;state.hero.ty=NODES.stage2.y;}
  if (stageIndex===1){state.hero.tx=NODES.stage3.x;state.hero.ty=NODES.stage3.y;}

  if (stageIndex === 0) {
    showToast("Bạn đã vượt qua Ải 1! Ải 2 đã mở.", "success");
  } else if (stageIndex === 1) {
    showToast("Bạn đã vượt qua Ải 2! Hãy đến gặp Ngọc Hoàng ở Ải 3.", "success");
  } else if (stageIndex === 2) {
    showToast("Ngọc Hoàng đã chấp thuận. Cổng Bế Quan đã mở!", "success");
  }
}

function showGateModal() {
  openModal(`
    <div class="modal">
      <img class="figure" src="anh/sprites/quynh_win.webp" alt="Trạng Quỳnh chiến thắng">
      <span class="label">BẾ QUAN</span>
      <h2>Cổng Thiên Mệnh đã mở</h2>
      <p>Vượt qua mọi cửa ải, Trạng Quỳnh được phép bước vào <strong>Bế Quan</strong>. Đây là phần thưởng cho trí tuệ, khả năng ứng đối và bản lĩnh của người chơi.</p>
      <div class="quote">“Không cần sức mạnh, vẫn có thể thắng bằng trí.”</div>
      <div class="actions">
        <button class="primary" id="enter-gate-btn">Tiến vào Bế Quan</button>
      </div>
    </div>
  `);
  document.getElementById("enter-gate-btn").onclick = () => {
    closeModal();
    state.completed[3] = true;
    state.screen = "won";
    updateProgress();
    updateMissionText();
    showVictory();
  };
}

function showVictory() {
  openModal(`
    <div class="modal">
      <img class="figure" src="anh/sprites/quynh_win.webp" alt="Trạng Quỳnh bế quan">
      <span class="label">HOÀN THÀNH</span>
      <h2>Trạng Quỳnh đã lên <span style="color:#a94a38">Bế Quan</span> thành công!</h2>
      <p>Bạn đã hoàn thiện hành trình <strong>Trạng Quỳnh: Kẻ Hack Thiên Mệnh</strong>: vượt qua 5 câu hỏi ngẫu nhiên mỗi ải, chinh phục tổng cộng 15 câu và đối đáp thắng Ngọc Hoàng.</p>
      <div class="score-banner">✦ Điểm trí tuệ: <strong>${state.points}</strong> · Số lần thử sai: <strong>${state.mistakes}</strong></div>
      <div class="character-row">
        <div class="character-card">
          <img src="anh/sprites/quynh_win.webp" alt="Trạng Quỳnh">
          <h4>Trạng Quỳnh</h4>
          <p>Biểu tượng của trí tuệ, ứng đối linh hoạt và chất dân gian Việt Nam.</p>
        </div>
        <div class="character-card">
          <img src="anh/sprites/emperor_accept.webp" alt="Ngọc Hoàng">
          <h4>Ngọc Hoàng</h4>
          <p>Người công nhận trí tuệ của Trạng Quỳnh và mở cổng Thiên Mệnh.</p>
        </div>
      </div>
      <div class="actions">
        <button class="primary" id="play-again-btn">Chơi lại</button>
      </div>
    </div>
  `);
  document.getElementById("play-again-btn").onclick = resetGame;
}

function getNearbyNode() {
  const heroPoint = { x: state.hero.x, y: state.hero.y };
  const list = [NODES.stage1, NODES.stage2, NODES.stage3, NODES.gate];
  for (let i = 0; i < list.length; i += 1) {
    if (!state.unlocked[i]) continue;
    if (distance(heroPoint, list[i]) <= list[i].radius + 24) return i;
  }
  return null;
}

function interact() {
  if (state.modal || state.screen === "intro") return;
  if (state.screen === "won") return showVictory();

  const nodeIndex = getNearbyNode();
  if(nodeIndex===null){
    const npc=NPCS.find(n=>state.currentStage===n.stage&&distance(state.hero,n)<100);
    if(npc)return showNPC(npc);
  }
  if (nodeIndex === null) {
    showToast("Hãy đi tới một ải đang mở rồi nhấn E.", "error");
    return;
  }

  if (nodeIndex === 0 && !state.completed[0]) return showStageIntro(0);
  if (nodeIndex === 1 && state.completed[0] && !state.completed[1]) return showStageIntro(1);
  if (nodeIndex === 2 && state.completed[1] && !state.completed[2]) return showStageIntro(2);
  if (nodeIndex === 3 && state.completed[2]) return showStageIntro(3);

  if (nodeIndex === 0 && state.completed[0]) showToast("Ải 1 đã hoàn thành. Hãy tiến đến Ải 2.");
  else if (nodeIndex === 1 && state.completed[1]) showToast("Ải 2 đã hoàn thành. Hãy tới gặp Ngọc Hoàng ở Ải 3.");
  else if (nodeIndex === 2 && state.completed[2]) showToast("Ngọc Hoàng đã chấp thuận. Cổng Bế Quan đã mở ở góc trên phải.");
  else if (nodeIndex === 1 && !state.completed[0]) showToast("Bạn cần vượt Ải 1 trước.", "error");
  else if (nodeIndex === 2 && !state.completed[1]) showToast("Bạn cần vượt Ải 2 trước.", "error");
  else if (nodeIndex === 3 && !state.completed[2]) showToast("Hãy đối thoại với Ngọc Hoàng ở Ải 3 trước khi lên Bế Quan.", "error");
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function updateHero(dt) {
  if (state.screen !== "playing" || state.modal) return;

  let vx = 0, vy = 0;
  if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) vy -= 1;
  if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) vy += 1;
  if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) vx -= 1;
  if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) vx += 1;

  if(vx!==0||vy!==0){state.hero.tx=null;state.hero.ty=null;}
  if (vx !== 0 || vy !== 0) {
    const len = Math.hypot(vx, vy) || 1;
    state.hero.x += (vx / len) * HERO_SPEED * dt;
    state.hero.y += (vy / len) * HERO_SPEED * dt;
    state.hero.moving = true;
    state.hero.facing = vx < 0 ? -1 : vx > 0 ? 1 : state.hero.facing;
  } else if (state.hero.tx !== null && state.hero.ty !== null) {
    const dx = state.hero.tx - state.hero.x;
    const dy = state.hero.ty - state.hero.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 5) {
      state.hero.x += (dx / dist) * HERO_SPEED * dt;
      state.hero.y += (dy / dist) * HERO_SPEED * dt;
      state.hero.moving = true;
      if (Math.abs(dx) > 1) state.hero.facing = dx < 0 ? -1 : 1;
    } else {
      state.hero.tx = null;
      state.hero.ty = null;
      state.hero.moving = false;
    }
  } else {
    state.hero.moving = false;
  }

  state.hero.x = clamp(state.hero.x, 40, W - 40);
  state.hero.y = clamp(state.hero.y, 40, H - 40);
  state.animationTime += dt;
}

function drawNode(node, index) {
  const unlocked = state.unlocked[index];
  const completed = state.completed[index];
  const current = state.currentStage === index && state.screen === "playing";

  ctx.save();
  ctx.beginPath();
  ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
  const fill = completed ? "rgba(40,150,111,.68)" : unlocked ? "rgba(235,194,97,.60)" : "rgba(70,70,80,.38)";
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = current ? 5 : 3;
  ctx.strokeStyle = completed ? "#7ff0c5" : unlocked ? "#ffe7ac" : "rgba(180,180,200,.18)";
  ctx.stroke();
  if (current) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius + 10 + Math.sin(state.animationTime * 6) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,235,169,.45)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = "#2b2132";
  ctx.font = "bold 18px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(index < 3 ? `ẢI ${index + 1}` : "BẾ QUAN", node.x, node.y + 6);
  ctx.restore();
}

function drawPath() {
  const pts = [NODES.stage1, NODES.stage2, NODES.stage3, NODES.gate];
  ctx.save();
  ctx.strokeStyle = "rgba(255,231,172,.68)";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();
}

function drawNPC(n){
  ctx.save();
  const wave=3*Math.sin(state.animationTime*3+n.x);
  if(images.quynh_hack?.complete && images.quynh_hack.naturalWidth){
    ctx.globalAlpha=.93;ctx.drawImage(images.quynh_hack,n.x-33,n.y-94+wave,66,88);
  }
  ctx.font='800 13px system-ui';ctx.textAlign='center';
  ctx.lineWidth=4;ctx.strokeStyle='#20152c';ctx.fillStyle='#ffe6b5';
  ctx.strokeText(n.label,n.x,n.y-105);ctx.fillText(n.label,n.x,n.y-105);
  ctx.restore();
}
function drawHero() {
  const sprite = state.screen === "won" ? images.quynh_win : state.hero.moving ? images.quynh_walk : images.quynh_idle;
  const w = 110, h = 130;
  ctx.save();
  ctx.translate(state.hero.x, state.hero.y);
  ctx.scale(state.hero.facing, 1);
  if(sprite?.complete && sprite.naturalWidth){
    const bounce=state.hero.moving?Math.abs(Math.sin(state.animationTime*12))*5:Math.sin(state.animationTime*3)*2;
    ctx.drawImage(sprite, -w/2, -h+26-bounce,w,h);
  }
  ctx.restore();
}

function drawStageDecor() {
  if (state.completed[2]) {
    const gate = NODES.gate;
    ctx.save();
    const pulse = 18 + Math.sin(state.animationTime * 4) * 6;
    const grad = ctx.createRadialGradient(gate.x, gate.y, 4, gate.x, gate.y, pulse * 2.8);
    grad.addColorStop(0, "rgba(255,245,189,.95)");
    grad.addColorStop(.5, "rgba(255,214,90,.35)");
    grad.addColorStop(1, "rgba(255,214,90,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(gate.x, gate.y, pulse * 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawWorld() {
  ctx.clearRect(0, 0, W, H);
  if (images.map.complete && images.map.naturalWidth) ctx.drawImage(images.map, 0, 0, W, H);
  else {ctx.fillStyle='#b8cc9e';ctx.fillRect(0,0,W,H);}
  stars.forEach(st=>{const alpha=.35+.3*Math.sin(state.animationTime*1.8+st.phase);ctx.fillStyle=`rgba(255,249,200,${alpha})`;ctx.beginPath();ctx.arc(st.x,st.y,1.4,0,Math.PI*2);ctx.fill();});

  drawPath();
  drawStageDecor();
  drawNode(NODES.stage1, 0);
  drawNode(NODES.stage2, 1);
  drawNode(NODES.stage3, 2);
  drawNode(NODES.gate, 3);

  NPCS.forEach(n=>{if(state.currentStage===n.stage)drawNPC(n);});
  if (images.emperor_idle.complete && images.emperor_idle.naturalWidth) {
    const bob=Math.sin(state.animationTime*2)*4;
    ctx.drawImage(images.emperor_idle, NODES.stage3.x - 60, NODES.stage3.y - 160+bob, 125, 170);
  }
  // Indicator that the final challenge can be opened
  if(state.completed[2]){
    ctx.save();ctx.textAlign='center';ctx.font='900 16px system-ui';ctx.fillStyle='#fff3bd';ctx.strokeStyle='#5f4838';ctx.lineWidth=3;
    ctx.strokeText('CỔNG ĐÃ MỞ',NODES.gate.x,NODES.gate.y-77);ctx.fillText('CỔNG ĐÃ MỞ',NODES.gate.x,NODES.gate.y-77);ctx.restore();
  }
  drawHero();

  const near = getNearbyNode();
  state.hoverNode = near;
  if (near !== null && state.screen === "playing" && !state.modal) {
    const labels = [
      state.completed[0] ? "Đã vượt Ải 1" : "Nhấn E để giải Ải 1",
      state.completed[1] ? "Đã vượt Ải 2" : "Nhấn E để giải Ải 2",
      state.completed[2] ? "Đã vượt Ải 3" : "Nhấn E để đối thoại với Ngọc Hoàng",
      state.completed[2] ? "Nhấn E để vào Bế Quan" : "Chưa mở cổng Bế Quan"
    ];
    interactText.textContent = labels[near];
    interactEl.hidden = false;
  } else {
    const npc=NPCS.find(n=>state.currentStage===n.stage && distance(state.hero,n)<100);
    if(npc && state.screen==='playing' && !state.modal){interactText.textContent='Nhấn E để trò chuyện với '+npc.label;interactEl.hidden=false;}
    else interactEl.hidden=true;
  }
}

function gameLoop(ts) {
  const dt = Math.min((ts - lastTime) / 1000 || 0, 0.05);
  lastTime = ts;
  updateHero(dt);
  drawWorld();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", (e) => {
  if (state.modal || state.screen === "intro") return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  state.hero.tx = (e.clientX - rect.left) * scaleX;
  state.hero.ty = (e.clientY - rect.top) * scaleY;
});

window.addEventListener("keydown", (e) => {
  keys.add(e.key);
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
  if (e.key.toLowerCase() === "e" && !e.repeat) interact();
});
window.addEventListener("keyup", (e) => keys.delete(e.key));

document.getElementById("help-btn").addEventListener("click", showHelp);
document.getElementById("sound-toggle").addEventListener("click",()=>{
  state.soundOn=!state.soundOn;
  document.getElementById("sound-toggle").textContent=state.soundOn?'Âm thanh: Bật':'Âm thanh: Tắt';
  if(state.soundOn)tone('correct');
});
document.getElementById("restart-btn").addEventListener("click", resetGame);
document.getElementById("mobile-interact").addEventListener("click", interact);
document.querySelectorAll(".mobile-controls [data-dir]").forEach(btn => {
  const dirMap = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
  btn.addEventListener("pointerdown", () => keys.add(dirMap[btn.dataset.dir]));
  btn.addEventListener("pointerup", () => keys.delete(dirMap[btn.dataset.dir]));
  btn.addEventListener("pointerleave", () => keys.delete(dirMap[btn.dataset.dir]));
});

resetGame();
requestAnimationFrame(gameLoop);
