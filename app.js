// Array to hold up to 6 images (can be base64 or URL)
// Format: { type: 'base64' | 'url', value: string }
const uploadedImages = new Array(6).fill(null);

// Initialize Upload Grid
window.onload = function() {
  renderUploadGrid();
};

function renderUploadGrid() {
  const container = document.getElementById('uploadGrid');
  container.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const hasImg = uploadedImages[i] !== null;
    
    const slotHTML = `
      <div class="relative border-2 border-dashed ${hasImg ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100/80'} rounded-2xl p-2 flex flex-col items-center justify-center aspect-square sm:h-32 sm:aspect-auto cursor-pointer transition-all duration-200 overflow-hidden group shadow-sm hover:shadow-md">
        <input type="file" id="fileInput-${i}" accept="image/*" class="hidden" onchange="handleFileSelect(event, ${i})">
        
        ${hasImg ? `
          <img src="${uploadedImages[i].value}" class="w-full h-full object-cover rounded-xl shadow-sm">
          <div class="absolute top-2 right-2 flex gap-1">
            <button onclick="showUrlInput(event, ${i})" class="w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-teal-500 text-slate-700 hover:text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors" title="Ganti dengan URL">
              <i class="fa-solid fa-link"></i>
            </button>
            <button onclick="removeImage(event, ${i})" class="w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-red-500 text-slate-700 hover:text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors" title="Hapus">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        ` : `
          <div class="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors w-full" onclick="showSlotOptions(event, ${i})">
            <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 border border-slate-100">
              <i class="fa-solid fa-plus text-lg"></i>
            </div>
            <span class="text-[11px] sm:text-xs font-semibold tracking-wide mb-2">Slot ${i + 1}</span>
            <span class="text-[10px] text-slate-400">Klik untuk pilih opsi</span>
          </div>
        `}
      </div>
      
      <!-- Options Menu (shown when slot is clicked) -->
      <div id="slotOptions-${i}" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <i class="fa-solid fa-image text-teal-600"></i>
              Pilih Sumber Gambar - Slot ${i + 1}
            </h3>
            <button onclick="closeSlotOptions(${i})" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          
          <button onclick="triggerFileInput(${i}); closeSlotOptions(${i});" class="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-300 rounded-xl transition-all group">
            <div class="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-upload text-indigo-600 text-lg"></i>
            </div>
            <div class="text-left flex-1">
              <div class="font-bold text-slate-900 text-sm">Upload dari File</div>
              <div class="text-xs text-slate-500">Pilih gambar dari perangkat Anda</div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-indigo-600"></i>
          </button>
          
          <button onclick="showUrlInputFromOptions(event, ${i})" class="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-teal-50 border-2 border-slate-200 hover:border-teal-300 rounded-xl transition-all group">
            <div class="w-12 h-12 rounded-full bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-link text-teal-600 text-lg"></i>
            </div>
            <div class="text-left flex-1">
              <div class="font-bold text-slate-900 text-sm">Dari URL</div>
              <div class="text-xs text-slate-500">Masukkan link gambar</div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-teal-600"></i>
          </button>
        </div>
      </div>
      
      <!-- URL Input Modal (hidden by default) -->
      <div id="urlInputModal-${i}" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <i class="fa-solid fa-link text-teal-600"></i>
              Masukkan URL Gambar - Slot ${i + 1}
            </h3>
            <button onclick="closeUrlInput(${i})" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          <p class="text-xs text-slate-500">Masukkan URL gambar produk (contoh: https://example.com/image.jpg)</p>
          <input type="url" id="urlInput-${i}" placeholder="https://example.com/image.jpg" class="w-full bg-white border-2 border-slate-200 p-3 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all">
          <div class="flex gap-2">
            <button onclick="closeUrlInput(${i})" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
              Batal
            </button>
            <button onclick="loadImageFromUrl(${i})" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
              <i class="fa-solid fa-check mr-1"></i> Muat Gambar
            </button>
          </div>
        </div>
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

    // Show loading state
    showUploadLoading(index, true);

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImages[index] = { type: 'base64', value: e.target.result };
      renderUploadGrid();
      showToast(`Produk ${index + 1} berhasil diunggah`);
    };
    reader.onerror = function() {
      showUploadLoading(index, false);
      showToast("Gagal membaca file. Coba lagi.", "fa-circle-exclamation");
    };
    reader.readAsDataURL(file);
  }
}

function showUploadLoading(index, show) {
  const slot = document.querySelector(`#fileInput-${index}`).closest('.relative');
  if (!slot) return;
  
  if (show) {
    slot.innerHTML = `
      <div class="flex flex-col items-center justify-center aspect-square sm:h-32">
        <div class="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span class="text-xs text-teal-600 font-semibold">Mengunggah...</span>
      </div>
    `;
  }
}

