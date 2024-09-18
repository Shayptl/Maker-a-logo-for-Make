        const imageInput = document.getElementById('imageInput');
        const colorInput = document.getElementById('colorInput');
        const processButton = document.getElementById('processButton');
        const preview = document.getElementById('preview');
        const previewWithBackground = document.getElementById('previewWithBackground');
        const downloadLink = document.getElementById('downloadLink');
        const errorMessage = document.getElementById('errorMessage');

        processButton.addEventListener('click', processLogo);

        function processLogo() {
            const file = imageInput.files[0];
            if (!file) {
                showError('אנא בחר קובץ תמונה לפני העיבוד');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    let canvas = document.createElement('canvas');
                    canvas.width = 512;
                    canvas.height = 512;
                    let ctx = canvas.getContext('2d');
                    
                    // מרכז את התמונה
                    let scale = Math.min(512 / img.width, 512 / img.height);
                    let width = Math.round(img.width * scale);
                    let height = Math.round(img.height * scale);
                    let x = (512 - width) / 2;
                    let y = (512 - height) / 2;
                    
                    ctx.drawImage(img, x, y, width, height);

                    // מעבד את התמונה
                    processImage(canvas);

                    // בודק את גודל הקובץ ומפחית איכות אם נדרש
                    let quality = 1.0;
                    let imageData;
                    do {
                        imageData = canvas.toDataURL('image/png', quality);
                        quality -= 0.1;
                    } while (imageData.length > 512 * 1024 && quality > 0.1);

                    if (imageData.length > 512 * 1024) {
                        showError('לא ניתן להקטין את התמונה מספיק. אנא נסה תמונה קטנה יותר.');
                        return;
                    }

                    // מציג את התמונה המעובדת
                    displayProcessedImage(imageData);
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }

        function processImage(canvas) {
            let ctx = canvas.getContext('2d');
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;

            // מגדיר את הצבע הירוק של הלוגו (ייתכן שתצטרך להתאים ערכים אלה)
            const logoGreen = {r: 0, g: 163, b: 80};
            const threshold = 30; // סף התאמת צבע

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];

                // בודק אם צבע הפיקסל קרוב לירוק של הלוגו
                if (Math.abs(r - logoGreen.r) < threshold &&
                    Math.abs(g - logoGreen.g) < threshold &&
                    Math.abs(b - logoGreen.b) < threshold) {
                    // מגדיר ללבן
                    data[i] = data[i + 1] = data[i + 2] = 255;
                } else {
                    // מגדיר לשקוף
                    data[i] = data[i + 1] = data[i + 2] = 0;
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        function displayProcessedImage(imageData) {
            // מציג תמונה מעובדת
            preview.width = 512;
            preview.height = 512;
            let previewCtx = preview.getContext('2d');
            let processedImg = new Image();
            processedImg.onload = function() {
                previewCtx.drawImage(processedImg, 0, 0);
                
                // מציג תמונה מעובדת עם רקע
                previewWithBackground.width = 512;
                previewWithBackground.height = 512;
                let previewBgCtx = previewWithBackground.getContext('2d');
                previewBgCtx.fillStyle = colorInput.value;
                previewBgCtx.fillRect(0, 0, 512, 512);
                previewBgCtx.drawImage(processedImg, 0, 0);

                downloadLink.href = imageData;
                downloadLink.style.display = 'inline-block';
            };
            processedImg.src = imageData;
        }

        function showError(message) {
            errorMessage.textContent = message;
        }
