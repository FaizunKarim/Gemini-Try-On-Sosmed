// Array to hold up to 6 base64 images
const uploadedImages = new Array(6).fill(null);

// Initialize Upload Grid
window.onload = function() {
  renderUploadGrid();
  updateApiKeyStatus();
};

function renderUploadGrid() {
  const container = document.getElementById('uploadGrid');
  container.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const hasImg = uploadedImages[i] !== null;
    
    const slotHTML = `
      <div class="relative border-2 border-dashed ${hasImg ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100/80'} rounded-2xl p-2 flex flex-col items-center justify-center aspect-square sm:h-32 sm:aspect-auto cursor-pointer transition-all duration-200 overflow-hidden group shadow-sm hover:shadow-md" onclick="triggerFileInput(${i})">
        <input type="file" id="fileInput-${i}" accept="image/*" class="hidden" onchange="handleFileSelect(event, ${i})">
        
        ${hasImg ? `
          <img src="${uploadedImages[i]}" class="w-full h-full object-cover rounded-xl shadow-sm">
          <button onclick="removeImage(event, ${i})" class="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-red-500 text-slate-700 hover:text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors">
            <i class="fa-solid fa-xmark"></i>
          </button>
        ` : `
          <div class="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors transform group-hover:scale-110 duration-300">
            <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 border border-slate-100">
              <i class="fa-solid fa-plus text-lg"></i>
            </div>
            <span class="text-[11px] sm:text-xs font-semibold tracking-wide">Slot ${i + 1}</span>
          </div>
        `}
      </div>
    `;
    container.innerHTML += slotHTML;
  }

  // Update count text
  const filledCount = uploadedImages.filter(x => x !== null).length;
  document.getElementById('uploadedCountText').innerText = `${filledCount} / 6 Terisi`;
}

function triggerFileInput(index) {
  document.getElementById(`fileInput-${index}`).click();
}

function handleFileSelect(event, index) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran file maksimal 5MB!", "fa-triangle-exclamation");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImages[index] = e.target.result;
      renderUploadGrid();
      showToast(`Produk ${index + 1} berhasil diunggah`);
    };
    reader.readAsDataURL(file);
  }
}

function removeImage(event, index) {
  event.stopPropagation();
  uploadedImages[index] = null;
  renderUploadGrid();
  showToast(`Produk ${index + 1} dihapus`);
}

// API Key functions are now in config.js

function toggleApiKeyModal() {
  const modal = document.getElementById('apiKeyModal');
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) {
    const currentKey = localStorage.getItem('user_gemini_api_key') || '';
    document.getElementById('customApiKeyInput').value = currentKey;
  }
}

function saveApiKey() {
  const val = document.getElementById('customApiKeyInput').value.trim();
  if (val) {
    localStorage.setItem('user_gemini_api_key', val);
    showToast("API Key kustom tersimpan!");
  } else {
    localStorage.removeItem('user_gemini_api_key');
    showToast("Menggunakan API Key default.");
  }
  updateApiKeyStatus();
  toggleApiKeyModal();
}

function updateApiKeyStatus() {
  const statusEl = document.getElementById('apiKeyStatus');
  if (localStorage.getItem('user_gemini_api_key')) {
    statusEl.innerText = "API Key: Custom (Tersimpan)";
  } else {
    statusEl.innerText = "API Key: Default";
  }
}