function removeImage(event, index) {
  event.stopPropagation();
  uploadedImages[index] = null;
  renderUploadGrid();
  showToast(`Produk ${index + 1} dihapus`);
}

function showSlotOptions(event, index) {
  event.stopPropagation();
  const modal = document.getElementById(`slotOptions-${index}`);
  modal.classList.remove('hidden');
}

function closeSlotOptions(index) {
  const modal = document.getElementById(`slotOptions-${index}`);
  modal.classList.add('hidden');
}

function showUrlInput(event, index) {
  event.stopPropagation();
  closeSlotOptions(index);
  const modal = document.getElementById(`urlInputModal-${index}`);
  modal.classList.remove('hidden');
  document.getElementById(`urlInput-${index}`).focus();
}

function showUrlInputFromOptions(event, index) {
  event.stopPropagation();
  closeSlotOptions(index);
  const modal = document.getElementById(`urlInputModal-${index}`);
  modal.classList.remove('hidden');
  document.getElementById(`urlInput-${index}`).focus();
}

function closeUrlInput(index) {
  const modal = document.getElementById(`urlInputModal-${index}`);
  modal.classList.add('hidden');
  document.getElementById(`urlInput-${index}`).value = '';
}

async function loadImageFromUrl(index) {
  const urlInput = document.getElementById(`urlInput-${index}`);
  const imageUrl = urlInput.value.trim();
  
  if (!imageUrl) {
    showToast("Masukkan URL gambar yang valid!", "fa-triangle-exclamation");
    return;
  }
  
  try {
    // Validate URL format
    new URL(imageUrl);
  } catch (e) {
    showToast("Format URL tidak valid!", "fa-triangle-exclamation");
    return;
  }
  
  // Store URL directly (no conversion needed)
  uploadedImages[index] = { type: 'url', value: imageUrl };
  renderUploadGrid();
  closeUrlInput(index);
  showToast(`Produk ${index + 1} berhasil dimuat dari URL`);
}

async function generateAllMockups() {
  console.log('Generate button clicked');
  
  // Check if API key is configured
  if (!isApiKeyConfigured()) {
    showToast("API Key belum dikonfigurasi. Periksa environment variable di Vercel.", "fa-circle-exclamation");
    return;
  }
  
  const activeImages = uploadedImages.filter(x => x !== null);
  console.log('Active images:', activeImages.length);
  
  if (activeImages.length === 0) {
    showToast("Silakan unggah minimal 1 gambar produk!", "fa-circle-exclamation");
    return;
  }

  const gender = document.querySelector('input[name="gender"]:checked').value;
  const studioStyle = document.getElementById('studioStyle').value;
  console.log('Gender:', gender, 'Style:', studioStyle);

  // Loading UI State
  setLoadingState(true);

  try {
    // Run generation tasks (Only Try-On and Caption)
    const [tryOnImg, captionText] = await Promise.all([
      generateImageAi(activeImages, gender, studioStyle),
      generateCaptionAi(activeImages, gender, studioStyle)
    ]);

    console.log('Generation complete:', { tryOnImg: !!tryOnImg, captionText: !!captionText });

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

async function generateImageAi(images, gender, style) {
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
  images.slice(0, 3).forEach(img => {
    if (img.type === 'base64') {
      // For base64 (file upload), use inlineData
      const mimeType = img.value.substring(img.value.indexOf(":") + 1, img.value.indexOf(";"));
      const base64Data = img.value.split(",")[1];
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/png",
          data: base64Data
        }
      });
    } else if (img.type === 'url') {
      // For URL, use fileData with uri
      parts.push({
        fileData: {
          uri: img.value
        }
      });
    }
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

async function generateCaptionAi(images, gender, style) {
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
  images.slice(0, 3).forEach(img => {
    if (img.type === 'base64') {
      // For base64 (file upload), use inlineData
      const mimeType = img.value.substring(img.value.indexOf(":") + 1, img.value.indexOf(";"));
      const base64Data = img.value.split(",")[1];
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/png",
          data: base64Data
        }
      });
    } else if (img.type === 'url') {
      // For URL, use fileData with uri
      parts.push({
        fileData: {
          uri: img.value
        }
      });
    }
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