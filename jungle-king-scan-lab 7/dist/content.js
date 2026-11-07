// Card translations keep assessment scope and the provisional identity explicit.
export const traditionalChinese = {
  elephant_piece: {
    name: '亞洲象', scientificName: 'Elephas maximus',
    intro: '大象的遷徙有助塑造森林。保護連通的棲息地，能幫助人與大象共享生活空間。',
    habitat: '南亞及東南亞的森林與周邊地區。',
    threats: '棲息地流失與破碎化、人象衝突、盜獵及非法捕捉。',
    protection: '恢復棲息地廊道、減少農田周邊的人象衝突，並打擊非法野生動物貿易。',
    fact: '大象在森林中移動時會散播種子。',
    conservation: { category: '瀕危', scope: '全球物種', secondary: [], note: '此等級適用於亞洲象整個物種，並非特定國家族群。' },
  },
  lion_piece: {
    name: '西非獅', scientificName: 'Panthera leo · 西非族群',
    intro: '獅子的保育狀況因地區而異。西非僅存的獅群需要保護；其區域等級與獅子整個物種的全球等級不同。',
    habitat: '西非的稀樹草原與林地，包括塞內加爾的尼奧科洛科巴國家公園。',
    threats: '棲息地縮減、野生獵物流失、盜獵、套索陷阱，以及因牲畜而起的人獸衝突。',
    protection: '支持保護區巡護、監測族群、保護獵物，並與社區合作改善共存。',
    fact: '獅子會組成稱為獅群的社會群體。',
    conservation: { category: '極危', scope: '西非族群', secondary: [{ category: '易危', scope: '獅子物種全球評估' }], note: '西非的區域等級不可用來代表全球所有獅子。' },
  },
  tiger_piece: {
    name: '馬來亞虎', scientificName: 'Panthera tigris · 馬來亞族群',
    intro: '牠是森林中的掠食者，也是馬來西亞的象徵。保護馬來亞虎需要打擊盜獵、維持森林連通，並保護獵物。',
    habitat: '馬來半島的天然森林。',
    threats: '盜獵與非法貿易、森林流失與破碎化，以及獵物遭過度捕獵。',
    protection: '反盜獵巡護、野生動物監測、棲息地保護及公眾保育教育。',
    fact: '傳統亞種分類使用學名 Panthera tigris jacksoni；虎的分類仍在檢討中。',
    conservation: { category: '極危', scope: '馬來亞虎 · WWF 馬來西亞', secondary: [{ category: '瀕危', scope: '虎物種全球評估' }], note: 'WWF 馬來西亞將馬來亞虎列為極危。此等級與虎物種的全球等級不同；亞種分類仍在檢討中。' },
  },
  leopard_piece: {
    name: '印度支那豹', scientificName: 'Panthera pardus delacouri',
    intro: '豹可能悄然從森林中消失。印度支那亞種承受嚴重壓力，因此保護其僅存的重要棲地尤其關鍵。',
    habitat: '東南亞森林；重要的剩餘棲地包括馬來半島及泰緬邊境地區。',
    threats: '盜獵、套索陷阱、非法貿易、棲息地與獵物流失，以及人獸衝突。',
    protection: '加強反盜獵、保護剩餘的重要森林棲地，並監測豹及其獵物。',
    fact: '馬來半島的許多印度支那豹具有黑化的深色毛皮。',
    conservation: { category: '極危', scope: '印度支那亞種', secondary: [{ category: '易危', scope: '豹物種全球評估' }], note: '此亞種的受威脅等級比 Panthera pardus 物種的全球等級更嚴重。' },
  },
  bear_piece: {
    name: '臺灣黑熊', scientificName: 'Ursus thibetanus formosanus',
    intro: '臺灣原生的黑熊生活在山地森林。除了亞洲黑熊物種的全球等級，其本地保育需求也需要單獨說明。',
    habitat: '臺灣山地的闊葉林、混合林與針葉林。',
    threats: '棲息地劣化與破碎化、道路開發、非法狩獵及誤中陷阱。',
    protection: '保護連通的森林棲地、減少誤捕，並支持社區保育及監測。',
    fact: '臺灣黑熊是亞洲黑熊的臺灣特有亞種。',
    conservation: { category: '易危', scope: '亞洲黑熊物種全球評估', secondary: [{ category: '國家瀕危', scope: '臺灣紅皮書', assessmentYear: '2024' }], note: '遊戲的「易危」標示反映全球物種等級。臺灣於 2024 年將臺灣族群列為國家瀕危，這是另一項評估。' },
  },
  dog_piece: {
    name: '非洲野犬', scientificName: 'Lycaon pictus',
    intro: '群體生活需要足夠的活動空間。非洲野犬需要連通的地景，才能狩獵、養育幼犬及在領域之間移動。',
    habitat: '草原、林地與其他棲地；主要族群分布於非洲南部和東部。',
    threats: '棲息地破碎化、人獸衝突、意外與蓄意殺害，以及傳染病。',
    protection: '維護野生動物廊道、減少與畜牧業的衝突，並支持社區保育及族群監測。',
    fact: '每隻非洲野犬都有獨特的彩色斑紋。',
    conservation: { category: '瀕危', scope: '全球物種', secondary: [], note: '此處的等級適用於全球的 Lycaon pictus。' },
  },
  cat_piece: {
    name: '石虎', scientificName: 'Prionailurus bengalensis',
    intro: '牠是分布廣泛的小型野生貓科動物。全球「無危」不代表每個地區都安全：地方族群仍可能急需保護。',
    habitat: '亞洲大陸及臺灣的森林、灌叢與部分農耕地景。',
    threats: '地方棲息地流失、狩獵與貿易、套索陷阱、因捕食家禽而遭報復，以及路殺。',
    protection: '保護棲息地庇護區、減少套索及野生動物貿易，並改善道路風險與社區衝突。',
    fact: '石虎捕食小型獵物，尤其是齧齒動物，也能攀爬和游泳。',
    conservation: { category: '無危', scope: '大陸石虎物種全球評估', secondary: [{ category: '國家瀕危', scope: '臺灣族群 · 臺灣紅皮書', assessmentYear: '2024' }], note: '遊戲未指定地方族群。臺灣的評估僅作補充說明，不代表已確定棋子的地方族群身分。' },
  },
  rat_piece: {
    name: '水鼠', scientificName: 'Arvicola amphibius · 暫定對應',
    intro: '遊戲的「Aquatic Rat」名稱及英國保育說明似乎指水田鼠。此身分仍需設計者確認。',
    habitat: '若指水田鼠：河流、溪流、溝渠、池塘及濕地中有植被的岸邊。',
    threats: '若指水田鼠：棲息地流失與劣化、污染，以及外來美洲水貂的捕食。',
    protection: '恢復連通的河岸棲地、監測族群，並支持保育組織協調水貂管理工作。',
    fact: '水田鼠具有圓鼻、小耳朵及有毛的尾巴。',
    conservation: { category: '瀕危', scope: '水田鼠 · 大不列顛紅皮書', secondary: [{ category: '無危', scope: '歐洲水田鼠全球評估' }], note: '僅在棋子代表 Arvicola amphibius 時，這些資料才適用。「英國瀕危」更精確地指大不列顛評估，並非全球等級。' },
  },
};

