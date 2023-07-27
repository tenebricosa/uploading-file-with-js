const form = document.querySelector("form");
const uploaderInput = document.querySelector("input");
const submitButton = document.querySelector("button");
const statusMessage = document.getElementById("statusMessage");
const fileListMetadata = document.getElementById("fileListMetadata");
const fileNum = document.getElementById("fileNum");
const dropArea = document.getElementById("dropArea");

form.addEventListener("submit", handleSubmit);

uploaderInput.addEventListener("change", validateFileOnChange);

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

    fileListMetadata.textContent = "";
    fileNum.textContent = "0";
    statusMessage.textContent = "⏳ Pending...";

    const form = event.currentTarget;
    const url = new URL(form.action);
    const formMethod = form.method;
    const formData = new FormData(form);
    const progressBar = document.querySelector("progress");

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function (event) {
        statusMessage.textContent = `⏳ Uploaded ${event.loaded} bytes of ${event.total}`;

        const percent = (event.loaded / event.total) * 100;
        progressBar.value = Math.round(percent);
    };

    xhr.onloadend = function () {
        if (xhr.status === 200) {
            statusMessage.textContent = "✅ Success";
            progressBar.value = 0;

            getFilesMetadata(uploaderInput.files);
        } else {
            statusMessage.textContent = "❌ Error";
            progressBar.value = 0;
        }
    };

    xhr.open(formMethod, url);
    xhr.send(formData);
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    fileListMetadata.textContent = "";
    fileNum.textContent = "0";
    statusMessage.textContent = "⏳ Pending...";

    const fileList = event.dataTransfer.files;
    const form = event.currentTarget.getElementsByTagName("form")[0];
    const url = new URL(form.action);
    const formMethod = form.method;
    const progressBar = document.querySelector("progress");

    if (validateFileOnDrop(fileList)) {
        const xhr = new XMLHttpRequest();
        const formData = new FormData()

        xhr.upload.onprogress = function (event) {
            statusMessage.textContent = `⏳ Uploaded ${event.loaded} bytes of ${event.total}`;

            const percent = (event.loaded / event.total) * 100;
            progressBar.value = Math.round(percent);
        };

        for (const file of fileList) {
            formData.append('file', file)
        };

        xhr.onloadend = function () {
            if (xhr.status === 200) {
                statusMessage.textContent = "✅ Success";
                progressBar.value = 0;

                getFilesMetadata(fileList);
            } else {
                statusMessage.textContent = "❌ Error";
                progressBar.value = 0;
            }
        };

        xhr.open(formMethod, url);
        xhr.send(formData);
    }
}

function getFilesMetadata(fileList) {
    fileNum.textContent = fileList.length;

    fileListMetadata.textContent = "";

    for (const file of fileList) {
        const name = file.name;
        const type = file.type;
        const size = file.size;

        renderFileMetadata(name, type, size);
    }

    function renderFileMetadata(name, type, size) {
        return fileListMetadata.insertAdjacentHTML(
            "beforeend",
            `
            <li>
                <span>
                    <label for="fileName">Name: </label>
                    <output id="fileName">${name}</output>
                </span>
                <span>
                <label for="fileType">Type: </label>
                  <output id="fileType">${type}</output>
                  <br />
                  <label for="fileSize">Size: </label>
                  <output id="fileSize">${size} bytes</output>
                </span>
            </li>`
        );
    }
}

function validateFileOnChange(event) {
    const allowedExtensions = ['webp', 'jpeg', 'png'];
    const sizeLimit = 1_000_000; // 1 megabyte

    submitButton.disabled = true;

    for (const file of event.target.files) {
        const {name: fileName, size: fileSize} = file;

        const fileExtension = fileName.split(".").pop();

        if (!allowedExtensions.includes(fileExtension)) {
            statusMessage.textContent = `❌ File "${fileName}" type is not allowed`;
            fileListMetadata.textContent = "";
            fileNum.textContent = "0";

            event.target.value = null;
            submitButton.disabled = true;

            return false;
        } else if (fileSize > sizeLimit) {
            statusMessage.textContent = `❌ File "${fileName}" is too large`;
            fileListMetadata.textContent = "";
            fileNum.textContent = "0";

            event.target.value = null;
            submitButton.disabled = true;

            return false;
        } else {
            submitButton.disabled = false;
        }
    }
}

function validateFileOnDrop(fileList) {
    const allowedExtensions = ['webp', 'jpeg', 'png'];
    const sizeLimit = 1_000_000; // 1 megabyte

    for (let file of fileList) {
        const {name: fileName, size: fileSize} = file;

        const fileExtension = fileName.split(".").pop();

        if (!allowedExtensions.includes(fileExtension)) {
            statusMessage.textContent = `❌ File "${fileName}" type is not allowed`;
            fileListMetadata.textContent = "";
            fileNum.textContent = "0";

            file = null;

            return false;
        } else if (fileSize > sizeLimit) {
            statusMessage.textContent = `❌ File "${fileName}" is too large`;
            fileListMetadata.textContent = "";
            fileNum.textContent = "0";

            file = null;

            return false;
        }
    }

    return true;
}
