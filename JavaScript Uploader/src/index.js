const form = document.querySelector('form');
const fileInput = document.querySelector('input');
const submitButton = document.querySelector('button');
const statusMessage = document.getElementById('statusMessage');
const fileListMetadata = document.getElementById('fileListMetadata');
const fileNum = document.getElementById('fileNum');
const progressBar = document.querySelector('progress');
const dropArea = document.getElementById('dropArea');

form.addEventListener('submit', handleSubmit);
fileInput.addEventListener('change', handleInputChange);
dropArea.addEventListener('drop', handleDrop);

initDropAreaHighlightOnDrag();

function handleSubmit(event) {
  event.preventDefault();

  showPendingState();

  uploadFiles(fileInput.files);
}

function handleDrop(event) {
  const fileList = event.dataTransfer.files;

  resetFormState();

  try {
    assertFilesValid(fileList);
  } catch (err) {
    updateStatusMessage(err.message);
    return;
  }

  showPendingState();

  uploadFiles(fileList);
}

function handleInputChange(event) {
  resetFormState();

  try {
    assertFilesValid(event.target.files);
  } catch (err) {
    updateStatusMessage(err.message);
    return;
  }

  submitButton.disabled = false;
}

function uploadFiles(files) {
  const url = 'https://httpbin.org/post';
  const method = 'post';

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', event => {
    updateStatusMessage(`⏳ Uploaded ${event.loaded} bytes of ${event.total}`);
    updateProgressBar(event.loaded / event.total);
  });

  xhr.addEventListener('loadend', () => {
    if (xhr.status === 200) {
      updateStatusMessage('✅ Success');
      renderFilesMetadata(files);
    } else {
      updateStatusMessage('❌ Error');
    }

    updateProgressBar(0);
  });

  const data = new FormData();

  for (const file of files) {
    data.append('files[]', file);
  }

  xhr.open(method, url);
  xhr.send(data);
}

function renderFilesMetadata(fileList) {
  fileNum.textContent = fileList.length;

  fileListMetadata.textContent = '';

  for (const file of fileList) {
    const name = file.name;
    const type = file.type;
    const size = file.size;

    fileListMetadata.insertAdjacentHTML(
      'beforeend',
      `
        <li>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Size:</strong> ${size} bytes</p>
        </li>`
    );
  }
}

function assertFilesValid(fileList) {
  const allowedTypes = ['image/webp', 'image/jpeg', 'image/png'];
  const sizeLimit = 1024 * 1024; // 1 megabyte

  for (const file of fileList) {
    const { name: fileName, size: fileSize } = file;

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`❌ File "${fileName}" could not be uploaded. Only images with the following extensions are allowed: .webp, .jpeg, .jpg, .png.`);
    } else if (fileSize > sizeLimit) {
      throw new Error(`❌ File "${fileName}" could not be uploaded. Only images up to 1 MB are allowed.`);
    }
  }
}

function updateStatusMessage(text) {
  statusMessage.textContent = text;
}

function updateProgressBar(value) {
  const percent = value * 100;
  progressBar.value = Math.round(percent);
}

function showPendingState() {
  submitButton.disabled = true;
  updateStatusMessage('⏳ Pending...')
}

function resetFormState() {
  fileListMetadata.textContent = '';
  fileNum.textContent = '0';

  submitButton.disabled = true;
  updateStatusMessage(`🤷‍♂ Nothing's uploaded`)
}

function initDropAreaHighlightOnDrag() {
  let dragEventCounter = 0;

  dropArea.addEventListener('dragenter', event => {
    event.preventDefault();

    if (dragEventCounter === 0) {
      dropArea.classList.add('highlight');
    }

    dragEventCounter += 1;
  });

  dropArea.addEventListener('dragover', event => {
    event.preventDefault();

    // in case of non triggered dragenter!
    if (dragEventCounter === 0) {
      dragEventCounter = 1;
    }
  });

  dropArea.addEventListener('dragleave', event => {
    event.preventDefault();

    dragEventCounter -= 1;

    if (dragEventCounter <= 0) {
      dragEventCounter = 0;
      dropArea.classList.remove('highlight');
    }
  });

  dropArea.addEventListener('drop', event => {
    event.preventDefault();

    dragEventCounter = 0;
    dropArea.classList.remove('highlight');
  });
}