async function generateAllMockups() {
  // Check if API key is configured
  if (!isApiKeyConfigured()) {
    showToast("API Key belum dikonfigurasi. Silakan klik tombol API Key untuk mengkonfigurasi.", "fa-circle-exclamation");
    toggleApiKeyModal();
    return;
  }
  
  const activeImages = uploadedImages.filter(x => x !== null);
  if (activeImages.length === 0) {
    showToast("Silakan unggah minimal 1 gambar produk!", "fa-circle-exclamation");
    return;
  }

  const gender = document.querySelector('input[name="gender"]:checked').value;
  const studioStyle = document.getElementById('studioStyle').value;

  // Loading UI State
  setLoadingState(true);

  try {
    // Run generation tasks (Only Try-On and Caption)
    const [tryOnImg, captionText] = await Promise.all([
      generateImageAi(activeImages, gender, studioStyle),
      generateCaptionAi(activeImages, gender, studioStyle)
    ]);

    // Display Try-On Image
    if (tryOnImg) {
      document.getElementById('tryOnPlaceholder').classList.add('hidden');
      const imgEl = document.getElementById('imgTryOn');
      imgEl.src = tryOnImg;
      imgEl.classList.remove('hidden');
      document.getElementById('overlayTryOn').classList.remove('hidden');
    }

    // Display & Enable Caption Textarea
    if (captionText) {
      const capContainer = document.getElementById('captionContainer');
      const capText = document.getElementById('captionText');
      const capBtn = document.getElementById('btnCopyCaption');
      const badge = document.getElementById('captionStatusBadge');
      const instruction = document.getElementById('captionInstruction');

      // Unlock container & textarea
      capContainer.classList.remove('opacity-70');
      capText.disabled = false;
      capText.value = captionText;
      capText.className = "w-full bg-white p-4 rounded-xl border border-indigo-100/80 shadow-inner text-xs sm:text-sm text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y";

      // Enable copy button
      capBtn.disabled = false;
      capBtn.className = "text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer";

      // Update badge & hint
      badge.className = "text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1";
      badge.innerHTML = `<i class="fa-solid fa-lock-open text-[9px]"></i> Siap Diedit`;

      instruction.innerText = "Silakan edit teks di bawah ini jika ingin menyesuaikan harga, promo, atau pesan khusus:";
    }

    showToast("Mockup & Caption berhasil dibuat!");

  } catch (err) {
    console.error("Generate Error:", err);
    showToast("Terjadi kesalahan saat memproses AI. Coba lagi.", "fa-circle-exclamation");
  } finally {
    setLoadingState(false);
  }
}

