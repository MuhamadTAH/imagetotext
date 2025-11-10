const imageInput = document.getElementById('imageInput');
const fileName = document.getElementById('fileName');
const imagePreview = document.getElementById('imagePreview');
const convertBtn = document.getElementById('convertBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const result = document.getElementById('result');
const outputText = document.getElementById('outputText');
const copyBtn = document.getElementById('copyBtn');

let selectedImage = null;

// Handle image selection
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedImage = file;
        fileName.textContent = file.name;

        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);

        // Enable convert button
        convertBtn.disabled = false;
        result.style.display = 'none';
    }
});

// Handle convert button click
convertBtn.addEventListener('click', async () => {
    if (!selectedImage) return;

    // Reset and show progress bar
    progressBar.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Initializing...';
    convertBtn.disabled = true;
    result.style.display = 'none';
    outputText.value = '';

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;

            // Perform OCR
            const worker = await Tesseract.createWorker('eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        progressFill.style.width = progress + '%';
                        progressText.textContent = `Processing: ${progress}%`;
                    } else {
                        progressText.textContent = m.status;
                    }
                }
            });

            const { data: { text } } = await worker.recognize(imageData);
            await worker.terminate();

            // Show result
            progressBar.style.display = 'none';
            outputText.value = text || 'No text found in the image.';
            result.style.display = 'block';
            convertBtn.disabled = false;
        };

        reader.readAsDataURL(selectedImage);
    } catch (error) {
        console.error('Error:', error);
        progressBar.style.display = 'none';
        alert('An error occurred while processing the image. Please try again.');
        convertBtn.disabled = false;
    }
});

// Handle copy button
copyBtn.addEventListener('click', () => {
    outputText.select();
    document.execCommand('copy');

    // Show feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});
