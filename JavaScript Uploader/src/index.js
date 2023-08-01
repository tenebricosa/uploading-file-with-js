const form = document.querySelector('form');
const uploaderInput = document.querySelector('input');
const submitButton = document.querySelector('button');
const statusMessage = document.getElementById('statusMessage');
const fileListMetadata = document.getElementById('fileListMetadata');
const fileNum = document.getElementById('fileNum');
const dropArea = document.getElementById('dropArea');

form.addEventListener('submit', handleSubmit);

uploaderInput.addEventListener('change', handleInputChange);

dropArea.addEventListener('drop', handleDrop);

let dragEventCounter = 0;

dropArea.addEventListener('dragenter', e => {
  e.preventDefault();

  if (dragEventCounter === 0) {
    dropArea.classList.add('highlight');
  }

  dragEventCounter += 1;
});

dropArea.addEventListener('dragover', e => {
  e.preventDefault();

  // in case of non triggered dragenter!
  if (dragEventCounter === 0) {
    dragEventCounter = 1;
  }
});

dropArea.addEventListener('dragleave', e => {
  e.preventDefault();

  dragEventCounter -= 1;

  if (dragEventCounter <= 0) {
    dragEventCounter = 0;
    dropArea.classList.remove('highlight');
  }
});

dropArea.addEventListener('drop', e => {
  e.preventDefault();

  dragEventCounter = 0;
  dropArea.classList.remove('highlight');
});

function handleSubmit(event) {
  event.preventDefault();

  showPendingState();

  uploadFiles(uploaderInput.files);

  // TODO: reset uploader input to prevent previously picked files freeze
}

function handleDrop(event) {
  const fileList = event.dataTransfer.files;

  resetForm();

  try {
    assertFilesValid(fileList);
  } catch (err) {
    statusMessage.textContent = err.message;
    return;
  }

  showPendingState();
  // TODO: reset uploader input to prevent previously picked files freeze

  uploadFiles(fileList);
}

function uploadFiles(selectedFiles) {
  const url = 'https://httpbin.org/post';
  const formMethod = 'post';
  const progressBar = document.querySelector('progress');
  const xhr = new XMLHttpRequest();

  xhr.addEventListener('progress', event => {
    statusMessage.textContent = `⏳ Uploaded ${event.loaded} bytes of ${event.total}`;

    const percent = (event.loaded / event.total) * 100;
    // TODO: check it's working properly
    progressBar.value = Math.round(percent);
  });

  xhr.addEventListener('loadend', () => {
    if (xhr.status === 200) {
      statusMessage.textContent = '✅ Success';

      renderFilesMetadata(selectedFiles);
    } else {
      statusMessage.textContent = '❌ Error';
    }
    progressBar.value = 0;
  });

  xhr.open(formMethod, url);
  xhr.send(selectedFiles);
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
          <span><strong>Name:</strong> ${name}</span>
          <span><strong>Type:</strong> ${type}</span>
          <span><strong>Size:</strong> ${size} bytes</span>
        </li>`
    );
  }
}

function handleInputChange(event) {
  resetForm();

  try {
    assertFilesValid(event.target.files);
  } catch (err) {
    statusMessage.textContent = err.message;
    return;
  }

  submitButton.disabled = false;
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

function showPendingState() {
  submitButton.disabled = true;

  // TODO: do we need these two here?
  fileListMetadata.textContent = '';
  fileNum.textContent = '0';
  statusMessage.textContent = '⏳ Pending...';
}

// TODO: replace 'file' with file input
// TODO: maybe rename using 'State' at the end to match with showPendingState?
function resetForm(file) {
  fileListMetadata.textContent = '';
  fileNum.textContent = '0';
  statusMessage.textContent = `🤷‍♂ Nothing's uploaded`;

  file = null;
  submitButton.disabled = true;
}
