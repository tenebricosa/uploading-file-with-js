const form = document.querySelector("form");
const uploaderInput = document.querySelector("input");
const submitButton = document.querySelector("button");
form.addEventListener("submit", handleSubmit);

const dropArea = document.getElementById("dropArea");

const status = document.getElementById("statusMessage");
const fileListMetadata = document.getElementById("fileListMetadata");
const fileNum = document.getElementById("fileNum");

uploaderInput.addEventListener("change", validateFileSizeOnSubmit);

["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});

function highlight(event) {
  event.preventDefault();
  event.stopPropagation();

  dropArea.classList.add("highlight");
}

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function unhighlight(event) {
  event.preventDefault();
  event.stopPropagation();

  dropArea.classList.remove("highlight");
}

dropArea.addEventListener("drop", handleDrop, false);

function handleSubmit(event) {
  event.preventDefault();
  submitButton.disabled = true;

  // status.textContent = "⏳ Pending...";

  const form = event.currentTarget;
  const url = new URL(form.action);
  const formMethod = form.method;
  const formData = new FormData(form);
  const progressBar = document.getElementById("progressBar");

  let xhr = new XMLHttpRequest();

  xhr.upload.onprogress = function (event) {
    status.textContent = `Uploaded ${event.loaded} bytes of ${event.total}`;

    let percent = (event.loaded / event.total) * 100;
    progressBar.value = Math.round(percent);
  };

  xhr.onloadend = function () {
    if (xhr.status === 200) {
      status.textContent = "✅ Success";
      progressBar.value = 0;
      submitButton.disabled = false;

      getFilesMetadata(uploaderInput.files);
    } else {
      status.textContent = "❌ Error";
      progressBar.value = 0;
      submitButton.disabled = false;
    }
  };

  xhr.open(formMethod, url);
  xhr.send(formData);
}

function handleDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  submitButton.disabled = true;

  // status.textContent = "⏳ Pending...";

  const fileList = event.dataTransfer.files;
  const form = event.currentTarget.getElementsByTagName("form")[0];
  const url = new URL(form.action);
  const formMethod = form.method;
  const progressBar = document.getElementById("progressBar");

  if (validateFileSizeOnDrop(fileList)) {
    let xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function (event) {
      status.textContent = `Uploaded ${event.loaded} bytes of ${event.total}`;

      let percent = (event.loaded / event.total) * 100;
      progressBar.value = Math.round(percent);
    };

    xhr.onloadend = function () {
      if (xhr.status === 200) {
        status.textContent = "✅ Success";
        progressBar.value = 0;
        submitButton.disabled = false;

        getFilesMetadata(fileList);
      } else {
        status.textContent = "❌ Error";
        progressBar.value = 0;
        submitButton.disabled = false;
      }
    };

    xhr.open(formMethod, url);
    xhr.send(event.dataTransfer.files);
  }
}

function getFilesMetadata(fileList) {
  fileNum.textContent = fileList.length;

  fileListMetadata.textContent = "";

  function renderFileMetadata(name, type, size) {
    return fileListMetadata.insertAdjacentHTML(
        "beforeend",
        `<li>
      <label for="fileName">Name: </label>
      <output id="fileName">${name}</output>
      <label for="fileType">Type: </label>
      <output id="fileType">${type}</output>
      <label for="fileSize">Size: </label>
      <output id="fileSize">${size} bytes</output>
    </li>`
    );
  }

  for (const file of fileList) {
    const name = file.name;
    const type = file.type;
    const size = file.size;

    renderFileMetadata(name, type, size);
  }
}

function validateFileSizeOnSubmit() {
  const sizeLimit = 1_000_000; // 1 megabyte
  submitButton.disabled = true;

  for (const file of this.files) {
    const { name: fileName, size: fileSize } = file;

    if (fileSize > sizeLimit) {
      status.textContent = `❌ File "${fileName}" is too large`;
      fileListMetadata.textContent = "";
      fileNum.textContent = "0";

      this.value = null;
      submitButton.disabled = false;

      return false;
    }

    submitButton.disabled = false;
  }
}

function validateFileSizeOnDrop(fileList) {
  const sizeLimit = 1_000_000; // 1 megabyte

  for (let file of fileList) {
    const { name: fileName, size: fileSize } = file;

    if (fileSize > sizeLimit) {
      status.textContent = `❌ File "${fileName}" is too large`;
      fileListMetadata.textContent = "";
      fileNum.textContent = "0";

      file = null;
      submitButton.disabled = false;

      return false;
    }

    submitButton.disabled = false;
    return true;
  }
}