export function localizedProfile(profile, language) {
  const translation = language === 'zh-Hant' ? traditionalChinese[profile.pieceId] : null;
  return translation ? { ...profile, ...translation, conservation: { ...profile.conservation, ...translation.conservation } } : profile;
}

const english = {
  'story-label': 'THE STORY BEHIND THE PIECE', 'scan-another': '← Scan another piece',
  'status-label': 'CONSERVATION STATUS & SCOPE', 'habitat-label': 'HABITAT', 'threats-label': 'MAIN THREATS',
  'protection-label': 'WHAT HELPS', 'fact-label': 'A CLOSER LOOK', 'sources-label': 'Sources & research dates',
  'movement-label': 'A LITTLE MOVEMENT', 'ar-button': 'View in my space',
  'art-credit-text': 'Game artwork: llab design ltd, from the supplied campaign screenshots.',
  'ar-help': 'Drag to rotate; pinch or scroll to zoom. AR needs a supported phone. The AR app may display a static model even when animation works here.',
  play: 'Play animation ▷', pause: 'Pause animation', sourced: 'SOURCES CHECKED', provisional: 'PROVISIONAL MAPPING', draft: 'DRAFT CONTENT',
  mapping: 'Provisional identity: these facts describe the European water vole. Please confirm that the game’s Aquatic Rat represents this species.',
  artwork: 'Artwork motion preview · not a 3D product model', animation: 'Original animated tiger placeholder · head nod and tail sway',
  loading: 'Loading animated 3D…', embedded: 'Embedded 3D animation',
  placeholder: 'TEST PLACEHOLDER · Original stylised tiger, about 13 cm long. This is not a product replica; real product dimensions are still needed.',
  modelLoaded: '3D model loaded. Play animation or drag to rotate. AR is available on supported phones.',
};
const chinese = {
  'story-label': '棋子背後的故事', 'scan-another': '← 掃描另一枚棋子',
  'status-label': '保育等級與評估範圍', 'habitat-label': '棲息地', 'threats-label': '主要威脅',
  'protection-label': '保護方法', 'fact-label': '認識更多', 'sources-label': '資料來源與查核日期',
  'movement-label': '動起來', 'ar-button': '在我的空間中查看',
  'art-credit-text': '遊戲圖像：llab design ltd，取自使用者提供的宣傳截圖。',
  'ar-help': '拖曳可旋轉；雙指縮放或捲動可調整大小。AR 需要支援的手機。即使此頁可播放動畫，AR 應用程式仍可能只顯示靜態模型。',
  play: '播放動畫 ▷', pause: '暫停動畫', sourced: '已查核來源', provisional: '暫定物種對應', draft: '內容草稿',
  mapping: '暫定身分：這些資料描述歐洲水田鼠。仍需確認遊戲中的「Aquatic Rat」是否代表此物種。',
  artwork: '遊戲圖像動態預覽 · 並非 3D 產品模型', animation: '原創老虎動畫測試模型 · 點頭與擺尾',
  loading: '正在載入 3D 動畫…', embedded: '模型內嵌 3D 動畫',
  placeholder: '測試模型 · 原創造型老虎，長約 13 公分。此模型並非產品複製品；實際產品尺寸仍待確認。',
  modelLoaded: '3D 模型已載入。可播放動畫或拖曳旋轉；支援的手機可使用 AR。',
};
export function cardText(language, key) { return (language === 'zh-Hant' ? chinese : english)[key]; }
export const cardLabelIds = Object.keys(english).filter(key => key.includes('-'));