async function generateImageAi(imagesBase64, gender, style) {
  const apiKey = getApiKey();
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`;

  // Smart Prompt: Instruksi ke Gemini untuk membingkai (framing) berdasarkan jenis pakaian
  const promptText = `A professional 1:1 square aspect ratio fashion lookbook photograph ideal for social media feed posts. An Indonesian ${gender.toLowerCase()} fashion model wearing the clothing item(s) shown in the reference images. 
CRITICAL FRAMING INSTRUCTION: Analyze the provided clothing items and frame the shot accordingly:
- If ONLY shoes/footwear are provided, shoot a CLOSE-UP focusing strictly on the feet and lower legs.
- If ONLY a top/shirt/necklace is provided, shoot a HALF-BODY torso portrait.
- If ONLY pants/skirts/shorts are provided (without tops), shoot the LOWER BODY.
- If a full outfit (top + bottom, or a full dress) is provided, shoot a FULL-BODY or 3/4 body shot fitting comfortably within a 1:1 square frame.

Background setting: ${style}. Photorealistic, commercial fashion campaign quality, sharp focus on fabric details, realistic lighting.`;

  // Prepare parts with user prompt and reference images
  const parts = [{ text: promptText }];
  
  // Attach up to 3 primary product images to prompt context
  imagesBase64.slice(0, 3).forEach(b64 => {
    const mimeType = b64.substring(b64.indexOf(":") + 1, b64.indexOf(";"));
    const base64Data = b64.split(",")[1];
    parts.push({
      inlineData: {
        mimeType: mimeType || "image/png",
        data: base64Data
      }
    });
  });

  const payload = {
    contents: [{ role: "user", parts: parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "1:1" }
    }
  };

  // Call API with exponential retry
  return await fetchWithRetry(apiUrl, payload, (result) => {
    const part = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part && part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  });
}

async function generateCaptionAi(imagesBase64, gender, style) {
  const apiKey = getApiKey();
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const promptText = `Bertindaklah sebagai Senior Fashion Copywriter & Performance Marketer kelas atas untuk brand lokal Indonesia.

TUGAS 1: PERIKSA & DETEKSI PRODUK
Analisis foto produk fashion yang dilampirkan secara teliti. Tentukan barang apa saja yang diunggah (misal: HANYA Sepatu Sneakers, HANYA Atasan/Kemeja, HANYA Celana/Bawahan, atau Setelan Lengkap).

TUGAS 2: BUAT MARKEETING COPYWRITING (AIDA FRAMEWORK)
Tuliskan 1 caption penawaran Instagram/TikTok Feed berkonversi tinggi dalam Bahasa Indonesia yang gaul, santai, namun sangat persuasif sesuai produk spesifik yang dideteksi.

Gunakan struktur AIDA:
1. ATTENTION (Hook Saja): Judul bombastis + emoji yang bikin netizen 'stop scrolling'. Jangan pakai kata 'Hook'. Sesuaikan judul dengan jenis barang (contoh sepatu: "Langkah makin pede pakai ini...", contoh kemeja: "Solusi tampil clean tanpa ribet...").
2. INTEREST (Pain Point / Solusi): Bahas masalah nyata target pasar (contoh: gerah, bahan gatal, model monoton) dan bagaimana produk ini jadi solusinya.
3. DESIRE (USP / Key Selling Point): Tonjolkan nilai tambah (kenyamanan bahan, detail jahitan rapi, fleksibel untuk OOTD harian/formal, visual aesthetic).
4. ACTION (Call to Action / CTA): Ajakan beli yang jelas dan mudah (contoh: "Klik link di bio / DM sekarang sebelum kehabisan slot promo!").
5. HASHTAGS: Berikan 6-8 hashtag niche & viral lokal yang sangat relevan (contoh: #LokalBrand #OOTDIndonesia #SneakersLokal dll).

Target Gender Model: ${gender}
Gaya Latar Foto: ${style}`;

  const parts = [{ text: promptText }];
  
  // Kirim gambar ke model teks agar bisa dianalisis (Vision)
  imagesBase64.slice(0, 3).forEach(b64 => {
    const mimeType = b64.substring(b64.indexOf(":") + 1, b64.indexOf(";"));
    const base64Data = b64.split(",")[1];
    parts.push({
      inlineData: {
        mimeType: mimeType || "image/png",
        data: base64Data
      }
    });
  });

  const payload = {
    contents: [{ parts: parts }]
  };

  return await fetchWithRetry(apiUrl, payload, (result) => {
    return result?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  });
}

async function fetchWithRetry(url, payload, resultExtractor, maxRetries = 2) {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error status: ${response.status}`);
      }

      const data = await response.json();
      const extracted = resultExtractor(data);
      if (extracted) return extracted;

    } catch (e) {
      if (attempt === maxRetries) {
        throw e;
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
  return null;
}

function setLoadingState(isLoading) {
  const btn = document.getElementById('btnGenerate');

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add('opacity-70', 'cursor-not-allowed');
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>Sedang Memproses AI...</span>`;

    const loaderHTML = `
      <div class="flex flex-col items-center text-indigo-600 animate-pulse p-4">
        <i class="fa-solid fa-wand-magic-sparkles text-3xl mb-3 text-indigo-500"></i>
        <span class="text-xs font-bold text-slate-700">Generating AI Mockup...</span>
        <span class="text-[10px] text-slate-400 mt-1">Estimasi 5-10 detik</span>
      </div>
    `;

    document.getElementById('tryOnPlaceholder').innerHTML = loaderHTML;
    document.getElementById('tryOnPlaceholder').classList.remove('hidden');

    document.getElementById('imgTryOn').classList.add('hidden');
    document.getElementById('overlayTryOn').classList.add('hidden');
    
    document.getElementById('captionText').value = "Menganalisis produk & menyusun copywriting AI...";

  } else {
    btn.disabled = false;
    btn.classList.remove('opacity-70', 'cursor-not-allowed');
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-amber-300"></i><span>Generate Mockup & Caption</span>`;
  }
}

function copyCaption() {
  const captionInput = document.getElementById('captionText');
  const text = captionInput.value;
  if (!text) return;

  captionInput.select();
  captionInput.setSelectionRange(0, 99999); // Mobile compatibility

  // Clipboard fallback
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  showToast("Caption tersalin ke clipboard!");
}

function showToast(msg, icon = "fa-circle-check") {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').innerText = msg;
  document.getElementById('toastIcon').className = `fa-solid ${icon} text-indigo-400`;

  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}