const siteEnglish = {
  'scan-eyebrow': 'A CLOSER LOOK', 'scan-title': 'Scan a piece.', 'scan-description': 'Every piece has a story. Place one Jungle King piece in the frame to meet its animal.',
  'stage-caption': 'Centre one piece', 'start-camera': 'Enable camera', 'stop-camera': 'Stop camera',
  'scan-trained': 'Scan piece', 'stop-recognition': 'Pause scanning',
  'preparation-note': 'Product scanning is being prepared.', 'prototype-link': 'Prototype ↗',
  cameraLabel: 'Live camera view', livePreview: 'Live camera', requesting: 'Requesting camera permission…',
  previewReady: 'Camera preview is ready.', ready: 'Camera ready. Centre a piece and start scanning.',
  scanReady: 'Ready to scan. Enable your camera to begin.', paused: 'Scanning paused.', stopped: 'Camera stopped.',
  denied: 'Camera access was denied. Allow it in your browser settings and try again.',
  noCamera: 'No camera was found on this device.', secureCamera: 'Open this page over HTTPS in a supported browser to use the camera.',
  cameraError: 'The camera could not start. Please try again.', scanUnavailable: 'Scanning is temporarily unavailable. Please try again later.',
  scanning: 'Hold one piece steady in the frame.', tryAgain: 'Please place a piece in the center of the frame.',
  matched: 'Animal found. Explore its story below.', confirming: 'Hold steady…', another: 'Ready for another piece.',
  scanError: 'Scanning stopped. Please try again.', contentError: 'Animal stories could not load. Please refresh the page.',
};
const siteChinese = {
  'scan-eyebrow': '認識更多', 'scan-title': '掃描棋子。', 'scan-description': '每枚棋子都有一個故事。將一枚 Jungle King 棋子置於框內，認識牠所代表的動物。',
  'stage-caption': '將一枚棋子置於中央', 'start-camera': '啟用相機', 'stop-camera': '關閉相機',
  'scan-trained': '掃描棋子', 'stop-recognition': '暫停掃描',
  'preparation-note': '棋子辨識功能正在準備中。', 'prototype-link': '原型頁面 ↗',
  cameraLabel: '即時相機畫面', livePreview: '即時相機', requesting: '正在請求相機權限…',
  previewReady: '相機預覽已就緒。', ready: '相機已就緒。將棋子置於中央，然後開始掃描。',
  scanReady: '掃描已就緒。啟用相機即可開始。', paused: '掃描已暫停。', stopped: '相機已關閉。',
  denied: '相機權限被拒絕。請在瀏覽器設定中允許使用相機，然後重試。',
  noCamera: '此裝置未找到相機。', secureCamera: '請使用支援的瀏覽器透過 HTTPS 開啟此頁面，以使用相機。',
  cameraError: '無法啟動相機，請重試。', scanUnavailable: '掃描暫時無法使用，請稍後重試。',
  scanning: '請將一枚棋子保持在框內。', tryAgain: '請將棋子放在畫面中央。',
  matched: '已找到動物，請查看下方的故事。', confirming: '請保持穩定…', another: '可以掃描另一枚棋子。',
  scanError: '掃描已停止，請重試。', contentError: '無法載入動物故事，請重新整理頁面。',
};
export function siteText(language, key) { return (language === 'zh-Hant' ? siteChinese : siteEnglish)[key]; }
export const siteLabelIds = Object.keys(siteEnglish).filter(key => key.includes('-'));
